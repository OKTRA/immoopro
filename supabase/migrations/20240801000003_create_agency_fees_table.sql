-- Create agency_fees table if it doesn't exist
CREATE TABLE IF NOT EXISTS agency_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE agency_fees ENABLE ROW LEVEL SECURITY;

-- Create policy for agency_fees
DROP POLICY IF EXISTS "Agency fees are viewable by authenticated users" ON agency_fees;
CREATE POLICY "Agency fees are viewable by authenticated users"
  ON agency_fees FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy for agency_fees insert
DROP POLICY IF EXISTS "Agency fees are insertable by authenticated users" ON agency_fees;
CREATE POLICY "Agency fees are insertable by authenticated users"
  ON agency_fees FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for agency_fees update
DROP POLICY IF EXISTS "Agency fees are updatable by authenticated users" ON agency_fees;
CREATE POLICY "Agency fees are updatable by authenticated users"
  ON agency_fees FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE agency_fees;
