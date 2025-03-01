
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Event } from "@/components/EventCard";

// Mock event data that would normally come from an API
const MOCK_EVENTS: Record<string, Event> = {
  "5": {
    id: "5",
    title: "The Weeknd - After Hours Tour",
    category: "Concerts",
    date: "Tonight • 9:00 PM",
    venue: "Madison Square Garden",
    location: "New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 85,
    maxPrice: 650,
    isLastMinute: true,
  },
  "6": {
    id: "6",
    title: "Celtics vs. Knicks - Game 7",
    category: "Sports",
    date: "Tomorrow • 5:30 PM",
    venue: "TD Garden",
    location: "Boston, MA",
    imageUrl: "https://images.unsplash.com/photo-1518085250699-2d00e53f6604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 125,
    maxPrice: 750,
    isLastMinute: true,
  },
  "7": {
    id: "7",
    title: "Dear Evan Hansen",
    category: "Theater",
    date: "Tonight • 7:00 PM",
    venue: "Music Box Theatre",
    location: "New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 75,
    maxPrice: 350,
    isLastMinute: true,
  }
};

// Simplified seat data model
type SeatTier = {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSeats: number;
  color: string;
};

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Seat tier options that would normally be fetched
  const seatTiers: SeatTier[] = [
    {
      id: "vip",
      name: "VIP Premium",
      description: "Best views with exclusive access to VIP lounge",
      price: 450,
      availableSeats: 12,
      color: "bg-gold-500",
    },
    {
      id: "premium",
      name: "Premium",
      description: "Excellent views close to the stage/field",
      price: 250,
      availableSeats: 28,
      color: "bg-purple-500",
    },
    {
      id: "standard",
      name: "Standard",
      description: "Great views at a reasonable price",
      price: 150,
      availableSeats: 64,
      color: "bg-blue-500",
    },
    {
      id: "budget",
      name: "Budget",
      description: "Enjoy the event at the most affordable price",
      price: 85,
      availableSeats: 103,
      color: "bg-green-500",
    },
  ];

  useEffect(() => {
    // Simulate API fetch with a short delay
    const timer = setTimeout(() => {
      if (eventId && MOCK_EVENTS[eventId]) {
        setEvent(MOCK_EVENTS[eventId]);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [eventId]);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handlePurchase = () => {
    if (!selectedTier) {
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
      title: "Tickets added to cart!",
      description: `${quantity} x ${tier.name} tickets for ${event?.title}`,
    });
    
    // In a real app, this would navigate to checkout
    console.log(`Purchased ${quantity} ${tier.name} tickets for ${event?.title}`);
  };

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

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold">Event Not Found</h2>
            <p className="text-muted-foreground mt-2">The event you're looking for doesn't exist or has been removed.</p>
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
        <title>{event.title} | InSeats Premium Tickets</title>
        <meta 
          name="description" 
          content={`Get premium tickets for ${event.title} at ${event.venue}. Find the best seats at the best prices.`} 
        />
      </Helmet>
      
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
                    Experience an unforgettable night at {event.venue} with premium seating options that provide the best views and comfort.
                    This is a high-demand event with limited availability. Secure your seats now!
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
                  
                  {/* Simplified seat map visualization */}
                  <h3 className="text-xl font-semibold mb-4">Seat Map</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="relative w-full h-64 border border-gray-200 rounded bg-white overflow-hidden">
                      {/* Stage/Field indication */}
                      <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white text-center py-2">
                        Stage / Field
                      </div>
                      
                      {/* Simplified seating sections */}
                      <div className="absolute top-12 left-4 right-4 bottom-4 flex flex-col gap-2">
                        <div className="flex-1 bg-gold-500/20 border border-gold-500 rounded flex items-center justify-center">
                          <span className="font-semibold">VIP Premium</span>
                        </div>
                        <div className="flex-1 bg-purple-500/20 border border-purple-500 rounded flex items-center justify-center">
                          <span className="font-semibold">Premium</span>
                        </div>
                        <div className="flex-1 bg-blue-500/20 border border-blue-500 rounded flex items-center justify-center">
                          <span className="font-semibold">Standard</span>
                        </div>
                        <div className="flex-1 bg-green-500/20 border border-green-500 rounded flex items-center justify-center">
                          <span className="font-semibold">Budget</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      This is a simplified representation. Select a seating tier for more detailed information.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Ticket selection */}
              <div>
                <div className="premium-card p-6 sticky top-6">
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
                    
                    {seatTiers.map((tier) => (
                      <div 
                        key={tier.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedTier === tier.id 
                            ? `border-2 border-${tier.color.split('-')[1]}-500 bg-${tier.color.split('-')[1]}-50` 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleTierSelect(tier.id)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium flex items-center">
                            <div className={`w-3 h-3 rounded-full ${tier.color} mr-2`}></div>
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
                    ))}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="quantity" className="block font-semibold mb-2">
                      Quantity:
                    </label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-full border border-gray-300 rounded p-2"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Ticket' : 'Tickets'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedTier && (
                    <div className="border-t border-b py-4 mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Price per ticket:</span>
                        <span>${seatTiers.find(t => t.id === selectedTier)?.price}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Quantity:</span>
                        <span>{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Service Fee:</span>
                        <span>${((seatTiers.find(t => t.id === selectedTier)?.price || 0) * 0.1 * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-3">
                        <span>Total:</span>
                        <span>
                          ${((seatTiers.find(t => t.id === selectedTier)?.price || 0) * quantity * 1.1).toFixed(2)}
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
    </>
  );
};

export default EventDetail;
