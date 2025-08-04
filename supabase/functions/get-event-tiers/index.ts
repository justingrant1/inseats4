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

    // Extract event ID from URL path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const eventId = pathParts[pathParts.length - 2] // Assuming URL like /functions/v1/get-event-tiers/{eventId}

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: 'Event ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Query tickets table to get unique tiers for the event
    const { data: tickets, error } = await supabaseClient
      .from('tickets')
      .select('tier_name, price, section')
      .eq('event_id', eventId)
      .eq('status', 'available')

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch event tiers' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Group tickets by tier and calculate statistics
    const tierMap = new Map()
    
    tickets?.forEach(ticket => {
      const tierName = ticket.tier_name
      if (!tierMap.has(tierName)) {
        tierMap.set(tierName, {
          id: tierName.toLowerCase().replace(/\s+/g, '-'),
          name: tierName,
          minPrice: ticket.price,
          maxPrice: ticket.price,
          availableSeats: 0,
          sections: new Set()
        })
      }
      
      const tier = tierMap.get(tierName)
      tier.minPrice = Math.min(tier.minPrice, ticket.price)
      tier.maxPrice = Math.max(tier.maxPrice, ticket.price)
      tier.availableSeats += 1
      if (ticket.section) {
        tier.sections.add(ticket.section)
      }
    })

    // Convert to array and format response
    const tiers = Array.from(tierMap.values()).map(tier => ({
      ...tier,
      sections: Array.from(tier.sections),
      description: `${tier.name} seating with prices from $${tier.minPrice} to $${tier.maxPrice}`,
      color: getTierColor(tier.name)
    }))

    return new Response(
      JSON.stringify({ tiers }),
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

// Helper function to assign colors to tiers
function getTierColor(tierName: string): string {
  const colors = {
    'premium': '#8B5CF6',
    'vip': '#F59E0B',
    'standard': '#3B82F6',
    'general': '#10B981',
    'upper': '#6B7280',
    'lower': '#EF4444'
  }
  
  const lowerTierName = tierName.toLowerCase()
  for (const [key, color] of Object.entries(colors)) {
    if (lowerTierName.includes(key)) {
      return color
    }
  }
  
  return '#6B7280' // Default gray
}
