import { supabase, handleSupabaseError, getMockData } from '@/lib/supabase';
import { Property, PropertyOwner } from '@/assets/types';

/**
 * Get all properties with filters
 */
export const getAllProperties = async (
  filters?: {
    type?: string[];
    propertyCategory?: string[];
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    location?: string;
    status?: string;
    ownerId?: string;
    agencyId?: string;
    paymentFrequency?: string;
  },
  limit = 10,
  offset = 0,
  sortBy = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }
      
      if (filters.propertyCategory && filters.propertyCategory.length > 0) {
        query = query.in('property_category', filters.propertyCategory);
      }
      
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      
      if (filters.minBedrooms !== undefined) {
        query = query.gte('bedrooms', filters.minBedrooms);
      }
      
      if (filters.maxBedrooms !== undefined) {
        query = query.lte('bedrooms', filters.maxBedrooms);
      }
      
      if (filters.minBathrooms !== undefined) {
        query = query.gte('bathrooms', filters.minBathrooms);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.ownerId) {
        query = query.eq('owner_id', filters.ownerId);
      }
      
      if (filters.agencyId) {
        query = query.eq('agency_id', filters.agencyId);
      }
      
      if (filters.paymentFrequency) {
        query = query.eq('payment_frequency', filters.paymentFrequency);
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;
    
    // Transform data to match our frontend model
    const transformedData = data?.map(property => ({
      id: property.id,
      title: property.title,
      type: property.type as 'apartment' | 'house' | 'office' | 'land',
      price: property.price,
      location: property.location || property.address,
      area: property.area || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      features: property.features || [],
      imageUrl: property.image_url || 'https://placehold.co/600x400?text=No+Image',
      description: property.description || '',
      status: property.status || 'available',
      propertyCategory: property.property_category,
      paymentFrequency: property.payment_frequency,
      securityDeposit: property.security_deposit,
      agencyFees: property.agency_fees,
      commissionRate: property.commission_rate,
      ownerId: property.owner_id,
      agencyId: property.agency_id,
      yearBuilt: property.year_built,
      furnished: property.furnished,
      petsAllowed: property.pets_allowed,
      latitude: property.latitude,
      longitude: property.longitude,
      virtualTourUrl: property.virtual_tour_url,
    } as Property));
    
    return { properties: transformedData, count, error: null };
  } catch (error: any) {
    console.error('Error getting properties:', error);
    // Fall back to mock data
    const mockData = getMockData('properties', limit);
    return { properties: mockData, count: mockData.length, error: error.message };
  }
};

/**
 * Get a single property by ID
 */
export const getPropertyById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { property: data, error: null };
  } catch (error: any) {
    console.error(`Error getting property with ID ${id}:`, error);
    return { property: null, error: error.message };
  }
};

/**
 * Create a new property
 */
export const createProperty = async (propertyData: Omit<Property, 'id'>) => {
  try {
    // Get current user ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    // If owner ID is not provided, check if user is an owner
    let ownerId = propertyData.ownerId;
    if (!ownerId) {
      const { data: ownerData } = await supabase
        .from('property_owners')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (ownerData) {
        ownerId = ownerData.id;
      }
    }

    // If agency ID is not provided, check if user has an agency
    let agencyId = propertyData.agencyId;
    if (!agencyId) {
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (agencyData) {
        agencyId = agencyData.id;
      }
    }

    const { data, error } = await supabase
      .from('properties')
      .insert([{
        title: propertyData.title,
        type: propertyData.type,
        price: propertyData.price,
        location: propertyData.location,
        area: propertyData.area,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        kitchens: propertyData.kitchens,
        shops: propertyData.shops,
        features: propertyData.features || [],
        image_url: propertyData.imageUrl,
        description: propertyData.description || '',
        status: propertyData.status || 'available',
        property_category: propertyData.propertyCategory,
        payment_frequency: propertyData.paymentFrequency,
        security_deposit: propertyData.securityDeposit,
        agency_fees: propertyData.agencyFees,
        commission_rate: propertyData.commissionRate,
        owner_id: ownerId,
        agency_id: agencyId,
        year_built: propertyData.yearBuilt,
        furnished: propertyData.furnished,
        pets_allowed: propertyData.petsAllowed,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        virtual_tour_url: propertyData.virtualTourUrl,
        created_by: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return { property: data, error: null };
  } catch (error: any) {
    console.error('Error creating property:', error);
    return { property: null, error: error.message };
  }
};

/**
 * Update an existing property
 */
export const updateProperty = async (id: string, propertyData: Partial<Property>) => {
  try {
    // Verify current user can update this property
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    // Convert from camelCase to snake_case for database
    const updateData: any = {};
    if (propertyData.title) updateData.title = propertyData.title;
    if (propertyData.type) updateData.type = propertyData.type;
    if (propertyData.price !== undefined) updateData.price = propertyData.price;
    if (propertyData.location) updateData.location = propertyData.location;
    if (propertyData.area !== undefined) updateData.area = propertyData.area;
    if (propertyData.bedrooms !== undefined) updateData.bedrooms = propertyData.bedrooms;
    if (propertyData.bathrooms !== undefined) updateData.bathrooms = propertyData.bathrooms;
    if (propertyData.features) updateData.features = propertyData.features;
    if (propertyData.imageUrl) updateData.image_url = propertyData.imageUrl;
    if (propertyData.description) updateData.description = propertyData.description;
    if (propertyData.status) updateData.status = propertyData.status;
    if (propertyData.propertyCategory) updateData.property_category = propertyData.propertyCategory;
    if (propertyData.paymentFrequency) updateData.payment_frequency = propertyData.paymentFrequency;
    if (propertyData.securityDeposit !== undefined) updateData.security_deposit = propertyData.securityDeposit;
    if (propertyData.agencyFees !== undefined) updateData.agency_fees = propertyData.agencyFees;
    if (propertyData.commissionRate !== undefined) updateData.commission_rate = propertyData.commissionRate;
    if (propertyData.ownerId) updateData.owner_id = propertyData.ownerId;
    if (propertyData.agencyId) updateData.agency_id = propertyData.agencyId;
    if (propertyData.yearBuilt !== undefined) updateData.year_built = propertyData.yearBuilt;
    if (propertyData.furnished !== undefined) updateData.furnished = propertyData.furnished;
    if (propertyData.petsAllowed !== undefined) updateData.pets_allowed = propertyData.petsAllowed;
    if (propertyData.latitude !== undefined) updateData.latitude = propertyData.latitude;
    if (propertyData.longitude !== undefined) updateData.longitude = propertyData.longitude;
    if (propertyData.virtualTourUrl) updateData.virtual_tour_url = propertyData.virtualTourUrl;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Transform data back to our frontend model
    const property: Property = {
      id: data.id,
      title: data.title,
      type: data.type,
      price: data.price,
      location: data.location,
      area: data.area,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      features: data.features,
      imageUrl: data.image_url,
      description: data.description,
      status: data.status,
      propertyCategory: data.property_category,
      paymentFrequency: data.payment_frequency,
      securityDeposit: data.security_deposit,
      agencyFees: data.agency_fees,
      commissionRate: data.commission_rate,
      ownerId: data.owner_id,
      agencyId: data.agency_id,
      yearBuilt: data.year_built,
      furnished: data.furnished,
      petsAllowed: data.pets_allowed,
      latitude: data.latitude,
      longitude: data.longitude,
      virtualTourUrl: data.virtual_tour_url,
    };
    
    return { property, error: null };
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
 * Upload property image
 */
export const uploadPropertyImage = async (propertyId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `properties/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    return { imageUrl: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading property image:', error);
    return { imageUrl: null, error: error.message };
  }
};

/**
 * Get featured properties
 */
export const getFeaturedProperties = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Transform data to match our frontend model
    const transformedData = data?.map(property => ({
      id: property.id,
      title: property.title,
      type: property.type as 'apartment' | 'house' | 'office' | 'land',
      price: property.price,
      location: property.location || property.address,
      area: property.area || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      features: property.features || [],
      imageUrl: property.image_url || 'https://placehold.co/600x400?text=No+Image',
      description: property.description || '',
      status: property.status || 'available',
      propertyCategory: property.property_category,
      paymentFrequency: property.payment_frequency,
      securityDeposit: property.security_deposit,
      agencyFees: property.agency_fees,
      commissionRate: property.commission_rate,
      ownerId: property.owner_id,
      agencyId: property.agency_id,
      yearBuilt: property.year_built,
      furnished: property.furnished,
      petsAllowed: property.pets_allowed,
      latitude: property.latitude,
      longitude: property.longitude,
      virtualTourUrl: property.virtual_tour_url,
    } as Property));

    return { properties: transformedData, error: null };
  } catch (error: any) {
    console.error('Error getting featured properties:', error);
    // Fall back to mock data
    const mockData = getMockData('properties', limit);
    return { properties: mockData, error: error.message };
  }
};

/**
 * Search properties by keyword
 */
export const searchProperties = async (keyword: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`title.ilike.%${keyword}%,location.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .limit(limit);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error('Error searching properties:', error);
    return { properties: [], error: error.message };
  }
};

/**
 * Get properties by owner ID
 */
export const getPropertiesByOwnerId = async (
  ownerId: string,
  limit = 10,
  offset = 0
) => {
  try {
    const { data, error, count } = await supabase
      .from('properties')
      .select('*, agencies(name, logo_url)', { count: 'exact' })
      .eq('owner_id', ownerId)
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    // Transform data to include agency information
    const transformedData = data?.map(property => ({
      id: property.id,
      title: property.title,
      type: property.type,
      price: property.price,
      location: property.location,
      area: property.area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      features: property.features,
      imageUrl: property.image_url,
      description: property.description,
      status: property.status,
      propertyCategory: property.property_category,
      paymentFrequency: property.payment_frequency,
      securityDeposit: property.security_deposit,
      agencyFees: property.agency_fees,
      commissionRate: property.commission_rate,
      ownerId: property.owner_id,
      agencyId: property.agency_id,
      // Include agency info
      agencyName: property.agencies?.name,
      agencyLogo: property.agencies?.logo_url,
      yearBuilt: property.year_built,
      furnished: property.furnished,
      petsAllowed: property.pets_allowed,
      latitude: property.latitude,
      longitude: property.longitude,
      virtualTourUrl: property.virtual_tour_url,
    }));
    
    return { properties: transformedData, count, error: null };
  } catch (error: any) {
    console.error(`Error getting properties for owner ${ownerId}:`, error);
    return { properties: [], count: 0, error: error.message };
  }
};

/**
 * Get owners for unified dashboard
 */
export const getPropertyOwners = async (userId?: string) => {
  try {
    let query = supabase
      .from('property_owners')
      .select(`
        *,
        profiles(first_name, last_name, email, phone),
        properties:properties(id, title, status, price)
      `);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    const owners = data.map(owner => {
      const ownerProperties = owner.properties || [];
      
      return {
        id: owner.id,
        name: `${owner.profiles?.first_name || ''} ${owner.profiles?.last_name || ''}`.trim(),
        email: owner.profiles?.email || '',
        phone: owner.profiles?.phone || '',
        properties: ownerProperties.length,
        userId: owner.user_id,
        companyName: owner.company_name,
        taxId: owner.tax_id,
        paymentMethod: owner.payment_method,
        paymentPercentage: owner.payment_percentage,
        bankDetails: owner.bank_details,
      } as PropertyOwner;
    });
    
    return { owners, error: null };
  } catch (error: any) {
    console.error('Error getting property owners:', error);
    return { owners: [], error: error.message };
  }
};

/**
 * Create payment configuration for property types
 */
export const createPaymentConfiguration = async (configData: any) => {
  try {
    const { data, error } = await supabase
      .from('payment_configurations')
      .insert([{
        property_category: configData.propertyCategory,
        default_payment_frequency: configData.defaultPaymentFrequency,
        default_security_deposit_multiplier: configData.defaultSecurityDepositMultiplier,
        default_agency_fees_percentage: configData.defaultAgencyFeesPercentage,
        default_commission_rate: configData.defaultCommissionRate,
        proration_rules: configData.prorationRules || {},
      }])
      .select()
      .single();

    if (error) throw error;
    return { configuration: data, error: null };
  } catch (error: any) {
    console.error('Error creating payment configuration:', error);
    return { configuration: null, error: error.message };
  }
};

/**
 * Get payment configurations
 */
export const getPaymentConfigurations = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_configurations')
      .select('*');

    if (error) throw error;
    
    // Transform from snake_case to camelCase
    const transformedData = data.map(config => ({
      id: config.id,
      propertyCategory: config.property_category,
      defaultPaymentFrequency: config.default_payment_frequency,
      defaultSecurityDepositMultiplier: config.default_security_deposit_multiplier,
      defaultAgencyFeesPercentage: config.default_agency_fees_percentage,
      defaultCommissionRate: config.default_commission_rate,
      prorationRules: config.proration_rules,
    }));
    
    return { configurations: transformedData, error: null };
  } catch (error: any) {
    console.error('Error getting payment configurations:', error);
    return { configurations: [], error: error.message };
  }
};
