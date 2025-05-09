-- Add termination_date column to leases table
ALTER TABLE leases ADD COLUMN IF NOT EXISTS termination_date TIMESTAMPTZ;
ALTER TABLE leases ADD COLUMN IF NOT EXISTS termination_notes TEXT;
