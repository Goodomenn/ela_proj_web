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
  startAfter,
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
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
  startAfter,
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
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
 * Normalizes raw Firestore transaction documents to match the Flutter app's schema
 */
export function normalizeTransaction(d, fallbackId) {
  const data = typeof d.data === 'function' ? d.data() : d;
  const docId = fallbackId || d.id || data.id || '';

  // 1. Amount in ETB: Flutter app stores totalAmountCents (integer)
  let amount = 0;
  if (data.totalAmountCents != null) {
    amount = Number(data.totalAmountCents) / 100.0;
  } else if (data.totalAmount != null) {
    amount = Number(data.totalAmount);
  } else if (data.amount != null) {
    amount = Number(data.amount);
  }

  // 2. Current Balance
  let currentBalance = 0;
  if (data.currentBalanceCents != null) {
    currentBalance = Number(data.currentBalanceCents) / 100.0;
  } else if (data.currentBalance != null) {
    currentBalance = Number(data.currentBalance);
  }

  // 3. Date & Time parsing
  let dateObj = null;
  if (data.transactionDateTime?.toDate) {
    dateObj = data.transactionDateTime.toDate();
  } else if (data.transactionDateTime?.seconds) {
    dateObj = new Date(data.transactionDateTime.seconds * 1000);
  } else if (data.timestamp?.toDate) {
    dateObj = data.timestamp.toDate();
  } else if (data.timestamp) {
    dateObj = new Date(data.timestamp);
  } else if (data.createdAt?.toDate) {
    dateObj = data.createdAt.toDate();
  } else if (data.createdAt?.seconds) {
    dateObj = new Date(data.createdAt.seconds * 1000);
  } else {
    dateObj = new Date();
  }

  // 4. Direction & Type: CREDITED/DEPOSITED are income (+), DEBITED/WITHDRAWN/TRANSFER are expense (-)
  const txType = (data.transactionType || '').toUpperCase();
  const isDebit = txType === 'DEBITED' || txType === 'WITHDRAWN' || txType === 'TRANSFER' || txType === 'FEE';
  const isCredit = txType === 'CREDITED' || txType === 'DEPOSITED';
  const isIncome = data.isIncome != null ? data.isIncome : (isCredit || !isDebit);

  // 5. Bank name normalization
  let bankName = (data.bankName || data.senderNumber || 'Bank Transfer').toString().trim();
  if (bankName === '127') bankName = 'Telebirr';
  else if (bankName.toUpperCase().includes('COMMERCIAL BANK OF ETHIOPIA') || bankName.toUpperCase() === 'CBE') bankName = 'CBE';
  else if (bankName.toUpperCase().includes('CBE BIRR') || bankName.toUpperCase().includes('CBEBIRR')) bankName = 'CBE Birr';
  else if (bankName.toUpperCase().includes('AWASH')) bankName = 'Awash Bank';
  else if (bankName.toUpperCase().includes('ABYSSINIA') || bankName.toUpperCase() === 'BOA') bankName = 'Bank of Abyssinia';

  const sender = data.sender || 'Unknown';
  const forwardedBy = data.forwardedBy || data.forwardedName || data.forwarderUsername || 'system';
  const referenceCode = data.referenceCode || 'N/A';
  const rawMessage = data.rawText || data.rawBody || data.rawMessage || '';
  const isReconciled = !!data.isReconciled;
  const status = data.status || 'VERIFIED';

  return {
    id: docId,
    bankName,
    sender,
    forwardedBy,
    referenceCode,
    amount,
    currentBalance,
    isIncome,
    transactionType: txType || (isIncome ? 'CREDITED' : 'DEBITED'),
    dateObj,
    timestamp: dateObj.toISOString(),
    rawMessage,
    isReconciled,
    status,
    _rawDoc: typeof d.data === 'function' ? d : null
  };
}

/**
 * Fetch Initial Transactions (Today's Transactions, or latest 20 if today has none)
 */
export async function fetchInitialTransactions() {
  if (!db) return { transactions: [], lastDoc: null, hasMore: false, isTodayOnly: false };
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // 1. Try to fetch transactions starting from the beginning of today
    const todayQ = query(
      collection(db, 'transactions'),
      where('transactionDateTime', '>=', Timestamp.fromDate(startOfToday)),
      orderBy('transactionDateTime', 'desc')
    );
    const todaySnap = await getDocs(todayQ);

    if (todaySnap.docs.length > 0) {
      const transactions = todaySnap.docs.map(d => normalizeTransaction(d));
      const lastDoc = todaySnap.docs[todaySnap.docs.length - 1];
      return { 
        transactions, 
        lastDoc, 
        hasMore: true, 
        isTodayOnly: true 
      };
    }

    // 2. Fallback: If today has 0 records yet, load the latest 20 transactions
    const fallbackQ = query(
      collection(db, 'transactions'),
      orderBy('transactionDateTime', 'desc'),
      limit(20)
    );
    const fallbackSnap = await getDocs(fallbackQ);
    const transactions = fallbackSnap.docs.map(d => normalizeTransaction(d));
    const lastDoc = fallbackSnap.docs.length > 0 ? fallbackSnap.docs[fallbackSnap.docs.length - 1] : null;

    return { 
      transactions, 
      lastDoc, 
      hasMore: fallbackSnap.docs.length === 20, 
      isTodayOnly: false 
    };
  } catch (err) {
    console.warn('[Fetch Initial Transactions Error]:', err.message);
    return { transactions: [], lastDoc: null, hasMore: false, isTodayOnly: false };
  }
}

/**
 * Fetch Next Page of Transactions (Loads next 20 items using cursor pagination)
 */
export async function fetchMoreTransactions(lastDoc, pageSize = 20) {
  if (!db || !lastDoc) return { transactions: [], lastDoc: null, hasMore: false };
  try {
    const nextQ = query(
      collection(db, 'transactions'),
      orderBy('transactionDateTime', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
    const snap = await getDocs(nextQ);
    const transactions = snap.docs.map(d => normalizeTransaction(d));
    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { 
      transactions, 
      lastDoc: newLastDoc, 
      hasMore: snap.docs.length === pageSize 
    };
  } catch (err) {
    console.warn('[Fetch More Transactions Error]:', err.message);
    return { transactions: [], lastDoc: null, hasMore: false };
  }
}

/**
 * Real-time listener for bank transactions (Limits to recent 100 to avoid loading all 3640 at once)
 */
export function subscribeToTransactions(callback) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'transactions');
    const q = query(colRef, orderBy('transactionDateTime', 'desc'), limit(150));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => normalizeTransaction(d));
      callback(list);
    }, (err) => {
      console.warn('[Transactions Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[Transactions Subscription Init Error]:', err.message);
    return () => {};
  }
}

/**
 * Real-time listener for sales entries
 */
export function subscribeToSalesEntries(systemType, callback) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'sales_entries');
    return onSnapshot(colRef, (snapshot) => {
      let list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (systemType && systemType !== 'ALL') {
        list = list.filter(item => item.systemType === systemType);
      }
      list.sort((a, b) => {
        const da = new Date(a.recordDate || a.date || a.createdAt || 0).getTime();
        const dbTime = new Date(b.recordDate || b.date || b.createdAt || 0).getTime();
        return dbTime - da;
      });
      callback(list);
    }, (err) => {
      console.warn('[Sales Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[Sales Subscription Init Error]:', err.message);
    return () => {};
  }
}

/**
 * Real-time listener for over & shortage resolutions
 */
export function subscribeToOverShortageResolutions(callback) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'over_shortage_resolutions');
    return onSnapshot(colRef, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    }, (err) => {
      console.warn('[OverShortage Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[OverShortage Subscription Init Error]:', err.message);
    return () => {};
  }
}

/**
 * Real-time listener for cashier daily reports
 */
export function subscribeToCashierReports(callback) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'cashier_daily_reports');
    return onSnapshot(colRef, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    }, (err) => {
      console.warn('[Cashier Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[Cashier Subscription Init Error]:', err.message);
    return () => {};
  }
}

/**
 * Real-time listener for expenses
 */
export function subscribeToExpenses(callback) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'expense_entries');
    return onSnapshot(colRef, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    }, (err) => {
      console.warn('[Expense Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[Expense Subscription Init Error]:', err.message);
    return () => {};
  }
}

/**
 * Real-time listener for purchases
 */
export function subscribeToPurchases(callback) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'purchases');
    return onSnapshot(colRef, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    }, (err) => {
      console.warn('[Purchase Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[Purchase Subscription Init Error]:', err.message);
    return () => {};
  }
}
