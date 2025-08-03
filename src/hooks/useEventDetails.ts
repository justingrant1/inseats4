import { useQuery } from '@tanstack/react-query';
import { Event, SeatTier, UseEventDetailsReturn } from '@/types';

// Mock data that would normally come from an API
const MOCK_EVENTS: Record<string, Event> = {
  "1": {
    id: "1",
    title: "Taylor Swift | The Eras Tour",
    category: "Concerts",
    date: "May 15, 2023 • 8:00 PM",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 299,
    maxPrice: 1500,
    isPremium: true,
    isLastMinute: true,
    description: "Experience an unforgettable night at SoFi Stadium with premium seating options that provide the best views and comfort. This is a high-demand event with limited availability. Secure your seats now!"
  },
  "2": {
    id: "2",
    title: "Lakers vs. Warriors - Western Conference Finals",
    category: "Sports",
    date: "June 2, 2023 • 7:30 PM",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 199,
    maxPrice: 2500,
    isPremium: true,
    description: "Witness the ultimate showdown between two legendary teams in this crucial Western Conference Finals game."
  },
  "3": {
    id: "3",
    title: "Hamilton - Broadway Musical",
    category: "Theater",
    date: "May 20, 2023 • 7:00 PM",
    venue: "Richard Rodgers Theatre",
    location: "New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 129,
    maxPrice: 899,
    isLastMinute: true,
    description: "Experience the revolutionary musical that tells the story of Alexander Hamilton through hip-hop, jazz, and R&B."
  },
  "4": {
    id: "4",
    title: "Coldplay - Music of the Spheres Tour",
    category: "Concerts",
    date: "May 25, 2023 • 8:00 PM",
    venue: "Wembley Stadium",
    location: "London, UK",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 150,
    maxPrice: 800,
    isPremium: true,
    description: "Join Coldplay for an otherworldly musical experience featuring songs from their latest album and greatest hits."
  },
  "5": {
    id: "5",
    title: "The Weeknd - After Hours Tour",
    category: "Concerts",
    date: "Tonight • 9:00 PM",
    venue: "Madison Square Garden",
    location: "New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 85,
    maxPrice: 650,
    isLastMinute: true,
    description: "Don't miss The Weeknd's electrifying performance at the iconic Madison Square Garden."
  },
  "6": {
    id: "6",
    title: "Celtics vs. Knicks - Game 7",
    category: "Sports",
    date: "Tomorrow • 5:30 PM",
    venue: "TD Garden",
    location: "Boston, MA",
    imageUrl: "https://images.unsplash.com/photo-1518085250699-2d00e53f6604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 125,
    maxPrice: 750,
    isLastMinute: true,
    description: "The ultimate Game 7 showdown between historic rivals in the heart of Boston."
  },
  "7": {
    id: "7",
    title: "Dear Evan Hansen",
    category: "Theater",
    date: "Tonight • 7:00 PM",
    venue: "Music Box Theatre",
    location: "New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: 75,
    maxPrice: 350,
    isLastMinute: true,
    description: "A deeply personal and profoundly contemporary musical about life and the way we live it."
  }
};

// Mock seat tiers that would normally be fetched based on event
const MOCK_SEAT_TIERS: SeatTier[] = [
  {
    id: "vip",
    name: "VIP Premium",
    description: "Best views with exclusive access to VIP lounge",
    price: 450,
    availableSeats: 12,
    color: "bg-amber-500",
    bgColor: "bg-amber-100",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Excellent views close to the stage/field",
    price: 250,
    availableSeats: 28,
    color: "bg-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Great views at a reasonable price",
    price: 150,
    availableSeats: 64,
    color: "bg-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    id: "budget",
    name: "Budget",
    description: "Enjoy the event at the most affordable price",
    price: 85,
    availableSeats: 103,
    color: "bg-green-500",
    bgColor: "bg-green-100",
  },
];

// Simulate API call
const fetchEventDetails = async (eventId: string): Promise<{ event: Event; seatTiers: SeatTier[] }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const event = MOCK_EVENTS[eventId];
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found`);
  }
  
  return {
    event,
    seatTiers: MOCK_SEAT_TIERS
  };
};

export const useEventDetails = (eventId: string | undefined): UseEventDetailsReturn => {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['eventDetails', eventId],
    queryFn: () => fetchEventDetails(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    event: data?.event || null,
    seatTiers: data?.seatTiers || [],
    isLoading,
    error: error as Error | null,
  };
};
