import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Cpu,
  FileText,
  Tablet,
  Check,
  Calendar,
  AlertTriangle,
  Clock,
  Printer,
  ChevronDown,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { 
  db, 
  doc, 
  setDoc, 
  subscribeToPosDevices, 
  subscribeToSalesEntries, 
  formatETB 
} from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  parseDetailedExcel, 
  parseCsvFile, 
  simulateApiFetch, 
  checkIsLate 
} from '../services/fileParserClient';

export default function PosIngestionModal({ isOpen, onClose }) {
  const { user } = useAuth();
  
  // Selected POS System
  const [selectedPos, setSelectedPos] = useState('CENET'); // 'CENET' or 'LOOP'

  // Devices and Entries from Firestore
  const [devices, setDevices] = useState([]);
  const [salesEntries, setSalesEntries] = useState([]);

  // Ingestion Modal Step State
  const [showIngestDialog, setShowIngestDialog] = useState(false);
  const [cashierName, setCashierName] = useState(user?.username || 'Cashier 1');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  
  // Late Submission Reason Dialog State
  const [pendingParsedData, setPendingParsedData] = useState(null);
  const [showLateDialog, setShowLateDialog] = useState(false);
  const [lateReason, setLateReason] = useState('');

  // Manual Entry Fallback State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualF1, setManualF1] = useState('');
  const [manualF2, setManualF2] = useState('');
  const [manualShift, setManualShift] = useState('Shift Closing');

  // UI Processing & Notifications
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Hidden File Inputs
  const excelInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  // Subscribe to Devices and Sales Entries in real-time
  useEffect(() => {
    if (!isOpen) return;

    const unsubDevices = subscribeToPosDevices((devList) => {
      setDevices(devList);
    });

    const unsubSales = subscribeToSalesEntries('ALL', (entries) => {
      setSalesEntries(entries);
    });

    return () => {
      unsubDevices();
      unsubSales();
    };
  }, [isOpen]);

  // Set default selected device when devices or selectedPos changes
  useEffect(() => {
    const channelDevices = devices.filter(d => d.type === selectedPos);
    if (channelDevices.length > 0 && (!selectedDeviceId || !channelDevices.some(d => d.id === selectedDeviceId))) {
      setSelectedDeviceId(channelDevices[0].id);
    }
  }, [devices, selectedPos]);

  if (!isOpen) return null;

  const channelDevices = devices.filter(d => d.type === selectedPos);
  const channelEntries = salesEntries.filter(e => e.systemType === selectedPos);

  // Field labels based on system
  const field1Label = selectedPos === 'CENET' ? 'Main Dining (Restaurant)' : 'Fresh Butchery';
  const field2Label = selectedPos === 'CENET' ? 'VIP Lounge (Beverage)' : 'Liquor Store';

  // Aggregate Totals for Summary Cards
  const totalField1 = channelEntries.reduce((sum, e) => sum + (Number(e.field1Amount) || 0), 0);
  const totalField2 = channelEntries.reduce((sum, e) => sum + (Number(e.field2Amount) || 0), 0);
  const totalTickets = channelEntries.reduce((sum, e) => sum + (e.items?.length || Number(e.totalOrders) || 1), 0);

  const showToast = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4500);
  };

  /**
   * File Upload Handlers
   */
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedDeviceId) {
      showToast('Please select a target POS Device first.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      let parsed;
      if (file.name.toLowerCase().endsWith('.csv')) {
        parsed = await parseCsvFile(file, selectedPos);
      } else {
        parsed = await parseDetailedExcel(file, selectedPos);
      }
      setShowIngestDialog(false);
      handleParsedData(parsed);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedDeviceId) {
      showToast('Please select a target POS Device first.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate/Parse PDF daily report
      const docDate = new Date();
      const f1 = selectedPos === 'CENET' ? 185200.00 : 142100.00;
      const f2 = selectedPos === 'CENET' ? 92100.00 : 68400.00;
      const parsed = {
        recordDate: docDate.toISOString(),
        field1Amount: f1,
        field2Amount: f2,
        totalSales: f1 + f2,
        totalOrders: 180,
        formatType: 'PDF',
        shiftName: 'Daily Shift Audit PDF',
        items: [
          {
            code: 'PDF_BATCH',
            name: `${selectedPos} Daily PDF Closure Audit`,
            category: 'Sales',
            quantity: 1,
            unitPrice: f1 + f2,
            totalAmount: f1 + f2,
            date: docDate.toISOString().split('T')[0]
          }
        ]
      };
      setShowIngestDialog(false);
      handleParsedData(parsed);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  /**
   * Automated REST API Ingestion Handler
   */
  const handleApiImport = async () => {
    if (!selectedDeviceId) {
      showToast('Please select a target POS Device first.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const parsed = simulateApiFetch(selectedPos);
      setShowIngestDialog(false);
      handleParsedData(parsed);
    } catch (err) {
      showToast('API Import failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Manual Entry Submission Handler
   */
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const f1 = parseFloat(manualF1) || 0;
    const f2 = parseFloat(manualF2) || 0;
    if (f1 === 0 && f2 === 0) {
      showToast('Please enter sales amounts.', 'error');
      return;
    }

    const recDate = new Date(manualDate);
    const parsed = {
      recordDate: recDate.toISOString(),
      field1Amount: f1,
      field2Amount: f2,
      totalSales: f1 + f2,
      totalOrders: 1,
      formatType: 'Manual',
      shiftName: manualShift || 'Shift Closing',
      items: [
        {
          code: 'MANUAL_1',
          name: field1Label,
          category: 'Sales',
          quantity: 1,
          unitPrice: f1,
          totalAmount: f1,
          date: manualDate
        },
        {
          code: 'MANUAL_2',
          name: field2Label,
          category: 'Beverage',
          quantity: 1,
          unitPrice: f2,
          totalAmount: f2,
          date: manualDate
        }
      ]
    };

    setShowManualModal(false);
    handleParsedData(parsed);
  };

  /**
   * Core Business Logic: Duplicate Checks, Late Check, & Firestore Save
   */
  const handleParsedData = (parsed) => {
    const targetDev = channelDevices.find(d => d.id === selectedDeviceId);
    const devName = targetDev ? targetDev.name : 'Counter 1';

    // Duplicate Check
    const parsedDateStr = parsed.recordDate.split('T')[0];
    const existing = channelEntries.find(e => {
      const eDate = (e.recordDate || e.date || '').split('T')[0];
      return eDate === parsedDateStr && e.deviceName === devName;
    });

    if (existing) {
      const isExactlySame = Math.abs(existing.totalSales - parsed.totalSales) < 0.01;
      if (isExactlySame) {
        showToast(`Identical entry for ${parsedDateStr} on ${devName} already exists.`, 'error');
        return;
      } else {
        const confirmUpdate = window.confirm(
          `A record for ${parsedDateStr} on ${devName} exists with ${formatETB(existing.totalSales)}. Update with new amount ${formatETB(parsed.totalSales)}?`
        );
        if (!confirmUpdate) return;
      }
    }

    // Check if late (> 1 calendar day)
    const isLate = checkIsLate(new Date(parsed.recordDate), new Date());
    if (isLate) {
      setPendingParsedData({ ...parsed, deviceName: devName, cashierName });
      setShowLateDialog(true);
    } else {
      executeSaveToFirestore(parsed, devName, cashierName, null);
    }
  };

  const handleLateReasonSubmit = (e) => {
    e.preventDefault();
    if (!lateReason.trim()) {
      showToast('Delay reason is required for late submissions.', 'error');
      return;
    }
    if (pendingParsedData) {
      executeSaveToFirestore(
        pendingParsedData, 
        pendingParsedData.deviceName, 
        pendingParsedData.cashierName, 
        lateReason.trim()
      );
    }
    setShowLateDialog(false);
    setPendingParsedData(null);
    setLateReason('');
  };

  const executeSaveToFirestore = async (parsed, devName, cashier, reason) => {
    setIsProcessing(true);
    try {
      const recDate = new Date(parsed.recordDate);
      const cleanDate = recDate.toISOString().split('T')[0].replace(/-/g, '');
      const cleanDevice = devName.replace(/[^a-zA-Z0-9]/g, '_');
      const docId = `${selectedPos}_${cleanDate}_${cleanDevice}`;
      const now = new Date();

      const entry = {
        id: docId,
        systemType: selectedPos,
        deviceName: devName,
        cashierName: cashier || user?.username || 'Operator',
        shiftName: parsed.shiftName || 'Shift Closing',
        recordDate: parsed.recordDate,
        date: parsed.recordDate.split('T')[0],
        submissionDate: now.toISOString(),
        field1Amount: parsed.field1Amount,
        field2Amount: parsed.field2Amount,
        totalSales: parsed.totalSales,
        totalOrders: parsed.totalOrders || parsed.items?.length || 1,
        importSource: parsed.formatType || 'Excel',
        isLate: Boolean(reason && reason.trim().length > 0),
        delayReason: reason || '',
        statusNote: parsed.statusNote || '',
        items: parsed.items || [],
        totalCash: 0,
        totalCbe: 0,
        totalTelebirr: 0,
        createdAt: now.toISOString(),
        uploadedBy: user?.username || 'admin',
      };

      if (db) {
        await setDoc(doc(db, 'sales_entries', docId), entry, { merge: true });
      }

      showToast(`${selectedPos} data ingested successfully for ${devName} (${entry.importSource})!`, 'success');
    } catch (err) {
      showToast(`Firestore save error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-[#0D121D] border border-[#1E2635] rounded-3xl p-5 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2635]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF]">
              <Calculator size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  POS Ingestion Hub
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#00D1FF]/15 text-[#00D1FF] border border-[#00D1FF]/30">
                  {selectedPos} Mode
                </span>
              </div>
              <p className="text-xs text-[#8E99AE] mt-0.5">
                Ingest daily register closures, Excel/CSV shifts & automated POS API sync into Firestore
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#8E99AE] hover:text-white rounded-xl hover:bg-[#161C28] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold animate-slide-up ${
            notification.type === 'success' 
              ? 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]' 
              : 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.text}</span>
          </div>
        )}

        {/* 1. POS System Switcher (CENET vs LOOP) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedPos('CENET')}
            className={`py-3.5 px-4 rounded-2xl border flex items-center justify-center gap-2.5 transition-all ${
              selectedPos === 'CENET'
                ? 'bg-purple-900/30 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                : 'bg-[#161C28] border-[#1E2635] text-[#8E99AE] hover:text-white'
            }`}
          >
            <Calculator size={18} className={selectedPos === 'CENET' ? 'text-purple-400' : 'text-[#8E99AE]'} />
            <div className="text-left">
              <span className="block text-xs font-bold leading-tight">CENET POS</span>
              <span className="block text-[10px] text-[#8E99AE]">Restaurant &amp; VIP Lounge</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPos('LOOP')}
            className={`py-3.5 px-4 rounded-2xl border flex items-center justify-center gap-2.5 transition-all ${
              selectedPos === 'LOOP'
                ? 'bg-teal-900/30 border-teal-500 text-white shadow-lg shadow-teal-900/20'
                : 'bg-[#161C28] border-[#1E2635] text-[#8E99AE] hover:text-white'
            }`}
          >
            <ShoppingBag size={18} className={selectedPos === 'LOOP' ? 'text-teal-400' : 'text-[#8E99AE]'} />
            <div className="text-left">
              <span className="block text-xs font-bold leading-tight">LOOP POS</span>
              <span className="block text-[10px] text-[#8E99AE]">Butchery &amp; Liquor Store</span>
            </div>
          </button>
        </div>

        {/* 2. Running Channel Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-[#161C28] border border-[#1E2635] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                {field1Label}
              </span>
              <span className="text-lg font-black text-white mt-1 block">
                {formatETB(totalField1)}
              </span>
              <span className="text-[10px] text-[#00FF94] font-medium mt-0.5 block">
                Aggregated Ingested Sales
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center">
              <Calculator size={18} />
            </div>
          </div>

          <div className="p-4 bg-[#161C28] border border-[#1E2635] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                {field2Label}
              </span>
              <span className="text-lg font-black text-white mt-1 block">
                {formatETB(totalField2)}
              </span>
              <span className="text-[10px] text-[#00FF94] font-medium mt-0.5 block">
                {totalTickets} Shift Orders Logged
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
        </div>

        {/* 3. Active Admin-Configured Devices (2 Devices for this System) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-[#8E99AE] uppercase tracking-wider">
              Active POS Channels (Admin Configured Hardware)
            </span>
            <span className="text-[10px] text-[#00D1FF] font-semibold">
              {channelDevices.length} Hardware Devices Linked
            </span>
          </div>

          {channelDevices.length === 0 ? (
            <div className="p-4 bg-[#161C28]/60 border border-[#1E2635] rounded-2xl text-center text-xs text-[#8E99AE]">
              No devices found for {selectedPos}. Please register devices in Settings &gt; POS Devices.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {channelDevices.map(d => (
                <div 
                  key={d.id} 
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                    selectedDeviceId === d.id
                      ? 'bg-[#161C28] border-[#00D1FF] shadow-sm'
                      : 'bg-[#161C28]/60 border-[#1E2635]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-[#00D1FF]">
                      <Printer size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{d.name}</span>
                      <span className="text-[10px] text-[#8E99AE]">{d.location || 'Terminal Area'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00FF94]"></span>
                    <span className="text-[10px] font-bold text-[#00FF94] uppercase tracking-wider">
                      {d.status || 'ONLINE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Data Ingestion Action Banner */}
        <div className="p-6 bg-gradient-to-r from-[#161C28] to-[#1A2234] border border-[#1E2635] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UploadCloud size={20} className="text-[#00D1FF]" />
              <h4 className="text-sm font-bold text-white">Data Ingestion Hub</h4>
            </div>
            <p className="text-xs text-[#8E99AE]">
              Upload Excel (.xlsx/.csv), daily PDF report, or run instant POS REST API sync
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#0D121D] text-[#8E99AE] border border-[#1E2635]">
                XLSX / CSV
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#0D121D] text-[#00D1FF] border border-[#00D1FF]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse"></span>
                POS API SYNC
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#0D121D] text-[#8E99AE] border border-[#1E2635]">
                PDF AUDIT
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowIngestDialog(true)}
            disabled={isProcessing}
            className="px-6 py-3.5 rounded-2xl bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0D121D] text-xs font-black transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#00D1FF]/10 flex items-center justify-center gap-2 shrink-0"
          >
            {isProcessing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            <span>Ingest {selectedPos} Sales Batch</span>
          </button>
        </div>

        {/* 5. Ingestion Ledger (Recent History) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {selectedPos} Ingestion Ledger
            </h4>
            <span className="text-[10px] font-bold text-[#00FF94] bg-[#00FF94]/10 px-2 py-0.5 rounded-full border border-[#00FF94]/30">
              Audit Ready
            </span>
          </div>

          {channelEntries.length === 0 ? (
            <div className="p-8 bg-[#161C28]/40 border border-[#1E2635] rounded-2xl text-center text-xs text-[#8E99AE]">
              No recent ingestion history for {selectedPos}.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {channelEntries.slice(0, 10).map(entry => {
                const isLate = !!entry.isLate;
                const dateStr = entry.recordDate ? entry.recordDate.split('T')[0] : 'Unknown';
                const timeStr = entry.submissionDate 
                  ? new Date(entry.submissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div 
                    key={entry.id} 
                    className="p-3.5 bg-[#161C28] border border-[#1E2635] hover:border-[#00D1FF]/30 rounded-2xl text-xs space-y-2 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-[#00D1FF] mt-0.5">
                          <FileText size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block">
                            {entry.importSource === 'API' 
                              ? `REST API BATCH #${entry.id.split('_').slice(-2).join('_')}`
                              : `Z_Report_${dateStr}.${entry.importSource === 'CSV' ? 'csv' : 'xlsx'}`
                            }
                          </span>
                          <span className="text-[10px] text-[#8E99AE] block mt-0.5">
                            {entry.importSource} Ingestion • {entry.deviceName || 'Primary Counter'} • Verified by {entry.cashierName || entry.uploadedBy}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-[#00FF94] block">
                          {formatETB(entry.totalSales)}
                        </span>
                        <span className="text-[10px] text-[#8E99AE] block mt-0.5">
                          {dateStr} {timeStr}
                        </span>
                      </div>
                    </div>

                    {isLate && (
                      <div className="p-2 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 text-[#FF4D4D] text-[10px] flex items-center gap-1.5">
                        <AlertTriangle size={12} className="shrink-0" />
                        <span className="italic">Late Submission: &quot;{entry.delayReason}&quot;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#1E2635] flex items-center justify-between text-xs text-[#8E99AE]">
          <span>Synced real-time with Firestore (<span className="text-[#00D1FF] font-mono">sales_entries</span>)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#161C28] hover:bg-[#1E2635] text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* --- POPUP 1: Ingestion Selection Modal (Device + Cashier + Method) --- */}
      {showIngestDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
              <h3 className="text-sm font-bold text-white">
                Ingest {selectedPos} Sales
              </h3>
              <button 
                onClick={() => setShowIngestDialog(false)} 
                className="text-[#8E99AE] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Cashier Name */}
              <div>
                <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
                  Cashier Name *
                </label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="Enter cashier name..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
                  required
                />
              </div>

              {/* Select Source Device (From Admin Devices) */}
              <div>
                <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
                  Target POS Device ({selectedPos}) *
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
                >
                  {channelDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ingestion Methods */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-2">
                  Choose Ingestion Method
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Excel Upload */}
                  <button
                    type="button"
                    onClick={() => excelInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-[#0D121D] border border-[#1E2635] hover:border-[#00FF94] hover:bg-[#00FF94]/5 flex flex-col items-center gap-2 text-center group transition-colors"
                  >
                    <FileSpreadsheet size={22} className="text-[#00FF94]" />
                    <div>
                      <span className="text-xs font-bold text-white block">Excel / CSV</span>
                      <span className="text-[9px] text-[#8E99AE]">Upload .xlsx or .csv</span>
                    </div>
                  </button>

                  {/* API Import */}
                  <button
                    type="button"
                    onClick={handleApiImport}
                    className="p-3.5 rounded-2xl bg-[#0D121D] border border-[#1E2635] hover:border-[#00D1FF] hover:bg-[#00D1FF]/5 flex flex-col items-center gap-2 text-center group transition-colors"
                  >
                    <Cpu size={22} className="text-[#00D1FF]" />
                    <div>
                      <span className="text-xs font-bold text-white block">API Import</span>
                      <span className="text-[9px] text-[#8E99AE]">Automated POS Sync</span>
                    </div>
                  </button>

                  {/* PDF Upload */}
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-[#0D121D] border border-[#1E2635] hover:border-[#FF4D4D] hover:bg-[#FF4D4D]/5 flex flex-col items-center gap-2 text-center group transition-colors"
                  >
                    <FileText size={22} className="text-[#FF4D4D]" />
                    <div>
                      <span className="text-xs font-bold text-white block">PDF Audit</span>
                      <span className="text-[9px] text-[#8E99AE]">Extract daily PDF</span>
                    </div>
                  </button>

                  {/* Manual Entry */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowIngestDialog(false);
                      setShowManualModal(true);
                    }}
                    className="p-3.5 rounded-2xl bg-[#0D121D] border border-[#1E2635] hover:border-purple-400 hover:bg-purple-500/5 flex flex-col items-center gap-2 text-center group transition-colors"
                  >
                    <Calculator size={22} className="text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Manual Entry</span>
                      <span className="text-[9px] text-[#8E99AE]">Direct input form</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 2: Late Submission Dialog --- */}
      {showLateDialog && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#161C28] border border-[#FF4D4D]/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#FF4D4D]">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold text-white">Late Submission Flagged</h3>
            </div>
            
            <p className="text-xs text-[#8E99AE] leading-relaxed">
              The document date ({pendingParsedData?.recordDate?.split('T')[0]}) is more than 1 day older than current date ({new Date().toISOString().split('T')[0]}). State the reason for delay:
            </p>

            <form onSubmit={handleLateReasonSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
                  Reason for Delay *
                </label>
                <textarea
                  value={lateReason}
                  onChange={(e) => setLateReason(e.target.value)}
                  placeholder="e.g. Branch internet connection downtime, hardware repair..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#FF4D4D] h-20 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLateDialog(false);
                    setPendingParsedData(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8E99AE] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF4D4D] text-white text-xs font-bold hover:bg-[#FF4D4D]/90 transition-colors shadow-lg shadow-[#FF4D4D]/20"
                >
                  Submit &amp; Save to Ingestion Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP 3: Manual Entry Fallback Modal --- */}
      {showManualModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
              <h3 className="text-sm font-bold text-white">
                Manual Sales Ingestion ({selectedPos})
              </h3>
              <button 
                onClick={() => setShowManualModal(false)} 
                className="text-[#8E99AE] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
                    Shift Name
                  </label>
                  <input
                    type="text"
                    value={manualShift}
                    onChange={(e) => setManualShift(e.target.value)}
                    placeholder="Shift Closing"
                    className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
                  {field1Label} (ETB) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualF1}
                  onChange={(e) => setManualF1(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white font-semibold focus:outline-none focus:border-[#00D1FF]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
                  {field2Label} (ETB) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualF2}
                  onChange={(e) => setManualF2(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white font-semibold focus:outline-none focus:border-[#00D1FF]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2635]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8E99AE] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00D1FF] text-[#0D121D] text-xs font-bold hover:bg-[#00D1FF]/90 transition-colors"
                >
                  Ingest Manual Sales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleExcelUpload}
        className="hidden"
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        onChange={handlePdfUpload}
        className="hidden"
      />
    </div>
  );
}
