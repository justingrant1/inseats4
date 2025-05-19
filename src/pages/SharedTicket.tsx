import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TicketSharing } from "@/lib/ticketSharing";
import { ElectronicTicket as TicketType } from "@/lib/ticketvault";
import { ElectronicTicketViewer } from "@/components/ElectronicTicket";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";
import { Database } from "@/types/database.types";

type TicketShare = Database['public']['Tables']['ticket_shares']['Row'];

export default function SharedTicket() {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [shareInfo, setShareInfo] = useState<TicketShare | null>(null);

  useEffect(() => {
    async function loadSharedTicket() {
      if (!shareId) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const result = await TicketSharing.getSharedTicket(shareId);
        
        if (result.error) {
          setError(result.error);
        } else if (result.ticket) {
          setTicket(result.ticket);
          setShareInfo(result.shareInfo || null);
        } else {
          setError("Unable to load ticket information");
        }
      } catch (err) {
        console.error("Error loading shared ticket:", err);
        setError("An unexpected error occurred while loading the ticket");
      } finally {
        setLoading(false);
      }
    }

    loadSharedTicket();
  }, [shareId]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="border rounded-lg p-6 mb-6">
          <Skeleton className="h-64 w-full mb-4 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="text-center mt-8">
          <p className="mb-4 text-muted-foreground">
            The ticket may have expired, been revoked, or the link may be invalid.
          </p>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Homepage
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Render success state
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Share info header */}
      {shareInfo && (
        <div className="mb-6">
          <Alert variant="default" className="mb-4">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Shared Ticket</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              {shareInfo.share_type === 'email' && shareInfo.recipient_email && (
                <p>Shared with: {shareInfo.recipient_email}</p>
              )}
              {shareInfo.share_type === 'sms' && shareInfo.recipient_phone && (
                <p>Shared with: {shareInfo.recipient_phone}</p>
              )}
              {shareInfo.share_type === 'link' && (
                <p>This is a publicly shared ticket link</p>
              )}
              {shareInfo.sender_name && (
                <p>From: {shareInfo.sender_name}</p>
              )}
              <p>Expires: {formatDate(shareInfo.expires_at)}</p>
              <p className="flex items-center mt-1">
                <Eye className="h-3 w-3 mr-1" />
                {shareInfo.view_count} {shareInfo.view_count === 1 ? 'view' : 'views'}
              </p>
            </AlertDescription>
          </Alert>

          {shareInfo.personal_message && (
            <div className="p-4 border border-gray-200 rounded-md mb-6 bg-gray-50">
              <p className="text-sm font-medium mb-1">Personal message:</p>
              <p className="text-sm italic">"{shareInfo.personal_message}"</p>
            </div>
          )}
        </div>
      )}

      {/* Ticket */}
      {ticket && (
        <div className="border rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {ticket.eventName}
          </h1>
          
          <ElectronicTicketViewer ticket={ticket} />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              This is a shared ticket. To purchase your own tickets, visit our website.
            </p>
            <Button asChild>
              <Link to="/">
                Browse Events
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
