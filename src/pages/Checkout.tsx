
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, CreditCard, Clock, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatExpiry(value);
    setFormData((prev) => ({ ...prev, expiry: formattedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Purchase Successful!",
        description: `You've successfully purchased ${checkoutData?.quantity} tickets for ${checkoutData?.eventTitle}.`,
      });
      
      // Navigate to a confirmation page or back to event
      navigate(`/events/${checkoutData?.eventId}`, { 
        state: { 
          purchaseComplete: true,
          quantity: checkoutData?.quantity,
          tierName: checkoutData?.tierName
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

  return (
    <>
      <Helmet>
        <title>Checkout | InSeats Premium Tickets</title>
        <meta 
          name="description" 
          content="Complete your purchase of premium tickets securely." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4">
          <Link to={`/events/${checkoutData.eventId}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">Secure Checkout</h1>
          <p className="text-muted-foreground mb-6">Complete your purchase to secure your tickets.</p>
          
          <div className="flex items-center mb-4 text-amber-600">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">Time remaining: {formatTime(timeLeft)}</span>
            <span className="text-sm ml-2">(Your tickets are reserved for this period)</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="premium-card p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div>
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
                    <div className="flex justify-between mb-2">
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
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800">Secure Purchase Guarantee</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      All transactions are encrypted and secure. Your tickets are guaranteed authentic or your money back.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Payment Form */}
            <div className="lg:col-span-2">
              <div className="premium-card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-gold-500" />
                  Payment Details
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Smith"
                          required
                          className="w-full"
                        />
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
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Card Information</h3>
                    
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">Card Number</label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        className="w-full"
                      />
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
                          required
                          className="w-full"
                        />
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
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Billing Address</h3>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium mb-1">Street Address</label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Main St"
                        required
                        className="w-full"
                      />
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
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium mb-1">Zip Code</label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="10001"
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 text-lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span>Complete Purchase</span>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      By completing this purchase, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and acknowledge our <Link to="/privacy" className="underline">Privacy Policy</Link>.
                    </p>
                  </div>
                </form>
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
