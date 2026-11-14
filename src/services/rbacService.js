import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where
} from './firebaseClient';

export const AppPermissions = {
  // Navigation & Screens
  dashboard: 'dashboard',
  pos: 'pos',
  transactions: 'transactions',
  auditHub: 'audit_hub',
  alerts: 'alerts',
  approvals: 'approvals',
  fbHub: 'fb_hub',

  // Specific Functional Permissions
  salesCenet: 'sales_cenet',
  salesLoop: 'sales_loop',
  
  purchaseView: 'purchase.view',
  purchaseEdit: 'purchase.edit',
  purchaseEnterLog: 'purchase.enter_log',
  
  goodsReceiving: 'goods_receiving',
  inventory: 'inventory',
  messages: 'messages',
  reports: 'reports',
  
  settingsView: 'settings.view',
  settingsEdit: 'settings.edit',
  settingsEraseData: 'settings.erase_all_data',
  
  rbacView: 'rbac.view',
  rbacEdit: 'rbac.edit',
  
  expenseEntry: 'expense_entry',
  expenseReports: 'expense_reports',
  fundManagement: 'fund_management',
  cashierEntry: 'cashier_entry',
  cashierReports: 'cashier_reports',
  myTransactions: 'my_transactions',

  all: [
    'dashboard', 'pos', 'transactions', 'audit_hub', 'alerts', 'approvals', 'fbHub',
    'sales_cenet', 'sales_loop',
    'purchase.view', 'purchase.edit', 'purchase.enter_log',
    'goods_receiving', 'inventory', 'messages', 'reports',
    'settings.view', 'settings.edit', 'settings.erase_all_data',
    'rbac.view', 'rbac.edit',
    'expense_entry', 'expense_reports', 'fund_management',
    'cashier_entry', 'cashier_reports', 'my_transactions'
  ],

  categories: [
    {
      name: 'Navigation & Core Hubs',
      permissions: [
        { id: 'dashboard', label: 'Access Dashboard', desc: 'Main liquidity overview and reconciliation analytics' },
        { id: 'pos', label: 'Access POS Ingestion', desc: 'Upload and parse CENET & LOOP sales files' },
        { id: 'transactions', label: 'Access Transaction History', desc: 'View bank ledger and SMS feed' },
        { id: 'audit_hub', label: 'Access Audit Log Hub', desc: 'Central audit intelligence screens' },
        { id: 'fb_hub', label: 'Access F&B Hub', desc: 'Food & beverage operational workflows' },
        { id: 'approvals', label: 'Manage User Approvals', desc: 'Approve or deny employee registration requests' }
      ]
    },
    {
      name: 'POS Register Sales',
      permissions: [
        { id: 'sales_cenet', label: 'CENET Sales Ingestion', desc: 'Upload and verify CENET restaurant registers' },
        { id: 'sales_loop', label: 'LOOP Sales Ingestion', desc: 'Upload and verify LOOP butchery registers' }
      ]
    },
    {
      name: 'Procurement & Inventory',
      permissions: [
        { id: 'purchase.view', label: 'View Purchase Reports', desc: 'Inspect historical vendor orders and prices' },
        { id: 'purchase.edit', label: 'Edit Pending Purchases', desc: 'Modify item lines in open orders' },
        { id: 'purchase.enter_log', label: 'Finalize Purchase Logs', desc: 'Submit and commit completed orders' },
        { id: 'goods_receiving', label: 'Goods Receiving Entry', desc: 'Inspect and confirm dock deliveries' },
        { id: 'inventory', label: 'Inventory Management', desc: 'Stock level verification and shelf audits' }
      ]
    },
    {
      name: 'Expenses & Cashier Sales',
      permissions: [
        { id: 'expense_entry', label: 'Expense Entry', desc: 'Log daily petty cash and operational spending' },
        { id: 'expense_reports', label: 'Expense Reports', desc: 'Review daily spending summaries' },
        { id: 'fund_management', label: 'Manage Allocated Funds', desc: 'Allocate petty cash and operational funds' },
        { id: 'cashier_entry', label: 'Cashier Sales Entry', desc: 'Manual shift drawer sales recording' },
        { id: 'cashier_reports', label: 'Cashier Sales Reports', desc: 'Daily cashier shortage and balance audits' }
      ]
    },
    {
      name: 'System, Security & Administration',
      permissions: [
        { id: 'settings.view', label: 'View App Settings', desc: 'Access hardware and daemon settings' },
        { id: 'settings.edit', label: 'Modify App Settings', desc: 'Change forwarding and hardware configs' },
        { id: 'settings.erase_all_data', label: 'Erase All Application Data (DANGER)', desc: 'Wipe cloud and local database records' },
        { id: 'rbac.view', label: 'View User Roles', desc: 'Inspect RBAC policies and assignments' },
        { id: 'rbac.edit', label: 'Modify Roles & Permissions', desc: 'Create, edit, and assign roles' },
        { id: 'messages', label: 'Bank Alerts & Raw SMS', desc: 'View raw forwarded telebirr and CBE SMS' },
        { id: 'my_transactions', label: 'My Bank Transactions', desc: 'Self-service transaction view' }
      ]
    }
  ],

  getLabel(permission) {
    for (const cat of this.categories) {
      const found = cat.permissions.find(p => p.id === permission);
      if (found) return found.label;
    }
    return permission.replace(/_/g, ' ').replace(/\./g, ' › ');
  }
};

/**
 * Real-time listener for roles collection from Firestore
 */
export function subscribeToRoles(callback) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'roles');
    return onSnapshot(colRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed Role',
        permissions: Array.isArray(doc.data().permissions) ? doc.data().permissions : []
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      callback(list);
    }, (err) => {
      console.warn('[Roles Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[Roles Subscription Init Error]:', err.message);
    return () => {};
  }
}

/**
 * Real-time listener for users collection from Firestore
 */
export function subscribeToUsers(callback) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'users');
    return onSnapshot(colRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        uid: doc.id,
        id: doc.id,
        ...doc.data()
      }));
      list.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
      callback(list);
    }, (err) => {
      console.warn('[Users Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[Users Subscription Init Error]:', err.message);
    return () => {};
  }
}

/**
 * Creates a new role document in Firestore
 */
export async function createRole(roleName) {
  if (!db || !roleName.trim()) return;
  const colRef = collection(db, 'roles');
  return await addDoc(colRef, {
    name: roleName.trim(),
    permissions: []
  });
}

/**
 * Updates a role's name in Firestore
 */
export async function updateRoleName(roleId, newName) {
  if (!db || !roleId || !newName.trim()) return;
  const docRef = doc(db, 'roles', roleId);
  return await updateDoc(docRef, {
    name: newName.trim()
  });
}

/**
 * Updates a role's permissions list in Firestore
 */
export async function updateRolePermissions(roleId, permissionsList) {
  if (!db || !roleId) return;
  const docRef = doc(db, 'roles', roleId);
  return await updateDoc(docRef, {
    permissions: permissionsList
  });
}

/**
 * Deletes a role from Firestore
 */
export async function deleteRole(roleId) {
  if (!db || !roleId) return;
  const docRef = doc(db, 'roles', roleId);
  return await deleteDoc(docRef);
}

/**
 * Updates a user's assigned roleIds array in Firestore
 */
export async function updateUserRoles(userId, roleIds) {
  if (!db || !userId) return;
  const docRef = doc(db, 'users', userId);
  return await updateDoc(docRef, {
    roleIds: roleIds
  });
}

/**
 * Calculates effective permissions for a user document from Firestore
 */
export async function getEffectivePermissions(userDoc) {
  if (!userDoc) return new Set();
  
  // If user is root admin, grant all permissions
  if (userDoc.role === 'admin' || userDoc.role === 'ADMIN') {
    return new Set(AppPermissions.all);
  }

  const roleIds = userDoc.roleIds || [];
  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    return new Set();
  }

  const permissions = new Set();
  if (!db) return permissions;

  for (const roleId of roleIds) {
    try {
      const roleSnap = await getDoc(doc(db, 'roles', roleId));
      if (roleSnap.exists()) {
        const perms = roleSnap.data().permissions || [];
        perms.forEach(p => permissions.add(p));
      }
    } catch (err) {
      console.warn(`[Effective Permissions Error for role ${roleId}]:`, err.message);
    }
  }

  return permissions;
}

/**
 * Subscribes to pending user registration requests in Firestore
 */
export function subscribeToPendingUsers(callback) {
  if (!db) return () => {};
  try {
    const q = query(collection(db, 'users'), where('status', '==', 'pending'));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        uid: doc.id,
        id: doc.id,
        ...doc.data()
      }));
      list.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
      callback(list);
    }, (err) => {
      console.warn('[Pending Users Subscription Error]:', err.message);
    });
  } catch (err) {
    console.warn('[Pending Users Subscription Init Error]:', err.message);
    return () => {};
  }
}

/**
 * Approves a pending user in Firestore
 */
export async function approveUser(userId) {
  if (!db || !userId) return;
  const docRef = doc(db, 'users', userId);
  return await updateDoc(docRef, {
    status: 'approved'
  });
}

/**
 * Rejects (deletes) a pending user registration in Firestore
 */
export async function rejectUser(userId) {
  if (!db || !userId) return;
  const docRef = doc(db, 'users', userId);
  return await deleteDoc(docRef);
}
