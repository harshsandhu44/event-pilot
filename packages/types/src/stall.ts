import { LocationData } from './location';

export interface Stall {
  id: string;
  name: string;
  nameLower: string;         // For case-insensitive search
  category: string;
  location: LocationData;
  description: string;
  tags: string[];
  isCrowded: boolean;
  waitTimeMin?: number;      // Wait time in minutes
  hasGiveaways: boolean;
  status: 'active' | 'inactive' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface StallCreate extends Omit<Stall, 'id' | 'nameLower' | 'createdAt' | 'updatedAt'> {}
export interface StallUpdate extends Partial<Omit<StallCreate, 'name'>> {
  name?: string;
}
