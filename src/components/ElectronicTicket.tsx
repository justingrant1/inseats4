import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ElectronicTicket, useDeliverTicketsByEmail, useGenerateWalletTickets } from "@/lib/ticketvault";
import { TicketSharing } from "@/lib/ticketSharing";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Mail, Download, Wallet, Printer, Share2, CheckCircle, AlertCircle, Link, MessageSquare, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ElectronicTicketViewerProps {
  ticket: ElectronicTicket;
  orderDetails?: {
    orderId: string;
    orderDate: string;
  };
}

export function ElectronicTicketViewer({ ticket, orderDetails }: ElectronicTicketViewerProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [emailAddress, setEmailAddress] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareType, setShareType] = useState<'email' | 'sms' | 'link'>('email');
  const [shareEmail, setShareEmail] = useState("");
  const [sharePhone, setSharePhone] = useState("");
  const [shareSenderName, setShareSenderName] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<'apple' | 'google'>('apple');
  
  const { mutate: deliverByEmail, isPending: isEmailDeliveryPending } = useDeliverTicketsByEmail();
  const { mutate: generateWalletPass, isPending: isWalletPending } = useGenerateWalletTickets();
  
  const handleEmailDelivery = () => {
    if (!emailAddress.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    deliverByEmail({
      ticketIds: [ticket.ticketId],
      email: emailAddress
    }, {
      onSuccess: (result) => {
        setEmailDialogOpen(false);
        toast({
          title: "Tickets sent",
          description: result.message,
          variant: "default"
        });
      },
      onError: (error) => {
        toast({
          title: "Delivery failed",
          description: error instanceof Error ? error.message : "Failed to send tickets",
          variant: "destructive"
        });
      }
    });
  };
  
  const handleWalletPass = () => {
    generateWalletPass({
      ticketIds: [ticket.ticketId],
      walletType: selectedWallet
    }, {
      onSuccess: (result) => {
        if (result && result.passUrl) {
          window.open(result.passUrl, "_blank");
          setWalletDialogOpen(false);
          toast({
            title: "Wallet pass generated",
            description: `Your ${selectedWallet} pass is ready`,
            variant: "default"
          });
        } else {
          toast({
            title: "Generation failed",
            description: "Failed to generate wallet pass",
            variant: "destructive"
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Wallet pass error",
          description: error instanceof Error ? error.message : "Failed to generate wallet pass",
          variant: "destructive"
        });
      }
    });
  };
  // Handle ticket sharing
  const handleShareTicket = async () => {
    try {
      let result;

      if (shareType === 'email') {
        if (!shareEmail.trim()) {
          toast({
            title: "Email required",
            description: "Please enter a valid email address",
            variant: "destructive"
          });
          return;
        }

        result = await TicketSharing.shareViaEmail(ticket.ticketId, {
          recipientEmail: shareEmail,
          senderName: shareSenderName,
          personalMessage: shareMessage
        });
      } else if (shareType === 'sms') {
        if (!sharePhone.trim()) {
          toast({
            title: "Phone number required",
            description: "Please enter a valid phone number",
            variant: "destructive"
          });
          return;
        }

        result = await TicketSharing.shareViaSms(ticket.ticketId, {
          phoneNumber: sharePhone,
          personalMessage: shareMessage
        });
      } else {
        // Share via link
        result = await TicketSharing.generateShareableLink(ticket.ticketId);
      }

      if (result.success) {
        if (shareType === 'link' && result.shareUrl) {
          setShareLink(result.shareUrl);
          setShareSuccess(true);
        } else {
          toast({
            title: "Ticket shared successfully",
            description: result.message,
            variant: "default"
          });
          
          if (shareType !== 'link') {
            setShareDialogOpen(false);
          }
        }
      } else {
        toast({
          title: "Sharing failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Ticket sharing error:", error);
      toast({
        title: "Sharing failed",
        description: "An unexpected error occurred while sharing the ticket",
        variant: "destructive"
      });
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Share link copied to clipboard",
            variant: "default"
          });
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          toast({
            title: "Copy failed",
            description: "Unable to copy link to clipboard",
            variant: "destructive"
          });
        });
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusIcon = () => {
    switch (ticket.status) {
      case 'valid':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'used':
        return <AlertCircle className="h-6 w-6 text-amber-500" />;
      case 'expired':
      case 'voided':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusLabel = () => {
    switch (ticket.status) {
      case 'valid':
        return "Valid for entry";
      case 'used':
        return "Already used";
      case 'expired':
        return "Expired";
      case 'voided':
        return "Voided";
      default:
        return "Unknown status";
    }
  };
  
  return (
    <Card className="overflow-hidden electronic-ticket-card">
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="barcode">Barcode</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="p-0">
          {/* Ticket header with event info */}
          <div className="bg-primary text-primary-foreground p-4">
            <h3 className="font-bold text-lg">{ticket.eventName}</h3>
            <p className="text-sm opacity-90">{formatDate(ticket.eventDate)}</p>
            <p className="text-sm opacity-90">{ticket.venue}</p>
          </div>
          
          {/* Ticket details */}
          <CardContent className="p-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Section</p>
                  <p className="font-medium">{ticket.section || "General Admission"}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Row</p>
                  <p className="font-medium">{ticket.row || "N/A"}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Seat</p>
                  <p className="font-medium">{ticket.seat || "N/A"}</p>
                </div>
                
                {orderDetails && (
                  <div>
                    <p className="text-xs text-muted-foreground">Order #</p>
                    <p className="font-medium">{orderDetails.orderId.substring(0, 8)}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 p-2 rounded-md bg-gray-50">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium">Status: {getStatusLabel()}</p>
                {ticket.status === 'used' && ticket.scannedAt && (
                  <p className="text-xs text-muted-foreground">
                    Scanned at: {new Date(ticket.scannedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            {/* Entry instructions */}
            <div className="mt-4 p-3 border rounded-md text-sm">
              <h4 className="font-medium">Entry Instructions</h4>
              <p className="mt-1 text-muted-foreground text-xs">
                Please arrive at least 30 minutes before the event. Have your ticket barcode ready for scanning.
                {ticket.restrictions && ticket.restrictions.length > 0 && (
                  <>
                    <br/><br/>
                    <strong>Restrictions:</strong> {ticket.restrictions.join(", ")}
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="barcode" className="flex flex-col items-center justify-center py-6 px-4">
          <div className="electronic-ticket-barcode mb-4">
            {ticket.barcodeType === 'qrcode' ? (
              <div className="p-2 bg-white border rounded-md">
                <img 
                  src={ticket.imageUrl} 
                  alt="QR Code" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : (
              <div className="p-2 bg-white border rounded-md">
                <img 
                  src={ticket.imageUrl} 
                  alt="Barcode" 
                  className="w-64 h-32 object-contain"
                />
              </div>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <p className="font-medium">{ticket.barcode}</p>
            <p className="text-xs text-muted-foreground">
              {ticket.barcodeType === 'qrcode' ? 'Show this QR code at the venue entrance' : 'Show this barcode at the venue entrance'}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="mt-4"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Ticket
          </Button>
        </TabsContent>
        
        <TabsContent value="actions" className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Email Ticket</DialogTitle>
                  <DialogDescription>
                    Enter the email address where you'd like to receive your ticket.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email" 
                    placeholder="your@email.com" 
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setEmailDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEmailDelivery} 
                    disabled={isEmailDeliveryPending}
                  >
                    {isEmailDeliveryPending ? "Sending..." : "Send Ticket"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Wallet className="h-4 w-4 mr-2" />
                  Add to Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add to Digital Wallet</DialogTitle>
                  <DialogDescription>
                    Choose which wallet you want to add your ticket to.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex space-x-4">
                    <Button 
                      variant={selectedWallet === 'apple' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSelectedWallet('apple')}
                    >
                      Apple Wallet
                    </Button>
                    <Button 
                      variant={selectedWallet === 'google' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSelectedWallet('google')}
                    >
                      Google Pay
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setWalletDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleWalletPass} 
                    disabled={isWalletPending}
                  >
                    {isWalletPending ? "Generating..." : "Add to Wallet"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button className="w-full justify-start" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Ticket
            </Button>
            
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Ticket</DialogTitle>
                  <DialogDescription>
                    Share your ticket with friends or family. The recipient will have view-only access.
                  </DialogDescription>
                </DialogHeader>
                
                {!shareSuccess ? (
                  <>
                    <div className="py-4">
                      <div className="mb-4">
                        <Label>Share via</Label>
                        <div className="flex space-x-2 mt-2">
                          <Button 
                            variant={shareType === 'email' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setShareType('email')}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                          <Button 
                            variant={shareType === 'sms' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setShareType('sms')}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            SMS
                          </Button>
                          <Button 
                            variant={shareType === 'link' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setShareType('link')}
                          >
                            <Link className="h-4 w-4 mr-2" />
                            Link
                          </Button>
                        </div>
                      </div>
                      
                      {shareType === 'email' && (
                        <>
                          <div className="mb-4">
                            <Label htmlFor="share-email">Recipient Email</Label>
                            <Input 
                              id="share-email" 
                              placeholder="friend@example.com" 
                              value={shareEmail}
                              onChange={(e) => setShareEmail(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div className="mb-4">
                            <Label htmlFor="sender-name">Your Name (optional)</Label>
                            <Input 
                              id="sender-name" 
                              placeholder="Your Name" 
                              value={shareSenderName}
                              onChange={(e) => setShareSenderName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                      
                      {shareType === 'sms' && (
                        <div className="mb-4">
                          <Label htmlFor="share-phone">Recipient Phone Number</Label>
                          <Input 
                            id="share-phone" 
                            placeholder="+1 (123) 456-7890" 
                            value={sharePhone}
                            onChange={(e) => setSharePhone(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                      
                      {shareType !== 'link' && (
                        <div className="mb-4">
                          <Label htmlFor="share-message">Personal Message (optional)</Label>
                          <textarea 
                            id="share-message" 
                            placeholder="Add a personal message..." 
                            value={shareMessage}
                            onChange={(e) => setShareMessage(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md border-input bg-background"
                            rows={3}
                          />
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleShareTicket}>
                        {shareType === 'link' ? 'Generate Link' : 'Share Ticket'}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <div className="py-6 flex flex-col items-center justify-center space-y-4">
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                        <Link className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">Share Link Generated</h3>
                      <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
                        <Input 
                          readOnly 
                          value={shareLink} 
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="icon" onClick={copyShareLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Anyone with this link can view this ticket until it expires
                      </p>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setShareSuccess(false);
                        setShareLink("");
                        setShareDialogOpen(false);
                      }}>
                        Close
                      </Button>
                      <Button variant="default" onClick={copyShareLink}>
                        Copy Link
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
