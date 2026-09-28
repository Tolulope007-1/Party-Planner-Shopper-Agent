import React from 'react';
import { X, Sparkles, Wand2, Compass, Check, ArrowRight } from 'lucide-react';
import { PartyPreset } from '../types/party';
import { PARTY_PRESETS } from '../data/presets';
import { formatCurrency } from '../utils/partyMath';

interface PartySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  isGenerating: boolean;
}

export const PartySetupModal: React.FC<PartySetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isGenerating,
}) => {
  const [eventName, setEventName] = React.useState('Summer Rooftop Fiesta');
  const [theme, setTheme] = React.useState('Baja Tacos & Craft Margaritas');
  const [eventType, setEventType] = React.useState('Cocktail & Bites');
  const [adultCount, setAdultCount] = React.useState(16);
  const [kidCount, setKidCount] = React.useState(0);
  const [durationHours, setDurationHours] = React.useState(4);
  const [budget, setBudget] = React.useState(320);
  const [dietary, setDietary] = React.useState<string[]>(['Vegetarian Options']);
  const [vibe, setVibe] = React.useState('Lively, festive, sunset golden hour');
  const [alcoholPreference, setAlcoholPreference] = React.useState<
    'full_bar' | 'beer_wine_only' | 'cocktail_focused' | 'non_alcoholic_only'
  >('cocktail_focused');
  const [notes, setNotes] = React.useState('');

  if (!isOpen) return null;

  const dietaryOptions = [
    'Vegetarian Options',
    'Vegan Options',
    'Gluten-Free Friendly',
    'Dairy-Free Friendly',
    'Nut Allergy Safe',
    'Kid Snacks Friendly',
    'Halal Friendly',
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
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
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                AI Party Strategist
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">Design Your Party Shopping Plan</h2>
            <p className="text-xs text-white/80 mt-0.5">
              Specify your event details and let the agent calculate portions, shopping lists, and store routes.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quick Presets Carousel */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Quick Theme Presets
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {PARTY_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all text-left ${
                    eventName === p.name
                      ? 'border-amber-500 bg-amber-50 font-semibold text-amber-900'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold">{p.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-500">{formatCurrency(p.budget)} · {p.adultCount} guests</div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Name & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Maya's 30th Birthday Bash"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Theme / Cuisine Focus
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Summer Luau, Italian Pasta Bar"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Guest breakdown, Duration & Budget */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adults (18+)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={adultCount}
                onChange={(e) => setAdultCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kids</label>
              <input
                type="number"
                min="0"
                max="50"
                value={kidCount}
                onChange={(e) => setKidCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hours</label>
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value) || 3)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Budget ($)</label>
              <input
                type="number"
                min="30"
                max="5000"
                step="10"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 250)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold bg-white text-emerald-800"
              />
            </div>
          </div>

          {/* Alcohol & Bar Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Beverage & Bar Direction
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'cocktail_focused', label: 'Batch Cocktails & Wine' },
                { id: 'full_bar', label: 'Full Open Bar' },
                { id: 'beer_wine_only', label: 'Beer, Wine & Seltzers' },
                { id: 'non_alcoholic_only', label: '100% Mocktails / Dry' },
              ].map((bar) => (
                <button
                  type="button"
                  key={bar.id}
                  onClick={() => setAlcoholPreference(bar.id as any)}
                  className={`p-2 rounded-lg border font-medium text-left transition-colors ${
                    alcoholPreference === bar.id
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {bar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dietary Inclusions & Preferences
            </label>
            <div className="flex flex-wrap gap-1.5">
              {dietaryOptions.map((opt) => {
                const selected = dietary.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleDietary(opt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                      selected
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-emerald-600" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibe and Host Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ambiance & Vibe
              </label>
              <input
                type="text"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="e.g. Candlelit, lively DJ tunes, relaxed"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Requests or Equipment
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. We already own a BBQ grill and ice chests"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 shadow-md flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Agent Planning Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Shopping Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
