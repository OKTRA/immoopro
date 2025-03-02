
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
}

export interface Agency {
  id: string;
  name: string;
  logoUrl: string;
  location: string;
  properties: number;
  rating: number;
  verified: boolean;
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
