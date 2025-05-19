export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          date: string
          venue: string
          location: string
          image_url: string | null
          min_price: number | null
          max_price: number | null
          is_premium: boolean
          is_last_minute: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          date: string
          venue: string
          location: string
          image_url?: string | null
          min_price?: number | null
          max_price?: number | null
          is_premium?: boolean
          is_last_minute?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          date?: string
          venue?: string
          location?: string
          image_url?: string | null
          min_price?: number | null
          max_price?: number | null
          is_premium?: boolean
          is_last_minute?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          tier_name: string
          section: string | null
          row: string | null
          seat: string | null
          price: number
          quantity: number
          seller_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          tier_name: string
          section?: string | null
          row?: string | null
          seat?: string | null
          price: number
          quantity: number
          seller_id?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          tier_name?: string
          section?: string | null
          row?: string | null
          seat?: string | null
          price?: number
          quantity?: number
          seller_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          user_email: string
          user_name: string
          ticket_id: string
          quantity: number
          total_price: number
          status: string
          payment_intent_id: string | null
          payment_method: string | null
          billing_address: Json | null
          shipping_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email: string
          user_name: string
          ticket_id: string
          quantity: number
          total_price: number
          status: string
          payment_intent_id?: string | null
          payment_method?: string | null
          billing_address?: Json | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_email?: string
          user_name?: string
          ticket_id?: string
          quantity?: number
          total_price?: number
          status?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          billing_address?: Json | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_ticket_id_fkey"
            columns: ["ticket_id"]
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
