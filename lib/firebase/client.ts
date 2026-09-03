import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Firestore, getFirestore } from "firebase/firestore";

// Same public config as the existing Flutter app (lib/main.dart). Safe to
// ship to the browser — Firestore security rules are what actually gate
// access, not this config. Falls back to the known "leatheria" project
// values so local dev works even before .env.local is filled in, but real
// deployments should always set these via environment variables.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCFYZHGiR22PtwkEzX54DbAEYGHp-24VcA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "leatheria.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "leatheria",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "leatheria.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "9743095365",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:9743095365:web:61a68d2b53ac523e85f52c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-SBMJDKJN0K",
};

let app: FirebaseApp;
let db: Firestore;

/**
 * Returns a singleton Firestore instance. Safe to call from both Server
 * Components / Route Handlers / Server Actions (Node runtime) and Client
 * Components — the Firebase JS SDK supports both. Real-time listeners
 * (onSnapshot) must still only be used from Client Components.
 */
export function getDb(): Firestore {
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}
