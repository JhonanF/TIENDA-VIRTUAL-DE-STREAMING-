import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase app safely (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Firestore con Persistencia Offline (IndexedDB)
 * ------------------------------------------------
 * `persistentLocalCache` + `persistentMultipleTabManager` habilita que la SEGUNDA visita
 * sirva datos desde el caché local de IndexedDB instantáneamente sin esperar a la red.
 * Esto elimina el retraso de la cadena Firestore de 28,044ms en 4G lenta.
 *
 * CRÍTICO: Se debe usar `initializeFirestore` en lugar de `getFirestore` para pasar
 * el ID de base de datos personalizado junto con la configuración de caché.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
}, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without the database ID */

export const storage = getStorage(app);

/**
 * Firebase Auth — Inicialización Lazy
 * ------------------------------------
 * getAuth() carga automáticamente el iframe de ~90KB de firebaseapp.com.
 * Al convertirlo en un getter lazy, ese iframe SOLO se descarga cuando el AdminPanel
 * es abierto por el usuario, no durante la carga inicial de la tienda.
 */
let _auth: ReturnType<typeof import('firebase/auth').getAuth> | null = null;
export const getAuthLazy = async () => {
  if (!_auth) {
    const { getAuth } = await import('firebase/auth');
    _auth = getAuth(app);
  }
  return _auth;
};

// Operational Error Handling for Firebase Permissions (Mandatory platform requirement)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export async function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = await getAuthLazy();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
