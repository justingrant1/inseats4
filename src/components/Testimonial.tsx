
import { useEffect, useState } from "react";
import { Quote, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Testimonial data
const testimonials = [
  {
    quote: "I was able to get front-row tickets to see my favorite artist just hours before the show. InSeats saved my weekend with their last-minute premium seats!",
    author: "Sarah J.",
    title: "Concert Enthusiast",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    rating: 5
  },
  {
    quote: "The interactive seating chart was so helpful! I could see exactly where I'd be sitting and found the perfect view for a basketball game.",
    author: "Marcus T.",
    title: "Sports Fan",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    rating: 5
  },
  {
    quote: "As a theater lover, having access to premium seats without the typical markup made a Broadway show possible for my family. The mobile tickets were so convenient!",
    author: "Elena R.",
    title: "Theater Enthusiast",
    image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    rating: 4
  }
];

const Testimonial = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnimating) {
        handleNext();
      }
    }, 8000);
    
    return () => clearInterval(timer);
  }, [current, isAnimating]);
  
  const handlePrevious = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrent(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
    
    // Reset animation flag after animation completes
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  const handleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrent(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
    
    // Reset animation flag after animation completes
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  return (
    <section className="bg-gradient-to-b from-black to-zinc-900 text-white py-24">
      <div className="container mx-auto container-padding">
        <div className="max-w-5xl mx-auto">
          {/* Section title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What Our Customers Say</h2>
            <p className="text-white/70 max-w-3xl mx-auto">
              Thousands of fans have found their perfect seats through InSeats. Here's what they have to say about their experience.
            </p>
          </div>
          
          {/* Testimonial carousel */}
          <div className="relative premium-card bg-zinc-900/50 border border-white/10 p-8 md:p-12 rounded-xl">
            {/* Quote icon */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center shadow-lg">
                <Quote className="h-8 w-8 text-black" />
              </div>
            </div>
            
            {/* Testimonial content */}
            <div className="mt-8 relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${current * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div 
                      key={index} 
                      className="w-full flex-shrink-0 flex flex-col items-center text-center px-4"
                    >
                      {/* Star rating */}
                      <div className="flex items-center justify-center mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-400'}`} 
                          />
                        ))}
                      </div>
                      
                      {/* Quote */}
                      <blockquote className="mb-8">
                        <p className="text-xl md:text-2xl font-medium leading-relaxed md:leading-relaxed font-display">
                          "{testimonial.quote}"
                        </p>
                      </blockquote>
                      
                      {/* Author info */}
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-gold-500">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.author} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="ml-4 text-left">
                          <div className="text-lg font-bold">{testimonial.author}</div>
                          <div className="text-gold-500 text-sm">{testimonial.title}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation arrows */}
              <div className="flex justify-between items-center mt-8">
                <Button 
                  onClick={handlePrevious} 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Previous testimonial</span>
                </Button>
                
                {/* Indicator dots */}
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrent(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        current === index ? 'bg-gold-500' : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                
                <Button 
                  onClick={handleNext} 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowRight className="h-5 w-5" />
                  <span className="sr-only">Next testimonial</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
