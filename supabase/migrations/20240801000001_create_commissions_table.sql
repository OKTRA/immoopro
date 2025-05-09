-- Create commissions table to track commissions on payments
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  rate DECIMAL(5, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_commissions_payment_id ON commissions(payment_id);
CREATE INDEX IF NOT EXISTS idx_commissions_lease_id ON commissions(lease_id);
CREATE INDEX IF NOT EXISTS idx_commissions_property_id ON commissions(property_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

-- Enable row level security
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
DROP POLICY IF EXISTS "Users can view their own commissions" ON commissions;
CREATE POLICY "Users can view their own commissions"
  ON commissions FOR SELECT
  USING (true);

-- Create policy for insert access
DROP POLICY IF EXISTS "Users can insert commissions" ON commissions;
CREATE POLICY "Users can insert commissions"
  ON commissions FOR INSERT
  WITH CHECK (true);

-- Create policy for update access
DROP POLICY IF EXISTS "Users can update commissions" ON commissions;
CREATE POLICY "Users can update commissions"
  ON commissions FOR UPDATE
  USING (true);

-- Add the table to realtime
alter publication supabase_realtime add table commissions;
