
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Check, Calendar, Clock, MapPin, Ticket, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PurchaseConfirmation {
  eventId: string;
  eventTitle: string;
  tierName: string;
  quantity: number;
  totalPrice: number;
  orderNumber: string;
}

const ConfirmationPage = () => {
  const location = useLocation();
  const [confirmationData, setConfirmationData] = useState<PurchaseConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get confirmation data from location state
    if (location.state && location.state.orderComplete) {
      setConfirmationData(location.state as PurchaseConfirmation);
    }
    setIsLoading(false);
  }, [location]);

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

  if (!confirmationData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold">Order Not Found</h2>
            <p className="text-muted-foreground mt-2">We couldn't find any order information. Please check your email for confirmation details.</p>
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
        <title>Order Confirmation | InSeats Premium Tickets</title>
        <meta 
          name="description" 
          content="Your order has been confirmed. View your ticket details." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto py-12 px-4 mt-16">
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">Purchase Successful!</h1>
              <p className="text-green-700">
                Your order has been confirmed and your tickets are ready.
              </p>
            </div>
            
            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center border-b pb-4">
                Order Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{confirmationData.eventTitle}</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-muted-foreground mt-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Event Date</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Doors open 1 hour before</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Venue Location</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{confirmationData.tierName} Tickets</p>
                      <p className="text-sm text-muted-foreground">Quantity: {confirmationData.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${confirmationData.totalPrice.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Includes all fees and taxes</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order Number:</p>
                      <p className="text-muted-foreground">{confirmationData.orderNumber}</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Download className="mr-2 h-4 w-4" /> Download Tickets
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* What's Next Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4">What's Next?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <Ticket className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Your Tickets</h3>
                    <p className="text-muted-foreground text-sm">
                      We've sent your tickets to your email. You can also access them anytime from your account.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Event Day</h3>
                    <p className="text-muted-foreground text-sm">
                      Present your tickets at the venue entrance. We recommend arriving at least 30 minutes early.
                    </p>
                  </div>
                </div>
                
                <Link to="/" className="block">
                  <Button className="w-full">
                    Browse More Events
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ConfirmationPage;
