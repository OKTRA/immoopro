import { supabase } from "@/lib/supabase";
import { Order, OrderItem } from "../types";

export const createOrder = async (orderData: Partial<Order>) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_orders")
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;

    return { order: data as Order, error: null };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { order: null, error: error.message };
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_orders")
      .select("*, marketplace_order_items(*)")
      .eq("id", orderId)
      .single();

    if (error) throw error;

    // Transform to match our interface
    const order = {
      ...data,
      items: data.marketplace_order_items as OrderItem[],
    };

    return { order };
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return { order: null, error: error.message };
  }
};

export const getUserOrders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { orders: data as Order[] };
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return { orders: [], error: error.message };
  }
};

export const getShopOrders = async (shopId: string) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_orders")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { orders: data as Order[] };
  } catch (error: any) {
    console.error("Error fetching shop orders:", error);
    return { orders: [], error: error.message };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    return { order: data as Order, error: null };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { order: null, error: error.message };
  }
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: Order["payment_status"],
) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_orders")
      .update({ payment_status: paymentStatus })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    return { order: data as Order, error: null };
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    return { order: null, error: error.message };
  }
};
