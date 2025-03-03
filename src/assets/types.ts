export interface Agency {
  id: string;
  name: string;
  logoUrl: string;
  location: string;
  properties: number;
  rating: number;
  verified: boolean;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  specialties?: string[];
  serviceAreas?: string[];
}

// Updated Property interface with new fields
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  kitchens?: number;  // Nouveau champ pour le nombre de cuisines
  shops?: number;     // Nouveau champ pour le nombre de magasins
  livingRooms?: number; // Nouveau champ pour le nombre de salons
  area: number;
  type: string;
  status: string;
  imageUrl: string;
  features?: string[];
  description?: string;
  // Nouveaux champs pour la catégorisation intelligente des propriétés
  propertyCategory?: 'residence' | 'apartment' | 'commercial' | 'land' | 'other';
  paymentFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  securityDeposit?: number;
  agencyFees?: number;
  commissionRate?: number;
  ownerId?: string;
  agencyId?: string;
  // Champs existants
  yearBuilt?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  latitude?: number;
  longitude?: number;
  virtualTourUrl?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export enum UserType {
  BUYER = "BUYER",
  SELLER = "SELLER",
  AGENT = "AGENT",
  ADMIN = "ADMIN"
}

// Interface for user type objects used in FeatureSection
export interface UserTypeOption {
  type: string;
  label: string;
  path: string;
  description: string;
}

export interface AdminNotification {
  id: string;
  message: string;
  date: string;
  read: boolean;
  // Fields used in the service
  adminId?: string;
  createdAt?: string;
  isRead?: boolean;
  priority?: string;
}

export interface Apartment {
  id: string;
  name: string;
  address: string;
  units: number;
  available: number;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  date: string;
  time: string;
  status: string;
  // Additional fields used in bookingService
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  guests?: number;
  paymentStatus?: string;
  bookingReference?: string;
}

// Interface propriétaire pour la gestion unifiée des propriétés
export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  properties: number;
  // Additional fields used in ownerService
  userId?: string;
  companyName?: string;
  taxId?: string;
  paymentMethod?: string;
  paymentPercentage?: number;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
    swift?: string;
  };
}

// Interface pour les détails de propriété d'un propriétaire
export interface OwnerPropertyDetail {
  id: string;
  title: string;
  status: string;
  income: number;
  // Additional fields used in ownerService
  ownerId?: string;
  propertyId?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  ownershipPercentage?: number;
  active?: boolean;
  agencyId?: string;
  agencyName?: string;
  agencyCommission?: number;
  paymentHistory?: PaymentHistoryItem[];
}

// Interface pour l'historique des paiements
export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentType: 'rent' | 'deposit' | 'fee';
  paymentFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
}

export interface OwnerDashboardStats {
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalIncome: number;
  // Additional fields used in ownerService
  ownerId?: string;
  occupancyRate?: number;
  monthlyRevenue?: number;
  pendingMaintenance?: number;
  overduePayments?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  // Additional fields used in subscriptionService
  billingCycle?: string;
  isActive?: boolean;
  maxProperties?: number;
  maxUsers?: number;
  hasApiAccess?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ApartmentLease {
  id: string;
  apartmentId: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ApartmentLeasePayment {
  id: string;
  leaseId: string;
  amount: number;
  date: string;
  status: string;
}

// Configuration des paiements par type de propriété
export interface PaymentConfiguration {
  id: string;
  propertyCategory: 'residence' | 'apartment' | 'commercial' | 'land' | 'other';
  defaultPaymentFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  defaultSecurityDepositMultiplier: number;
  defaultAgencyFeesPercentage: number;
  defaultCommissionRate: number;
  prorationRules?: object;
}

// Commission de l'agence
export interface AgencyCommission {
  id: string;
  agencyId: string;
  propertyId: string;
  rate: number;
  effectiveDate: string;
  calculationType: 'percentage' | 'fixed';
  minimumAmount?: number;
  maximumAmount?: number;
}
