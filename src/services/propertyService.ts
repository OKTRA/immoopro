
import { supabase } from '@/lib/supabase';
import { Property, PropertyOwner } from '@/assets/types';

export const getProperties = async (agencyId?: string, limit?: number) => {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:property_owner_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `);
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const properties = data.map(item => {
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        location: item.location,
        area: item.area,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        price: item.price,
        status: item.status,
        imageUrl: item.image_url,
        virtualTourUrl: item.virtual_tour_url,
        features: item.features || [],
        petsAllowed: item.pets_allowed,
        furnished: item.furnished,
        yearBuilt: item.year_built,
        agencyFees: item.agency_fees,
        propertyCategory: item.property_category,
        paymentFrequency: item.payment_frequency,
        securityDeposit: item.security_deposit,
        agencyId: item.agency_id,
        owner: item.owner ? {
          ownerId: item.owner.id,
          firstName: item.owner.first_name,
          lastName: item.owner.last_name,
          email: item.owner.email,
          phone: item.owner.phone
        } : null
      };
    });
    
    return { properties, error: null };
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return { properties: [], error: error.message };
  }
};

// Function to get featured properties for homepage
export const getFeaturedProperties = async (limit: number = 6) => {
  return getProperties(undefined, limit);
};

// Function to get popular properties
export const getPopularProperties = async (limit: number = 6) => {
  return getProperties(undefined, limit);
};

export const getPropertyById = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:property_owner_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) throw error;
    
    const property = {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      location: data.location,
      area: data.area,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      price: data.price,
      status: data.status,
      imageUrl: data.image_url,
      virtualTourUrl: data.virtual_tour_url,
      features: data.features || [],
      petsAllowed: data.pets_allowed,
      furnished: data.furnished,
      yearBuilt: data.year_built,
      agencyFees: data.agency_fees,
      propertyCategory: data.property_category,
      paymentFrequency: data.payment_frequency,
      securityDeposit: data.security_deposit,
      agencyId: data.agency_id,
      owner: data.owner ? {
        ownerId: data.owner.id,
        firstName: data.owner.first_name,
        lastName: data.owner.last_name,
        email: data.owner.email,
        phone: data.owner.phone
      } : null
    };
    
    return { property, error: null };
  } catch (error: any) {
    console.error(`Error fetching property ${propertyId}:`, error);
    return { property: null, error: error.message };
  }
};

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

// Function to upload a property image
export const uploadPropertyImage = async (propertyId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
    const filePath = `properties/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    return { imageUrl: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading property image:', error);
    return { imageUrl: '', error: error.message };
  }
};

export const createProperty = async (propertyData: any) => {
  try {
    console.log('Creating property with data:', propertyData);
    
    // Handle owner data if provided
    let propertyOwnerId = null;
    if (propertyData.ownerInfo && propertyData.ownerInfo.ownerId) {
      propertyOwnerId = propertyData.ownerInfo.ownerId;
    }
    
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        title: propertyData.title,
        description: propertyData.description,
        type: propertyData.type,
        location: propertyData.location,
        area: propertyData.area,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        price: propertyData.price,
        status: propertyData.status,
        image_url: propertyData.imageUrl,
        virtual_tour_url: propertyData.virtualTourUrl,
        features: propertyData.features,
        pets_allowed: propertyData.petsAllowed,
        furnished: propertyData.furnished,
        year_built: propertyData.yearBuilt,
        agency_fees: propertyData.agencyFees,
        property_category: propertyData.propertyCategory,
        payment_frequency: propertyData.paymentFrequency,
        security_deposit: propertyData.securityDeposit,
        agency_id: propertyData.agencyId,
        property_owner_id: propertyOwnerId,
        living_rooms: propertyData.livingRooms,
        kitchens: propertyData.kitchens,
        shops: propertyData.shops
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating property:', error);
      throw error;
    }
    
    return { property: data, error: null };
  } catch (error: any) {
    console.error('Error creating property:', error);
    return { property: null, error: error.message };
  }
};

// Add the updateProperty function
export const updateProperty = async (propertyId: string, propertyData: any) => {
  try {
    console.log('Updating property with ID', propertyId, 'and data:', propertyData);
    
    // Convert camelCase to snake_case for database columns
    const updateData: any = {};
    
    if (propertyData.title !== undefined) updateData.title = propertyData.title;
    if (propertyData.description !== undefined) updateData.description = propertyData.description;
    if (propertyData.type !== undefined) updateData.type = propertyData.type;
    if (propertyData.location !== undefined) updateData.location = propertyData.location;
    if (propertyData.area !== undefined) updateData.area = propertyData.area;
    if (propertyData.bedrooms !== undefined) updateData.bedrooms = propertyData.bedrooms;
    if (propertyData.bathrooms !== undefined) updateData.bathrooms = propertyData.bathrooms;
    if (propertyData.price !== undefined) updateData.price = propertyData.price;
    if (propertyData.status !== undefined) updateData.status = propertyData.status;
    if (propertyData.imageUrl !== undefined) updateData.image_url = propertyData.imageUrl;
    if (propertyData.virtualTourUrl !== undefined) updateData.virtual_tour_url = propertyData.virtualTourUrl;
    if (propertyData.features !== undefined) updateData.features = propertyData.features;
    if (propertyData.petsAllowed !== undefined) updateData.pets_allowed = propertyData.petsAllowed;
    if (propertyData.furnished !== undefined) updateData.furnished = propertyData.furnished;
    if (propertyData.yearBuilt !== undefined) updateData.year_built = propertyData.yearBuilt;
    if (propertyData.agencyFees !== undefined) updateData.agency_fees = propertyData.agencyFees;
    if (propertyData.propertyCategory !== undefined) updateData.property_category = propertyData.propertyCategory;
    if (propertyData.paymentFrequency !== undefined) updateData.payment_frequency = propertyData.paymentFrequency;
    if (propertyData.securityDeposit !== undefined) updateData.security_deposit = propertyData.securityDeposit;
    if (propertyData.livingRooms !== undefined) updateData.living_rooms = propertyData.livingRooms;
    if (propertyData.kitchens !== undefined) updateData.kitchens = propertyData.kitchens;
    if (propertyData.shops !== undefined) updateData.shops = propertyData.shops;
    
    // Handle owner data if provided
    if (propertyData.ownerInfo && propertyData.ownerInfo.ownerId) {
      updateData.property_owner_id = propertyData.ownerInfo.ownerId;
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }
    
    return { property: data, error: null };
  } catch (error: any) {
    console.error(`Error updating property with ID ${propertyId}:`, error);
    return { property: null, error: error.message };
  }
};

export const deleteProperty = async (propertyId: string) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting property with ID ${propertyId}:`, error);
    return { success: false, error: error.message };
  }
};
