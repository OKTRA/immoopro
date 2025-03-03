import { supabase, handleSupabaseError } from '@/lib/supabase';
import { PropertyOwner, OwnerPropertyDetail, OwnerDashboardStats } from '@/assets/types';

/**
 * Get property owner by user ID
 */
export const getOwnerByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('property_owners')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    const owner: PropertyOwner = {
      id: data.id,
      name: data.name || 'Unknown Owner', // Add required properties
      email: data.email || 'unknown@example.com',
      properties: data.properties_count || 0,
      userId: data.user_id,
      companyName: data.company_name,
      taxId: data.tax_id,
      paymentMethod: data.payment_method,
      paymentPercentage: data.payment_percentage
    };
    
    return { owner, error: null };
  } catch (error: any) {
    console.error(`Error getting owner with user ID ${userId}:`, error);
    return { owner: null, error: error.message };
  }
};

/**
 * Create a new property owner
 */
export const createPropertyOwner = async (ownerData: Omit<PropertyOwner, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('property_owners')
      .insert([{
        user_id: ownerData.userId,
        name: ownerData.name,
        email: ownerData.email,
        properties_count: ownerData.properties,
        company_name: ownerData.companyName,
        tax_id: ownerData.taxId,
        payment_method: ownerData.paymentMethod,
        payment_percentage: ownerData.paymentPercentage
      }])
      .select()
      .single();

    if (error) throw error;
    
    const owner: PropertyOwner = {
      id: data.id,
      name: data.name || 'Unknown Owner',
      email: data.email || 'unknown@example.com',
      properties: data.properties_count || 0,
      userId: data.user_id,
      companyName: data.company_name,
      taxId: data.tax_id,
      paymentMethod: ownerData.paymentMethod,
      paymentPercentage: ownerData.paymentPercentage
    };
    
    return { owner, error: null };
  } catch (error: any) {
    console.error('Error creating property owner:', error);
    return { owner: null, error: error.message };
  }
};

/**
 * Update a property owner
 */
export const updatePropertyOwner = async (id: string, ownerData: Partial<PropertyOwner>) => {
  try {
    const updateData: any = {};
    if (ownerData.name !== undefined) updateData.name = ownerData.name;
    if (ownerData.email !== undefined) updateData.email = ownerData.email;
    if (ownerData.properties !== undefined) updateData.properties_count = ownerData.properties;
    if (ownerData.companyName !== undefined) updateData.company_name = ownerData.companyName;
    if (ownerData.taxId !== undefined) updateData.tax_id = ownerData.taxId;
    if (ownerData.paymentMethod) updateData.payment_method = ownerData.paymentMethod;
    if (ownerData.paymentPercentage !== undefined) updateData.payment_percentage = ownerData.paymentPercentage;

    const { data, error } = await supabase
      .from('property_owners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    const owner: PropertyOwner = {
      id: data.id,
      name: data.name || 'Unknown Owner',
      email: data.email || 'unknown@example.com',
      properties: data.properties_count || 0,
      userId: data.user_id,
      companyName: data.company_name,
      taxId: data.tax_id,
      paymentMethod: data.payment_method,
      paymentPercentage: data.payment_percentage
    };
    
    return { owner, error: null };
  } catch (error: any) {
    console.error(`Error updating property owner with ID ${id}:`, error);
    return { owner: null, error: error.message };
  }
};

/**
 * Get property details owned by an owner
 */
export const getOwnerProperties = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from('owner_properties_details')
      .select(`
        *,
        properties:property_id (
          id,
          title,
          type,
          location,
          area,
          bedrooms,
          bathrooms,
          price,
          image_url
        )
      `)
      .eq('owner_id', ownerId)
      .eq('active', true);

    if (error) throw error;
    
    const ownerProperties: OwnerPropertyDetail[] = data.map(item => ({
      id: item.id,
      title: item.properties?.title || 'Unnamed Property',
      status: item.status || 'unknown',
      income: item.income || 0,
      ownerId: item.owner_id,
      propertyId: item.property_id,
      purchaseDate: item.purchase_date,
      purchasePrice: item.purchase_price,
      currentValue: item.current_value,
      ownershipPercentage: item.ownership_percentage,
      active: item.active
    }));
    
    return { properties: ownerProperties, error: null };
  } catch (error: any) {
    console.error(`Error getting properties for owner ${ownerId}:`, error);
    return { properties: [], error: error.message };
  }
};

/**
 * Add a property to an owner
 */
export const addPropertyToOwner = async (propertyDetail: Omit<OwnerPropertyDetail, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('owner_properties_details')
      .insert([{
        owner_id: propertyDetail.ownerId,
        property_id: propertyDetail.propertyId,
        title: propertyDetail.title,
        status: propertyDetail.status,
        income: propertyDetail.income,
        purchase_date: propertyDetail.purchaseDate,
        purchase_price: propertyDetail.purchasePrice,
        current_value: propertyDetail.currentValue,
        ownership_percentage: propertyDetail.ownershipPercentage,
        active: propertyDetail.active
      }])
      .select()
      .single();

    if (error) throw error;
    
    const ownerProperty: OwnerPropertyDetail = {
      id: data.id,
      title: data.title || 'Unnamed Property',
      status: data.status || 'unknown',
      income: data.income || 0,
      ownerId: data.owner_id,
      propertyId: data.property_id,
      purchaseDate: data.purchase_date,
      purchasePrice: data.purchase_price,
      currentValue: data.current_value,
      ownershipPercentage: data.ownership_percentage,
      active: data.active
    };
    
    return { property: ownerProperty, error: null };
  } catch (error: any) {
    console.error('Error adding property to owner:', error);
    return { property: null, error: error.message };
  }
};

/**
 * Get owner dashboard statistics
 */
export const getOwnerDashboardStats = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from('owner_dashboard_stats')
      .select('*')
      .eq('owner_id', ownerId)
      .single();

    if (error) throw error;
    
    const stats: OwnerDashboardStats = {
      ownerId: data.owner_id,
      totalProperties: data.total_properties,
      occupiedUnits: data.occupied_units || 0,
      vacantUnits: data.vacant_units || 0,
      totalIncome: data.total_income || 0,
      occupancyRate: data.occupancy_rate,
      monthlyRevenue: data.monthly_revenue,
      pendingMaintenance: data.pending_maintenance,
      overduePayments: data.overdue_payments
    };
    
    return { stats, error: null };
  } catch (error: any) {
    console.error(`Error getting dashboard stats for owner ${ownerId}:`, error);
    return { stats: null, error: error.message };
  }
};

/**
 * Get owner revenue reports
 */
export const getOwnerRevenueReports = async (
  ownerId: string,
  startMonth: string,
  startYear: number,
  endMonth: string,
  endYear: number
) => {
  try {
    const { data, error } = await supabase
      .from('owner_property_revenues')
      .select('*')
      .eq('owner_id', ownerId)
      .or(`and(year.gte.${startYear},year.lte.${endYear})`)
      .order('year', { ascending: true })
      .order('month', { ascending: true });

    if (error) throw error;
    
    return { revenues: data, error: null };
  } catch (error: any) {
    console.error(`Error getting revenue reports for owner ${ownerId}:`, error);
    return { revenues: [], error: error.message };
  }
};

/**
 * Get owner expenses
 */
export const getOwnerExpenses = async (
  ownerId: string,
  year: number,
  month?: string
) => {
  try {
    let query = supabase
      .from('owner_expenses_view')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('year', year);
    
    if (month) {
      query = query.eq('month', month);
    }
    
    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    
    return { expenses: data, error: null };
  } catch (error: any) {
    console.error(`Error getting expenses for owner ${ownerId}:`, error);
    return { expenses: [], error: error.message };
  }
};
