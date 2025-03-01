
import { Search, CreditCard, Check, Heart } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Event",
    description: "Search for events by artist, team, venue, or city. Filter results to find the perfect seats.",
    color: "bg-blue-500"
  },
  {
    icon: Heart,
    title: "Select Premium Seats",
    description: "Browse interactive seating charts and choose the best available seats for your budget.",
    color: "bg-gold-500"
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description: "Pay securely through our platform with various payment options and receive instant confirmation.",
    color: "bg-green-500"
  },
  {
    icon: Check,
    title: "Attend Your Event",
    description: "Receive your tickets electronically and enjoy the event from the best seats in the house.",
    color: "bg-purple-500"
  }
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto container-padding">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How InSeats Works</h2>
          <p className="text-muted-foreground">
            Finding and securing premium tickets has never been easier. Our streamlined process ensures you get the best seats without the hassle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-6 text-white`}>
                <step.icon size={28} />
              </div>
              <div className="relative mb-6 h-6 w-full hidden lg:block">
                {index < steps.length - 1 && (
                  <div className="absolute top-2 left-1/2 w-full h-0.5 bg-gray-200">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-200 rotate-45"></div>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
