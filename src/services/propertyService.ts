
import { supabase, handleSupabaseError, isSupabaseConnected, getMockData } from '@/lib/supabase';
import { Property, PropertyOwner } from '@/assets/types';

/**
 * Get featured properties
 */
export const getFeaturedProperties = async (limit = 6) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      return { properties: getMockData('properties', limit), error: null };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error('Error getting featured properties:', error);
    return { properties: getMockData('properties', limit), error: error.message };
  }
};

/**
 * Get popular properties
 */
export const getPopularProperties = async (limit = 4) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      return { properties: getMockData('properties', limit), error: null };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error('Error getting popular properties:', error);
    return { properties: getMockData('properties', limit), error: error.message };
  }
};

/**
 * Get a property by ID
 */
export const getPropertyById = async (id: string) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      const mockProperties = getMockData('properties', 10);
      const property = mockProperties.find((p: any) => p.id === id) || mockProperties[0];
      return { property, error: null };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *, 
        agencies:agency_id (
          id, 
          name, 
          logo_url, 
          location
        ),
        property_owners:owner_id (
          id, 
          user_id,
          company_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { property: data, error: null };
  } catch (error: any) {
    console.error(`Error getting property with ID ${id}:`, error);
    // Return mock data on error as fallback
    const mockProperties = getMockData('properties', 10);
    const property = mockProperties.find((p: any) => p.id === id) || mockProperties[0];
    return { property, error: error.message };
  }
};

/**
 * Get properties by agency ID
 */
export const getPropertiesByAgencyId = async (agencyId: string) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      return { properties: getMockData('properties', 8), error: null };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agency_id', agencyId);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error(`Error getting properties for agency ${agencyId}:`, error);
    return { properties: getMockData('properties', 8), error: error.message };
  }
};

/**
 * Create a new property
 */
export const createProperty = async (propertyData: Omit<Property, 'id'>) => {
  try {
    // Convert camelCase to snake_case for Supabase
    const snakeCaseData = {
      title: propertyData.title,
      type: propertyData.type,
      price: propertyData.price,
      location: propertyData.location,
      area: propertyData.area,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      features: propertyData.features,
      image_url: propertyData.imageUrl,
      status: propertyData.status,
      description: propertyData.description,
      agency_id: propertyData.agencyId,
      owner_id: propertyData.ownerId,
      agency_fees: propertyData.agencyFees,
      kitchens: propertyData.kitchens,
      shops: propertyData.shops,
      living_rooms: propertyData.livingRooms,
      virtual_tour_url: propertyData.virtualTourUrl,
      property_category: propertyData.propertyCategory,
      commission_rate: propertyData.commissionRate,
      payment_frequency: propertyData.paymentFrequency,
      security_deposit: propertyData.securityDeposit,
    };

    console.log('Creating property with data:', snakeCaseData);

    const { data, error } = await supabase
      .from('properties')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting property:', error);
      throw error;
    }
    
    // Convert the response back to camelCase
    const property: Property = {
      id: data.id,
      title: data.title,
      type: data.type,
      price: data.price,
      location: data.location,
      area: data.area,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      features: data.features || [],
      imageUrl: data.image_url,
      status: data.status,
      description: data.description,
      agencyId: data.agency_id,
      ownerId: data.owner_id,
      agencyFees: data.agency_fees,
      kitchens: data.kitchens,
      shops: data.shops,
      livingRooms: data.living_rooms,
      virtualTourUrl: data.virtual_tour_url,
      propertyCategory: data.property_category,
      commissionRate: data.commission_rate,
      paymentFrequency: data.payment_frequency,
      securityDeposit: data.security_deposit,
    };
    
    return { property, error: null };
  } catch (error: any) {
    console.error('Error creating property:', error);
    return { property: null, error: error.message };
  }
};

/**
 * Update a property
 */
export const updateProperty = async (id: string, propertyData: Partial<Property>) => {
  try {
    // Convert camelCase to snake_case for Supabase
    const updateData: any = {};
    if (propertyData.title !== undefined) updateData.title = propertyData.title;
    if (propertyData.type !== undefined) updateData.type = propertyData.type;
    if (propertyData.price !== undefined) updateData.price = propertyData.price;
    if (propertyData.location !== undefined) updateData.location = propertyData.location;
    if (propertyData.area !== undefined) updateData.area = propertyData.area;
    if (propertyData.bedrooms !== undefined) updateData.bedrooms = propertyData.bedrooms;
    if (propertyData.bathrooms !== undefined) updateData.bathrooms = propertyData.bathrooms;
    if (propertyData.features !== undefined) updateData.features = propertyData.features;
    if (propertyData.imageUrl !== undefined) updateData.image_url = propertyData.imageUrl;
    if (propertyData.status !== undefined) updateData.status = propertyData.status;
    if (propertyData.description !== undefined) updateData.description = propertyData.description;
    if (propertyData.agencyId !== undefined) updateData.agency_id = propertyData.agencyId;
    if (propertyData.ownerId !== undefined) updateData.owner_id = propertyData.ownerId;
    if (propertyData.agencyFees !== undefined) updateData.agency_fees = propertyData.agencyFees;
    if (propertyData.kitchens !== undefined) updateData.kitchens = propertyData.kitchens;
    if (propertyData.shops !== undefined) updateData.shops = propertyData.shops;
    if (propertyData.livingRooms !== undefined) updateData.living_rooms = propertyData.livingRooms;
    if (propertyData.virtualTourUrl !== undefined) updateData.virtual_tour_url = propertyData.virtualTourUrl;
    if (propertyData.propertyCategory !== undefined) updateData.property_category = propertyData.propertyCategory;
    if (propertyData.commissionRate !== undefined) updateData.commission_rate = propertyData.commissionRate;
    if (propertyData.paymentFrequency !== undefined) updateData.payment_frequency = propertyData.paymentFrequency;
    if (propertyData.securityDeposit !== undefined) updateData.security_deposit = propertyData.securityDeposit;

    console.log('Updating property with ID', id, 'and data:', updateData);

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }
    
    return { property: data, error: null };
  } catch (error: any) {
    console.error(`Error updating property with ID ${id}:`, error);
    return { property: null, error: error.message };
  }
};

/**
 * Delete a property
 */
export const deleteProperty = async (id: string) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting property with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get property lease information
 */
export const getPropertyLeaseInfo = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          id, 
          first_name, 
          last_name, 
          email, 
          phone
        )
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no lease is found, return null without throwing an error
      if (error.code === 'PGRST116') {
        return { lease: null, error: null };
      }
      throw error;
    }
    
    return { lease: data, error: null };
  } catch (error: any) {
    console.error(`Error getting lease for property ${propertyId}:`, error);
    return { lease: null, error: error.message };
  }
};

/**
 * Upload a property image
 */
export const uploadPropertyImage = async (propertyId: string, imageFile: File) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock URL if not connected
      return { imageUrl: URL.createObjectURL(imageFile), error: null };
    }
    
    // Create a unique filename
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
    const filePath = `properties/${fileName}`;
    
    // Check if storage bucket exists, create it if not
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'properties');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('properties', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
      }
    } catch (err) {
      console.warn('Error checking/creating bucket:', err);
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    return { imageUrl: data.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading property image:', error);
    return { imageUrl: null, error: error.message };
  }
};

/**
 * Get property owners
 */
export const getPropertyOwners = async () => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      const mockOwners: PropertyOwner[] = [
        { 
          id: 'mock-owner-1', 
          name: 'John Smith', 
          email: 'john.smith@example.com', 
          properties: 3,
          userId: 'user-1',
          companyName: null,
          taxId: 'TAX123456',
          paymentMethod: 'bank_transfer',
          paymentPercentage: 100
        },
        { 
          id: 'mock-owner-2', 
          name: 'Property Manager', 
          email: 'manager@abcproperties.com', 
          properties: 7,
          userId: 'user-2',
          companyName: 'ABC Properties',
          taxId: 'TAX789012',
          paymentMethod: 'check',
          paymentPercentage: 100
        },
        { 
          id: 'mock-owner-3', 
          name: 'Marie Dupont', 
          email: 'marie.dupont@example.com', 
          properties: 2,
          userId: 'user-3',
          companyName: null,
          taxId: 'TAX345678',
          paymentMethod: 'bank_transfer',
          paymentPercentage: 100
        },
      ];
      return { owners: mockOwners, error: null };
    }
    
    const { data, error } = await supabase
      .from('property_owners')
      .select(`
        id,
        user_id,
        company_name,
        tax_id,
        payment_method,
        payment_percentage,
        profiles(
          id,
          first_name,
          last_name,
          email
        )
      `);

    if (error) throw error;
    
    // Transform the data to a more usable format
    const owners: PropertyOwner[] = data.map(owner => {
      // Use type assertion to help TypeScript understand the structure
      const profile = owner.profiles as { id?: string; first_name?: string; last_name?: string; email?: string } || {};
      const firstName = profile.first_name || '';
      const lastName = profile.last_name || '';
      return {
        id: owner.id,
        userId: profile.id || owner.user_id,
        companyName: owner.company_name,
        name: firstName && lastName ? `${firstName} ${lastName}`.trim() : owner.company_name || 'Unknown Owner',
        email: profile.email || 'no-email@example.com',
        properties: 0, // Default value, would need another query to get actual count
        taxId: owner.tax_id,
        paymentMethod: owner.payment_method,
        paymentPercentage: owner.payment_percentage
      };
    });
    
    return { owners, error: null };
  } catch (error: any) {
    console.error('Error getting property owners:', error);
    return { owners: [], error: error.message };
  }
};
