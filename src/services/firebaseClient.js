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
 * Normalizes bank name matching Flutter app logic
 */
export function normalizeBankName(name) {
  if (!name) return 'Unknown';
  const n = name.toString().trim().toUpperCase();
  if (n === 'CASH') return 'Cash';
  if (n === '127' || n === 'TELEBIRR') return 'Telebirr';
  if (n === 'CBE' || n.includes('COMMERCIAL BANK')) return 'CBE';
  if (n.includes('CBEBIRR') || n.includes('CBE BIRR')) return 'CBE Birr';
  if (n.includes('AWASH')) return 'Awash Bank';
  if (n.includes('ABYSSINIA') || n === 'BOA') return 'Bank of Abyssinia';
  return name.toString().trim();
}

/**
 * Extracts numeric balance from raw bank SMS text as fallback
 */
export function extractBalanceFromRawText(text) {
  if (!text || typeof text !== 'string') return 0;
  const m = text.match(/(?:current(?:\s+E-Money\s+Account)?\s+balance|balance\s+now|available\s+balance\s+is\s+now|account\s+balance)\s*(?:is|:)?\s*(?:ETB|Br\.?)?\s*([\d,]+\.?\d*)/i);
  if (m && m[1]) {
    const clean = m[1].replace(/,/g, '');
    const num = parseFloat(clean);
    if (!isNaN(num)) return num;
  }
  return 0;
}

/**
 * Normalizes raw Firestore transaction documents to match the Flutter app's schema
 */
export function normalizeTransaction(d, fallbackId) {
  const data = typeof d.data === 'function' ? d.data() : d;
  const docId = fallbackId || d.id || data.id || '';
  const rawMessage = data.rawText || data.rawBody || data.rawMessage || '';

  // 1. Amount in ETB: Flutter app stores totalAmountCents (integer)
  let amount = 0;
  if (data.totalAmountCents != null && Number(data.totalAmountCents) > 0) {
    amount = Number(data.totalAmountCents) / 100.0;
  } else if (data.totalAmount != null && Number(data.totalAmount) > 0) {
    amount = Number(data.totalAmount);
  } else if (data.amount != null && Number(data.amount) > 0) {
    amount = Number(data.amount);
  } else if (rawMessage) {
    const m = rawMessage.match(/(?:transferred|credited|debited|deposited|received|with)\s*(?:for\s+[^]+?\s+with)?\s*(?:ETB|Br\.?)?\s*([\d,]+\.?\d*)/i);
    if (m && m[1]) {
      const num = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(num)) amount = num;
    }
  }

  // 2. Current Balance
  let currentBalance = 0;
  if (data.currentBalanceCents != null && Number(data.currentBalanceCents) > 0) {
    currentBalance = Number(data.currentBalanceCents) / 100.0;
  } else if (data.currentBalance != null && Number(data.currentBalance) > 0) {
    currentBalance = Number(data.currentBalance);
  } else {
    currentBalance = extractBalanceFromRawText(rawMessage);
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

  // Validate date
  if (!dateObj || isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }

  // 4. Direction & Type: CREDITED/DEPOSITED are income (+), DEBITED/WITHDRAWN/TRANSFER are expense (-)
  const txType = (data.transactionType || '').toUpperCase();
  const isDebit = txType === 'DEBITED' || txType === 'WITHDRAWN' || txType === 'TRANSFER' || txType === 'FEE';
  const isCredit = txType === 'CREDITED' || txType === 'DEPOSITED';
  const isIncome = data.isIncome != null ? data.isIncome : (isCredit || !isDebit);

  // 5. Bank name normalization
  const bankName = normalizeBankName(data.bankName || data.senderNumber || 'Bank Transfer');

  const sender = data.sender || 'Unknown';
  const forwardedBy = data.forwardedBy || data.forwardedName || data.forwarderUsername || 'system';
  
  let referenceCode = data.referenceCode || '';
  if (!referenceCode || referenceCode === 'N/A') {
    if (rawMessage) {
      const m = rawMessage.match(/(?:transaction\s+number\s+is|Txn\s+ID:?|Ref:?|BranchReceipt\/)\s*([A-Z0-9]+)/i);
      if (m && m[1]) referenceCode = m[1];
      else referenceCode = 'N/A';
    } else {
      referenceCode = 'N/A';
    }
  }

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

/**
 * Default POS devices (2 for CENET, 2 for LOOP) matching phone app
 */
export const DEFAULT_POS_DEVICES = [
  { id: 'CENET_device_1', name: 'Main Dining Counter', type: 'CENET', location: 'Hall A', status: 'ONLINE', isSyncing: true },
  { id: 'CENET_device_2', name: 'VIP Lounge Counter', type: 'CENET', location: 'Lounge Area', status: 'ONLINE', isSyncing: true },
  { id: 'LOOP_device_1', name: 'Butchery Counter', type: 'LOOP', location: 'Counter 1', status: 'ONLINE', isSyncing: true },
  { id: 'LOOP_device_2', name: 'Liquor Counter', type: 'LOOP', location: 'Counter 2', status: 'ONLINE', isSyncing: true },
];

/**
 * Real-time listener for POS hardware devices (stored in pos_devices)
 */
export function subscribeToPosDevices(callback) {
  if (!db) {
    callback(DEFAULT_POS_DEVICES);
    return () => {};
  }
  try {
    const colRef = collection(db, 'pos_devices');
    return onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial default devices so CENET and LOOP both have their 2 devices
        try {
          for (const dev of DEFAULT_POS_DEVICES) {
            await setDoc(doc(db, 'pos_devices', dev.id), dev);
          }
        } catch (e) {
          console.warn('[POS Device Seed Error]:', e.message);
        }
        callback(DEFAULT_POS_DEVICES);
        return;
      }
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    }, (err) => {
      console.warn('[POS Device Subscription Error]:', err.message);
      callback(DEFAULT_POS_DEVICES);
    });
  } catch (err) {
    console.warn('[POS Device Subscription Init Error]:', err.message);
    callback(DEFAULT_POS_DEVICES);
    return () => {};
  }
}

/**
 * Save / Update a POS Device in Firestore
 */
export async function savePosDevice(device) {
  if (!db) return;
  const id = device.id || `${device.type}_${Date.now()}`;
  await setDoc(doc(db, 'pos_devices', id), {
    ...device,
    id,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Delete a POS Device from Firestore
 */
export async function deletePosDevice(deviceId) {
  if (!db) return;
  await deleteDoc(doc(db, 'pos_devices', deviceId));
}

/**
 * Fetch all transactions for a specific user and bank from Firestore
 */
export async function fetchTransactionsByUserAndBank(username, bankName) {
  if (!db || !username) return [];
  try {
    const q = query(
      collection(db, 'transactions'),
      where('forwardedBy', '==', username)
    );
    const snap = await getDocs(q);
    const all = snap.docs.map(d => normalizeTransaction(d));
    all.sort((a, b) => b.dateObj - a.dateObj);

    const normTarget = normalizeBankName(bankName).toUpperCase();

    const filtered = all.filter(tx => {
      const normTx = normalizeBankName(tx.bankName).toUpperCase();
      if (normTarget === 'TELEBIRR') {
        return normTx === 'TELEBIRR' || normTx === '127';
      }
      if (normTarget === 'CBE') {
        return (normTx === 'CBE' || normTx.includes('COMMERCIAL')) && !normTx.includes('BIRR');
      }
      if (normTarget === 'CBE BIRR' || normTarget === 'CBEBIRR') {
        return normTx.includes('BIRR');
      }
      if (normTarget === 'AWASH BANK') {
        return normTx.includes('AWASH');
      }
      if (normTarget === 'BANK OF ABYSSINIA') {
        return normTx.includes('ABYSSINIA') || normTx === 'BOA';
      }
      if (normTarget === 'CASH') {
        return normTx === 'CASH';
      }
      return normTx === normTarget;
    });

    return filtered;
  } catch (err) {
    console.warn('[Fetch Transactions by User and Bank Error]:', err.message);
    return [];
  }
}

/**
 * Calculates the opening/closing balance before a given date string (YYYY-MM-DD)
 * Returns the currentBalance of the most recent transaction prior to that date.
 */
export function getClosingBalanceBefore(transactions, targetDateStr) {
  if (!transactions || transactions.length === 0 || !targetDateStr) return 0;
  
  // Transactions are sorted descending by dateObj
  for (const tx of transactions) {
    if (!tx.dateObj) continue;
    const y = tx.dateObj.getFullYear();
    const m = String(tx.dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(tx.dateObj.getDate()).padStart(2, '0');
    const txDateStr = `${y}-${m}-${d}`;
    
    if (txDateStr < targetDateStr && tx.currentBalance > 0) {
      return tx.currentBalance;
    }
  }
  return 0;
}



