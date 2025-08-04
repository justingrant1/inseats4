import { useQuery } from '@tanstack/react-query';
import { Event, SeatTier, SeatListing, UseEventDetailsReturn } from '@/types';
import { getEventDetails, getTicketsForEvent } from '@/lib/ticketnetwork';
import type { Event as TNEvent, Ticket as TNTicket } from '@/lib/ticketnetwork';

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
    description: "Seats in the most premium areas, offering the best views closest to the stage or field.",
    price: 450,
    availableSeats: 12,
    color: "bg-amber-500",
    bgColor: "bg-amber-100",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Lower-level seats offering excellent proximity to the action.",
    price: 250,
    availableSeats: 28,
    color: "bg-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Mid-level seating providing solid views of the entire venue.",
    price: 150,
    availableSeats: 64,
    color: "bg-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    id: "budget",
    name: "Budget",
    description: "Upper-level seats for a full view of the event at the best value.",
    price: 85,
    availableSeats: 103,
    color: "bg-green-500",
    bgColor: "bg-green-100",
  },
];

// Transform TicketNetwork event to our Event type
const transformTNEventToEvent = (tnEvent: TNEvent): Event => {
  return {
    id: tnEvent.id.toString(),
    title: tnEvent.name,
    category: tnEvent.category.name,
    date: new Date(tnEvent.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
    venue: tnEvent.venue.name,
    location: `${tnEvent.venue.city}, ${tnEvent.venue.stateProvince}`,
    imageUrl: tnEvent.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    minPrice: tnEvent.minPrice || 0,
    maxPrice: tnEvent.maxPrice || 0,
    isPremium: (tnEvent.minPrice || 0) > 200,
    isLastMinute: false,
    description: `Experience ${tnEvent.name} at ${tnEvent.venue.name} in ${tnEvent.venue.city}, ${tnEvent.venue.stateProvince}.`
  };
};

// Transform TicketNetwork tickets to SeatListings
const transformTNTicketsToSeatListings = (tnTickets: TNTicket[]): SeatListing[] => {
  return tnTickets.map((ticket, index) => ({
    id: ticket.id.toString(),
    section: ticket.sectionName,
    row: ticket.rowName || 'General Admission',
    seats: ticket.quantity > 1 ? `${ticket.quantity} seats` : '1 seat',
    price: ticket.price,
    quantity: ticket.quantity,
    seller: `Seller ${Math.floor(Math.random() * 1000)}`,
    isInstantDelivery: ticket.deliveryMethodList.includes('Mobile') || ticket.deliveryMethodList.includes('Email'),
    sellerRating: 4.2 + Math.random() * 0.7, // Random rating between 4.2-4.9
    viewQuality: index % 4 === 0 ? 'Excellent' : index % 3 === 0 ? 'Great' : index % 2 === 0 ? 'Good' : 'Limited',
    notes: ticket.notes ? [ticket.notes] : [],
    features: ticket.deliveryMethodList,
    restrictions: []
  }));
};

// Generate seat tiers from tickets
const generateSeatTiersFromTickets = (tickets: TNTicket[]): SeatTier[] => {
  const sectionMap = new Map<string, { prices: number[], count: number }>();
  
  tickets.forEach(ticket => {
    const section = ticket.sectionName;
    if (!sectionMap.has(section)) {
      sectionMap.set(section, { prices: [], count: 0 });
    }
    const sectionData = sectionMap.get(section)!;
    sectionData.prices.push(ticket.price);
    sectionData.count += ticket.quantity;
  });

  const tiers: SeatTier[] = [];
  const colors = [
    { color: "bg-amber-500", bgColor: "bg-amber-100" },
    { color: "bg-purple-500", bgColor: "bg-purple-100" },
    { color: "bg-blue-500", bgColor: "bg-blue-100" },
    { color: "bg-green-500", bgColor: "bg-green-100" },
  ];

  let colorIndex = 0;
  sectionMap.forEach((data, section) => {
    const avgPrice = data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length;
    const colorScheme = colors[colorIndex % colors.length];
    
    tiers.push({
      id: section.toLowerCase().replace(/\s+/g, '-'),
      name: section,
      description: `${section} seating with great views`,
      price: Math.round(avgPrice),
      availableSeats: data.count,
      color: colorScheme.color,
      bgColor: colorScheme.bgColor,
    });
    
    colorIndex++;
  });

  return tiers.sort((a, b) => b.price - a.price); // Sort by price descending
};

// Fetch event details and tickets from TicketNetwork API
const fetchEventDetails = async (eventId: string): Promise<{ event: Event; seatTiers: SeatTier[]; seatListings: SeatListing[] }> => {
  const eventIdNum = parseInt(eventId);
  
  // Try to get real data from TicketNetwork API
  const [tnEvent, tnTickets] = await Promise.all([
    getEventDetails(eventIdNum),
    getTicketsForEvent(eventIdNum)
  ]);

  if (tnEvent) {
    // Use real TicketNetwork data
    const event = transformTNEventToEvent(tnEvent);
    const seatListings = transformTNTicketsToSeatListings(tnTickets);
    const seatTiers = generateSeatTiersFromTickets(tnTickets);
    
    return { event, seatTiers, seatListings };
  } else {
    // Fallback to mock data
    const event = MOCK_EVENTS[eventId];
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }
    
    // Generate mock seat listings
    const mockSeatListings: SeatListing[] = [
      {
        id: "1",
        section: "Floor",
        row: "A",
        seats: "1-2",
        price: 450,
        quantity: 2,
        seller: "TicketMaster Pro",
        isInstantDelivery: true,
        sellerRating: 4.8,
        viewQuality: 'Excellent',
        notes: ["Amazing view!", "Close to stage"],
        features: ["Mobile Entry", "Instant Download"],
        restrictions: []
      },
      {
        id: "2",
        section: "Lower Level",
        row: "C",
        seats: "15-16",
        price: 275,
        quantity: 2,
        seller: "StubHub Elite",
        isInstantDelivery: true,
        sellerRating: 4.6,
        viewQuality: 'Great',
        notes: ["Great seats for the price"],
        features: ["Mobile Entry"],
        restrictions: []
      },
      {
        id: "3",
        section: "Upper Level",
        row: "M",
        seats: "8-11",
        price: 125,
        quantity: 4,
        seller: "SeatGeek Plus",
        isInstantDelivery: false,
        sellerRating: 4.4,
        viewQuality: 'Good',
        notes: [],
        features: ["Physical Tickets"],
        restrictions: ["Must be picked up 2 hours before event"]
      }
    ];
    
    return {
      event,
      seatTiers: MOCK_SEAT_TIERS,
      seatListings: mockSeatListings
    };
  }
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
    seatListings: data?.seatListings || [],
    isLoading,
    error: error as Error | null,
  };
};
