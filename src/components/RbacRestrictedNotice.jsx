import React from 'react';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';

export default function RbacRestrictedNotice({
  sectionTitle,
  requiredRoleText,
  recommendedRole
}) {
  const { switchUser, availableUsers, role } = useAuth();

  const handleRoleSwitch = () => {
    const target = availableUsers.find(u => u.role === recommendedRole) || availableUsers[0];
    switchUser(target.id);
  };

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-red-100 shadow-xl text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
        Access Restricted by RBAC Policy
      </h3>

      <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
        Your active role (<span className="font-bold text-red-600">{role}</span>) does not have authorization to view or manage <span className="font-semibold">{sectionTitle}</span>.
      </p>

      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
        <span className="font-semibold">Authorization Requirement:</span> {requiredRoleText}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleRoleSwitch}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>Switch to {recommendedRole === ROLES.ADMIN ? 'Administrator' : recommendedRole}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
