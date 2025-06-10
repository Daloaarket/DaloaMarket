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
      users: {
        Row: {
          id: string
          email: string
          phone: string
          full_name: string
          district: string
          created_at: string
          rating: number | null
        }
        Insert: {
          id: string
          email: string
          phone: string
          full_name: string
          district: string
          created_at?: string
          rating?: number | null
        }
        Update: {
          id?: string
          email?: string
          phone?: string
          full_name?: string
          district?: string
          created_at?: string
          rating?: number | null
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          condition: string
          district: string
          photos: string[]
          boosted_until: string | null
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          condition: string
          district: string
          photos: string[]
          boosted_until?: string | null
          created_at?: string
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          price?: number
          category?: string
          condition?: string
          district?: string
          photos?: string[]
          boosted_until?: string | null
          created_at?: string
          status?: string
        }
      }
      messages: {
        Row: {
          id: string
          listing_id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          listing_id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          listing_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          listing_id: string | null
          amount: number
          type: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id?: string | null
          amount: number
          type: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string | null
          amount?: number
          type?: string
          status?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewed_id: string
          listing_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewed_id: string
          listing_id: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewed_id?: string
          listing_id?: string
          rating?: number
          comment?: string
          created_at?: string
        }
      }
    }
  }
}