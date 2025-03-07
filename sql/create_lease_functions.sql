
-- This SQL file will be executed by you after reviewing it
-- to ensure atomicity in lease operations with property status updates

-- Function to create a lease and update property status in a single transaction
CREATE OR REPLACE FUNCTION create_lease_with_property_update(
  lease_data jsonb,
  property_id uuid,
  new_property_status text
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  inserted_lease jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert the new lease
    INSERT INTO leases (
      property_id,
      tenant_id,
      start_date,
      end_date,
      payment_start_date,
      monthly_rent,
      security_deposit,
      payment_day,
      payment_frequency,
      is_active,
      signed_by_tenant,
      signed_by_owner,
      has_renewal_option,
      lease_type,
      special_conditions,
      status
    ) VALUES (
      (lease_data->>'property_id')::uuid,
      (lease_data->>'tenant_id')::uuid,
      (lease_data->>'start_date')::date,
      (lease_data->>'end_date')::date,
      (lease_data->>'payment_start_date')::date,
      (lease_data->>'monthly_rent')::numeric,
      (lease_data->>'security_deposit')::numeric,
      (lease_data->>'payment_day')::int,
      lease_data->>'payment_frequency',
      (lease_data->>'is_active')::boolean,
      (lease_data->>'signed_by_tenant')::boolean,
      (lease_data->>'signed_by_owner')::boolean,
      (lease_data->>'has_renewal_option')::boolean,
      lease_data->>'lease_type',
      lease_data->>'special_conditions',
      lease_data->>'status'
    )
    RETURNING to_jsonb(leases.*) INTO inserted_lease;

    -- Update the property status
    UPDATE properties
    SET status = new_property_status
    WHERE id = property_id;

    -- Commit the transaction
    RETURN inserted_lease;
  END;
END;
$$;

-- New function to create a lease with initial payments in one transaction
CREATE OR REPLACE FUNCTION create_lease_with_payments(
  lease_data jsonb,
  property_id uuid,
  new_property_status text,
  agency_fees numeric
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  inserted_lease jsonb;
  lease_id uuid;
  lease_start_date date;
BEGIN
  -- Start transaction
  BEGIN
    -- Extract the lease start date for payment dates
    lease_start_date := (lease_data->>'start_date')::date;
    
    -- Insert the new lease first
    INSERT INTO leases (
      property_id,
      tenant_id,
      start_date,
      end_date,
      payment_start_date,
      monthly_rent,
      security_deposit,
      payment_day,
      payment_frequency,
      is_active,
      signed_by_tenant,
      signed_by_owner,
      has_renewal_option,
      lease_type,
      special_conditions,
      status
    ) VALUES (
      (lease_data->>'property_id')::uuid,
      (lease_data->>'tenant_id')::uuid,
      (lease_data->>'start_date')::date,
      (lease_data->>'end_date')::date,
      (lease_data->>'payment_start_date')::date,
      (lease_data->>'monthly_rent')::numeric,
      (lease_data->>'security_deposit')::numeric,
      (lease_data->>'payment_day')::int,
      lease_data->>'payment_frequency',
      (lease_data->>'is_active')::boolean,
      (lease_data->>'signed_by_tenant')::boolean,
      (lease_data->>'signed_by_owner')::boolean,
      (lease_data->>'has_renewal_option')::boolean,
      lease_data->>'lease_type',
      lease_data->>'special_conditions',
      lease_data->>'status'
    )
    RETURNING id INTO lease_id;
    
    -- Get the inserted lease data for return
    SELECT to_jsonb(leases.*) INTO inserted_lease FROM leases WHERE id = lease_id;
    
    -- Create security deposit payment
    IF (lease_data->>'security_deposit')::numeric > 0 THEN
      INSERT INTO payments (
        lease_id,
        amount,
        payment_date,
        due_date,
        payment_method,
        status,
        payment_type,
        is_auto_generated,
        notes
      ) VALUES (
        lease_id,
        (lease_data->>'security_deposit')::numeric,
        lease_start_date, -- Use lease start date instead of current date
        lease_start_date, -- Use lease start date instead of current date
        'bank_transfer',
        'paid',
        'deposit',
        true,
        'Caution initiale'
      );
    END IF;
    
    -- Create agency fees payment if applicable
    IF agency_fees > 0 THEN
      INSERT INTO payments (
        lease_id,
        amount,
        payment_date,
        due_date,
        payment_method,
        status,
        payment_type,
        is_auto_generated,
        notes
      ) VALUES (
        lease_id,
        agency_fees,
        lease_start_date, -- Use lease start date instead of current date
        lease_start_date, -- Use lease start date instead of current date
        'bank_transfer',
        'paid',
        'agency_fee',
        true,
        'Frais d''agence'
      );
    END IF;
    
    -- Update the property status
    UPDATE properties
    SET status = new_property_status
    WHERE id = property_id;

    -- Commit the transaction
    RETURN inserted_lease;
  END;
END;
$$;

-- Function to check if a property has any active leases
CREATE OR REPLACE FUNCTION property_has_active_leases(property_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  has_leases boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM leases 
    WHERE property_id = property_id_param 
    AND is_active = true
  ) INTO has_leases;
  
  RETURN has_leases;
END;
$$;

-- Trigger function to update property status when a lease is created/updated/deleted
CREATE OR REPLACE FUNCTION update_property_status_on_lease_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If a lease is being created/updated to be active
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_active = true THEN
    UPDATE properties
    SET status = 'occupied'
    WHERE id = NEW.property_id;
  -- If a lease is being deleted or updated to inactive
  ELSIF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.is_active = false)) THEN
    -- Check if there are any other active leases for this property
    IF NOT property_has_active_leases(
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.property_id 
        ELSE NEW.property_id 
      END
    ) THEN
      UPDATE properties
      SET status = 'available'
      WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.property_id 
        ELSE NEW.property_id 
      END;
    END IF;
  END IF;
  
  -- Return the appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers for lease table
DROP TRIGGER IF EXISTS update_property_status_after_lease_insert ON leases;
CREATE TRIGGER update_property_status_after_lease_insert
AFTER INSERT ON leases
FOR EACH ROW
EXECUTE FUNCTION update_property_status_on_lease_change();

DROP TRIGGER IF EXISTS update_property_status_after_lease_update ON leases;
CREATE TRIGGER update_property_status_after_lease_update
AFTER UPDATE ON leases
FOR EACH ROW
EXECUTE FUNCTION update_property_status_on_lease_change();

DROP TRIGGER IF EXISTS update_property_status_after_lease_delete ON leases;
CREATE TRIGGER update_property_status_after_lease_delete
AFTER DELETE ON leases
FOR EACH ROW
EXECUTE FUNCTION update_property_status_on_lease_change();

-- Update all properties to correct status based on active leases
UPDATE properties p
SET status = CASE
  WHEN EXISTS (
    SELECT 1 FROM leases l 
    WHERE l.property_id = p.id 
    AND l.is_active = true
  ) THEN 'occupied'
  ELSE 'available'
END
WHERE p.status != CASE
  WHEN EXISTS (
    SELECT 1 FROM leases l 
    WHERE l.property_id = p.id 
    AND l.is_active = true
  ) THEN 'occupied'
  ELSE 'available'
END;
