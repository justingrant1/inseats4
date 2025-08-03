
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedEvents from "@/components/FeaturedEvents";
import LastMinuteDeals from "@/components/LastMinuteDeals";
import HowItWorks from "@/components/HowItWorks";
import Testimonial from "@/components/Testimonial";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { useSEO, seoConfigs } from "@/hooks/useSEO";

const Index = () => {
  useSEO(seoConfigs.home);

  return (
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
  );
};

export default Index;
