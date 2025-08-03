
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import PerformanceProvider from "@/components/PerformanceProvider";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const SellTickets = lazy(() => import("./pages/SellTickets"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ElectronicTickets = lazy(() => import("./pages/ElectronicTickets"));
const SharedTicket = lazy(() => import("./pages/SharedTicket"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminTickets = lazy(() => import("./pages/AdminTickets"));
const AdminDevPortal = lazy(() => import("./pages/AdminDevPortal"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'development',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <PerformanceProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<LoadingSpinner />}>
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
                  
                  {/* Static pages */}
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PerformanceProvider>
  </ErrorBoundary>
);

export default App;
