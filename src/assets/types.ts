
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

export interface AdminNotification {
  id: string;
  message: string;
  date: string;
  read: boolean;
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
}

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  properties: number;
}

export interface OwnerPropertyDetail {
  id: string;
  title: string;
  status: string;
  income: number;
}

export interface OwnerDashboardStats {
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalIncome: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
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
