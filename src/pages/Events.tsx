
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Events = () => {
  return (
    <>
      <Helmet>
        <title>All Events | InSeats</title>
        <meta 
          name="description" 
          content="Browse and search for premium tickets to concerts, sports events, and theater performances." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-12 px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Browse Events</h1>
          
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-6">
              We're working on adding more events. Check back soon!
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Events;
