import React, { useState } from 'react';
import {
  CheckCircle2,
  Truck,
  Store,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
  Gift,
  ArrowRight,
  Phone,
  MapPin,
  FileText,
  Printer,
  ShoppingBag,
  Plus,
  Trash2,
  Undo2,
  Check,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { PartyPlan, ShoppingItem, CheckoutDetails } from '../types/party';
import { formatCurrency, CYMBAL_DEPARTMENTS } from '../utils/partyMath';
import { HostTimelineAndDrink } from './HostTimelineAndDrink';

interface RefineCheckoutViewProps {
  plan: PartyPlan;
  onToggleCheckItem: (id: string) => void;
  onToggleAlreadyOwned: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id'>) => void;
  onToggleTimelineStep: (index: number) => void;
  onStartInStoreMode: () => void;
  fulfillmentType?: 'pickup' | 'delivery';
  onSetFulfillmentType?: (type: 'pickup' | 'delivery') => void;
  isOrderPlacedExternal?: boolean;
  orderIdExternal?: string;
  onPlaceOrderExternal?: () => void;
  onResetOrderExternal?: () => void;
}

export const RefineCheckoutView: React.FC<RefineCheckoutViewProps> = ({
  plan,
  onToggleCheckItem,
  onToggleAlreadyOwned,
  onDeleteItem,
  onAddItem,
  onToggleTimelineStep,
  onStartInStoreMode,
  fulfillmentType: externalFulfillmentType,
  onSetFulfillmentType: externalSetFulfillmentType,
  isOrderPlacedExternal,
  orderIdExternal,
  onPlaceOrderExternal,
  onResetOrderExternal,
}) => {
  const [internalFulfillmentType, setInternalFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const fulfillmentType = externalFulfillmentType !== undefined ? externalFulfillmentType : internalFulfillmentType;
  const setFulfillmentType = (type: 'pickup' | 'delivery') => {
    setInternalFulfillmentType(type);
    if (externalSetFulfillmentType) externalSetFulfillmentType(type);
  };

  const [storeLocation, setStoreLocation] = useState('CymbalMart #4102 — Westside Supercenter (1.4 mi)');
  const [timeSlot, setTimeSlot] = useState('Today: 3:00 PM – 5:00 PM (Ready before party)');
  const [customerName, setCustomerName] = useState('Alex Taylor');
  const [customerPhone, setCustomerPhone] = useState('(555) 382-9104');
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace');
  const [specialInstructions, setSpecialInstructions] = useState(
    'Please double-bag the 10-lb party ice bags and keep avocados firm.'
  );
  const [rewardsMemberId, setRewardsMemberId] = useState('CYMBAL-98421');
  const [rewardsApplied, setRewardsApplied] = useState(true);
  const [internalIsOrderPlaced, setInternalIsOrderPlaced] = useState(false);
  const [internalOrderId, setInternalOrderId] = useState('');

  const isOrderPlaced = isOrderPlacedExternal !== undefined ? isOrderPlacedExternal : internalIsOrderPlaced;
  const orderId = orderIdExternal !== undefined && orderIdExternal ? orderIdExternal : internalOrderId;

  // Quick custom item modal state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCost, setCustomCost] = useState('6');
  const [customQty, setCustomQty] = useState('1 pack');

  // Math
  const activeItems = plan.items.filter((i) => !i.alreadyOwned);
  const subtotal = activeItems.reduce((acc, i) => acc + i.estCost, 0);
  const rewardsDiscount = rewardsApplied ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const fulfillmentFee = fulfillmentType === 'pickup' ? 0 : 4.99;
  const estTax = Math.round((subtotal - rewardsDiscount) * 0.06 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - rewardsDiscount + fulfillmentFee + estTax);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (onPlaceOrderExternal) {
      onPlaceOrderExternal();
    } else {
      const generatedId = `CM-${Math.floor(100000 + Math.random() * 900000)}`;
      setInternalOrderId(generatedId);
      setInternalIsOrderPlaced(true);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddItem({
      name: customName.trim(),
      category: 'food',
      quantity: customQty,
      unit: 'pack',
      estCost: parseFloat(customCost) || 5,
      recommendedStore: 'supermarket',
      department: 'produce_deli',
      aisle: 'Custom Aisle',
      isCore: true,
      customAdded: true,
    });
    setCustomName('');
    setIsAddingItem(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Task 3 of 3 · Refine & Finalize Checkout
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">CymbalMart Express Fulfillment</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
              Refine Constraints & Finalize Order
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Adjust last-minute guest needs, choose Free Curbside Pickup or Delivery, apply Cymbal Rewards, and finalize your order.
            </p>
          </div>

          <button
            onClick={onStartInStoreMode}
            className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Switch to In-Store Aisle Mode</span>
          </button>
        </div>

        {/* Constraint Review Checklist */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Dietary & Allergen Check</span>
            <div className="text-slate-600 space-y-1">
              {plan.dietary && plan.dietary.length > 0 ? (
                plan.dietary.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{d} incorporated</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400">Standard menu (no allergen exclusions)</span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Portion Formula Check</span>
            <div className="text-slate-600 space-y-0.5">
              <div>🧊 {plan.portionBreakdown.iceLbsEstimated} lbs Ice ({Math.ceil(plan.portionBreakdown.iceLbsEstimated / 10)} bags)</div>
              <div>🍹 {plan.portionBreakdown.drinksEstimated} total drinks allocated</div>
              <div>🍽️ {plan.portionBreakdown.totalGuests * 1.75} tableware buffer</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Host Pantry Savings</span>
            <div className="text-slate-600">
              <span className="text-emerald-700 font-bold">
                {plan.items.filter((i) => i.alreadyOwned).length} items marked as already owned
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Zeroed out from your checkout invoice.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Items Refinement + Checkout Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Items Refinement */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Final Item Manifest</h3>
              </div>

              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Quick Add Custom Item Drawer */}
            {isAddingItem && (
              <form onSubmit={handleAddCustom} className="p-3 my-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  required
                  placeholder="Item name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white flex-1 min-w-[140px]"
                />
                <input
                  type="text"
                  placeholder="Qty (e.g. 2 packs)"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white w-24"
                />
                <input
                  type="number"
                  placeholder="$"
                  value={customCost}
                  onChange={(e) => setCustomCost(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white w-16"
                />
                <button type="submit" className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg">
                  Add
                </button>
              </form>
            )}

            {/* Items List */}
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {activeItems.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-slate-900 block truncate">{item.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {item.quantity} · {item.aisle || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatCurrency(item.estCost)}
                    </span>
                    <button
                      onClick={() => onToggleAlreadyOwned(item.id)}
                      className="p-1 text-slate-400 hover:text-emerald-700"
                      title="Already have in pantry"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Host Prep Countdown & Signature Drink */}
          <HostTimelineAndDrink
            timeline={plan.hostTimeline}
            signatureDrink={plan.signatureCocktailOrMocktail}
            onToggleTimelineStep={onToggleTimelineStep}
          />
        </div>

        {/* Right: CymbalMart Checkout Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handlePlaceOrder}
            className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-6 sticky top-24 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">CymbalMart Checkout</h2>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Guaranteed Ready
              </span>
            </div>

            {/* Fulfillment Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fulfillment Option
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-3 rounded-xl border text-left font-semibold transition-all flex flex-col justify-between ${
                    fulfillmentType === 'pickup'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>Free Pickup</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">$0.00 Curbside</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-xl border text-left font-semibold transition-all flex flex-col justify-between ${
                    fulfillmentType === 'delivery'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Delivery</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">Express 2-Hr ($4.99)</span>
                </button>
              </div>
            </div>

            {/* Location or Address */}
            {fulfillmentType === 'pickup' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Store Location
                </label>
                <select
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="CymbalMart #4102 — Westside Supercenter (1.4 mi)">
                    CymbalMart #4102 — Westside Supercenter (1.4 mi)
                  </option>
                  <option value="CymbalMart #1840 — Metro Center Superstore (3.2 mi)">
                    CymbalMart #1840 — Metro Center Superstore (3.2 mi)
                  </option>
                  <option value="CymbalMart #5521 — Northside Market (4.8 mi)">
                    CymbalMart #5521 — Northside Market (4.8 mi)
                  </option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Ready Time Slot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Window
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Today: 3:00 PM – 5:00 PM (Ready before party)">
                  Today: 3:00 PM – 5:00 PM (Ready before party)
                </option>
                <option value="Today: 5:00 PM – 7:00 PM">Today: 5:00 PM – 7:00 PM</option>
                <option value="Tomorrow: 10:00 AM – 12:00 PM">Tomorrow: 10:00 AM – 12:00 PM</option>
                <option value="Tomorrow: 2:00 PM – 4:00 PM">Tomorrow: 2:00 PM – 4:00 PM</option>
              </select>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Host Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile (SMS updates)</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Host Packing Instructions
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Cymbal Rewards */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  Cymbal Rewards Member
                </span>
                <span className="text-[11px] font-bold text-emerald-700">-5% Applied</span>
              </div>
              <input
                type="text"
                value={rewardsMemberId}
                onChange={(e) => setRewardsMemberId(e.target.value)}
                placeholder="Member ID / Phone Number"
                className="w-full px-2.5 py-1 text-xs rounded border border-amber-300 bg-white"
              />
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal ({activeItems.length} items)</span>
                <span className="tabular-nums font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {rewardsApplied && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Cymbal Rewards Member Discount</span>
                  <span className="tabular-nums">-{formatCurrency(rewardsDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Fulfillment Fee</span>
                <span>{fulfillmentFee === 0 ? 'FREE' : formatCurrency(fulfillmentFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax (6%)</span>
                <span className="tabular-nums">{formatCurrency(estTax)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-950">
                <span>Final Order Total</span>
                <span className="text-base tabular-nums text-emerald-800">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Place Order Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Finalize & Place CymbalMart Order</span>
            </button>
          </form>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {isOrderPlaced && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Order Placed Successfully
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">You're All Set to Host!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your CymbalMart party groceries are scheduled and being assembled by your personal shopper.
              </p>
            </div>

            {/* Order Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold">
                <span className="text-slate-500">Order ID:</span>
                <span className="text-amber-800 font-mono text-sm">{orderId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fulfillment:</span>
                <span className="font-semibold text-slate-900 capitalize">{fulfillmentType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Location:</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-xs">
                  {fulfillmentType === 'pickup' ? storeLocation : deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ready Window:</span>
                <span className="font-semibold text-emerald-700">{timeSlot}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Charged:</span>
                <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 rounded-xl text-amber-900 text-xs">
              <QrCode className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Show this order QR code at curbside pickup stall or to your delivery driver.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={() => {
                  setInternalIsOrderPlaced(false);
                  if (onResetOrderExternal) onResetOrderExternal();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
