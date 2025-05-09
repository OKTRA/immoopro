-- Make payment_date nullable in the payments table
DO $$
BEGIN
    -- Check if the constraint exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_payment_date_not_null' 
        AND table_name = 'payments'
    ) THEN
        -- Drop the constraint if it exists
        ALTER TABLE payments DROP CONSTRAINT payments_payment_date_not_null;
    END IF;
    
    -- Check if the column exists and is not nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'payment_date' 
        AND is_nullable = 'NO'
    ) THEN
        -- Alter the column to be nullable
        ALTER TABLE payments ALTER COLUMN payment_date DROP NOT NULL;
    END IF;
END$$;

-- Add a trigger to automatically set payment_date when status is changed to 'paid'
CREATE OR REPLACE FUNCTION set_payment_date_on_paid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND (OLD.status != 'paid' OR OLD.status IS NULL) THEN
        NEW.payment_date := COALESCE(NEW.payment_date, CURRENT_DATE);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_payment_date_on_paid_trigger ON payments;

-- Create the trigger
CREATE TRIGGER set_payment_date_on_paid_trigger
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION set_payment_date_on_paid();
