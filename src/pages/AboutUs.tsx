import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Users, Shield, Heart, Award, Mail, Phone } from "lucide-react";

const AboutUs = () => {
  const values = [
    {
      icon: <Shield className="h-8 w-8 text-gold-500" />,
      title: "Trust & Security",
      description: "Every ticket is verified and backed by our guarantee. Your purchase is protected from fraud and counterfeit tickets."
    },
    {
      icon: <Heart className="h-8 w-8 text-gold-500" />,
      title: "Customer First",
      description: "We're passionate about connecting fans with unforgettable experiences. Your satisfaction is our top priority."
    },
    {
      icon: <Award className="h-8 w-8 text-gold-500" />,
      title: "Premium Experience",
      description: "Access to the best seats and exclusive events. We curate premium experiences for discerning customers."
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Founder", 
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      description: "Former entertainment industry executive with 15 years of experience."
    },
    {
      name: "Michael Rodriguez",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Tech innovator specializing in secure marketplace platforms."
    },
    {
      name: "Emma Thompson",
      role: "Head of Customer Experience",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Customer service expert ensuring every interaction exceeds expectations."
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us | InSeats - Premium Ticket Marketplace</title>
        <meta 
          name="description" 
          content="Learn about InSeats, the premium marketplace for last-minute tickets to concerts, sports, and theater events. Our story, mission, and team." 
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
                  About InSeats
                </h1>
                <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed">
                  We're transforming how fans access premium entertainment experiences. 
                  From last-minute concert tickets to premium sports seats, we connect 
                  passionate fans with unforgettable moments.
                </p>
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section className="py-24 bg-zinc-50">
            <div className="container mx-auto container-padding">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                      Our Story
                    </h2>
                    <div className="space-y-4 text-lg text-zinc-600">
                      <p>
                        InSeats was born from a simple frustration: missing out on amazing events 
                        because we couldn't find premium tickets at the last minute. As entertainment 
                        enthusiasts ourselves, we knew there had to be a better way.
                      </p>
                      <p>
                        Founded in 2023, we set out to create a marketplace that prioritizes quality, 
                        security, and customer experience. We focus on premium seats and last-minute 
                        availability, helping fans secure incredible experiences even when events 
                        seem sold out.
                      </p>
                      <p>
                        Today, we're proud to serve thousands of customers, connecting them with 
                        their dream entertainment experiences across concerts, sports, theater, 
                        and exclusive events.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                      alt="Concert crowd" 
                      className="rounded-lg shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-24">
            <div className="container mx-auto container-padding">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Our Values
                </h2>
                <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
                  Everything we do is guided by these core principles that put our customers first.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {values.map((value, index) => (
                  <Card key={index} className="text-center border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center">
                          {value.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-4 font-display">
                        {value.title}
                      </h3>
                      <p className="text-zinc-600 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-24 bg-zinc-50">
            <div className="container mx-auto container-padding">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Meet Our Team
                </h2>
                <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
                  The passionate people behind InSeats, working to create exceptional experiences for every customer.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {team.map((member, index) => (
                  <Card key={index} className="text-center border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-2 font-display">
                        {member.name}
                      </h3>
                      <p className="text-gold-500 font-medium mb-4">
                        {member.role}
                      </p>
                      <p className="text-zinc-600">
                        {member.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="py-24 bg-black text-white">
            <div className="container mx-auto container-padding">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                  Get In Touch
                </h2>
                <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                  Have questions about our platform or need help finding the perfect tickets? 
                  We're here to help.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gold-500" />
                    <span>sales@inseats.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gold-500" />
                    <span>917-698-0202</span>
                  </div>
                </div>
                
                <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
                  Contact Support
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
