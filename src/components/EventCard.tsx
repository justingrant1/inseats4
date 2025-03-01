
import { CalendarClock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export type Event = {
  id: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  location: string;
  imageUrl: string;
  minPrice: number;
  maxPrice: number;
  isPremium?: boolean;
  isLastMinute?: boolean;
};

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard = ({ event, featured = false }: EventCardProps) => {
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
  } = event;

  return (
    <Link to={`/events/${id}`} className="block group">
      <div
        className={`premium-card h-full flex flex-col ${
          featured ? "border-gold-500/50" : "border-transparent"
        }`}
      >
        <div className="relative overflow-hidden">
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
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
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-gold-500 transition-colors">
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
            <span className="text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
              Available Seats
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
