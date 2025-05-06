// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        },
      );
    }

    // Create marketplace_shops table
    const createShopsTable = `
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
        rating NUMERIC,
        total_products INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS marketplace_shops_owner_id_idx ON marketplace_shops(owner_id);
      CREATE INDEX IF NOT EXISTS marketplace_shops_agency_id_idx ON marketplace_shops(agency_id);
      CREATE INDEX IF NOT EXISTS marketplace_shops_status_idx ON marketplace_shops(status);

      ALTER TABLE marketplace_shops ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can create their own shops" 
      ON marketplace_shops 
      FOR INSERT 
      WITH CHECK (auth.uid() = owner_id);

      CREATE POLICY "Anyone can view active shops" 
      ON marketplace_shops 
      FOR SELECT 
      USING (status = 'active');

      CREATE POLICY "Users can update their own shops" 
      ON marketplace_shops 
      FOR UPDATE 
      USING (auth.uid() = owner_id);

      CREATE POLICY "Users can delete their own shops" 
      ON marketplace_shops 
      FOR DELETE 
      USING (auth.uid() = owner_id);
    `;

    // Create marketplace_products table
    const createProductsTable = `
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

      CREATE INDEX IF NOT EXISTS marketplace_products_shop_id_idx ON marketplace_products(shop_id);
      CREATE INDEX IF NOT EXISTS marketplace_products_category_id_idx ON marketplace_products(category_id);
      CREATE INDEX IF NOT EXISTS marketplace_products_status_idx ON marketplace_products(status);
      CREATE INDEX IF NOT EXISTS marketplace_products_featured_idx ON marketplace_products(featured);

      ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;

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

      CREATE POLICY "Anyone can view active products" 
      ON marketplace_products 
      FOR SELECT 
      USING (status = 'active');

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
    `;

    // Create marketplace_categories table
    const createCategoriesTable = `
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

      CREATE INDEX IF NOT EXISTS marketplace_categories_parent_id_idx ON marketplace_categories(parent_id);

      ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Anyone can view categories" 
      ON marketplace_categories 
      FOR SELECT 
      TO authenticated, anon
      USING (true);

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
    `;

    // Create helper functions
    const createHelperFunctions = `
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

      CREATE OR REPLACE FUNCTION create_marketplace_shops_table()
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE '
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
            status TEXT NOT NULL DEFAULT ''active'' CHECK (status IN (''active'', ''inactive'', ''pending'')),
            rating NUMERIC,
            total_products INTEGER DEFAULT 0
          );

          CREATE INDEX IF NOT EXISTS marketplace_shops_owner_id_idx ON marketplace_shops(owner_id);
          CREATE INDEX IF NOT EXISTS marketplace_shops_agency_id_idx ON marketplace_shops(agency_id);
          CREATE INDEX IF NOT EXISTS marketplace_shops_status_idx ON marketplace_shops(status);

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
      END;
      $$;
    `;

    // Execute the SQL statements
    await supabaseClient.rpc("exec_sql", { sql: createHelperFunctions });
    await supabaseClient.rpc("exec_sql", { sql: createShopsTable });
    await supabaseClient.rpc("exec_sql", { sql: createProductsTable });
    await supabaseClient.rpc("exec_sql", { sql: createCategoriesTable });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Marketplace tables created successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
