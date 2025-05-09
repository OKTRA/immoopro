-- Add termination_date and termination_notes columns to leases table
ALTER TABLE leases
ADD COLUMN IF NOT EXISTS termination_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS termination_notes TEXT;
