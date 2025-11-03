/**
 * Centralized Firebase initialization for PennyPilot.
 * This ensures Firebase is initialized once before any services use it.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '@/env/firebase';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase app and services.
 * Safe to call multiple times - will only initialize once.
 */
export function initializeFirebase() {
  try {
    if (!firebaseApp) {
      if (!getApps().length) {
        firebaseApp = initializeApp(FIREBASE_CONFIG);
      } else {
        firebaseApp = getApp();
      }
    }

    if (!auth) {
      auth = getAuth(firebaseApp);
    }

    if (!db) {
      db = getFirestore(firebaseApp);
    }

    return { app: firebaseApp, auth, db };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

/**
 * Get Firebase Auth instance (initializes if needed)
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth!;
}

/**
 * Get Firestore instance (initializes if needed)
 */
export function getFirebaseDb(): Firestore {
  if (!db) {
    initializeFirebase();
  }
  return db!;
}

/**
 * Get Firebase App instance (initializes if needed)
 */
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp!;
}
