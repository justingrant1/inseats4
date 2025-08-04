import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from auth header
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { seatSelections } = await req.json()

    if (!seatSelections || !Array.isArray(seatSelections) || seatSelections.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Seat selections are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate seat selections format
    for (const selection of seatSelections) {
      if (!selection.ticketId || !selection.quantity || selection.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid seat selection format' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Set reservation expiry time (15 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Start a transaction-like operation
    const reservations = []
    const errors = []

    for (const selection of seatSelections) {
      try {
        // Check current availability
        const { data: ticket, error: ticketError } = await supabaseClient
          .from('tickets')
          .select('id, quantity, status')
          .eq('id', selection.ticketId)
          .eq('status', 'available')
          .single()

        if (ticketError || !ticket) {
          errors.push(`Ticket ${selection.ticketId} not found or unavailable`)
          continue
        }

        // Check existing reservations for this ticket
        const { data: existingReservations, error: reservationError } = await supabaseClient
          .from('reservations')
          .select('quantity')
          .eq('ticket_id', selection.ticketId)
          .gt('expires_at', new Date().toISOString())

        if (reservationError) {
          errors.push(`Error checking reservations for ticket ${selection.ticketId}`)
          continue
        }

        // Calculate available quantity
        const reservedQuantity = existingReservations?.reduce((sum, res) => sum + res.quantity, 0) || 0
        const availableQuantity = ticket.quantity - reservedQuantity

        if (selection.quantity > availableQuantity) {
          errors.push(`Not enough seats available for ticket ${selection.ticketId}. Requested: ${selection.quantity}, Available: ${availableQuantity}`)
          continue
        }

        // Create reservation
        const { data: reservation, error: createError } = await supabaseClient
          .from('reservations')
          .insert({
            ticket_id: selection.ticketId,
            quantity: selection.quantity,
            user_id: user.id,
            expires_at: expiresAt.toISOString()
          })
          .select()
          .single()

        if (createError) {
          errors.push(`Failed to create reservation for ticket ${selection.ticketId}: ${createError.message}`)
          continue
        }

        reservations.push(reservation)

      } catch (error) {
        errors.push(`Unexpected error processing ticket ${selection.ticketId}: ${error.message}`)
      }
    }

    // If there were any errors, we should clean up successful reservations
    if (errors.length > 0 && reservations.length > 0) {
      // Clean up any successful reservations since the operation partially failed
      const reservationIds = reservations.map(r => r.id)
      await supabaseClient
        .from('reservations')
        .delete()
        .in('id', reservationIds)

      return new Response(
        JSON.stringify({ 
          error: 'Reservation failed', 
          details: errors,
          message: 'Some seats could not be reserved. Please try again.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Reservation failed', 
          details: errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true,
        reservations: reservations.map(r => ({
          id: r.id,
          ticketId: r.ticket_id,
          quantity: r.quantity,
          expiresAt: r.expires_at
        })),
        expiresAt: expiresAt.toISOString(),
        message: `Successfully reserved ${reservations.length} seat selection(s). Reservation expires in 15 minutes.`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
