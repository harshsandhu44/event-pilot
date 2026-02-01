import { LocationData } from './location';

export interface Amenity {
  id: string;
  type: 'restroom' | 'atm' | 'food' | 'firstAid' | 'parking' | 'charging' | 'wifi' | 'other';
  name: string;
  location: LocationData;
  isAccessible: boolean;     // Wheelchair accessible
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AmenityCreate extends Omit<Amenity, 'id' | 'createdAt' | 'updatedAt'> {}
export interface AmenityUpdate extends Partial<AmenityCreate> {}
