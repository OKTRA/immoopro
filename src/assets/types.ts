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

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  kitchens?: number;
  shops?: number;
  livingRooms?: number;
  area: number;
  type: string;
  status: string;
  imageUrl: string;
  features?: string[];
  description?: string;
  propertyCategory?: 'residence' | 'apartment' | 'commercial' | 'land' | 'other';
  paymentFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  securityDeposit?: number;
  agencyFees?: number;
  commissionRate?: number;
  ownerId?: string;
  agencyId?: string;
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
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  guests?: number;
  paymentStatus?: string;
  bookingReference?: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  properties: number;
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

export interface OwnerPropertyDetail {
  id: string;
  title: string;
  status: string;
  income: number;
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
  propertyId: string;
  apartmentId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  paymentStartDate?: string;
  payment_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  monthly_rent: number;
  security_deposit: number;
  payment_day?: number;
  is_active?: boolean;
  signed_by_tenant?: boolean;
  signed_by_owner?: boolean;
  has_renewal_option?: boolean;
  lease_type?: string;
  special_conditions?: string;
  status: string;
}

export interface ApartmentLeasePayment {
  id: string;
  leaseId: string;
  amount: number;
  date: string;
  status: string;
}

export interface PaymentConfiguration {
  id: string;
  propertyCategory: 'residence' | 'apartment' | 'commercial' | 'land' | 'other';
  defaultPaymentFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  defaultSecurityDepositMultiplier: number;
  defaultAgencyFeesPercentage: number;
  defaultCommissionRate: number;
  prorationRules?: object;
}

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
