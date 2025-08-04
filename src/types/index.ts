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


// API response types
export type EventDetailsResponse = {
  event: Event;
  seatTiers: SeatTier[];
};

// Individual seat listing type for "Select Your Seat" feature
export type SeatListing = {
  id: string;
  section: string;
  row: string;
  seats: string;
  price: number;
  quantity: number;
  seller: string;
  isInstantDelivery: boolean;
  sellerRating: number;
  viewQuality: 'Excellent' | 'Great' | 'Good' | 'Limited';
  notes: string[];
  features: string[];
  restrictions?: string[];
};

// Hook return types updated to include seat listings
export type UseEventDetailsReturn = {
  event: Event | null;
  seatTiers: SeatTier[];
  seatListings: SeatListing[];
  isLoading: boolean;
  error: Error | null;
};

// Seat selection types for the new "Select Your Seat" feature
export type SeatTier = {
  id: string;
  name: string;
  description: string;
  availableSeats: number;
  color: string;
  // New properties for seat selection feature
  minPrice?: number;
  maxPrice?: number;
  sections?: string[];
  // Legacy properties for backward compatibility
  price?: number;
  bgColor?: string;
};

export type SeatCoordinates = {
  x: number;
  y: number;
};

export type Seat = {
  id: string;
  row: string | null;
  seat: string | null;
  price: number;
  quantity: number;
  availableQuantity: number;
  isReserved: boolean;
  coordinates: SeatCoordinates;
};

export type SeatSection = {
  id: string;
  name: string;
  seats: Seat[];
};

export type SeatSelection = {
  ticketId: string;
  quantity: number;
  price: number;
  section?: string;
  row?: string;
  seat?: string;
};

export type Reservation = {
  id: string;
  ticketId: string;
  quantity: number;
  expiresAt: string;
};

// API response types for seat selection
export type GetEventTiersResponse = {
  tiers: SeatTier[];
};

export type GetTierSeatsResponse = {
  sections: SeatSection[];
};

export type ReserveSeatsResponse = {
  success: boolean;
  reservations: Reservation[];
  expiresAt: string;
  message: string;
};

export type ReleaseReservationsResponse = {
  success: boolean;
  releasedCount: number;
  message: string;
};

// Checkout state type
export type CheckoutState = {
  eventId: string;
  eventTitle: string;
  tierName?: string;
  seatDetails?: string;
  tierPrice: number;
  quantity: number;
  totalPrice: number;
  seatSelections?: SeatSelection[];
  reservations?: Reservation[];
};
