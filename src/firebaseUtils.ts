import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { SadhanaStore } from './types';

// Helper to clean undefined values so Firestore doesn't reject the write
export const sanitizeForFirestore = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

// Save store to Firestore
export const saveUserStoreToFirestore = async (uid: string, store: SadhanaStore): Promise<void> => {
  try {
    const cleanStore = sanitizeForFirestore(store);
    await setDoc(doc(db, 'users', uid), cleanStore);
  } catch (error) {
    console.error('Failed to save store to Firestore:', error);
    throw error;
  }
};

// Load store from Firestore
export const loadUserStoreFromFirestore = async (uid: string): Promise<SadhanaStore | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SadhanaStore;
    }
    return null;
  } catch (error) {
    console.error('Failed to load store from Firestore:', error);
    throw error;
  }
};

// Subscribe to real-time updates from Firestore
export const subscribeToUserStore = (
  uid: string,
  onUpdate: (store: SadhanaStore, metadata: { hasPendingWrites: boolean }) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as SadhanaStore;
        onUpdate(cloudData, { hasPendingWrites: docSnap.metadata.hasPendingWrites });
      }
    },
    (error) => {
      console.error('Failed real-time subscription to Firestore:', error);
      if (onError) onError(error);
    }
  );
};

// Clean merge helper so user data is never lost when logging in
export const mergeStores = (local: SadhanaStore, cloud?: SadhanaStore | null): SadhanaStore => {
  if (!cloud) return local;

  const localLogs = local.logs || {};
  const cloudLogs = cloud.logs || {};
  const mergedLogs = { ...localLogs };

  Object.entries(cloudLogs).forEach(([dateStr, cloudLog]) => {
    const localLog = mergedLogs[dateStr];
    if (!localLog) {
      mergedLogs[dateStr] = cloudLog;
    } else {
      mergedLogs[dateStr] = {
        completed: { ...(cloudLog.completed || {}), ...(localLog.completed || {}) },
        counts: { ...(cloudLog.counts || {}), ...(localLog.counts || {}) },
        notes: localLog.notes || cloudLog.notes
      };
    }
  });
  
  // Merge custom sadhanas
  const sadhanaMap = new Map();
  (local.sadhanas || []).forEach(s => sadhanaMap.set(s.id, s));
  (cloud.sadhanas || []).forEach(s => sadhanaMap.set(s.id, s));
  
  // Merge active sankalps
  const sankalpMap = new Map();
  (local.sankalps || []).forEach(s => sankalpMap.set(s.id, s));
  (cloud.sankalps || []).forEach(s => sankalpMap.set(s.id, s));

  return {
    username: cloud.username || local.username || '',
    sadhanas: Array.from(sadhanaMap.values()),
    sankalps: Array.from(sankalpMap.values()),
    logs: mergedLogs,
    migratedToReps: true
  };
};

export const deleteUserStoreFromFirestore = async (uid: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Failed to delete user document from Firestore:', error);
    throw error;
  }
};

