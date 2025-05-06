-- Create marketplace_shops table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  location TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  agency_id UUID REFERENCES agencies(id),
  status TEXT NOT NULL DEFAULT 'active',
  rating FLOAT DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES marketplace_categories(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'XOF',
  stock_quantity INTEGER DEFAULT 0,
  shop_id UUID NOT NULL REFERENCES marketplace_shops(id),
  category_id UUID REFERENCES marketplace_categories(id),
  status TEXT NOT NULL DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  rating FLOAT DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'XOF',
  shipping_address TEXT,
  billing_address TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_carts table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES marketplace_carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Create RLS policies for marketplace_shops
ALTER TABLE marketplace_shops ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view active shops
CREATE POLICY shop_select_policy ON marketplace_shops
  FOR SELECT USING (status = 'active' OR auth.uid() = owner_id);

-- Policy: Shop owners can update their own shops
CREATE POLICY shop_update_policy ON marketplace_shops
  FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Users with appropriate roles can create shops
CREATE POLICY shop_insert_policy ON marketplace_shops
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND 
      (role = 'agency' OR role = 'owner' OR role = 'admin')
    )
  );

-- Create function to ensure marketplace_shops table exists
CREATE OR REPLACE FUNCTION create_marketplace_shops_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'marketplace_shops'
  ) THEN
    -- Create the table if it doesn't exist
    EXECUTE '
      CREATE TABLE public.marketplace_shops (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        logo_url TEXT,
        banner_url TEXT,
        location TEXT,
        contact_email TEXT NOT NULL,
        contact_phone TEXT,
        owner_id UUID NOT NULL REFERENCES auth.users(id),
        agency_id UUID REFERENCES agencies(id),
        status TEXT NOT NULL DEFAULT ''active'',
        rating FLOAT DEFAULT 0,
        total_products INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      ALTER TABLE public.marketplace_shops ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY shop_select_policy ON public.marketplace_shops
        FOR SELECT USING (status = ''active'' OR auth.uid() = owner_id);
      
      CREATE POLICY shop_update_policy ON public.marketplace_shops
        FOR UPDATE USING (auth.uid() = owner_id);
      
      CREATE POLICY shop_insert_policy ON public.marketplace_shops
        FOR INSERT WITH CHECK (
          auth.uid() = owner_id AND 
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND 
            (role = ''agency'' OR role = ''owner'' OR role = ''admin'')
          )
        );
    ';
    RETURN TRUE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to ensure marketplace_products table exists
CREATE OR REPLACE FUNCTION create_marketplace_products_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'marketplace_products'
  ) THEN
    -- Create the table if it doesn't exist
    EXECUTE '
      CREATE TABLE public.marketplace_products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        sale_price DECIMAL(10, 2),
        currency TEXT DEFAULT ''XOF'',
        stock_quantity INTEGER DEFAULT 0,
        shop_id UUID NOT NULL REFERENCES marketplace_shops(id),
        category_id UUID REFERENCES marketplace_categories(id),
        status TEXT NOT NULL DEFAULT ''active'',
        featured BOOLEAN DEFAULT false,
        rating FLOAT DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY product_select_policy ON public.marketplace_products
        FOR SELECT USING (status = ''active'' OR EXISTS (
          SELECT 1 FROM marketplace_shops 
          WHERE marketplace_shops.id = marketplace_products.shop_id 
          AND marketplace_shops.owner_id = auth.uid()
        ));
      
      CREATE POLICY product_insert_policy ON public.marketplace_products
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM marketplace_shops 
            WHERE marketplace_shops.id = marketplace_products.shop_id 
            AND marketplace_shops.owner_id = auth.uid()
          )
        );
      
      CREATE POLICY product_update_policy ON public.marketplace_products
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM marketplace_shops 
            WHERE marketplace_shops.id = marketplace_products.shop_id 
            AND marketplace_shops.owner_id = auth.uid()
          )
        );
    ';
    RETURN TRUE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to ensure marketplace_categories table exists
CREATE OR REPLACE FUNCTION create_marketplace_categories_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'marketplace_categories'
  ) THEN
    -- Create the table if it doesn't exist
    EXECUTE '
      CREATE TABLE public.marketplace_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        parent_id UUID REFERENCES marketplace_categories(id),
        status TEXT NOT NULL DEFAULT ''active'',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY category_select_policy ON public.marketplace_categories
        FOR SELECT USING (status = ''active'' OR auth.uid() IN (
          SELECT role_id FROM user_roles WHERE role = ''admin''
        ));
      
      CREATE POLICY category_insert_policy ON public.marketplace_categories
        FOR INSERT WITH CHECK (
          auth.uid() IN (SELECT role_id FROM user_roles WHERE role = ''admin'')
        );
      
      CREATE POLICY category_update_policy ON public.marketplace_categories
        FOR UPDATE USING (
          auth.uid() IN (SELECT role_id FROM user_roles WHERE role = ''admin'')
        );
    ';
    
    -- Insert some default categories
    EXECUTE '
      INSERT INTO public.marketplace_categories (name, description, image_url)
      VALUES 
        (''Immobilier'', ''Produits et services liés à l''immobilier'', ''https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80''),
        (''Décoration'', ''Articles de décoration pour votre maison'', ''https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80''),
        (''Mobilier'', ''Meubles et accessoires pour votre intérieur'', ''https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80''),
        (''Services'', ''Services professionnels pour votre propriété'', ''https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80'')
    ';
    
    RETURN TRUE;
  END IF;
  
  RETURN TRUE;
END;
$$;
