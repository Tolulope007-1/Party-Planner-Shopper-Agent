import { ItemCategory, StoreType, CymbalDepartment } from '../types/party';

export function calculatePortions(adults: number, kids: number, hours: number, alcoholPref: string) {
  const totalGuests = adults + kids;
  const isAlcoholAllowed = alcoholPref !== 'non_alcoholic_only';
  
  // Drinks: 2 drinks for the 1st hour + 1 drink per hour after per adult
  const drinksPerAdult = isAlcoholAllowed ? Math.max(1, 2 + Math.max(0, hours - 1)) : 0;
  const totalAlcoholicDrinks = Math.round(adults * 0.85 * drinksPerAdult);
  const totalNonAlcoholicDrinks = Math.round(totalGuests * Math.max(1.5, hours * 0.75));

  // Ice: 1.5 lbs per person for standard parties (0.75 lb for chilling, 0.75 lb for serving)
  const iceLbs = Math.round(totalGuests * 1.5);
  const iceBags10lb = Math.max(1, Math.ceil(iceLbs / 10));

  // Food: 6-8 oz protein/person for meals; 6-8 appetizer bites/person for cocktail/finger food
  const proteinLbs = Number(((adults * 7 + kids * 4) / 16).toFixed(1));
  const appetizerBites = totalGuests * 6;

  // Tableware: 1.75x guest count (cups & napkins get lost or refreshed)
  const tablewareBufferCount = Math.ceil(totalGuests * 1.75);

  return {
    totalGuests,
    iceLbs,
    iceBags10lb,
    totalAlcoholicDrinks,
    totalNonAlcoholicDrinks,
    wineBottles: Math.ceil((totalAlcoholicDrinks * 0.45) / 5),
    beerCans: Math.ceil(totalAlcoholicDrinks * 0.45),
    cocktailServings: Math.ceil(totalAlcoholicDrinks * 0.2),
    proteinLbs,
    appetizerBites,
    tablewareBufferCount,
  };
}

export const CYMBAL_DEPARTMENTS: Record<CymbalDepartment, { label: string; icon: string; badgeClass: string; aisleHint: string }> = {
  produce_deli: {
    label: 'Produce & Fresh Deli',
    icon: 'Apple',
    badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    aisleHint: 'Produce Island & Deli Counter',
  },
  butcher_seafood: {
    label: 'Butcher & Seafood',
    icon: 'Beef',
    badgeClass: 'text-rose-800 bg-rose-50 border-rose-200',
    aisleHint: 'Meat Department - Cases 1 to 4',
  },
  bakery_snacks: {
    label: 'Bakery, Chips & Dips',
    icon: 'Cookie',
    badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
    aisleHint: 'Bakery Tables & Snack Aisles 4-5',
  },
  beverages_ice: {
    label: 'Beverages, Seltzers & Ice',
    icon: 'GlassWater',
    badgeClass: 'text-blue-800 bg-blue-50 border-blue-200',
    aisleHint: 'Aisles 7-8 & Front Ice Chests',
  },
  party_essentials: {
    label: 'Party Supplies & Tableware',
    icon: 'Sparkles',
    badgeClass: 'text-purple-800 bg-purple-50 border-purple-200',
    aisleHint: 'Aisles 1-2 Paper & Celebrations',
  },
};

export const STORE_META: Record<StoreType, { label: string; icon: string; badgeColor: string; description: string }> = {
  supermarket: {
    label: 'CymbalMart Supercenter',
    icon: 'Store',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Fresh meats, produce, deli, bakery & snacks',
  },
  wholesale_club: {
    label: 'Cymbal Club Bulk Packs',
    icon: 'Package',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Bulk paper goods, seltzers, jumbo chips & dips',
  },
  liquor_store: {
    label: 'Cymbal Wine & Spirits',
    icon: 'Wine',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Direct-import wines, craft beers & cocktail spirits',
  },
  party_store: {
    label: 'Cymbal Celebrations',
    icon: 'Sparkles',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    description: 'Compostable tableware, cups, napkins & ambient decor',
  },
};

export const CATEGORY_META: Record<ItemCategory, { label: string; icon: string; dotColor: string }> = {
  beverages: {
    label: 'Beverages & Mixers',
    icon: 'GlassWater',
    dotColor: 'bg-cyan-500',
  },
  food: {
    label: 'Food, Meats & Bites',
    icon: 'Utensils',
    dotColor: 'bg-emerald-500',
  },
  ice_chilling: {
    label: 'Ice & Chilling',
    icon: 'Snowflake',
    dotColor: 'bg-blue-500',
  },
  tableware_supplies: {
    label: 'Tableware & Essentials',
    icon: 'ShoppingBag',
    dotColor: 'bg-amber-500',
  },
  decor_ambiance: {
    label: 'Decor & Ambiance',
    icon: 'Sparkles',
    dotColor: 'bg-pink-500',
  },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
