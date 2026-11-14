import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, getDocs, query, where, doc, setDoc } from '../services/firebaseClient';

export const AppPermissions = {
  dashboard: 'dashboard',
  pos: 'pos',
  transactions: 'transactions',
  auditHub: 'audit_hub',
  alerts: 'alerts',
  approvals: 'approvals',
  fbHub: 'fb_hub',
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
};

const DEFAULT_USER = {
  uid: 'admin_dani',
  username: 'dani',
  role: 'admin',
  status: 'approved',
  displayName: 'dani (Manager)',
  roleLabel: 'MANAGER',
  banks: ['Awash Bank', 'Bank of Abyssinia', 'CBE', 'CBE Birr', 'Telebirr']
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ela_active_user');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_USER;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ela_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ela_active_user');
    }
  }, [user]);

  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  const hasPermission = (permission) => {
    if (!user) return false;
    if (isAdmin) return true;
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    return true; // default open for standard demo/web access
  };

  const hasAnyPermission = (permissions = []) => {
    if (isAdmin) return true;
    return permissions.some(p => hasPermission(p));
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      if (db) {
        const q = query(collection(db, 'users'), where('username', '==', username.trim()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const uDoc = snap.docs[0].data();
          if (uDoc.password && uDoc.password !== password) {
            throw new Error('Invalid password');
          }
          const loggedUser = {
            uid: snap.docs[0].id,
            username: uDoc.username,
            role: uDoc.role || 'user',
            status: uDoc.status || 'approved',
            displayName: `${uDoc.username} (${uDoc.role === 'admin' ? 'Manager' : 'Staff'})`,
            roleLabel: (uDoc.role || 'STAFF').toUpperCase(),
            banks: uDoc.banks || ['Awash Bank', 'CBE', 'Telebirr']
          };
          setUser(loggedUser);
          return loggedUser;
        }
      }
      // Fallback local auth for instant login
      const fallbackUser = {
        uid: `user_${username.toLowerCase()}`,
        username,
        role: username.toLowerCase().includes('dani') ? 'admin' : 'staff',
        status: 'approved',
        displayName: `${username} (${username.toLowerCase().includes('dani') ? 'Manager' : 'Staff'})`,
        roleLabel: username.toLowerCase().includes('dani') ? 'MANAGER' : 'STAFF',
        banks: ['Awash Bank', 'Bank of Abyssinia', 'CBE', 'CBE Birr', 'Telebirr']
      };
      setUser(fallbackUser);
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ela_active_user');
  };

  const resetToAdmin = () => {
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      loading,
      hasPermission,
      hasAnyPermission,
      login,
      logout,
      resetToAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
