import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, getDocs, query, where, doc, setDoc } from '../services/firebaseClient';
import { AppPermissions, getEffectivePermissions } from '../services/rbacService';

export { AppPermissions };

const DEFAULT_USER = {
  uid: 'Nu2RhLORCMbwUuAlumeU',
  username: 'dani',
  role: 'admin',
  status: 'approved',
  displayName: 'dani (Root Administrator)',
  roleLabel: 'ADMIN',
  banks: ['Awash Bank', 'Bank of Abyssinia', 'CBE', 'CBE Birr', 'Telebirr'],
  roleIds: []
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
  const [userPermissions, setUserPermissions] = useState(new Set(AppPermissions.all));
  const [loading, setLoading] = useState(false);

  // Sync user state to localStorage and re-calculate effective permissions from Firestore
  useEffect(() => {
    if (user) {
      localStorage.setItem('ela_active_user', JSON.stringify(user));
      // Resolve permissions from Firestore
      getEffectivePermissions(user).then((permsSet) => {
        setUserPermissions(permsSet);
      }).catch((err) => {
        console.warn('[Permissions Refresh Notice]:', err.message);
        if (user.role === 'admin') {
          setUserPermissions(new Set(AppPermissions.all));
        }
      });
    } else {
      localStorage.removeItem('ela_active_user');
      setUserPermissions(new Set());
    }
  }, [user]);

  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  const hasPermission = (permission) => {
    if (!user) return false;
    if (isAdmin) return true;
    return userPermissions.has(permission);
  };

  const hasAnyPermission = (permissions = []) => {
    if (!user) return false;
    if (isAdmin) return true;
    return permissions.some(p => userPermissions.has(p));
  };

  const refreshPermissions = async () => {
    if (user) {
      const perms = await getEffectivePermissions(user);
      setUserPermissions(perms);
    }
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
            banks: uDoc.banks || ['Awash Bank', 'CBE', 'Telebirr'],
            roleIds: uDoc.roleIds || []
          };
          setUser(loggedUser);
          const perms = await getEffectivePermissions(loggedUser);
          setUserPermissions(perms);
          return loggedUser;
        }
      }
      
      // Fallback local demo account if no Firestore connection
      const localUser = {
        uid: `user_${Date.now()}`,
        username: username.trim(),
        role: username.toLowerCase().includes('admin') || username.toLowerCase() === 'dani' ? 'admin' : 'user',
        status: 'approved',
        displayName: `${username} (Active)`,
        roleLabel: username.toLowerCase() === 'dani' ? 'ADMIN' : 'STAFF',
        banks: ['CBE', 'Telebirr'],
        roleIds: []
      };
      setUser(localUser);
      setUserPermissions(localUser.role === 'admin' ? new Set(AppPermissions.all) : new Set());
      return localUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserPermissions(new Set());
    localStorage.removeItem('ela_active_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAdmin,
        role: user?.role || 'user',
        canAccessCenet: hasPermission(AppPermissions.salesCenet),
        canAccessLoop: hasPermission(AppPermissions.salesLoop),
        canImport: isAdmin || hasPermission(AppPermissions.salesCenet) || hasPermission(AppPermissions.salesLoop),
        permissions: userPermissions,
        hasPermission,
        hasAnyPermission,
        refreshPermissions,
        login,
        logout,
        resetToAdmin: () => setUser(DEFAULT_USER),
        loading
      }}
    >
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
