export interface Shop {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  owner_id: string;
  agency_id?: string | null;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  status: "active" | "inactive" | "pending";
  rating?: number;
  total_products?: number;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  currency: string;
  images: string[];
  category_id: string;
  subcategory_id?: string;
  stock_quantity: number;
  status: "active" | "inactive" | "out_of_stock";
  featured: boolean;
  created_at: string;
  updated_at: string;
  specifications?: Record<string, string>;
  tags?: string[];
  rating?: number;
  total_reviews?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  currency: string;
}

export interface Order {
  id: string;
  user_id: string;
  shop_id: string;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed";
  created_at: string;
  updated_at: string;
  tracking_number?: string;
  notes?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Address {
  full_name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar?: string;
}
