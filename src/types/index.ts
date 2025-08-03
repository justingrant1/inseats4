// Re-export database types
export * from './database.types';

// Event-related types
export type SeatAvailability = "limited" | "available" | "selling-fast";

export type Event = {
  id: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  location: string;
  imageUrl: string;
  minPrice: number;
  maxPrice: number;
  isPremium?: boolean;
  isLastMinute?: boolean;
  availableSeats?: number; 
  seatAvailability?: SeatAvailability;
  description?: string;
};

// Seat tier types for event details
export type SeatTier = {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSeats: number;
  color: string;
  bgColor: string;
};

// API response types
export type EventDetailsResponse = {
  event: Event;
  seatTiers: SeatTier[];
};

// Hook return types
export type UseEventDetailsReturn = {
  event: Event | null;
  seatTiers: SeatTier[];
  isLoading: boolean;
  error: Error | null;
};

// Checkout state type
export type CheckoutState = {
  eventId: string;
  eventTitle: string;
  tierName: string;
  tierPrice: number;
  quantity: number;
  totalPrice: number;
};
