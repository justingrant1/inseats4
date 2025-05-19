import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketIcon, Calendar, MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MyTickets() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes("API key")) {
            console.error("Supabase API key error:", error);
            setLoading(false);
            return;
          }
          throw error;
        }
        
        if (!data.session) {
          navigate("/login");
          return;
        }
        
        setUser(data.session.user);
        fetchTickets(data.session.user.id);
      } catch (error: any) {
        console.error("Error getting session:", error.message);
      }
    }

    getSession();
  }, [navigate]);

  async function fetchTickets(userId: string) {
    try {
      setLoading(true);
      
      // Get orders for this user
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          ticket_id,
          quantity,
          total_price,
          status,
          created_at,
          tickets(
            id,
            tier_name,
            section,
            row,
            seat,
            price,
            event_id,
            events(
              id,
              title,
              venue,
              location,
              date,
              image_url
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (ordersError) throw ordersError;
      
      setTickets(orders || []);
    } catch (error: any) {
      console.error("Error fetching tickets:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Format date function for display
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
      
      {loading ? (
        <div className="text-center py-10">Loading your tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No tickets found</h3>
          <p className="text-gray-500 mb-6">You haven't purchased any tickets yet.</p>
          <Button onClick={() => navigate("/events")}>Browse Events</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((order) => {
            const ticket = order.tickets;
            const event = ticket?.events;
            
            return (
              <Card key={order.id} className="overflow-hidden">
                {event?.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{event?.title || "Unknown Event"}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event?.venue}, {event?.location}
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {event?.date ? formatDate(event.date) : "Date TBD"}
                    </div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Ticket Type:</span>
                        <span className="text-sm">{ticket?.tier_name || "General Admission"}</span>
                      </div>
                      
                      {ticket?.section && (
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Section:</span>
                          <span className="text-sm">{ticket.section}</span>
                        </div>
                      )}
                      
                      {ticket?.row && (
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Row:</span>
                          <span className="text-sm">{ticket.row}</span>
                        </div>
                      )}
                      
                      {ticket?.seat && (
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Seat:</span>
                          <span className="text-sm">{ticket.seat}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Quantity:</span>
                        <span className="text-sm">{order.quantity}</span>
                      </div>
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Order Date:</span>
                        <span className="text-sm">{formatDate(order.created_at)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <span className={`text-sm ${
                          order.status === "completed" 
                            ? "text-green-600" 
                            : order.status === "pending" 
                            ? "text-yellow-600" 
                            : "text-red-600"
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {order.status === "completed" && (
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => navigate(`/tickets/${order.id}`)}
                        >
                          <TicketIcon className="h-4 w-4 mr-2" />
                          Electronic Tickets
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
