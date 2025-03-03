
import { supabase } from '@/lib/supabase';
import { PropertyOwner } from '@/assets/types';

// Function to get property owners
export const getPropertyOwners = async () => {
  try {
    const { data, error } = await supabase
      .from('property_owners')
      .select('*');
    
    if (error) throw error;
    
    const owners = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'No Name',
      email: item.email || '',
      phone: item.phone || '',
      properties: 0, // Placeholder, would need a join to get actual count
      companyName: item.company_name,
      taxId: item.tax_id,
      paymentMethod: item.payment_method,
      paymentPercentage: item.payment_percentage
    }));
    
    return { owners, error: null };
  } catch (error: any) {
    console.error('Error fetching property owners:', error);
    return { owners: [], error: error.message };
  }
};
