-- Create a function to create the property_expenses table if it doesn't exist
CREATE OR REPLACE FUNCTION create_property_expenses_table()
RETURNS void AS $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'property_expenses') THEN
        -- Create the property_expenses table
        CREATE TABLE public.property_expenses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
            amount DECIMAL(12, 2) NOT NULL,
            date DATE NOT NULL,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            receipt_url TEXT,
            tenant_name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX property_expenses_property_id_idx ON public.property_expenses(property_id);
        CREATE INDEX property_expenses_category_idx ON public.property_expenses(category);
        CREATE INDEX property_expenses_date_idx ON public.property_expenses(date);
        
        -- Add RLS policies
        ALTER TABLE public.property_expenses ENABLE ROW LEVEL SECURITY;
        
        -- Create a policy to allow all operations for now
        CREATE POLICY "Allow all operations for now"
        ON public.property_expenses
        USING (true)
        WITH CHECK (true);
        
        -- Create a trigger to update the updated_at column
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.property_expenses
        FOR EACH ROW
        EXECUTE FUNCTION public.set_updated_at();
        
        -- Add to realtime
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.property_expenses;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;
END;
$$ LANGUAGE plpgsql;
