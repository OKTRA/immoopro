-- Make payment_date nullable
ALTER TABLE payments ALTER COLUMN payment_date DROP NOT NULL;

-- Create or replace trigger to set payment_date when status changes to paid
CREATE OR REPLACE FUNCTION set_payment_date_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set payment_date when status changes to 'paid' and payment_date is null
  IF NEW.status = 'paid' AND NEW.payment_date IS NULL THEN
    NEW.payment_date := CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_payment_date_trigger ON payments;

-- Create the trigger
CREATE TRIGGER set_payment_date_trigger
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION set_payment_date_on_paid();
