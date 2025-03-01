import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Event } from "@/components/EventCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock event data that would normally come from an API
const MOCK_EVENTS: Record<string, Event> = {
  "1": {
    id: "1",
    title: "Taylor Swift | The Eras Tour",
    category: "Concerts",
    date: "May 15, 2023 • 8:00 PM",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 299,
    maxPrice: 1500,
    isPremium: true,
    isLastMinute: true,
  },
  "2": {
    id: "2",
    title: "Lakers vs. Warriors - Western Conference Finals",
    category: "Sports",
    date: "June 2, 2023 • 7:30 PM",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 199,
    maxPrice: 2500,
    isPremium: true,
  },
  "3": {
    id: "3",
    title: "Hamilton - Broadway Musical",
    category: "Theater",
    date: "May 20, 2023 • 7:00 PM",
    venue: "Richard Rodgers Theatre",
    location: "New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 129,
    maxPrice: 899,
    isLastMinute: true,
  },
  "4": {
    id: "4",
    title: "Coldplay - Music of the Spheres Tour",
    category: "Concerts",
    date: "May 25, 2023 • 8:00 PM",
    venue: "Wembley Stadium",
    location: "London, UK",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 150,
    maxPrice: 800,
    isPremium: true,
  },
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
  bgColor: string;
};

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mapFocus, setMapFocus] = useState<string | null>(null);
  const navigate = useNavigate();

  // Seat tier options that would normally be fetched
  const seatTiers: SeatTier[] = [
    {
      id: "vip",
      name: "VIP Premium",
      description: "Best views with exclusive access to VIP lounge",
      price: 450,
      availableSeats: 12,
      color: "bg-amber-500",
      bgColor: "bg-amber-100",
    },
    {
      id: "premium",
      name: "Premium",
      description: "Excellent views close to the stage/field",
      price: 250,
      availableSeats: 28,
      color: "bg-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      id: "standard",
      name: "Standard",
      description: "Great views at a reasonable price",
      price: 150,
      availableSeats: 64,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      id: "budget",
      name: "Budget",
      description: "Enjoy the event at the most affordable price",
      price: 85,
      availableSeats: 103,
      color: "bg-green-500",
      bgColor: "bg-green-100",
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
    setMapFocus(tierId);
    
    const tier = seatTiers.find(t => t.id === tierId);
    if (tier) {
      toast({
        title: `${tier.name} selected`,
        description: `${tier.availableSeats} seats available at $${tier.price} each`,
      });
    }
    
    // Animate scroll to purchase section on mobile
    if (window.innerWidth < 768) {
      const purchaseSection = document.getElementById('purchase-section');
      if (purchaseSection) {
        purchaseSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(parseInt(value, 10));
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
    
    toast({
      title: "Processing your purchase",
      description: `${quantity} ${tier?.name} tickets at $${tier?.price} each`,
    });
    
    // Navigate to checkout page with state instead of query parameters
    navigate('/checkout', { 
      state: {
        eventId: eventId,
        eventTitle: event.title,
        tierName: tier?.name,
        tierPrice: tier?.price,
        quantity: quantity,
        totalPrice: (tier?.price || 0) * quantity * 1.1
      }
    });
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
                  
                  {/* Redesigned seat map to match the image */}
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
                <div id="purchase-section" className="premium-card p-6 sticky top-6">
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
                  
                  {/* Improved select dropdown for quantity */}
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
