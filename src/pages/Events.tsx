
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Filter, Search, Calendar, MapPin, ChevronDown } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Event } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSEO, seoConfigs } from "@/hooks/useSEO";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import { useGeolocation } from "@/hooks/useGeolocation";

// Sample event data - in a real app, this would come from an API
const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Taylor Swift - Eras Tour",
    category: "concerts",
    date: "May 15, 2023 • 7:00 PM",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    minPrice: 199,
    maxPrice: 899,
    isPremium: true,
    isLastMinute: true,
  },
  {
    id: "2",
    title: "Lakers vs. Warriors",
    category: "sports",
    date: "June 2, 2023 • 8:30 PM",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    minPrice: 120,
    maxPrice: 450,
    isPremium: true,
  },
  {
    id: "3",
    title: "Hamilton",
    category: "theater",
    date: "May 20, 2023 • 7:30 PM",
    venue: "Pantages Theatre",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    minPrice: 89,
    maxPrice: 350,
    isLastMinute: true,
  },
  {
    id: "4",
    title: "Dave Chappelle Live",
    category: "comedy",
    date: "June 10, 2023 • 9:00 PM",
    venue: "Hollywood Bowl",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1525348371887-1c027c4c0e32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    minPrice: 75,
    maxPrice: 200,
    isPremium: false,
  },
  {
    id: "5",
    title: "The Weeknd - After Hours Tour",
    category: "concerts",
    date: "May 25, 2023 • 8:00 PM",
    venue: "Rose Bowl",
    location: "Pasadena, CA",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    minPrice: 150,
    maxPrice: 800,
    isPremium: true,
  },
  {
    id: "6",
    title: "Dodgers vs. Giants",
    category: "sports",
    date: "June 5, 2023 • 7:10 PM",
    venue: "Dodger Stadium",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80",
    minPrice: 60,
    maxPrice: 300,
    isLastMinute: true,
  },
];

const Events = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchQuery, setSearchQuery] = useState(queryParams.get("search") || "");
  const [locationQuery, setLocationQuery] = useState(queryParams.get("location") || "");
  const [category, setCategory] = useState(queryParams.get("category") || "all");
  const [dateFilter, setDateFilter] = useState("all");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(sampleEvents);
  const { location: detectedLocation, isLoading: locationLoading } = useGeolocation();

  // Set detected location as default when available
  useEffect(() => {
    if (detectedLocation && !locationQuery) {
      setLocationQuery(detectedLocation);
    }
  }, [detectedLocation, locationQuery]);
  
  // Apply filters when search parameters change
  useEffect(() => {
    let filtered = sampleEvents;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (category && category !== "all") {
      filtered = filtered.filter(event => event.category === category);
    }
    
    setFilteredEvents(filtered);
  }, [searchQuery, category]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (category !== "all") params.set("category", category);
    
    const newUrl = `${location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [searchQuery, category, location.pathname]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already handled by the useEffect
  };

  // Dynamic SEO based on search and filters
  const seoData = {
    ...seoConfigs.events,
    title: searchQuery 
      ? `${searchQuery} - Event Search Results | InSeats` 
      : category !== "all" 
        ? `${category.charAt(0).toUpperCase() + category.slice(1)} Events | InSeats`
        : seoConfigs.events.title,
    description: searchQuery
      ? `Find ${searchQuery} tickets and events. Premium tickets with secure checkout and instant delivery.`
      : category !== "all"
        ? `Browse ${category} events and find premium tickets. Secure checkout, instant delivery, and authentic tickets guaranteed.`
        : seoConfigs.events.description,
    keywords: searchQuery
      ? `${searchQuery} tickets, ${searchQuery} events, buy ${searchQuery} tickets online`
      : category !== "all"
        ? `${category} tickets, ${category} events, buy ${category} tickets online`
        : seoConfigs.events.keywords
  };

  useSEO(seoData);
  
  return (
    <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-20">
          {/* Gradient Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    Browsing Events Near {locationQuery || "Los Angeles, CA"}
                  </h1>
                </div>
                <div className="w-full lg:w-80">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <GooglePlacesAutocomplete
                      value={locationQuery}
                      onChange={(value) => setLocationQuery(value)}
                      placeholder={locationLoading ? "Detecting location..." : "Los Angeles, CA"}
                      className="pl-10 h-12 bg-white/90 backdrop-blur-sm border-white/20 text-gray-900 placeholder:text-gray-500"
                      disabled={locationLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
              {/* All Events Title */}
              <h2 className="text-2xl font-bold mb-6 text-gray-900">All Events</h2>
              
              {/* Filter Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Location Filter */}
                <div className="bg-gray-800 text-white rounded-lg p-4 flex items-center">
                  <div className="flex-1 min-w-0">
                    <GooglePlacesAutocomplete
                      value={locationQuery}
                      onChange={(value) => setLocationQuery(value)}
                      placeholder={locationLoading ? "Detecting location..." : "Los Angeles, CA"}
                      className="bg-transparent border-none text-white placeholder:text-gray-300 p-0 h-auto focus:ring-0"
                      disabled={locationLoading}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="bg-gray-800 text-white rounded-lg p-4">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-transparent border-none text-white p-0 h-auto focus:ring-0">
                      <div className="flex items-center w-full">
                        <Calendar className="h-5 w-5 text-orange-400 mr-3" />
                        <SelectValue placeholder="All Categories" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="concerts">Concerts</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="theater">Theater</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div className="bg-gray-800 text-white rounded-lg p-4">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="bg-transparent border-none text-white p-0 h-auto focus:ring-0">
                      <div className="flex items-center w-full">
                        <Calendar className="h-5 w-5 text-orange-400 mr-3" />
                        <SelectValue placeholder="All Dates" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search events, artists, venues..."
                    className="pl-12 h-14 bg-white border-gray-200 text-lg rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Results count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {filteredEvents.length} events
                </p>
              </div>
              
              {/* Results grid */}
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold mb-2">No events found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or filters to find more events.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setCategory('all');
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
    </div>
  );
};

export default Events;
