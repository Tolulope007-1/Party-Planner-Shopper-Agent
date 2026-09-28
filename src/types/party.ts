export type ItemCategory =
  | 'beverages'
  | 'food'
  | 'ice_chilling'
  | 'tableware_supplies'
  | 'decor_ambiance';

export type StoreType =
  | 'supermarket'
  | 'wholesale_club'
  | 'liquor_store'
  | 'party_store';

export type CymbalDepartment =
  | 'produce_deli'
  | 'butcher_seafood'
  | 'bakery_snacks'
  | 'beverages_ice'
  | 'party_essentials';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  department?: CymbalDepartment;
  quantity: string;
  unit: string;
  estCost: number;
  recommendedStore: StoreType;
  aisle?: string;
  tip?: string;
  isCore: boolean;
  isCymbalBrand?: boolean;
  checked?: boolean;
  alreadyOwned?: boolean;
  customAdded?: boolean;
}

export interface PortionBreakdown {
  totalGuests: number;
  adults: number;
  kids: number;
  drinksEstimated: number;
  iceLbsEstimated: number;
  servingsPerCategory?: string;
  suppliesMultiplier?: string;
}

export interface SmartSwap {
  title: string;
  savings: number;
  description: string;
  alternativeAction: string;
  applied?: boolean;
}

export interface HostTimelineStep {
  time: string;
  task: string;
  done?: boolean;
}

export interface SignatureDrink {
  name: string;
  type: string;
  ingredients: string[];
  instructions: string;
}

export interface PartyPlan {
  id: string;
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
  alcoholPreference: 'full_bar' | 'beer_wine_only' | 'cocktail_focused' | 'non_alcoholic_only';
  summary: string;
  portionBreakdown: PortionBreakdown;
  items: ShoppingItem[];
  smartSwaps: SmartSwap[];
  hostTimeline: HostTimelineStep[];
  signatureCocktailOrMocktail: SignatureDrink;
  createdAt: string;
}

export interface PartyPreset {
  id: string;
  name: string;
  theme: string;
  eventType: string;
  adultCount: number;
  kidCount: number;
  durationHours: number;
  budget: number;
  dietary: string[];
  vibe: string;
  alcoholPreference: 'full_bar' | 'beer_wine_only' | 'cocktail_focused' | 'non_alcoholic_only';
  description: string;
}

export type CUJStep = 'define' | 'review' | 'refine_checkout';

export interface CheckoutDetails {
  fulfillmentType: 'pickup' | 'delivery';
  storeLocation: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  appliedRewardsDiscount: number;
  rewardsMemberId?: string;
  orderId?: string;
}

export interface AssistantItemUpdate {
  nameOrId: string;
  newQuantity?: string;
  newCost?: number;
  alreadyOwned?: boolean;
}

export interface AssistantListUpdates {
  itemsToAdd?: Array<Omit<ShoppingItem, 'id'>>;
  itemsToRemove?: string[];
  itemsToUpdate?: AssistantItemUpdate[];
  newTargetBudget?: number;
  explanation?: string;
}

export interface AssistantChatResponse {
  reply: string;
  updates?: AssistantListUpdates;
  budgetRecalculationSummary?: string;
}

