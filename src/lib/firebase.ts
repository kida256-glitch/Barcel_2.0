'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if Firebase is properly configured
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-api-key') {
    console.warn('Firebase is not configured. Wallet sync across devices will not work.');
    return null;
  }

  try {
    if (!app) {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
      } else {
        app = initializeApp(firebaseConfig);
      }
    }
    return app;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
}

export function getFirestoreDB(): Firestore | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const app = getFirebaseApp();
    if (!app) {
      return null;
    }

    if (!db) {
      db = getFirestore(app);
    }
    return db;
  } catch (error) {
    console.error('Error getting Firestore:', error);
    return null;
  }
}

