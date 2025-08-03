import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Event, SeatTier, CheckoutState } from "@/types";
import { useEventDetails } from "@/hooks/useEventDetails";
import { useScrollToPurchase } from "@/hooks/useScrollToPurchase";
// import { useSEO } from "@/hooks/useSEO";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  // Custom hooks
  const { event, seatTiers, isLoading, error } = useEventDetails(eventId);
  const { purchaseSectionRef, scrollToPurchase } = useScrollToPurchase();
  
  // Local state
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mapFocus, setMapFocus] = useState<string | null>(null);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    setMapFocus(tierId);
    
    const tier = seatTiers.find(t => t.id === tierId);
    if (tier) {
      toast({
        title: `${tier.name} selected`,
        description: `${tier.availableSeats} seats available at $${tier.price} each`,
      });
    }
    
    // Scroll to purchase section on mobile
    scrollToPurchase();
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(parseInt(value, 10));
  };

  const handlePurchase = () => {
    if (!selectedTier || !event) {
      toast({
        title: "Please select a seating option",
        description: "You need to select a seating tier before purchasing tickets",
        variant: "destructive",
      });
      return;
    }

    const tier = seatTiers.find(t => t.id === selectedTier);
    if (!tier) return;
    
    toast({
      title: "Processing your purchase",
      description: `${quantity} ${tier.name} tickets at $${tier.price} each`,
    });
    
    // Navigate to checkout page with state
    const checkoutState: CheckoutState = {
      eventId: event.id,
      eventTitle: event.title,
      tierName: tier.name,
      tierPrice: tier.price,
      quantity: quantity,
      totalPrice: tier.price * quantity * 1.1
    };
    
    navigate('/checkout', { state: checkoutState });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded-lg mb-6"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold">
              {error ? "Error Loading Event" : "Event Not Found"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {error 
                ? "There was an error loading the event details. Please try again." 
                : "The event you're looking for doesn't exist or has been removed."
              }
            </p>
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

  const selectedTierData = seatTiers.find(t => t.id === selectedTier);

  // SEO functionality temporarily disabled to fix React error #310
  // TODO: Re-implement SEO with proper dependency management

  return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero section with event image and overlay */}
          <div className="relative h-[50vh] overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="container mx-auto">
                <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                </Link>
                <div className="flex items-center mb-2">
                  <Badge className="bg-gold-500 text-black mr-3">{event.category}</Badge>
                  {event.isLastMinute && (
                    <Badge className="bg-red-500 text-white">Last Minute</Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{event.title}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-white/90">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="container mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column */}
              <div className="lg:col-span-2">
                <div className="premium-card p-6 mb-8">
                  <h2 className="text-2xl font-bold mb-4">Event Details</h2>
                  <p className="text-muted-foreground mb-6">
                    {event.description || `Experience an unforgettable night at ${event.venue} with premium seating options that provide the best views and comfort. This is a high-demand event with limited availability. Secure your seats now!`}
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">Venue Information</h3>
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gold-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{event.venue}</p>
                        <p className="text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gold-500" />
                      <p>Doors open 1 hour before event start</p>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-gold-500" />
                      <p>All ages welcome</p>
                    </div>
                  </div>
                  
                  {/* Seat map */}
                  <h3 className="text-xl font-semibold mb-4">Seat Map</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4">
                    <div className="relative w-full overflow-hidden">
                      {/* Stage/Field indication */}
                      <div className="bg-gray-800 text-white text-center py-2 mb-2">
                        Stage / Field
                      </div>
                      
                      {/* Seating sections */}
                      <div className="flex flex-col gap-2">
                        {seatTiers.map((tier) => (
                          <div 
                            key={tier.id}
                            className={`cursor-pointer rounded py-2 text-center transition-all ${
                              mapFocus === tier.id ? tier.bgColor : 'bg-gray-50'
                            }`}
                            onClick={() => handleTierSelect(tier.id)}
                          >
                            <div className="font-medium">{tier.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-muted-foreground text-center">
                      Click on a seating tier to select and see more details.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Ticket selection */}
              <div>
                <div ref={purchaseSectionRef} className="premium-card p-6 sticky top-6">
                  <div className="flex items-center mb-4">
                    <Ticket className="h-5 w-5 mr-2 text-gold-500" />
                    <h2 className="text-2xl font-bold">Get Tickets</h2>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-gold-500" />
                      <span>InSeats Guarantee: 100% authentic tickets</span>
                    </div>
                    <div className="mt-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gold-500" />
                      <span>Instant delivery to your account</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold">Select Seating Tier:</h3>
                    
                    {seatTiers.map((tier) => {
                      const isSelected = selectedTier === tier.id;
                      const dotColorClass = tier.color.replace('bg-', 'bg-');
                      
                      return (
                        <div 
                          key={tier.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected ? 'border-2 border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleTierSelect(tier.id)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium flex items-center">
                              <div className={`w-3 h-3 rounded-full ${dotColorClass} mr-2`}></div>
                              {tier.name}
                            </div>
                            <div className="font-bold text-lg">${tier.price}</div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{tier.description}</p>
                          <div className="text-sm">
                            <span className={tier.availableSeats < 20 ? "text-red-500 font-medium" : ""}>
                              {tier.availableSeats} seats available
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Quantity selector */}
                  <div className="mb-6">
                    <label htmlFor="quantity" className="block font-semibold mb-2">
                      Quantity:
                    </label>
                    <Select
                      value={quantity.toString()}
                      onValueChange={handleQuantityChange}
                    >
                      <SelectTrigger className="w-full border border-gray-300 bg-white">
                        <SelectValue placeholder={`${quantity} Ticket${quantity > 1 ? 's' : ''}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="cursor-pointer hover:bg-gray-100">
                            {num} {num === 1 ? 'Ticket' : 'Tickets'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Price breakdown */}
                  {selectedTierData && (
                    <div className="border-t border-b py-4 mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Price per ticket:</span>
                        <span>${selectedTierData.price}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Quantity:</span>
                        <span>{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Service Fee:</span>
                        <span>${(selectedTierData.price * 0.1 * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-3">
                        <span>Total:</span>
                        <span>
                          ${(selectedTierData.price * quantity * 1.1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 text-lg"
                    onClick={handlePurchase}
                    disabled={!selectedTier}
                  >
                    Purchase Tickets
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    By purchasing, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and acknowledge our <Link to="/privacy" className="underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
};

export default EventDetail;
