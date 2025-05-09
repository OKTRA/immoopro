-- Create agency_fees table if it doesn't exist
CREATE TABLE IF NOT EXISTS agency_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID REFERENCES agencies(id),
    property_id UUID REFERENCES properties(id),
    lease_id UUID REFERENCES leases(id),
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_agency_fees_lease_id ON agency_fees(lease_id);
CREATE INDEX IF NOT EXISTS idx_agency_fees_property_id ON agency_fees(property_id);
CREATE INDEX IF NOT EXISTS idx_agency_fees_agency_id ON agency_fees(agency_id);

-- Add agency_commission_rate column to properties table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' 
                   AND column_name = 'agency_commission_rate') THEN
        ALTER TABLE properties ADD COLUMN agency_commission_rate DECIMAL(5, 2) DEFAULT 10;
    END IF;
END$$;

-- Update existing properties to have a default commission rate if null
UPDATE properties SET agency_commission_rate = 10 WHERE agency_commission_rate IS NULL;
