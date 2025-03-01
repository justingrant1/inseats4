
import { Helmet } from "react-helmet";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedEvents from "@/components/FeaturedEvents";
import LastMinuteDeals from "@/components/LastMinuteDeals";
import HowItWorks from "@/components/HowItWorks";
import Testimonial from "@/components/Testimonial";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>InSeats | Premium Tickets to the Best Views</title>
        <meta 
          name="description" 
          content="InSeats is your marketplace for premium last-minute tickets to concerts, sports, and theater events. Find the best seats at the best prices." 
        />
        <meta 
          name="keywords" 
          content="premium tickets, last-minute concert tickets, premium sports seats, theater tickets, event tickets" 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <FeaturedEvents />
          <LastMinuteDeals />
          <HowItWorks />
          <Testimonial />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
