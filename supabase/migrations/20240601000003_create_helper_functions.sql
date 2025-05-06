-- Create helper functions for marketplace tables

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to execute SQL dynamically
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Function to create marketplace_shops table
CREATE OR REPLACE FUNCTION create_marketplace_shops_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if table already exists
  IF (SELECT check_table_exists('marketplace_shops')) THEN
    RETURN TRUE;
  END IF;

  -- Create the table
  EXECUTE '
    CREATE TABLE marketplace_shops (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      logo_url TEXT,
      banner_url TEXT,
      owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
      contact_email TEXT,
      contact_phone TEXT,
      location TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      status TEXT NOT NULL DEFAULT ''active'' CHECK (status IN (''active'', ''inactive'', ''pending'')),
      rating NUMERIC,
      total_products INTEGER DEFAULT 0
    );

    CREATE INDEX marketplace_shops_owner_id_idx ON marketplace_shops(owner_id);
    CREATE INDEX marketplace_shops_agency_id_idx ON marketplace_shops(agency_id);
    CREATE INDEX marketplace_shops_status_idx ON marketplace_shops(status);

    ALTER TABLE marketplace_shops ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can create their own shops" 
    ON marketplace_shops 
    FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

    CREATE POLICY "Anyone can view active shops" 
    ON marketplace_shops 
    FOR SELECT 
    USING (status = ''active'');

    CREATE POLICY "Users can update their own shops" 
    ON marketplace_shops 
    FOR UPDATE 
    USING (auth.uid() = owner_id);

    CREATE POLICY "Users can delete their own shops" 
    ON marketplace_shops 
    FOR DELETE 
    USING (auth.uid() = owner_id);
  ';

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating marketplace_shops table: %', SQLERRM;
  RETURN FALSE;
END;
$$;
