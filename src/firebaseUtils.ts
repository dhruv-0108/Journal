import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SadhanaStore } from './types';

// Recursive helper to clean undefined values so Firestore doesn't reject the write
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const clean: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    });
    return clean;
  }
  return obj;
};

// Save store to Firestore
export const saveUserStoreToFirestore = async (uid: string, store: SadhanaStore): Promise<void> => {
  try {
    const cleanStore = sanitizeForFirestore(store);
    await setDoc(doc(db, 'users', uid), cleanStore);
  } catch (error) {
    console.error('Failed to save store to Firestore:', error);
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
    return null;
  }
};

// Clean merge helper so user data is never lost when logging in
export const mergeStores = (local: SadhanaStore, cloud: SadhanaStore): SadhanaStore => {
  // Deep merge logs day-by-day and practice-by-practice so no logs are accidentally overwritten
  const mergedLogs = { ...local.logs };
  Object.entries(cloud.logs).forEach(([dateStr, cloudLog]) => {
    const localLog = mergedLogs[dateStr];
    if (!localLog) {
      mergedLogs[dateStr] = cloudLog;
    } else {
      mergedLogs[dateStr] = {
        completed: { ...localLog.completed, ...cloudLog.completed },
        counts: { ...localLog.counts, ...cloudLog.counts },
        notes: cloudLog.notes || localLog.notes
      };
    }
  });
  
  // Merge custom sadhanas
  const sadhanaMap = new Map();
  local.sadhanas.forEach(s => sadhanaMap.set(s.id, s));
  cloud.sadhanas.forEach(s => sadhanaMap.set(s.id, s));
  
  // Merge active sankalps
  const sankalpMap = new Map();
  local.sankalps.forEach(s => sankalpMap.set(s.id, s));
  cloud.sankalps.forEach(s => sankalpMap.set(s.id, s));

  return {
    username: cloud.username || local.username,
    sadhanas: Array.from(sadhanaMap.values()),
    sankalps: Array.from(sankalpMap.values()),
    logs: mergedLogs
  };
};
