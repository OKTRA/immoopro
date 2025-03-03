
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { toast } from 'sonner';

// Use environment variables or default to your project values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hzbogwleoszwtneveuvx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Ym9nd2xlb3N6d3RuZXZldXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDk2NjMsImV4cCI6MjA1NjA4NTY2M30.JLSK18Kn9GXxF0hZkNqhGOMFohui10N5Mbswz0uAKWc';

// Verify that we have the required values
if (!supabaseUrl) {
  console.error('Missing Supabase URL');
  toast.error('Configuration Supabase manquante: URL');
}

if (!supabaseAnonKey) {
  console.error('Missing Supabase Anon Key - Please set VITE_SUPABASE_ANON_KEY environment variable');
  toast.warning('Utilisation des données mockées pour le développement');
}

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Helper function to handle Supabase errors
export const handleSupabaseError = <T>(error: any): { data: T | null; error: string } => {
  console.error('Supabase error:', error);
  toast.error(`Erreur Supabase: ${error.message || 'Une erreur inconnue est survenue'}`);
  return { data: null, error: error.message || 'An unknown error occurred' };
};

// Helper for checking if Supabase connection is valid
export const isSupabaseConnected = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('agencies').select('id').limit(1);
    const connected = !error;
    if (!connected) {
      console.warn('Supabase connection failed, using mock data');
      toast.warning('Connexion à Supabase impossible, utilisation des données mockées');
    }
    return connected;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    toast.error('Erreur lors de la vérification de la connexion Supabase');
    return false;
  }
};

// Helper for data transformation from snake_case to camelCase
export const transformSnakeToCamel = <T extends Record<string, any>>(obj: T): any => {
  if (!obj) return obj;
  
  const transformed: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    transformed[camelKey] = obj[key];
  });
  
  return transformed;
};

// Helper for transforming arrays of objects
export const transformArraySnakeToCamel = <T extends Record<string, any>>(array: T[]): any[] => {
  if (!array) return [];
  return array.map(item => transformSnakeToCamel(item));
};

// Helper for data transformation from camelCase to snake_case
export const transformCamelToSnake = <T extends Record<string, any>>(obj: T): any => {
  if (!obj) return obj;
  
  const transformed: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    transformed[snakeKey] = obj[key];
  });
  
  return transformed;
};

// Helper function to calculate date differences in various units
export const getDateDiff = (startDate: Date, endDate: Date, unit: 'days' | 'weeks' | 'months' | 'years'): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  switch (unit) {
    case 'days':
      return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    case 'months': {
      const yearDiff = end.getFullYear() - start.getFullYear();
      const monthDiff = end.getMonth() - start.getMonth();
      return yearDiff * 12 + monthDiff;
    }
    case 'years':
      return end.getFullYear() - start.getFullYear();
    default:
      return 0;
  }
};

// Helper to add date periods
export const addDatePeriod = (date: Date, amount: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date => {
  const result = new Date(date);
  
  switch (unit) {
    case 'days':
      result.setDate(result.getDate() + amount);
      break;
    case 'weeks':
      result.setDate(result.getDate() + (amount * 7));
      break;
    case 'months':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'years':
      result.setFullYear(result.getFullYear() + amount);
      break;
  }
  
  return result;
};

// Mock data generator for when Supabase is not connected
export const getMockData = (type: 'properties' | 'agencies' | 'tenants' | 'bookings', count: number = 6) => {
  switch (type) {
    case 'properties':
      return Array.from({ length: count }, (_, i) => ({
        id: `mock-prop-${i + 1}`,
        title: `Propriété ${i + 1}`,
        type: ['apartment', 'house', 'office', 'land'][Math.floor(Math.random() * 4)] as 'apartment' | 'house' | 'office' | 'land',
        price: Math.floor(Math.random() * 500000) + 100000,
        location: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice'][Math.floor(Math.random() * 5)],
        area: Math.floor(Math.random() * 150) + 50,
        bedrooms: Math.floor(Math.random() * 5) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        features: ['Balcon', 'Parking', 'Ascenseur', 'Jardin'].filter(() => Math.random() > 0.5),
        imageUrl: `https://placehold.co/600x400?text=Property+${i + 1}`,
        status: ['available', 'sold', 'pending'][Math.floor(Math.random() * 3)]
      }));
    case 'agencies':
      return Array.from({ length: count }, (_, i) => ({
        id: `mock-agency-${i + 1}`,
        name: [`ImmoPlus Paris`, `Lyon Estates`, `Bordeaux Properties`, `Marseille Homes`, `Nice Riviera Realty`, `Strasbourg Properties`][i % 6],
        logoUrl: `https://placehold.co/400x400?text=Agency+${i + 1}`,
        location: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice', 'Strasbourg'][i % 6],
        properties: Math.floor(Math.random() * 50) + 10,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        verified: true
      }));
    case 'tenants':
      return Array.from({ length: count }, (_, i) => ({
        id: `mock-tenant-${i + 1}`,
        userId: `mock-user-${i + 1}`,
        firstName: ['Jean', 'Marie', 'Sophie', 'Thomas', 'Émilie', 'Pierre'][i % 6],
        lastName: ['Dupont', 'Martin', 'Bernard', 'Petit', 'Durand', 'Leroy'][i % 6],
        email: `tenant${i + 1}@example.com`,
        phone: `+33 6 ${Math.floor(Math.random() * 90000000) + 10000000}`,
        employmentStatus: ['employed', 'self-employed', 'student', 'retired'][Math.floor(Math.random() * 4)]
      }));
    case 'bookings':
      return Array.from({ length: count }, (_, i) => ({
        id: `mock-booking-${i + 1}`,
        propertyId: `mock-prop-${Math.floor(Math.random() * 10) + 1}`,
        userId: `mock-user-${Math.floor(Math.random() * 10) + 1}`,
        startDate: new Date(Date.now() + (Math.random() * 30) * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + (Math.random() * 30 + 30) * 86400000).toISOString().split('T')[0],
        totalPrice: Math.floor(Math.random() * 5000) + 1000,
        status: ['confirmed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
        guests: Math.floor(Math.random() * 6) + 1,
        paymentStatus: ['paid', 'pending', 'failed'][Math.floor(Math.random() * 3)],
        bookingReference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      }));
    default:
      return [];
  }
};
