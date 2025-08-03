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
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    
    console.log('Stripe secret key exists:', !!stripeSecretKey)
    
    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured')
      throw new Error('Stripe secret key not configured')
    }

    // Parse request body
    const requestBody = await req.json()
    console.log('Request body received:', JSON.stringify(requestBody, null, 2))
    
    const { amount, currency = 'usd', metadata = {} } = requestBody

    console.log('Parsed values:', { 
      amount, 
      amountType: typeof amount,
      currency, 
      metadata: JSON.stringify(metadata, null, 2)
    })

    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount, 'Type:', typeof amount)
      throw new Error(`Invalid amount: ${amount} (type: ${typeof amount})`)
    }

    // The amount is already in cents from the frontend formatAmountForStripe function
    // Just ensure it's an integer
    const stripeAmount = Math.round(Number(amount))
    console.log('Final Stripe amount (in cents):', stripeAmount)

    // Create payment intent with Stripe API
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: stripeAmount.toString(),
        currency: currency,
        'automatic_payment_methods[enabled]': 'true',
        ...Object.entries(metadata).reduce((acc, [key, value]) => {
          acc[`metadata[${key}]`] = value as string
          return acc
        }, {} as Record<string, string>)
      }),
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text()
      console.error('Stripe API error:', error)
      throw new Error('Failed to create payment intent')
    }

    const paymentIntent = await stripeResponse.json()

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
