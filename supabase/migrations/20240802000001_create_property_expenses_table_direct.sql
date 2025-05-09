-- Create property_expenses table directly
CREATE TABLE IF NOT EXISTS public.property_expenses (
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
CREATE INDEX IF NOT EXISTS property_expenses_property_id_idx ON public.property_expenses(property_id);
CREATE INDEX IF NOT EXISTS property_expenses_category_idx ON public.property_expenses(category);
CREATE INDEX IF NOT EXISTS property_expenses_date_idx ON public.property_expenses(date);

-- Add RLS policies
ALTER TABLE public.property_expenses ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for now
DROP POLICY IF EXISTS "Allow all operations for now" ON public.property_expenses;
CREATE POLICY "Allow all operations for now"
ON public.property_expenses
USING (true)
WITH CHECK (true);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_expenses;
