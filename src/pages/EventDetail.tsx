import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star, Ticket, ChevronDown, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Event, SeatTier, SeatListing } from "@/types";
import { useEventDetails } from "@/hooks/useEventDetails";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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


const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { 
    event, 
    seatTiers, 
    seatListings, 
    isLoading, 
    error
  } = useEventDetails(eventId || '');
  
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mapFocus, setMapFocus] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'none' | 'tiers' | 'seats'>('none');
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [ticketQuantityFilter, setTicketQuantityFilter] = useState<string>("2");
  const [sortBy, setSortBy] = useState<string>("low-high");
  const [isFullScreenView, setIsFullScreenView] = useState(false);
  const [isPricePopoverOpen, setIsPricePopoverOpen] = useState(false);
  const navigate = useNavigate();

  // Calculate actual min/max prices from available listings
  const actualMinPrice = seatListings.length > 0 ? Math.min(...seatListings.map(l => l.price)) : 0;
  const actualMaxPrice = seatListings.length > 0 ? Math.max(...seatListings.map(l => l.price)) : 1000;
  const [priceRange, setPriceRange] = useState({ 
    min: actualMinPrice, 
    max: actualMaxPrice 
  });

  // Filter and sort listings based on current filters
  const filteredAndSortedListings = React.useMemo(() => {
    let filtered = [...seatListings];

    // Filter by ticket quantity
    filtered = filtered.filter(listing => 
      listing.quantity === parseInt(ticketQuantityFilter)
    );

    // Filter by price range
    filtered = filtered.filter(listing => 
      listing.price >= priceRange.min && listing.price <= priceRange.max
    );

    // Sort listings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'low-high':
          return a.price - b.price;
        case 'high-low':
          return b.price - a.price;
        case 'section':
          return a.section.localeCompare(b.section);
        default:
          return 0;
      }
    });

    return filtered;
  }, [seatListings, ticketQuantityFilter, priceRange, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setTicketQuantityFilter("2");
    setSortBy("low-high");
    setPriceRange({ min: actualMinPrice, max: actualMaxPrice });
    toast({
      title: "Filters reset",
      description: "All filters have been reset to default values",
    });
  };

  // Reset price range only
  const handleResetPriceRange = () => {
    setPriceRange({ min: actualMinPrice, max: actualMaxPrice });
    toast({
      title: "Price range reset",
      description: `Price range reset to $${actualMinPrice} - $${actualMaxPrice}`,
    });
  };

  // Update price range when listings change
  useEffect(() => {
    if (seatListings.length > 0) {
      const newMin = Math.min(...seatListings.map(l => l.price));
      const newMax = Math.max(...seatListings.map(l => l.price));
      setPriceRange({ min: newMin, max: newMax });
    }
  }, [seatListings]);

  // Handle mouse and touch events for slider dragging
  useEffect(() => {
    const getClientX = (e: MouseEvent | TouchEvent) => {
      return 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const sliderElement = document.querySelector('.price-slider-track') as HTMLElement;
      if (!sliderElement) return;
      
      const rect = sliderElement.getBoundingClientRect();
      const clientX = getClientX(e);
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const value = Math.round(actualMinPrice + percent * (actualMaxPrice - actualMinPrice));
      
      if (isDragging === 'min') {
        setPriceRange(prev => ({ ...prev, min: Math.min(value, prev.max - 100) }));
      } else if (isDragging === 'max') {
        setPriceRange(prev => ({ ...prev, max: Math.max(value, prev.min + 100) }));
      }
    };

    const handleEnd = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      
      // Touch events
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      // Mouse events
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      
      // Touch events
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, actualMinPrice, actualMaxPrice]);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    setMapFocus(tierId);
    
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

  const handleListingSelect = (listingId: string) => {
    setSelectedListing(listingId);
  };

  const handlePurchase = () => {
    if (!selectedTier) {
      return;
    }

    const tier = seatTiers.find(t => t.id === selectedTier);
    
    // Navigate to checkout page with state instead of query parameters
    navigate('/checkout', { 
      state: {
        eventId: eventId,
        eventTitle: event?.title,
        tierName: tier?.name,
        tierPrice: tier?.price,
        quantity: quantity,
        totalPrice: (tier?.price || 0) * quantity
      }
    });
  };

  const handleListingPurchase = () => {
    if (!selectedListing) {
      return;
    }

    const listing = seatListings.find(l => l.id === selectedListing);
    
    // Navigate to checkout page
    navigate('/checkout', { 
      state: {
        eventId: eventId,
        eventTitle: event?.title,
        seatDetails: `${listing?.section} ${listing?.row} ${listing?.seats}`,
        tierPrice: listing?.price,
        quantity: listing?.quantity,
        totalPrice: (listing?.price || 0) * (listing?.quantity || 1)
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
          <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
              <div className="container mx-auto">
                <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-2 md:mb-4 text-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                </Link>
                <div className="flex items-center mb-2">
                  <Badge className="bg-yellow-500 text-black mr-2 md:mr-3 text-xs">{event.category}</Badge>
                  {event.isLastMinute && (
                    <Badge className="bg-red-500 text-white text-xs">Last Minute</Badge>
                  )}
                </div>
                <h1 className="text-xl md:text-3xl lg:text-5xl font-bold leading-tight">{event.title}</h1>
                <div className="mt-2 md:mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-4 text-sm md:text-base text-white/90">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content - Ticket selection as primary focus */}
          <div className="container mx-auto py-4 md:py-8 px-4">
            {/* Primary Ticket Selection Section */}
            <div id="purchase-section" className="bg-white border border-gray-200 rounded-xl p-4 md:p-8 mb-6 md:mb-8 shadow-sm">
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <Ticket className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-yellow-500" />
                <h2 className="text-xl md:text-3xl font-bold">Get Your Tickets</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground mb-6 md:mb-8">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>100% authentic tickets guaranteed</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>Instant delivery to your account</span>
                </div>
              </div>

              {/* Purchase Method Cards - Centered and Prominent */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                  {/* Tiered Seating Card */}
                  <div className={`border-2 rounded-xl p-4 md:p-6 cursor-pointer transition-all hover:shadow-xl ${
                    selectedTier ? 'border-yellow-500 bg-yellow-50 shadow-lg' : 'border-gray-200 hover:border-yellow-300'
                  }`}>
                    <div className="text-center mb-3 md:mb-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                        <Users className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                      </div>
                      <h3 className="font-bold text-lg md:text-xl mb-1 md:mb-2">Tiered Seating</h3>
                      <p className="text-muted-foreground text-sm">Choose by price range and seating area</p>
                    </div>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-xs md:text-sm text-muted-foreground">Starting from</div>
                        <div className="text-2xl md:text-3xl font-bold text-yellow-600">
                          ${Math.min(...seatTiers.map(t => t.price))}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {seatTiers.reduce((sum, tier) => sum + tier.availableSeats, 0)} seats available
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50 text-sm"
                        onClick={() => setActiveView('tiers')}
                      >
                        Browse Tiers
                      </Button>
                    </div>
                  </div>

                  {/* Select Your Seat Card */}
                  <div className={`border-2 rounded-xl p-4 md:p-6 cursor-pointer transition-all hover:shadow-xl ${
                    selectedListing ? 'border-yellow-500 bg-yellow-50 shadow-lg' : 'border-gray-200 hover:border-yellow-300'
                  }`}>
                    <div className="text-center mb-3 md:mb-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                        <MapPin className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                      </div>
                      <h3 className="font-bold text-lg md:text-xl mb-1 md:mb-2">Select Your Seat</h3>
                      <p className="text-muted-foreground text-sm">Choose exact seats from resale listings</p>
                    </div>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-xs md:text-sm text-muted-foreground">Starting from</div>
                        <div className="text-2xl md:text-3xl font-bold text-yellow-600">
                          ${Math.min(...seatListings.map(l => l.price))}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {seatListings.length} listings available
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50 text-sm"
                        onClick={() => setActiveView('seats')}
                      >
                        Browse Seats
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tab-like Navigation Indicator */}
                {activeView !== 'none' && (
                  <div className="flex justify-center mb-6">
                    <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
                      <button 
                        className={`px-4 py-2 rounded-md text-sm transition-all ${
                          activeView === 'tiers' ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveView('tiers')}
                      >
                        Choose Your Seating Tier
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-md text-sm transition-all ${
                          activeView === 'seats' ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveView('seats')}
                      >
                        Select Your Exact Seat
                      </button>
                    </div>
                  </div>
                )}

                {/* Tiered Seating Details */}
                {activeView === 'tiers' && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl">Choose Your Seating Tier</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setActiveView('none')}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕ Close
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {seatTiers.map((tier) => {
                        const isSelected = selectedTier === tier.id;
                        
                        return (
                          <div 
                            key={tier.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected ? 'border-2 border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleTierSelect(tier.id)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium flex items-center">
                                <div className={`w-4 h-4 rounded-full ${tier.color} mr-2`}></div>
                                {tier.name}
                              </div>
                              <div className="font-bold text-xl">${tier.price}</div>
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
                    
                    {selectedTier && (
                      <div className="max-w-md mx-auto">
                        <div className="mb-4">
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
                        
                        <div className="border-t border-b py-4 mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Price per ticket:</span>
                            <span>${seatTiers.find(t => t.id === selectedTier)?.price}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Quantity:</span>
                            <span>{quantity}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg mt-3">
                            <span>Total:</span>
                            <span>
                              ${((seatTiers.find(t => t.id === selectedTier)?.price || 0) * quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-center mt-2">
                            <p className="text-xs text-green-600 font-medium">✓ All-in pricing - No hidden fees!</p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 text-lg"
                          onClick={handlePurchase}
                        >
                          Purchase Tickets - ${((seatTiers.find(t => t.id === selectedTier)?.price || 0) * quantity).toFixed(2)}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Select Your Seat Details */}
                {activeView === 'seats' && (
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl text-white">Select Your Exact Seat</h3>
                      <div className="flex items-center gap-2">
                        {/* Mobile expand button - better placement */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="md:hidden text-gray-400 hover:text-white"
                          onClick={() => setIsFullScreenView(true)}
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          <span className="text-xs">Expand</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setActiveView('none')}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕ Close
                        </Button>
                      </div>
                    </div>
                    
                    {/* Enhanced Filter Controls */}
                    <div className="space-y-4 mb-4">
                      {/* Top row - Ticket quantity and price range selectors */}
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-3 border border-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          <Select 
                            value={ticketQuantityFilter} 
                            onValueChange={(value) => {
                              setTicketQuantityFilter(value);
                              toast({
                                title: "Filter updated",
                                description: `Showing listings with ${value} ticket${value === "1" ? "" : "s"}`,
                              });
                            }}
                          >
                            <SelectTrigger className="w-28 bg-transparent text-white border-none p-0 h-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                              <SelectItem value="1">1 TICKET</SelectItem>
                              <SelectItem value="2">2 TICKETS</SelectItem>
                              <SelectItem value="3">3 TICKETS</SelectItem>
                              <SelectItem value="4">4 TICKETS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Popover open={isPricePopoverOpen} onOpenChange={setIsPricePopoverOpen}>
                          <PopoverTrigger asChild>
                            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-3 border border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors">
                              <span className="text-white font-medium">$</span>
                              <span className="text-white">{actualMinPrice} - {actualMaxPrice}</span>
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0 bg-gray-800 border-gray-600" align="start">
                            <div className="p-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm font-medium">Price Range</span>
                                <button 
                                  className="text-gray-400 hover:text-white text-xs"
                                  onClick={handleResetPriceRange}
                                >
                                  RESET
                                </button>
                              </div>
                              
                              <div className="relative">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-white font-bold text-lg">${priceRange.min}</span>
                                  <span className="text-white font-bold text-lg">${priceRange.max}</span>
                                </div>
                                
                                <div 
                                  className="relative h-2 bg-gray-700 rounded-full cursor-pointer price-slider-track"
                                  onMouseDown={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    const value = Math.round(actualMinPrice + percent * (actualMaxPrice - actualMinPrice));
                                    
                                    const minDist = Math.abs(value - priceRange.min);
                                    const maxDist = Math.abs(value - priceRange.max);
                                    
                                    if (minDist < maxDist) {
                                      setPriceRange(prev => ({ ...prev, min: Math.min(value, prev.max - 100) }));
                                      setIsDragging('min');
                                    } else {
                                      setPriceRange(prev => ({ ...prev, max: Math.max(value, prev.min + 100) }));
                                      setIsDragging('max');
                                    }
                                  }}
                                >
                                  <div 
                                    className="absolute h-2 bg-white rounded-full" 
                                    style={{
                                      left: `${((priceRange.min - actualMinPrice) / (actualMaxPrice - actualMinPrice)) * 100}%`,
                                      width: `${((priceRange.max - priceRange.min) / (actualMaxPrice - actualMinPrice)) * 100}%`
                                    }}
                                  ></div>
                                  
                                  <div 
                                    className="absolute w-6 h-6 bg-white rounded-full border-2 border-gray-900 -top-2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none" 
                                    style={{
                                      left: `${((priceRange.min - actualMinPrice) / (actualMaxPrice - actualMinPrice)) * 100}%`,
                                      transform: 'translateX(-50%)'
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setIsDragging('min');
                                    }}
                                    onTouchStart={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setIsDragging('min');
                                    }}
                                  ></div>
                                  
                                  <div 
                                    className="absolute w-6 h-6 bg-white rounded-full border-2 border-gray-900 -top-2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none" 
                                    style={{
                                      left: `${((priceRange.max - actualMinPrice) / (actualMaxPrice - actualMinPrice)) * 100}%`,
                                      transform: 'translateX(-50%)'
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setIsDragging('max');
                                    }}
                                    onTouchStart={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setIsDragging('max');
                                    }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="flex justify-center mt-4">
                                <Button 
                                  className="bg-white text-black hover:bg-gray-200 px-8 py-2 rounded-full font-medium"
                                  onClick={() => {
                                    toast({
                                      title: "Price filter applied",
                                      description: `Showing tickets from $${priceRange.min} to $${priceRange.max}`,
                                    });
                                    setIsPricePopoverOpen(false);
                                  }}
                                >
                                  Continue
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      {/* Sort controls - Mobile responsive layout */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                        <span className="text-white font-medium">{filteredAndSortedListings.length} LISTINGS</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">SORT:</span>
                          <Select 
                            value={sortBy} 
                            onValueChange={(value) => {
                              setSortBy(value);
                              toast({
                                title: "Sort updated",
                                description: `Listings sorted by ${value === "low-high" ? "price (low to high)" : value === "high-low" ? "price (high to low)" : "section"}`,
                              });
                            }}
                          >
                            <SelectTrigger className="w-32 bg-transparent text-white border-gray-600 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                              <SelectItem value="low-high">LOW TO HIGH</SelectItem>
                              <SelectItem value="high-low">HIGH TO LOW</SelectItem>
                              <SelectItem value="section">BY SECTION</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-white text-xs"
                            onClick={handleResetFilters}
                          >
                            CLEAR ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dedicated Scrollable Container for Seat Listings */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 h-64 md:h-auto md:max-h-96">
                      <div className="h-full overflow-y-auto p-4 space-y-3">
                        {filteredAndSortedListings.map((listing) => {
                          const isSelected = selectedListing === listing.id;
                          
                          return (
                            <div 
                              key={listing.id}
                              className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all border ${
                                isSelected ? 'border-yellow-500 bg-gray-600' : 'border-gray-600 hover:border-gray-500'
                              }`}
                              onClick={() => handleListingSelect(listing.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="text-white">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-gray-400 text-sm">Section</span>
                                    <span className="text-gray-400 text-sm">/</span>
                                    <span className="text-gray-400 text-sm">Row</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-lg font-medium">
                                    <span>{listing.section}</span>
                                    <span className="text-gray-400">/</span>
                                    <span>{listing.row}</span>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-white text-xl font-bold">${listing.price}</div>
                                  <div className="text-gray-400 text-sm">ea.</div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center mt-3">
                                <span className="text-gray-400 text-sm">{listing.seats}</span>
                                {listing.section === "316" && (
                                  <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                                    🚫 Obstructed View
                                  </Badge>
                                )}
                                {listing.isInstantDelivery && listing.section !== "316" && (
                                  <Badge variant="secondary" className="bg-green-700 text-white text-xs">
                                    Instant Delivery
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Purchase Button */}
                    {selectedListing && (
                      <div className="mt-6 max-w-md mx-auto">
                        <div className="border-t border-gray-700 pt-4 mb-4">
                          <div className="flex justify-between text-sm text-white mb-2">
                            <span>Selected seats:</span>
                            <span>{seatListings.find(l => l.id === selectedListing)?.seats}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg text-white">
                            <span>Total:</span>
                            <span>
                              ${((seatListings.find(l => l.id === selectedListing)?.price || 0) * (seatListings.find(l => l.id === selectedListing)?.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 text-lg"
                          onClick={handleListingPurchase}
                        >
                          Purchase Selected Seats - ${((seatListings.find(l => l.id === selectedListing)?.price || 0) * (seatListings.find(l => l.id === selectedListing)?.quantity || 1)).toFixed(2)}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      
      {/* Full-Screen Mobile View Overlay */}
      {isFullScreenView && (
        <div className="fixed inset-0 z-50 bg-gray-900 md:hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="font-bold text-xl text-white">Select Your Exact Seat</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsFullScreenView(false)}
              className="text-gray-400 hover:text-white"
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Filter Controls */}
          <div className="p-4 space-y-4 border-b border-gray-700">
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-3 border border-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                <Select 
                  value={ticketQuantityFilter} 
                  onValueChange={(value) => {
                    setTicketQuantityFilter(value);
                    toast({
                      title: "Filter updated",
                      description: `Showing listings with ${value} ticket${value === "1" ? "" : "s"}`,
                    });
                  }}
                >
                  <SelectTrigger className="w-28 bg-transparent text-white border-none p-0 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                    <SelectItem value="1">1 TICKET</SelectItem>
                    <SelectItem value="2">2 TICKETS</SelectItem>
                    <SelectItem value="3">3 TICKETS</SelectItem>
                    <SelectItem value="4">4 TICKETS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-3 border border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors">
                    <span className="text-white font-medium">$</span>
                    <span className="text-white">{actualMinPrice} - {actualMaxPrice}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-gray-800 border-gray-600" align="start">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white text-sm font-medium">Price Range</span>
                      <button 
                        className="text-gray-400 hover:text-white text-xs"
                        onClick={handleResetPriceRange}
                      >
                        RESET
                      </button>
                    </div>
                    
                    <div className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-bold text-lg">${priceRange.min}</span>
                        <span className="text-white font-bold text-lg">${priceRange.max}</span>
                      </div>
                      
                      <div 
                        className="relative h-2 bg-gray-700 rounded-full cursor-pointer price-slider-track"
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = (e.clientX - rect.left) / rect.width;
                          const value = Math.round(actualMinPrice + percent * (actualMaxPrice - actualMinPrice));
                          
                          const minDist = Math.abs(value - priceRange.min);
                          const maxDist = Math.abs(value - priceRange.max);
                          
                          if (minDist < maxDist) {
                            setPriceRange(prev => ({ ...prev, min: Math.min(value, prev.max - 100) }));
                            setIsDragging('min');
                          } else {
                            setPriceRange(prev => ({ ...prev, max: Math.max(value, prev.min + 100) }));
                            setIsDragging('max');
                          }
                        }}
                      >
                        <div 
                          className="absolute h-2 bg-white rounded-full" 
                          style={{
                            left: `${((priceRange.min - actualMinPrice) / (actualMaxPrice - actualMinPrice)) * 100}%`,
                            width: `${((priceRange.max - priceRange.min) / (actualMaxPrice - actualMinPrice)) * 100}%`
                          }}
                        ></div>
                        
                        <div 
                          className="absolute w-6 h-6 bg-white rounded-full border-2 border-gray-900 -top-2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none" 
                          style={{
                            left: `${((priceRange.min - actualMinPrice) / (actualMaxPrice - actualMinPrice)) * 100}%`,
                            transform: 'translateX(-50%)'
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsDragging('min');
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setIsDragging('min');
                          }}
                        ></div>
                        
                        <div 
                          className="absolute w-6 h-6 bg-white rounded-full border-2 border-gray-900 -top-2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none" 
                          style={{
                            left: `${((priceRange.max - actualMinPrice) / (actualMaxPrice - actualMinPrice)) * 100}%`,
                            transform: 'translateX(-50%)'
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsDragging('max');
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setIsDragging('max');
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <Button 
                        className="bg-white text-black hover:bg-gray-200 px-8 py-2 rounded-full font-medium"
                        onClick={() => {
                          toast({
                            title: "Price filter applied",
                            description: `Showing tickets from $${priceRange.min} to $${priceRange.max}`,
                          });
                          document.body.click();
                        }}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Sort controls */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-white font-medium">{seatListings.length} LISTINGS</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">SORT:</span>
                <Select 
                  value={sortBy} 
                  onValueChange={(value) => {
                    setSortBy(value);
                    toast({
                      title: "Sort updated",
                      description: `Listings sorted by ${value === "low-high" ? "price (low to high)" : value === "high-low" ? "price (high to low)" : "section"}`,
                    });
                  }}
                >
                  <SelectTrigger className="w-32 bg-transparent text-white border-gray-600 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                    <SelectItem value="low-high">LOW TO HIGH</SelectItem>
                    <SelectItem value="high-low">HIGH TO LOW</SelectItem>
                    <SelectItem value="section">BY SECTION</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs">
                  CLEAR ✕
                </Button>
              </div>
            </div>
          </div>
          
          {/* Scrollable Listings Area - Same structure as condensed view */}
          <div className="flex-1 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 h-full">
              <div className="h-full overflow-y-auto p-4 space-y-3">
                {filteredAndSortedListings.map((listing) => {
                  const isSelected = selectedListing === listing.id;
                  
                  return (
                    <div 
                      key={listing.id}
                      className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all border ${
                        isSelected ? 'border-yellow-500 bg-gray-600' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleListingSelect(listing.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400 text-sm">Section</span>
                            <span className="text-gray-400 text-sm">/</span>
                            <span className="text-gray-400 text-sm">Row</span>
                          </div>
                          <div className="flex items-center gap-2 text-lg font-medium">
                            <span>{listing.section}</span>
                            <span className="text-gray-400">/</span>
                            <span>{listing.row}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white text-xl font-bold">${listing.price}</div>
                          <div className="text-gray-400 text-sm">ea.</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-gray-400 text-sm">{listing.seats}</span>
                        {listing.section === "316" && (
                          <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                            🚫 Obstructed View
                          </Badge>
                        )}
                        {listing.isInstantDelivery && listing.section !== "316" && (
                          <Badge variant="secondary" className="bg-green-700 text-white text-xs">
                            Instant Delivery
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Purchase Button - Fixed at bottom */}
          {selectedListing && (
            <div className="p-4 border-t border-gray-700 bg-gray-900">
              <div className="mb-3">
                <div className="flex justify-between text-sm text-white mb-1">
                  <span>Selected seats:</span>
                  <span>{seatListings.find(l => l.id === selectedListing)?.seats}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-white">
                  <span>Total:</span>
                  <span>
                    ${((seatListings.find(l => l.id === selectedListing)?.price || 0) * (seatListings.find(l => l.id === selectedListing)?.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 text-lg"
                onClick={handleListingPurchase}
              >
                Purchase Selected Seats - ${((seatListings.find(l => l.id === selectedListing)?.price || 0) * (seatListings.find(l => l.id === selectedListing)?.quantity || 1)).toFixed(2)}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EventDetail;
