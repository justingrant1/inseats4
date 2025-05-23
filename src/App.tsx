
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import SellTickets from "./pages/SellTickets";
import Checkout from "./pages/Checkout";
import ConfirmationPage from "./pages/ConfirmationPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyTickets from "./pages/MyTickets";
import Notifications from "./pages/Notifications";
import ElectronicTickets from "./pages/ElectronicTickets";
import SharedTicket from "./pages/SharedTicket";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTickets from "./pages/AdminTickets";
import AdminDevPortal from "./pages/AdminDevPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/sell" element={<SellTickets />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            
            {/* Authentication and user routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/tickets/:orderId" element={<ElectronicTickets />} />
            <Route path="/shared/:shareId" element={<SharedTicket />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/devportal" element={<AdminDevPortal />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
