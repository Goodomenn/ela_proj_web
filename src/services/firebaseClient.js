import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyA71YJKRUr6j4PIoQHpCn72fEG_BXT_OA0",
  authDomain: "elaprojects-3212e.firebaseapp.com",
  projectId: "elaprojects-3212e",
  storageBucket: "elaprojects-3212e.firebasestorage.app",
  messagingSenderId: "237407843333",
  appId: "1:237407843333:web:ela_web_app"
};

let app = null;
let db = null;
let auth = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);

  // Authenticate anonymously so request.auth != null satisfies firestore.rules
  signInAnonymously(auth).catch((err) => {
    console.warn('[Firebase Auth] Anonymous sign-in notice:', err.message);
  });
} catch (error) {
  console.warn('[Firebase] Initialization notice:', error.message);
}

export { 
  app, 
  db, 
  auth, 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
};

/**
 * Currency formatter for Ethiopian Birr (ETB)
 */
export function formatETB(amount, decimals = 2) {
  const num = Number(amount) || 0;
  return `ETB ${num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Real-time listener for sales entries
 */
export function subscribeToSalesEntries(systemType, callback) {
  if (!db) return () => {};
  const colRef = collection(db, 'sales_entries');
  let q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
  if (systemType && systemType !== 'ALL') {
    q = query(colRef, where('systemType', '==', systemType), limit(100));
  }
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  }, (err) => {
    console.warn('[Sales Subscription Error]:', err.message);
  });
}

/**
 * Real-time listener for bank transactions
 */
export function subscribeToTransactions(callback) {
  if (!db) return () => {};
  const colRef = collection(db, 'transactions');
  const q = query(colRef, limit(200));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort descending by timestamp
    list.sort((a, b) => {
      const ta = new Date(a.timestamp || 0).getTime();
      const tb = new Date(b.timestamp || 0).getTime();
      return tb - ta;
    });
    callback(list);
  }, (err) => {
    console.warn('[Transactions Subscription Error]:', err.message);
  });
}

/**
 * Real-time listener for over & shortage resolutions
 */
export function subscribeToOverShortageResolutions(callback) {
  if (!db) return () => {};
  const colRef = collection(db, 'over_shortage_resolutions');
  return onSnapshot(colRef, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  }, (err) => {
    console.warn('[OverShortage Subscription Error]:', err.message);
  });
}

/**
 * Real-time listener for cashier daily reports
 */
export function subscribeToCashierReports(callback) {
  if (!db) return () => {};
  const colRef = collection(db, 'cashier_daily_reports');
  const q = query(colRef, limit(100));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  }, (err) => {
    console.warn('[Cashier Subscription Error]:', err.message);
  });
}

/**
 * Real-time listener for expenses
 */
export function subscribeToExpenses(callback) {
  if (!db) return () => {};
  const colRef = collection(db, 'expense_entries');
  const q = query(colRef, limit(100));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  }, (err) => {
    console.warn('[Expense Subscription Error]:', err.message);
  });
}

/**
 * Real-time listener for purchases
 */
export function subscribeToPurchases(callback) {
  if (!db) return () => {};
  const colRef = collection(db, 'purchases');
  const q = query(colRef, limit(100));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  }, (err) => {
    console.warn('[Purchase Subscription Error]:', err.message);
  });
}
