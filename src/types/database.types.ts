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
      webhook_events: {
        Row: {
          id: string
          event_type: string
          payload: Json
          status: string
          processed_at: string | null
          error: string | null
          created_at: string
          retry_count: number
          idempotency_key: string | null
        }
        Insert: {
          id?: string
          event_type: string
          payload: Json
          status?: string
          processed_at?: string | null
          error?: string | null
          created_at?: string
          retry_count?: number
          idempotency_key?: string | null
        }
        Update: {
          id?: string
          event_type?: string
          payload?: Json
          status?: string
          processed_at?: string | null
          error?: string | null
          created_at?: string
          retry_count?: number
          idempotency_key?: string | null
        }
        Relationships: []
      }
      ticket_deliveries: {
        Row: {
          id: string
          ticket_id: string
          delivery_method: string
          recipient: string
          status: string
          delivery_id: string | null
          provider_response: Json | null
          created_at: string
          completed_at: string | null
          attempts: number
          error_details: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          delivery_method: string
          recipient: string
          status?: string
          delivery_id?: string | null
          provider_response?: Json | null
          created_at?: string
          completed_at?: string | null
          attempts?: number
          error_details?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          delivery_method?: string
          recipient?: string
          status?: string
          delivery_id?: string | null
          provider_response?: Json | null
          created_at?: string
          completed_at?: string | null
          attempts?: number
          error_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_deliveries_ticket_id_fkey"
            columns: ["ticket_id"]
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
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
          barcode: string | null
          barcode_type: string | null
          electronic_ticket_url: string | null
          wallet_pass_url: string | null
          last_delivery_timestamp: string | null
          delivery_status: string | null
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
          barcode?: string | null
          barcode_type?: string | null
          electronic_ticket_url?: string | null
          wallet_pass_url?: string | null
          last_delivery_timestamp?: string | null
          delivery_status?: string | null
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
          barcode?: string | null
          barcode_type?: string | null
          electronic_ticket_url?: string | null
          wallet_pass_url?: string | null
          last_delivery_timestamp?: string | null
          delivery_status?: string | null
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
          webhook_logs: Json[] | null
          last_webhook_status: string | null
          last_webhook_timestamp: string | null
          notification_sent: boolean
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
          webhook_logs?: Json[] | null
          last_webhook_status?: string | null
          last_webhook_timestamp?: string | null
          notification_sent?: boolean
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
          webhook_logs?: Json[] | null
          last_webhook_status?: string | null
          last_webhook_timestamp?: string | null
          notification_sent?: boolean
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
