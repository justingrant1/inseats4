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

    // Parse request body
    const { eventId, tierId } = await req.json()

    if (!eventId || !tierId) {
      return new Response(
        JSON.stringify({ error: 'Event ID and Tier ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Convert tier ID back to tier name (reverse the transformation from get-event-tiers)
    const tierName = tierId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())

    // Query tickets for the specific tier
    const { data: tickets, error } = await supabaseClient
      .from('tickets')
      .select('id, section, row, seat, price, quantity')
      .eq('event_id', eventId)
      .eq('tier_name', tierName)
      .eq('status', 'available')
      .order('section')
      .order('row')
      .order('seat')

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tier seats' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check for active reservations that might affect availability
    const { data: reservations, error: reservationError } = await supabaseClient
      .from('reservations')
      .select('ticket_id, quantity')
      .in('ticket_id', tickets?.map(t => t.id) || [])
      .gt('expires_at', new Date().toISOString())

    if (reservationError) {
      console.error('Reservation error:', reservationError)
      // Continue without reservation data rather than failing
    }

    // Create a map of reserved quantities by ticket ID
    const reservedQuantities = new Map()
    reservations?.forEach(reservation => {
      const current = reservedQuantities.get(reservation.ticket_id) || 0
      reservedQuantities.set(reservation.ticket_id, current + reservation.quantity)
    })

    // Group seats by section and calculate available quantities
    const sectionMap = new Map()
    
    tickets?.forEach(ticket => {
      const section = ticket.section || 'General Admission'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, {
          id: section.toLowerCase().replace(/\s+/g, '-'),
          name: section,
          seats: []
        })
      }
      
      const reservedQty = reservedQuantities.get(ticket.id) || 0
      const availableQty = Math.max(0, ticket.quantity - reservedQty)
      
      if (availableQty > 0) {
        sectionMap.get(section).seats.push({
          id: ticket.id,
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price,
          quantity: ticket.quantity,
          availableQuantity: availableQty,
          isReserved: reservedQty > 0,
          coordinates: generateSeatCoordinates(ticket.row, ticket.seat)
        })
      }
    })

    const sections = Array.from(sectionMap.values())

    return new Response(
      JSON.stringify({ sections }),
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

// Helper function to generate seat coordinates for visualization
function generateSeatCoordinates(row: string | null, seat: string | null): { x: number, y: number } {
  // Simple coordinate generation - in a real app, you'd have actual venue layouts
  let x = 0
  let y = 0
  
  if (row && seat) {
    // Convert row to number (A=1, B=2, etc.)
    const rowNum = row.charCodeAt(0) - 64
    const seatNum = parseInt(seat) || 1
    
    x = seatNum * 30 // 30px spacing between seats
    y = rowNum * 40 // 40px spacing between rows
  }
  
  return { x, y }
}
