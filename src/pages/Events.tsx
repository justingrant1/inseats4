
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Filter, Search, Calendar } from "lucide-react";

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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSEO, seoConfigs } from "@/hooks/useSEO";

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
  const [category, setCategory] = useState(queryParams.get("category") || "all");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(sampleEvents);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
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
        
        <main className="flex-1 bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            {/* Search and filters */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6">
                {searchQuery 
                  ? `Search results for "${searchQuery}"` 
                  : "Browse Events"}
              </h1>
              
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search events, artists, venues..."
                      className="pl-10 border-gray-300 focus:border-blue-500 h-12"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="w-full md:w-48">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12 border-gray-300">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                          <SelectValue placeholder="Category" />
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
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                    className="md:hidden h-12"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Mobile Filters */}
            {isMobileFilterOpen && (
              <div className="md:hidden mb-6">
                <Accordion type="single" collapsible className="bg-white rounded-lg border shadow-sm">
                  <AccordionItem value="price">
                    <AccordionTrigger className="px-4">Price Range</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {/* Price range controls would go here */}
                      <p className="text-muted-foreground">Price filter controls</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="date">
                    <AccordionTrigger className="px-4">Date</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {/* Date filter controls would go here */}
                      <p className="text-muted-foreground">Date filter controls</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
            
            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
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
        </main>
        
        <Footer />
    </div>
  );
};

export default Events;
