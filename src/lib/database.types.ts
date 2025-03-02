
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
          property_type?: string
          year_built?: number
          parking?: number
          pets_allowed?: boolean
          furnished?: boolean
          available_from?: string
          lease_term?: string
          utilities_included?: boolean
          amenities?: string[]
          neighborhood?: string
          schools_nearby?: string[]
          transportation?: string[]
          latitude?: number
          longitude?: number
          virtual_tour_url?: string
          floor_plan_url?: string
          video_url?: string
          property_manager?: string
          maintenance_contact?: string
          tax_information?: Json
          insurance_information?: Json
          documents?: string[]
          notes?: string
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
          property_type?: string
          year_built?: number
          parking?: number
          pets_allowed?: boolean
          furnished?: boolean
          available_from?: string
          lease_term?: string
          utilities_included?: boolean
          amenities?: string[]
          neighborhood?: string
          schools_nearby?: string[]
          transportation?: string[]
          latitude?: number
          longitude?: number
          virtual_tour_url?: string
          floor_plan_url?: string
          video_url?: string
          property_manager?: string
          maintenance_contact?: string
          tax_information?: Json
          insurance_information?: Json
          documents?: string[]
          notes?: string
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
          property_type?: string
          year_built?: number
          parking?: number
          pets_allowed?: boolean
          furnished?: boolean
          available_from?: string
          lease_term?: string
          utilities_included?: boolean
          amenities?: string[]
          neighborhood?: string
          schools_nearby?: string[]
          transportation?: string[]
          latitude?: number
          longitude?: number
          virtual_tour_url?: string
          floor_plan_url?: string
          video_url?: string
          property_manager?: string
          maintenance_contact?: string
          tax_information?: Json
          insurance_information?: Json
          documents?: string[]
          notes?: string
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
          description?: string
          email?: string
          phone?: string
          website?: string
          business_hours?: Json
          social_media?: Json
          license_number?: string
          year_established?: number
          staff_count?: number
          specialties?: string[]
          service_areas?: string[]
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
          description?: string
          email?: string
          phone?: string
          website?: string
          business_hours?: Json
          social_media?: Json
          license_number?: string
          year_established?: number
          staff_count?: number
          specialties?: string[]
          service_areas?: string[]
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
          description?: string
          email?: string
          phone?: string
          website?: string
          business_hours?: Json
          social_media?: Json
          license_number?: string
          year_established?: number
          staff_count?: number
          specialties?: string[]
          service_areas?: string[]
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
          address?: string
          preferences?: Json
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
          address?: string
          preferences?: Json
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
          address?: string
          preferences?: Json
        }
      }
      administrators: {
        Row: {
          id: string
          user_id: string
          access_level: string
          department: string
          is_super_admin: boolean
          [key: string]: any
        }
        Insert: {
          id?: string
          user_id: string
          access_level: string
          department: string
          is_super_admin?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          access_level?: string
          department?: string
          is_super_admin?: boolean
        }
      }
      apartment_leases: {
        Row: {
          id: string
          apartment_id: string
          tenant_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          security_deposit: number
          is_active: boolean
          payment_day: number
          created_at: string
          updated_at?: string
          lease_document_url?: string
          signed_by_tenant: boolean
          signed_by_owner: boolean
          has_renewal_option: boolean
          renewal_terms?: string
          special_conditions?: string
          lease_type: string
          payment_method?: string
          late_fee_percentage?: number
          grace_period_days?: number
          [key: string]: any
        }
        Insert: {
          id?: string
          apartment_id: string
          tenant_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          security_deposit: number
          is_active?: boolean
          payment_day: number
          created_at?: string
          updated_at?: string
          lease_document_url?: string
          signed_by_tenant?: boolean
          signed_by_owner?: boolean
          has_renewal_option?: boolean
          renewal_terms?: string
          special_conditions?: string
          lease_type: string
          payment_method?: string
          late_fee_percentage?: number
          grace_period_days?: number
        }
        Update: {
          id?: string
          apartment_id?: string
          tenant_id?: string
          start_date?: string
          end_date?: string
          monthly_rent?: number
          security_deposit?: number
          is_active?: boolean
          payment_day?: number
          created_at?: string
          updated_at?: string
          lease_document_url?: string
          signed_by_tenant?: boolean
          signed_by_owner?: boolean
          has_renewal_option?: boolean
          renewal_terms?: string
          special_conditions?: string
          lease_type?: string
          payment_method?: string
          late_fee_percentage?: number
          grace_period_days?: number
        }
      }
      apartment_tenants_with_rent: {
        Row: {
          tenant_id: string
          tenant_name: string
          apartment_id: string
          apartment_number: string
          monthly_rent: number
          last_payment_date?: string
          payment_status: string
          days_overdue?: number
          payment_history?: Json
          [key: string]: any
        }
        Insert: {
          tenant_id: string
          tenant_name: string
          apartment_id: string
          apartment_number: string
          monthly_rent: number
          last_payment_date?: string
          payment_status: string
          days_overdue?: number
          payment_history?: Json
        }
        Update: {
          tenant_id?: string
          tenant_name?: string
          apartment_id?: string
          apartment_number?: string
          monthly_rent?: number
          last_payment_date?: string
          payment_status?: string
          days_overdue?: number
          payment_history?: Json
        }
      }
      apartment_unit_pricing: {
        Row: {
          id: string
          apartment_type: string
          base_price: number
          min_area: number
          max_area: number
          price_per_sqm: number
          [key: string]: any
        }
        Insert: {
          id?: string
          apartment_type: string
          base_price: number
          min_area: number
          max_area: number
          price_per_sqm: number
        }
        Update: {
          id?: string
          apartment_type?: string
          base_price?: number
          min_area?: number
          max_area?: number
          price_per_sqm?: number
        }
      }
      contracts: {
        Row: {
          id: string
          property_id: string
          client_id: string
          contract_type: string
          start_date: string
          end_date: string
          value: number
          status: string
          created_at: string
          updated_at?: string
          terms?: string
          documents?: string[]
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          client_id: string
          contract_type: string
          start_date: string
          end_date: string
          value: number
          status: string
          created_at?: string
          updated_at?: string
          terms?: string
          documents?: string[]
        }
        Update: {
          id?: string
          property_id?: string
          client_id?: string
          contract_type?: string
          start_date?: string
          end_date?: string
          value?: number
          status?: string
          created_at?: string
          updated_at?: string
          terms?: string
          documents?: string[]
        }
      }
      payment_history_with_tenant: {
        Row: {
          id: string
          tenant_id: string
          apartment_id: string
          payment_date: string
          amount: number
          payment_method: string
          status: string
          reference_number?: string
          notes?: string
          created_by: string
          [key: string]: any
        }
        Insert: {
          id?: string
          tenant_id: string
          apartment_id: string
          payment_date: string
          amount: number
          payment_method: string
          status: string
          reference_number?: string
          notes?: string
          created_by: string
        }
        Update: {
          id?: string
          tenant_id?: string
          apartment_id?: string
          payment_date?: string
          amount?: number
          payment_method?: string
          status?: string
          reference_number?: string
          notes?: string
          created_by?: string
        }
      }
      admin_payment_notifications: {
        Row: {
          id: string
          admin_id: string
          tenant_id: string
          apartment_id: string
          amount_due: number
          due_date: string
          message: string
          sent_date: string
          status: string
          [key: string]: any
        }
        Insert: {
          id?: string
          admin_id: string
          tenant_id: string
          apartment_id: string
          amount_due: number
          due_date: string
          message: string
          sent_date: string
          status: string
        }
        Update: {
          id?: string
          admin_id?: string
          tenant_id?: string
          apartment_id?: string
          amount_due?: number
          due_date?: string
          message?: string
          sent_date?: string
          status?: string
        }
      }
      agency_owners: {
        Row: {
          id: string
          agency_id: string
          owner_id: string
          ownership_percentage: number
          joined_date: string
          [key: string]: any
        }
        Insert: {
          id?: string
          agency_id: string
          owner_id: string
          ownership_percentage: number
          joined_date: string
        }
        Update: {
          id?: string
          agency_id?: string
          owner_id?: string
          ownership_percentage?: number
          joined_date?: string
        }
      }
      apartment_tenants: {
        Row: {
          id: string
          apartment_id: string
          tenant_id: string
          lease_id: string
          move_in_date: string
          move_out_date?: string
          is_primary_tenant: boolean
          rent_portion: number
          status: string
          created_at: string
          updated_at?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          vehicle_info?: Json
          has_pets?: boolean
          pet_details?: Json
          employment_info?: Json
          income_verification?: string
          background_check_status?: string
          credit_score?: number
          references?: Json
          special_accommodations?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          apartment_id: string
          tenant_id: string
          lease_id: string
          move_in_date: string
          move_out_date?: string
          is_primary_tenant?: boolean
          rent_portion: number
          status: string
          created_at?: string
          updated_at?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          vehicle_info?: Json
          has_pets?: boolean
          pet_details?: Json
          employment_info?: Json
          income_verification?: string
          background_check_status?: string
          credit_score?: number
          references?: Json
          special_accommodations?: string
        }
        Update: {
          id?: string
          apartment_id?: string
          tenant_id?: string
          lease_id?: string
          move_in_date?: string
          move_out_date?: string
          is_primary_tenant?: boolean
          rent_portion?: number
          status?: string
          created_at?: string
          updated_at?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          vehicle_info?: Json
          has_pets?: boolean
          pet_details?: Json
          employment_info?: Json
          income_verification?: string
          background_check_status?: string
          credit_score?: number
          references?: Json
          special_accommodations?: string
        }
      }
      apartment_units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          floor: number
          bedrooms: number
          bathrooms: number
          area: number
          monthly_rent: number
          is_available: boolean
          status: string
          features?: string[]
          amenities?: string[]
          images?: string[]
          floor_plan_url?: string
          description?: string
          created_at: string
          updated_at?: string
          last_renovation_date?: string
          utilities_included?: boolean
          furnished?: boolean
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          floor: number
          bedrooms: number
          bathrooms: number
          area: number
          monthly_rent: number
          is_available?: boolean
          status: string
          features?: string[]
          amenities?: string[]
          images?: string[]
          floor_plan_url?: string
          description?: string
          created_at?: string
          updated_at?: string
          last_renovation_date?: string
          utilities_included?: boolean
          furnished?: boolean
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          floor?: number
          bedrooms?: number
          bathrooms?: number
          area?: number
          monthly_rent?: number
          is_available?: boolean
          status?: string
          features?: string[]
          amenities?: string[]
          images?: string[]
          floor_plan_url?: string
          description?: string
          created_at?: string
          updated_at?: string
          last_renovation_date?: string
          utilities_included?: boolean
          furnished?: boolean
        }
      }
      owner_dashboard_stats: {
        Row: {
          owner_id: string
          total_properties: number
          occupancy_rate: number
          monthly_revenue: number
          pending_maintenance: number
          overdue_payments: number
          [key: string]: any
        }
        Insert: {
          owner_id: string
          total_properties: number
          occupancy_rate: number
          monthly_revenue: number
          pending_maintenance: number
          overdue_payments: number
        }
        Update: {
          owner_id?: string
          total_properties?: number
          occupancy_rate?: number
          monthly_revenue?: number
          pending_maintenance?: number
          overdue_payments?: number
        }
      }
      owner_late_payments: {
        Row: {
          id: string
          owner_id: string
          tenant_id: string
          property_id: string
          amount: number
          due_date: string
          days_overdue: number
          status: string
          last_notification_date?: string
          notes?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          owner_id: string
          tenant_id: string
          property_id: string
          amount: number
          due_date: string
          days_overdue: number
          status: string
          last_notification_date?: string
          notes?: string
        }
        Update: {
          id?: string
          owner_id?: string
          tenant_id?: string
          property_id?: string
          amount?: number
          due_date?: string
          days_overdue?: number
          status?: string
          last_notification_date?: string
          notes?: string
        }
      }
      owner_property_revenues: {
        Row: {
          id: string
          owner_id: string
          property_id: string
          month: string
          year: number
          rent_revenue: number
          other_revenue: number
          expenses: number
          net_income: number
          occupancy_rate: number
          collection_rate: number
          notes?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          owner_id: string
          property_id: string
          month: string
          year: number
          rent_revenue: number
          other_revenue: number
          expenses: number
          net_income: number
          occupancy_rate: number
          collection_rate: number
          notes?: string
        }
        Update: {
          id?: string
          owner_id?: string
          property_id?: string
          month?: string
          year?: number
          rent_revenue?: number
          other_revenue?: number
          expenses?: number
          net_income?: number
          occupancy_rate?: number
          collection_rate?: number
          notes?: string
        }
      }
      property_inspections: {
        Row: {
          id: string
          property_id: string
          inspector_id: string
          inspection_date: string
          inspection_type: string
          status: string
          findings: Json
          action_items?: Json
          follow_up_date?: string
          completed_date?: string
          notes?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          inspector_id: string
          inspection_date: string
          inspection_type: string
          status: string
          findings: Json
          action_items?: Json
          follow_up_date?: string
          completed_date?: string
          notes?: string
        }
        Update: {
          id?: string
          property_id?: string
          inspector_id?: string
          inspection_date?: string
          inspection_type?: string
          status?: string
          findings?: Json
          action_items?: Json
          follow_up_date?: string
          completed_date?: string
          notes?: string
        }
      }
      apartment_lease_payments: {
        Row: {
          id: string
          lease_id: string
          tenant_id: string
          payment_date: string
          due_date: string
          amount: number
          payment_method: string
          status: string
          transaction_id?: string
          receipt_url?: string
          notes?: string
          created_at: string
          updated_at?: string
          late_fee_amount?: number
          discount_amount?: number
          taxes?: number
          total_amount: number
          is_partial: boolean
          remaining_balance?: number
          payment_period_start: string
          payment_period_end: string
          processed_by?: string
          payment_source?: string
          payment_details?: Json
          [key: string]: any
        }
        Insert: {
          id?: string
          lease_id: string
          tenant_id: string
          payment_date: string
          due_date: string
          amount: number
          payment_method: string
          status: string
          transaction_id?: string
          receipt_url?: string
          notes?: string
          created_at?: string
          updated_at?: string
          late_fee_amount?: number
          discount_amount?: number
          taxes?: number
          total_amount: number
          is_partial?: boolean
          remaining_balance?: number
          payment_period_start: string
          payment_period_end: string
          processed_by?: string
          payment_source?: string
          payment_details?: Json
        }
        Update: {
          id?: string
          lease_id?: string
          tenant_id?: string
          payment_date?: string
          due_date?: string
          amount?: number
          payment_method?: string
          status?: string
          transaction_id?: string
          receipt_url?: string
          notes?: string
          created_at?: string
          updated_at?: string
          late_fee_amount?: number
          discount_amount?: number
          taxes?: number
          total_amount?: number
          is_partial?: boolean
          remaining_balance?: number
          payment_period_start?: string
          payment_period_end?: string
          processed_by?: string
          payment_source?: string
          payment_details?: Json
        }
      }
      expenses: {
        Row: {
          id: string
          property_id: string
          category: string
          amount: number
          date: string
          description?: string
          receipt_url?: string
          created_by: string
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          category: string
          amount: number
          date: string
          description?: string
          receipt_url?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          category?: string
          amount?: number
          date?: string
          description?: string
          receipt_url?: string
          created_by?: string
          created_at?: string
        }
      }
      owner_apartment_revenues: {
        Row: {
          id: string
          owner_id: string
          apartment_id: string
          month: string
          year: number
          rent_collected: number
          other_income: number
          expenses: number
          net_income: number
          occupancy_days: number
          maintenance_costs: number
          notes?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          owner_id: string
          apartment_id: string
          month: string
          year: number
          rent_collected: number
          other_income: number
          expenses: number
          net_income: number
          occupancy_days: number
          maintenance_costs: number
          notes?: string
        }
        Update: {
          id?: string
          owner_id?: string
          apartment_id?: string
          month?: string
          year?: number
          rent_collected?: number
          other_income?: number
          expenses?: number
          net_income?: number
          occupancy_days?: number
          maintenance_costs?: number
          notes?: string
        }
      }
      owner_properties_details: {
        Row: {
          id: string
          owner_id: string
          property_id: string
          purchase_date: string
          purchase_price: number
          current_value: number
          mortgage_info?: Json
          insurance_info?: Json
          tax_info?: Json
          ownership_percentage: number
          active: boolean
          notes?: string
          last_appraisal_date?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          owner_id: string
          property_id: string
          purchase_date: string
          purchase_price: number
          current_value: number
          mortgage_info?: Json
          insurance_info?: Json
          tax_info?: Json
          ownership_percentage: number
          active?: boolean
          notes?: string
          last_appraisal_date?: string
        }
        Update: {
          id?: string
          owner_id?: string
          property_id?: string
          purchase_date?: string
          purchase_price?: number
          current_value?: number
          mortgage_info?: Json
          insurance_info?: Json
          tax_info?: Json
          ownership_percentage?: number
          active?: boolean
          notes?: string
          last_appraisal_date?: string
        }
      }
      tenants: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth?: string
          identification_type?: string
          identification_number?: string
          employment_status?: string
          employer?: string
          income?: number
          created_at: string
          updated_at?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth?: string
          identification_type?: string
          identification_number?: string
          employment_status?: string
          employer?: string
          income?: number
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
          date_of_birth?: string
          identification_type?: string
          identification_number?: string
          employment_status?: string
          employer?: string
          income?: number
          created_at?: string
          updated_at?: string
        }
      }
      admin_notifications: {
        Row: {
          id: string
          admin_id: string
          message: string
          created_at: string
          is_read: boolean
          priority: string
          [key: string]: any
        }
        Insert: {
          id?: string
          admin_id: string
          message: string
          created_at?: string
          is_read?: boolean
          priority: string
        }
        Update: {
          id?: string
          admin_id?: string
          message?: string
          created_at?: string
          is_read?: boolean
          priority?: string
        }
      }
      lease_details: {
        Row: {
          id: string
          property_id: string
          tenant_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          security_deposit: number
          pet_deposit?: number
          late_fee_percentage: number
          grace_period_days: number
          payment_due_day: number
          lease_terms?: string
          created_at: string
          updated_at?: string
          status: string
          renewal_option?: boolean
          renewal_notice_period?: number
          increase_percentage_cap?: number
          is_cosigner_required?: boolean
          cosigner_details?: Json
          maintenance_terms?: string
          utilities_responsibility?: Json
          insurance_requirements?: string
          special_provisions?: string
          early_termination_fee?: number
          early_termination_notice?: number
          inspection_schedule?: string
          move_in_condition_report?: string
          move_out_condition_report?: string
          landlord_entry_notice_period?: number
          documents?: string[]
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          security_deposit: number
          pet_deposit?: number
          late_fee_percentage: number
          grace_period_days: number
          payment_due_day: number
          lease_terms?: string
          created_at?: string
          updated_at?: string
          status: string
          renewal_option?: boolean
          renewal_notice_period?: number
          increase_percentage_cap?: number
          is_cosigner_required?: boolean
          cosigner_details?: Json
          maintenance_terms?: string
          utilities_responsibility?: Json
          insurance_requirements?: string
          special_provisions?: string
          early_termination_fee?: number
          early_termination_notice?: number
          inspection_schedule?: string
          move_in_condition_report?: string
          move_out_condition_report?: string
          landlord_entry_notice_period?: number
          documents?: string[]
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string
          start_date?: string
          end_date?: string
          monthly_rent?: number
          security_deposit?: number
          pet_deposit?: number
          late_fee_percentage?: number
          grace_period_days?: number
          payment_due_day?: number
          lease_terms?: string
          created_at?: string
          updated_at?: string
          status?: string
          renewal_option?: boolean
          renewal_notice_period?: number
          increase_percentage_cap?: number
          is_cosigner_required?: boolean
          cosigner_details?: Json
          maintenance_terms?: string
          utilities_responsibility?: Json
          insurance_requirements?: string
          special_provisions?: string
          early_termination_fee?: number
          early_termination_notice?: number
          inspection_schedule?: string
          move_in_condition_report?: string
          move_out_condition_report?: string
          landlord_entry_notice_period?: number
          documents?: string[]
        }
      }
      owner_expenses_view: {
        Row: {
          id: string
          owner_id: string
          property_id: string
          month: string
          year: number
          category: string
          amount: number
          description?: string
          date: string
          receipt_url?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          owner_id: string
          property_id: string
          month: string
          year: number
          category: string
          amount: number
          description?: string
          date: string
          receipt_url?: string
        }
        Update: {
          id?: string
          owner_id?: string
          property_id?: string
          month?: string
          year?: number
          category?: string
          amount?: number
          description?: string
          date?: string
          receipt_url?: string
        }
      }
      payment_notifications: {
        Row: {
          id: string
          tenant_id: string
          amount: number
          due_date: string
          message: string
          sent_date: string
          is_read: boolean
          notification_type: string
          reference_id?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          tenant_id: string
          amount: number
          due_date: string
          message: string
          sent_date: string
          is_read?: boolean
          notification_type: string
          reference_id?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          amount?: number
          due_date?: string
          message?: string
          sent_date?: string
          is_read?: boolean
          notification_type?: string
          reference_id?: string
        }
      }
      payment_status_history: {
        Row: {
          id: string
          payment_id: string
          status: string
          changed_at: string
          changed_by: string
          notes?: string
          prev_status?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          payment_id: string
          status: string
          changed_at?: string
          changed_by: string
          notes?: string
          prev_status?: string
        }
        Update: {
          id?: string
          payment_id?: string
          status?: string
          changed_at?: string
          changed_by?: string
          notes?: string
          prev_status?: string
        }
      }
      property_owners: {
        Row: {
          id: string
          user_id: string
          company_name?: string
          tax_id?: string
          payment_method: string
          bank_details?: Json
          payment_percentage: number
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          user_id: string
          company_name?: string
          tax_id?: string
          payment_method: string
          bank_details?: Json
          payment_percentage: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          tax_id?: string
          payment_method?: string
          bank_details?: Json
          payment_percentage?: number
          created_at?: string
        }
      }
      tenant_payment_details: {
        Row: {
          id: string
          tenant_id: string
          lease_id: string
          monthly_rent: number
          payment_due_day: number
          last_payment_date?: string
          last_payment_amount?: number
          balance: number
          payment_method: string
          autopay_enabled: boolean
          payment_history?: Json
          credit_card_last4?: string
          card_expiry?: string
          bank_account_last4?: string
          late_fee_config?: Json
          grace_period_days: number
          security_deposit_held: number
          security_deposit_status: string
          [key: string]: any
        }
        Insert: {
          id?: string
          tenant_id: string
          lease_id: string
          monthly_rent: number
          payment_due_day: number
          last_payment_date?: string
          last_payment_amount?: number
          balance?: number
          payment_method: string
          autopay_enabled?: boolean
          payment_history?: Json
          credit_card_last4?: string
          card_expiry?: string
          bank_account_last4?: string
          late_fee_config?: Json
          grace_period_days: number
          security_deposit_held: number
          security_deposit_status: string
        }
        Update: {
          id?: string
          tenant_id?: string
          lease_id?: string
          monthly_rent?: number
          payment_due_day?: number
          last_payment_date?: string
          last_payment_amount?: number
          balance?: number
          payment_method?: string
          autopay_enabled?: boolean
          payment_history?: Json
          credit_card_last4?: string
          card_expiry?: string
          bank_account_last4?: string
          late_fee_config?: Json
          grace_period_days?: number
          security_deposit_held?: number
          security_deposit_status?: string
        }
      }
      apartments: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          floor_plan: string
          bedrooms: number
          bathrooms: number
          area: number
          monthly_rent: number
          status: string
          amenities?: string[]
          images?: string[]
          description?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          floor_plan: string
          bedrooms: number
          bathrooms: number
          area: number
          monthly_rent: number
          status: string
          amenities?: string[]
          images?: string[]
          description?: string
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          floor_plan?: string
          bedrooms?: number
          bathrooms?: number
          area?: number
          monthly_rent?: number
          status?: string
          amenities?: string[]
          images?: string[]
          description?: string
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          user_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string
          special_requests?: string
          guests: number
          created_at: string
          payment_status: string
          booking_reference: string
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string
          special_requests?: string
          guests: number
          created_at?: string
          payment_status?: string
          booking_reference?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: string
          special_requests?: string
          guests?: number
          created_at?: string
          payment_status?: string
          booking_reference?: string
        }
      }
      late_payment_fees: {
        Row: {
          id: string
          lease_id: string
          amount: number
          applied_date: string
          status: string
          days_late: number
          original_due_date: string
          notes?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          lease_id: string
          amount: number
          applied_date: string
          status: string
          days_late: number
          original_due_date: string
          notes?: string
        }
        Update: {
          id?: string
          lease_id?: string
          amount?: number
          applied_date?: string
          status?: string
          days_late?: number
          original_due_date?: string
          notes?: string
        }
      }
      payment_attempts: {
        Row: {
          id: string
          payment_id: string
          attempt_date: string
          status: string
          payment_method: string
          error_message?: string
          transaction_id?: string
          gateway_response?: Json
          attempt_number: number
          [key: string]: any
        }
        Insert: {
          id?: string
          payment_id: string
          attempt_date: string
          status: string
          payment_method: string
          error_message?: string
          transaction_id?: string
          gateway_response?: Json
          attempt_number: number
        }
        Update: {
          id?: string
          payment_id?: string
          attempt_date?: string
          status?: string
          payment_method?: string
          error_message?: string
          transaction_id?: string
          gateway_response?: Json
          attempt_number?: number
        }
      }
      property_sales: {
        Row: {
          id: string
          property_id: string
          buyer_id: string
          seller_id: string
          sale_price: number
          sale_date: string
          commission_amount: number
          status: string
          documents?: string[]
          closing_date?: string
          notes?: string
          agent_id?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          buyer_id: string
          seller_id: string
          sale_price: number
          sale_date: string
          commission_amount: number
          status: string
          documents?: string[]
          closing_date?: string
          notes?: string
          agent_id?: string
        }
        Update: {
          id?: string
          property_id?: string
          buyer_id?: string
          seller_id?: string
          sale_price?: number
          sale_date?: string
          commission_amount?: number
          status?: string
          documents?: string[]
          closing_date?: string
          notes?: string
          agent_id?: string
        }
      }
      property_units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          type: string
          floor: number
          area: number
          bedrooms: number
          bathrooms: number
          monthly_rent: number
          status: string
          features?: string[]
          [key: string]: any
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          type: string
          floor: number
          area: number
          bedrooms: number
          bathrooms: number
          monthly_rent: number
          status: string
          features?: string[]
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          type?: string
          floor?: number
          area?: number
          bedrooms?: number
          bathrooms?: number
          monthly_rent?: number
          status?: string
          features?: string[]
        }
      }
      tenant_units: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          lease_id: string
          start_date: string
          end_date: string
          [key: string]: any
        }
        Insert: {
          id?: string
          tenant_id: string
          unit_id: string
          lease_id: string
          start_date: string
          end_date: string
        }
        Update: {
          id?: string
          tenant_id?: string
          unit_id?: string
          lease_id?: string
          start_date?: string
          end_date?: string
        }
      }
      apartment_inspections: {
        Row: {
          id: string
          apartment_id: string
          inspector_id: string
          inspection_date: string
          inspection_type: string
          status: string
          findings: Json
          action_items?: Json
          images?: string[]
          follow_up_date?: string
          completed_date?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          apartment_id: string
          inspector_id: string
          inspection_date: string
          inspection_type: string
          status: string
          findings: Json
          action_items?: Json
          images?: string[]
          follow_up_date?: string
          completed_date?: string
        }
        Update: {
          id?: string
          apartment_id?: string
          inspector_id?: string
          inspection_date?: string
          inspection_type?: string
          status?: string
          findings?: Json
          action_items?: Json
          images?: string[]
          follow_up_date?: string
          completed_date?: string
        }
      }
      owner_combined_assets: {
        Row: {
          id: string
          owner_id: string
          total_properties: number
          total_value: number
          total_monthly_revenue: number
          total_expenses: number
          net_monthly_income: number
          average_occupancy: number
          total_units: number
          mortgaged_properties: number
          equity_percentage: number
          appreciation_ytd: number
          roi: number
          [key: string]: any
        }
        Insert: {
          id?: string
          owner_id: string
          total_properties: number
          total_value: number
          total_monthly_revenue: number
          total_expenses: number
          net_monthly_income: number
          average_occupancy: number
          total_units: number
          mortgaged_properties: number
          equity_percentage: number
          appreciation_ytd: number
          roi: number
        }
        Update: {
          id?: string
          owner_id?: string
          total_properties?: number
          total_value?: number
          total_monthly_revenue?: number
          total_expenses?: number
          net_monthly_income?: number
          average_occupancy?: number
          total_units?: number
          mortgaged_properties?: number
          equity_percentage?: number
          appreciation_ytd?: number
          roi?: number
        }
      }
      owner_monthly_revenue: {
        Row: {
          id: string
          owner_id: string
          month: string
          year: number
          revenue: number
          expenses: number
          net_income: number
          [key: string]: any
        }
        Insert: {
          id?: string
          owner_id: string
          month: string
          year: number
          revenue: number
          expenses: number
          net_income: number
        }
        Update: {
          id?: string
          owner_id?: string
          month?: string
          year?: number
          revenue?: number
          expenses?: number
          net_income?: number
        }
      }
      owner_statements: {
        Row: {
          id: string
          owner_id: string
          month: string
          year: number
          rent_collected: number
          other_income: number
          management_fee: number
          maintenance_costs: number
          other_expenses: number
          net_income: number
          generated_date: string
          document_url?: string
          [key: string]: any
        }
        Insert: {
          id?: string
          owner_id: string
          month: string
          year: number
          rent_collected: number
          other_income: number
          management_fee: number
          maintenance_costs: number
          other_expenses: number
          net_income: number
          generated_date: string
          document_url?: string
        }
        Update: {
          id?: string
          owner_id?: string
          month?: string
          year?: number
          rent_collected?: number
          other_income?: number
          management_fee?: number
          maintenance_costs?: number
          other_expenses?: number
          net_income?: number
          generated_date?: string
          document_url?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          price: number
          billing_cycle: string
          features: string[]
          is_active: boolean
          max_properties: number
          max_users: number
          has_api_access: boolean
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          name: string
          price: number
          billing_cycle: string
          features: string[]
          is_active?: boolean
          max_properties: number
          max_users: number
          has_api_access?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          billing_cycle?: string
          features?: string[]
          is_active?: boolean
          max_properties?: number
          max_users?: number
          has_api_access?: boolean
          created_at?: string
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
