
import { CalendarClock, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Event, SeatAvailability } from "@/types";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard = ({ event, featured = false }: EventCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const {
    id,
    title,
    category,
    date,
    venue,
    location,
    imageUrl,
    minPrice,
    isPremium,
    isLastMinute,
    availableSeats = Math.floor(Math.random() * 50) + 5, // Fallback random number if not provided
    seatAvailability = "available"
  } = event;

  return (
    <Link 
      to={`/events/${id}`} 
      className="block group" 
      aria-labelledby={`event-${id}-title`}
    >
      <div
        className={`premium-card h-full flex flex-col ${
          featured ? "border-gold-500/50" : "border-transparent"
        }`}
      >
        <div className="relative overflow-hidden">
          <div className="aspect-video bg-muted overflow-hidden relative">
            <img
              src={imageUrl}
              alt=""
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              aria-hidden="true"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Tags */}
          <div className="absolute top-0 left-0 p-3 flex gap-2">
            {isLastMinute && (
              <Badge variant="outline" className="bg-red-500 text-white border-none">
                Last Minute
              </Badge>
            )}
            {isPremium && (
              <Badge variant="outline" className="bg-gold-500 text-black border-none">
                <Star className="h-3 w-3 mr-1 fill-black" /> Premium
              </Badge>
            )}
          </div>

          {/* Category */}
          <div className="absolute bottom-0 right-0 p-3">
            <Badge variant="outline" className="bg-black/70 text-white border-none">
              {category}
            </Badge>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 id={`event-${id}-title`} className="font-bold text-lg line-clamp-2 group-hover:text-gold-500 transition-colors">
            {title}
          </h3>

          <div className="mt-2 space-y-1 flex-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4 mr-2 text-gold-500" />
              <span>{date}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-gold-500" />
              <span>
                {venue}, {location}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="font-bold text-lg">
              From ${minPrice}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full flex items-center ${
              seatAvailability === 'limited' ? 'bg-amber-100 text-amber-700' :
              seatAvailability === 'selling-fast' ? 'bg-red-100 text-red-700' :
              'bg-secondary text-secondary-foreground'
            }`}>
              <Users className="h-3 w-3 mr-1.5" />
              {seatAvailability === 'limited' ? 'Limited Seats' : 
               seatAvailability === 'selling-fast' ? 'Selling Fast' : 
               `${availableSeats}+ Available`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
