import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SadhanaStore } from './types';

// Save store to Firestore
export const saveUserStoreToFirestore = async (uid: string, store: SadhanaStore): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), store);
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
  // Merge logs (cloud logs overwrite conflicting keys, but we retain all distinct keys)
  const mergedLogs = { ...local.logs, ...cloud.logs };
  
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
