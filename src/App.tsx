
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
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
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
