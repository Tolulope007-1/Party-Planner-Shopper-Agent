import React from 'react';
import { GlassWater, Calendar, CheckSquare, Square, Clock, Sparkles, ChefHat } from 'lucide-react';
import { HostTimelineStep, SignatureDrink } from '../types/party';

interface HostTimelineAndDrinkProps {
  timeline: HostTimelineStep[];
  signatureDrink: SignatureDrink;
  onToggleTimelineStep: (index: number) => void;
}

export const HostTimelineAndDrink: React.FC<HostTimelineAndDrinkProps> = ({
  timeline,
  signatureDrink,
  onToggleTimelineStep,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Signature Batch Drink Recipe */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <GlassWater className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Signature Batch Drink</h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {signatureDrink.type || 'Batch Special'}
            </span>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 text-rose-950 font-display">
              {signatureDrink.name}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Batching drinks beforehand saves you 2 hours of bartender duties during your party!
            </p>
          </div>

          {/* Ingredients list */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Batch Ingredients (Chilled in advance)
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 bg-rose-50/40 p-3 rounded-xl border border-rose-100">
              {signatureDrink.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Serving Instructions
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {signatureDrink.instructions}
          </p>
        </div>
      </div>

      {/* Host Timeline & Countdown Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Host Prep Countdown</h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Stress-Free Host Schedule
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Follow this chronological checklist so prep is completed before the doorbell rings.
          </p>

          <div className="space-y-3">
            {timeline.map((step, idx) => {
              const isDone = !!step.done;
              return (
                <div
                  key={idx}
                  onClick={() => onToggleTimelineStep(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20'
                  }`}
                >
                  <button className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {step.time}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {step.task}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-400">
            Click any step to mark as finished as you prepare for your event.
          </span>
        </div>
      </div>
    </div>
  );
};
