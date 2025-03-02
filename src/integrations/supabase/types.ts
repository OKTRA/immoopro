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
      admin_notifications: {
        Row: {
          admin_id: string | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "administrators"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_payment_notifications: {
        Row: {
          agency_id: string | null
          amount: number
          created_at: string | null
          id: string
          is_read: boolean | null
          payment_id: string
          payment_method: string
          status: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          payment_id: string
          payment_method: string
          status: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          payment_id?: string
          payment_method?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_payment_notifications_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      administrators: {
        Row: {
          agency_id: string | null
          created_at: string | null
          id: string
          is_super_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          id: string
          is_super_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "administrators_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agencies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          current_profiles_count: number | null
          current_properties_count: number | null
          current_tenants_count: number | null
          email: string | null
          has_received_expiry_notice: boolean | null
          id: string
          list_properties_on_site: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          show_phone_on_site: boolean | null
          status: string
          subscription_end_date: string | null
          subscription_plan_id: string | null
          subscription_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_profiles_count?: number | null
          current_properties_count?: number | null
          current_tenants_count?: number | null
          email?: string | null
          has_received_expiry_notice?: boolean | null
          id?: string
          list_properties_on_site?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          show_phone_on_site?: boolean | null
          status?: string
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_profiles_count?: number | null
          current_properties_count?: number | null
          current_tenants_count?: number | null
          email?: string | null
          has_received_expiry_notice?: boolean | null
          id?: string
          list_properties_on_site?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          show_phone_on_site?: boolean | null
          status?: string
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_owners: {
        Row: {
          agency_id: string | null
          created_at: string | null
          id: string
          owner_id: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_owners_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_owners_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_apartment_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "agency_owners_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_dashboard_stats"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "agency_owners_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_expenses_view"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "agency_owners_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "agency_owners_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "agency_owners_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      apartment_inspections: {
        Row: {
          created_at: string | null
          damage_description: string | null
          deposit_returned: number | null
          has_damages: boolean | null
          id: string
          inspection_date: string
          lease_id: string
          photo_urls: string[] | null
          repair_costs: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          damage_description?: string | null
          deposit_returned?: number | null
          has_damages?: boolean | null
          id?: string
          inspection_date?: string
          lease_id: string
          photo_urls?: string[] | null
          repair_costs?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          damage_description?: string | null
          deposit_returned?: number | null
          has_damages?: boolean | null
          id?: string
          inspection_date?: string
          lease_id?: string
          photo_urls?: string[] | null
          repair_costs?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_inspections_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "apartment_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_inspections_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_details"
            referencedColumns: ["id"]
          },
        ]
      }
      apartment_lease_payments: {
        Row: {
          agency_id: string
          amount: number
          commission_percentage: number | null
          created_at: string | null
          due_date: string | null
          effective_date: string | null
          first_rent_start_date: string | null
          historical_entry: boolean | null
          id: string
          late_fee_amount: number | null
          lease_id: string
          modification_date: string | null
          modified_by: string | null
          monitoring_status: string | null
          payment_date: string | null
          payment_method: string | null
          payment_notes: string | null
          payment_period_end: string | null
          payment_period_start: string
          payment_status_type: string | null
          payment_type: string | null
          status: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          amount: number
          commission_percentage?: number | null
          created_at?: string | null
          due_date?: string | null
          effective_date?: string | null
          first_rent_start_date?: string | null
          historical_entry?: boolean | null
          id?: string
          late_fee_amount?: number | null
          lease_id: string
          modification_date?: string | null
          modified_by?: string | null
          monitoring_status?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_period_end?: string | null
          payment_period_start: string
          payment_status_type?: string | null
          payment_type?: string | null
          status?: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          amount?: number
          commission_percentage?: number | null
          created_at?: string | null
          due_date?: string | null
          effective_date?: string | null
          first_rent_start_date?: string | null
          historical_entry?: boolean | null
          id?: string
          late_fee_amount?: number | null
          lease_id?: string
          modification_date?: string | null
          modified_by?: string | null
          monitoring_status?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_period_end?: string | null
          payment_period_start?: string
          payment_status_type?: string | null
          payment_type?: string | null
          status?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_lease_payments_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_lease_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "apartment_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_lease_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_lease_payments_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      apartment_leases: {
        Row: {
          agency_id: string
          created_at: string | null
          deposit_amount: number | null
          deposit_return_amount: number | null
          deposit_return_date: string | null
          deposit_return_notes: string | null
          deposit_returned: boolean | null
          duration_type: string
          end_date: string | null
          id: string
          initial_fees_paid: boolean | null
          initial_payments_completed: boolean | null
          payment_frequency: string
          payment_type: string | null
          rent_amount: number
          start_date: string
          status: string
          tenant_id: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          deposit_amount?: number | null
          deposit_return_amount?: number | null
          deposit_return_date?: string | null
          deposit_return_notes?: string | null
          deposit_returned?: boolean | null
          duration_type: string
          end_date?: string | null
          id?: string
          initial_fees_paid?: boolean | null
          initial_payments_completed?: boolean | null
          payment_frequency: string
          payment_type?: string | null
          rent_amount: number
          start_date: string
          status?: string
          tenant_id: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          deposit_amount?: number | null
          deposit_return_amount?: number | null
          deposit_return_date?: string | null
          deposit_return_notes?: string | null
          deposit_returned?: boolean | null
          duration_type?: string
          end_date?: string | null
          id?: string
          initial_fees_paid?: boolean | null
          initial_payments_completed?: boolean | null
          payment_frequency?: string
          payment_type?: string | null
          rent_amount?: number
          start_date?: string
          status?: string
          tenant_id?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_leases_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "apartment_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "apartment_tenants_with_rent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "apartment_units"
            referencedColumns: ["id"]
          },
        ]
      }
      apartment_tenants: {
        Row: {
          additional_notes: string | null
          agency_fees: number | null
          agency_id: string
          bank_account_number: string | null
          bank_name: string | null
          birth_date: string | null
          created_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employer_address: string | null
          employer_name: string | null
          employer_phone: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          photo_id_url: string | null
          profession: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          agency_fees?: number | null
          agency_id: string
          bank_account_number?: string | null
          bank_name?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer_address?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          photo_id_url?: string | null
          profession?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          agency_fees?: number | null
          agency_id?: string
          bank_account_number?: string | null
          bank_name?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer_address?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          photo_id_url?: string | null
          profession?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_tenants_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      apartment_unit_pricing: {
        Row: {
          created_at: string | null
          duration_type: string
          id: string
          price: number
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_type: string
          id?: string
          price: number
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_type?: string
          id?: string
          price?: number
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_unit_pricing_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "apartment_units"
            referencedColumns: ["id"]
          },
        ]
      }
      apartment_units: {
        Row: {
          apartment_id: string
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          commission_percentage: number | null
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          floor_level: string | null
          floor_number: number | null
          has_pool: boolean | null
          id: string
          kitchen_count: number | null
          living_rooms: number | null
          rent_amount: number
          status: string | null
          store_count: number | null
          unit_name: string | null
          unit_number: string
          updated_at: string | null
        }
        Insert: {
          apartment_id: string
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          commission_percentage?: number | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          floor_level?: string | null
          floor_number?: number | null
          has_pool?: boolean | null
          id?: string
          kitchen_count?: number | null
          living_rooms?: number | null
          rent_amount: number
          status?: string | null
          store_count?: number | null
          unit_name?: string | null
          unit_number: string
          updated_at?: string | null
        }
        Update: {
          apartment_id?: string
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          commission_percentage?: number | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          floor_level?: string | null
          floor_number?: number | null
          has_pool?: boolean | null
          id?: string
          kitchen_count?: number | null
          living_rooms?: number | null
          rent_amount?: number
          status?: string | null
          store_count?: number | null
          unit_name?: string | null
          unit_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_units_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_units_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "owner_apartment_revenues"
            referencedColumns: ["apartment_id"]
          },
        ]
      }
      apartments: {
        Row: {
          address: string | null
          agency_id: string
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          neighborhood: string | null
          owner_id: string | null
          total_units: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          agency_id: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          owner_id?: string | null
          total_units?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          agency_id?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          owner_id?: string | null
          total_units?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartments_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_apartment_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "apartments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_dashboard_stats"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "apartments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_expenses_view"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "apartments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "apartments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "apartments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agency_id: string | null
          check_in_date: string
          check_out_date: string
          created_at: string | null
          id: string
          payment_status: string | null
          property_id: string
          status: string | null
          tenant_id: string | null
          total_price: number
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          check_in_date: string
          check_out_date: string
          created_at?: string | null
          id?: string
          payment_status?: string | null
          property_id: string
          status?: string | null
          tenant_id?: string | null
          total_price: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          check_in_date?: string
          check_out_date?: string
          created_at?: string | null
          id?: string
          payment_status?: string | null
          property_id?: string
          status?: string | null
          tenant_id?: string | null
          total_price?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          agency_id: string | null
          created_at: string | null
          created_by_user_id: string | null
          end_date: string | null
          id: string
          montant: number
          property_id: string | null
          start_date: string | null
          statut: string | null
          tenant_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          end_date?: string | null
          id?: string
          montant: number
          property_id?: string | null
          start_date?: string | null
          statut?: string | null
          tenant_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          end_date?: string | null
          id?: string
          montant?: number
          property_id?: string | null
          start_date?: string | null
          statut?: string | null
          tenant_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          agency_id: string | null
          created_at: string | null
          created_by_user_id: string | null
          date: string
          description: string | null
          id: string
          montant: number
          property_id: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          date: string
          description?: string | null
          id?: string
          montant: number
          property_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          date?: string
          description?: string | null
          id?: string
          montant?: number
          property_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      late_payment_fees: {
        Row: {
          amount: number
          created_at: string | null
          days_late: number
          id: string
          lease_id: string
          payment_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          days_late: number
          id?: string
          lease_id: string
          payment_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          days_late?: number
          id?: string
          lease_id?: string
          payment_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "late_payment_fees_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "apartment_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "late_payment_fees_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "late_payment_fees_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "apartment_lease_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "late_payment_fees_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "tenant_payment_details"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_statements: {
        Row: {
          apartments_count: number
          created_at: string | null
          id: string
          net_amount: number
          owner_id: string
          period_end: string
          period_start: string
          properties_count: number
          total_commission: number
          total_expenses: number
          total_revenue: number
          updated_at: string | null
        }
        Insert: {
          apartments_count?: number
          created_at?: string | null
          id?: string
          net_amount?: number
          owner_id: string
          period_end: string
          period_start: string
          properties_count?: number
          total_commission?: number
          total_expenses?: number
          total_revenue?: number
          updated_at?: string | null
        }
        Update: {
          apartments_count?: number
          created_at?: string | null
          id?: string
          net_amount?: number
          owner_id?: string
          period_end?: string
          period_start?: string
          properties_count?: number
          total_commission?: number
          total_expenses?: number
          total_revenue?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_statements_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_apartment_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "owner_statements_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_dashboard_stats"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "owner_statements_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_expenses_view"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "owner_statements_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "owner_statements_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "owner_statements_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          agency_data: Json
          amount: number
          created_at: string | null
          id: string
          payment_id: string
          payment_method: string
          status: string
          subscription_plan_id: string
          updated_at: string | null
        }
        Insert: {
          agency_data: Json
          amount: number
          created_at?: string | null
          id?: string
          payment_id: string
          payment_method: string
          status?: string
          subscription_plan_id: string
          updated_at?: string | null
        }
        Update: {
          agency_data?: Json
          amount?: number
          created_at?: string | null
          id?: string
          payment_id?: string
          payment_method?: string
          status?: string
          subscription_plan_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_notifications: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          is_read: boolean | null
          lease_id: string
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          is_read?: boolean | null
          lease_id: string
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          is_read?: boolean | null
          lease_id?: string
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_notifications_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "apartment_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_notifications_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_status_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: string
          old_status: string | null
          payment_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          old_status?: string | null
          payment_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "apartment_lease_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "tenant_payment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          has_seen_warning: boolean | null
          id: string
          is_tenant: boolean | null
          last_name: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          has_seen_warning?: boolean | null
          id: string
          is_tenant?: boolean | null
          last_name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          has_seen_warning?: boolean | null
          id?: string
          is_tenant?: boolean | null
          last_name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          agency_id: string | null
          bathrooms: number | null
          bien: string
          caution: number | null
          chambres: number | null
          country: string | null
          created_at: string | null
          created_by_user_id: string | null
          frais_agence: number | null
          has_pool: boolean | null
          id: string
          is_for_sale: boolean | null
          kitchen_count: number | null
          living_rooms: number | null
          loyer: number | null
          maximum_stay: number | null
          minimum_stay: number | null
          owner_id: string | null
          owner_name: string | null
          owner_phone: string | null
          parent_property_id: string | null
          photo_url: string | null
          price_per_night: number | null
          price_per_week: number | null
          property_category: string
          quartier: string | null
          rental_type: string | null
          sale_price: number | null
          statut: string | null
          store_count: number | null
          taux_commission: number | null
          total_units: number | null
          type: string
          updated_at: string | null
          user_id: string | null
          ville: string | null
        }
        Insert: {
          agency_id?: string | null
          bathrooms?: number | null
          bien: string
          caution?: number | null
          chambres?: number | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          frais_agence?: number | null
          has_pool?: boolean | null
          id?: string
          is_for_sale?: boolean | null
          kitchen_count?: number | null
          living_rooms?: number | null
          loyer?: number | null
          maximum_stay?: number | null
          minimum_stay?: number | null
          owner_id?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parent_property_id?: string | null
          photo_url?: string | null
          price_per_night?: number | null
          price_per_week?: number | null
          property_category?: string
          quartier?: string | null
          rental_type?: string | null
          sale_price?: number | null
          statut?: string | null
          store_count?: number | null
          taux_commission?: number | null
          total_units?: number | null
          type: string
          updated_at?: string | null
          user_id?: string | null
          ville?: string | null
        }
        Update: {
          agency_id?: string | null
          bathrooms?: number | null
          bien?: string
          caution?: number | null
          chambres?: number | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          frais_agence?: number | null
          has_pool?: boolean | null
          id?: string
          is_for_sale?: boolean | null
          kitchen_count?: number | null
          living_rooms?: number | null
          loyer?: number | null
          maximum_stay?: number | null
          minimum_stay?: number | null
          owner_id?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parent_property_id?: string | null
          photo_url?: string | null
          price_per_night?: number | null
          price_per_week?: number | null
          property_category?: string
          quartier?: string | null
          rental_type?: string | null
          sale_price?: number | null
          statut?: string | null
          store_count?: number | null
          taux_commission?: number | null
          total_units?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
          ville?: string | null
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
            foreignKeyName: "properties_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_apartment_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_dashboard_stats"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_expenses_view"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_parent_property_id_fkey"
            columns: ["parent_property_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "properties_parent_property_id_fkey"
            columns: ["parent_property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "properties_parent_property_id_fkey"
            columns: ["parent_property_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "properties_parent_property_id_fkey"
            columns: ["parent_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_inspections: {
        Row: {
          contract_id: string | null
          created_at: string | null
          damage_description: string | null
          deposit_returned: number | null
          has_damages: boolean | null
          id: string
          inspection_date: string | null
          photo_urls: string[] | null
          repair_costs: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          damage_description?: string | null
          deposit_returned?: number | null
          has_damages?: boolean | null
          id?: string
          inspection_date?: string | null
          photo_urls?: string[] | null
          repair_costs?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          damage_description?: string | null
          deposit_returned?: number | null
          has_damages?: boolean | null
          id?: string
          inspection_date?: string | null
          photo_urls?: string[] | null
          repair_costs?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_inspections_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_inspections_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "property_inspections_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "payment_history_with_tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owners: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          status: Database["public"]["Enums"]["owner_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          status?: Database["public"]["Enums"]["owner_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          status?: Database["public"]["Enums"]["owner_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      property_sales: {
        Row: {
          agency_id: string | null
          buyer_contact: string | null
          buyer_name: string
          commission_amount: number | null
          created_at: string | null
          id: string
          payment_status: string | null
          photo_urls: string[] | null
          property_id: string
          sale_date: string
          sale_price: number
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          buyer_contact?: string | null
          buyer_name: string
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          photo_urls?: string[] | null
          property_id: string
          sale_date: string
          sale_price: number
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          buyer_contact?: string | null
          buyer_name?: string
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          photo_urls?: string[] | null
          property_id?: string
          sale_date?: string
          sale_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_sales_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_sales_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_sales_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_sales_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_sales_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_units: {
        Row: {
          area: number | null
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          floor_number: number | null
          id: string
          property_id: string
          rent_amount: number
          status: Database["public"]["Enums"]["property_unit_status"] | null
          unit_number: string
          updated_at: string | null
        }
        Insert: {
          area?: number | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          floor_number?: number | null
          id?: string
          property_id: string
          rent_amount: number
          status?: Database["public"]["Enums"]["property_unit_status"] | null
          unit_number: string
          updated_at?: string | null
        }
        Update: {
          area?: number | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          floor_number?: number | null
          id?: string
          property_id?: string
          rent_amount?: number
          status?: Database["public"]["Enums"]["property_unit_status"] | null
          unit_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          duration_months: number | null
          features: string[] | null
          id: string
          max_properties: number | null
          max_tenants: number | null
          max_users: number | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_months?: number | null
          features?: string[] | null
          id?: string
          max_properties?: number | null
          max_tenants?: number | null
          max_users?: number | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_months?: number | null
          features?: string[] | null
          id?: string
          max_properties?: number | null
          max_tenants?: number | null
          max_users?: number | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_units: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          tenant_id: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          tenant_id: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          tenant_id?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "apartment_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "apartment_tenants_with_rent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "apartment_units"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          agency_fees: number | null
          agency_id: string | null
          birth_date: string | null
          created_at: string | null
          created_by_user_id: string | null
          id: string
          nom: string
          phone_number: string | null
          photo_id_url: string | null
          prenom: string
          profession: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agency_fees?: number | null
          agency_id?: string | null
          birth_date?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          nom: string
          phone_number?: string | null
          photo_id_url?: string | null
          prenom: string
          profession?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agency_fees?: number | null
          agency_id?: string | null
          birth_date?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          nom?: string
          phone_number?: string | null
          photo_id_url?: string | null
          prenom?: string
          profession?: string | null
          updated_at?: string | null
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
            foreignKeyName: "tenants_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      apartment_tenants_with_rent: {
        Row: {
          agency_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          phone_number: string | null
          rent_amount: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_tenants_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "apartment_units"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_details: {
        Row: {
          agency_id: string | null
          apartment_address: string | null
          apartment_name: string | null
          created_at: string | null
          deposit_amount: number | null
          deposit_return_amount: number | null
          deposit_return_date: string | null
          deposit_return_notes: string | null
          deposit_returned: boolean | null
          duration_type: string | null
          end_date: string | null
          id: string | null
          initial_fees_paid: boolean | null
          initial_payments_completed: boolean | null
          payment_frequency: string | null
          payment_type: string | null
          payments: Json | null
          rent_amount: number | null
          start_date: string | null
          status: string | null
          tenant_email: string | null
          tenant_first_name: string | null
          tenant_id: string | null
          tenant_last_name: string | null
          tenant_phone: string | null
          unit_id: string | null
          unit_number: string | null
          unit_rent_amount: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_leases_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "apartment_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "apartment_tenants_with_rent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "apartment_units"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_apartment_revenues: {
        Row: {
          amount: number | null
          apartment_id: string | null
          apartment_name: string | null
          commission_amount: number | null
          commission_rate: number | null
          first_name: string | null
          last_name: string | null
          net_amount: number | null
          owner_id: string | null
          payment_date: string | null
          payment_type: string | null
          source_type: string | null
        }
        Relationships: []
      }
      owner_combined_assets: {
        Row: {
          asset_id: string | null
          asset_type: string | null
          city: string | null
          name: string | null
          neighborhood: string | null
          owner_id: string | null
          photo_url: string | null
          rent_amount: number | null
          status: string | null
          total_revenue: number | null
          total_units: number | null
          type: string | null
        }
        Relationships: []
      }
      owner_dashboard_stats: {
        Row: {
          current_month_expenses: number | null
          current_month_revenue: number | null
          owner_id: string | null
          property_occupancy_rate: number | null
          total_apartments: number | null
          total_properties: number | null
        }
        Relationships: []
      }
      owner_expenses_view: {
        Row: {
          amount: number | null
          description: string | null
          expense_date: string | null
          first_name: string | null
          last_name: string | null
          owner_id: string | null
          property_name: string | null
          source_id: string | null
          source_type: string | null
        }
        Relationships: []
      }
      owner_late_payments: {
        Row: {
          amount: number | null
          contract_id: string | null
          end_date: string | null
          owner_id: string | null
          property_id: string | null
          property_name: string | null
          start_date: string | null
          tenant_firstname: string | null
          tenant_name: string | null
          tenant_phone: string | null
        }
        Relationships: []
      }
      owner_monthly_revenue: {
        Row: {
          month: string | null
          net_revenue: number | null
          owner_id: string | null
          payment_count: number | null
          source_type: string | null
          total_commission: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      owner_properties_details: {
        Row: {
          city: string | null
          inspection_photos: string[] | null
          name: string | null
          neighborhood: string | null
          owner_id: string | null
          photo_url: string | null
          property_category: string | null
          property_id: string | null
          status: string | null
          total_contracts: number | null
          total_inspections: number | null
          total_revenue: number | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_apartment_revenues"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_dashboard_stats"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_expenses_view"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_late_payments"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owner_property_revenues"
            referencedColumns: ["owner_id"]
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
      owner_property_revenues: {
        Row: {
          amount: number | null
          commission_amount: number | null
          commission_rate: number | null
          first_name: string | null
          last_name: string | null
          net_amount: number | null
          owner_id: string | null
          payment_date: string | null
          payment_type: string | null
          property_id: string | null
          property_name: string | null
          source_type: string | null
        }
        Relationships: []
      }
      payment_history_with_tenant: {
        Row: {
          agency_id: string | null
          created_at: string | null
          id: string | null
          montant: number | null
          property_name: string | null
          statut: string | null
          tenant_id: string | null
          tenant_nom: string | null
          tenant_prenom: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_payment_details: {
        Row: {
          amount: number | null
          apartment_name: string | null
          due_date: string | null
          id: string | null
          lease_deposit_amount: number | null
          lease_id: string | null
          lease_rent_amount: number | null
          payment_date: string | null
          payment_frequency: string | null
          payment_method: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          tenant_first_name: string | null
          tenant_id: string | null
          tenant_last_name: string | null
          type: string | null
          unit_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_lease_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "apartment_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_lease_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "apartment_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "apartment_tenants_with_rent"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_payment_penalties: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_subscription_expiry: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_apartment_lease: {
        Args: {
          p_tenant_id: string
          p_unit_id: string
          p_start_date: string
          p_end_date: string
          p_rent_amount: number
          p_deposit_amount: number
          p_payment_frequency: string
          p_duration_type: string
          p_payment_type: string
          p_agency_id: string
        }
        Returns: string
      }
      create_lease_payment: {
        Args: {
          p_lease_id: string
          p_amount: number
          p_payment_type: string
          p_payment_method: string
          p_payment_date: string
          p_period_start?: string
          p_period_end?: string
          p_notes?: string
        }
        Returns: Json
      }
      generate_monthly_owner_statements: {
        Args: {
          year: number
          month: number
        }
        Returns: undefined
      }
      get_next_payment_due: {
        Args: {
          p_lease_id: string
        }
        Returns: Json
      }
      handle_mixed_payment_insertion: {
        Args: {
          p_lease_id: string
          p_payment_periods: string[]
          p_payment_date: string
          p_payment_method: string
          p_agency_id: string
          p_notes: string
        }
        Returns: Json
      }
      handle_simple_initial_payments:
        | {
            Args: {
              p_lease_id: string
              p_deposit_amount: number
              p_agency_fees: number
              p_agency_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              p_lease_id: string
              p_deposit_amount: number
              p_agency_fees: number
              p_agency_id: string
              p_first_rent_start_date: string
            }
            Returns: boolean
          }
      update_expired_apartment_leases: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_payment_period_statuses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      lease_status:
        | "active"
        | "expired"
        | "terminated"
        | "pending_initial_payment"
      owner_status: "active" | "inactive"
      payment_status_type:
        | "paid"
        | "paid_advance"
        | "late"
        | "pending"
        | "historical"
      property_unit_status:
        | "available"
        | "occupied"
        | "maintenance"
        | "reserved"
      user_role: "user" | "admin" | "super_admin"
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
