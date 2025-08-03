import { loadStripe, Stripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Check if using test mode
const isTestMode = stripePublishableKey?.startsWith('pk_test_') || 
                   stripePublishableKey === 'your-stripe-publishable-key' || 
                   !stripePublishableKey

// Log environment for clarity
console.log(`Stripe running in ${isTestMode ? 'TEST' : 'LIVE'} mode`)

// If no key is provided, use a sandbox test key
const key = stripePublishableKey && stripePublishableKey !== 'your-stripe-publishable-key' 
  ? stripePublishableKey 
  // Fallback to Stripe test mode publishable key (this is a test key, safe to expose)
  : 'pk_test_TYooMQauvdEDq54NiTphI7jx'

// Initialize Stripe with the appropriate key
export const stripePromise = loadStripe(key)

// Payment Intent creation helper
export async function createPaymentIntent(
  amount: number, 
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<{ clientSecret: string; paymentIntentId?: string } | { error: string }> {
  try {
    // For demo purposes, create a mock payment intent
    // In production, this would call your backend API
    const stripeAmount = formatAmountForStripe(amount, currency)
    
    // Generate a mock client secret for demo
    const mockClientSecret = `pi_mock_${Math.random().toString(36).substring(2)}_secret_${Math.random().toString(36).substring(2)}`
    
    console.log('Creating mock payment intent for demo:', {
      amount: stripeAmount,
      currency,
      metadata
    })
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      clientSecret: mockClientSecret,
      paymentIntentId: `pi_mock_${Math.random().toString(36).substring(2)}`
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create payment intent' }
  }
}

// Payment Types
export interface PaymentMethodData {
  type: string
  card?: {
    number: string
    exp_month: number
    exp_year: number
    cvc: string
  }
  billing_details?: {
    name: string
    email: string
    address?: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
}

// Utility functions for payment processing
export function formatAmountForDisplay(amount: number, currency: string = 'usd'): string {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  })
  return numberFormat.format(amount / 100)
}

export function formatAmountForStripe(amount: number, currency: string = 'usd'): number {
  const currencyToMinorUnits: Record<string, number> = {
    usd: 100, // 1 dollar = 100 cents
    eur: 100, // 1 euro = 100 cents
    gbp: 100, // 1 pound = 100 pennies
  }
  
  const minorUnits = currencyToMinorUnits[currency.toLowerCase()] || 100
  return Math.round(amount * minorUnits)
}
