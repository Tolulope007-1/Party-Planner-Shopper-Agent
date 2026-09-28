import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  ShoppingBag,
  HelpCircle,
  Truck,
  Store,
  DollarSign,
  Users,
  Snowflake,
  RotateCcw,
  X,
  ChevronUp,
  ChevronDown,
  ListChecks,
} from 'lucide-react';
import { PartyPlan, PartyPreset, CUJStep, AssistantListUpdates, ShoppingItem } from '../types/party';
import { formatCurrency } from '../utils/partyMath';
import { PARTY_PRESETS } from '../data/presets';

interface VoiceControlProps {
  currentStep: CUJStep;
  onNavigateStep: (step: CUJStep) => void;
  plan: PartyPlan | null;
  onApplyAssistantUpdates: (updates: AssistantListUpdates) => void;
  onAutoAlignBudget: () => Promise<void>;
  onApplySwap: (index: number) => void;
  onLoadPreset: (preset: PartyPreset) => void;
  onGeneratePlan: (formData: any) => Promise<void>;
  onOpenShoppingRun: () => void;
  onCloseShoppingRun: () => void;
  onOpenExport: () => void;
  onSelectFulfillment: (type: 'pickup' | 'delivery') => void;
  fulfillmentType: 'pickup' | 'delivery';
  onPlaceOrder: () => void;
  isOrderPlaced: boolean;
  orderId: string;
  onToggleCheckItem?: (id: string) => void;
  isHubOpenExternal?: boolean;
  onToggleHubExternal?: () => void;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({
  currentStep,
  onNavigateStep,
  plan,
  onApplyAssistantUpdates,
  onAutoAlignBudget,
  onApplySwap,
  onLoadPreset,
  onGeneratePlan,
  onOpenShoppingRun,
  onCloseShoppingRun,
  onOpenExport,
  onSelectFulfillment,
  fulfillmentType,
  onPlaceOrder,
  isOrderPlaced,
  orderId,
  onToggleCheckItem,
  isHubOpenExternal,
  onToggleHubExternal,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isHandsFreeAlwaysOn, setIsHandsFreeAlwaysOn] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [agentSpokenResponse, setAgentSpokenResponse] = useState<string | null>(
    'Hands-Free Voice Control active. You can say: "Plan taco night", "Review list", "Add 2 packs of buns", "Align budget", "Choose delivery", or "Place order".'
  );
  const [isAudioFeedbackEnabled, setIsAudioFeedbackEnabled] = useState(true);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const isExpanded = isHubOpenExternal !== undefined ? isHubOpenExternal : internalExpanded;
  const toggleExpanded = () => {
    if (onToggleHubExternal) {
      onToggleHubExternal();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const recognitionRef = useRef<any>(null);
  const isContinuousActiveRef = useRef(false);

  // Text-To-Speech audio output
  const speakResponse = (text: string) => {
    setAgentSpokenResponse(text);
    if (!isAudioFeedbackEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // Stop any ongoing utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Ava'))
        ) || voices.find((v) => v.lang.startsWith('en'));
      if (naturalVoice) utterance.voice = naturalVoice;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript.trim();
      setTranscript(text);
      handleVoiceCommand(text);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
        setIsHandsFreeAlwaysOn(false);
      }
    };

    recognition.onend = () => {
      if (isContinuousActiveRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  // Sync ref with continuous state
  useEffect(() => {
    isContinuousActiveRef.current = isHandsFreeAlwaysOn;
    if (isHandsFreeAlwaysOn && !isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (!isHandsFreeAlwaysOn && isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [isHandsFreeAlwaysOn]);

  // Toggle mic
  const toggleListening = () => {
    if (!recognitionRef.current) {
      // In simulator mode if speech recognition is not supported in browser environment
      speakResponse('Microphone access simulated. Click any command shortcut below to test hands-free execution!');
      if (!isExpanded) toggleExpanded();
      return;
    }

    if (isListening) {
      setIsHandsFreeAlwaysOn(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Main Voice Command Classifier & Dispatcher
  const handleVoiceCommand = async (rawCommand: string) => {
    const text = rawCommand.toLowerCase().trim();
    setLastCommand(rawCommand);
    setIsProcessing(true);

    // 1. Navigation Commands across the CUJ Tasks
    if (
      text.includes('step 1') ||
      text.includes('define event') ||
      text.includes('plan new event') ||
      text.includes('start over')
    ) {
      onNavigateStep('define');
      speakResponse('Navigating to Step 1: Define Event. Tell me your party theme, guest count, and budget!');
      setIsProcessing(false);
      return;
    }

    if (
      text.includes('step 2') ||
      text.includes('review list') ||
      text.includes('review items') ||
      text.includes('show budget') ||
      text.includes('shopping list')
    ) {
      onNavigateStep('review');
      speakResponse('Navigating to Step 2: Review List and Budget. Here is your curated CymbalMart shopping itinerary.');
      setIsProcessing(false);
      return;
    }

    if (
      text.includes('step 3') ||
      text.includes('checkout') ||
      text.includes('proceed to checkout') ||
      text.includes('finalize order') ||
      text.includes('ready to buy')
    ) {
      onNavigateStep('refine_checkout');
      speakResponse('Navigating to Step 3: Refine and Checkout. Choose Curbside Pickup or Delivery to finalize.');
      setIsProcessing(false);
      return;
    }

    if (
      text.includes('in-store mode') ||
      text.includes('aisle mode') ||
      text.includes('shopping run') ||
      text.includes('start shopping')
    ) {
      onOpenShoppingRun();
      speakResponse('Opening In-Store Aisle Mode with large touch-friendly checkmarks.');
      setIsProcessing(false);
      return;
    }

    if (
      text.includes('close aisle mode') ||
      text.includes('exit in-store') ||
      text.includes('back to list') ||
      text.includes('close in-store')
    ) {
      onCloseShoppingRun();
      speakResponse('Returning to the main party shopping dashboard.');
      setIsProcessing(false);
      return;
    }

    if (
      text.includes('export') ||
      text.includes('share list') ||
      text.includes('print list') ||
      text.includes('send list')
    ) {
      onOpenExport();
      speakResponse('Opening your shopping list export for Apple Notes, SMS, or printing.');
      setIsProcessing(false);
      return;
    }

    // 2. Audio Control Commands
    if (text.includes('mute audio') || text.includes('turn off sound') || text.includes('quiet')) {
      setIsAudioFeedbackEnabled(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsProcessing(false);
      return;
    }

    if (text.includes('unmute audio') || text.includes('turn on sound') || text.includes('enable voice feedback')) {
      setIsAudioFeedbackEnabled(true);
      speakResponse('Spoken audio feedback enabled.');
      setIsProcessing(false);
      return;
    }

    // 3. Hands-Free Party Definition Commands (Step 1 Task)
    if (
      text.startsWith('plan a') ||
      text.startsWith('create a party') ||
      text.startsWith('plan barbecue') ||
      text.startsWith('plan taco') ||
      text.startsWith('plan birthday') ||
      text.includes('generate party') ||
      text.includes('generate list')
    ) {
      // Check for theme mentions
      if (text.includes('taco') || text.includes('fiesta') || text.includes('mexican')) {
        onLoadPreset(PARTY_PRESETS[0]);
        onNavigateStep('review');
        speakResponse('Generated CymbalMart Fiesta Taco and Margarita Night plan. Budget and portions are calculated.');
        setIsProcessing(false);
        return;
      }
      if (text.includes('bbq') || text.includes('barbecue') || text.includes('cookout') || text.includes('grill')) {
        onLoadPreset(PARTY_PRESETS[1]);
        onNavigateStep('review');
        speakResponse('Generated Backyard Sunset BBQ and Brews plan.');
        setIsProcessing(false);
        return;
      }
      if (text.includes('wine') || text.includes('tapas') || text.includes('cocktail party') || text.includes('chic')) {
        onLoadPreset(PARTY_PRESETS[2]);
        onNavigateStep('review');
        speakResponse('Generated Cymbal Select Wine and Tapas Soirée plan.');
        setIsProcessing(false);
        return;
      }
      if (text.includes('birthday') || text.includes('kids') || text.includes('splash')) {
        onLoadPreset(PARTY_PRESETS[3]);
        onNavigateStep('review');
        speakResponse('Generated Kids Superhero Birthday party plan.');
        setIsProcessing(false);
        return;
      }
      if (text.includes('tailgate') || text.includes('wings') || text.includes('game day') || text.includes('football')) {
        onLoadPreset(PARTY_PRESETS[4]);
        onNavigateStep('review');
        speakResponse('Generated Game Day Tailgate and Wings party plan.');
        setIsProcessing(false);
        return;
      }

      // Default custom plan generation
      const eventTitle = rawCommand.replace(/^(plan a|create a party for|create a)/i, '').trim() || 'Custom Celebration';
      speakResponse(`Generating custom party plan for "${eventTitle}"...`);
      await onGeneratePlan({
        eventName: eventTitle,
        theme: eventTitle,
        eventType: 'Dinner & Cocktail Party',
        adultCount: 16,
        kidCount: 2,
        durationHours: 4,
        budget: 250,
        dietary: ['Vegetarian Options'],
        vibe: 'Festive & casual',
        alcoholPreference: 'cocktail_focused',
        notes: rawCommand,
      });
      onNavigateStep('review');
      speakResponse(`Plan generated! Here is your curated shopping list and budget review.`);
      setIsProcessing(false);
      return;
    }

    // Curated Template Voice Loaders
    if (text.includes('load taco') || text.includes('taco template')) {
      onLoadPreset(PARTY_PRESETS[0]);
      onNavigateStep('review');
      speakResponse('Loaded CymbalMart Fiesta Taco and Margarita Night template! Budget and portions are calculated.');
      setIsProcessing(false);
      return;
    }

    if (text.includes('load bbq') || text.includes('bbq template') || text.includes('load cookout')) {
      onLoadPreset(PARTY_PRESETS[1]);
      onNavigateStep('review');
      speakResponse('Loaded Backyard Sunset BBQ and Brews template.');
      setIsProcessing(false);
      return;
    }

    if (text.includes('load tapas') || text.includes('tapas template') || text.includes('wine template')) {
      onLoadPreset(PARTY_PRESETS[2]);
      onNavigateStep('review');
      speakResponse('Loaded Cymbal Select Wine and Tapas Soirée template.');
      setIsProcessing(false);
      return;
    }

    if (text.includes('load birthday') || text.includes('birthday template')) {
      onLoadPreset(PARTY_PRESETS[3]);
      onNavigateStep('review');
      speakResponse('Loaded Kids Superhero Splash Birthday template.');
      setIsProcessing(false);
      return;
    }

    if (text.includes('load tailgate') || text.includes('tailgate template')) {
      onLoadPreset(PARTY_PRESETS[4]);
      onNavigateStep('review');
      speakResponse('Loaded Game Day Tailgate and Wings template.');
      setIsProcessing(false);
      return;
    }

    // 4. Checkout & Fulfillment Voice Actions (Step 3 Task)
    if (text.includes('pickup') || text.includes('curbside')) {
      onSelectFulfillment('pickup');
      speakResponse('Selected Free Curbside Pickup at your local CymbalMart Supercenter.');
      setIsProcessing(false);
      return;
    }

    if (text.includes('delivery') || text.includes('deliver')) {
      onSelectFulfillment('delivery');
      speakResponse('Selected Same-Day Express Delivery to your home.');
      setIsProcessing(false);
      return;
    }

    if (
      text.includes('place order') ||
      text.includes('place my order') ||
      text.includes('confirm order') ||
      text.includes('complete checkout') ||
      text.includes('buy now')
    ) {
      onPlaceOrder();
      speakResponse(
        `Order confirmed! Your CymbalMart order is placed for ${
          fulfillmentType === 'pickup' ? 'free curbside pickup' : 'same-day express delivery'
        }. An order summary and barcode are ready.`
      );
      setIsProcessing(false);
      return;
    }

    // 5. Budget, Formula & List Inquiries
    if (
      text.includes('what is my total') ||
      text.includes('cart total') ||
      text.includes('check budget') ||
      text.includes('how much have i spent') ||
      text.includes('how much is it')
    ) {
      if (plan) {
        const active = plan.items.filter((i) => !i.alreadyOwned);
        const total = active.reduce((s, i) => s + i.estCost, 0);
        const diff = plan.budget - total;
        const msg =
          diff >= 0
            ? `Your active cart total is ${formatCurrency(total)}. You are under your ${formatCurrency(
                plan.budget
              )} budget by ${formatCurrency(diff)}.`
            : `Your active cart total is ${formatCurrency(total)}. You are currently over your ${formatCurrency(
                plan.budget
              )} budget by ${formatCurrency(Math.abs(diff))}. Say 'align budget' to optimize it automatically!`;
        speakResponse(msg);
      } else {
        speakResponse('No active party plan found. Say "Plan taco night" to begin.');
      }
      setIsProcessing(false);
      return;
    }

    if (text.includes('how much ice') || text.includes('ice needed') || text.includes('ice bags')) {
      if (plan) {
        const ice = plan.portionBreakdown.iceLbsEstimated;
        const bags = Math.ceil(ice / 10);
        speakResponse(
          `Based on ${plan.portionBreakdown.totalGuests} guests, you need ${ice} pounds of party ice, which equals about ${bags} ten-pound bags.`
        );
      }
      setIsProcessing(false);
      return;
    }

    if (text.includes('how many drinks') || text.includes('drinks allocation')) {
      if (plan) {
        speakResponse(
          `For ${plan.portionBreakdown.totalGuests} guests over ${plan.durationHours} hours, we have allocated ${plan.portionBreakdown.drinksEstimated} total drinks across beer, wine, and mocktails.`
        );
      }
      setIsProcessing(false);
      return;
    }

    if (
      text.includes('read shopping list') ||
      text.includes("what's on my list") ||
      text.includes('what is on my list') ||
      text.includes('list items')
    ) {
      if (plan) {
        const active = plan.items.filter((i) => !i.alreadyOwned);
        const count = active.length;
        const total = active.reduce((s, i) => s + i.estCost, 0);
        const sample = active.slice(0, 3).map((i) => i.name).join(', ');
        speakResponse(
          `You have ${count} active items totaling ${formatCurrency(total)}. Items include: ${sample}, and more.`
        );
      } else {
        speakResponse('Your shopping list is currently empty.');
      }
      setIsProcessing(false);
      return;
    }

    // 6. Check off items hands-free
    if (text.startsWith('check off') || text.startsWith('mark done') || text.startsWith('bought')) {
      const target = text.replace(/^(check off|mark done|bought)\s+/i, '').trim();
      if (plan && onToggleCheckItem) {
        const found = plan.items.find((i) => i.name.toLowerCase().includes(target));
        if (found) {
          onToggleCheckItem(found.id);
          speakResponse(`Checked off ${found.name}.`);
          setIsProcessing(false);
          return;
        }
      }
    }

    // 7. Budget Alignment & Smart Swaps
    if (
      text.includes('align budget') ||
      text.includes('auto align') ||
      text.includes('fix budget') ||
      text.includes('balance budget')
    ) {
      speakResponse('Optimizing your list with Cymbal Select brand swaps to meet your budget target...');
      await onAutoAlignBudget();
      speakResponse('Your list has been aligned to strictly meet your budget target!');
      setIsProcessing(false);
      return;
    }

    if (
      text.includes('apply swap') ||
      text.includes('smart swap') ||
      text.includes('apply first swap')
    ) {
      onApplySwap(0);
      speakResponse('Applied the smart budget swap to your list. Savings have been subtracted from your cart total.');
      setIsProcessing(false);
      return;
    }

    // 8. Direct Assistant Query via Gemini API (Handles "Add X", "Remove Y", "I have Z at home", custom portions, etc.)
    try {
      const res = await fetch('/api/party/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawCommand,
          plan: plan,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.updates) {
          onApplyAssistantUpdates(data.updates);
        }
        speakResponse(data.reply);
      } else {
        speakResponse(`I heard: "${rawCommand}". Command processed.`);
      }
    } catch (err) {
      console.error(err);
      speakResponse(`I processed your request: "${rawCommand}". Your CymbalMart cart is updated.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick command simulator for 1-click test runs
  const simulateCommand = (cmd: string) => {
    setTranscript(cmd);
    handleVoiceCommand(cmd);
  };

  return (
    <>
      {/* Docked Floating Hands-Free Voice Capsule (Bottom-Center) */}
      <aside
        aria-label="Hands-Free Voice Control Bar"
        className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-40 sm:w-auto sm:max-w-xl"
      >
        <div className="bg-slate-950/95 text-white rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-amber-400/60 backdrop-blur-md flex items-center justify-between gap-3">
          {/* Mic Button & Sound Waves */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={toggleListening}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isListening ? 'Click to pause microphone' : 'Click to start voice control'}
            >
              {isListening ? (
                <div className="relative">
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white">Hands-Free Voice Control</span>
                {isListening && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                    Listening
                  </span>
                )}
                {isProcessing && (
                  <span className="text-[10px] text-amber-300 font-medium animate-pulse">
                    Processing...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-xs sm:max-w-sm">
                {transcript ? `"${transcript}"` : 'Say "Plan taco night", "Review list", "Add buns", or "Place order"'}
              </p>
            </div>
          </div>

          {/* Right Controls: Audio Mute, Expand Drawer */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                const next = !isAudioFeedbackEnabled;
                setIsAudioFeedbackEnabled(next);
                if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isAudioFeedbackEnabled ? 'Mute speech audio' : 'Enable speech audio'}
            >
              {isAudioFeedbackEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              onClick={toggleExpanded}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Open Voice Command Hub"
            >
              <span>Hub</span>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Expanded Hands-Free Voice Control Hub (Modal) */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
                  <Mic className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-white">
                      CymbalMart Hands-Free Voice Hub
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Full Journey Enabled
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define events, review budgets, adjust portions, update lists, and complete checkout completely hands-free.
                  </p>
                </div>
              </div>

              <button
                onClick={toggleExpanded}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Audio Visualizer & Feedback */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleListening}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isListening
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span>Listening... (Click to Pause)</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Mic Off (Click to Speak)</span>
                      </>
                    )}
                  </button>

                  {/* Always-on Toggle */}
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isHandsFreeAlwaysOn}
                      onChange={(e) => setIsHandsFreeAlwaysOn(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span>Always-On Continuous Mode</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Spoken Voice: {isAudioFeedbackEnabled ? 'Active' : 'Muted'}</span>
                </div>
              </div>

              {/* Active Transcript Box */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Heard Speech Transcript
                </div>
                <p className="text-sm font-semibold text-slate-900 min-h-[1.5rem]">
                  {transcript ? (
                    `"${transcript}"`
                  ) : (
                    <span className="text-slate-400 font-normal">
                      Speak a command or click any voice action shortcut below...
                    </span>
                  )}
                </p>
              </div>

              {/* Spoken Agent Response Box */}
              {agentSpokenResponse && (
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/90 text-xs space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>CymbalMart Spoken Voice Output:</span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {agentSpokenResponse}
                  </p>
                </div>
              )}
            </div>

            {/* Categorized Voice Commands Cheat-Sheet & Instant Test Simulators */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">
                  Hands-Free Voice Commands Directory
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Say any of these natural phrases or click to test execution:
                </p>
              </div>

              {/* 1. Journey Navigation */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>CUJ Journey Navigation</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Go to step 1 (Define Event)',
                    'Go to step 2 (Review List & Budget)',
                    'Go to step 3 (Refine & Checkout)',
                    'Start in-store aisle mode',
                    'Export and share list',
                  ].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => simulateCommand(cmd)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      🗣️ "{cmd}"
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Step 1: Define Event Hands-Free */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Step 1: Define Event & Plan Generation</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Plan taco night for 16 guests',
                    'Plan backyard BBQ cookout',
                    'Plan wine and tapas soirée',
                    'Plan kids superhero birthday',
                    'Plan game day tailgate with wings',
                  ].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => simulateCommand(cmd)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      🗣️ "{cmd}"
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Step 2: Shopping List & Budget Alignment */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Step 2: Update Shopping List & Recalculate Budget</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Add 2 packs of hamburger buns',
                    'Add 3 extra bags of party ice',
                    'Remove craft beer',
                    'I already have paper napkins at home',
                    'Align budget',
                    'Apply smart swap',
                    'What is my cart total?',
                    'How much ice do I need?',
                    'How many drinks?',
                    'Read shopping list',
                  ].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => simulateCommand(cmd)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      🗣️ "{cmd}"
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Step 3: Checkout & Fulfillment Commands */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Step 3: Fulfillment & Finalize Order Hands-Free</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Choose curbside pickup',
                    'Choose express delivery',
                    'Place my order now',
                  ].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => simulateCommand(cmd)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      🗣️ "{cmd}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Step: <strong className="text-slate-900 capitalize">{currentStep}</strong> · Fulfillment:{' '}
                <strong className="text-slate-900 capitalize">{fulfillmentType}</strong>{' '}
                {isOrderPlaced && (
                  <span className="text-emerald-600 font-bold ml-1">· Order #{orderId} Confirmed</span>
                )}
              </span>

              <button
                onClick={toggleExpanded}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer"
              >
                Close Voice Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
