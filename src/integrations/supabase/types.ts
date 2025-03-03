export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          properties_count: number | null
          rating: number | null
          service_areas: string[] | null
          specialties: string[] | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          properties_count?: number | null
          rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          properties_count?: number | null
          rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      agency_commissions: {
        Row: {
          agency_id: string
          calculation_type: string
          created_at: string | null
          effective_date: string
          id: string
          maximum_amount: number | null
          minimum_amount: number | null
          property_id: string
          rate: number
        }
        Insert: {
          agency_id: string
          calculation_type: string
          created_at?: string | null
          effective_date: string
          id?: string
          maximum_amount?: number | null
          minimum_amount?: number | null
          property_id: string
          rate: number
        }
        Update: {
          agency_id?: string
          calculation_type?: string
          created_at?: string | null
          effective_date?: string
          id?: string
          maximum_amount?: number | null
          minimum_amount?: number | null
          property_id?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "agency_commissions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_commissions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agency_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "agency_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "agency_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_reference: string
          created_at: string
          end_date: string
          guests: number
          id: string
          payment_status: string
          property_id: string | null
          start_date: string
          status: string
          total_price: number
          user_id: string | null
        }
        Insert: {
          booking_reference: string
          created_at?: string
          end_date: string
          guests: number
          id?: string
          payment_status?: string
          property_id?: string | null
          start_date: string
          status: string
          total_price: number
          user_id?: string | null
        }
        Update: {
          booking_reference?: string
          created_at?: string
          end_date?: string
          guests?: number
          id?: string
          payment_status?: string
          property_id?: string | null
          start_date?: string
          status?: string
          total_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string
          end_date: string
          id: string
          monthly_rent: number
          property_id: string | null
          security_deposit: number
          start_date: string
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          monthly_rent: number
          property_id?: string | null
          security_deposit: number
          start_date: string
          status: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          monthly_rent?: number
          property_id?: string | null
          security_deposit?: number
          start_date?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_dashboard_stats: {
        Row: {
          id: string
          last_updated: string | null
          maintenance_issues: number | null
          occupancy_rate: number | null
          occupied_units: number
          overdue_payments: number | null
          owner_id: string
          total_income: number
          total_properties: number
          vacant_units: number
        }
        Insert: {
          id?: string
          last_updated?: string | null
          maintenance_issues?: number | null
          occupancy_rate?: number | null
          occupied_units: number
          overdue_payments?: number | null
          owner_id: string
          total_income: number
          total_properties: number
          vacant_units: number
        }
        Update: {
          id?: string
          last_updated?: string | null
          maintenance_issues?: number | null
          occupancy_rate?: number | null
          occupied_units?: number
          overdue_payments?: number | null
          owner_id?: string
          total_income?: number
          total_properties?: number
          vacant_units?: number
        }
        Relationships: [
          {
            foreignKeyName: "owner_dashboard_stats_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_payment_history: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          owner_id: string
          payment_date: string
          payment_period_end: string | null
          payment_period_start: string | null
          payment_type: string
          property_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          owner_id: string
          payment_date: string
          payment_period_end?: string | null
          payment_period_start?: string | null
          payment_type: string
          property_id: string
          status: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          owner_id?: string
          payment_date?: string
          payment_period_end?: string | null
          payment_period_start?: string | null
          payment_type?: string
          property_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_payment_history_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_payment_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "owner_payment_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "owner_payment_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_properties_details: {
        Row: {
          active: boolean | null
          agency_id: string | null
          created_at: string | null
          current_value: number
          id: string
          owner_id: string
          ownership_percentage: number
          property_id: string
          purchase_date: string
          purchase_price: number
        }
        Insert: {
          active?: boolean | null
          agency_id?: string | null
          created_at?: string | null
          current_value: number
          id?: string
          owner_id: string
          ownership_percentage: number
          property_id: string
          purchase_date: string
          purchase_price: number
        }
        Update: {
          active?: boolean | null
          agency_id?: string | null
          created_at?: string | null
          current_value?: number
          id?: string
          owner_id?: string
          ownership_percentage?: number
          property_id?: string
          purchase_date?: string
          purchase_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "owner_properties_details_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_properties_details_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "owner_properties_details_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_properties_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "owner_properties_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "owner_properties_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_bulk_update_items: {
        Row: {
          bulk_update_id: string
          created_at: string | null
          id: string
          new_status: string
          payment_id: string
          previous_status: string | null
        }
        Insert: {
          bulk_update_id: string
          created_at?: string | null
          id?: string
          new_status: string
          payment_id: string
          previous_status?: string | null
        }
        Update: {
          bulk_update_id?: string
          created_at?: string | null
          id?: string
          new_status?: string
          payment_id?: string
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_bulk_update_items_bulk_update_id_fkey"
            columns: ["bulk_update_id"]
            isOneToOne: false
            referencedRelation: "payment_bulk_updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_bulk_update_items_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_bulk_updates: {
        Row: {
          id: string
          notes: string | null
          payments_count: number
          status: string
          update_date: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          payments_count: number
          status: string
          update_date?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          payments_count?: number
          status?: string
          update_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_configurations: {
        Row: {
          created_at: string | null
          default_agency_fees_percentage: number
          default_commission_rate: number
          default_payment_frequency: string
          default_security_deposit_multiplier: number
          id: string
          property_category: string
          proration_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_agency_fees_percentage: number
          default_commission_rate: number
          default_payment_frequency: string
          default_security_deposit_multiplier: number
          id?: string
          property_category: string
          proration_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_agency_fees_percentage?: number
          default_commission_rate?: number
          default_payment_frequency?: string
          default_security_deposit_multiplier?: number
          id?: string
          property_category?: string
          proration_rules?: Json | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          is_auto_generated: boolean
          lease_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          payment_type: string
          processed_by: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          is_auto_generated?: boolean
          lease_id?: string | null
          notes?: string | null
          payment_date: string
          payment_method: string
          payment_type?: string
          processed_by?: string | null
          status: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          is_auto_generated?: boolean
          lease_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_type?: string
          processed_by?: string | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
      properties: {
        Row: {
          agency_fees: number | null
          agency_id: string | null
          area: number
          bathrooms: number
          bedrooms: number
          commission_rate: number | null
          created_at: string
          description: string | null
          features: string[] | null
          furnished: boolean | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          owner_id: string | null
          payment_frequency: string | null
          pets_allowed: boolean | null
          price: number
          property_category: string | null
          security_deposit: number | null
          status: string | null
          title: string
          type: string
          updated_at: string
          virtual_tour_url: string | null
          year_built: number | null
        }
        Insert: {
          agency_fees?: number | null
          agency_id?: string | null
          area: number
          bathrooms: number
          bedrooms: number
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          furnished?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          owner_id?: string | null
          payment_frequency?: string | null
          pets_allowed?: boolean | null
          price: number
          property_category?: string | null
          security_deposit?: number | null
          status?: string | null
          title: string
          type: string
          updated_at?: string
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Update: {
          agency_fees?: number | null
          agency_id?: string | null
          area?: number
          bathrooms?: number
          bedrooms?: number
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          furnished?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          owner_id?: string | null
          payment_frequency?: string | null
          pets_allowed?: boolean | null
          price?: number
          property_category?: string | null
          security_deposit?: number | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owners: {
        Row: {
          bank_details: Json | null
          company_name: string | null
          created_at: string
          id: string
          payment_method: string
          payment_percentage: number
          tax_id: string | null
          user_id: string | null
        }
        Insert: {
          bank_details?: Json | null
          company_name?: string | null
          created_at?: string
          id?: string
          payment_method: string
          payment_percentage: number
          tax_id?: string | null
          user_id?: string | null
        }
        Update: {
          bank_details?: Json | null
          company_name?: string | null
          created_at?: string
          id?: string
          payment_method?: string
          payment_percentage?: number
          tax_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          agency_id: string | null
          created_at: string
          email: string
          emergency_contact: Json | null
          employment_status: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          photo_url: string | null
          profession: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          email: string
          emergency_contact?: Json | null
          employment_status?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          photo_url?: string | null
          profession?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          email?: string
          emergency_contact?: Json | null
          employment_status?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          photo_url?: string | null
          profession?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
    }
    Views: {
      owner_properties_with_agencies: {
        Row: {
          agency_id: string | null
          agency_logo: string | null
          agency_name: string | null
          commission_rate: number | null
          current_value: number | null
          location: string | null
          owner_id: string | null
          owner_name: string | null
          ownership_percentage: number | null
          payment_frequency: string | null
          price: number | null
          property_category: string | null
          property_id: string | null
          property_title: string | null
          status: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_properties_details_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_revenue_summary: {
        Row: {
          last_payment_date: string | null
          overdue_payments_count: number | null
          owner_id: string | null
          owner_name: string | null
          property_id: string | null
          property_title: string | null
          total_rent_overdue: number | null
          total_rent_paid: number | null
          total_rent_pending: number | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_payment_history_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
