
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SellTickets = () => {
  const [eventDetails, setEventDetails] = useState({
    eventName: "",
    eventDate: "",
    eventLocation: "",
    ticketPrice: "",
    ticketQuantity: ""
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEventDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!eventDetails.eventName || !eventDetails.eventDate || 
        !eventDetails.eventLocation || !eventDetails.ticketPrice || 
        !eventDetails.ticketQuantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all the required fields",
        variant: "destructive"
      });
      return;
    }

    // Form is valid, show success message
    toast({
      title: "Listing created!",
      description: "Your tickets have been listed for sale.",
    });
    
    // Reset form
    setEventDetails({
      eventName: "",
      eventDate: "",
      eventLocation: "",
      ticketPrice: "",
      ticketQuantity: ""
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Sell Your Tickets</h1>
        <p className="text-xl text-muted-foreground">List your tickets and connect with buyers</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="h-10 w-10 rounded-full bg-gold-500/20 flex items-center justify-center">
            <TicketIcon className="h-5 w-5 text-gold-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Event Information</h2>
            <p className="text-muted-foreground">Enter the details of your tickets</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="eventName" className="text-sm font-medium">
                Event Name*
              </label>
              <Input 
                id="eventName"
                name="eventName"
                placeholder="e.g. Taylor Swift Concert"
                value={eventDetails.eventName}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="eventDate" className="text-sm font-medium">
                Event Date*
              </label>
              <Input 
                id="eventDate" 
                name="eventDate"
                type="date"
                value={eventDetails.eventDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="eventLocation" className="text-sm font-medium">
                Event Location*
              </label>
              <Input 
                id="eventLocation"
                name="eventLocation"
                placeholder="e.g. SoFi Stadium, Los Angeles"
                value={eventDetails.eventLocation}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="ticketPrice" className="text-sm font-medium">
                Price per Ticket ($)*
              </label>
              <Input 
                id="ticketPrice"
                name="ticketPrice"
                type="number"
                min="0"
                placeholder="e.g. 150"
                value={eventDetails.ticketPrice}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="ticketQuantity" className="text-sm font-medium">
                Number of Tickets*
              </label>
              <Input 
                id="ticketQuantity"
                name="ticketQuantity"
                type="number"
                min="1"
                placeholder="e.g. 2"
                value={eventDetails.ticketQuantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button type="submit" className="w-full sm:w-auto">
              List Tickets for Sale
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-10 bg-muted rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Fill out the ticket information completely and accurately</li>
          <li>Set a competitive price based on similar tickets</li>
          <li>Once listed, buyers can contact you through our secure messaging system</li>
          <li>Complete the sale through our secure payment platform</li>
          <li>Transfer the tickets to the buyer via the platform</li>
        </ol>
      </div>
    </div>
  );
};

export default SellTickets;
