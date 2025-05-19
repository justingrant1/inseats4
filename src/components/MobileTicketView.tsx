import { useState } from "react";
import { ElectronicTicket } from "@/lib/ticketvault";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Printer, Mail, Download, Share2, ArrowRight, Wallet, MoreHorizontal, Check, QrCode, Ticket, MapPin, Calendar, Clock } from "lucide-react";

interface MobileTicketViewProps {
  ticket: ElectronicTicket;
  orderDetails?: {
    orderId: string;
    orderDate: string;
  };
  onShareTicket?: (ticketId: string, method: string) => void;
  onTransferTicket?: (ticketId: string, email: string) => void;
  onGenerateWallet?: (ticketId: string, walletType: 'apple' | 'google') => void;
}

export function MobileTicketView({ 
  ticket, 
  orderDetails,
  onShareTicket,
  onTransferTicket,
  onGenerateWallet
}: MobileTicketViewProps) {
  const [activeTab, setActiveTab] = useState("ticket");
  const [emailAddress, setEmailAddress] = useState("");
  const [shareMode, setShareMode] = useState<"email" | "sms" | "link">("email");
  const [transferMode, setTransferMode] = useState<"email" | "qr">("email");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isTransferSheetOpen, setIsTransferSheetOpen] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleShare = (method: string) => {
    if (onShareTicket) {
      onShareTicket(ticket.ticketId, method);
    }
    
    if (method === 'email') {
      // For email, keep the sheet open to collect address
    } else {
      setIsShareSheetOpen(false);
    }
  };

  const handleWalletPass = (walletType: 'apple' | 'google') => {
    if (onGenerateWallet) {
      onGenerateWallet(ticket.ticketId, walletType);
    }
  };
  
  const handleTransfer = () => {
    if (onTransferTicket && emailAddress.trim()) {
      onTransferTicket(ticket.ticketId, emailAddress.trim());
      setIsTransferSheetOpen(false);
      setEmailAddress("");
    }
  };
  
  return (
    <div className="mobile-ticket-view">
      <Card className="relative overflow-hidden border-0 shadow-lg rounded-xl">
        <Tabs defaultValue="ticket" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none bg-gray-100 p-0 h-12">
            <TabsTrigger 
              value="ticket" 
              className={cn(
                "rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none py-3",
                activeTab === "ticket" ? "border-b-2 border-primary" : ""
              )}
            >
              <Ticket className="h-4 w-4 mr-2" />
              Ticket
            </TabsTrigger>
            <TabsTrigger 
              value="barcode" 
              className={cn(
                "rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none py-3",
                activeTab === "barcode" ? "border-b-2 border-primary" : ""
              )}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Barcode
            </TabsTrigger>
            <TabsTrigger 
              value="actions" 
              className={cn(
                "rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none py-3",
                activeTab === "actions" ? "border-b-2 border-primary" : ""
              )}
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              More
            </TabsTrigger>
          </TabsList>
          
          {/* Ticket details content */}
          <TabsContent value="ticket" className="p-0 m-0">
            <div className="bg-primary text-primary-foreground p-4">
              <h3 className="font-bold text-lg mb-1">{ticket.eventName}</h3>
              <div className="flex items-center text-xs mb-1">
                <Calendar className="h-3 w-3 mr-1 inline" />
                {formatDate(ticket.eventDate)}
              </div>
              <div className="flex items-center text-xs">
                <MapPin className="h-3 w-3 mr-1 inline" />
                {ticket.venue}
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-y-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500">Section</p>
                  <p className="font-medium">{ticket.section || "GA"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Row</p>
                  <p className="font-medium">{ticket.row || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seat</p>
                  <p className="font-medium">{ticket.seat || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ticket #</p>
                  <p className="font-medium">{ticket.ticketId.substring(0, 8)}</p>
                </div>
              </div>
              
              <div className={`rounded-md p-2 text-sm flex items-center mb-4 ${
                ticket.status === 'valid' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : ticket.status === 'used'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {ticket.status === 'valid' ? (
                  <><Check className="h-4 w-4 mr-2" /> Valid for entry</>
                ) : ticket.status === 'used' ? (
                  <><Clock className="h-4 w-4 mr-2" /> Already used</>
                ) : (
                  <><Clock className="h-4 w-4 mr-2" /> {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-xs justify-center flex-1"
                  onClick={() => setIsShareSheetOpen(true)}
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-xs justify-center flex-1"
                  onClick={() => setActiveTab("barcode")}
                >
                  <QrCode className="h-3 w-3 mr-1" />
                  Show Code
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-xs justify-center flex-1"
                  onClick={() => setIsTransferSheetOpen(true)}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Transfer
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Barcode content */}
          <TabsContent value="barcode" className="p-0 m-0">
            <div className="flex flex-col items-center justify-center p-6">
              <div className="p-3 bg-white border rounded-md shadow-sm mb-4">
                {ticket.barcodeType === 'qrcode' ? (
                  <img 
                    src={ticket.imageUrl} 
                    alt="QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <img 
                    src={ticket.imageUrl} 
                    alt="Barcode" 
                    className="w-64 h-32 object-contain"
                  />
                )}
              </div>
              
              <p className="text-center font-mono text-sm mb-2">{ticket.barcode}</p>
              <p className="text-center text-gray-500 text-xs mb-4">
                {ticket.barcodeType === 'qrcode' 
                  ? 'Show this QR code at the venue entrance' 
                  : 'Show this barcode at the venue entrance'}
              </p>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => {
                    const element = document.createElement('a');
                    element.href = ticket.imageUrl;
                    element.download = `ticket-${ticket.ticketId}.png`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Save Code
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Actions content */}
          <TabsContent value="actions" className="p-0 m-0">
            <div className="p-4">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("barcode")}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Show Barcode
                </Button>
                
                <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="w-full justify-start" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Ticket
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-96">
                    <SheetHeader>
                      <SheetTitle>Share Ticket</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <Button 
                          variant={shareMode === "email" ? "default" : "outline"} 
                          className="flex flex-col items-center py-6"
                          onClick={() => setShareMode("email")}
                        >
                          <Mail className="h-6 w-6 mb-2" />
                          <span className="text-xs">Email</span>
                        </Button>
                        <Button 
                          variant={shareMode === "sms" ? "default" : "outline"} 
                          className="flex flex-col items-center py-6"
                          onClick={() => setShareMode("sms")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                          <span className="text-xs">SMS</span>
                        </Button>
                        <Button 
                          variant={shareMode === "link" ? "default" : "outline"} 
                          className="flex flex-col items-center py-6"
                          onClick={() => setShareMode("link")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                          </svg>
                          <span className="text-xs">Link</span>
                        </Button>
                      </div>
                      
                      {shareMode === "email" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="shareEmail">Email address</Label>
                            <Input 
                              id="shareEmail" 
                              placeholder="Enter email address" 
                              value={emailAddress}
                              onChange={(e) => setEmailAddress(e.target.value)}
                            />
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => handleShare("email")}
                            disabled={!emailAddress}
                          >
                            Send Ticket via Email
                          </Button>
                        </div>
                      )}
                      
                      {shareMode === "sms" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="smsNumber">Phone number</Label>
                            <Input 
                              id="smsNumber" 
                              placeholder="Enter phone number" 
                              type="tel"
                            />
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => handleShare("sms")}
                          >
                            Send Ticket via SMS
                          </Button>
                        </div>
                      )}
                      
                      {shareMode === "link" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Private ticket link</Label>
                            <div className="flex space-x-2">
                              <Input 
                                value={`https://inseats.com/t/${ticket.ticketId}`} 
                                readOnly 
                              />
                              <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(`https://inseats.com/t/${ticket.ticketId}`);
                                handleShare("link");
                              }}>
                                Copy
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              This link allows anyone to view this ticket. Only share with people you trust.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Sheet open={isTransferSheetOpen} onOpenChange={setIsTransferSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="w-full justify-start" variant="outline">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Transfer Ticket
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-96">
                    <SheetHeader>
                      <SheetTitle>Transfer Ticket</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <Button 
                          variant={transferMode === "email" ? "default" : "outline"} 
                          className="flex flex-col items-center py-6"
                          onClick={() => setTransferMode("email")}
                        >
                          <Mail className="h-6 w-6 mb-2" />
                          <span className="text-xs">Email</span>
                        </Button>
                        <Button 
                          variant={transferMode === "qr" ? "default" : "outline"} 
                          className="flex flex-col items-center py-6"
                          onClick={() => setTransferMode("qr")}
                        >
                          <QrCode className="h-6 w-6 mb-2" />
                          <span className="text-xs">QR Code</span>
                        </Button>
                      </div>
                      
                      {transferMode === "email" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="transferEmail">Recipient's email</Label>
                            <Input 
                              id="transferEmail" 
                              placeholder="Enter recipient's email" 
                              value={emailAddress}
                              onChange={(e) => setEmailAddress(e.target.value)}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            The recipient will need an InSeats account to claim this ticket.
                            This transfer will remove the ticket from your account.
                          </p>
                          <Button 
                            className="w-full" 
                            onClick={handleTransfer}
                            disabled={!emailAddress}
                          >
                            Transfer Ticket
                          </Button>
                        </div>
                      )}
                      
                      {transferMode === "qr" && (
                        <div className="space-y-4 text-center">
                          <div className="bg-white p-4 rounded-lg border mx-auto max-w-xs">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://inseats.com/transfer/${ticket.ticketId}`} 
                              alt="Transfer QR Code" 
                              className="w-full h-auto"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Have the recipient scan this QR code to transfer the ticket directly.
                            This code expires in 15 minutes.
                          </p>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Dialog>
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
                    <div className="flex space-x-4 py-4">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleWalletPass('apple')}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.0181 13.256C16.991 10.591 19.1949 9.47892 19.2891 9.42169C17.9864 7.4722 15.9318 7.20686 15.2179 7.18878C13.5038 7.00847 11.8476 8.19158 10.9771 8.19158C10.1066 8.19158 8.75836 7.20686 7.32806 7.24301C5.48949 7.27917 3.77834 8.33622 2.82555 9.9805C0.845986 13.3494 2.34261 18.2558 4.23968 20.8838C5.19248 22.1572 6.31098 23.5695 7.76934 23.5152C9.1915 23.4608 9.71748 22.6145 11.4106 22.6145C13.1038 22.6145 13.5942 23.5152 15.0796 23.4789C16.612 23.4608 17.5648 22.2055 18.4895 20.9142C19.5809 19.4656 19.9979 18.0534 20.0159 17.9991C19.9799 17.981 17.0543 16.8876 17.0181 13.256Z" />
                          <path d="M14.1094 5.60575C14.8774 4.65196 15.3768 3.37301 15.2455 2.06689C14.1453 2.12411 12.7511 2.82301 11.9469 3.77579C11.2331 4.6101 10.6167 5.92525 10.7662 7.19516C11.9921 7.28153 13.3139 6.55499 14.1094 5.60575Z" />
                        </svg>
                        Apple Wallet
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleWalletPass('google')}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.0422 6.46907V11.8782L21.3695 4.75989H12.0422V6.46907ZM16.1567 24H19.4182L8.28696 15.6662H5.02547L16.1567 24ZM22.9327 4.89815C22.7871 4.79719 22.2146 4.3956 21.4146 3.85431C20.5315 3.25861 19.946 2.93319 19.6588 2.87131C19.1621 2.76066 18.691 2.95289 18.2457 3.44427L2.85571 20.5557C2.35571 21.1153 2.1075 21.6669 2.11113 22.2103C2.11485 22.7539 2.36797 23.2364 2.87051 23.6586C3.37297 24.0805 3.88416 24.2423 4.40397 24.1439C4.92306 24.0458 5.46806 23.7003 6.03833 23.1076L23.4284 3.99614C23.8372 3.55426 23.9958 3.11238 23.9917 2.67029C23.9873 2.228 23.8246 1.79135 23.4031 1.35968C22.9817 0.928015 22.5542 0.763453 22.1208 0.857999C21.6876 0.952544 21.2542 1.21587 20.8205 1.64805L18.9546 3.67987L22.9327 4.89815ZM12.0422 24V17.4865L5.02547 11.8782V7.9094L12.0422 13.5177V24Z" />
                        </svg>
                        Google Pay
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button className="w-full justify-start" variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Ticket
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
