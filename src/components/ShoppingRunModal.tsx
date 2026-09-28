import React from 'react';
import {
  CheckCircle2,
  X,
  Square,
  Sparkles,
  ShoppingBag,
  Store,
  Package,
  Wine,
  ArrowRight,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ShoppingItem, StoreType } from '../types/party';
import { STORE_META, formatCurrency } from '../utils/partyMath';

interface ShoppingRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  eventName: string;
  onToggleCheckItem: (id: string) => void;
  onResetChecks: () => void;
}

export const ShoppingRunModal: React.FC<ShoppingRunModalProps> = ({
  isOpen,
  onClose,
  items,
  eventName,
  onToggleCheckItem,
  onResetChecks,
}) => {
  const [activeStore, setActiveStore] = React.useState<StoreType | 'all'>('all');

  if (!isOpen) return null;

  // Filter out items already owned by the host
  const itemsToBuy = items.filter((i) => !i.alreadyOwned);

  const displayedItems = itemsToBuy.filter((item) => {
    if (activeStore === 'all') return true;
    return item.recommendedStore === activeStore;
  });

  const checkedCount = displayedItems.filter((i) => i.checked).length;
  const totalCount = displayedItems.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const currentCartTotal = displayedItems
    .filter((i) => i.checked)
    .reduce((sum, item) => sum + item.estCost, 0);

  const storeTypes: StoreType[] = ['supermarket', 'wholesale_club', 'liquor_store', 'party_store'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                In-Store Shopping Mode
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 text-white truncate max-w-md">{eventName}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Quick Stats */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-700">
              {checkedCount} of {totalCount} items in cart ({progressPercent}%)
            </span>
            <span className="text-emerald-700 font-bold tabular-nums">
              Cart Total: {formatCurrency(currentCartTotal)}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Store Switcher for Focused Aisle Run */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => setActiveStore('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeStore === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Stores ({itemsToBuy.length})
            </button>

            {storeTypes.map((st) => {
              const count = itemsToBuy.filter((i) => i.recommendedStore === st).length;
              if (count === 0) return null;
              return (
                <button
                  key={st}
                  onClick={() => setActiveStore(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeStore === st
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{STORE_META[st].label.split(' ')[0]}</span>
                  <span className="opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Checklist Items (Aisle-organized) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
          {displayedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No items found for this store.</p>
            </div>
          ) : (
            displayedItems.map((item) => {
              const isChecked = !!item.checked;
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleCheckItem(item.id)}
                  className={`py-3.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/40 text-slate-400'
                      : 'hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 transition-transform active:scale-90"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Square className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm sm:text-base font-semibold transition-all ${
                            isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.2 rounded">
                          {item.quantity}
                        </span>
                        {item.aisle && (
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                            {item.aisle}
                          </span>
                        )}
                        {item.tip && (
                          <span className="italic text-slate-400 line-clamp-1">{item.tip}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(item.estCost)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
          <button
            onClick={onResetChecks}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Uncheck All Items</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors"
          >
            Finished Shopping Run
          </button>
        </div>
      </div>
    </div>
  );
};
