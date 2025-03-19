
import { useEffect, useState } from "react";
import { ArrowRight, Filter, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard, { Event, SeatAvailability } from "./EventCard";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

// Updated events with future dates and availability information
const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Taylor Swift | The Eras Tour",
    category: "Concerts",
    date: "May 15, 2025 • 8:00 PM",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 299,
    maxPrice: 1500,
    isPremium: true,
    isLastMinute: true,
    availableSeats: 12,
    seatAvailability: "selling-fast"
  },
  {
    id: "2",
    title: "Lakers vs. Warriors - Western Conference Finals",
    category: "Sports",
    date: "June 2, 2025 • 7:30 PM",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 199,
    maxPrice: 2500,
    isPremium: true,
    availableSeats: 65,
    seatAvailability: "available"
  },
  {
    id: "3",
    title: "Hamilton - Broadway Musical",
    category: "Theater",
    date: "May 20, 2025 • 7:00 PM",
    venue: "Richard Rodgers Theatre",
    location: "New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 129,
    maxPrice: 899,
    isLastMinute: true,
    availableSeats: 28,
    seatAvailability: "limited"
  },
  {
    id: "4",
    title: "Coldplay - Music of the Spheres Tour",
    category: "Concerts",
    date: "May 25, 2025 • 8:00 PM",
    venue: "Wembley Stadium",
    location: "London, UK",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 150,
    maxPrice: 800,
    isPremium: true,
    availableSeats: 95,
    seatAvailability: "available"
  },
];

// All unique categories in the events
const categories = ["All", ...new Set(MOCK_EVENTS.map(event => event.category))];

const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    // Simulate API call with a small delay
    const timer = setTimeout(() => {
      try {
        setEvents(MOCK_EVENTS);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);
  
  // Filter events when category changes
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === selectedCategory));
    }
  }, [selectedCategory, events]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  if (error) {
    return (
      <section className="section-padding bg-white">
        <div className="container mx-auto container-padding">
          <div className="text-center py-12">
            <div className="mb-4 text-red-500">
              <Ticket className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">{error}</h2>
            </div>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto container-padding">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Featured Events</h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover premium seating options for the most anticipated events. Last-minute deals available now.
            </p>
          </div>
          <Link to="/events">
            <Button variant="ghost" className="mt-4 md:mt-0 group">
              View all events 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        {/* Category filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <div className="flex items-center mr-2">
            <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          {categories.map(category => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedCategory === category 
                  ? "bg-primary hover:bg-primary/90" 
                  : "hover:bg-secondary"
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="premium-card h-full flex flex-col">
                <div className="relative overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <div className="absolute top-0 left-0 p-3 flex gap-2">
                    {i % 2 === 0 && <Skeleton className="h-6 w-24 rounded-full" />}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No events found in this category.</p>
            <Button variant="outline" onClick={() => setSelectedCategory("All")}>
              Show all events
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => (
              <EventCard 
                key={event.id} 
                event={event} 
                featured={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
