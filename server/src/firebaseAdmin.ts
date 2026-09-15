import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function loadServiceAccount(): object {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (base64) {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  }
  if (raw) {
    return JSON.parse(raw);
  }
  throw new Error(
    'Defina FIREBASE_SERVICE_ACCOUNT_BASE64 ou FIREBASE_SERVICE_ACCOUNT_JSON no ambiente do servidor.'
  );
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  return initializeApp({ credential: cert(loadServiceAccount() as any) });
}

let dbInstance: Firestore | null = null;

export function getFirestoreDb(): Firestore {
  if (dbInstance) return dbInstance;

  const app = getAdminApp();
  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  dbInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  return dbInstance;
}
