
import { ArrowRight, TicketIcon, Users, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

// Stats
const stats = [
  { icon: Users, value: "20K+", label: "Happy Customers" },
  { icon: TicketIcon, value: "50K+", label: "Tickets Sold" },
  { icon: Calendar, value: "500+", label: "Events" }
];

const CallToAction = () => {
  const [email, setEmail] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would handle subscription logic here
    toast({
      title: "Thanks for signing up!",
      description: "We'll keep you updated on the latest events.",
    });
    setEmail("");
  };
  
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-600 via-gold-500 to-gold-400 opacity-90"></div>
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
      <div className="container mx-auto container-padding relative z-10">
        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/30 text-black"
            >
              <stat.icon className="h-8 w-8 mb-3" />
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-black/80">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
                Ready to Experience Events From the Best Seats?
              </h2>
              <p className="text-black/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of event-goers who have discovered the thrill of premium seating through InSeats.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/events">
                <Button size="lg" className="bg-black hover:bg-black/90 text-white text-base font-medium h-14 px-8">
                  Browse Events <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-black text-black hover:bg-black/10 text-base font-medium h-14 px-8"
                >
                  Sell Your Tickets
                </Button>
              </Link>
            </div>
            
            {/* Newsletter signup */}
            <div className="mt-8 pt-8 border-t border-black/10">
              <p className="text-center font-medium text-black mb-6">
                Stay updated with the latest events and exclusive offers
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-white/50 border-0 focus-visible:ring-2 focus-visible:ring-black text-black placeholder:text-black/50 text-base"
                  />
                </div>
                <Button type="submit" className="bg-black hover:bg-black/90 text-white h-12">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
