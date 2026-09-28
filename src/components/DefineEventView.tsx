import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  DollarSign,
  Users,
  Clock,
  Compass,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import { PartyPreset } from '../types/party';
import { PARTY_PRESETS } from '../data/presets';
import { formatCurrency } from '../utils/partyMath';

interface DefineEventViewProps {
  onGeneratePlan: (formData: any) => Promise<void>;
  isGenerating: boolean;
  onLoadPreset: (preset: PartyPreset) => void;
  initialValues?: any;
}

export const DefineEventView: React.FC<DefineEventViewProps> = ({
  onGeneratePlan,
  isGenerating,
  onLoadPreset,
  initialValues,
}) => {
  const [naturalIntent, setNaturalIntent] = useState('');
  const [eventName, setEventName] = useState(initialValues?.eventName || 'Summer Rooftop Fiesta');
  const [theme, setTheme] = useState(initialValues?.theme || 'Baja Street Tacos & Craft Margaritas');
  const [eventType, setEventType] = useState(initialValues?.eventType || 'Dinner & Cocktail Party');
  const [adultCount, setAdultCount] = useState<number>(initialValues?.adultCount || 14);
  const [kidCount, setKidCount] = useState<number>(initialValues?.kidCount || 2);
  const [durationHours, setDurationHours] = useState<number>(initialValues?.durationHours || 4);
  const [budget, setBudget] = useState<number>(initialValues?.budget || 260);
  const [dietary, setDietary] = useState<string[]>(initialValues?.dietary || ['Vegetarian Options', 'Gluten-Free Friendly']);
  const [vibe, setVibe] = useState(initialValues?.vibe || 'Festive, golden hour sunset, vibrant');
  const [alcoholPreference, setAlcoholPreference] = useState<
    'full_bar' | 'beer_wine_only' | 'cocktail_focused' | 'non_alcoholic_only'
  >(initialValues?.alcoholPreference || 'cocktail_focused');
  const [notes, setNotes] = useState(initialValues?.notes || '');

  const totalGuests = adultCount + kidCount;
  const budgetPerGuest = totalGuests > 0 ? Math.round(budget / totalGuests) : 0;

  const dietaryOptions = [
    'Vegetarian Options',
    'Vegan Options',
    'Gluten-Free Friendly',
    'Dairy-Free Friendly',
    'Nut Allergy Safe',
    'Kid Snacks Friendly',
    'Halal Friendly',
  ];

  const partyTypes = [
    'Dinner & Cocktail Party',
    'Backyard BBQ & Cookout',
    'Cocktail Soirée & Bites',
    "Kid's Birthday Party",
    'Game Day Watch Party',
    'Brunch & Mimosas',
  ];

  const toggleDietary = (opt: string) => {
    if (dietary.includes(opt)) {
      setDietary(dietary.filter((d) => d !== opt));
    } else {
      setDietary([...dietary, opt]);
    }
  };

  const handleApplyPreset = (preset: PartyPreset) => {
    setEventName(preset.name);
    setTheme(preset.theme);
    setEventType(preset.eventType);
    setAdultCount(preset.adultCount);
    setKidCount(preset.kidCount);
    setDurationHours(preset.durationHours);
    setBudget(preset.budget);
    setDietary(preset.dietary);
    setVibe(preset.vibe);
    setAlcoholPreference(preset.alcoholPreference);
    onLoadPreset(preset);
  };

  const handleNaturalIntentParse = () => {
    const text = naturalIntent.toLowerCase();
    if (!text.trim()) return;

    if (text.includes('bbq') || text.includes('cookout')) {
      setEventType('Backyard BBQ & Cookout');
      setTheme('Smoky BBQ & Craft Brews');
    } else if (text.includes('taco') || text.includes('mexican') || text.includes('margarita')) {
      setEventType('Dinner & Cocktail Party');
      setTheme('Baja Tacos & Margaritas');
    } else if (text.includes('birthday') || text.includes('kids')) {
      setEventType("Kid's Birthday Party");
      setKidCount(10);
      setAlcoholPreference('non_alcoholic_only');
    }

    // Guess guest count from number
    const matchGuests = text.match(/(\d+)\s*(people|guests|adults|friends)/);
    if (matchGuests && matchGuests[1]) {
      setAdultCount(parseInt(matchGuests[1], 10));
    }

    // Guess budget
    const matchBudget = text.match(/\$?(\d+)\s*(budget|dollars|\$)/);
    if (matchBudget && matchBudget[1]) {
      setBudget(parseInt(matchBudget[1], 10));
    }

    if (text.includes('vegan')) toggleDietary('Vegan Options');
    if (text.includes('gluten')) toggleDietary('Gluten-Free Friendly');

    setNotes(naturalIntent);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePlan({
      eventName,
      theme,
      eventType,
      adultCount,
      kidCount,
      durationHours,
      budget,
      dietary,
      vibe,
      alcoholPreference,
      notes: notes || naturalIntent,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              Task 1 of 3 · Event Definition
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300">CymbalMart AI Shopping Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Define Your Event Intent
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Busy host? Tell us what you're hosting, your guest count, and your budget. Our agent will calculate
            exact portion math, ice formulas, and build a store-by-store CymbalMart shopping itinerary.
          </p>

          {/* Quick Plain-English Intent Box */}
          <div className="mt-5 p-3 sm:p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Hosting 16 friends for a backyard Mexican taco night, $280 budget, 2 vegans"
              value={naturalIntent}
              onChange={(e) => setNaturalIntent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNaturalIntentParse()}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900/90 text-white placeholder-slate-400 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={handleNaturalIntentParse}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Fill Form</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant 1-Click Curated Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Curated CymbalMart Party Templates</span>
          </div>
          <span className="text-xs text-slate-400">Click any preset to load instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PARTY_PRESETS.map((p) => {
            const isSelected = eventName === p.name;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-900 leading-snug">{p.name}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    {formatCurrency(p.budget)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 font-medium">
                  <span>{p.adultCount} adults</span>
                  <span>·</span>
                  <span>{p.durationHours} hrs</span>
                  <span>·</span>
                  <span className="text-amber-700 font-semibold">{p.alcoholPreference === 'non_alcoholic_only' ? 'Dry' : 'Bar'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Parameters Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Custom Event Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fine-tune your party requirements to get mathematically balanced portions and CymbalMart department routing.
          </p>
        </div>

        {/* Event Name & Party Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Event Name *
            </label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Liam's Backyard Cookout"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Party Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {partyTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme & Vibe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Theme / Food Concept
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Smoky Ribs, Gourmet Sliders, Taco Bar"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Atmosphere & Vibe
            </label>
            <input
              type="text"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g. Casual outdoor, candlelit dinner, high-energy"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Guests, Hours & Budget Tier */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
            <span>Headcount & Budget Calculator</span>
            <span className="text-emerald-700 font-semibold">
              ~{formatCurrency(budgetPerGuest)} / guest target
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Adults (18+)
              </label>
              <input
                type="number"
                min="1"
                max="80"
                value={adultCount}
                onChange={(e) => setAdultCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Kids
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={kidCount}
                onChange={(e) => setKidCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value) || 3)}
                className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Total Budget ($ USD)
              </label>
              <input
                type="number"
                min="40"
                max="5000"
                step="10"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 200)}
                className="w-full px-3 py-1.5 text-sm font-bold text-emerald-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Beverage / Bar Preference */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Beverage & Bar Direction
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'cocktail_focused', label: 'Batch Cocktails & Wine' },
              { id: 'beer_wine_only', label: 'Beer, Wine & Seltzers' },
              { id: 'full_bar', label: 'Full Open Spirits Bar' },
              { id: 'non_alcoholic_only', label: '100% Mocktails & Sodas' },
            ].map((bar) => (
              <button
                type="button"
                key={bar.id}
                onClick={() => setAlcoholPreference(bar.id as any)}
                className={`p-2.5 rounded-xl border font-semibold text-left transition-colors ${
                  alcoholPreference === bar.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {bar.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Inclusions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Dietary Preferences & Allergy Safety
          </label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((opt) => {
              const selected = dietary.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleDietary(opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    selected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Special Requests & Equipment Already Owned
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. We already have 2 coolers and BBQ charcoal at home; need gluten-free buns for 3 guests."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Next: Review categorized shopping list and align with budget.
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md flex items-center gap-2 transition-all disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                <span>Agent Calculating Portions & List...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate CymbalMart Shopping List</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
