import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface PartyRequest {
  eventName: string;
  theme: string;
  eventType: string;
  adultCount: number;
  kidCount: number;
  durationHours: number;
  budget: number;
  dietary: string[];
  vibe: string;
  notes?: string;
  alcoholPreference?: 'full_bar' | 'beer_wine_only' | 'cocktail_focused' | 'non_alcoholic_only';
}

// Built-in rule-based fallback generator tailored to CymbalMart
function generateFallbackPartyPlan(req: PartyRequest) {
  const adults = Math.max(0, req.adultCount || 10);
  const kids = Math.max(0, req.kidCount || 0);
  const totalGuests = adults + kids;
  const hours = Math.max(1, req.durationHours || 3);
  const budget = Math.max(50, req.budget || 250);

  // Drinks formula: 2 drinks 1st hour + 1 drink each subsequent hour per drinking adult
  const drinkingAdults = req.alcoholPreference === 'non_alcoholic_only' ? 0 : Math.round(adults * 0.85);
  const drinksPerPerson = 2 + Math.max(0, hours - 1);
  const totalAlcoholicDrinks = drinkingAdults * drinksPerPerson;

  // Ice formula: 1.5 lbs per person for drinks + chilling
  const iceLbs = Math.round(totalGuests * 1.5);
  const iceBags = Math.ceil(iceLbs / 10); // 10lb bags

  // Plates / Cups / Napkins: 1.75x guest count buffer
  const tablewareCount = Math.ceil(totalGuests * 1.75);

  const items = [
    // Beverages & Ice
    ...(req.alcoholPreference !== 'non_alcoholic_only'
      ? [
          {
            id: 'item-wine',
            name: 'Cymbal Select Pinot Noir & Crisp Sauvignon Blanc',
            category: 'beverages',
            quantity: `${Math.ceil((totalAlcoholicDrinks * 0.45) / 5)} bottles (750ml)`,
            unit: 'bottles',
            estCost: Math.ceil((totalAlcoholicDrinks * 0.45) / 5) * 12,
            recommendedStore: 'liquor_store',
            department: 'beverages_ice',
            aisle: 'Aisle 12 - Wine & Spirits',
            tip: 'Cymbal Select wines offer 90+ rated quality at direct-import prices.',
            isCore: true,
            isCymbalBrand: true,
          },
          {
            id: 'item-beer',
            name: 'Cymbal Club Craft IPA & Golden Lager Variety Pack',
            category: 'beverages',
            quantity: `${Math.ceil((totalAlcoholicDrinks * 0.4) / 12)} 12-packs`,
            unit: '12-packs',
            estCost: Math.ceil((totalAlcoholicDrinks * 0.4) / 12) * 16,
            recommendedStore: 'wholesale_club',
            department: 'beverages_ice',
            aisle: 'Aisle 11 - Beer & Hard Seltzers',
            tip: 'Club-size multi-packs save $6 per case vs individual 6-packs.',
            isCore: true,
            isCymbalBrand: true,
          },
        ]
      : []),
    {
      id: 'item-seltzer',
      name: 'Cymbal Pure Sparkling Water (Lime & Grapefruit)',
      category: 'beverages',
      quantity: `${Math.ceil(totalGuests * 1.5)} cans`,
      unit: 'cans',
      estCost: Math.ceil((totalGuests * 1.5) / 12) * 4.5,
      recommendedStore: 'supermarket',
      department: 'beverages_ice',
      aisle: 'Aisle 7 - Water & Mixers',
      tip: 'Zero-calorie fizzy mixer that doubles as a crisp non-alcoholic choice.',
      isCore: true,
      isCymbalBrand: true,
    },
    {
      id: 'item-juice-mixers',
      name: 'Fresh Organic Limes, Lemons, Mint & Agave Nectar',
      category: 'beverages',
      quantity: `${Math.ceil(totalGuests / 4)} packs / bags`,
      unit: 'packs',
      estCost: 14,
      recommendedStore: 'supermarket',
      department: 'produce_deli',
      aisle: 'Fresh Produce - Citrus Island',
      tip: 'Buy Cymbal 2-lb mesh bag of limes instead of loose singles to save 45%.',
      isCore: true,
      isCymbalBrand: false,
    },
    // Ice & Chilling
    {
      id: 'item-ice',
      name: 'Cymbal Crystal Party Ice (10-lb Bags)',
      category: 'ice_chilling',
      quantity: `${iceBags} bags (10 lbs each)`,
      unit: 'bags',
      estCost: iceBags * 2.99,
      recommendedStore: 'supermarket',
      department: 'beverages_ice',
      aisle: 'Front Entrance Ice Freezer',
      tip: 'Store 1 bag in freezer strictly for beverage cups; dump rest into drink coolers.',
      isCore: true,
      isCymbalBrand: true,
    },
    // Butcher & Meats
    {
      id: 'item-protein',
      name: `Cymbal Butcher Choice: ${req.eventType.includes('bbq') ? 'Marinated Pork Shoulder & Chicken Thighs' : req.eventType.includes('taco') ? 'Seasoned Carnitas & Fajita Chicken Strips' : 'Gourmet Sliders & Smoked Sausages'}`,
      category: 'food',
      quantity: `${Math.ceil((totalGuests * 7) / 16)} lbs`,
      unit: 'lbs',
      estCost: Math.ceil((totalGuests * 7) / 16) * 8.5,
      recommendedStore: 'supermarket',
      department: 'butcher_seafood',
      aisle: 'Butcher Counter - Case 3',
      tip: 'Ask the Cymbal butcher to pre-slice or season meat for free behind the counter.',
      isCore: true,
      isCymbalBrand: true,
    },
    // Deli, Snacks & Bakery
    {
      id: 'item-appetizers',
      name: 'Cymbal Deli Fresh Guacamole, Fire-Roasted Salsa & Club Tortilla Chips',
      category: 'food',
      quantity: `${Math.ceil(totalGuests / 4)} party tubs & jumbo bags`,
      unit: 'sets',
      estCost: Math.ceil(totalGuests / 4) * 8,
      recommendedStore: 'wholesale_club',
      department: 'bakery_snacks',
      aisle: 'Deli Prepared Case & Aisle 5',
      tip: 'Made fresh daily in the CymbalMart deli counter.',
      isCore: true,
      isCymbalBrand: true,
    },
    {
      id: 'item-sides',
      name: 'Cymbal Garden Crunch Salad Bowl & Bakery Artisan Dinner Rolls',
      category: 'food',
      quantity: `${Math.ceil(totalGuests / 5)} platters`,
      unit: 'platters',
      estCost: Math.ceil(totalGuests / 5) * 7.5,
      recommendedStore: 'supermarket',
      department: 'produce_deli',
      aisle: 'Produce Greens & Bakery Aisle',
      tip: 'Pre-washed party-sized salad kits save 30 minutes of kitchen prep.',
      isCore: true,
      isCymbalBrand: true,
    },
    {
      id: 'item-dessert',
      name: 'Cymbal Bakery Handcrafted Bite-Sized Brownie & Cookie Platter',
      category: 'food',
      quantity: `${Math.ceil(totalGuests * 1.5)} sweet bites`,
      unit: 'bites',
      estCost: Math.ceil(totalGuests * 1.5) * 0.95,
      recommendedStore: 'supermarket',
      department: 'bakery_snacks',
      aisle: 'Bakery Service Case',
      tip: 'Finger-food sweets prevent cake-cutting mess and save on plates.',
      isCore: false,
      isCymbalBrand: true,
    },
    // Tableware & Cleanup
    {
      id: 'item-plates-cups',
      name: 'Cymbal Eco-Friendly Compostable Sugarcane Plates & Sturdy Cups',
      category: 'tableware_supplies',
      quantity: `${tablewareCount} count pack`,
      unit: 'pack',
      estCost: Math.ceil(tablewareCount * 0.18),
      recommendedStore: 'party_store',
      department: 'party_essentials',
      aisle: 'Aisle 2 - Party Tableware',
      tip: 'Leave a metallic marker at the drink table so guests label their cups.',
      isCore: true,
      isCymbalBrand: true,
    },
    {
      id: 'item-napkins-bags',
      name: 'Cymbal Heavy-Duty 3-Ply Napkins & Tough Drawstring Trash Bags',
      category: 'tableware_supplies',
      quantity: `${Math.ceil(totalGuests * 3)} napkins + 1 box heavy bags`,
      unit: 'pack',
      estCost: 9.5,
      recommendedStore: 'wholesale_club',
      department: 'party_essentials',
      aisle: 'Aisle 1 - Paper & Cleaning Goods',
      tip: 'Set up two clearly labeled bins: 1 for empty cans/bottles, 1 for trash.',
      isCore: true,
      isCymbalBrand: true,
    },
    // Decor & Ambiance
    {
      id: 'item-decor',
      name: `Cymbal Party Ambiance Kit: Theme Accents for "${req.theme || 'Party'}"`,
      category: 'decor_ambiance',
      quantity: '1 curated accent kit',
      unit: 'kit',
      estCost: 18,
      recommendedStore: 'party_store',
      department: 'party_essentials',
      aisle: 'Seasonal & Party Celebration Aisle',
      tip: 'Warm fairy string lights create more cozy mood than disposable banners.',
      isCore: false,
      isCymbalBrand: false,
    },
  ];

  return {
    summary: `CymbalMart curated plan for "${req.eventName}" hosting ${adults} adults${kids > 0 ? ` and ${kids} kids` : ''} for ${hours} hours with a ${req.vibe || 'festive'} vibe.`,
    portionBreakdown: {
      totalGuests,
      adults,
      kids,
      drinksEstimated: totalAlcoholicDrinks + totalGuests * 2,
      iceLbsEstimated: iceLbs,
      servingsPerCategory: '6-8oz protein, 5-6 appetizer bites, 2 dessert bites per person',
      suppliesMultiplier: '1.75x guest count for tableware buffer',
    },
    items,
    smartSwaps: [
      {
        title: 'Switch to Cymbal Select Brand Essentials',
        savings: 36,
        description: 'Swapping national brand chips, seltzers, napkins, and wines for CymbalMart store brands saves 28% with identical quality.',
        alternativeAction: 'Choose Cymbal Select & Cymbal Club bulk packs across all aisles.',
      },
      {
        title: 'Batch Signature Punch in Cymbal Drink Dispenser',
        savings: 42,
        description: 'Buying individual mixed cocktail ingredients costs $40+ more than pre-batching 1 gallon of citrus punch.',
        alternativeAction: 'Batch 1 gallon of citrus punch in a glass dispenser with sliced oranges and fresh mint.',
      },
      {
        title: 'Cymbal Bakery Finger-Food Platter vs Custom Cake',
        savings: 25,
        description: 'Custom ordered cakes often go half-eaten and cost $60+. A fresh Cymbal bakery mini brownie and cookie board leaves zero leftovers.',
        alternativeAction: 'Order the 24-piece assorted bakery sweet platter.',
      },
    ],
    hostTimeline: [
      { time: '3 Days Before', task: 'Finalize RSVP headcount. Schedule your CymbalMart curbside pickup or delivery window.' },
      { time: '1 Day Before', task: 'Pick up fresh meats, bakery & produce. Marinate proteins and chill canned beverages in the fridge.' },
      { time: 'Day of — 4h Before', task: 'Pick up ice bags from CymbalMart. Batch the signature drink and set up drink stations.' },
      { time: 'Day of — 1h Before', task: 'Start party background playlist, warm buffet food, light candles, and fill ice buckets.' },
    ],
    signatureCocktailOrMocktail: {
      name: `${req.theme ? req.theme.split(' ')[0] : 'Cymbal'} Sunset Batch Cooler`,
      type: req.alcoholPreference === 'non_alcoholic_only' ? 'Mocktail' : 'Batch Cocktail / Mocktail Friendly',
      ingredients: [
        'Cymbal Pure Lime Sparkling Water (4 cans)',
        'Cymbal Organic Cranberry & Pomegranate Juice (3 cups)',
        'Fresh Squeezed Lime Juice & Orange Wheels',
        'Tequila Blanco or Vodka (optional 750ml, or ginger beer for mocktail)',
        'Fresh Mint leaves & Cinnamon stick for aroma',
      ],
      instructions: 'In a large drink dispenser, stir chilled juices, fresh lime, and spirits/ginger beer. Top with sparkling water and fresh fruit wheels over a large block of ice.',
    },
  };
}

// POST /api/party/generate
app.post('/api/party/generate', async (req: Request, res: Response) => {
  try {
    const partyReq: PartyRequest = req.body;
    if (!partyReq || !partyReq.eventName) {
      return res.status(400).json({ error: 'Missing required party details (eventName)' });
    }

    if (!apiKey) {
      const fallback = generateFallbackPartyPlan(partyReq);
      return res.json(fallback);
    }

    const systemPrompt = `You are the lead Party Planning Shopping Agent for CymbalMart, the premier grocery and party retailer.
Your mission is to guide busy hosts by converting their party intent into an impeccably curated, budget-conscious CymbalMart shopping list.

CymbalMart Department Guidelines:
- 'produce_deli': Fresh produce, herbs, citrus, pre-made dips, guacamole, salad kits, deli platters.
- 'butcher_seafood': Fresh meat cuts, marinated meats, burger patties, wings, artisan sausages, seafood.
- 'bakery_snacks': Fresh bakery breads, buns, chips, salsa, party pretzels, finger desserts, cookies.
- 'beverages_ice': Sparkling waters, sodas, juices, cocktail mixers, party ice bags (10-lb), craft beers, wines.
- 'party_essentials': Compostable plates, cups, napkins, cutlery, trash bags, tablecloths, candles, theme decor.

CymbalMart Brand Value:
- Highlight 'isCymbalBrand: true' on items that are store-brand staples (Cymbal Select, Cymbal Club bulk packs, Cymbal Organics) to show smart budget savings!

Portion Calculation Rules:
- Alcohol/Drinks: For drinking adults, 2 drinks for 1st hour + 1 drink per subsequent hour. Standard wine = 5 glasses/bottle; beer/seltzer = 1 can/serving; spirits = 16 standard pours/750ml.
- Ice: 1.5 lbs of ice per guest (0.75 lb for drink glasses + 0.75 lb for chilling bottles/cans in coolers). 1 standard bag = 10 lbs.
- Protein: 6 to 8 oz main protein per guest (meat, poultry, or plant protein).
- Tableware: 1.75x guest count buffer (guests misplace cups/plates).
- Smart Swaps: Include 3 actionable CymbalMart budget-saving tips with estimated dollar savings.
- Host Timeline: Include 4 chronological countdown checkpoints.
- Signature Drink: Theme-matched batch drink recipe.`;

    const userPrompt = `Create a complete CymbalMart party shopping itinerary tailored to:
- Event Name: ${partyReq.eventName}
- Theme: ${partyReq.theme || 'Festive Celebration'}
- Event Type: ${partyReq.eventType || 'Party'}
- Adult Guests: ${partyReq.adultCount}
- Kid Guests: ${partyReq.kidCount}
- Duration: ${partyReq.durationHours} hours
- Total Target Budget: $${partyReq.budget}
- Dietary Preferences: ${partyReq.dietary?.join(', ') || 'Standard/No restrictions'}
- Desired Vibe: ${partyReq.vibe || 'Upbeat & welcoming'}
- Alcohol Direction: ${partyReq.alcoholPreference || 'cocktail_focused'}
- Special Requests & Notes: ${partyReq.notes || 'None'}

Target strictly items available at CymbalMart. Respect the $${partyReq.budget} budget.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            portionBreakdown: {
              type: Type.OBJECT,
              properties: {
                totalGuests: { type: Type.INTEGER },
                adults: { type: Type.INTEGER },
                kids: { type: Type.INTEGER },
                drinksEstimated: { type: Type.INTEGER },
                iceLbsEstimated: { type: Type.INTEGER },
                servingsPerCategory: { type: Type.STRING },
                suppliesMultiplier: { type: Type.STRING },
              },
              required: ['totalGuests', 'adults', 'kids', 'drinksEstimated', 'iceLbsEstimated'],
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'One of: beverages, food, ice_chilling, tableware_supplies, decor_ambiance',
                  },
                  department: {
                    type: Type.STRING,
                    description: 'One of: produce_deli, butcher_seafood, bakery_snacks, beverages_ice, party_essentials',
                  },
                  quantity: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  estCost: { type: Type.NUMBER },
                  recommendedStore: {
                    type: Type.STRING,
                    description: 'One of: supermarket, wholesale_club, liquor_store, party_store',
                  },
                  aisle: { type: Type.STRING },
                  tip: { type: Type.STRING },
                  isCore: { type: Type.BOOLEAN },
                  isCymbalBrand: { type: Type.BOOLEAN },
                },
                required: ['id', 'name', 'category', 'quantity', 'unit', 'estCost', 'recommendedStore', 'isCore'],
              },
            },
            smartSwaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  savings: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  alternativeAction: { type: Type.STRING },
                },
                required: ['title', 'savings', 'description', 'alternativeAction'],
              },
            },
            hostTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  task: { type: Type.STRING },
                },
                required: ['time', 'task'],
              },
            },
            signatureCocktailOrMocktail: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                instructions: { type: Type.STRING },
              },
              required: ['name', 'type', 'ingredients', 'instructions'],
            },
          },
          required: ['summary', 'portionBreakdown', 'items', 'smartSwaps', 'hostTimeline', 'signatureCocktailOrMocktail'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini');
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Gemini error generating CymbalMart party plan, using fallback engine:', error);
    const fallback = generateFallbackPartyPlan(req.body);
    return res.json(fallback);
  }
});

// POST /api/party/align-budget
app.post('/api/party/align-budget', async (req: Request, res: Response) => {
  try {
    const { items, targetBudget, guestCount } = req.body;
    if (!items || !targetBudget) {
      return res.status(400).json({ error: 'Missing items or targetBudget' });
    }

    if (!apiKey) {
      // Local programmatic alignment: scale costs down
      const currentTotal = items.reduce((s: number, i: any) => s + (i.alreadyOwned ? 0 : i.estCost), 0);
      const ratio = currentTotal > targetBudget ? targetBudget / currentTotal : 1;
      const adjusted = items.map((i: any) => ({
        ...i,
        estCost: Math.max(2, Math.round(i.estCost * ratio * 10) / 10),
      }));
      return res.json({
        items: adjusted,
        savingsAchieved: Math.max(0, currentTotal - targetBudget),
        summary: `Adjusted item quantities and applied CymbalMart bulk discounts to meet your $${targetBudget} budget.`,
      });
    }

    const prompt = `You are CymbalMart's AI Shopping Budget Optimizer.
Target Budget: $${targetBudget}
Guest Count: ${guestCount}
Current Items List:
${JSON.stringify(items, null, 2)}

Task:
Adjust item quantities or substitute premium items with CymbalMart Store Brand / Club bulk alternatives so that the total estimated cost of active items is EQUAL TO OR LESS THAN $${targetBudget}.
Do NOT reduce core protein below 6oz per person or eliminate ice.
Instead:
1. Trim non-essential decor or premium snacks.
2. Substitute brand-name items with Cymbal Select brand (20-30% lower cost).
3. Consolidate small packs into Cymbal Club bulk packs.

Return a JSON object with:
- "items": updated array of all items with new estCost and quantity
- "savingsAchieved": number (dollars saved)
- "summary": string explaining the budget optimizations made.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error in align-budget:', error);
    return res.status(500).json({ error: 'Budget alignment failed' });
  }
});

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// POST /api/party/chat - CymbalMart Assistant
app.post('/api/party/chat', async (req: Request, res: Response) => {
  try {
    const { message, plan } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const currentItems = plan?.items || [];
    const currentBudget = plan?.budget || 250;
    const lower = message.toLowerCase();

    if (!apiKey) {
      // Offline fallback rule-based assistant
      let reply = `Hello! I am your CymbalMart Assistant. `;
      const updates: any = {};

      if (lower.startsWith('add') || lower.includes(' add ')) {
        const itemName = message.replace(/^.*add\s+/i, '').replace(/\s+(to.*|please.*)$/i, '').trim();
        const estCost = 8.5;
        const newItem = {
          name: `Cymbal Choice: ${itemName}`,
          category: 'food',
          department: 'produce_deli',
          quantity: '1 party pack',
          unit: 'pack',
          estCost: estCost,
          recommendedStore: 'supermarket',
          aisle: 'Aisle 4 - Customer Request',
          tip: 'Added by CymbalMart Assistant per your request.',
          isCore: true,
          isCymbalBrand: true,
        };
        updates.itemsToAdd = [newItem];
        reply += `I have added "${newItem.name}" (${formatCurrency(estCost)}) to your shopping list. Your budget totals have been automatically recalculated!`;
      } else if (lower.startsWith('remove') || lower.includes('take off') || lower.includes('delete')) {
        const target = message.replace(/^.*(remove|take off|delete)\s+/i, '').trim();
        const found = currentItems.find((i: any) => i.name.toLowerCase().includes(target.toLowerCase()));
        if (found) {
          updates.itemsToRemove = [found.id];
          reply += `I have removed "${found.name}" from your shopping list, saving ${formatCurrency(found.estCost)}. Your budget totals are updated!`;
        } else {
          reply += `I couldn't find an item matching "${target}". Would you like to review your list?`;
        }
      } else if (lower.includes('already have') || lower.includes('in my pantry') || lower.includes('at home')) {
        const matched = currentItems.find((i: any) => lower.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes('napkin') || i.name.toLowerCase().includes('cup'));
        if (matched) {
          updates.itemsToUpdate = [{ nameOrId: matched.id, alreadyOwned: true }];
          reply += `Great! I've marked "${matched.name}" as already in your pantry. It's now $0 on your cart invoice, saving ${formatCurrency(matched.estCost)}!`;
        } else {
          reply += `Got it! You can mark any pantry items as owned to zero out their cost.`;
        }
      } else if (lower.includes('budget') && lower.match(/\d+/)) {
        const num = parseInt(message.match(/\d+/)![0], 10);
        if (num >= 50 && num <= 5000) {
          updates.newTargetBudget = num;
          reply += `I've updated your target budget to ${formatCurrency(num)}. Let's make sure our cart fits comfortably!`;
        } else {
          reply += `CymbalMart Assistant: We can adjust your budget anytime. Let me know your target!`;
        }
      } else {
        reply += `I can help you adjust items, substitute brands for Cymbal Select savings, increase quantities, or tweak your budget. Try: "Add 2 packs of hamburger buns", "Remove beer", or "Swap carnitas for chicken".`;
      }

      return res.json({
        reply,
        updates,
        budgetRecalculationSummary: 'Totals recalculated automatically by CymbalMart Assistant.',
      });
    }

    const systemPrompt = `You are "CymbalMart Assistant", the friendly, highly competent AI grocery and party planning concierge for CymbalMart customers.

Your goal is to converse naturally with customers, offer expert party hosting guidance, and WHEN THE CUSTOMER ASKS TO ADD, REMOVE, UPDATE, OR SWAP ITEMS, OR CHANGE BUDGET, you generate structured list updates so their CymbalMart shopping list and budget totals update automatically in real-time.

CymbalMart Context:
- Store brands: 'Cymbal Select' (premium quality, 25% cheaper), 'Cymbal Club' (jumbo warehouse bulk packs), 'Cymbal Organics'.
- Departments: 'produce_deli', 'butcher_seafood', 'bakery_snacks', 'beverages_ice', 'party_essentials'.
- Stores: 'supermarket', 'wholesale_club', 'liquor_store', 'party_store'.

Customer Request Types:
1. Adding items: Add realistic items with sensible estimated cost, Cymbal department, store, and aisle.
2. Removing items: Identify matching item IDs or exact names from the customer's current items list.
3. Updating items: Changing quantity (e.g. "Add 3 more bags of ice", "Reduce wine to 2 bottles"), or marking items as already owned in pantry.
4. Swapping items: Remove the old item and add the new item (e.g. swap steak for chicken thighs).
5. Budget update: If customer specifies a new budget amount (e.g. "My budget is now $200"), set newTargetBudget.

Return JSON adhering to the schema.
Always provide a courteous, concise conversational explanation in 'reply'. Mention the specific changes and budget impact.`;

    const userPrompt = `Current CymbalMart Party Plan:
- Event: ${plan.eventName}
- Guests: ${plan.portionBreakdown?.totalGuests || 16}
- Target Budget: $${currentBudget}
- Current Items in Cart:
${JSON.stringify(currentItems.map((i: any) => ({ id: i.id, name: i.name, qty: i.quantity, cost: i.estCost, alreadyOwned: i.alreadyOwned, dept: i.department })), null, 2)}

Customer Message:
"${message}"

Formulate your response as CymbalMart Assistant. If the customer is asking to modify items, add items, remove items, or adjust the budget, populate the 'updates' object accordingly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            updates: {
              type: Type.OBJECT,
              properties: {
                itemsToAdd: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      department: { type: Type.STRING },
                      quantity: { type: Type.STRING },
                      unit: { type: Type.STRING },
                      estCost: { type: Type.NUMBER },
                      recommendedStore: { type: Type.STRING },
                      aisle: { type: Type.STRING },
                      tip: { type: Type.STRING },
                      isCore: { type: Type.BOOLEAN },
                      isCymbalBrand: { type: Type.BOOLEAN },
                    },
                    required: ['name', 'category', 'quantity', 'estCost', 'recommendedStore', 'isCore'],
                  },
                },
                itemsToRemove: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                itemsToUpdate: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      nameOrId: { type: Type.STRING },
                      newQuantity: { type: Type.STRING },
                      newCost: { type: Type.NUMBER },
                      alreadyOwned: { type: Type.BOOLEAN },
                    },
                    required: ['nameOrId'],
                  },
                },
                newTargetBudget: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
              },
            },
            budgetRecalculationSummary: { type: Type.STRING },
          },
          required: ['reply'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error in CymbalMart Assistant chat:', error);
    return res.status(500).json({ error: 'Chat processing failed' });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CymbalMart Shopping Agent server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
