import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, getDocs, query, where, doc, setDoc } from '../services/firebaseClient';
import { AppPermissions, getEffectivePermissions, getUserRoleNames } from '../services/rbacService';

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

  const [userPermissions, setUserPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('ela_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin' || parsed.role === 'ADMIN') {
          return new Set(AppPermissions.all);
        }
      }
    } catch (_) {}
    return new Set();
  });

  const [loading, setLoading] = useState(false);

  // Sync user state to localStorage and re-calculate effective permissions & role names from Firestore
  useEffect(() => {
    if (user) {
      localStorage.setItem('ela_active_user', JSON.stringify(user));

      if (user.role === 'admin' || user.role === 'ADMIN') {
        setUserPermissions(new Set(AppPermissions.all));
      } else {
        // Resolve permissions from Firestore
        getEffectivePermissions(user).then((permsSet) => {
          setUserPermissions(permsSet);
        }).catch((err) => {
          console.warn('[Permissions Refresh Notice]:', err.message);
          setUserPermissions(new Set());
        });

        // Resolve latest role names if not set
        getUserRoleNames(user).then((names) => {
          if (names && names.length > 0) {
            const label = names.join(', ');
            if (user.roleLabel !== label) {
              setUser(prev => prev ? ({ ...prev, roleLabel: label, roleNames: names }) : prev);
            }
          }
        }).catch(() => {});
      }
    } else {
      localStorage.removeItem('ela_active_user');
      setUserPermissions(new Set());
    }
  }, [user?.uid, user?.role, JSON.stringify(user?.roleIds)]);

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
      const names = await getUserRoleNames(user);
      if (names && names.length > 0) {
        const label = user.role === 'admin' ? 'ADMIN' : names.join(', ');
        setUser(prev => prev ? ({ ...prev, roleLabel: label, roleNames: names }) : prev);
      }
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const clean = username.trim();
      const cleanUnderscore = clean.replace(/\s+/g, '_');
      const cleanSpaces = clean.replace(/_/g, ' ');

      if (db) {
        // Fetch matching user (exact, underscore, or case-insensitive)
        let snap = await getDocs(query(collection(db, 'users'), where('username', '==', clean)));
        if (snap.empty && cleanUnderscore !== clean) {
          snap = await getDocs(query(collection(db, 'users'), where('username', '==', cleanUnderscore)));
        }

        let uDoc = null;
        let uid = null;

        if (!snap.empty) {
          uDoc = snap.docs[0].data();
          uid = snap.docs[0].id;
        } else {
          // Fallback case-insensitive search across users
          const allUsersSnap = await getDocs(collection(db, 'users'));
          const found = allUsersSnap.docs.find(d => {
            const u = (d.data().username || '').toLowerCase();
            return u === clean.toLowerCase() || 
                   u === cleanUnderscore.toLowerCase() || 
                   u === cleanSpaces.toLowerCase();
          });
          if (found) {
            uDoc = found.data();
            uid = found.id;
          }
        }

        if (uDoc) {
          if (password && uDoc.password && uDoc.password !== password) {
            throw new Error('Invalid password');
          }
          if (uDoc.status === 'pending') {
            throw new Error('Your account is pending admin approval.');
          }

          const roleNames = await getUserRoleNames(uDoc);
          const roleLabel = (uDoc.role === 'admin' || uDoc.role === 'ADMIN')
            ? 'ADMIN'
            : (roleNames.length > 0 ? roleNames.join(', ').toUpperCase() : 'STAFF');

          const loggedUser = {
            uid: uid,
            id: uid,
            username: uDoc.username,
            role: uDoc.role || 'user',
            status: uDoc.status || 'approved',
            displayName: `${uDoc.username} (${roleLabel})`,
            roleLabel: roleLabel,
            roleNames: roleNames,
            banks: uDoc.banks || ['Awash Bank', 'CBE', 'Telebirr'],
            roleIds: uDoc.roleIds || []
          };

          const perms = await getEffectivePermissions(loggedUser);
          setUserPermissions(perms);
          setUser(loggedUser);
          return loggedUser;
        }
      }
      
      // Fallback local demo account if no matching Firestore user found
      const localUser = {
        uid: `user_${Date.now()}`,
        username: clean,
        role: clean.toLowerCase().includes('admin') || clean.toLowerCase() === 'dani' ? 'admin' : 'user',
        status: 'approved',
        displayName: `${clean} (Active)`,
        roleLabel: clean.toLowerCase() === 'dani' ? 'ADMIN' : 'STAFF',
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
