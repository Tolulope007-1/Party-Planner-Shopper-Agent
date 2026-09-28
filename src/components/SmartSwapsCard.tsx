import React from 'react';
import { Sparkles, DollarSign, ArrowRight, Check, Zap, Layers } from 'lucide-react';
import { SmartSwap } from '../types/party';
import { formatCurrency } from '../utils/partyMath';

interface SmartSwapsCardProps {
  swaps: SmartSwap[];
  onApplySwap: (index: number) => void;
}

export const SmartSwapsCard: React.FC<SmartSwapsCardProps> = ({ swaps, onApplySwap }) => {
  if (!swaps || swaps.length === 0) return null;

  const totalPotentialSavings = swaps.reduce((sum, s) => sum + (s.applied ? 0 : s.savings), 0);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 rounded-2xl border border-amber-200/80 p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-500 text-white">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Agent Smart Swaps & Budget Hacks</h3>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Intelligent recommendations to trim cost and reduce host kitchen prep time without sacrificing party quality.
          </p>
        </div>

        {totalPotentialSavings > 0 && (
          <div className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0">
            Up to <span className="font-bold tabular-nums">{formatCurrency(totalPotentialSavings)}</span> in Potential Savings
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {swaps.map((swap, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              swap.applied
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-white/90 border-amber-200/60 shadow-2xs hover:shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-slate-900 leading-snug">{swap.title}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  Save ~{formatCurrency(swap.savings)}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">{swap.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-medium text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">Recommended Swap:</span> {swap.alternativeAction}
              </div>

              <button
                onClick={() => onApplySwap(index)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  swap.applied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                }`}
              >
                {swap.applied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Swap Applied</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Apply This Swap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
