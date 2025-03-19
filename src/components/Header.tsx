
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, TicketIcon, ShoppingCart, User, Search, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
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
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Mock cart count - in a real app this would come from context or state management
  useEffect(() => {
    // Simulate retrieving cart count from localStorage or context
    setCartCount(Math.floor(Math.random() * 3));
  }, []);
  
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
          <Link to="/checkout" className="ml-4 relative" aria-label="Shopping cart">
            <ShoppingCart className="h-5 w-5 text-foreground hover:text-gold-500" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-4" variant="default" size="sm">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TicketIcon className="h-4 w-4 mr-2" />
                My Tickets
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/checkout" className="relative" aria-label="Shopping cart">
            <ShoppingCart className="h-5 w-5 text-foreground hover:text-gold-500" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
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
            <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 rounded-md">
              <Button className="flex-1" variant="default" size="default">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button className="flex-1" variant="outline" size="default">
                Register
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
