
-- CRÉATION DES TABLES

-- Table des propriétés
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  area NUMERIC NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  features TEXT[] DEFAULT '{}',
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  status TEXT,
  agent_id UUID,
  agency_id UUID,
  property_type TEXT,
  year_built INTEGER,
  parking INTEGER,
  pets_allowed BOOLEAN,
  furnished BOOLEAN,
  available_from DATE,
  lease_term TEXT,
  utilities_included BOOLEAN,
  amenities TEXT[] DEFAULT '{}',
  neighborhood TEXT,
  schools_nearby TEXT[] DEFAULT '{}',
  transportation TEXT[] DEFAULT '{}',
  latitude NUMERIC,
  longitude NUMERIC,
  virtual_tour_url TEXT,
  floor_plan_url TEXT,
  video_url TEXT,
  property_manager TEXT,
  maintenance_contact TEXT,
  tax_information JSONB,
  insurance_information JSONB,
  documents TEXT[] DEFAULT '{}',
  notes TEXT
);

-- Table des agences
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  location TEXT NOT NULL,
  properties_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  business_hours JSONB,
  social_media JSONB,
  license_number TEXT,
  year_established INTEGER,
  staff_count INTEGER,
  specialties TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}'
);

-- Table des profils
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'agency', 'owner', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  address TEXT,
  preferences JSONB
);

-- Table des administrateurs
CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  access_level TEXT NOT NULL,
  department TEXT NOT NULL,
  is_super_admin BOOLEAN DEFAULT false
);

-- Table des baux d'appartement
CREATE TABLE IF NOT EXISTS apartment_leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  security_deposit NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  payment_day INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lease_document_url TEXT,
  signed_by_tenant BOOLEAN DEFAULT false,
  signed_by_owner BOOLEAN DEFAULT false,
  has_renewal_option BOOLEAN DEFAULT false,
  renewal_terms TEXT,
  special_conditions TEXT,
  lease_type TEXT NOT NULL,
  payment_method TEXT,
  late_fee_percentage NUMERIC,
  grace_period_days INTEGER
);

-- Vue des locataires avec loyer (Vue)
CREATE OR REPLACE VIEW apartment_tenants_with_rent AS
SELECT 
  t.id AS tenant_id,
  CONCAT(t.first_name, ' ', t.last_name) AS tenant_name,
  a.id AS apartment_id,
  a.unit_number AS apartment_number,
  al.monthly_rent,
  lp.payment_date AS last_payment_date,
  CASE 
    WHEN lp.payment_date IS NULL THEN 'unpaid'
    WHEN lp.payment_date < NOW() - INTERVAL '30 days' THEN 'overdue'
    ELSE 'paid'
  END AS payment_status,
  CASE 
    WHEN lp.payment_date IS NULL THEN (EXTRACT(DAY FROM NOW()) - al.payment_day)::INTEGER
    ELSE NULL
  END AS days_overdue,
  JSONB_BUILD_OBJECT('history', COALESCE(lp.payment_history, '[]')) AS payment_history
FROM 
  apartment_leases al
  JOIN tenants t ON al.tenant_id = t.id
  JOIN apartments a ON al.apartment_id = a.id
  LEFT JOIN apartment_lease_payments lp ON al.id = lp.lease_id
WHERE 
  al.is_active = true;

-- Table des prix des unités d'appartement
CREATE TABLE IF NOT EXISTS apartment_unit_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_type TEXT NOT NULL,
  base_price NUMERIC NOT NULL,
  min_area NUMERIC NOT NULL,
  max_area NUMERIC NOT NULL,
  price_per_sqm NUMERIC NOT NULL
);

-- Table des contrats
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  client_id UUID NOT NULL,
  contract_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  terms TEXT,
  documents TEXT[] DEFAULT '{}'
);

-- Vue de l'historique des paiements avec locataire (Vue)
CREATE OR REPLACE VIEW payment_history_with_tenant AS
SELECT 
  p.id,
  p.tenant_id,
  p.apartment_id,
  p.payment_date,
  p.amount,
  p.payment_method,
  p.status,
  p.transaction_id AS reference_number,
  p.notes,
  pr.user_id AS created_by
FROM 
  apartment_lease_payments p
  JOIN tenants t ON p.tenant_id = t.id
  JOIN profiles pr ON t.user_id = pr.user_id;

-- Table des notifications de paiement admin
CREATE TABLE IF NOT EXISTS admin_payment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES administrators(id),
  tenant_id UUID NOT NULL,
  apartment_id UUID NOT NULL,
  amount_due NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  message TEXT NOT NULL,
  sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL
);

-- Table des propriétaires d'agence
CREATE TABLE IF NOT EXISTS agency_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id),
  owner_id UUID NOT NULL,
  ownership_percentage NUMERIC NOT NULL,
  joined_date DATE NOT NULL
);

-- Table des locataires d'appartement
CREATE TABLE IF NOT EXISTS apartment_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lease_id UUID NOT NULL REFERENCES apartment_leases(id),
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  is_primary_tenant BOOLEAN DEFAULT false,
  rent_portion NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  vehicle_info JSONB,
  has_pets BOOLEAN DEFAULT false,
  pet_details JSONB,
  employment_info JSONB,
  income_verification TEXT,
  background_check_status TEXT,
  credit_score INTEGER,
  references JSONB,
  special_accommodations TEXT
);

-- Table des unités d'appartement
CREATE TABLE IF NOT EXISTS apartment_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  unit_number TEXT NOT NULL,
  floor INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area NUMERIC NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  is_available BOOLEAN DEFAULT true,
  status TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  floor_plan_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_renovation_date DATE,
  utilities_included BOOLEAN DEFAULT false,
  furnished BOOLEAN DEFAULT false
);

-- Vue des statistiques du tableau de bord du propriétaire (Vue)
CREATE OR REPLACE VIEW owner_dashboard_stats AS
SELECT
  po.id AS owner_id,
  COUNT(DISTINCT opd.property_id) AS total_properties,
  COALESCE(AVG(CASE WHEN au.is_available = false THEN 1 ELSE 0 END), 0) * 100 AS occupancy_rate,
  SUM(COALESCE(opr.rent_revenue, 0)) AS monthly_revenue,
  COUNT(DISTINCT pi.id) FILTER (WHERE pi.status = 'pending') AS pending_maintenance,
  COUNT(DISTINCT olp.id) AS overdue_payments
FROM
  property_owners po
  LEFT JOIN owner_properties_details opd ON po.id = opd.owner_id
  LEFT JOIN apartment_units au ON opd.property_id = au.property_id
  LEFT JOIN owner_property_revenues opr ON po.id = opr.owner_id
  LEFT JOIN property_inspections pi ON opd.property_id = pi.property_id
  LEFT JOIN owner_late_payments olp ON po.id = olp.owner_id
GROUP BY
  po.id;

-- Table des paiements en retard du propriétaire
CREATE TABLE IF NOT EXISTS owner_late_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  property_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  days_overdue INTEGER NOT NULL,
  status TEXT NOT NULL,
  last_notification_date TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Table des revenus des propriétés du propriétaire
CREATE TABLE IF NOT EXISTS owner_property_revenues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  property_id UUID NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  rent_revenue NUMERIC NOT NULL,
  other_revenue NUMERIC NOT NULL,
  expenses NUMERIC NOT NULL,
  net_income NUMERIC NOT NULL,
  occupancy_rate NUMERIC NOT NULL,
  collection_rate NUMERIC NOT NULL,
  notes TEXT
);

-- Table des inspections de propriété
CREATE TABLE IF NOT EXISTS property_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  inspector_id UUID NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_type TEXT NOT NULL,
  status TEXT NOT NULL,
  findings JSONB NOT NULL,
  action_items JSONB,
  follow_up_date DATE,
  completed_date DATE,
  notes TEXT
);

-- Table des paiements de bail d'appartement
CREATE TABLE IF NOT EXISTS apartment_lease_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES apartment_leases(id),
  tenant_id UUID NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  transaction_id TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  late_fee_amount NUMERIC,
  discount_amount NUMERIC,
  taxes NUMERIC,
  total_amount NUMERIC NOT NULL,
  is_partial BOOLEAN DEFAULT false,
  remaining_balance NUMERIC,
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,
  processed_by TEXT,
  payment_source TEXT,
  payment_details JSONB,
  payment_history JSONB
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des revenus d'appartement du propriétaire
CREATE TABLE IF NOT EXISTS owner_apartment_revenues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  apartment_id UUID NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  rent_collected NUMERIC NOT NULL,
  other_income NUMERIC NOT NULL,
  expenses NUMERIC NOT NULL,
  net_income NUMERIC NOT NULL,
  occupancy_days INTEGER NOT NULL,
  maintenance_costs NUMERIC NOT NULL,
  notes TEXT
);

-- Table des détails des propriétés du propriétaire
CREATE TABLE IF NOT EXISTS owner_properties_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id),
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  mortgage_info JSONB,
  insurance_info JSONB,
  tax_info JSONB,
  ownership_percentage NUMERIC NOT NULL,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  last_appraisal_date DATE
);

-- Table des locataires
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  identification_type TEXT,
  identification_number TEXT,
  employment_status TEXT,
  employer TEXT,
  income NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des notifications d'administrateur
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES administrators(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false,
  priority TEXT NOT NULL
);

-- Table des détails de bail
CREATE TABLE IF NOT EXISTS lease_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  security_deposit NUMERIC NOT NULL,
  pet_deposit NUMERIC,
  late_fee_percentage NUMERIC NOT NULL,
  grace_period_days INTEGER NOT NULL,
  payment_due_day INTEGER NOT NULL,
  lease_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  renewal_option BOOLEAN,
  renewal_notice_period INTEGER,
  increase_percentage_cap NUMERIC,
  is_cosigner_required BOOLEAN,
  cosigner_details JSONB,
  maintenance_terms TEXT,
  utilities_responsibility JSONB,
  insurance_requirements TEXT,
  special_provisions TEXT,
  early_termination_fee NUMERIC,
  early_termination_notice INTEGER,
  inspection_schedule TEXT,
  move_in_condition_report TEXT,
  move_out_condition_report TEXT,
  landlord_entry_notice_period INTEGER,
  documents TEXT[] DEFAULT '{}'
);

-- Vue des dépenses du propriétaire (Vue)
CREATE OR REPLACE VIEW owner_expenses_view AS
SELECT
  uuid_generate_v4() AS id,
  opd.owner_id,
  e.property_id,
  TO_CHAR(e.date, 'MM') AS month,
  EXTRACT(YEAR FROM e.date) AS year,
  e.category,
  e.amount,
  e.description,
  e.date,
  e.receipt_url
FROM
  expenses e
  JOIN owner_properties_details opd ON e.property_id = opd.property_id;

-- Table des notifications de paiement
CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  message TEXT NOT NULL,
  sent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_read BOOLEAN DEFAULT false,
  notification_type TEXT NOT NULL,
  reference_id TEXT
);

-- Table historique des statuts de paiement
CREATE TABLE IF NOT EXISTS payment_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL,
  status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID NOT NULL,
  notes TEXT,
  prev_status TEXT
);

-- Table des propriétaires de propriété
CREATE TABLE IF NOT EXISTS property_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  company_name TEXT,
  tax_id TEXT,
  payment_method TEXT NOT NULL,
  bank_details JSONB,
  payment_percentage NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des détails de paiement du locataire
CREATE TABLE IF NOT EXISTS tenant_payment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lease_id UUID NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  payment_due_day INTEGER NOT NULL,
  last_payment_date DATE,
  last_payment_amount NUMERIC,
  balance NUMERIC DEFAULT 0,
  payment_method TEXT NOT NULL,
  autopay_enabled BOOLEAN DEFAULT false,
  payment_history JSONB,
  credit_card_last4 TEXT,
  card_expiry TEXT,
  bank_account_last4 TEXT,
  late_fee_config JSONB,
  grace_period_days INTEGER NOT NULL,
  security_deposit_held NUMERIC NOT NULL,
  security_deposit_status TEXT NOT NULL
);

-- Table des appartements
CREATE TABLE IF NOT EXISTS apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  unit_number TEXT NOT NULL,
  floor_plan TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area NUMERIC NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  status TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  description TEXT
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL,
  special_requests TEXT,
  guests INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT DEFAULT 'pending',
  booking_reference TEXT
);

-- Table des frais de paiement en retard
CREATE TABLE IF NOT EXISTS late_payment_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES apartment_leases(id),
  amount NUMERIC NOT NULL,
  applied_date DATE NOT NULL,
  status TEXT NOT NULL,
  days_late INTEGER NOT NULL,
  original_due_date DATE NOT NULL,
  notes TEXT
);

-- Table des tentatives de paiement
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL,
  attempt_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  error_message TEXT,
  transaction_id TEXT,
  gateway_response JSONB,
  attempt_number INTEGER NOT NULL
);

-- Table des ventes de propriété
CREATE TABLE IF NOT EXISTS property_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  sale_price NUMERIC NOT NULL,
  sale_date DATE NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  documents TEXT[] DEFAULT '{}',
  closing_date DATE,
  notes TEXT,
  agent_id UUID
);

-- Table des unités de propriété
CREATE TABLE IF NOT EXISTS property_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  unit_number TEXT NOT NULL,
  type TEXT NOT NULL,
  floor INTEGER NOT NULL,
  area NUMERIC NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  status TEXT NOT NULL,
  features TEXT[] DEFAULT '{}'
);

-- Table des unités de locataire
CREATE TABLE IF NOT EXISTS tenant_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  unit_id UUID NOT NULL,
  lease_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

-- Table des inspections d'appartement
CREATE TABLE IF NOT EXISTS apartment_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL,
  inspector_id UUID NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_type TEXT NOT NULL,
  status TEXT NOT NULL,
  findings JSONB NOT NULL,
  action_items JSONB,
  images TEXT[] DEFAULT '{}',
  follow_up_date DATE,
  completed_date DATE
);

-- Table des actifs combinés du propriétaire
CREATE TABLE IF NOT EXISTS owner_combined_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  total_properties INTEGER NOT NULL,
  total_value NUMERIC NOT NULL,
  total_monthly_revenue NUMERIC NOT NULL,
  total_expenses NUMERIC NOT NULL,
  net_monthly_income NUMERIC NOT NULL,
  average_occupancy NUMERIC NOT NULL,
  total_units INTEGER NOT NULL,
  mortgaged_properties INTEGER NOT NULL,
  equity_percentage NUMERIC NOT NULL,
  appreciation_ytd NUMERIC NOT NULL,
  roi NUMERIC NOT NULL
);

-- Table des revenus mensuels du propriétaire
CREATE TABLE IF NOT EXISTS owner_monthly_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  revenue NUMERIC NOT NULL,
  expenses NUMERIC NOT NULL,
  net_income NUMERIC NOT NULL
);

-- Table des relevés du propriétaire
CREATE TABLE IF NOT EXISTS owner_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  rent_collected NUMERIC NOT NULL,
  other_income NUMERIC NOT NULL,
  management_fee NUMERIC NOT NULL,
  maintenance_costs NUMERIC NOT NULL,
  other_expenses NUMERIC NOT NULL,
  net_income NUMERIC NOT NULL,
  generated_date DATE NOT NULL,
  document_url TEXT
);

-- Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  billing_cycle TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  max_properties INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  has_api_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout de clés étrangères et contraintes d'intégrité

-- Relations pour apartment_leases
ALTER TABLE apartment_leases 
  ADD CONSTRAINT fk_apartment_leases_apartment 
  FOREIGN KEY (apartment_id) REFERENCES apartments(id);

ALTER TABLE apartment_leases 
  ADD CONSTRAINT fk_apartment_leases_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Relations pour apartment_tenants
ALTER TABLE apartment_tenants 
  ADD CONSTRAINT fk_apartment_tenants_apartment 
  FOREIGN KEY (apartment_id) REFERENCES apartments(id);

-- Relations pour apartment_units
ALTER TABLE apartment_units 
  ADD CONSTRAINT fk_apartment_units_property 
  FOREIGN KEY (property_id) REFERENCES properties(id);

-- Relations pour owner_late_payments
ALTER TABLE owner_late_payments 
  ADD CONSTRAINT fk_owner_late_payments_owner 
  FOREIGN KEY (owner_id) REFERENCES property_owners(id);

ALTER TABLE owner_late_payments 
  ADD CONSTRAINT fk_owner_late_payments_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);

ALTER TABLE owner_late_payments 
  ADD CONSTRAINT fk_owner_late_payments_property 
  FOREIGN KEY (property_id) REFERENCES properties(id);

-- Relations pour owner_property_revenues
ALTER TABLE owner_property_revenues 
  ADD CONSTRAINT fk_owner_property_revenues_owner 
  FOREIGN KEY (owner_id) REFERENCES property_owners(id);

ALTER TABLE owner_property_revenues 
  ADD CONSTRAINT fk_owner_property_revenues_property 
  FOREIGN KEY (property_id) REFERENCES properties(id);

-- Relations pour apartment_lease_payments
ALTER TABLE apartment_lease_payments 
  ADD CONSTRAINT fk_apartment_lease_payments_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Relations pour owner_apartment_revenues
ALTER TABLE owner_apartment_revenues 
  ADD CONSTRAINT fk_owner_apartment_revenues_owner 
  FOREIGN KEY (owner_id) REFERENCES property_owners(id);

ALTER TABLE owner_apartment_revenues 
  ADD CONSTRAINT fk_owner_apartment_revenues_apartment 
  FOREIGN KEY (apartment_id) REFERENCES apartments(id);

-- Relations pour payment_status_history
ALTER TABLE payment_status_history 
  ADD CONSTRAINT fk_payment_status_history_payment 
  FOREIGN KEY (payment_id) REFERENCES apartment_lease_payments(id);

-- Relations pour tenant_payment_details
ALTER TABLE tenant_payment_details 
  ADD CONSTRAINT fk_tenant_payment_details_lease 
  FOREIGN KEY (lease_id) REFERENCES apartment_leases(id);

-- Relations pour bookings
ALTER TABLE bookings 
  ADD CONSTRAINT fk_bookings_property 
  FOREIGN KEY (property_id) REFERENCES properties(id);

-- Relations pour tenant_units
ALTER TABLE tenant_units 
  ADD CONSTRAINT fk_tenant_units_unit 
  FOREIGN KEY (unit_id) REFERENCES property_units(id);

ALTER TABLE tenant_units 
  ADD CONSTRAINT fk_tenant_units_lease 
  FOREIGN KEY (lease_id) REFERENCES apartment_leases(id);

-- Relations pour apartment_inspections
ALTER TABLE apartment_inspections 
  ADD CONSTRAINT fk_apartment_inspections_apartment 
  FOREIGN KEY (apartment_id) REFERENCES apartments(id);

-- Relations pour owner_combined_assets
ALTER TABLE owner_combined_assets 
  ADD CONSTRAINT fk_owner_combined_assets_owner 
  FOREIGN KEY (owner_id) REFERENCES property_owners(id);

-- Relations pour owner_monthly_revenue
ALTER TABLE owner_monthly_revenue 
  ADD CONSTRAINT fk_owner_monthly_revenue_owner 
  FOREIGN KEY (owner_id) REFERENCES property_owners(id);

-- Relations pour owner_statements
ALTER TABLE owner_statements 
  ADD CONSTRAINT fk_owner_statements_owner 
  FOREIGN KEY (owner_id) REFERENCES property_owners(id);
