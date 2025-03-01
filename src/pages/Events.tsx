
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { 
  Filter, 
  SlidersHorizontal, 
  Map as MapIcon,
  Search,
  X
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySelector from "@/components/CategorySelector";
import EventCard, { Event } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

// Mock data for initial development
const MOCK_EVENTS: Event[] = [
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
  },
  {
    id: "8",
    title: "Drake - It's All A Blur Tour",
    category: "Concerts",
    date: "June 10, 2023 • 8:00 PM",
    venue: "United Center",
    location: "Chicago, IL",
    imageUrl: "https://images.unsplash.com/photo-1569331232892-96cd7df09d7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 199,
    maxPrice: 999,
    isPremium: true,
  }
];

const Events = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState<number[]>([0, 2500]);
  const [showLastMinute, setShowLastMinute] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "all";
    const filterParam = searchParams.get("filter") || "";
    
    setSearchQuery(queryParam);
    setSelectedCategory(categoryParam);
    
    if (filterParam === "lastminute") {
      setShowLastMinute(true);
    }

    // Simulate API call with a small delay
    const timer = setTimeout(() => {
      setEvents(MOCK_EVENTS);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.search]);

  useEffect(() => {
    if (events.length === 0) return;

    let result = [...events];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(event => 
        event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply last minute filter
    if (showLastMinute) {
      result = result.filter(event => event.isLastMinute);
    }

    // Apply premium filter
    if (showPremium) {
      result = result.filter(event => event.isPremium);
    }

    // Apply price range filter
    result = result.filter(event => 
      event.minPrice >= priceRange[0] && event.minPrice <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case "price-high":
        result.sort((a, b) => b.minPrice - a.minPrice);
        break;
      case "date":
        // In a real app, you'd convert dates to timestamps and sort
        break;
      default:
        // relevance - would be handled by backend
        break;
    }

    setFilteredEvents(result);
  }, [events, searchQuery, selectedCategory, sortBy, priceRange, showLastMinute, showPremium]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateUrl({ category });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchQuery });
  };

  const updateUrl = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(location.search);
    
    // Update or add each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });
    
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("relevance");
    setPriceRange([0, 2500]);
    setShowLastMinute(false);
    setShowPremium(false);
    navigate("/events");
  };

  return (
    <>
      <Helmet>
        <title>Browse Events | InSeats</title>
        <meta 
          name="description" 
          content="Find and purchase premium tickets for concerts, sports, and theater events. Last-minute deals available." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-20">
          {/* Search Bar */}
          <section className="bg-black py-12">
            <div className="container mx-auto container-padding">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search events, artists, venues..."
                      className="pl-10 bg-white h-12"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black h-12">
                    Search
                  </Button>
                </form>
              </div>
            </div>
          </section>
          
          {/* Category Selector */}
          <section className="border-b">
            <div className="container mx-auto container-padding py-4">
              <CategorySelector 
                onCategoryChange={handleCategoryChange} 
                currentCategory={selectedCategory}
              />
            </div>
          </section>
          
          {/* Events Grid with Filters */}
          <section className="py-8">
            <div className="container mx-auto container-padding">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Mobile Filter Button */}
                <div className="md:hidden w-full flex justify-between items-center mb-4">
                  <div className="text-lg font-bold">
                    {filteredEvents.length} Events
                  </div>
                  
                  <div className="flex gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Filter size={16} />
                          Filters
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <SheetHeader>
                          <SheetTitle>Filters</SheetTitle>
                          <SheetDescription>
                            Refine your event search with these filters.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-4 space-y-6">
                          {/* Mobile Filter Content - same as desktop */}
                          <div>
                            <h3 className="font-semibold mb-3">Sort By</h3>
                            <Select value={sortBy} onValueChange={setSortBy}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sort events" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="relevance">Relevance</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-3">Price Range</h3>
                            <div className="mb-6">
                              <Slider 
                                defaultValue={priceRange} 
                                max={2500} 
                                step={10}
                                onValueChange={setPriceRange}
                              />
                              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-3">Event Types</h3>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="lastminute-mobile"
                                  checked={showLastMinute}
                                  onCheckedChange={(checked) => 
                                    setShowLastMinute(checked as boolean)
                                  }
                                />
                                <label
                                  htmlFor="lastminute-mobile"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Last Minute Deals
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="premium-mobile"
                                  checked={showPremium}
                                  onCheckedChange={(checked) => 
                                    setShowPremium(checked as boolean)
                                  }
                                />
                                <label
                                  htmlFor="premium-mobile"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Premium Seats
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={clearFilters}
                          >
                            Clear Filters
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[130px]">
                        <div className="flex items-center">
                          <SlidersHorizontal size={16} className="mr-2" />
                          <SelectValue placeholder="Sort" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Desktop Sidebar Filters */}
                <div className="hidden md:block w-64 shrink-0">
                  <div className="sticky top-24 bg-white rounded-lg border p-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Filters</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-muted-foreground hover:text-primary"
                          onClick={clearFilters}
                        >
                          Clear All
                        </Button>
                      </div>
                      
                      {/* Applied filters */}
                      {(searchQuery || selectedCategory !== "all" || showLastMinute || showPremium || priceRange[0] > 0 || priceRange[1] < 2500) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {searchQuery && (
                            <div className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                              <span className="mr-1">{searchQuery}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                  setSearchQuery("");
                                  updateUrl({ search: "" });
                                }}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          )}
                          
                          {selectedCategory !== "all" && (
                            <div className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                              <span className="mr-1">{selectedCategory}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleCategoryChange("all")}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          )}
                          
                          {showLastMinute && (
                            <div className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                              <span className="mr-1">Last Minute</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => setShowLastMinute(false)}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          )}
                          
                          {showPremium && (
                            <div className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                              <span className="mr-1">Premium</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => setShowPremium(false)}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          )}
                          
                          {(priceRange[0] > 0 || priceRange[1] < 2500) && (
                            <div className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                              <span className="mr-1">${priceRange[0]} - ${priceRange[1]}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => setPriceRange([0, 2500])}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Sort By</h3>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort events" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Price Range</h3>
                      <div className="mb-6">
                        <Slider 
                          defaultValue={priceRange} 
                          max={2500} 
                          step={10}
                          onValueChange={setPriceRange}
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Event Types</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="lastminute"
                            checked={showLastMinute}
                            onCheckedChange={(checked) => 
                              setShowLastMinute(checked as boolean)
                            }
                          />
                          <label
                            htmlFor="lastminute"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Last Minute Deals
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="premium"
                            checked={showPremium}
                            onCheckedChange={(checked) => 
                              setShowPremium(checked as boolean)
                            }
                          />
                          <label
                            htmlFor="premium"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Premium Seats
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full gap-2">
                      <MapIcon size={16} />
                      View Map
                    </Button>
                  </div>
                </div>
                
                {/* Events Grid */}
                <div className="flex-1">
                  <div className="hidden md:flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                      {filteredEvents.length} {selectedCategory !== "all" ? selectedCategory : ""} Events
                    </h1>
                  </div>
                  
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="premium-card animate-pulse">
                          <div className="aspect-video bg-muted"></div>
                          <div className="p-4">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                            <div className="h-3 bg-muted rounded w-full mb-2"></div>
                            <div className="h-3 bg-muted rounded w-4/5"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">No events found</h2>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your search or filter criteria
                      </p>
                      <Button onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Events;
