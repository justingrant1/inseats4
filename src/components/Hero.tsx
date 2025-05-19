
import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Ticket, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showTrending, setShowTrending] = useState(false);
  const navigate = useNavigate();
  
  // Popular searches that could be fetched from an API in a real app
  const trendingSearches = [
    "Taylor Swift", 
    "NBA Playoffs", 
    "Hamilton", 
    "Coldplay", 
    "Broadway Shows"
  ];
  
  // Close trending suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowTrending(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || category !== "all") {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}&category=${category}`);
    }
  };
  
  const handleTrendingClick = (trend: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling to document
    setSearchQuery(trend);
    setShowTrending(false);
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center hero-gradient">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[10%] right-[15%] w-80 h-80 bg-gold-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-slide-in">
            <span className="inline-block py-1 px-3 rounded-full bg-gold-500/20 text-gold-500 text-sm font-medium mb-6 backdrop-blur-sm">
              Premium Seating Marketplace
            </span>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Your Ticket to the 
              <span className="bg-clip-text text-transparent gold-gradient block md:ml-2 md:inline-block">
                Best Views
              </span>
            </h1>
            
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Experience events from the best seats in the house. Find last-minute premium tickets for concerts, sports, and theater events.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-lg max-w-3xl mx-auto animate-fade-in delay-300 border border-white/20">
            <form 
              action="https://formspree.io/f/mqaqgwjg"
              method="POST"
              onSubmit={(e) => {
                e.preventDefault();
                
                // Search validation and navigation
                if (searchQuery.trim() || category !== "all") {
                  // We'll let Formspree handle the form submission naturally
                  // And navigate to the search results page
                  setTimeout(() => {
                    navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}&category=${category}`);
                  }, 300); // Small delay to ensure form submission starts
                } else {
                  e.preventDefault(); // Prevent form submission if empty search
                }
              }}
              className="flex flex-col md:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <Input
                  type="text"
                  placeholder="Search events, artists, teams..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTrending(true);
                  }}
                  aria-label="Search for events"
                />
                
                {/* Trending searches dropdown */}
                {showTrending && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/20 rounded-md overflow-hidden z-50 shadow-xl">
                    <div className="p-2 border-b border-white/10 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-gold-500" />
                      <span className="text-white/80 text-sm font-medium">Trending Searches</span>
                    </div>
                    <ul>
                      {trendingSearches.map((trend, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            onClick={(e) => handleTrendingClick(trend, e)}
                            className="w-full text-left px-4 py-2 text-white/80 hover:bg-white/10 flex items-center"
                          >
                            <Search className="h-3.5 w-3.5 mr-2 text-white/50" />
                            {trend}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-48">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-12">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gold-500" />
                      <SelectValue placeholder="Category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/20">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="concerts">Concerts</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="theater">Theater</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <input type="hidden" name="form_type" value="event_search" />
              <Button 
                type="submit" 
                className="bg-gold-500 hover:bg-gold-600 text-black h-12 transition-colors font-medium"
              >
                <Ticket className="h-4 w-4 mr-2" /> Find Seats
              </Button>
            </form>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/80 text-sm animate-fade-in delay-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-gold-500" />
              <span>Last-minute deals</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-gold-500" />
              <span>Best seats guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
