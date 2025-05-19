import { useQuery } from '@tanstack/react-query'

// Configuration
interface TicketNetworkConfig {
  apiKey: string | null;
  consumerKey: string | null;
  consumerSecret: string | null;
  environment: 'sandbox' | 'production';
  wcid: string | null;
  bid: string | null;
}

// Read from environment variables with fallbacks
const config: TicketNetworkConfig = {
  apiKey: import.meta.env.VITE_TICKETNETWORK_API_KEY || null,
  consumerKey: import.meta.env.VITE_TICKETNETWORK_CONSUMER_KEY || null,
  consumerSecret: import.meta.env.VITE_TICKETNETWORK_CONSUMER_SECRET || null,
  environment: (import.meta.env.VITE_TICKETNETWORK_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  wcid: import.meta.env.VITE_TICKETNETWORK_WCID || null,
  bid: import.meta.env.VITE_TICKETNETWORK_BID || null,
}

// OAuth Authentication Client for TicketNetwork
class TicketNetworkAuth {
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  
  constructor(
    private consumerKey: string | null,
    private consumerSecret: string | null,
    private environment: 'sandbox' | 'production'
  ) {}
  
  /**
   * Get active token or generate new one
   * @returns The current access token or null if credentials are missing
   */
  async getToken(): Promise<string | null> {
    if (!this.consumerKey || !this.consumerSecret) {
      console.warn('TicketNetwork OAuth credentials not available');
      return null;
    }
    
    if (this.isTokenValid()) {
      return this.accessToken;
    }
    
    return this.generateNewToken();
  }
  
  /**
   * Check if the current token is valid
   * @returns True if token exists and is not expiring soon
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiresAt) return false;
    
    // Token valid if it doesn't expire in the next 5 minutes
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    return this.tokenExpiresAt > fiveMinutesFromNow;
  }
  
  /**
   * Generate a new OAuth token using client credentials flow
   * @returns New access token or null if request fails
   */
  private async generateNewToken(): Promise<string | null> {
    try {
      const tokenUrl = this.environment === 'production'
        ? 'https://api.ticketnetwork.com/oauth/token'
        : 'https://api.sandbox.ticketnetwork.com/oauth/token';
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.consumerKey!,
          client_secret: this.consumerSecret!,
        }).toString()
      });
      
      if (!response.ok) {
        throw new Error(`Token request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set the token and calculate expiration time
      this.accessToken = data.access_token;
      
      // Tokens typically expire in 3600 seconds (1 hour)
      // We subtract 60 seconds as a safety buffer
      const expiresInSeconds = (data.expires_in || 3600) - 60;
      this.tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
      
      console.log(`Generated new TicketNetwork OAuth token, expires in ${expiresInSeconds} seconds`);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error generating TicketNetwork OAuth token:', error);
      this.accessToken = null;
      this.tokenExpiresAt = null;
      return null;
    }
  }
}

// Initialize the auth client
const authClient = new TicketNetworkAuth(
  config.consumerKey,
  config.consumerSecret,
  config.environment
);

// Mercury API Client for TicketNetwork
class TicketNetworkAPI {
  private baseUrl: string;
  
  constructor(private config: TicketNetworkConfig) {
    this.baseUrl = config.environment === 'production'
      ? 'https://api.ticketnetwork.com/mercury/v5'
      : 'https://api.sandbox.ticketnetwork.com/mercury/v5';
  }
  
  /**
   * Check if all required credentials are available and valid
   */
  async hasValidCredentials(): Promise<boolean> {
    if (!this.config.apiKey || !this.config.consumerKey || !this.config.consumerSecret) {
      return false;
    }
    
    // Check if we can get a valid OAuth token
    const token = await authClient.getToken();
    return !!token;
  }
  
  /**
   * Add authentication headers to fetch requests
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await authClient.getToken();
    const identityContext = this.config.wcid 
      ? `website-config-id=${this.config.wcid}`
      : this.config.bid 
        ? `broker-id=${this.config.bid}` 
        : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (identityContext) {
      headers['X-Identity-Context'] = identityContext;
    }
    
    return headers;
  }
  
  // API endpoint implementations will be added here in the future
}

// Initialize the API client
const apiClient = new TicketNetworkAPI(config);

// Check if we're using mock data or real API
const isUsingMockData = !config.apiKey || 
                       config.apiKey === 'your-ticketnetwork-api-key' ||
                       (!config.consumerKey || !config.consumerSecret);

// Log environment for clarity
console.log(`TicketNetwork running with ${isUsingMockData ? 'MOCK' : 'REAL'} data in ${config.environment} mode`)

// -----------------
// Types
// -----------------

export interface Event {
  id: number
  name: string
  date: string
  venue: {
    id: number
    name: string
    city: string
    stateProvince: string
    country: string
  }
  category: {
    id: number
    name: string
    parentCategoryId: number | null
  }
  imageUrl: string | null
  minPrice: number | null
  maxPrice: number | null
  url: string
}

export interface Venue {
  id: number
  name: string
  city: string
  stateProvince: string
  country: string
  latitude: number
  longitude: number
}

export interface Category {
  id: number
  name: string
  parentCategoryId: number | null
  childCategories?: Category[]
}

export interface Ticket {
  id: number
  eventId: number
  sectionName: string
  rowName: string | null
  quantity: number
  price: number
  currency: string
  notes: string | null
  deliveryMethodList: string[]
  inHandDate: string | null
}

export interface SearchParams {
  keyword?: string
  categoryId?: number
  venueId?: number
  cityName?: string
  stateProvinceCode?: string
  countryCode?: string
  postalCode?: string
  radius?: number
  fromDate?: string
  toDate?: string
  minPrice?: number
  maxPrice?: number
  sortOption?: 'date' | 'price' | 'name'
  sortDirection?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

// -----------------
// Mock Data
// -----------------

// Mock categories
const mockCategories: Category[] = [
  { id: 1, name: 'Concerts', parentCategoryId: null },
  { id: 2, name: 'Sports', parentCategoryId: null },
  { id: 3, name: 'Theater', parentCategoryId: null },
  { id: 4, name: 'Family', parentCategoryId: null },
  { id: 101, name: 'Rock', parentCategoryId: 1 },
  { id: 102, name: 'Pop', parentCategoryId: 1 },
  { id: 103, name: 'Hip-Hop', parentCategoryId: 1 },
  { id: 104, name: 'Jazz', parentCategoryId: 1 },
  { id: 201, name: 'Basketball', parentCategoryId: 2 },
  { id: 202, name: 'Football', parentCategoryId: 2 },
  { id: 203, name: 'Baseball', parentCategoryId: 2 },
  { id: 204, name: 'Soccer', parentCategoryId: 2 },
  { id: 301, name: 'Broadway', parentCategoryId: 3 },
  { id: 302, name: 'Musicals', parentCategoryId: 3 },
  { id: 303, name: 'Comedy', parentCategoryId: 3 },
  { id: 401, name: 'Disney on Ice', parentCategoryId: 4 },
  { id: 402, name: 'Circus', parentCategoryId: 4 },
]

// Mock venues
const mockVenues: Venue[] = [
  {
    id: 1001,
    name: 'Madison Square Garden',
    city: 'New York',
    stateProvince: 'NY',
    country: 'United States',
    latitude: 40.7505,
    longitude: -73.9934
  },
  {
    id: 1002,
    name: 'Barclays Center',
    city: 'Brooklyn',
    stateProvince: 'NY',
    country: 'United States',
    latitude: 40.6828,
    longitude: -73.9758
  },
  {
    id: 1003,
    name: 'Staples Center',
    city: 'Los Angeles',
    stateProvince: 'CA',
    country: 'United States',
    latitude: 34.0430,
    longitude: -118.2673
  },
  {
    id: 1004,
    name: 'United Center',
    city: 'Chicago',
    stateProvince: 'IL',
    country: 'United States',
    latitude: 41.8807,
    longitude: -87.6742
  },
  {
    id: 1005,
    name: 'T-Mobile Arena',
    city: 'Las Vegas',
    stateProvince: 'NV',
    country: 'United States',
    latitude: 36.1030,
    longitude: -115.1783
  },
]

// Generate mock events
const generateMockEvents = (count: number = 50): Event[] => {
  const events: Event[] = []
  const today = new Date()
  
  for (let i = 1; i <= count; i++) {
    // Select random category and venue
    const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)]
    const randomVenue = mockVenues[Math.floor(Math.random() * mockVenues.length)]
    
    // Generate a random date in the next 90 days
    const eventDate = new Date(today)
    eventDate.setDate(today.getDate() + Math.floor(Math.random() * 90))
    
    // Generate random price range
    const minPrice = Math.floor(Math.random() * 100) + 50 // $50-$150
    const maxPrice = minPrice + Math.floor(Math.random() * 200) // minPrice + up to $200
    
    // Create event name based on category
    let eventName = ''
    if (randomCategory.parentCategoryId === 1) { // Concerts
      const artists = ['Taylor Swift', 'Ed Sheeran', 'Beyoncé', 'Justin Timberlake', 'Bruno Mars', 'Adele', 'The Weeknd', 'Billie Eilish']
      eventName = `${artists[Math.floor(Math.random() * artists.length)]} Concert`
    } else if (randomCategory.parentCategoryId === 2) { // Sports
      const teams = ['Lakers', 'Knicks', 'Bulls', 'Warriors', 'Heat', 'Celtics', 'Cowboys', 'Raiders', 'Yankees', 'Red Sox']
      eventName = `${teams[Math.floor(Math.random() * teams.length)]} vs ${teams[Math.floor(Math.random() * teams.length)]}`
    } else if (randomCategory.parentCategoryId === 3) { // Theater
      const shows = ['Hamilton', 'The Lion King', 'Wicked', 'The Book of Mormon', 'Dear Evan Hansen', 'Phantom of the Opera']
      eventName = shows[Math.floor(Math.random() * shows.length)]
    } else if (randomCategory.parentCategoryId === 4) { // Family
      const familyEvents = ['Disney on Ice', 'Cirque du Soleil', 'Monster Jam', 'Marvel Universe Live', 'Sesame Street Live']
      eventName = familyEvents[Math.floor(Math.random() * familyEvents.length)]
    } else {
      // Top level category or undefined parent
      eventName = `${randomCategory.name} Event`
    }
    
    events.push({
      id: 10000 + i,
      name: eventName,
      date: eventDate.toISOString(),
      venue: {
        id: randomVenue.id,
        name: randomVenue.name,
        city: randomVenue.city,
        stateProvince: randomVenue.stateProvince,
        country: randomVenue.country
      },
      category: {
        id: randomCategory.id,
        name: randomCategory.name,
        parentCategoryId: randomCategory.parentCategoryId
      },
      imageUrl: `https://example.com/images/events/${i % 10}.jpg`,
      minPrice: minPrice,
      maxPrice: maxPrice,
      url: `https://example.com/events/${10000 + i}`
    })
  }
  
  return events
}

// Generate mock tickets for a specific event
const generateMockTicketsForEvent = (eventId: number, count: number = 20): Ticket[] => {
  const tickets: Ticket[] = []
  const sections = ['Floor', 'Lower Level', 'Club Level', 'Upper Level', 'Balcony', 'VIP']
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']
  
  // Find the event to get price range
  const event = mockEvents.find(e => e.id === eventId)
  const minPrice = event?.minPrice || 50
  const maxPrice = event?.maxPrice || 250
  
  for (let i = 1; i <= count; i++) {
    const section = sections[Math.floor(Math.random() * sections.length)]
    const row = Math.random() > 0.2 ? rows[Math.floor(Math.random() * rows.length)] : null
    const quantity = Math.floor(Math.random() * 4) + 1 // 1-4 tickets
    const price = Math.floor(Math.random() * (maxPrice - minPrice)) + minPrice
    
    tickets.push({
      id: eventId * 1000 + i,
      eventId: eventId,
      sectionName: section,
      rowName: row,
      quantity: quantity,
      price: price,
      currency: 'USD',
      notes: Math.random() > 0.7 ? 'Great seats with perfect view!' : null,
      deliveryMethodList: ['Mobile', 'Email'],
      inHandDate: new Date().toISOString()
    })
  }
  
  return tickets
}

// Generate the mock events once
const mockEvents = generateMockEvents(50)

// -----------------
// API Functions
// -----------------

// Search events
export async function searchEvents(params: SearchParams = {}): Promise<Event[]> {
  if (isUsingMockData) {
    // Filter mock events based on search params
    let filteredEvents = [...mockEvents]
    
    // Apply keyword filter
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredEvents = filteredEvents.filter(event => 
        event.name.toLowerCase().includes(keyword) || 
        event.venue.name.toLowerCase().includes(keyword) ||
        event.venue.city.toLowerCase().includes(keyword)
      )
    }
    
    // Apply category filter
    if (params.categoryId) {
      filteredEvents = filteredEvents.filter(event => 
        event.category.id === params.categoryId || 
        event.category.parentCategoryId === params.categoryId
      )
    }
    
    // Apply venue filter
    if (params.venueId) {
      filteredEvents = filteredEvents.filter(event => event.venue.id === params.venueId)
    }
    
    // Apply city filter
    if (params.cityName) {
      filteredEvents = filteredEvents.filter(event => 
        event.venue.city.toLowerCase() === params.cityName?.toLowerCase()
      )
    }
    
    // Apply state filter
    if (params.stateProvinceCode) {
      filteredEvents = filteredEvents.filter(event => 
        event.venue.stateProvince.toLowerCase() === params.stateProvinceCode?.toLowerCase()
      )
    }
    
    // Apply date range filters
    if (params.fromDate) {
      const fromDate = new Date(params.fromDate)
      filteredEvents = filteredEvents.filter(event => new Date(event.date) >= fromDate)
    }
    
    if (params.toDate) {
      const toDate = new Date(params.toDate)
      filteredEvents = filteredEvents.filter(event => new Date(event.date) <= toDate)
    }
    
    // Apply price range filters
    if (params.minPrice) {
      filteredEvents = filteredEvents.filter(event => 
        (event.minPrice || 0) >= (params.minPrice || 0)
      )
    }
    
    if (params.maxPrice) {
      filteredEvents = filteredEvents.filter(event => 
        (event.maxPrice || Infinity) <= (params.maxPrice || Infinity)
      )
    }
    
    // Apply sorting
    const sortOption = params.sortOption || 'date'
    const sortDirection = params.sortDirection || 'asc'
    
    filteredEvents.sort((a, b) => {
      if (sortOption === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortOption === 'price') {
        const aPrice = a.minPrice || 0
        const bPrice = b.minPrice || 0
        return sortDirection === 'asc' ? aPrice - bPrice : bPrice - aPrice
      } else if (sortOption === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      return 0
    })
    
    // Apply pagination
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return filteredEvents.slice(start, end)
  } else {
    // Real API call
    try {
      const queryParams = new URLSearchParams()
      
      // Add all search parameters to query string
      if (params.keyword) queryParams.append('keyword', params.keyword)
      if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString())
      if (params.venueId) queryParams.append('venueId', params.venueId.toString())
      if (params.cityName) queryParams.append('cityName', params.cityName)
      if (params.stateProvinceCode) queryParams.append('stateProvinceCode', params.stateProvinceCode)
      if (params.countryCode) queryParams.append('countryCode', params.countryCode)
      if (params.postalCode) queryParams.append('postalCode', params.postalCode)
      if (params.radius) queryParams.append('radius', params.radius.toString())
      if (params.fromDate) queryParams.append('fromDate', params.fromDate)
      if (params.toDate) queryParams.append('toDate', params.toDate)
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString())
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString())
      if (params.sortOption) queryParams.append('sortOption', params.sortOption)
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      
      // Add API key
      if (config.apiKey) {
        queryParams.append('apiKey', config.apiKey)
      }
      
      const response = await fetch(
        `https://api.ticketnetwork.com/mercury/v1/events?${queryParams.toString()}`,
        { method: 'GET' }
      )
      
      if (!response.ok) throw new Error('Failed to search events')
      const data = await response.json()
      return data.events
    } catch (error) {
      console.error('Error searching events:', error)
      return []
    }
  }
}

// Get event details
export async function getEventDetails(eventId: number): Promise<Event | null> {
  if (isUsingMockData) {
    const event = mockEvents.find(e => e.id === eventId)
    return event || null
  } else {
    try {
      const response = await fetch(
        `https://api.ticketnetwork.com/mercury/v1/events/${eventId}?apiKey=${config.apiKey || ''}`,
        { method: 'GET' }
      )
      
      if (!response.ok) throw new Error(`Failed to get event details for ID ${eventId}`)
      return await response.json()
    } catch (error) {
      console.error(`Error getting event details for ID ${eventId}:`, error)
      return null
    }
  }
}

// Get tickets for an event
export async function getTicketsForEvent(eventId: number): Promise<Ticket[]> {
  if (isUsingMockData) {
    return generateMockTicketsForEvent(eventId)
  } else {
    try {
      const response = await fetch(
        `https://api.ticketnetwork.com/mercury/v1/events/${eventId}/tickets?apiKey=${config.apiKey || ''}`,
        { method: 'GET' }
      )
      
      if (!response.ok) throw new Error(`Failed to get tickets for event ID ${eventId}`)
      const data = await response.json()
      return data.tickets
    } catch (error) {
      console.error(`Error getting tickets for event ID ${eventId}:`, error)
      return []
    }
  }
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  if (isUsingMockData) {
    return mockCategories
  } else {
    try {
      const response = await fetch(
        `https://api.ticketnetwork.com/mercury/v1/categories?apiKey=${config.apiKey || ''}`,
        { method: 'GET' }
      )
      
      if (!response.ok) throw new Error('Failed to get categories')
      const data = await response.json()
      return data.categories
    } catch (error) {
      console.error('Error getting categories:', error)
      return []
    }
  }
}

// Format categories into a hierarchical structure
export function formatCategoriesHierarchy(categories: Category[]): Category[] {
  const topLevelCategories = categories.filter(c => c.parentCategoryId === null)
  
  topLevelCategories.forEach(topCat => {
    topCat.childCategories = categories.filter(c => c.parentCategoryId === topCat.id)
  })
  
  return topLevelCategories
}

// -----------------
// React Query Hooks
// -----------------

// Hook for searching events
export const useSearchEvents = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => searchEvents(params),
  })
}

// Hook for getting event details
export const useEventDetails = (eventId: number | null) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventId ? getEventDetails(eventId) : null,
    enabled: !!eventId,
  })
}

// Hook for getting tickets for an event
export const useEventTickets = (eventId: number | null) => {
  return useQuery({
    queryKey: ['tickets', eventId],
    queryFn: () => eventId ? getTicketsForEvent(eventId) : [],
    enabled: !!eventId,
  })
}

// Hook for getting categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
}
