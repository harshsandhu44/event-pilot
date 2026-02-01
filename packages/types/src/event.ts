export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  wifiDetails?: {
    ssid: string;
    password: string;
  };
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventCreate extends Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {}
export interface EventUpdate extends Partial<EventCreate> {}
