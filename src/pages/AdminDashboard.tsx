import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketIcon, Users, Calendar, ArrowRight, BarChart3, Settings, Code } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    userCount: 0,
    eventCount: 0,
    ticketCount: 0,
    orderCount: 0
  });

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
        fetchStats();
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAdmin();
  }, [navigate]);
  
  async function fetchStats() {
    try {
      setIsLoading(true);
      
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get event count
      const { count: eventCount, error: eventError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });
      
      // Get ticket count
      const { count: ticketCount, error: ticketError } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });
      
      // Get order count
      const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (userError || eventError || ticketError || orderError) {
        console.error("Error fetching stats:", { userError, eventError, ticketError, orderError });
        return;
      }
      
      setStats({
        userCount: userCount || 0,
        eventCount: eventCount || 0,
        ticketCount: ticketCount || 0,
        orderCount: orderCount || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isLoading) {
    return <div className="container mx-auto px-4 pt-32 pb-16">Loading...</div>;
  }
  
  if (!isAdmin) {
    return null; // Already redirected by the useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ticketCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orderCount}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Admin Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TicketIcon className="mr-2 h-5 w-5" />
              Ticket Management
            </CardTitle>
            <CardDescription>
              View and manage tickets, track usage, and handle ticket sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>View tickets across all events</li>
              <li>Void or restore tickets</li>
              <li>Monitor ticket sharing activity</li>
              <li>Track usage statistics</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/admin/tickets")}
            >
              Manage Tickets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage users, permissions, and account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>View and edit user profiles</li>
              <li>Manage user roles and permissions</li>
              <li>Handle account issues</li>
              <li>Send notifications to users</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/admin/users")}
              variant="outline"
            >
              Manage Users
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Event Management
            </CardTitle>
            <CardDescription>
              Create and manage events, venues, and ticket inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create and edit events</li>
              <li>Manage venue information</li>
              <li>Control ticket releases</li>
              <li>Set pricing tiers</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/admin/events")}
              variant="outline"
            >
              Manage Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics & Reports
            </CardTitle>
            <CardDescription>
              View sales analytics, usage statistics, and generate reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>Track sales and revenue</li>
              <li>Monitor platform usage</li>
              <li>Generate financial reports</li>
              <li>Export data for analysis</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/admin/analytics")}
              variant="outline"
              disabled
            >
              View Analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure platform settings, notifications, and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>Configure email templates</li>
              <li>Manage payment providers</li>
              <li>Set system preferences</li>
              <li>Control webhook endpoints</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/admin/settings")}
              variant="outline"
              disabled
            >
              System Settings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5" />
              Developer Portal
            </CardTitle>
            <CardDescription>
              Manage API access, applications, and developer resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>Register developer applications</li>
              <li>Manage API keys and permissions</li>
              <li>Monitor API usage and metrics</li>
              <li>Configure subscription plans</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/admin/devportal")}
              variant="outline"
            >
              Developer Portal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
