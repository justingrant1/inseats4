import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  Plus, 
  Key, 
  RefreshCw, 
  XCircle,
  Copy,
  ExternalLink,
  BarChart3,
  Info
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { devPortalClient, ApplicationResponse, ApiKeyResponse, SubscriptionResponse } from "@/lib/devportal";

export default function AdminDevPortal() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationResponse | null>(null);
  const [showNewAppDialog, setShowNewAppDialog] = useState<boolean>(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState<boolean>(false);
  const [newAppName, setNewAppName] = useState<string>("");
  const [newAppDescription, setNewAppDescription] = useState<string>("");
  const [newKeyName, setNewKeyName] = useState<string>("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["read"]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("applications");
  const [newKeyAdded, setNewKeyAdded] = useState<ApiKeyResponse | null>(null);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate("/login");
          return;
        }
        
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // Use the profile data without assuming specific field names
        const profileData = profile as any;
        
        // Check various possible locations where the admin role might be stored
        const isAdmin = profileData && (
          profileData.role === 'admin' || 
          profileData.user_role === 'admin' ||
          profileData.is_admin === true ||
          (profileData.metadata && profileData.metadata.role === 'admin')
        );
        
        if (profileError || !profile || !isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin panel.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }
        
        setIsAdmin(true);
        
        // Set client credentials
        // Note: In a real app, you would get these from a secure source, not hardcoded
        devPortalClient.setCredentials({
          clientId: import.meta.env.VITE_DEVPORTAL_CLIENT_ID || "demo-client-id",
          clientSecret: import.meta.env.VITE_DEVPORTAL_CLIENT_SECRET || "demo-client-secret"
        });
        
        // Fetch applications
        fetchApplications();
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }
    
    checkAdmin();
  }, [navigate]);
  
  async function fetchApplications() {
    setLoading(true);
    try {
      const response = await devPortalClient.getApplications();
      
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to fetch applications");
      }
      
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load developer applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchSubscriptions(appId: string) {
    try {
      const response = await devPortalClient.getSubscriptions(appId);
      
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to fetch subscriptions");
      }
      
      setSubscriptions(response.data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive"
      });
    }
  }
  
  async function handleCreateApplication() {
    if (!newAppName.trim()) {
      toast({
        title: "Validation Error",
        description: "Application name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await devPortalClient.createApplication({
        name: newAppName.trim(),
        description: newAppDescription.trim()
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to create application");
      }
      
      toast({
        title: "Success",
        description: "Application created successfully",
      });
      
      // Reset form
      setNewAppName("");
      setNewAppDescription("");
      setShowNewAppDialog(false);
      
      // Refresh applications list
      fetchApplications();
    } catch (error) {
      console.error("Error creating application:", error);
      toast({
        title: "Error",
        description: "Failed to create application",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function handleGenerateApiKey() {
    if (!selectedApp) return;
    
    if (!newKeyName.trim()) {
      toast({
        title: "Validation Error",
        description: "API key name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await devPortalClient.generateApiKey(selectedApp.id, {
        name: newKeyName.trim(),
        permissions: newKeyPermissions
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to generate API key");
      }
      
      setNewKeyAdded(response.data || null);
      
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
      
      // Reset form but keep dialog open to show the key
      setNewKeyName("");
    } catch (error) {
      console.error("Error generating API key:", error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive"
      });
      setShowNewKeyDialog(false);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleRevokeApiKey(appId: string, keyId: string) {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await devPortalClient.revokeApiKey(appId, keyId);
      
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to revoke API key");
      }
      
      toast({
        title: "Success",
        description: "API key revoked successfully",
      });
      
      // Refresh applications list
      fetchApplications();
      
      // If we're viewing details of the app where the key was revoked, refresh the selected app
      if (selectedApp && selectedApp.id === appId) {
        const updatedApp = applications.find(app => app.id === appId);
        if (updatedApp) {
          setSelectedApp(updatedApp);
        }
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function handleViewAppDetails(app: ApplicationResponse) {
    setSelectedApp(app);
    fetchSubscriptions(app.id);
  }
  
  function handleCopyToClipboard(text: string, successMessage: string = "Copied to clipboard") {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Success",
        description: successMessage,
      });
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    });
  }
  
  function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  if (loading && !isAdmin) {
    return <div className="container mx-auto px-4 pt-32 pb-16">Loading...</div>;
  }
  
  if (!isAdmin) {
    return null; // Already redirected by the useEffect
  }
  
  // Back to application list view
  if (!selectedApp) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Developer Portal</h1>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="subscriptions">API Plans</TabsTrigger>
            <TabsTrigger value="metrics">Usage Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Developer Applications</CardTitle>
                  <CardDescription>
                    Applications registered for API access
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={fetchApplications} variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Dialog open={showNewAppDialog} onOpenChange={setShowNewAppDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> New Application
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Application</DialogTitle>
                        <DialogDescription>
                          Register a new developer application for API access
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="app-name">Application Name *</Label>
                          <Input
                            id="app-name"
                            value={newAppName}
                            onChange={(e) => setNewAppName(e.target.value)}
                            placeholder="My API Application"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="app-description">Description</Label>
                          <Textarea
                            id="app-description"
                            value={newAppDescription}
                            onChange={(e) => setNewAppDescription(e.target.value)}
                            placeholder="Describe what your application will do with the API"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewAppDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateApplication} disabled={loading}>
                          Create Application
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No applications found</p>
                    <Button 
                      onClick={() => setShowNewAppDialog(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create Your First Application
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>API Keys</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div className="font-medium">{app.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {app.description || "No description"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                app.status === 'active' ? 'default' :
                                app.status === 'pending' ? 'outline' :
                                'destructive'
                              }>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {app.apiKeys && app.apiKeys.length > 0 ? (
                                <div className="text-sm">
                                  {app.apiKeys.length} {app.apiKeys.length === 1 ? 'key' : 'keys'}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No API keys</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {formatDate(app.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                onClick={() => handleViewAppDetails(app)}
                              >
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscriptions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Plans</CardTitle>
                <CardDescription>
                  Manage API subscription plans and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature is coming soon. You'll be able to create and manage API subscription plans,
                  set rate limits, and view subscription analytics.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>
                  View API usage metrics and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature is coming soon. You'll be able to view detailed API usage metrics,
                  track rate limit usage, and see analytics by endpoint.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // Application detail view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => setSelectedApp(null)} className="mb-2">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Applications
          </Button>
          <h1 className="text-3xl font-bold">{selectedApp.name}</h1>
          <p className="text-muted-foreground">{selectedApp.description}</p>
        </div>
        <Badge variant={
          selectedApp.status === 'active' ? 'default' :
          selectedApp.status === 'pending' ? 'outline' :
          'destructive'
        }>
          {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Application ID</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="text-sm font-mono">{selectedApp.id}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => handleCopyToClipboard(selectedApp.id)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDate(selectedApp.createdAt)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDate(selectedApp.updatedAt)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{selectedApp.apiKeys?.length || 0} active keys</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="keys" className="mb-8">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="metrics">Usage Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="keys" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage API keys for this application
                </CardDescription>
              </div>
              <Dialog open={showNewKeyDialog} onOpenChange={(open) => {
                setShowNewKeyDialog(open);
                if (!open) setNewKeyAdded(null);
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Key className="h-4 w-4 mr-2" /> Generate New Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate API Key</DialogTitle>
                    <DialogDescription>
                      {newKeyAdded ? 
                       "Your new API key has been generated. Copy it now as it won't be shown again!" : 
                       "Create a new API key for this application"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {newKeyAdded ? (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>API Key</Label>
                        <div className="p-2 bg-muted rounded-md font-mono text-sm break-all">
                          {newKeyAdded.key}
                        </div>
                        <p className="text-xs text-destructive font-semibold mt-1">
                          Copy this key now! It will not be shown again.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label>Key ID</Label>
                        <div className="text-sm font-mono">{newKeyAdded.id}</div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <div className="text-sm">{newKeyAdded.name}</div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Permissions</Label>
                        <div className="flex flex-wrap gap-1">
                          {newKeyAdded.permissions.map(permission => (
                            <Badge key={permission} variant="outline">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="key-name">Key Name *</Label>
                        <Input
                          id="key-name"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Production API Key"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Permissions</Label>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant={newKeyPermissions.includes("read") ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (newKeyPermissions.includes("read")) {
                                setNewKeyPermissions(newKeyPermissions.filter(p => p !== "read"));
                              } else {
                                setNewKeyPermissions([...newKeyPermissions, "read"]);
                              }
                            }}
                          >
                            read
                          </Badge>
                          <Badge 
                            variant={newKeyPermissions.includes("write") ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (newKeyPermissions.includes("write")) {
                                setNewKeyPermissions(newKeyPermissions.filter(p => p !== "write"));
                              } else {
                                setNewKeyPermissions([...newKeyPermissions, "write"]);
                              }
                            }}
                          >
                            write
                          </Badge>
                          <Badge 
                            variant={newKeyPermissions.includes("admin") ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (newKeyPermissions.includes("admin")) {
                                setNewKeyPermissions(newKeyPermissions.filter(p => p !== "admin"));
                              } else {
                                setNewKeyPermissions([...newKeyPermissions, "admin"]);
                              }
                            }}
                          >
                            admin
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    {newKeyAdded ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowNewKeyDialog(false);
                            setNewKeyAdded(null);
                          }}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => handleCopyToClipboard(newKeyAdded.key, "API key copied to clipboard")}
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy Key
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setShowNewKeyDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleGenerateApiKey}
                          disabled={loading || !newKeyName.trim() || newKeyPermissions.length === 0}
                        >
                          Generate Key
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {!selectedApp.apiKeys || selectedApp.apiKeys.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">This application has no API keys</p>
                  <Button 
                    onClick={() => setShowNewKeyDialog(true)}
                    variant="outline"
                  >
                    <Key className="h-4 w-4 mr-2" /> Generate Your First API Key
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Key ID</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedApp.apiKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell>
                            <div className="font-medium">{key.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs">{key.id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {key.permissions.map(permission => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(key.createdAt)}
                          </TableCell>
                          <TableCell>
                            {key.expiresAt ? formatDate(key.expiresAt) : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleRevokeApiKey(selectedApp.id, key.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>
                Manage API plan subscriptions for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">This application has no active subscriptions</p>
                  <Button 
                    variant="outline"
                    disabled
                  >
                    <Plus className="h-4 w-4 mr-2" /> Subscribe to an API Plan
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    API Plan subscription management is coming soon
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Billing Cycle</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div className="font-medium">{sub.planName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              sub.status === 'active' ? 'default' :
                              sub.status === 'pending' ? 'outline' :
                              'destructive'
                            }>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            ${sub.price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {sub.billingCycle.charAt(0).toUpperCase() + sub.billingCycle.slice(1)}
                          </TableCell>
                          <TableCell>
                            {formatDate(sub.startDate)}
                          </TableCell>
                          <TableCell>
                            {sub.endDate ? formatDate(sub.endDate) : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              disabled
                            >
                              Cancel
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Metrics</CardTitle>
              <CardDescription>
                Track and monitor API usage for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Usage analytics will be available soon
                </p>
                <Button 
                  variant="outline"
                  disabled
                >
                  <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
