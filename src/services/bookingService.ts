
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Booking } from '@/assets/types';

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'bookingReference'>) => {
  try {
    // Generate a booking reference
    const bookingReference = `BK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10000)}`;
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ ...bookingData, bookingReference }])
      .select()
      .single();

    if (error) throw error;
    return { booking: data, error: null };
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return { booking: null, error: error.message };
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        properties:property_id (*),
        profiles:user_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { booking: data, error: null };
  } catch (error: any) {
    console.error(`Error getting booking with ID ${id}:`, error);
    return { booking: null, error: error.message };
  }
};

/**
 * Get bookings by user ID
 */
export const getBookingsByUserId = async (
  userId: string,
  status?: string,
  limit = 10,
  offset = 0
) => {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        properties:property_id (*)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;

    if (error) throw error;
    return { bookings: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting bookings for user ${userId}:`, error);
    return { bookings: [], count: 0, error: error.message };
  }
};

/**
 * Get bookings by property ID
 */
export const getBookingsByPropertyId = async (
  propertyId: string,
  startDate?: string,
  endDate?: string,
  status?: string,
  limit = 10,
  offset = 0
) => {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles:user_id (*)
      `, { count: 'exact' })
      .eq('property_id', propertyId)
      .order('start_date')
      .range(offset, offset + limit - 1);
    
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('end_date', endDate);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;

    if (error) throw error;
    return { bookings: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting bookings for property ${propertyId}:`, error);
    return { bookings: [], count: 0, error: error.message };
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  id: string,
  status: string,
  paymentStatus?: string
) => {
  try {
    const updateData: { status: string; payment_status?: string } = { status };
    
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { booking: data, error: null };
  } catch (error: any) {
    console.error(`Error updating booking status for ID ${id}:`, error);
    return { booking: null, error: error.message };
  }
};

/**
 * Check property availability
 */
export const checkPropertyAvailability = async (
  propertyId: string,
  startDate: string,
  endDate: string
) => {
  try {
    const { data, error, count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) throw error;
    
    // If count is 0, the property is available for the given dates
    return { available: count === 0, error: null };
  } catch (error: any) {
    console.error(`Error checking availability for property ${propertyId}:`, error);
    return { available: false, error: error.message };
  }
};

/**
 * Cancel booking
 */
export const cancelBooking = async (id: string, reason?: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        special_requests: reason ? `Cancelled: ${reason}` : 'Cancelled by user'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { booking: data, error: null };
  } catch (error: any) {
    console.error(`Error cancelling booking with ID ${id}:`, error);
    return { booking: null, error: error.message };
  }
};

/**
 * Get booking statistics for a property
 */
export const getPropertyBookingStats = async (propertyId: string) => {
  try {
    // Get total bookings
    const { count: totalBookings, error: totalError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId);
    
    if (totalError) throw totalError;
    
    // Get confirmed bookings
    const { count: confirmedBookings, error: confirmedError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId)
      .eq('status', 'confirmed');
    
    if (confirmedError) throw confirmedError;
    
    // Get cancelled bookings
    const { count: cancelledBookings, error: cancelledError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId)
      .eq('status', 'cancelled');
    
    if (cancelledError) throw cancelledError;
    
    // Get average booking value
    const { data: avgData, error: avgError } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('property_id', propertyId);
    
    if (avgError) throw avgError;
    
    const averageBookingValue = avgData.length > 0
      ? avgData.reduce((sum, booking) => sum + booking.total_price, 0) / avgData.length
      : 0;
    
    return {
      stats: {
        totalBookings: totalBookings || 0,
        confirmedBookings: confirmedBookings || 0,
        cancelledBookings: cancelledBookings || 0,
        averageBookingValue
      },
      error: null
    };
  } catch (error: any) {
    console.error(`Error getting booking stats for property ${propertyId}:`, error);
    return {
      stats: null,
      error: error.message
    };
  }
};
