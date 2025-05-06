-- Create marketplace_shops table
CREATE TABLE IF NOT EXISTS marketplace_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  contact_email TEXT,
  contact_phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  rating NUMERIC,
  total_products INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS marketplace_shops_owner_id_idx ON marketplace_shops(owner_id);
CREATE INDEX IF NOT EXISTS marketplace_shops_agency_id_idx ON marketplace_shops(agency_id);
CREATE INDEX IF NOT EXISTS marketplace_shops_status_idx ON marketplace_shops(status);

-- Enable RLS on the table
ALTER TABLE marketplace_shops ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting shops
CREATE POLICY "Users can create their own shops" 
ON marketplace_shops 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Create policy for selecting shops
CREATE POLICY "Anyone can view active shops" 
ON marketplace_shops 
FOR SELECT 
USING (status = 'active');

-- Create policy for updating shops
CREATE POLICY "Users can update their own shops" 
ON marketplace_shops 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- Create policy for deleting shops
CREATE POLICY "Users can delete their own shops" 
ON marketplace_shops 
FOR DELETE 
USING (auth.uid() = owner_id);
