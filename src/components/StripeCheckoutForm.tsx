import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  Elements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, CreditCard, Lock } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  customerInfo: {
    name: string;
    email: string;
  };
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  customerInfo
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingDetails(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateBillingDetails = () => {
    const newErrors: Record<string, string> = {};
    
    if (!billingDetails.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!billingDetails.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!billingDetails.state.trim()) {
      newErrors.state = "State is required";
    }
    
    if (!billingDetails.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!validateBillingDetails()) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: {
              line1: billingDetails.address,
              city: billingDetails.city,
              state: billingDetails.state,
              postal_code: billingDetails.zipCode,
              country: billingDetails.country,
            },
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      onError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2 flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
          Card Information
        </h3>
        
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Billing Address</h3>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">Street Address</label>
          <Input
            id="address"
            name="address"
            value={billingDetails.address}
            onChange={handleInputChange}
            placeholder="123 Main St"
            className={`w-full ${errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.address}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
            <Input
              id="city"
              name="city"
              value={billingDetails.city}
              onChange={handleInputChange}
              placeholder="New York"
              className={`w-full ${errors.city ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.city}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
            <Input
              id="state"
              name="state"
              value={billingDetails.state}
              onChange={handleInputChange}
              placeholder="NY"
              className={`w-full ${errors.state ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.state}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-1">Zip Code</label>
          <Input
            id="zipCode"
            name="zipCode"
            value={billingDetails.zipCode}
            onChange={handleInputChange}
            placeholder="10001"
            className={`w-full ${errors.zipCode ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.zipCode}
            </p>
          )}
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Lock className="h-4 w-4 mr-2" />
            Pay ${(amount / 100).toFixed(2)}
          </span>
        )}
      </Button>
      
      <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
        <Lock className="h-3 w-3 mr-1" />
        Secured by Stripe
      </div>
    </form>
  );
};

interface StripeCheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  customerInfo: {
    name: string;
    email: string;
  };
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckoutForm;
