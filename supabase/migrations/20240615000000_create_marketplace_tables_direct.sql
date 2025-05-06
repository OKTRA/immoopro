-- Direct creation of all marketplace tables

-- Create marketplace_shops table
CREATE TABLE IF NOT EXISTS marketplace_shops (
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
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  rating NUMERIC DEFAULT 0,
  total_products INTEGER DEFAULT 0
);

-- Create indexes for marketplace_shops
CREATE INDEX IF NOT EXISTS marketplace_shops_owner_id_idx ON marketplace_shops(owner_id);
CREATE INDEX IF NOT EXISTS marketplace_shops_agency_id_idx ON marketplace_shops(agency_id);
CREATE INDEX IF NOT EXISTS marketplace_shops_status_idx ON marketplace_shops(status);

-- Enable RLS for marketplace_shops
ALTER TABLE marketplace_shops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_shops
DROP POLICY IF EXISTS shop_select_policy ON marketplace_shops;
CREATE POLICY shop_select_policy ON marketplace_shops
  FOR SELECT USING (status = 'active' OR auth.uid() = owner_id);

DROP POLICY IF EXISTS shop_insert_policy ON marketplace_shops;
CREATE POLICY shop_insert_policy ON marketplace_shops
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND 
      (profiles.role = 'agency' OR profiles.role = 'owner' OR profiles.role = 'admin')
    )
  );

DROP POLICY IF EXISTS shop_update_policy ON marketplace_shops;
CREATE POLICY shop_update_policy ON marketplace_shops
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS shop_delete_policy ON marketplace_shops;
CREATE POLICY shop_delete_policy ON marketplace_shops
  FOR DELETE USING (auth.uid() = owner_id);

-- Create marketplace_categories table
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  product_count INTEGER DEFAULT 0
);

-- Create indexes for marketplace_categories
CREATE INDEX IF NOT EXISTS marketplace_categories_parent_id_idx ON marketplace_categories(parent_id);

-- Enable RLS for marketplace_categories
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_categories
DROP POLICY IF EXISTS category_select_policy ON marketplace_categories;
CREATE POLICY category_select_policy ON marketplace_categories
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS category_insert_policy ON marketplace_categories;
CREATE POLICY category_insert_policy ON marketplace_categories
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND 
      profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS category_update_policy ON marketplace_categories;
CREATE POLICY category_update_policy ON marketplace_categories
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND 
      profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS category_delete_policy ON marketplace_categories;
CREATE POLICY category_delete_policy ON marketplace_categories
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND 
      profiles.role = 'admin'
    )
  );

-- Create marketplace_products table
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES marketplace_shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'XOF',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  specifications JSONB,
  tags TEXT[],
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0
);

-- Create indexes for marketplace_products
CREATE INDEX IF NOT EXISTS marketplace_products_shop_id_idx ON marketplace_products(shop_id);
CREATE INDEX IF NOT EXISTS marketplace_products_category_id_idx ON marketplace_products(category_id);
CREATE INDEX IF NOT EXISTS marketplace_products_status_idx ON marketplace_products(status);
CREATE INDEX IF NOT EXISTS marketplace_products_featured_idx ON marketplace_products(featured);

-- Enable RLS for marketplace_products
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_products
DROP POLICY IF EXISTS product_select_policy ON marketplace_products;
CREATE POLICY product_select_policy ON marketplace_products
  FOR SELECT USING (
    status = 'active' OR 
    EXISTS (
      SELECT 1 FROM marketplace_shops 
      WHERE marketplace_shops.id = marketplace_products.shop_id 
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_insert_policy ON marketplace_products;
CREATE POLICY product_insert_policy ON marketplace_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_shops 
      WHERE marketplace_shops.id = marketplace_products.shop_id 
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_update_policy ON marketplace_products;
CREATE POLICY product_update_policy ON marketplace_products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM marketplace_shops 
      WHERE marketplace_shops.id = marketplace_products.shop_id 
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_delete_policy ON marketplace_products;
CREATE POLICY product_delete_policy ON marketplace_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM marketplace_shops 
      WHERE marketplace_shops.id = marketplace_products.shop_id 
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

-- Create marketplace_product_images table
CREATE TABLE IF NOT EXISTS marketplace_product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for marketplace_product_images
CREATE INDEX IF NOT EXISTS marketplace_product_images_product_id_idx ON marketplace_product_images(product_id);

-- Enable RLS for marketplace_product_images
ALTER TABLE marketplace_product_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_product_images
DROP POLICY IF EXISTS product_image_select_policy ON marketplace_product_images;
CREATE POLICY product_image_select_policy ON marketplace_product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM marketplace_products
      WHERE marketplace_products.id = marketplace_product_images.product_id
      AND marketplace_products.status = 'active'
    ) OR 
    EXISTS (
      SELECT 1 FROM marketplace_products
      JOIN marketplace_shops ON marketplace_shops.id = marketplace_products.shop_id
      WHERE marketplace_products.id = marketplace_product_images.product_id
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_image_insert_policy ON marketplace_product_images;
CREATE POLICY product_image_insert_policy ON marketplace_product_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_products
      JOIN marketplace_shops ON marketplace_shops.id = marketplace_products.shop_id
      WHERE marketplace_products.id = marketplace_product_images.product_id
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_image_update_policy ON marketplace_product_images;
CREATE POLICY product_image_update_policy ON marketplace_product_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM marketplace_products
      JOIN marketplace_shops ON marketplace_shops.id = marketplace_products.shop_id
      WHERE marketplace_products.id = marketplace_product_images.product_id
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_image_delete_policy ON marketplace_product_images;
CREATE POLICY product_image_delete_policy ON marketplace_product_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM marketplace_products
      JOIN marketplace_shops ON marketplace_shops.id = marketplace_products.shop_id
      WHERE marketplace_products.id = marketplace_product_images.product_id
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

-- Create marketplace_orders table
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES marketplace_shops(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  billing_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  tracking_number TEXT,
  notes TEXT
);

-- Create indexes for marketplace_orders
CREATE INDEX IF NOT EXISTS marketplace_orders_user_id_idx ON marketplace_orders(user_id);
CREATE INDEX IF NOT EXISTS marketplace_orders_shop_id_idx ON marketplace_orders(shop_id);
CREATE INDEX IF NOT EXISTS marketplace_orders_status_idx ON marketplace_orders(status);

-- Enable RLS for marketplace_orders
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_orders
DROP POLICY IF EXISTS order_select_policy ON marketplace_orders;
CREATE POLICY order_select_policy ON marketplace_orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM marketplace_shops 
      WHERE marketplace_shops.id = marketplace_orders.shop_id 
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS order_insert_policy ON marketplace_orders;
CREATE POLICY order_insert_policy ON marketplace_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS order_update_policy ON marketplace_orders;
CREATE POLICY order_update_policy ON marketplace_orders
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM marketplace_shops 
      WHERE marketplace_shops.id = marketplace_orders.shop_id 
      AND marketplace_shops.owner_id = auth.uid()
    )
  );

-- Create marketplace_order_items table
CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for marketplace_order_items
CREATE INDEX IF NOT EXISTS marketplace_order_items_order_id_idx ON marketplace_order_items(order_id);
CREATE INDEX IF NOT EXISTS marketplace_order_items_product_id_idx ON marketplace_order_items(product_id);

-- Enable RLS for marketplace_order_items
ALTER TABLE marketplace_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_order_items
DROP POLICY IF EXISTS order_item_select_policy ON marketplace_order_items;
CREATE POLICY order_item_select_policy ON marketplace_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM marketplace_orders 
      WHERE marketplace_orders.id = marketplace_order_items.order_id 
      AND (
        marketplace_orders.user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM marketplace_shops 
          WHERE marketplace_shops.id = marketplace_orders.shop_id 
          AND marketplace_shops.owner_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS order_item_insert_policy ON marketplace_order_items;
CREATE POLICY order_item_insert_policy ON marketplace_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_orders 
      WHERE marketplace_orders.id = marketplace_order_items.order_id 
      AND marketplace_orders.user_id = auth.uid()
    )
  );

-- Create marketplace_reviews table
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for marketplace_reviews
CREATE INDEX IF NOT EXISTS marketplace_reviews_product_id_idx ON marketplace_reviews(product_id);
CREATE INDEX IF NOT EXISTS marketplace_reviews_user_id_idx ON marketplace_reviews(user_id);

-- Enable RLS for marketplace_reviews
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_reviews
DROP POLICY IF EXISTS review_select_policy ON marketplace_reviews;
CREATE POLICY review_select_policy ON marketplace_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS review_insert_policy ON marketplace_reviews;
CREATE POLICY review_insert_policy ON marketplace_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS review_update_policy ON marketplace_reviews;
CREATE POLICY review_update_policy ON marketplace_reviews
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS review_delete_policy ON marketplace_reviews;
CREATE POLICY review_delete_policy ON marketplace_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create marketplace_carts table
CREATE TABLE IF NOT EXISTS marketplace_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for marketplace_carts
CREATE INDEX IF NOT EXISTS marketplace_carts_user_id_idx ON marketplace_carts(user_id);

-- Enable RLS for marketplace_carts
ALTER TABLE marketplace_carts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_carts
DROP POLICY IF EXISTS cart_select_policy ON marketplace_carts;
CREATE POLICY cart_select_policy ON marketplace_carts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS cart_insert_policy ON marketplace_carts;
CREATE POLICY cart_insert_policy ON marketplace_carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS cart_update_policy ON marketplace_carts;
CREATE POLICY cart_update_policy ON marketplace_carts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS cart_delete_policy ON marketplace_carts;
CREATE POLICY cart_delete_policy ON marketplace_carts
  FOR DELETE USING (auth.uid() = user_id);

-- Create marketplace_cart_items table
CREATE TABLE IF NOT EXISTS marketplace_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES marketplace_carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(cart_id, product_id)
);

-- Create indexes for marketplace_cart_items
CREATE INDEX IF NOT EXISTS marketplace_cart_items_cart_id_idx ON marketplace_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS marketplace_cart_items_product_id_idx ON marketplace_cart_items(product_id);

-- Enable RLS for marketplace_cart_items
ALTER TABLE marketplace_cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_cart_items
DROP POLICY IF EXISTS cart_item_select_policy ON marketplace_cart_items;
CREATE POLICY cart_item_select_policy ON marketplace_cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM marketplace_carts 
      WHERE marketplace_carts.id = marketplace_cart_items.cart_id 
      AND marketplace_carts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS cart_item_insert_policy ON marketplace_cart_items;
CREATE POLICY cart_item_insert_policy ON marketplace_cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_carts 
      WHERE marketplace_carts.id = marketplace_cart_items.cart_id 
      AND marketplace_carts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS cart_item_update_policy ON marketplace_cart_items;
CREATE POLICY cart_item_update_policy ON marketplace_cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM marketplace_carts 
      WHERE marketplace_carts.id = marketplace_cart_items.cart_id 
      AND marketplace_carts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS cart_item_delete_policy ON marketplace_cart_items;
CREATE POLICY cart_item_delete_policy ON marketplace_cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM marketplace_carts 
      WHERE marketplace_carts.id = marketplace_cart_items.cart_id 
      AND marketplace_carts.user_id = auth.uid()
    )
  );

-- Insert default categories
INSERT INTO marketplace_categories (name, description, image_url, status)
VALUES 
  ('Immobilier', 'Produits et services liés à l''immobilier', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', 'active'),
  ('Décoration', 'Articles de décoration pour votre maison', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80', 'active'),
  ('Mobilier', 'Meubles et accessoires pour votre intérieur', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'active'),
  ('Services', 'Services professionnels pour votre propriété', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', 'active')
ON CONFLICT DO NOTHING;
