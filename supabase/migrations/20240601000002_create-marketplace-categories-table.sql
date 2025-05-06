-- Create marketplace_categories table
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  product_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS marketplace_categories_parent_id_idx ON marketplace_categories(parent_id);

-- Enable RLS on the table
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting categories
CREATE POLICY "Anyone can view categories" 
ON marketplace_categories 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Create policy for inserting categories (admin only)
CREATE POLICY "Only admins can create categories" 
ON marketplace_categories 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create policy for updating categories (admin only)
CREATE POLICY "Only admins can update categories" 
ON marketplace_categories 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create policy for deleting categories (admin only)
CREATE POLICY "Only admins can delete categories" 
ON marketplace_categories 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
