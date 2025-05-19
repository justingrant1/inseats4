import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Event types
export type Event = Database['public']['Tables']['events']['Row']
export type NewEvent = Database['public']['Tables']['events']['Insert']
export type UpdateEvent = Database['public']['Tables']['events']['Update']

// Ticket types
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type NewTicket = Database['public']['Tables']['tickets']['Insert']
export type UpdateTicket = Database['public']['Tables']['tickets']['Update']

// Order types
export type Order = Database['public']['Tables']['orders']['Row']
export type NewOrder = Database['public']['Tables']['orders']['Insert']
export type UpdateOrder = Database['public']['Tables']['orders']['Update']

// Function to fetch events with optional filters
export async function fetchEvents({ 
  category = null, 
  search = null,
  limit = 10,
  offset = 0,
  isPremium = null,
  isLastMinute = null,
}: { 
  category?: string | null, 
  search?: string | null,
  limit?: number,
  offset?: number,
  isPremium?: boolean | null,
  isLastMinute?: boolean | null,
} = {}): Promise<Event[]> {
  try {
    let query = supabase.from('events').select('*')
    
    // Apply filters if provided
    if (category && category !== 'All') {
      query = query.eq('category', category)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`)
    }

    if (isPremium !== null) {
      query = query.eq('is_premium', isPremium)
    }

    if (isLastMinute !== null) {
      query = query.eq('is_last_minute', isLastMinute)
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
      .order('date', { ascending: true })
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

// Function to fetch a single event by ID
export async function fetchEventById(id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching event with ID ${id}:`, error)
    return null
  }
}

// Function to fetch tickets for an event
export async function fetchTicketsForEvent(eventId: string): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'available')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching tickets for event ${eventId}:`, error)
    return []
  }
}

// Function to create a ticket listing
export async function createTicketListing(ticket: NewTicket): Promise<{ success: boolean, ticket?: Ticket, error?: string }> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, ticket: data }
  } catch (error: any) {
    console.error('Error creating ticket listing:', error)
    return { success: false, error: error.message || 'Failed to create ticket listing' }
  }
}

// Function to create an order
export async function createOrder(order: NewOrder): Promise<{ success: boolean, order?: Order, error?: string }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, order: data }
  } catch (error: any) {
    console.error('Error creating order:', error)
    return { success: false, error: error.message || 'Failed to create order' }
  }
}

// Function to update an order status
export async function updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'canceled'): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error(`Error updating order ${orderId} status:`, error)
    return { success: false, error: error.message || 'Failed to update order status' }
  }
}

// Function to fetch user orders
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error)
    return []
  }
}
