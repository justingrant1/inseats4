
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-gold-500 to-gold-400 text-black">
      <div className="container mx-auto container-padding">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Events From the Best Seats?
          </h2>
          <p className="text-black/80 text-lg mb-8">
            Join thousands of event-goers who have discovered the thrill of premium seating through InSeats.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button size="lg" className="bg-black hover:bg-black/90 text-white">
                Browse Events <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/sell">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-black text-black hover:bg-black/10"
              >
                Sell Your Tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
