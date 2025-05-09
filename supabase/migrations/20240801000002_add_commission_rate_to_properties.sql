-- Add commission rate column to properties table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' 
                   AND column_name = 'agency_commission_rate') THEN
        ALTER TABLE properties ADD COLUMN agency_commission_rate DECIMAL(5, 2) DEFAULT 10;
    END IF;
END$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_commission_rate ON properties(agency_commission_rate);

-- Update existing properties to have a default commission rate if null
UPDATE properties SET agency_commission_rate = 10 WHERE agency_commission_rate IS NULL;
