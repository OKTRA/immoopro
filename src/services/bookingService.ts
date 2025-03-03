import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Booking } from '@/assets/types';

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
        properties:property_id (
          id,
          title,
          type,
          location,
          image_url,
          price
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query
      .order('start_date', { ascending: false });

    if (error) throw error;
    
    const bookings: Booking[] = data.map(item => ({
      id: item.id,
      propertyId: item.property_id,
      userId: item.user_id,
      date: item.start_date,
      time: item.booking_time || '12:00',
      startDate: item.start_date,
      endDate: item.end_date,
      totalPrice: item.total_price,
      status: item.status,
      guests: item.guests,
      paymentStatus: item.payment_status,
      bookingReference: item.booking_reference,
    }));
    
    return { bookings, count, error: null };
  } catch (error: any) {
    console.error(`Error getting bookings for user ${userId}:`, error);
    return { bookings: [], count: 0, error: error.message };
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
        properties:property_id (
          id,
          title,
          type,
          location,
          image_url,
          price,
          bedrooms,
          bathrooms,
          amenities
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    const booking: Booking = {
      id: data.id,
      propertyId: data.property_id,
      userId: data.user_id,
      date: data.start_date,
      time: data.booking_time || '12:00',
      startDate: data.start_date,
      endDate: data.end_date,
      totalPrice: data.total_price,
      status: data.status,
      guests: data.guests,
      paymentStatus: data.payment_status,
      bookingReference: data.booking_reference,
    };
    
    return { booking, property: data.properties, error: null };
  } catch (error: any) {
    console.error(`Error getting booking with ID ${id}:`, error);
    return { booking: null, property: null, error: error.message };
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'bookingReference'>) => {
  try {
    // Generate a random booking reference
    const bookingReference = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        property_id: bookingData.propertyId,
        user_id: bookingData.userId,
        start_date: bookingData.startDate || bookingData.date,
        end_date: bookingData.endDate,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        total_price: bookingData.totalPrice,
        status: bookingData.status || 'pending',
        guests: bookingData.guests,
        payment_status: bookingData.paymentStatus || 'pending',
        booking_reference: bookingReference
      }])
      .select()
      .single();

    if (error) throw error;
    
    const booking: Booking = {
      id: data.id,
      propertyId: data.property_id,
      userId: data.user_id,
      date: data.booking_date || data.start_date,
      time: data.booking_time || '12:00',
      startDate: data.start_date,
      endDate: data.end_date,
      totalPrice: data.total_price,
      status: data.status,
      guests: data.guests,
      paymentStatus: data.payment_status,
      bookingReference: data.booking_reference,
    };
    
    return { booking, error: null };
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return { booking: null, error: error.message };
  }
};

/**
 * Update a booking status
 */
export const updateBookingStatus = async (
  id: string, 
  status: string,
  paymentStatus?: string
) => {
  try {
    const updateData: any = { status };
    if (paymentStatus) updateData.payment_status = paymentStatus;
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    const booking: Booking = {
      id: data.id,
      propertyId: data.property_id,
      userId: data.user_id,
      date: data.booking_date || data.start_date,
      time: data.booking_time || '12:00',
      startDate: data.start_date,
      endDate: data.end_date,
      totalPrice: data.total_price,
      status: data.status,
      guests: data.guests,
      paymentStatus: data.payment_status,
      bookingReference: data.booking_reference,
    };
    
    return { booking, error: null };
  } catch (error: any) {
    console.error(`Error updating booking status for ID ${id}:`, error);
    return { booking: null, error: error.message };
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (id: string, userId: string) => {
  try {
    // Verify that the booking belongs to the user
    const { data: bookingData, error: fetchError } = await supabase
      .from('bookings')
      .select('user_id, status')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (bookingData.user_id !== userId) {
      throw new Error('You are not authorized to cancel this booking');
    }
    
    if (bookingData.status === 'cancelled') {
      throw new Error('This booking is already cancelled');
    }
    
    // Update the booking status to cancelled
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error cancelling booking with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Check property availability for a given date range
 */
export const checkPropertyAvailability = async (
  propertyId: string,
  startDate: string,
  endDate: string
) => {
  try {
    // Check for any overlapping bookings
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

    if (error) throw error;
    
    // If there are no overlapping bookings, the property is available
    const isAvailable = data.length === 0;
    
    return { isAvailable, error: null };
  } catch (error: any) {
    console.error(`Error checking availability for property ${propertyId}:`, error);
    return { isAvailable: false, error: error.message };
  }
};

/**
 * Get all bookings for a property (for owner/admin view)
 */
export const getPropertyBookings = async (
  propertyId: string,
  status?: string,
  limit = 10,
  offset = 0
) => {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email,
          phone
        )
      `, { count: 'exact' })
      .eq('property_id', propertyId)
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query
      .order('start_date', { ascending: false });

    if (error) throw error;
    
    // Transform the data to include required properties from the Booking interface
    const bookings = data.map(item => ({
      id: item.id,
      propertyId: item.property_id,
      userId: item.user_id,
      date: item.booking_date || item.start_date,
      time: item.booking_time || '12:00',
      startDate: item.start_date,
      endDate: item.end_date,
      totalPrice: item.total_price,
      status: item.status,
      guests: item.guests,
      paymentStatus: item.payment_status,
      bookingReference: item.booking_reference,
      profiles: item.profiles
    }));
    
    return { bookings, count, error: null };
  } catch (error: any) {
    console.error(`Error getting bookings for property ${propertyId}:`, error);
    return { bookings: [], count: 0, error: error.message };
  }
};
