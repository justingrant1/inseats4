import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ElectronicTicketViewer } from "@/components/ElectronicTicket";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useElectronicTickets } from "@/lib/ticketvault";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Ticket, Download, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ElectronicTicketsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Fetch electronic tickets using the hook from ticketvault.ts
  const { 
    data: tickets, 
    isLoading, 
    isError, 
    error 
  } = useElectronicTickets(orderId || null);
  
  // Fetch order details from Supabase
  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            user_email,
            user_name,
            ticket_id,
            quantity,
            total_price,
            status,
            created_at,
            updated_at,
            tickets:ticket_id (
              id,
              event_id,
              tier_name,
              section,
              row,
              seat,
              events:event_id (
                id,
                title,
                venue,
                date
              )
            )
          `)
          .eq('id', orderId)
          .single();
          
        if (error) throw error;
        setOrderDetails(data);
      } catch (error: any) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error fetching order",
          description: error.message || "Failed to load order details",
          variant: "destructive"
        });
      }
    }
    
    fetchOrder();
  }, [orderId, toast]);
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (isError) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" /> 
              Error Loading Tickets
            </CardTitle>
            <CardDescription>
              There was a problem retrieving your electronic tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              {error instanceof Error ? error.message : "Unknown error. Please try again later."}
            </p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Electronic Tickets</h1>
      
      {/* Order summary */}
      {orderDetails ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Order #{orderDetails.id.substring(0, 8)} • Purchased on {formatDate(orderDetails.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Event</p>
                <p className="font-medium">{orderDetails.tickets?.events?.title || "Event"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="font-medium">{orderDetails.tickets?.events?.venue || "Venue"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {orderDetails.tickets?.events?.date ? formatDate(orderDetails.tickets.events.date) : "Date"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{orderDetails.quantity} tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
      
      {/* Ticket display */}
      {isLoading ? (
        // Loading state
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : tickets && tickets.length > 0 ? (
        // Show tickets
        <Tabs defaultValue="0" className="w-full">
          {tickets.length > 1 && (
            <TabsList className="grid mb-4" style={{ gridTemplateColumns: `repeat(${tickets.length}, minmax(0, 1fr))` }}>
              {tickets.map((_, index) => (
                <TabsTrigger value={index.toString()} key={index}>
                  Ticket {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
            
          {tickets.map((ticket, index) => (
            <TabsContent value={index.toString()} key={index}>
              <ElectronicTicketViewer 
                ticket={ticket} 
                orderDetails={{
                  orderId: orderId || "",
                  orderDate: orderDetails?.created_at || new Date().toISOString()
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        // No tickets available
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ticket className="h-5 w-5 mr-2" /> 
              No Electronic Tickets Available
            </CardTitle>
            <CardDescription>
              We couldn't find any electronic tickets for this order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Electronic tickets may not be available for the following reasons:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              <li>Tickets haven't been processed yet</li>
              <li>This event doesn't support electronic tickets</li>
              <li>Tickets have been delivered via another method</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
              
              <Button variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                View Order PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
