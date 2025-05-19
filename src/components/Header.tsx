
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, TicketIcon, ShoppingCart, User, Bell, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type OrderWithWebhookData = Database['public']['Tables']['orders']['Row'];
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Mock cart count - in a real app this would come from context or state management
  useEffect(() => {
    // Simulate retrieving cart count from localStorage or context
    setCartCount(Math.floor(Math.random() * 3));
  }, []);
  
  // Fetch webhook notifications when user is logged in
  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }
    
    async function fetchNotificationCount() {
      try {
        // Query orders with unread webhook notifications
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .not('last_webhook_status', 'is', null)
          .eq('notification_sent', false);
          
        if (error) {
          throw error;
        }
        
        setNotificationCount(data?.length || 0);
      } catch (error: any) {
        console.error('Error fetching notification count:', error.message);
      }
    }
    
    // Initial fetch
    fetchNotificationCount();
    
    // Set up a polling interval to check for new notifications
    const intervalId = setInterval(fetchNotificationCount, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);
  
  // Change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-sm' 
        : 'bg-white/80 backdrop-blur-md border-b border-zinc-200'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-xl md:text-2xl font-display font-bold text-blue-600">
            In<span className="text-gold-500">Seats</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className={`px-4 py-2 rounded-md text-sm font-medium ${location.pathname === '/' ? 'text-gold-500' : 'text-foreground hover:text-gold-500'}`}>
            Home
          </Link>
          <Link to="/events" className={`px-4 py-2 rounded-md text-sm font-medium ${location.pathname === '/events' || location.pathname.startsWith('/events/') ? 'text-gold-500' : 'text-foreground hover:text-gold-500'}`}>
            Events
          </Link>
          <Link to="/sell" className={`ml-2 px-4 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/sell' ? 'text-gold-500' : 'text-foreground hover:text-gold-500'}`}>
            <TicketIcon className="mr-1 h-4 w-4" />
            Sell Tickets
          </Link>
          
          {/* Cart icon with badge */}
          <div 
            onClick={() => {
              if (cartCount > 0) {
                // Mock checkout data for demonstration
                const mockCheckoutData = {
                  eventId: "sample-event-1",
                  eventTitle: "Sample Event",
                  tierName: "VIP",
                  tierPrice: 149.99,
                  quantity: cartCount,
                  totalPrice: 149.99 * cartCount * 1.1 // Add 10% service fee
                };
                
                navigate("/checkout", { state: mockCheckoutData });
              } else {
                toast({
                  title: "Your cart is empty",
                  description: "Browse our events to find tickets",
                  variant: "default",
                });
              }
            }}
            className="ml-4 relative cursor-pointer" 
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5 text-foreground hover:text-gold-500" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          
          {/* User dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="ml-4" variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user.email?.split('@')[0] || 'My Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-tickets')}>
                  <TicketIcon className="h-4 w-4 mr-2" />
                  My Tickets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/notifications')} className="relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {notificationCount > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              className="ml-4" 
              variant="default" 
              size="sm"
              onClick={() => navigate('/login')}
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-4">
          <div
            onClick={() => {
              if (cartCount > 0) {
                // Mock checkout data for demonstration
                const mockCheckoutData = {
                  eventId: "sample-event-1",
                  eventTitle: "Sample Event",
                  tierName: "VIP",
                  tierPrice: 149.99,
                  quantity: cartCount,
                  totalPrice: 149.99 * cartCount * 1.1 // Add 10% service fee
                };
                
                navigate("/checkout", { state: mockCheckoutData });
              } else {
                toast({
                  title: "Your cart is empty",
                  description: "Browse our events to find tickets",
                  variant: "default",
                });
              }
            }}
            className="relative cursor-pointer"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5 text-foreground hover:text-gold-500" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <button
            className="p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              to="/"
              className={`px-4 py-3 rounded-md text-base font-medium ${location.pathname === '/' ? 'bg-secondary text-gold-500' : 'text-foreground'}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-4 py-3 rounded-md text-base font-medium ${location.pathname === '/events' || location.pathname.startsWith('/events/') ? 'bg-secondary text-gold-500' : 'text-foreground'}`}
              onClick={() => setIsOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/sell"
              className={`px-4 py-3 rounded-md text-base font-medium flex items-center ${location.pathname === '/sell' ? 'bg-secondary text-gold-500' : 'text-foreground'}`}
              onClick={() => setIsOpen(false)}
            >
              <TicketIcon className="mr-2 h-5 w-5" />
              Sell Tickets
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-3 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </Link>
                <Link
                  to="/my-tickets"
                  className="px-4 py-3 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <TicketIcon className="mr-2 h-5 w-5" />
                  My Tickets
                </Link>
                <Link
                  to="/notifications"
                  className="px-4 py-3 rounded-md text-base font-medium flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Notifications
                  </div>
                  {notificationCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 rounded-md">
                <Button 
                  className="flex-1" 
                  variant="default" 
                  size="default"
                  onClick={() => navigate('/login')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline" 
                  size="default"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
