
import { Search, CreditCard, Check, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Search,
    title: "Find Your Event",
    description: "Search for events by artist, team, venue, or city. Filter results to find the perfect seats.",
    color: "bg-blue-500",
    lightColor: "bg-blue-100"
  },
  {
    icon: Heart,
    title: "Select Premium Seats",
    description: "Browse interactive seating charts and choose the best available seats for your budget.",
    color: "bg-gold-500",
    lightColor: "bg-amber-100"
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description: "Pay securely through our platform with various payment options and receive instant confirmation.",
    color: "bg-green-500",
    lightColor: "bg-green-100"
  },
  {
    icon: Check,
    title: "Attend Your Event",
    description: "Receive your tickets electronically and enjoy the event from the best seats in the house.",
    color: "bg-purple-500",
    lightColor: "bg-purple-100"
  }
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-white" id="how-it-works">
      <div className="container mx-auto container-padding">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How InSeats Works</h2>
          <p className="text-muted-foreground">
            Finding and securing premium tickets has never been easier. Our streamlined process ensures you get the best seats without the hassle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center premium-card p-6 transition-all hover:shadow-lg"
            >
              <div className={`relative w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-6 text-white`}>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <step.icon size={28} aria-hidden="true" />
              </div>
              
              {/* Connection between steps on desktop */}
              <div className="relative mb-6 h-6 w-full hidden lg:block">
                {index < steps.length - 1 && (
                  <div className="absolute top-3 left-1/2 w-full h-0.5 bg-gray-200">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 rotate-45">
                      <ArrowRight className="text-gray-300" size={16} />
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              
              {/* Feature Highlight */}
              <div className={`mt-4 rounded-md py-2 px-3 text-sm ${step.lightColor} text-gray-800 w-full`}>
                <span className="font-medium">Pro Tip:</span> {index === 0 ? "Use filters to narrow down your search" : 
                       index === 1 ? "Compare different seating sections" :
                       index === 2 ? "Save payment methods for faster checkout" :
                       "Mobile tickets can be added to your digital wallet"}
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="text-center">
          <Link to="/events">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Browse Events Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
