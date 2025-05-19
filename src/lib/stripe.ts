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
export async function createPaymentIntent(amount: number, currency: string = 'usd'): Promise<{ clientSecret: string } | { error: string }> {
  try {
    // In a real app, this would call your backend to create a payment intent
    // For now, we'll simulate the response since we don't have a backend set up
    if (isTestMode) {
      // Simulate successful creation in test mode
      const mockClientSecret = `pi_${Math.random().toString(36).substring(2)}_secret_${Math.random().toString(36).substring(2)}`
      return { clientSecret: mockClientSecret }
    } else {
      // In production, this would actually call your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      })
      
      return await response.json()
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return { error: 'Failed to create payment intent' }
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
