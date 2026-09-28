import React from 'react';
import {
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Share2,
  Plus,
  Compass,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  ShoppingCart,
  Store,
  Check,
  Mic,
} from 'lucide-react';
import { PartyPlan, PartyPreset, CUJStep } from '../types/party';
import { formatCurrency } from '../utils/partyMath';
import { PARTY_PRESETS } from '../data/presets';

interface HeaderProps {
  currentStep: CUJStep;
  onSetStep: (step: CUJStep) => void;
  plan: PartyPlan | null;
  plans: PartyPlan[];
  onSelectPlan: (id: string) => void;
  onOpenNewPlanModal: () => void;
  onLoadPreset: (preset: PartyPreset) => void;
  onOpenShoppingRun: () => void;
  onOpenExport: () => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
  onOpenVoiceControl?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onSetStep,
  plan,
  plans,
  onSelectPlan,
  onOpenNewPlanModal,
  onLoadPreset,
  onOpenShoppingRun,
  onOpenExport,
  onOpenChat,
  isChatOpen,
  onOpenVoiceControl,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = React.useState(false);
  const [showPlanMenu, setShowPlanMenu] = React.useState(false);

  // Calculate shopping statistics
  const activeItems = plan?.items.filter((i) => !i.alreadyOwned) || [];
  const totalCost = activeItems.reduce((sum, item) => sum + item.estCost, 0);
  const targetBudget = plan?.budget || 0;
  const budgetDiff = targetBudget - totalCost;

  const checkedCount = plan?.items.filter((i) => i.checked && !i.alreadyOwned).length || 0;
  const progressPercent = activeItems.length > 0 ? Math.round((checkedCount / activeItems.length) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
      {/* Top Banner with Brand & Plan Selector */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-sm shrink-0">
                <span className="text-xl">C</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    CymbalMart
                  </span>
                  <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-slate-800 px-2 py-0.2 rounded font-medium">
                    Party Planning Agent
                  </span>
                </div>

                {/* Plan dropdown selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowPlanMenu(!showPlanMenu)}
                    className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-white hover:text-amber-400 transition-colors text-left truncate max-w-[180px] sm:max-w-xs md:max-w-md"
                  >
                    <span className="truncate">{plan ? plan.eventName : 'Define an Event'}</span>
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showPlanMenu && (
                    <div
                      className="absolute left-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onMouseLeave={() => setShowPlanMenu(false)}
                    >
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Saved Party Plans
                      </div>
                      {plans.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectPlan(p.id);
                            setShowPlanMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            plan?.id === p.id ? 'font-semibold text-amber-600 bg-amber-50/50' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{p.eventName}</span>
                          <span className="text-xs text-slate-400 shrink-0 ml-2">{formatCurrency(p.budget)}</span>
                        </button>
                      ))}
                      <div className="border-t border-slate-100 my-1 pt-1">
                        <button
                          onClick={() => {
                            onOpenNewPlanModal();
                            setShowPlanMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-amber-700 font-medium hover:bg-amber-50 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Define New Event
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics (Desktop) */}
            {plan && (
              <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cart vs Budget</div>
                    <div className="text-xs font-bold text-white tabular-nums">
                      {formatCurrency(totalCost)}{' '}
                      <span className="text-slate-400 font-normal">/ {formatCurrency(targetBudget)}</span>
                    </div>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-700" />

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Guests & Time</div>
                    <div className="text-xs font-bold text-white">
                      {plan.portionBreakdown.totalGuests} guests · {plan.durationHours}h
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Presets dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Load party inspiration template"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Templates</span>
                </button>

                {showPresetsMenu && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setShowPresetsMenu(false)}
                  >
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      CymbalMart Curated Templates
                    </div>
                    {PARTY_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onLoadPreset(preset);
                          setShowPresetsMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50/60 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <div className="font-semibold text-slate-800 flex items-center justify-between">
                          <span>{preset.name}</span>
                          <span className="text-xs text-amber-700 font-bold">{formatCurrency(preset.budget)}</span>
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{preset.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* In-Store Mode */}
              {plan && (
                <button
                  onClick={onOpenShoppingRun}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 rounded-lg flex items-center gap-1.5 transition-colors"
                  title="In-store shopping checklist mode"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Aisle Mode</span>
                  <span className="text-[11px] font-bold bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded-full">
                    {progressPercent}%
                  </span>
                </button>
              )}

              {/* Export */}
              {plan && (
                <button
                  onClick={onOpenExport}
                  className="p-1.5 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Share or print shopping list"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden md:inline">Share</span>
                </button>
              )}

              {/* Voice Control Button */}
              {onOpenVoiceControl && (
                <button
                  onClick={onOpenVoiceControl}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-400/40 cursor-pointer shadow-xs"
                  title="Hands-free Voice Control"
                >
                  <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="hidden md:inline">Voice Control</span>
                </button>
              )}

              {/* CymbalMart Assistant */}
              <button
                onClick={onOpenChat}
                className={`px-3 py-1.5 sm:py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  isChatOpen
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
                }`}
                title="Chat with CymbalMart Assistant"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">CymbalMart Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Critical User Journey (CUJ) Stepper Bar */}
      <div className="bg-slate-950 px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            {/* Step 1: Define Event */}
            <button
              onClick={() => onSetStep('define')}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                currentStep === 'define'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                currentStep === 'define' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                1
              </span>
              <span>Define Event</span>
            </button>

            <span className="text-slate-600 hidden sm:inline">→</span>

            {/* Step 2: Review List & Align Budget */}
            <button
              onClick={() => onSetStep('review')}
              disabled={!plan}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                currentStep === 'review'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-40'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                currentStep === 'review' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                2
              </span>
              <span>Review List & Budget</span>
            </button>

            <span className="text-slate-600 hidden sm:inline">→</span>

            {/* Step 3: Refine & Checkout */}
            <button
              onClick={() => onSetStep('refine_checkout')}
              disabled={!plan}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                currentStep === 'refine_checkout'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-40'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                currentStep === 'refine_checkout' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                3
              </span>
              <span>Refine & Checkout</span>
            </button>
          </div>

          {plan && (
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-slate-400">Target Budget:</span>
              <span className={`font-bold tabular-nums ${totalCost <= targetBudget ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatCurrency(totalCost)} of {formatCurrency(targetBudget)}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
