import React, { useState, useEffect } from 'react';
import { RefreshCw, ClipboardList, AlertTriangle, CheckCircle2, TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { salesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LogReportScreen() {
  const { role } = useAuth();
  const [allEntries, setAllEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'LATE', 'CENET', 'LOOP'

  useEffect(() => {
    loadLogs();
  }, [role]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [salesRes, statsRes] = await Promise.all([
        salesApi.getSales(),
        salesApi.getStats()
      ]);

      if (salesRes && salesRes.data) {
        setAllEntries(salesRes.data);
      }
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (e) {
      console.error('Error loading audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = allEntries.filter(entry => {
    if (filter === 'LATE') return entry.isLate;
    if (filter === 'CENET') return entry.systemType === 'CENET';
    if (filter === 'LOOP') return entry.systemType === 'LOOP';
    return true;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  const formatDate = (dateString, withTime = false) => {
    try {
      return format(parseISO(dateString), withTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');
    } catch {
      return dateString || '';
    }
  };

  const filteredTotal = filteredEntries.reduce((acc, curr) => acc + (curr.totalSales || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <ClipboardList className="w-6 h-6 text-indigo-200" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Log &amp; Audit Report
            </h2>
          </div>
          <p className="text-indigo-200 text-sm mt-1.5 font-medium">
            Centralized submission timeline, delayed transaction audit trail &amp; compliance metrics
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all font-semibold text-xs shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Cloud Logs</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 block">
              {formatCurrency(stats.totalRevenue)}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              CENET: {formatCurrency(stats.cenetTotal)} | LOOP: {formatCurrency(stats.loopTotal)}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Submissions
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1 block">
              {stats.totalTransactions}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              {stats.cenetCount} CENET • {stats.loopCount} LOOP
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Late Submissions
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">
              {stats.lateSubmissionsCount}
            </span>
            <span className="text-[11px] text-amber-700 mt-1 block font-medium">
              Delay reason documented
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              On-Time Rate
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">
              {stats.onTimePercentage}%
            </span>
            <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
              Same-day &amp; 1-day submissions
            </span>
          </div>
        </div>
      )}

      {/* Filter Chips matching Flutter FilterChips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            filter === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Logs ({allEntries.length})
        </button>

        <button
          onClick={() => setFilter('LATE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            filter === 'LATE'
              ? 'bg-amber-500 text-white'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          Late Submissions Only ({allEntries.filter(e => e.isLate).length})
        </button>

        <button
          onClick={() => setFilter('CENET')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            filter === 'CENET'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
          }`}
        >
          CENET Only ({allEntries.filter(e => e.systemType === 'CENET').length})
        </button>

        <button
          onClick={() => setFilter('LOOP')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            filter === 'LOOP'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
          }`}
        >
          LOOP Only ({allEntries.filter(e => e.systemType === 'LOOP').length})
        </button>

        <div className="ml-auto text-xs text-slate-500 font-semibold hidden md:block">
          Filtered Sales Volume: <span className="text-slate-800 font-bold">{formatCurrency(filteredTotal)}</span>
        </div>
      </div>

      {/* Audit Log Timeline List matching Flutter ListView */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="font-medium text-sm">Loading audit logs...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto">
          <p className="text-slate-500 text-sm font-medium">No audit logs match selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(entry => {
            const isCenet = entry.systemType === 'CENET';
            const f1Name = isCenet ? 'Restaurant' : 'Butchery';
            const f2Name = isCenet ? 'Lounge' : 'Liquor';

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Avatar & Basic Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md shrink-0 ${
                      isCenet ? 'bg-purple-600' : 'bg-teal-600'
                    }`}
                  >
                    {entry.systemType[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-base text-slate-900">
                        {entry.systemType} — {formatCurrency(entry.totalSales)}
                      </h4>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600 border border-slate-200">
                        {entry.importSource}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Doc Date: <strong className="text-slate-700">{formatDate(entry.recordDate)}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Submitted: <strong className="text-slate-700">{formatDate(entry.submissionDate, true)}</strong>
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 font-medium">
                      Breakdown: <span className="font-semibold text-slate-800">{f1Name}:</span> {formatCurrency(entry.field1Amount)} | <span className="font-semibold text-slate-800">{f2Name}:</span> {formatCurrency(entry.field2Amount)}
                    </div>

                    {/* Delay Reason for Late Submissions */}
                    {entry.isLate && entry.delayReason && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <span className="font-bold text-amber-800">Delay Reason: </span>
                        <span className="italic font-medium">&ldquo;{entry.delayReason}&rdquo;</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status Pill */}
                <div className="self-end md:self-center shrink-0">
                  {entry.isLate ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      LATE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ON-TIME
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
