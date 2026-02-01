import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { ScheduleItem, ScheduleItemCreate, ScheduleItemUpdate } from '@eventpilot/types';
import { db } from '../client';

const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

const scheduleConverter = (data: any, id: string): ScheduleItem => ({
  id,
  type: data.type,
  title: data.title,
  description: data.description,
  speaker: data.speaker || [],
  location: data.location,
  startTime: timestampToDate(data.startTime),
  endTime: timestampToDate(data.endTime),
  status: data.status,
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
});

export const getScheduleItems = async (eventId: string, filters?: { type?: string; status?: string }): Promise<ScheduleItem[]> => {
  const scheduleRef = collection(db, 'events', eventId, 'schedule');

  let q = query(scheduleRef, orderBy('startTime'));

  if (filters?.type) {
    q = query(scheduleRef, where('type', '==', filters.type), orderBy('startTime'));
  }
  if (filters?.status) {
    q = query(scheduleRef, where('status', '==', filters.status), orderBy('startTime'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => scheduleConverter(doc.data(), doc.id));
};

export const getCurrentScheduleItems = async (eventId: string): Promise<ScheduleItem[]> => {
  const scheduleRef = collection(db, 'events', eventId, 'schedule');
  const now = Timestamp.now();

  const q = query(
    scheduleRef,
    where('startTime', '<=', now),
    where('endTime', '>=', now),
    orderBy('startTime')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => scheduleConverter(doc.data(), doc.id));
};

export const getScheduleItemById = async (eventId: string, scheduleId: string): Promise<ScheduleItem | null> => {
  const docRef = doc(db, 'events', eventId, 'schedule', scheduleId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return scheduleConverter(snapshot.data(), snapshot.id);
};

export const createScheduleItem = async (eventId: string, data: ScheduleItemCreate): Promise<string> => {
  const scheduleRef = collection(db, 'events', eventId, 'schedule');
  const now = Timestamp.now();

  const docRef = await addDoc(scheduleRef, {
    ...data,
    startTime: Timestamp.fromDate(data.startTime),
    endTime: Timestamp.fromDate(data.endTime),
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

export const updateScheduleItem = async (eventId: string, scheduleId: string, data: ScheduleItemUpdate): Promise<void> => {
  const docRef = doc(db, 'events', eventId, 'schedule', scheduleId);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  if (data.startTime) {
    updateData.startTime = Timestamp.fromDate(data.startTime);
  }
  if (data.endTime) {
    updateData.endTime = Timestamp.fromDate(data.endTime);
  }

  await updateDoc(docRef, updateData);
};
