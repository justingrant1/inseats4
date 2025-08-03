import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Clock, Shield, Check, ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";
import StripeCheckoutForm from "@/components/StripeCheckoutForm";
import { createPaymentIntent } from "@/lib/stripe";

// Type definitions
interface CheckoutState {
  eventId: string;
  eventTitle: string;
  tierName: string;
  tierPrice: number;
  quantity: number;
  totalPrice: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutData, setCheckoutData] = useState<CheckoutState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [step, setStep] = useState(1); // 1 = customer info, 2 = payment
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");

  useEffect(() => {
    // Get checkout data from location state
    if (location.state) {
      setCheckoutData(location.state as CheckoutState);
    } else {
      // If no data, redirect back to events
      toast({
        title: "Checkout Error",
        description: "Missing ticket information. Please try again.",
        variant: "destructive",
      });
      navigate("/");
    }
    setIsLoading(false);
  }, [location, navigate]);

  // Countdown timer for checkout
  useEffect(() => {
    if (timeLeft <= 0) {
      toast({
        title: "Checkout Session Expired",
        description: "Your reserved tickets have been released. Please start over.",
        variant: "destructive",
      });
      navigate(`/events/${checkoutData?.eventId}`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate, checkoutData?.eventId]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateStep1()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent when moving to step 2
      if (checkoutData) {
        const result = await createPaymentIntent(
          checkoutData.totalPrice,
          'usd',
          {
            eventId: checkoutData.eventId,
            eventTitle: checkoutData.eventTitle,
            tierName: checkoutData.tierName,
            quantity: checkoutData.quantity.toString(),
            customerName: formData.name,
            customerEmail: formData.email,
          }
        );

        if ('error' in result) {
          toast({
            title: "Payment Setup Failed",
            description: result.error,
            variant: "destructive",
          });
          return;
        }

        setClientSecret(result.clientSecret);
        if (result.paymentIntentId) {
          setPaymentIntentId(result.paymentIntentId);
        }
        
        setStep(2);
        // Scroll to top when changing steps
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setClientSecret("");
    setPaymentIntentId("");
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    toast({
      title: "Purchase Successful!",
      description: `You've successfully purchased ${checkoutData?.quantity} tickets for ${checkoutData?.eventTitle}.`,
    });
    
    // Generate a random order number
    const orderNumber = `INS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
    
    // Navigate to confirmation page
    navigate('/confirmation', { 
      state: { 
        orderComplete: true,
        eventId: checkoutData?.eventId,
        eventTitle: checkoutData?.eventTitle,
        tierName: checkoutData?.tierName,
        quantity: checkoutData?.quantity,
        totalPrice: checkoutData?.totalPrice,
        orderNumber: orderNumber,
        paymentIntentId: paymentIntent.id,
        customerName: formData.name,
        customerEmail: formData.email,
      }
    });
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto py-8 px-4 mt-16">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded-lg mb-6"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto py-8 px-4 mt-16">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold">Checkout Error</h2>
            <p className="text-muted-foreground mt-2">Unable to process your checkout. Please try again.</p>
            <Link to="/">
              <Button className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate percentage of time used
  const timePercentage = (timeLeft / 600) * 100;

  return (
    <>
      <Helmet>
        <title>Checkout | InSeats Premium Tickets</title>
        <meta 
          name="description" 
          content="Complete your purchase of premium tickets securely." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 container mx-auto py-8 px-4 mt-16">
          <div className="mb-6">
            <Link to={`/events/${checkoutData?.eventId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event
            </Link>
          </div>
          
          {/* Checkout Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">Secure Checkout</h1>
              <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium text-sm">{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4">Complete your purchase to secure your tickets.</p>
            
            <Progress value={timePercentage} className="h-1.5 bg-gray-200" />
            
            {/* Checkout Steps */}
            <div className="flex items-center mt-6 mb-8">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${step >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                </div>
                <span className="font-medium">Customer Info</span>
              </div>
              <div className={`w-16 h-0.5 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${step >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  {step > 2 ? <Check className="h-5 w-5" /> : "2"}
                </div>
                <span className="font-medium">Payment</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Order Summary */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2 text-blue-500" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-lg">{checkoutData.eventTitle}</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        Seating Tier: <span className="font-medium text-foreground">{checkoutData.tierName}</span>
                      </p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span>Price per Ticket:</span>
                        <span>${checkoutData.tierPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Quantity:</span>
                        <span>{checkoutData.quantity}</span>
                      </div>
                      <div className="flex justify-between mb-2 border-t border-dashed border-gray-200 pt-2">
                        <span>Subtotal:</span>
                        <span>${(checkoutData.tierPrice * checkoutData.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Service Fee:</span>
                        <span>${(checkoutData.tierPrice * checkoutData.quantity * 0.1).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${checkoutData.totalPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        All prices include applicable taxes
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-blue-700">Secure Purchase Guarantee</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        All transactions are encrypted and secure. Your tickets are guaranteed authentic or your money back.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Multi-step Form */}
            <div className="lg:col-span-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                {step === 1 && (
                  <>
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                      Customer Information
                    </h2>
                    
                    <form className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Smith"
                            className={`w-full ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" /> {errors.name}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className={`w-full ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" /> {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Setting up payment...
                          </span>
                        ) : (
                          "Continue to Payment"
                        )}
                      </Button>
                    </form>
                  </>
                )}
                
                {step === 2 && clientSecret && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Payment Details</h2>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        size="sm"
                      >
                        Back
                      </Button>
                    </div>
                    
                    <StripeCheckoutForm
                      clientSecret={clientSecret}
                      amount={Math.round(checkoutData.totalPrice * 100)} // Convert to cents
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      customerInfo={{
                        name: formData.name,
                        email: formData.email,
                      }}
                    />
                    
                    <p className="text-xs text-center text-muted-foreground mt-6">
                      By completing this purchase, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and acknowledge our <Link to="/privacy" className="underline">Privacy Policy</Link>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Checkout;
