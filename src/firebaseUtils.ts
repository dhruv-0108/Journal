import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { SadhanaStore } from './types';

// Helper to clean undefined values so Firestore doesn't reject the write
export const sanitizeForFirestore = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

// Ensure a SadhanaStore object is well-formed with defaults
export const normalizeStore = (raw: any): SadhanaStore => {
  if (!raw) {
    return {
      username: '',
      sadhanas: [],
      sankalps: [],
      logs: {},
      migratedToReps: true
    };
  }
  return {
    username: raw.username || '',
    sadhanas: Array.isArray(raw.sadhanas) ? raw.sadhanas : [],
    sankalps: Array.isArray(raw.sankalps) ? raw.sankalps : [],
    logs: raw.logs && typeof raw.logs === 'object' ? raw.logs : {},
    migratedToReps: true
  };
};

// Save store to Firestore
export const saveUserStoreToFirestore = async (uid: string, store: SadhanaStore): Promise<void> => {
  try {
    const cleanStore = sanitizeForFirestore(store);
    await setDoc(doc(db, 'users', uid), cleanStore);
  } catch (error: any) {
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
      return normalizeStore(docSnap.data());
    }
    return null;
  } catch (error: any) {
    console.error('Failed to load store from Firestore:', error);
    return null;
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
        const cloudData = normalizeStore(docSnap.data());
        onUpdate(cloudData, { hasPendingWrites: docSnap.metadata.hasPendingWrites });
      }
    },
    (error) => {
      console.error('Failed real-time subscription to Firestore:', error);
      if (onError) onError(error);
    }
  );
};

// Robust merge helper: Cloud data is the primary source of truth for logged-in users.
// Local guest logs or un-synced entries are safely merged without overwriting cloud progress.
export const mergeStores = (local: SadhanaStore, cloud?: SadhanaStore | null): SadhanaStore => {
  if (!cloud) return normalizeStore(local);
  
  const normCloud = normalizeStore(cloud);
  const normLocal = normalizeStore(local);

  // Deep clone cloud logs as base
  const mergedLogs: SadhanaStore['logs'] = JSON.parse(JSON.stringify(normCloud.logs));

  // Merge local logs only to PRESERVE completions or higher counts (e.g. offline/guest work done before sign-in)
  Object.entries(normLocal.logs).forEach(([dateStr, localLog]) => {
    const cloudLog = mergedLogs[dateStr];
    if (!cloudLog) {
      mergedLogs[dateStr] = localLog;
    } else {
      const mergedCompleted = { ...(cloudLog.completed || {}) };
      const mergedCounts = { ...(cloudLog.counts || {}) };

      // Keep cloud completions, and if local has true, keep true
      Object.entries(localLog.completed || {}).forEach(([sId, isDone]) => {
        if (isDone) {
          mergedCompleted[sId] = true;
        }
      });

      // Keep highest rep count
      Object.entries(localLog.counts || {}).forEach(([sId, count]) => {
        const existingCount = mergedCounts[sId] || 0;
        if (count > existingCount) {
          mergedCounts[sId] = count;
        }
      });

      mergedLogs[dateStr] = {
        completed: mergedCompleted,
        counts: mergedCounts,
        notes: cloudLog.notes || localLog.notes || ''
      };
    }
  });
  
  // Sadhanas: Use cloud sadhanas as primary. Only append local sadhanas if they don't match any cloud sadhana by ID or name.
  const sadhanaMap = new Map();
  normCloud.sadhanas.forEach(s => sadhanaMap.set(s.id, s));
  normLocal.sadhanas.forEach(s => {
    const nameMatch = normCloud.sadhanas.some(cs => cs.name.toLowerCase().trim() === s.name.toLowerCase().trim());
    if (!sadhanaMap.has(s.id) && !nameMatch) {
      sadhanaMap.set(s.id, s);
    }
  });
  
  // Sankalps: Use cloud sankalps as primary. Only append local sankalps if they don't exist in cloud.
  const sankalpMap = new Map();
  normCloud.sankalps.forEach(s => sankalpMap.set(s.id, s));
  normLocal.sankalps.forEach(s => {
    if (!sankalpMap.has(s.id)) {
      sankalpMap.set(s.id, s);
    }
  });

  return {
    username: normCloud.username || normLocal.username || '',
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


