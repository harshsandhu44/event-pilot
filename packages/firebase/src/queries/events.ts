import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import type { Event, EventCreate, EventUpdate } from '@eventpilot/types';
import { db } from '../client';

const eventsCollection = collection(db, 'events');

const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

const eventConverter = (data: any, id: string): Event => ({
  id,
  name: data.name,
  description: data.description,
  startDate: timestampToDate(data.startDate),
  endDate: timestampToDate(data.endDate),
  venue: data.venue,
  wifiDetails: data.wifiDetails,
  status: data.status,
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
});

export const getEvents = async (): Promise<Event[]> => {
  const snapshot = await getDocs(eventsCollection);
  return snapshot.docs.map(doc => eventConverter(doc.data(), doc.id));
};

export const getActiveEvents = async (): Promise<Event[]> => {
  const q = query(eventsCollection, where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => eventConverter(doc.data(), doc.id));
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  const docRef = doc(db, 'events', eventId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return eventConverter(snapshot.data(), snapshot.id);
};

export const createEvent = async (data: EventCreate): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(eventsCollection, {
    ...data,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateEvent = async (eventId: string, data: EventUpdate): Promise<void> => {
  const docRef = doc(db, 'events', eventId);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  if (data.startDate) {
    updateData.startDate = Timestamp.fromDate(data.startDate);
  }
  if (data.endDate) {
    updateData.endDate = Timestamp.fromDate(data.endDate);
  }

  await updateDoc(docRef, updateData);
};
