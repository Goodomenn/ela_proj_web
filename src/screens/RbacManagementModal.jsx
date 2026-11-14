import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Check, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  Search, 
  AlertTriangle,
  Lock,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { 
  AppPermissions, 
  subscribeToRoles, 
  subscribeToUsers, 
  createRole, 
  updateRoleName, 
  updateRolePermissions, 
  deleteRole, 
  updateUserRoles 
} from '../services/rbacService';
import { useAuth } from '../context/AuthContext';

export default function RbacManagementModal({ isOpen, onClose }) {
  const { user: currentUser, refreshPermissions } = useAuth();
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'users'
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isSavingPerms, setIsSavingPerms] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Role / Rename state
  const [showNewRoleInput, setShowNewRoleInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');
  const [deleteConfirmationRole, setDeleteConfirmationRole] = useState(null);

  // User search
  const [userSearch, setUserSearch] = useState('');

  // Subscribe to real Firestore roles and users collections
  useEffect(() => {
    if (!isOpen) return;

    const unsubRoles = subscribeToRoles((rolesList) => {
      setRoles(rolesList);
      if (!selectedRole && rolesList.length > 0) {
        setSelectedRole(rolesList[0]);
        setSelectedPermissions(rolesList[0].permissions || []);
      } else if (selectedRole) {
        const updated = rolesList.find(r => r.id === selectedRole.id);
        if (updated) {
          setSelectedRole(updated);
        }
      }
    });

    const unsubUsers = subscribeToUsers((usersList) => {
      setUsers(usersList);
    });

    return () => {
      unsubRoles();
      unsubUsers();
    };
  }, [isOpen]);

  // When selected role changes, update local permissions array
  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissions(selectedRole.permissions || []);
      setSaveSuccess(false);
    }
  }, [selectedRole?.id]);

  if (!isOpen) return null;

  // Role CRUD Handlers
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      await createRole(newRoleName.trim());
      setNewRoleName('');
      setShowNewRoleInput(false);
    } catch (err) {
      alert('Failed to create role: ' + err.message);
    }
  };

  const handleUpdateRoleName = async (roleId) => {
    if (!editingRoleName.trim()) return;
    try {
      await updateRoleName(roleId, editingRoleName.trim());
      setEditingRoleId(null);
      setEditingRoleName('');
    } catch (err) {
      alert('Failed to update role name: ' + err.message);
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await deleteRole(roleId);
      setDeleteConfirmationRole(null);
      if (selectedRole?.id === roleId) {
        setSelectedRole(roles.find(r => r.id !== roleId) || null);
      }
    } catch (err) {
      alert('Failed to delete role: ' + err.message);
    }
  };

  const handleTogglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissions([...AppPermissions.all]);
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSavingPerms(true);
    try {
      await updateRolePermissions(selectedRole.id, selectedPermissions);
      setSaveSuccess(true);
      await refreshPermissions();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save permissions: ' + err.message);
    } finally {
      setIsSavingPerms(false);
    }
  };

  // User Role Assignment Handler
  const handleToggleUserRole = async (targetUser, roleId) => {
    const currentRoles = targetUser.roleIds || [];
    let updated = [];
    if (currentRoles.includes(roleId)) {
      updated = currentRoles.filter(id => id !== roleId);
    } else {
      updated = [...currentRoles, roleId];
    }

    try {
      await updateUserRoles(targetUser.uid, updated);
      await refreshPermissions();
    } catch (err) {
      alert('Failed to update user roles: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    const name = (u.username || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    return name.includes(q) || role.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-[#161C28] border border-[#1E2635] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1E2635] flex items-center justify-between bg-[#0D121D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Access Control & RBAC Policy Manager
                </h3>
                <span className="text-[10px] font-bold text-[#00FF94] bg-[#00FF94]/10 border border-[#00FF94]/30 px-2 py-0.5 rounded">
                  LIVE FIRESTORE
                </span>
              </div>
              <p className="text-xs text-[#8E99AE]">
                Manage role-based access control policies, permissions matrix, and employee assignments
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-[#8E99AE] hover:text-white hover:bg-[#1E2635] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-[#1E2635] bg-[#161C28]">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'roles'
                  ? 'border-[#00D1FF] text-[#00D1FF]'
                  : 'border-transparent text-[#8E99AE] hover:text-white'
              }`}
            >
              <Sliders size={16} />
              <span>Roles & Feature Permissions ({roles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-[#00D1FF] text-[#00D1FF]'
                  : 'border-transparent text-[#8E99AE] hover:text-white'
              }`}
            >
              <Users size={16} />
              <span>User Role Assignments ({users.length})</span>
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search employee..."
                className="pl-8 pr-3 py-1 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs text-white focus:outline-none focus:border-[#00D1FF]"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Roles & Feature Permissions Matrix */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left 4 Cols: Roles List & CRUD */}
            <div className="md:col-span-4 bg-[#0D121D] p-4 border-r border-[#1E2635] flex flex-col justify-between overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E2635]">
                  <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
                    Configured Roles
                  </span>
                  <button
                    onClick={() => setShowNewRoleInput(true)}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#00D1FF] hover:underline"
                  >
                    <Plus size={12} />
                    <span>Create Role</span>
                  </button>
                </div>

                {/* Create Role Form */}
                {showNewRoleInput && (
                  <form onSubmit={handleCreateRole} className="p-3 rounded-xl bg-[#161C28] border border-[#00D1FF]/40 space-y-2">
                    <span className="text-[10px] font-bold text-white uppercase block">New Role Name</span>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="e.g. Lead Auditor..."
                      autoFocus
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs text-white focus:outline-none focus:border-[#00D1FF]"
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => { setShowNewRoleInput(false); setNewRoleName(''); }}
                        className="px-2.5 py-1 rounded-lg text-xs text-[#8E99AE] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-[#00D1FF] text-[#0D121D] text-xs font-bold"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                {/* Roles List */}
                <div className="space-y-2">
                  {roles.length === 0 ? (
                    <p className="text-xs text-[#8E99AE] italic py-4 text-center">No roles defined in Firestore.</p>
                  ) : (
                    roles.map((role) => {
                      const isSelected = selectedRole?.id === role.id;
                      const isEditing = editingRoleId === role.id;

                      return (
                        <div
                          key={role.id}
                          onClick={() => {
                            setSelectedRole(role);
                            setSelectedPermissions(role.permissions || []);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? 'bg-[#161C28] border-[#00D1FF] shadow-lg shadow-[#00D1FF]/10'
                              : 'bg-[#161C28]/60 border-[#1E2635] hover:border-[#1E2635]/80 hover:bg-[#161C28]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editingRoleName}
                                  onChange={(e) => setEditingRoleName(e.target.value)}
                                  className="flex-1 px-2 py-1 rounded bg-[#0D121D] border border-[#00D1FF] text-xs text-white"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateRoleName(role.id)}
                                  className="p-1 text-[#00FF94] hover:bg-[#00FF94]/10 rounded"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingRoleId(null)}
                                  className="p-1 text-[#8E99AE] hover:text-white rounded"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#8E99AE] group-hover:text-white'}`}>
                                  {role.name}
                                </h4>
                                <span className="text-[10px] text-[#8E99AE] mt-0.5 block">
                                  {(role.permissions || []).length} features enabled
                                </span>
                              </>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRoleId(role.id);
                                  setEditingRoleName(role.name);
                                }}
                                title="Rename role"
                                className="p-1 text-[#8E99AE] hover:text-white rounded"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmationRole(role);
                                }}
                                title="Delete role"
                                className="p-1 text-[#8E99AE] hover:text-[#FF4D4D] rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Roles summary pill */}
              <div className="pt-3 border-t border-[#1E2635] text-[11px] text-[#8E99AE] flex items-center justify-between">
                <span>Total Defined Roles</span>
                <span className="font-bold text-white">{roles.length}</span>
              </div>
            </div>

            {/* Right 8 Cols: Permissions Matrix */}
            <div className="md:col-span-8 p-6 flex flex-col justify-between overflow-y-auto space-y-5 bg-[#161C28]">
              {selectedRole ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2635]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#8E99AE] uppercase">Configuring:</span>
                        <h4 className="text-base font-black text-white">{selectedRole.name}</h4>
                      </div>
                      <p className="text-xs text-[#8E99AE] mt-0.5">
                        {selectedPermissions.length} of {AppPermissions.all.length} granular capabilities granted
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#8E99AE] hover:text-white rounded-lg bg-[#0D121D] border border-[#1E2635]"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAll}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#8E99AE] hover:text-white rounded-lg bg-[#0D121D] border border-[#1E2635]"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={handleSavePermissions}
                        disabled={isSavingPerms}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0D121D] text-xs font-bold transition-all shadow-md shadow-[#00D1FF]/20"
                      >
                        {saveSuccess ? (
                          <>
                            <CheckCircle2 size={14} className="text-[#0D121D]" />
                            <span>Saved to Firestore!</span>
                          </>
                        ) : (
                          <>
                            <Save size={14} />
                            <span>{isSavingPerms ? 'Saving...' : 'Save Permissions'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Permissions Categories Matrix */}
                  <div className="space-y-5 flex-1 overflow-y-auto pr-1">
                    {AppPermissions.categories.map((category, catIdx) => (
                      <div key={catIdx} className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />
                          <h5 className="text-xs font-bold text-[#00D1FF] uppercase tracking-wider">
                            {category.name}
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {category.permissions.map((perm) => {
                            const isChecked = selectedPermissions.includes(perm.id);

                            return (
                              <div
                                key={perm.id}
                                onClick={() => handleTogglePermission(perm.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                                  isChecked
                                    ? 'bg-[#0D121D] border-[#00D1FF]/50 shadow-sm'
                                    : 'bg-[#0D121D]/60 border-[#1E2635] hover:border-[#1E2635]/80'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}} // handled by parent onClick
                                  className="mt-0.5 rounded border-[#1E2635] text-[#00D1FF] focus:ring-0 cursor-pointer"
                                />

                                <div className="min-w-0 flex-1">
                                  <span className={`text-xs font-bold block ${isChecked ? 'text-white' : 'text-[#8E99AE]'}`}>
                                    {perm.label}
                                  </span>
                                  <span className="text-[10px] text-[#8E99AE] mt-0.5 block leading-tight">
                                    {perm.desc}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-[#8E99AE]">
                  <ShieldAlert size={36} className="mb-2 text-[#8E99AE]" />
                  <p className="text-sm">Select or create a role to configure permissions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: User Role Assignments */}
        {activeTab === 'users' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-[#0D121D]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
              <div>
                <h4 className="text-sm font-bold text-white">Employee Role Assignments</h4>
                <p className="text-xs text-[#8E99AE]">
                  Click role tags to grant or revoke specific roles for each verified user
                </p>
              </div>

              <span className="text-xs text-[#00D1FF] font-semibold">
                {filteredUsers.length} Users Listed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((targetUser) => {
                const isAdmin = targetUser.role === 'admin' || targetUser.role === 'ADMIN';
                const userRoleIds = targetUser.roleIds || [];

                return (
                  <div
                    key={targetUser.uid}
                    className="p-5 bg-[#161C28] border border-[#1E2635] rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm uppercase ${
                          isAdmin 
                            ? 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]' 
                            : 'bg-[#00D1FF]/10 border-[#00D1FF]/30 text-[#00D1FF]'
                        }`}>
                          {(targetUser.username || 'U')[0]}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">
                            {targetUser.username}
                          </span>
                          <span className="text-[10px] text-[#8E99AE]">
                            Status: <strong className="text-[#00FF94]">{targetUser.status || 'approved'}</strong>
                          </span>
                        </div>
                      </div>

                      {isAdmin ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#FF4D4D]/15 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-bold uppercase tracking-wider">
                          Root Admin
                        </span>
                      ) : (
                        <span className="text-xs text-[#8E99AE]">
                          {userRoleIds.length} {userRoleIds.length === 1 ? 'Role' : 'Roles'} Assigned
                        </span>
                      )}
                    </div>

                    {isAdmin ? (
                      <div className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] text-xs text-[#8E99AE]">
                        Root Administrator has unrestricted access to all 27 capabilities and system data.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                          Toggle Assigned Roles:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {roles.map((r) => {
                            const isAssigned = userRoleIds.includes(r.id);

                            return (
                              <button
                                key={r.id}
                                onClick={() => handleToggleUserRole(targetUser, r.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                  isAssigned
                                    ? 'bg-[#00D1FF]/20 border border-[#00D1FF]/60 text-[#00D1FF]'
                                    : 'bg-[#0D121D] border border-[#1E2635] text-[#8E99AE] hover:text-white'
                                }`}
                              >
                                {isAssigned && <Check size={12} />}
                                <span>{r.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delete Role Confirmation Dialog */}
        {deleteConfirmationRole && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#161C28] border border-[#FF4D4D]/40 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-[#FF4D4D]">
                <AlertTriangle size={24} />
                <h4 className="text-sm font-bold text-white">Delete Role Confirmation</h4>
              </div>
              <p className="text-xs text-[#8E99AE] leading-relaxed">
                Are you sure you want to delete <strong className="text-white">"{deleteConfirmationRole.name}"</strong>? This will revoke all permissions attached to this role for any assigned users.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2635]">
                <button
                  onClick={() => setDeleteConfirmationRole(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0D121D] text-xs text-[#8E99AE] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRole(deleteConfirmationRole.id)}
                  className="px-4 py-1.5 rounded-xl bg-[#FF4D4D] text-white text-xs font-bold"
                >
                  Delete Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2635] flex items-center justify-between bg-[#0D121D]">
          <span className="text-xs text-[#8E99AE]">
            Changes to roles and user assignments synchronize instantly with all terminals.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#161C28] hover:bg-[#1E2635] border border-[#1E2635] text-xs font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
