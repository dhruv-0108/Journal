import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Load configuration from environment variables with safe fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAjjRe7TnDHeWYbFxtb1-XON0gDY1dHvf4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sadhana-mandala-d873f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sadhana-mandala-d873f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sadhana-mandala-d873f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "434206412815",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:434206412815:web:e2be6b79ed1612316ad37a"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
