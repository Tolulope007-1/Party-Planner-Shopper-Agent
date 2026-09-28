import React from 'react';
import { Snowflake, GlassWater, Utensils, ShoppingBag, Info, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { PartyPlan } from '../types/party';
import { calculatePortions } from '../utils/partyMath';

interface PortionCalculatorProps {
  plan: PartyPlan;
  onUpdateGuestsAndHours: (adults: number, kids: number, hours: number) => void;
  onRecalculatePlan: () => void;
  isRecalculating?: boolean;
}

export const PortionCalculator: React.FC<PortionCalculatorProps> = ({
  plan,
  onUpdateGuestsAndHours,
  onRecalculatePlan,
  isRecalculating,
}) => {
  const [isAdjusting, setIsAdjusting] = React.useState(false);
  const [adults, setAdults] = React.useState(plan.adultCount);
  const [kids, setKids] = React.useState(plan.kidCount);
  const [hours, setHours] = React.useState(plan.durationHours);

  // Sync state if plan changes
  React.useEffect(() => {
    setAdults(plan.adultCount);
    setKids(plan.kidCount);
    setHours(plan.durationHours);
  }, [plan.adultCount, plan.kidCount, plan.durationHours]);

  const portions = calculatePortions(adults, kids, hours, plan.alcoholPreference);

  const handleSliderChange = (newAdults: number, newKids: number, newHours: number) => {
    setAdults(newAdults);
    setKids(newKids);
    setHours(newHours);
    onUpdateGuestsAndHours(newAdults, newKids, newHours);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Portion & Volume Calculator</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              Formula Grounded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Based on standard catering formulas: 2 drinks 1st hr + 1/hr after · 1.5 lbs ice/person · 6-8oz protein/guest
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdjusting(!isAdjusting)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              isAdjusting
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isAdjusting ? 'Close Sliders' : 'Adjust Headcount & Hours'}</span>
          </button>

          {(adults !== plan.adultCount || kids !== plan.kidCount || hours !== plan.durationHours) && (
            <button
              onClick={onRecalculatePlan}
              disabled={isRecalculating}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>Update Shopping List</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Quick Sliders */}
      {isAdjusting && (
        <div className="p-4 mb-6 bg-slate-50/80 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-5 animate-in fade-in duration-150">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
              <span>Adult Guests</span>
              <span className="font-bold text-amber-700">{adults}</span>
            </div>
            <input
              type="range"
              min={2}
              max={60}
              value={adults}
              onChange={(e) => handleSliderChange(parseInt(e.target.value), kids, hours)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2</span>
              <span>30</span>
              <span>60</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
              <span>Kid Guests</span>
              <span className="font-bold text-amber-700">{kids}</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={kids}
              onChange={(e) => handleSliderChange(adults, parseInt(e.target.value), hours)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0</span>
              <span>15</span>
              <span>30</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
              <span>Duration (Hours)</span>
              <span className="font-bold text-amber-700">{hours} hrs</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={hours}
              onChange={(e) => handleSliderChange(adults, kids, parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 hr</span>
              <span>4 hrs</span>
              <span>8 hrs</span>
            </div>
          </div>
        </div>
      )}

      {/* 4 Primary Calculation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ice Requirement */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
              <Snowflake className="w-4 h-4 text-blue-500" />
              Ice & Chilling
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {portions.iceBags10lb} × 10-lb Bags
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {portions.iceLbs} <span className="text-sm font-normal text-slate-600">lbs total</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {Math.round(portions.iceLbs * 0.5)} lbs for drink glasses · {Math.round(portions.iceLbs * 0.5)} lbs in drink coolers
            </p>
          </div>
        </div>

        {/* Drink Calculations */}
        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
              <GlassWater className="w-4 h-4 text-purple-500" />
              Drinks & Mixers
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {plan.alcoholPreference === 'non_alcoholic_only' ? '100% Mocktails' : 'Full Allocation'}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {portions.totalAlcoholicDrinks + portions.totalNonAlcoholicDrinks}{' '}
              <span className="text-sm font-normal text-slate-600">total drinks</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {plan.alcoholPreference !== 'non_alcoholic_only'
                ? `~${portions.wineBottles} wine btls · ${portions.beerCans} beers · ${portions.totalNonAlcoholicDrinks} sodas`
                : `${portions.totalNonAlcoholicDrinks} mocktails, sodas & infused waters`}
            </p>
          </div>
        </div>

        {/* Food & Protein Portions */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-emerald-500" />
              Food & Appetizers
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              ~6-8 oz / Adult
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {portions.proteinLbs} <span className="text-sm font-normal text-slate-600">lbs main protein</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Plus ~{portions.appetizerBites} appetizer / snack bites (chips, dips, bites)
            </p>
          </div>
        </div>

        {/* Tableware Buffer */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              Tableware Buffer
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              1.75× Multiplier
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {portions.tablewareBufferCount}{' '}
              <span className="text-sm font-normal text-slate-600">cups & plates</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Buffer covers lost glasses + ~{portions.totalGuests * 3} napkins recommended
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
