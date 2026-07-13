import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';

// Singleton instance to prevent re-initialization in dev
if (getApps().length === 0) {
  try {
    let credential;

    // Check for environment variables first (Production approach)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines with actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } else {
      // Fallback to local JSON file (Development approach)
      const serviceAccountPath = path.resolve(process.cwd(), 'firebase-admin.json');
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        credential = cert(serviceAccount);
      }
    }

    if (credential) {
      initializeApp({
        credential,
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.warn('Firebase Admin could not be initialized: missing credentials');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminMessaging = getApps().length > 0 ? getMessaging(getApp()) : null;
