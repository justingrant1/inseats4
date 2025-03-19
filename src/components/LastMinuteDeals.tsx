
import { useEffect, useState } from "react";
import { Clock, ArrowRight, Ticket, CalendarClock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Event } from "./EventCard";

const MOCK_LAST_MINUTE: Event[] = [
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
    availableSeats: 15,
    seatAvailability: "selling-fast"
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
    availableSeats: 32,
    seatAvailability: "limited"
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
    availableSeats: 8,
    seatAvailability: "selling-fast"
  }
];

const LastMinuteDeals = () => {
  const [deals, setDeals] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with a small delay
    const timer = setTimeout(() => {
      try {
        setDeals(MOCK_LAST_MINUTE);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load last-minute deals");
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <section className="section-padding bg-zinc-50">
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
    <section className="section-padding bg-zinc-50">
      <div className="container mx-auto container-padding">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <div className="flex items-center mb-3">
              <Clock className="text-red-500 mr-2" />
              <h2 className="text-3xl md:text-4xl font-bold">Last-Minute Deals</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Great seats still available for today and tomorrow. Act fast before they're gone!
            </p>
          </div>
          <Link to="/events?filter=lastminute">
            <Button variant="ghost" className="mt-4 md:mt-0 group">
              View all deals 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="premium-card h-full relative">
                <div className="absolute top-0 left-0 w-full p-3 z-10">
                  <Skeleton className="h-8 w-32 rounded-full" />
                </div>
                <div className="aspect-video">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <div className="mt-4 flex items-center justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-10 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deals.map((deal) => (
              <div 
                key={deal.id} 
                className="block group"
              >
                <div className="premium-card relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-full p-3 z-10">
                    <div className="inline-block py-1 px-3 rounded-full bg-red-500 text-white text-sm font-medium">
                      Last Minute Deal
                    </div>
                  </div>
                  
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <div className="text-sm font-medium">{deal.category}</div>
                      <h3 className="text-xl font-bold">{deal.title}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex flex-col space-y-2 mb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarClock className="h-4 w-4 mr-1.5 text-red-500" />
                        <span>{deal.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1.5 text-red-500" />
                        <span>{deal.venue}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Starting at</span>
                        <div className="font-bold text-xl text-gold-500">
                          ${deal.minPrice}
                        </div>
                      </div>
                      
                      <Link to={`/events/${deal.id}`}>
                        <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                          <Ticket className="h-4 w-4 mr-2" /> Get Tickets
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LastMinuteDeals;
