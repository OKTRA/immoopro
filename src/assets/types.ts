
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

// Add missing types that are referenced in other components
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  imageUrl: string;
  features?: string[];
  description?: string;
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
  // Additional fields used in the service
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

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  properties: number;
  // Additional fields used in ownerService
  userId?: string;
  companyName?: string;
  taxId?: string;
  paymentMethod?: string;
  paymentPercentage?: number;
}

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
