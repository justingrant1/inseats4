
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, CreditCard, Clock, Shield, Check, ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";

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
    cardNumber: "",
    expiry: "",
    cvc: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [step, setStep] = useState(1); // 1 = customer info, 2 = payment
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date as MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCardNumber(value);
    setFormData((prev) => ({ ...prev, cardNumber: formattedValue }));
    
    // Clear error when user starts typing
    if (errors.cardNumber) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.cardNumber;
        return newErrors;
      });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatExpiry(value);
    setFormData((prev) => ({ ...prev, expiry: formattedValue }));
    
    // Clear error when user starts typing
    if (errors.expiry) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.expiry;
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

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = "Valid card number is required";
    }
    
    if (!formData.expiry.trim() || formData.expiry.length < 5) {
      newErrors.expiry = "Valid expiry date is required";
    }
    
    if (!formData.cvc.trim() || formData.cvc.length < 3) {
      newErrors.cvc = "Valid CVC is required";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      // Scroll to top when changing steps
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
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
          orderNumber: orderNumber
        }
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4">
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
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4">
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
        <Header />
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
                      >
                        Continue to Payment
                      </Button>
                    </form>
                  </>
                )}
                
                {step === 2 && (
                  <>
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                      Payment Details
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium border-b pb-2">Card Information</h3>
                        
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">Card Number</label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={`w-full ${errors.cardNumber ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          {errors.cardNumber && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" /> {errors.cardNumber}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiry" className="block text-sm font-medium mb-1">Expiry Date</label>
                            <Input
                              id="expiry"
                              name="expiry"
                              value={formData.expiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              className={`w-full ${errors.expiry ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {errors.expiry && (
                              <p className="mt-1 text-sm text-red-500 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> {errors.expiry}
                              </p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="cvc" className="block text-sm font-medium mb-1">CVC</label>
                            <Input
                              id="cvc"
                              name="cvc"
                              value={formData.cvc}
                              onChange={handleInputChange}
                              placeholder="123"
                              maxLength={3}
                              className={`w-full ${errors.cvc ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {errors.cvc && (
                              <p className="mt-1 text-sm text-red-500 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> {errors.cvc}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium border-b pb-2">Billing Address</h3>
                        
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium mb-1">Street Address</label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
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
                              value={formData.city}
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
                            <label htmlFor="zipCode" className="block text-sm font-medium mb-1">Zip Code</label>
                            <Input
                              id="zipCode"
                              name="zipCode"
                              value={formData.zipCode}
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
                      </div>
                      
                      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevStep}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            <span>Complete Purchase</span>
                          )}
                        </Button>
                      </div>
                      
                      <p className="text-xs text-center text-muted-foreground mt-4">
                        By completing this purchase, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and acknowledge our <Link to="/privacy" className="underline">Privacy Policy</Link>.
                      </p>
                    </form>
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
