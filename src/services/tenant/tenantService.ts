import { supabase } from "@/lib/supabase";
import { transformSnakeToCamel } from "@/lib/supabase";

// Fonction pour créer un nouveau locataire
export const createTenant = async (tenantData: any, agencyId: string) => {
  try {
    // S'assurer que le locataire est bien associé à l'agence
    const data = {
      ...tenantData,
      agency_id: agencyId
    };
    
    // Insert dans la table tenants
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return { tenant, error: null };
  } catch (error: any) {
    console.error("Error creating tenant:", error);
    return { tenant: null, error: error.message };
  }
};

// Fonction pour récupérer tous les locataires d'une agence spécifique
export const getTenantsByAgencyId = async (agencyId: string) => {
  try {
    // Avec les politiques RLS, cette requête ne renverra que les locataires de l'agence connectée
    // Nous gardons néanmoins le filtre par agencyId pour plus de sécurité
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        employment_status,
        profession,
        photo_url,
        emergency_contact,
        agency_id
      `)
      .eq('agency_id', agencyId);

    if (error) throw error;

    // Transformer les données en format camelCase pour le frontend
    const transformedTenants = data ? data.map(tenant => ({
      id: tenant.id,
      firstName: tenant.first_name,
      lastName: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone,
      employmentStatus: tenant.employment_status,
      profession: tenant.profession,
      photoUrl: tenant.photo_url,
      emergencyContact: tenant.emergency_contact,
      agencyId: tenant.agency_id,
      // Vérifier si le locataire a un bail actif sera fait séparément
      hasLease: false
    })) : [];

    return { tenants: transformedTenants, error: null };
  } catch (error: any) {
    console.error("Error fetching tenants by agency ID:", error);
    return { tenants: [], error: error.message };
  }
};

// Fonction pour récupérer les locataires d'une propriété spécifique
export const getTenantsByPropertyId = async (propertyId: string) => {
  try {
    // D'abord, obtenez les baux actifs pour cette propriété
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select(`
        id,
        tenant_id,
        status,
        tenants:tenant_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          employment_status,
          profession,
          photo_url,
          emergency_contact,
          agency_id
        )
      `)
      .eq('property_id', propertyId);

    if (leasesError) throw leasesError;

    // Extraire les locataires des baux et ajouter les informations sur les baux
    const tenantsWithLeases = leases ? leases.map(lease => {
      // Vérifiez que lease.tenants existe avant d'y accéder
      if (!lease.tenants) {
        console.warn('Lease without tenant data found:', lease.id);
        return null;
      }
      
      return {
        id: lease.tenants.id,
        firstName: lease.tenants.first_name,
        lastName: lease.tenants.last_name,
        email: lease.tenants.email,
        phone: lease.tenants.phone,
        employmentStatus: lease.tenants.employment_status,
        profession: lease.tenants.profession,
        photoUrl: lease.tenants.photo_url,
        emergencyContact: lease.tenants.emergency_contact,
        agencyId: lease.tenants.agency_id,
        hasLease: true,
        leaseId: lease.id,
        leaseStatus: lease.status
      };
    }).filter(tenant => tenant !== null) : [];

    return { tenants: tenantsWithLeases, error: null };
  } catch (error: any) {
    console.error("Error fetching tenants by property ID:", error);
    return { tenants: [], error: error.message };
  }
};

// Fonction pour récupérer un locataire par son ID
export const getTenantById = async (tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        employment_status,
        profession,
        photo_url,
        emergency_contact,
        agency_id
      `)
      .eq('id', tenantId)
      .single();

    if (error) throw error;

    const tenant = data ? {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      employmentStatus: data.employment_status,
      profession: data.profession,
      photoUrl: data.photo_url,
      emergencyContact: data.emergency_contact,
      agencyId: data.agency_id
    } : null;

    return { tenant, error: null };
  } catch (error: any) {
    console.error("Error fetching tenant by ID:", error);
    return { tenant: null, error: error.message };
  }
};

// Fonction pour récupérer un locataire par son ID utilisateur
export const getTenantByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select()
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return { tenant: data, error: null };
  } catch (error: any) {
    console.error("Error fetching tenant by user ID:", error);
    return { tenant: null, error: error.message };
  }
};

// Fonction pour mettre à jour un locataire
export const updateTenant = async (tenantId: string, tenantData: any) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .update(tenantData)
      .eq('id', tenantId)
      .select();

    if (error) throw error;

    return { tenant: data ? data[0] : null, error: null };
  } catch (error: any) {
    console.error("Error updating tenant:", error);
    return { tenant: null, error: error.message };
  }
};

// Fonction pour supprimer un locataire
export const deleteTenant = async (tenantId: string) => {
  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting tenant:", error);
    return { success: false, error: error.message };
  }
};
