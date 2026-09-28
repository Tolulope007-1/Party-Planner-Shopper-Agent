import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  Sparkles,
  Zap,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  HelpCircle,
  Edit2,
  Trash2,
  Undo2,
  Tag,
  Snowflake,
  Utensils,
  GlassWater,
} from 'lucide-react';
import { PartyPlan, ShoppingItem, SmartSwap, CymbalDepartment } from '../types/party';
import { formatCurrency, CYMBAL_DEPARTMENTS, STORE_META } from '../utils/partyMath';
import { PortionCalculator } from './PortionCalculator';
import { SmartSwapsCard } from './SmartSwapsCard';

interface ReviewListBudgetViewProps {
  plan: PartyPlan;
  onUpdateGuestsAndHours: (adults: number, kids: number, hours: number) => void;
  onRecalculatePlan: () => void;
  isRecalculating: boolean;
  onApplySwap: (index: number) => void;
  onToggleCheckItem: (id: string) => void;
  onToggleAlreadyOwned: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItemCost: (id: string, cost: number) => void;
  onUpdateItemQuantity: (id: string, qty: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id'>) => void;
  onProceedToRefineCheckout: () => void;
  onAutoAlignBudget: () => Promise<void>;
  isAligningBudget: boolean;
}

export const ReviewListBudgetView: React.FC<ReviewListBudgetViewProps> = ({
  plan,
  onUpdateGuestsAndHours,
  onRecalculatePlan,
  isRecalculating,
  onApplySwap,
  onToggleCheckItem,
  onToggleAlreadyOwned,
  onDeleteItem,
  onUpdateItemCost,
  onUpdateItemQuantity,
  onAddItem,
  onProceedToRefineCheckout,
  onAutoAlignBudget,
  isAligningBudget,
}) => {
  const [selectedDept, setSelectedDept] = useState<CymbalDepartment | 'all'>('all');
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [tempCost, setTempCost] = useState('');

  // Active items calculation
  const activeItems = plan.items.filter((i) => !i.alreadyOwned);
  const totalCost = activeItems.reduce((acc, i) => acc + i.estCost, 0);
  const targetBudget = plan.budget;
  const diff = targetBudget - totalCost;
  const isUnderBudget = diff >= 0;
  const budgetPercentage = Math.round((totalCost / targetBudget) * 100);

  const ownedSavings = plan.items
    .filter((i) => i.alreadyOwned)
    .reduce((acc, i) => acc + i.estCost, 0);

  const cymbalBrandCount = plan.items.filter((i) => i.isCymbalBrand).length;

  const filteredItems = plan.items.filter((item) => {
    if (selectedDept === 'all') return true;
    if (item.department) return item.department === selectedDept;
    // Map categories to fallback departments if needed
    if (selectedDept === 'produce_deli' && item.category === 'food' && item.aisle?.includes('Produce')) return true;
    if (selectedDept === 'beverages_ice' && (item.category === 'beverages' || item.category === 'ice_chilling')) return true;
    if (selectedDept === 'party_essentials' && (item.category === 'tableware_supplies' || item.category === 'decor_ambiance')) return true;
    return false;
  });

  const handleSaveCost = (id: string) => {
    const val = parseFloat(tempCost);
    if (!isNaN(val) && val >= 0) {
      onUpdateItemCost(id, val);
    }
    setEditingCostId(null);
  };

  const departments: CymbalDepartment[] = [
    'produce_deli',
    'butcher_seafood',
    'bakery_snacks',
    'beverages_ice',
    'party_essentials',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Task Header & Budget Alignment Gauge */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Task 2 of 3 · Review & Budget Alignment
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{plan.eventName}</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
              Align Shopping List with Total Budget
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Compare estimated cart cost against your <span className="font-bold text-slate-800">{formatCurrency(targetBudget)}</span> budget.
              Use Cymbal Value brand swaps and our 1-click AI budget aligner to hit your target.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              onClick={onAutoAlignBudget}
              disabled={isAligningBudget}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-amber-400 ${isAligningBudget ? 'animate-spin' : ''}`} />
              <span>{isAligningBudget ? 'Aligning with AI...' : '1-Click Auto-Align Budget'}</span>
            </button>

            <button
              onClick={onProceedToRefineCheckout}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Refine & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Budget Meter Bar */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">
                Current Cart: <span className="text-slate-950 text-sm tabular-nums">{formatCurrency(totalCost)}</span>
              </span>
              <span className="text-slate-500">
                Target Budget: <span className="text-slate-950 text-sm tabular-nums">{formatCurrency(targetBudget)}</span>
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isUnderBudget ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, budgetPercentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{budgetPercentage}% of budget utilized</span>
              {isUnderBudget ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Under budget by {formatCurrency(diff)}
                </span>
              ) : (
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Over budget by {formatCurrency(Math.abs(diff))}
                </span>
              )}
            </div>
          </div>

          {/* Savings Highlight Badge */}
          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cymbal Value Verified</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              {cymbalBrandCount} items are Cymbal Select store-brand staples.
              {ownedSavings > 0 && ` Plus $${ownedSavings} saved from items already in your pantry.`}
            </p>
          </div>
        </div>
      </div>

      {/* Portion and Volume Validation */}
      <PortionCalculator
        plan={plan}
        onUpdateGuestsAndHours={onUpdateGuestsAndHours}
        onRecalculatePlan={onRecalculatePlan}
        isRecalculating={isRecalculating}
      />

      {/* Smart Swaps for Budget Savings */}
      <SmartSwapsCard
        swaps={plan.smartSwaps}
        onApplySwap={onApplySwap}
      />

      {/* Department Tabs & Itemized Review */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Review Items by CymbalMart Department</h2>
            <p className="text-xs text-slate-500">
              Each item includes portion quantities, aisle hints, and brand options.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            {activeItems.length} active items
          </div>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-none border-b border-slate-100">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              selectedDept === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments ({plan.items.length})
          </button>

          {departments.map((dept) => {
            const count = plan.items.filter((i) => i.department === dept).length;
            const meta = CYMBAL_DEPARTMENTS[dept];
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedDept === dept
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{meta.label.split(' ')[0]}</span>
                <span className="opacity-75 text-[11px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Items Table */}
        <div className="divide-y divide-slate-100">
          {filteredItems.map((item) => {
            const isOwned = !!item.alreadyOwned;
            const deptMeta = item.department ? CYMBAL_DEPARTMENTS[item.department] : null;

            return (
              <div
                key={item.id}
                className={`py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl transition-all ${
                  isOwned ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          isOwned ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.name}
                      </span>

                      {item.isCymbalBrand && (
                        <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.2 rounded-full border border-amber-300">
                          Cymbal Brand
                        </span>
                      )}

                      {deptMeta && (
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${deptMeta.badgeClass}`}>
                          {deptMeta.label.split('&')[0]}
                        </span>
                      )}

                      {isOwned && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                          Already Owned ($0)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.2 rounded">
                        Qty: {item.quantity}
                      </span>
                      {item.aisle && (
                        <span className="text-slate-600 font-medium">· {item.aisle}</span>
                      )}
                      {item.tip && (
                        <span className="text-slate-400 italic text-[11px]">· {item.tip}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Ownership Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    {editingCostId === item.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">$</span>
                        <input
                          type="number"
                          step="0.5"
                          autoFocus
                          value={tempCost}
                          onChange={(e) => setTempCost(e.target.value)}
                          onBlur={() => handleSaveCost(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveCost(item.id);
                            if (e.key === 'Escape') setEditingCostId(null);
                          }}
                          className="w-16 px-1.5 py-0.5 text-xs font-bold border border-amber-400 rounded focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCostId(item.id);
                          setTempCost(item.estCost.toString());
                        }}
                        className={`text-sm font-bold tabular-nums hover:text-amber-600 transition-colors flex items-center gap-1 ${
                          isOwned ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                        title="Click to edit item price"
                      >
                        <span>{formatCurrency(item.estCost)}</span>
                        <Edit2 className="w-3 h-3 text-slate-300" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onToggleAlreadyOwned(item.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      isOwned
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isOwned ? 'In Pantry' : 'I Have This'}
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Proceed CTA */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Total active list: <span className="font-bold text-slate-900">{formatCurrency(totalCost)}</span> ({activeItems.length} items)
          </div>

          <button
            onClick={onProceedToRefineCheckout}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Proceed to Step 3: Refine & Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
