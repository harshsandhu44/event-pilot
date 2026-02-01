import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import type { Amenity, AmenityCreate, AmenityUpdate } from '@eventpilot/types';
import { db } from '../client';

const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

const amenityConverter = (data: any, id: string): Amenity => ({
  id,
  type: data.type,
  name: data.name,
  location: data.location,
  isAccessible: data.isAccessible || false,
  isAvailable: data.isAvailable !== false,
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
});

export const getAmenities = async (eventId: string, filters?: { type?: string; isAccessible?: boolean }): Promise<Amenity[]> => {
  const amenitiesRef = collection(db, 'events', eventId, 'amenities');

  let q = query(amenitiesRef);

  if (filters?.type) {
    q = query(amenitiesRef, where('type', '==', filters.type));
  }
  if (filters?.isAccessible !== undefined) {
    q = query(amenitiesRef, where('isAccessible', '==', filters.isAccessible));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => amenityConverter(doc.data(), doc.id));
};

export const getAmenityById = async (eventId: string, amenityId: string): Promise<Amenity | null> => {
  const docRef = doc(db, 'events', eventId, 'amenities', amenityId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return amenityConverter(snapshot.data(), snapshot.id);
};

export const createAmenity = async (eventId: string, data: AmenityCreate): Promise<string> => {
  const amenitiesRef = collection(db, 'events', eventId, 'amenities');
  const now = Timestamp.now();

  const docRef = await addDoc(amenitiesRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

export const updateAmenity = async (eventId: string, amenityId: string, data: AmenityUpdate): Promise<void> => {
  const docRef = doc(db, 'events', eventId, 'amenities', amenityId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};
