
import { Quote } from "lucide-react";

const Testimonial = () => {
  return (
    <section className="bg-black text-white py-24">
      <div className="container mx-auto container-padding">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center">
              <Quote className="h-8 w-8 text-gold-500" />
            </div>
          </div>
          
          <blockquote className="mb-10">
            <p className="text-2xl md:text-3xl font-medium leading-relaxed font-display">
              "I was able to get front-row tickets to see my favorite artist just hours before the show. InSeats saved my weekend with their last-minute premium seats!"
            </p>
          </blockquote>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 mb-4 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
                alt="Sarah J." 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-lg font-bold">Sarah J.</div>
            <div className="text-gold-500">Concert Enthusiast</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
