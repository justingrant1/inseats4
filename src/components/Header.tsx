
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, TicketIcon } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMobile();
  const location = useLocation();
  
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-xl md:text-2xl font-display font-bold">EventCast</span>
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
          <Button className="ml-4" variant="default" size="sm">
            Sign In
          </Button>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100">
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
            <Button className="mt-2" variant="default" size="default">
              Sign In
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
