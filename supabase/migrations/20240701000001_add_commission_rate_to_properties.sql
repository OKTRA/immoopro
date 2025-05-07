-- Add agency_commission_rate column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS agency_commission_rate NUMERIC DEFAULT 10;

-- Add comment to explain the column
COMMENT ON COLUMN properties.agency_commission_rate IS 'Commission rate percentage that the agency earns from property payments';
