import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

// Matches the exact project configuration from proj_ela/android/app/google-services.json
export const firebaseConfig = {
  apiKey: "AIzaSyA71YJKRUr6j4PIoQHpCn72fEG_BXT_OA0",
  projectId: "elaprojects-3212e",
  storageBucket: "elaprojects-3212e.firebasestorage.app",
  appId: "1:237407843333:web:ela_web_app"
};

let app = null;
let db = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
} catch (error) {
  console.warn('[Firebase Client] Direct initialization warning:', error.message);
}

export { app, db };

/**
 * Direct client Firestore read with fallback
 */
export async function fetchFirestoreSales(systemType) {
  if (!db) return null;
  try {
    const colRef = collection(db, 'sales_entries');
    let q = colRef;
    if (systemType) {
      q = query(colRef, where('systemType', '==', systemType));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      return items;
    }
  } catch (err) {
    console.warn('[Firebase Client] Direct read fallback:', err.message);
  }
  return null;
}
