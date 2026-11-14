import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Receipt, 
  Calendar, 
  User, 
  Tag, 
  Search,
  ExternalLink,
  Plus
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
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Expense History"
        subtitle="SPENDING, FUND USAGE & RECEIPTS"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={onOpenAddExpense}
            className="p-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-[#00D1FF] hover:border-[#00D1FF]/50"
            title="Add Expense"
          >
            <Plus size={17} />
          </button>
        }
      />

      <div className="px-5 pt-3 space-y-3">
        {/* Total Spending Banner */}
        <FintechCard className="flex items-center justify-between bg-gradient-to-r from-[#161C28] to-[#1F2338]">
          <div>
            <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Total Logged Expenses</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{formatETB(totalSpent)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#7C4DFF]/15 border border-[#7C4DFF]/30 flex items-center justify-center text-[#7C4DFF]">
            <Receipt size={20} />
          </div>
        </FintechCard>

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#7C4DFF] text-white'
                  : 'bg-[#161C28] text-[#8E99AE] border border-[#1E2635] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description, staff name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-white placeholder-[#8E99AE] text-xs focus:outline-none focus:border-[#7C4DFF]"
          />
        </div>

        {/* Expense List */}
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
            <p className="text-xs text-[#8E99AE]">No expenses logged in this view.</p>
          </div>
        ) : (
          filtered.map(exp => (
            <FintechCard key={exp.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{exp.description || 'Expense Entry'}</span>
                <span className="text-sm font-bold text-[#FF4D4D]">- {formatETB(exp.amount)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8E99AE] pt-1">
                <div className="flex items-center gap-2">
                  <FintechBadge label={exp.category || 'General'} color="#7C4DFF" />
                  <span className="text-[11px]">{exp.username || 'Staff'}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar size={12} />
                  <span>{exp.date || 'Today'}</span>
                </div>
              </div>

              {exp.receiptUrl && (
                <div className="mt-2 pt-2 border-t border-[#1E2635] flex items-center justify-between text-xs">
                  <span className="text-[#8E99AE]">Receipt attached</span>
                  <a
                    href={exp.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00D1FF] flex items-center gap-1 hover:underline"
                  >
                    <span>View Image</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </FintechCard>
          ))
        )}
      </div>
    </div>
  );
}
