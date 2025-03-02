
export interface Property {
  id: string;
  title: string;
  type: 'apartment' | 'house' | 'office' | 'land';
  price: number;
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  imageUrl: string;
  description?: string;
  status?: string;
  agentId?: string;
  agencyId?: string;
  yearBuilt?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  latitude?: number;
  longitude?: number;
  virtualTourUrl?: string;
}

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

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface UserType {
  type: 'public' | 'agency' | 'owner' | 'admin';
  label: string;
  path: string;
  description: string;
}

export interface Tenant {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  employmentStatus?: string;
  employer?: string;
  income?: number;
}

export interface Apartment {
  id: string;
  propertyId: string;
  unitNumber: string;
  floorPlan: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  monthlyRent: number;
  status: string;
  amenities?: string[];
  images?: string[];
  description?: string;
}

export interface ApartmentLease {
  id: string;
  apartmentId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  isActive: boolean;
  paymentDay: number;
  leaseType: string;
  signedByTenant?: boolean;
  signedByOwner?: boolean;
}

export interface ApartmentLeasePayment {
  id: string;
  leaseId: string;
  tenantId: string;
  paymentDate: string;
  dueDate: string;
  amount: number;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  paymentPeriodStart: string;
  paymentPeriodEnd: string;
}

export interface PropertyOwner {
  id: string;
  userId: string;
  companyName?: string;
  taxId?: string;
  paymentMethod: string;
  paymentPercentage: number;
}

export interface OwnerPropertyDetail {
  id: string;
  ownerId: string;
  propertyId: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  ownershipPercentage: number;
  active: boolean;
}

export interface OwnerDashboardStats {
  ownerId: string;
  totalProperties: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  overduePayments: number;
}

export interface AdminNotification {
  id: string;
  adminId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  priority: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  guests: number;
  paymentStatus: string;
  bookingReference: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  isActive: boolean;
  maxProperties: number;
  maxUsers: number;
  hasApiAccess: boolean;
}
