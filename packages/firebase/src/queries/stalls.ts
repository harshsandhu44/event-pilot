import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Stall, StallCreate, StallUpdate } from '@eventpilot/types';
import { db } from '../client';

const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

const stallConverter = (data: any, id: string): Stall => ({
  id,
  name: data.name,
  nameLower: data.nameLower,
  category: data.category,
  location: data.location,
  description: data.description,
  tags: data.tags || [],
  isCrowded: data.isCrowded || false,
  waitTimeMin: data.waitTimeMin,
  hasGiveaways: data.hasGiveaways || false,
  status: data.status,
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
});

export const getStalls = async (eventId: string): Promise<Stall[]> => {
  const stallsRef = collection(db, 'events', eventId, 'stalls');
  const snapshot = await getDocs(stallsRef);
  return snapshot.docs.map(doc => stallConverter(doc.data(), doc.id));
};

export const searchStalls = async (eventId: string, searchTerm: string): Promise<Stall[]> => {
  const stallsRef = collection(db, 'events', eventId, 'stalls');
  const lowerTerm = searchTerm.toLowerCase();

  const q = query(
    stallsRef,
    where('nameLower', '>=', lowerTerm),
    where('nameLower', '<=', lowerTerm + '\uf8ff'),
    orderBy('nameLower')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => stallConverter(doc.data(), doc.id));
};

export const getStallsByCategory = async (eventId: string, category: string): Promise<Stall[]> => {
  const stallsRef = collection(db, 'events', eventId, 'stalls');
  const q = query(stallsRef, where('category', '==', category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => stallConverter(doc.data(), doc.id));
};

export const getStallById = async (eventId: string, stallId: string): Promise<Stall | null> => {
  const docRef = doc(db, 'events', eventId, 'stalls', stallId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return stallConverter(snapshot.data(), snapshot.id);
};

export const createStall = async (eventId: string, data: StallCreate): Promise<string> => {
  const stallsRef = collection(db, 'events', eventId, 'stalls');
  const now = Timestamp.now();

  const docRef = await addDoc(stallsRef, {
    ...data,
    nameLower: data.name.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

export const updateStall = async (eventId: string, stallId: string, data: StallUpdate): Promise<void> => {
  const docRef = doc(db, 'events', eventId, 'stalls', stallId);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  if (data.name) {
    updateData.nameLower = data.name.toLowerCase();
  }

  await updateDoc(docRef, updateData);
};
