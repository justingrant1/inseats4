
import { useState, useEffect } from "react";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-md shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-white">
            In<span className="text-blue-400">Seats</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-white/90 hover:text-white transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            to="/events"
            className="text-white/90 hover:text-white transition-colors font-medium"
          >
            Events
          </Link>
          <Link
            to="/sell"
            className="text-white/90 hover:text-white transition-colors font-medium"
          >
            Sell Tickets
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/account">
            <Button variant="ghost" size="icon" className="text-white/90 hover:text-white">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/cart">
            <Button
              className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-medium"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              to="/"
              className="text-white/90 hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/events"
              className="text-white/90 hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/sell"
              className="text-white/90 hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sell Tickets
            </Link>
            <Link
              to="/account"
              className="text-white/90 hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Account
            </Link>
            <Link
              to="/cart"
              className="text-white/90 hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cart
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
