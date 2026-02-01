import { LocationData } from './location';

export interface ScheduleItem {
  id: string;
  type: 'session' | 'workshop' | 'keynote' | 'break' | 'networking' | 'other';
  title: string;
  description: string;
  speaker: string[];
  location: LocationData;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleItemCreate extends Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'> {}
export interface ScheduleItemUpdate extends Partial<ScheduleItemCreate> {}
