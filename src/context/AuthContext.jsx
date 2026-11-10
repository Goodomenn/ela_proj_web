import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'ADMIN',
  CENET_MANAGER: 'CENET_MANAGER',
  LOOP_MANAGER: 'LOOP_MANAGER',
  AUDITOR: 'AUDITOR'
};

export const PRESET_USERS = [
  {
    id: 'user-admin-1',
    name: 'Administrator',
    email: 'admin@ela.com',
    role: ROLES.ADMIN,
    description: 'Full access to CENET, LOOP & Audit Logs'
  },
  {
    id: 'user-cenet-1',
    name: 'CENET Operator',
    email: 'cenet@ela.com',
    role: ROLES.CENET_MANAGER,
    description: 'Restaurant & Lounge access only'
  },
  {
    id: 'user-loop-1',
    name: 'LOOP Operator',
    email: 'loop@ela.com',
    role: ROLES.LOOP_MANAGER,
    description: 'Butchery & Liquor access only'
  },
  {
    id: 'user-auditor-1',
    name: 'Compliance Auditor',
    email: 'auditor@ela.com',
    role: ROLES.AUDITOR,
    description: 'Read-only access to Audit Logs'
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(PRESET_USERS[0]);
  const [availableUsers, setAvailableUsers] = useState(PRESET_USERS);
  const [loading, setLoading] = useState(false);

  // Initialize session with Admin
  useEffect(() => {
    switchUser(PRESET_USERS[0].id);
  }, []);

  const switchUser = async (userId) => {
    setLoading(true);
    try {
      const target = PRESET_USERS.find(u => u.id === userId) || PRESET_USERS[0];
      const res = await authApi.login(target.id);
      if (res && res.token) {
        localStorage.setItem('ela_token', res.token);
        setCurrentUser(res.user);
      } else {
        setCurrentUser(target);
      }
    } catch (e) {
      console.warn('Backend login fallback to local user state:', e);
      const target = PRESET_USERS.find(u => u.id === userId) || PRESET_USERS[0];
      setCurrentUser(target);
    } finally {
      setLoading(false);
    }
  };

  /**
   * RBAC Permission check helpers
   */
  const canAccessCenet = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.CENET_MANAGER;
  const canAccessLoop = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.LOOP_MANAGER;
  const canImport = currentUser?.role !== ROLES.AUDITOR; // Auditor has read-only access
  const isAuditor = currentUser?.role === ROLES.AUDITOR;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        switchUser,
        loading,
        canAccessCenet,
        canAccessLoop,
        canImport,
        isAuditor,
        role: currentUser?.role || ROLES.ADMIN
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
