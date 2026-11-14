import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Receipt, 
  Calendar, 
  User, 
  Tag, 
  Search,
  ExternalLink,
  Plus,
  DollarSign
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';
import { subscribeToExpenses, formatETB } from '../services/firebaseClient';

export default function ExpenseHistoryScreen({ onBack, onOpenAddExpense }) {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const unsub = subscribeToExpenses(setExpenses);
    return () => unsub();
  }, []);

  const categories = ['ALL', 'Supplies', 'F&B Raw', 'Logistics', 'Utilities', 'Maintenance'];

  const filtered = expenses.filter(e => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const desc = (e.description || '').toLowerCase();
      const user = (e.username || '').toLowerCase();
      const cat = (e.category || '').toLowerCase();
      return desc.includes(q) || user.includes(q) || cat.includes(q);
    }
    return true;
  });

  const totalSpent = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Expense & Spending Audit History"
        subtitle="OPERATIONAL EXPENDITURES & RECEIPTS"
        category="F&B Operations"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white text-xs font-bold transition-colors shadow-lg shadow-[#7C4DFF]/20"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Total Spending Banner Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#161C28] via-[#1A2234] to-[#1F2338] border border-[#1E2635] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#8E99AE] uppercase font-bold tracking-wider block">
              Total Filtered Operational Spending
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatETB(totalSpent)}
            </div>
            <p className="text-xs text-[#8E99AE] mt-1">
              Aggregated across {filtered.length} verified itemized expenditures.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#7C4DFF]/15 border border-[#7C4DFF]/30 flex items-center justify-center text-[#7C4DFF]">
              <Receipt size={24} />
            </div>
          </div>
        </div>

        {/* Toolbar: Category Filters + Search */}
        <div className="p-4 bg-[#161C28] border border-[#1E2635] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#7C4DFF] text-white shadow-md shadow-[#7C4DFF]/20'
                    : 'bg-[#0D121D] text-[#8E99AE] border border-[#1E2635] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[260px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, staff, category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white placeholder-[#8E99AE] text-xs focus:outline-none focus:border-[#7C4DFF] transition-colors"
            />
          </div>
        </div>

        {/* Expenses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
              <p className="text-sm text-[#8E99AE]">No expenses found in this view.</p>
            </div>
          ) : (
            filtered.map(exp => (
              <div key={exp.id} className="p-5 bg-[#161C28] border border-[#1E2635] rounded-2xl space-y-3 hover:border-[#7C4DFF]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate max-w-[180px]">
                    {exp.description || 'Expense Entry'}
                  </h4>
                  <span className="text-sm font-black text-[#FF4D4D]">
                    - {formatETB(exp.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8E99AE] pt-2 border-t border-[#1E2635]">
                  <div className="flex items-center gap-2">
                    <FintechBadge label={exp.category || 'General'} color="#7C4DFF" />
                    <span className="text-[11px] text-white font-medium">{exp.username || 'Staff'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar size={12} className="text-[#00D1FF]" />
                    <span>{exp.date ? new Date(exp.date).toLocaleDateString() : 'Today'}</span>
                  </div>
                </div>

                {exp.notes && (
                  <p className="text-xs text-[#8E99AE] bg-[#0D121D] p-2 rounded-lg border border-[#1E2635]">
                    {exp.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
