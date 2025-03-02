
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
      properties: {
        Row: {
          id: string
          title: string
          type: string
          price: number
          location: string
          area: number
          bedrooms: number
          bathrooms: number
          features: string[]
          image_url: string
          created_at?: string
          updated_at?: string
          description?: string
          status?: string
          agent_id?: string
          agency_id?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          title: string
          type: string
          price: number
          location: string
          area: number
          bedrooms: number
          bathrooms: number
          features?: string[]
          image_url: string
          created_at?: string
          updated_at?: string
          description?: string
          status?: string
          agent_id?: string
          agency_id?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          price?: number
          location?: string
          area?: number
          bedrooms?: number
          bathrooms?: number
          features?: string[]
          image_url?: string
          created_at?: string
          updated_at?: string
          description?: string
          status?: string
          agent_id?: string
          agency_id?: string
        }
      }
      agencies: {
        Row: {
          id: string
          name: string
          logo_url: string
          location: string
          properties_count: number
          rating: number
          verified: boolean
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          name: string
          logo_url: string
          location: string
          properties_count?: number
          rating?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string
          location?: string
          properties_count?: number
          rating?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          avatar_url?: string
          role?: 'admin' | 'agency' | 'owner' | 'public'
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          avatar_url?: string
          role?: 'admin' | 'agency' | 'owner' | 'public'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          avatar_url?: string
          role?: 'admin' | 'agency' | 'owner' | 'public'
          created_at?: string
          updated_at?: string
        }
      }
      // Add more tables as needed
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
