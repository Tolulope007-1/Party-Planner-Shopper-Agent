import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DefineEventView } from './components/DefineEventView';
import { ReviewListBudgetView } from './components/ReviewListBudgetView';
import { RefineCheckoutView } from './components/RefineCheckoutView';
import { ShoppingRunModal } from './components/ShoppingRunModal';
import { PartySetupModal } from './components/PartySetupModal';
import { CymbalMartAssistant } from './components/CymbalMartAssistant';
import { ExportModal } from './components/ExportModal';
import { VoiceControl } from './components/VoiceControl';
import { PartyPlan, PartyPreset, ShoppingItem, CUJStep, AssistantListUpdates } from './types/party';
import { PARTY_PRESETS } from './data/presets';
import { calculatePortions, formatCurrency } from './utils/partyMath';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

const STORAGE_KEY = 'cymbalmart_party_plans_v2';
const ACTIVE_PLAN_KEY = 'cymbalmart_active_id_v2';
const ACTIVE_STEP_KEY = 'cymbalmart_active_step_v2';

export default function App() {
  const [currentStep, setCurrentStep] = useState<CUJStep>('review');
  const [plans, setPlans] = useState<PartyPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>('');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isShoppingRunOpen, setIsShoppingRunOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isAligningBudget, setIsAligningBudget] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isVoiceHubOpen, setIsVoiceHubOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePlaceOrderVoice = () => {
    const newOrderId = `CYM-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(newOrderId);
    setIsOrderPlaced(true);
    setCurrentStep('refine_checkout');
    showToast(`Order #${newOrderId} confirmed for ${fulfillmentType === 'pickup' ? 'free curbside pickup' : 'same-day delivery'}!`);
  };

  const handleResetOrder = () => {
    setIsOrderPlaced(false);
    setOrderId('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to build initial plan from preset
  const buildPlanFromPreset = async (preset: PartyPreset): Promise<PartyPlan> => {
    try {
      const res = await fetch('/api/party/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: preset.name,
          theme: preset.theme,
          eventType: preset.eventType,
          adultCount: preset.adultCount,
          kidCount: preset.kidCount,
          durationHours: preset.durationHours,
          budget: preset.budget,
          dietary: preset.dietary,
          vibe: preset.vibe,
          alcoholPreference: preset.alcoholPreference,
          notes: preset.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          eventName: preset.name,
          theme: preset.theme,
          eventType: preset.eventType,
          adultCount: preset.adultCount,
          kidCount: preset.kidCount,
          durationHours: preset.durationHours,
          budget: preset.budget,
          dietary: preset.dietary,
          vibe: preset.vibe,
          alcoholPreference: preset.alcoholPreference,
          summary: data.summary,
          portionBreakdown: data.portionBreakdown,
          items: data.items,
          smartSwaps: data.smartSwaps,
          hostTimeline: data.hostTimeline,
          signatureCocktailOrMocktail: data.signatureCocktailOrMocktail,
          createdAt: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Initial server generation fetch failed, initializing local fallback:', e);
    }

    const portions = calculatePortions(preset.adultCount, preset.kidCount, preset.durationHours, preset.alcoholPreference);
    return {
      id: `plan-preset-${preset.id}`,
      eventName: preset.name,
      theme: preset.theme,
      eventType: preset.eventType,
      adultCount: preset.adultCount,
      kidCount: preset.kidCount,
      durationHours: preset.durationHours,
      budget: preset.budget,
      dietary: preset.dietary,
      vibe: preset.vibe,
      alcoholPreference: preset.alcoholPreference,
      summary: `CymbalMart tailored plan for ${preset.name} hosting ${preset.adultCount} adults for ${preset.durationHours} hours.`,
      portionBreakdown: {
        totalGuests: portions.totalGuests,
        adults: preset.adultCount,
        kids: preset.kidCount,
        drinksEstimated: portions.totalAlcoholicDrinks + portions.totalNonAlcoholicDrinks,
        iceLbsEstimated: portions.iceLbs,
        servingsPerCategory: `${portions.proteinLbs} lbs main protein, ~${portions.appetizerBites} bites`,
        suppliesMultiplier: '1.75x guest count buffer',
      },
      items: [
        {
          id: 'item-1',
          name: 'Cymbal Butcher Choice Carnitas & Seasoned Chicken Strips',
          category: 'food',
          department: 'butcher_seafood',
          quantity: `${portions.proteinLbs} lbs total`,
          unit: 'lbs',
          estCost: 42,
          recommendedStore: 'supermarket',
          aisle: 'Butcher Counter - Case 3',
          tip: 'Ask butcher behind the counter for complimentary pre-marinating.',
          isCore: true,
          isCymbalBrand: true,
        },
        {
          id: 'item-2',
          name: 'Cymbal Fresh Corn & Flour Tortillas (Warm Packs)',
          category: 'food',
          department: 'bakery_snacks',
          quantity: '3 packs (36 ct)',
          unit: 'packs',
          estCost: 7.5,
          recommendedStore: 'supermarket',
          aisle: 'Aisle 4 - Bakery Tables',
          tip: 'Keep warm wrapped in foil inside a clean kitchen towel.',
          isCore: true,
          isCymbalBrand: true,
        },
        {
          id: 'item-3',
          name: 'Cymbal Club Bulk Pack Tortilla Chips & Salsa Trio',
          category: 'food',
          department: 'bakery_snacks',
          quantity: '2 giant club bags',
          unit: 'bags',
          estCost: 12,
          recommendedStore: 'wholesale_club',
          aisle: 'Club Bulk Aisles 5-6',
          tip: 'Cymbal Club size saves 35% over individual standard grocery bags.',
          isCore: true,
          isCymbalBrand: true,
        },
        {
          id: 'item-4',
          name: 'Fresh Hass Avocados, Limes, Cilantro & Jalapeños',
          category: 'food',
          department: 'produce_deli',
          quantity: '8 avocados + 1 mesh bag limes',
          unit: 'produce',
          estCost: 14,
          recommendedStore: 'supermarket',
          aisle: 'Fresh Produce - Island 2',
          tip: 'Mash guacamole right before guests arrive with lime to prevent oxidation.',
          isCore: true,
          isCymbalBrand: false,
        },
        {
          id: 'item-5',
          name: 'Cymbal Select Craft Mexican Lager Variety Case',
          category: 'beverages',
          department: 'beverages_ice',
          quantity: '2 × 12-packs',
          unit: '12-packs',
          estCost: 32,
          recommendedStore: 'wholesale_club',
          aisle: 'Aisle 11 - Beer & Ciders',
          tip: 'Cases in the cold walk-in cave are already chilled for immediate serving.',
          isCore: true,
          isCymbalBrand: true,
        },
        {
          id: 'item-6',
          name: 'Cymbal Select Blanco Agave Tequila & Triple Sec (1.75L)',
          category: 'beverages',
          department: 'beverages_ice',
          quantity: '1 handle bottle',
          unit: 'bottle',
          estCost: 34,
          recommendedStore: 'liquor_store',
          aisle: 'Aisle 12 - Spirits & Tequila',
          tip: '1.75L handle bottle provides standard 35 drink pours at lowest unit price.',
          isCore: true,
          isCymbalBrand: true,
        },
        {
          id: 'item-7',
          name: 'Cymbal Pure Lime Sparkling Waters & Mexican Sodas',
          category: 'beverages',
          department: 'beverages_ice',
          quantity: '18 cans/bottles',
          unit: 'cans',
          estCost: 15,
          recommendedStore: 'supermarket',
          aisle: 'Aisle 7 - Water & Mixers',
          tip: 'Great non-alcoholic option and works as bubbly cocktail mixer.',
          isCore: true,
          isCymbalBrand: true,
        },
        {
          id: 'item-8',
          name: 'Cymbal Crystal Party Ice Bags (10-lb each)',
          category: 'ice_chilling',
          department: 'beverages_ice',
          quantity: `${portions.iceBags10lb} bags`,
          unit: 'bags',
          estCost: portions.iceBags10lb * 2.99,
          recommendedStore: 'supermarket',
          aisle: 'Front Entrance Ice Chest',
          tip: 'Keep 1 bag in freezer strictly for beverage glasses; use rest in chill tubs.',
          isCore: true,
          isCymbalBrand: true,
        },
        {
          id: 'item-9',
          name: 'Cymbal Eco-Friendly Compostable Plates & Cups',
          category: 'tableware_supplies',
          department: 'party_essentials',
          quantity: `${portions.tablewareBufferCount} count pack`,
          unit: 'pack',
          estCost: 14,
          recommendedStore: 'party_store',
          aisle: 'Aisle 2 - Party Tableware',
          tip: 'Set out a metallic marker so guests write their name on their cups.',
          isCore: true,
          isCymbalBrand: true,
        },
        {
          id: 'item-10',
          name: 'Cymbal Bakery Mini Churro Bites with Chocolate Dip',
          category: 'food',
          department: 'bakery_snacks',
          quantity: '2 platters',
          unit: 'platters',
          estCost: 12.5,
          recommendedStore: 'supermarket',
          aisle: 'Bakery Pastry Table',
          tip: 'Finger-food desserts eliminate cutting plates and utensils.',
          isCore: false,
          isCymbalBrand: true,
        },
        {
          id: 'item-11',
          name: 'Cymbal Celebration Papel Picado & Table Runner Kit',
          category: 'decor_ambiance',
          department: 'party_essentials',
          quantity: '1 garland + runner',
          unit: 'set',
          estCost: 15,
          recommendedStore: 'party_store',
          aisle: 'Seasonal & Party Celebration Aisle',
          tip: 'Adds instant festive color with zero hassle.',
          isCore: false,
          isCymbalBrand: true,
        },
      ],
      smartSwaps: [
        {
          title: 'Switch to Cymbal Select Brand Essentials',
          savings: 34,
          description: 'Swapping name-brand seltzers, chips, and tortillas for Cymbal Select cuts $34 with identical taste quality.',
          alternativeAction: 'Choose Cymbal Select & Club bulk packs across all aisles.',
          applied: false,
        },
        {
          title: 'Signature Batch Margarita in Dispenser',
          savings: 38,
          description: 'Rather than buying 4 separate liqueurs and custom mixes, batch 1 large pitcher of fresh lime, agave, and tequila.',
          alternativeAction: 'Pre-mix 1 gallon in a glass drink dispenser before guests arrive.',
          applied: false,
        },
        {
          title: 'Cymbal Bakery Finger-Food Sweets vs Custom Cake',
          savings: 22,
          description: 'Custom sheet cakes cost $45+ and leave half-eaten slices. Mini bakery churro and brownie bites leave zero mess.',
          alternativeAction: 'Serve mini churro bites with Mexican chocolate dipping sauce.',
          applied: false,
        },
      ],
      hostTimeline: [
        { time: '3 Days Before', task: 'Finalize RSVP headcount. Schedule your CymbalMart curbside pickup or delivery window.' },
        { time: '1 Day Before', task: 'Pick up fresh meats and produce. Marinate proteins and chill beers and white wines in fridge.' },
        { time: 'Day of: 4 Hours Before', task: 'Pick up 10-lb ice bags. Batch the signature margarita. Set out bowls and napkins.' },
        { time: 'Day of: 1 Hour Before', task: 'Turn on upbeat party playlist, light candles, grill/warm meats, and pour fresh ice in cooler.' },
      ],
      signatureCocktailOrMocktail: {
        name: 'Cymbal Sunset Agave Margarita Batch',
        type: 'Batch Cocktail (Pitcher)',
        ingredients: [
          'Cymbal Select Tequila Blanco (750ml)',
          'Fresh Squeezed Lime Juice (1.5 cups)',
          'Cymbal Organic Agave Nectar (3/4 cup)',
          'Cymbal Pure Lime Sparkling Water (2 cans for effervescence)',
          'Chili-lime salt (Tajín) for glass rims & fresh lime wheels',
        ],
        instructions: 'Whisk tequila, lime juice, and agave in a large pitcher. Dip glass rims in chili-lime salt. Pour over fresh ice and top with sparkling water.',
      },
      createdAt: new Date().toISOString(),
    };
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      const savedPlans = localStorage.getItem(STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_PLAN_KEY);
      const savedStep = localStorage.getItem(ACTIVE_STEP_KEY) as CUJStep;

      if (savedStep && ['define', 'review', 'refine_checkout'].includes(savedStep)) {
        setCurrentStep(savedStep);
      }

      if (savedPlans) {
        try {
          const parsed = JSON.parse(savedPlans);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed);
            if (savedActiveId && parsed.some((p: PartyPlan) => p.id === savedActiveId)) {
              setActivePlanId(savedActiveId);
            } else {
              setActivePlanId(parsed[0].id);
            }
            return;
          }
        } catch (e) {
          console.error('Failed to parse saved plans:', e);
        }
      }

      const defaultPlan = await buildPlanFromPreset(PARTY_PRESETS[0]);
      setPlans([defaultPlan]);
      setActivePlanId(defaultPlan.id);
    };

    init();
  }, []);

  // Save to localStorage when plans change
  useEffect(() => {
    if (plans.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    }
  }, [plans]);

  useEffect(() => {
    if (activePlanId) {
      localStorage.setItem(ACTIVE_PLAN_KEY, activePlanId);
    }
  }, [activePlanId]);

  useEffect(() => {
    if (currentStep) {
      localStorage.setItem(ACTIVE_STEP_KEY, currentStep);
    }
  }, [currentStep]);

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || null;

  // Handlers for modifying the active plan
  const updateActivePlan = (updater: (prev: PartyPlan) => PartyPlan) => {
    if (!activePlan) return;
    setPlans((prevPlans) =>
      prevPlans.map((p) => (p.id === activePlan.id ? updater(p) : p))
    );
  };

  const handleToggleCheckItem = (itemId: string) => {
    updateActivePlan((plan) => ({
      ...plan,
      items: plan.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
    }));
  };

  const handleResetChecks = () => {
    updateActivePlan((plan) => ({
      ...plan,
      items: plan.items.map((i) => ({ ...i, checked: false })),
    }));
    showToast('Reset all shopping checkmarks');
  };

  const handleToggleAlreadyOwned = (itemId: string) => {
    updateActivePlan((plan) => {
      const updated = plan.items.map((i) => {
        if (i.id === itemId) {
          const newOwned = !i.alreadyOwned;
          return { ...i, alreadyOwned: newOwned, checked: newOwned ? true : i.checked };
        }
        return i;
      });
      return { ...plan, items: updated };
    });
    showToast('Updated item ownership status');
  };

  const handleDeleteItem = (itemId: string) => {
    updateActivePlan((plan) => ({
      ...plan,
      items: plan.items.filter((i) => i.id !== itemId),
    }));
    showToast('Item removed from shopping list');
  };

  const handleUpdateItemCost = (itemId: string, newCost: number) => {
    updateActivePlan((plan) => ({
      ...plan,
      items: plan.items.map((i) => (i.id === itemId ? { ...i, estCost: newCost } : i)),
    }));
    showToast('Item price updated');
  };

  const handleUpdateItemQuantity = (itemId: string, newQty: string) => {
    updateActivePlan((plan) => ({
      ...plan,
      items: plan.items.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)),
    }));
  };

  const handleAddItem = (newItem: Omit<ShoppingItem, 'id'>) => {
    const itemWithId: ShoppingItem = {
      ...newItem,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      checked: false,
      alreadyOwned: false,
    };
    updateActivePlan((plan) => ({
      ...plan,
      items: [itemWithId, ...plan.items],
    }));
    showToast(`Added "${newItem.name}" to CymbalMart list`);
  };

  // Handle shopping list updates & budget recalculations from CymbalMart Assistant
  const handleApplyAssistantUpdates = (updates: AssistantListUpdates) => {
    updateActivePlan((plan) => {
      let updatedItems = [...plan.items];
      let newBudget = plan.budget;

      // 1. Process items to add
      if (updates.itemsToAdd && updates.itemsToAdd.length > 0) {
        const addedWithIds = updates.itemsToAdd.map((item) => ({
          ...item,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          checked: false,
          alreadyOwned: false,
          customAdded: true,
        }));
        updatedItems = [...addedWithIds, ...updatedItems];
      }

      // 2. Process items to remove
      if (updates.itemsToRemove && updates.itemsToRemove.length > 0) {
        const removeTargets = updates.itemsToRemove.map((t) => t.toLowerCase());
        updatedItems = updatedItems.filter(
          (item) => !removeTargets.some((t) => item.id.toLowerCase() === t || item.name.toLowerCase().includes(t))
        );
      }

      // 3. Process items to update (quantity, cost, alreadyOwned)
      if (updates.itemsToUpdate && updates.itemsToUpdate.length > 0) {
        updatedItems = updatedItems.map((item) => {
          const matched = updates.itemsToUpdate?.find(
            (u) =>
              item.id.toLowerCase() === u.nameOrId.toLowerCase() ||
              item.name.toLowerCase().includes(u.nameOrId.toLowerCase())
          );
          if (matched) {
            return {
              ...item,
              quantity: matched.newQuantity !== undefined ? matched.newQuantity : item.quantity,
              estCost: matched.newCost !== undefined ? matched.newCost : item.estCost,
              alreadyOwned: matched.alreadyOwned !== undefined ? matched.alreadyOwned : item.alreadyOwned,
            };
          }
          return item;
        });
      }

      // 4. Process budget change
      if (updates.newTargetBudget !== undefined && updates.newTargetBudget > 0) {
        newBudget = updates.newTargetBudget;
      }

      // Calculate newly updated totals for notification
      const activeTotal = updatedItems
        .filter((i) => !i.alreadyOwned)
        .reduce((sum, i) => sum + i.estCost, 0);

      const budgetDiff = newBudget - activeTotal;
      const budgetStatus = budgetDiff >= 0
        ? `Under budget by ${formatCurrency(budgetDiff)}`
        : `Over budget by ${formatCurrency(Math.abs(budgetDiff))}`;

      showToast(`CymbalMart Assistant: List & Budget recalculated (${formatCurrency(activeTotal)} / ${formatCurrency(newBudget)} · ${budgetStatus})`);

      return {
        ...plan,
        items: updatedItems,
        budget: newBudget,
      };
    });
  };

  const handleToggleTimelineStep = (index: number) => {
    updateActivePlan((plan) => {
      const updated = [...plan.hostTimeline];
      updated[index] = { ...updated[index], done: !updated[index].done };
      return { ...plan, hostTimeline: updated };
    });
  };

  const handleApplySwap = (swapIndex: number) => {
    if (!activePlan) return;
    const swap = activePlan.smartSwaps[swapIndex];
    if (!swap || swap.applied) return;

    updateActivePlan((plan) => {
      const updatedSwaps = [...plan.smartSwaps];
      updatedSwaps[swapIndex] = { ...updatedSwaps[swapIndex], applied: true };

      const updatedItems = plan.items.map((item) => {
        if (swapIndex === 0 && item.category === 'beverages' && item.estCost > 15) {
          return { ...item, estCost: Math.max(8, item.estCost - 10), isCymbalBrand: true };
        }
        if (swapIndex === 1 && item.category === 'beverages' && item.name.toLowerCase().includes('wine')) {
          return { ...item, estCost: Math.max(10, item.estCost - 8) };
        }
        if (swapIndex === 2 && item.category === 'food' && item.name.toLowerCase().includes('churro')) {
          return { ...item, estCost: Math.max(8, item.estCost - 5) };
        }
        return item;
      });

      return {
        ...plan,
        smartSwaps: updatedSwaps,
        items: updatedItems,
      };
    });

    showToast(`Applied: "${swap.title}"! Saved ~${formatCurrency(swap.savings)}`);
  };

  const handleUpdateGuestsAndHours = (adults: number, kids: number, hours: number) => {
    updateActivePlan((plan) => {
      const portions = calculatePortions(adults, kids, hours, plan.alcoholPreference);
      return {
        ...plan,
        adultCount: adults,
        kidCount: kids,
        durationHours: hours,
        portionBreakdown: {
          ...plan.portionBreakdown,
          totalGuests: portions.totalGuests,
          adults: adults,
          kids: kids,
          drinksEstimated: portions.totalAlcoholicDrinks + portions.totalNonAlcoholicDrinks,
          iceLbsEstimated: portions.iceLbs,
        },
      };
    });
  };

  const handleRecalculatePlan = async () => {
    if (!activePlan) return;
    setIsRecalculating(true);

    try {
      const res = await fetch('/api/party/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: activePlan.eventName,
          theme: activePlan.theme,
          eventType: activePlan.eventType,
          adultCount: activePlan.adultCount,
          kidCount: activePlan.kidCount,
          durationHours: activePlan.durationHours,
          budget: activePlan.budget,
          dietary: activePlan.dietary,
          vibe: activePlan.vibe,
          alcoholPreference: activePlan.alcoholPreference,
          notes: activePlan.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateActivePlan((plan) => ({
          ...plan,
          portionBreakdown: data.portionBreakdown,
          items: data.items,
          smartSwaps: data.smartSwaps,
          hostTimeline: data.hostTimeline,
          signatureCocktailOrMocktail: data.signatureCocktailOrMocktail,
        }));
        showToast('Recalculated portions & quantities!');
      }
    } catch (e) {
      console.error(e);
      showToast('Recalculation error, please try again.');
    } finally {
      setIsRecalculating(false);
    }
  };

  // 1-Click Auto-Align with Budget
  const handleAutoAlignBudget = async () => {
    if (!activePlan) return;
    setIsAligningBudget(true);

    try {
      const res = await fetch('/api/party/align-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: activePlan.items,
          targetBudget: activePlan.budget,
          guestCount: activePlan.portionBreakdown.totalGuests,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          updateActivePlan((plan) => ({
            ...plan,
            items: data.items,
          }));
          showToast(data.summary || `List aligned to meet your ${formatCurrency(activePlan.budget)} budget!`);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Budget alignment error, please try again.');
    } finally {
      setIsAligningBudget(false);
    }
  };

  // Generate new party plan from Define Event view or modal
  const handleCreateNewPlan = async (formData: any) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/party/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Generation error');

      const data = await res.json();
      const newPlan: PartyPlan = {
        id: `plan-${Date.now()}`,
        eventName: formData.eventName,
        theme: formData.theme,
        eventType: formData.eventType,
        adultCount: formData.adultCount,
        kidCount: formData.kidCount,
        durationHours: formData.durationHours,
        budget: formData.budget,
        dietary: formData.dietary,
        vibe: formData.vibe,
        alcoholPreference: formData.alcoholPreference,
        notes: formData.notes,
        summary: data.summary,
        portionBreakdown: data.portionBreakdown,
        items: data.items,
        smartSwaps: data.smartSwaps,
        hostTimeline: data.hostTimeline,
        signatureCocktailOrMocktail: data.signatureCocktailOrMocktail,
        createdAt: new Date().toISOString(),
      };

      setPlans((prev) => [newPlan, ...prev]);
      setActivePlanId(newPlan.id);
      setIsSetupModalOpen(false);
      setCurrentStep('review'); // Advance to Step 2
      showToast(`Party Plan for "${formData.eventName}" generated!`);
    } catch (err) {
      console.error(err);
      const presetMock: PartyPreset = {
        id: 'custom',
        name: formData.eventName,
        theme: formData.theme,
        eventType: formData.eventType,
        adultCount: formData.adultCount,
        kidCount: formData.kidCount,
        durationHours: formData.durationHours,
        budget: formData.budget,
        dietary: formData.dietary,
        vibe: formData.vibe,
        alcoholPreference: formData.alcoholPreference,
        description: formData.notes,
      };
      const fallback = await buildPlanFromPreset(presetMock);
      setPlans((prev) => [fallback, ...prev]);
      setActivePlanId(fallback.id);
      setIsSetupModalOpen(false);
      setCurrentStep('review');
      showToast(`Plan created for "${formData.eventName}"!`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPreset = async (preset: PartyPreset) => {
    const existing = plans.find((p) => p.eventName === preset.name);
    if (existing) {
      setActivePlanId(existing.id);
      setCurrentStep('review');
      showToast(`Switched to "${preset.name}"`);
      return;
    }

    const newPlan = await buildPlanFromPreset(preset);
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
    setCurrentStep('review');
    showToast(`Loaded "${preset.name}" CymbalMart template!`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-amber-200 selection:text-amber-950 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main CymbalMart Header */}
      <Header
        currentStep={currentStep}
        onSetStep={setCurrentStep}
        plan={activePlan}
        plans={plans}
        onSelectPlan={setActivePlanId}
        onOpenNewPlanModal={() => setCurrentStep('define')}
        onLoadPreset={handleLoadPreset}
        onOpenShoppingRun={() => setIsShoppingRunOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onOpenVoiceControl={() => setIsVoiceHubOpen(true)}
      />

      {/* Main Content Area: Renders the active CUJ Step */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {currentStep === 'define' && (
          <DefineEventView
            onGeneratePlan={handleCreateNewPlan}
            isGenerating={isGenerating}
            onLoadPreset={handleLoadPreset}
            initialValues={activePlan}
          />
        )}

        {currentStep === 'review' && activePlan && (
          <ReviewListBudgetView
            plan={activePlan}
            onUpdateGuestsAndHours={handleUpdateGuestsAndHours}
            onRecalculatePlan={handleRecalculatePlan}
            isRecalculating={isRecalculating}
            onApplySwap={handleApplySwap}
            onToggleCheckItem={handleToggleCheckItem}
            onToggleAlreadyOwned={handleToggleAlreadyOwned}
            onDeleteItem={handleDeleteItem}
            onUpdateItemCost={handleUpdateItemCost}
            onUpdateItemQuantity={handleUpdateItemQuantity}
            onAddItem={handleAddItem}
            onProceedToRefineCheckout={() => setCurrentStep('refine_checkout')}
            onAutoAlignBudget={handleAutoAlignBudget}
            isAligningBudget={isAligningBudget}
          />
        )}

        {currentStep === 'refine_checkout' && activePlan && (
          <RefineCheckoutView
            plan={activePlan}
            onToggleCheckItem={handleToggleCheckItem}
            onToggleAlreadyOwned={handleToggleAlreadyOwned}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onToggleTimelineStep={handleToggleTimelineStep}
            onStartInStoreMode={() => setIsShoppingRunOpen(true)}
            fulfillmentType={fulfillmentType}
            onSetFulfillmentType={setFulfillmentType}
            isOrderPlacedExternal={isOrderPlaced}
            orderIdExternal={orderId}
            onPlaceOrderExternal={handlePlaceOrderVoice}
            onResetOrderExternal={handleResetOrder}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CymbalMart Shopping Agent</span>
            <span>·</span>
            <span>Party Intent to Curated Budget Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">Free Curbside Pickup Available</span>
          </div>
        </div>
      </footer>

      {/* Persistent Floating CymbalMart Assistant Launcher */}
      {activePlan && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl shadow-2xl border border-amber-400/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group backdrop-blur-sm cursor-pointer"
          title="Chat with CymbalMart Assistant"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>CymbalMart Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-amber-300 font-semibold tabular-nums">
              Cart: {formatCurrency(activePlan.items.filter((i) => !i.alreadyOwned).reduce((s, i) => s + i.estCost, 0))} · Live Updates
            </div>
          </div>
        </button>
      )}

      {/* Modals & Slide-Overs */}
      <PartySetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSubmit={handleCreateNewPlan}
        isGenerating={isGenerating}
      />

      {activePlan && (
        <>
          <ShoppingRunModal
            isOpen={isShoppingRunOpen}
            onClose={() => setIsShoppingRunOpen(false)}
            items={activePlan.items}
            eventName={activePlan.eventName}
            onToggleCheckItem={handleToggleCheckItem}
            onResetChecks={handleResetChecks}
          />

          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            plan={activePlan}
          />

          <CymbalMartAssistant
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            plan={activePlan}
            onApplyAssistantUpdates={handleApplyAssistantUpdates}
          />
        </>
      )}

      {/* Hands-Free Voice Control Bar & Hub */}
      <VoiceControl
        currentStep={currentStep}
        onNavigateStep={(step) => setCurrentStep(step)}
        plan={activePlan}
        onApplyAssistantUpdates={handleApplyAssistantUpdates}
        onAutoAlignBudget={handleAutoAlignBudget}
        onApplySwap={handleApplySwap}
        onLoadPreset={handleLoadPreset}
        onGeneratePlan={handleCreateNewPlan}
        onOpenShoppingRun={() => setIsShoppingRunOpen(true)}
        onCloseShoppingRun={() => setIsShoppingRunOpen(false)}
        onOpenExport={() => setIsExportOpen(true)}
        onSelectFulfillment={(type) => setFulfillmentType(type)}
        fulfillmentType={fulfillmentType}
        onPlaceOrder={handlePlaceOrderVoice}
        isOrderPlaced={isOrderPlaced}
        orderId={orderId}
        onToggleCheckItem={handleToggleCheckItem}
        isHubOpenExternal={isVoiceHubOpen}
        onToggleHubExternal={() => setIsVoiceHubOpen(!isVoiceHubOpen)}
      />
    </div>
  );
}
