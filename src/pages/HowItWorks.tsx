import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Search, CreditCard, Ticket, Shield, Clock, Star, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8 text-gold-500" />,
      title: "Browse Premium Events",
      description: "Discover concerts, sports events, theater shows, and exclusive experiences. Use our advanced filters to find exactly what you're looking for.",
      details: [
        "Filter by location, date, and category",
        "See real-time availability",
        "Compare prices across different sections"
      ]
    },
    {
      icon: <Ticket className="h-8 w-8 text-gold-500" />,
      title: "Select Your Perfect Seats",
      description: "Choose from tiered pricing or browse individual seat listings. Our interactive seat maps help you find the best views.",
      details: [
        "View detailed seat maps",
        "See photos from actual seats",
        "Choose between different pricing tiers"
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8 text-gold-500" />,
      title: "Secure Checkout",
      description: "Complete your purchase with confidence using our secure payment system. All transactions are protected and encrypted.",
      details: [
        "Multiple payment options accepted",
        "SSL encryption for security",
        "Instant purchase confirmation"
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-gold-500" />,
      title: "Get Your Tickets",
      description: "Receive your verified tickets instantly via email or mobile delivery. Every ticket is guaranteed authentic.",
      details: [
        "Instant digital delivery",
        "Mobile-friendly ticket format",
        "100% authenticity guarantee"
      ]
    }
  ];

  const features = [
    {
      icon: <Clock className="h-6 w-6 text-gold-500" />,
      title: "Last-Minute Deals",
      description: "Find premium seats at great prices, even hours before showtime."
    },
    {
      icon: <Shield className="h-6 w-6 text-gold-500" />,
      title: "Verified Sellers",
      description: "All sellers are vetted and verified for your peace of mind."
    },
    {
      icon: <Star className="h-6 w-6 text-gold-500" />,
      title: "Premium Experience",
      description: "Access to VIP sections and exclusive seating options."
    }
  ];

  const sellingSteps = [
    {
      step: "1",
      title: "List Your Tickets",
      description: "Upload your tickets and set your price. Our platform makes listing easy and secure."
    },
    {
      step: "2", 
      title: "We Verify",
      description: "Our team verifies the authenticity of your tickets to protect buyers."
    },
    {
      step: "3",
      title: "Get Paid",
      description: "Receive payment as soon as your tickets sell. Fast, secure, hassle-free."
    }
  ];

  return (
    <>
      <Helmet>
        <title>How It Works | InSeats - Premium Ticket Marketplace</title>
        <meta 
          name="description" 
          content="Learn how InSeats works - from browsing premium events to secure ticket delivery. Simple, safe, and reliable ticket marketplace." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-zinc-900 to-black text-white py-24">
            <div className="container mx-auto container-padding">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
                  How InSeats Works
                </h1>
                <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed">
                  Getting premium tickets to your favorite events has never been easier. 
                  Follow these simple steps to secure your perfect seats.
                </p>
              </div>
            </div>
          </section>

          {/* How to Buy Section */}
          <section className="py-24">
            <div className="container mx-auto container-padding">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Buying Tickets
                </h2>
                <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
                  From browsing to enjoying your event, here's how easy it is to get premium tickets.
                </p>
              </div>
              
              <div className="space-y-16">
                {steps.map((step, index) => (
                  <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                    <div className={`${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mr-4">
                          {step.icon}
                        </div>
                        <div className="text-3xl font-bold text-zinc-300">
                          0{index + 1}
                        </div>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 font-display">
                        {step.title}
                      </h3>
                      <p className="text-lg text-zinc-600 mb-6 leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-zinc-600">
                            <ArrowRight className="h-4 w-4 text-gold-500 mr-2" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                      <div className="bg-gradient-to-br from-gold-500/10 to-zinc-100 rounded-lg p-8 h-64 flex items-center justify-center">
                        <div className="text-6xl opacity-20">
                          {step.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-zinc-50">
            <div className="container mx-auto container-padding">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Why Choose InSeats?
                </h2>
                <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
                  We're more than just a ticket marketplace. Here's what makes us different.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="text-center border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-4 font-display">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Selling Section */}
          <section className="py-24">
            <div className="container mx-auto container-padding">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Selling Tickets
                </h2>
                <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
                  Got tickets you can't use? Turn them into cash with our simple selling process.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {sellingSteps.map((step, index) => (
                  <Card key={index} className="text-center border-0 shadow-lg relative">
                    <CardContent className="p-8">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 rounded-full bg-gold-500 text-black font-bold flex items-center justify-center text-lg">
                          {step.step}
                        </div>
                      </div>
                      <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4 font-display">
                          {step.title}
                        </h3>
                        <p className="text-zinc-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
                  Start Selling Your Tickets
                </Button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-24 bg-zinc-50">
            <div className="container mx-auto container-padding">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Frequently Asked Questions
                </h2>
              </div>
              
              <div className="max-w-3xl mx-auto space-y-8">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">Are all tickets guaranteed authentic?</h3>
                    <p className="text-zinc-600">Yes, every ticket sold on InSeats is verified for authenticity. We have a 100% guarantee policy.</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">How quickly will I receive my tickets?</h3>
                    <p className="text-zinc-600">Most tickets are delivered instantly via email or mobile app. For physical tickets, we ensure delivery well before the event.</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">What if my event is cancelled?</h3>
                    <p className="text-zinc-600">In case of event cancellation, you'll receive a full refund automatically. We monitor all events for any changes.</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">Can I sell tickets at any price?</h3>
                    <p className="text-zinc-600">You can set your own price, but we recommend competitive pricing for faster sales. Our platform provides pricing guidance.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-black text-white">
            <div className="container mx-auto container-padding">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who've found their perfect seats through InSeats.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
                    Browse Events
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                    Sell Your Tickets
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HowItWorks;
