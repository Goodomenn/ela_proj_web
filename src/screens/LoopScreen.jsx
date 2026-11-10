import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, AlertCircle, Tag, CheckCircle } from 'lucide-react';
import { salesApi } from '../services/api';
import { useAuth, ROLES } from '../context/AuthContext';
import SalesCard from '../components/SalesCard';
import ImportModal from '../components/ImportModal';
import LateReasonModal from '../components/LateReasonModal';
import ManualEntryModal from '../components/ManualEntryModal';
import RbacRestrictedNotice from '../components/RbacRestrictedNotice';

export default function LoopScreen() {
  const { canAccessLoop, canImport, role } = useAuth();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [pendingParsedData, setPendingParsedData] = useState(null);
  const [isLateModalOpen, setIsLateModalOpen] = useState(false);

  useEffect(() => {
    if (canAccessLoop) {
      loadEntries();
    }
  }, [canAccessLoop, role]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await salesApi.getSales('LOOP');
      if (res && res.data) {
        setEntries(res.data);
      }
    } catch (e) {
      console.error('Error fetching LOOP sales:', e);
      showNotification('Failed to load LOOP sales from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  /**
   * Process parsed sales data and check if late
   */
  const processParsedData = (parsed) => {
    const docDate = new Date(parsed.recordDate);
    const now = new Date();

    const docDay = new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isLate = Math.floor((nowDay.getTime() - docDay.getTime()) / (1000 * 60 * 60 * 24)) > 1;

    if (isLate) {
      setPendingParsedData({ ...parsed, isLate: true });
      setIsLateModalOpen(true);
    } else {
      saveEntryToDb(parsed, null);
    }
  };

  /**
   * Save sales entry to backend and Firestore
   */
  const saveEntryToDb = async (parsed, delayReason = null) => {
    try {
      const now = new Date();
      const payload = {
        systemType: 'LOOP',
        recordDate: parsed.recordDate,
        submissionDate: now.toISOString(),
        field1Amount: parsed.field1Amount,
        field2Amount: parsed.field2Amount,
        totalSales: parsed.totalSales,
        importSource: parsed.formatType || parsed.importSource || 'Manual',
        delayReason: delayReason || ''
      };

      const res = await salesApi.createSale(payload);
      if (res && res.data) {
        setEntries(prev => [res.data, ...prev]);
        showNotification(
          `LOOP sale (${res.data.importSource}) saved to Firestore successfully!`,
          'success'
        );
      }
    } catch (error) {
      console.error('Save sale error:', error);
      showNotification(
        error.response?.data?.message || 'Error saving LOOP entry to database',
        'error'
      );
    } finally {
      setPendingParsedData(null);
      setIsLateModalOpen(false);
    }
  };

  // Automated API Sync
  const handleApiImport = async () => {
    try {
      const res = await salesApi.importApi('LOOP');
      if (res && res.data) {
        processParsedData(res.data);
      }
    } catch (e) {
      showNotification('Failed to fetch API sales data', 'error');
    }
  };

  // File Upload (Excel, CSV, PDF)
  const handleFileUpload = async (file) => {
    try {
      const res = await salesApi.importFile(file, 'LOOP');
      if (res && res.data) {
        processParsedData(res.data);
      }
    } catch (e) {
      showNotification(
        e.response?.data?.message || 'Error parsing uploaded file',
        'error'
      );
    }
  };

  // RBAC restriction check
  if (!canAccessLoop) {
    return (
      <RbacRestrictedNotice
        sectionTitle="LOOP Sales (Butchery & Liquor)"
        requiredRoleText="LOOP_MANAGER or ADMIN"
        recommendedRole={ROLES.LOOP_MANAGER}
      />
    );
  }

  const totalLoopRevenue = entries.reduce((acc, curr) => acc + (curr.totalSales || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2.5 animate-bounce-short ${
            notification.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Screen Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Tag className="w-6 h-6 text-teal-200" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              LOOP Sales
            </h2>
          </div>
          <p className="text-teal-200 text-sm mt-1.5 font-medium">
            Daily revenue manager for Butchery &amp; Liquor operations
          </p>

          <div className="mt-4 flex flex-wrap gap-4 items-center text-xs">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-teal-200 uppercase font-semibold">Total Revenue: </span>
              <span className="font-extrabold text-white text-sm">
                ${totalLoopRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-teal-200 uppercase font-semibold">Entries: </span>
              <span className="font-extrabold text-white text-sm">{entries.length}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadEntries}
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canImport ? (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 text-teal-700" />
              <span>Import LOOP Sales</span>
            </button>
          ) : (
            <div className="text-xs bg-amber-500/20 text-amber-200 px-4 py-2 rounded-xl border border-amber-400/30 font-semibold">
              Auditor (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* Sales Entries List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="font-medium text-sm">Synchronizing LOOP sales from Firestore...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">No LOOP Sales Recorded</h4>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Import your first daily sales record via automated API, Excel, CSV, or PDF.
          </p>
          {canImport && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-teal-700 transition-colors"
            >
              Start First Import
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(entry => (
            <SalesCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Modals */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        systemType="LOOP"
        onSelectApi={handleApiImport}
        onFileUpload={handleFileUpload}
        onSelectManual={() => setIsManualModalOpen(true)}
      />

      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        systemType="LOOP"
        onSubmit={(data) => {
          setIsManualModalOpen(false);
          processParsedData(data);
        }}
      />

      <LateReasonModal
        isOpen={isLateModalOpen}
        onClose={() => {
          setIsLateModalOpen(false);
          setPendingParsedData(null);
        }}
        parsedData={pendingParsedData}
        onConfirm={(reason) => {
          if (pendingParsedData) {
            saveEntryToDb(pendingParsedData, reason);
          }
        }}
      />
    </div>
  );
}
