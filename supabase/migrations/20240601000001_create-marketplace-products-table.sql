-- Create marketplace_products table
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES marketplace_shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  images TEXT[] DEFAULT '{}',
  category_id TEXT,
  subcategory_id TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  specifications JSONB,
  tags TEXT[],
  rating NUMERIC,
  total_reviews INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS marketplace_products_shop_id_idx ON marketplace_products(shop_id);
CREATE INDEX IF NOT EXISTS marketplace_products_category_id_idx ON marketplace_products(category_id);
CREATE INDEX IF NOT EXISTS marketplace_products_status_idx ON marketplace_products(status);
CREATE INDEX IF NOT EXISTS marketplace_products_featured_idx ON marketplace_products(featured);

-- Enable RLS on the table
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting products
CREATE POLICY "Shop owners can create products" 
ON marketplace_products 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM marketplace_shops 
    WHERE marketplace_shops.id = marketplace_products.shop_id 
    AND marketplace_shops.owner_id = auth.uid()
  )
);

-- Create policy for selecting products
CREATE POLICY "Anyone can view active products" 
ON marketplace_products 
FOR SELECT 
USING (status = 'active');

-- Create policy for updating products
CREATE POLICY "Shop owners can update products" 
ON marketplace_products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM marketplace_shops 
    WHERE marketplace_shops.id = marketplace_products.shop_id 
    AND marketplace_shops.owner_id = auth.uid()
  )
);

-- Create policy for deleting products
CREATE POLICY "Shop owners can delete products" 
ON marketplace_products 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM marketplace_shops 
    WHERE marketplace_shops.id = marketplace_products.shop_id 
    AND marketplace_shops.owner_id = auth.uid()
  )
);
