
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto container-padding">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-2xl font-bold">
                In<span className="text-gold-500">Seats</span>
              </span>
            </Link>
            <p className="text-white/70 mb-6">
              InSeats is your premium marketplace for last-minute and best-view tickets to concerts, sports, and theater events.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-gold-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-gold-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-gold-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-gold-500 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/events" className="text-white/70 hover:text-gold-500 transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-white/70 hover:text-gold-500 transition-colors">
                  Sell Tickets
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-white/70 hover:text-gold-500 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-white/70 hover:text-gold-500 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">About InSeats</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-white/70 hover:text-gold-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white/70 hover:text-gold-500 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/70 hover:text-gold-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-gold-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Stay Connected</h3>
            <p className="text-white/70 mb-4">
              Subscribe to get exclusive updates and offers
            </p>
            <div className="flex flex-col gap-3">
              <Input placeholder="Your email" className="bg-white/10 border-white/20" />
              <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                Subscribe
              </Button>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-white/70">
                <Mail size={16} />
                <span>support@inseats.com</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Phone size={16} />
                <span>+1 (888) 555-SEAT</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0">
            &copy; 2023 InSeats. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="text-white/50 hover:text-white text-sm">
              Terms
            </Link>
            <Link to="/privacy" className="text-white/50 hover:text-white text-sm">
              Privacy
            </Link>
            <Link to="/cookies" className="text-white/50 hover:text-white text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
