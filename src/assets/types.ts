
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
