import React from 'react';
import {
  ShoppingBag,
  Store,
  Package,
  Wine,
  Sparkles,
  Plus,
  Check,
  CheckCircle2,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  HelpCircle,
  Tag,
  Filter,
  DollarSign,
  AlertCircle,
  Undo2,
} from 'lucide-react';
import { ShoppingItem, StoreType, ItemCategory } from '../types/party';
import { STORE_META, CATEGORY_META, formatCurrency } from '../utils/partyMath';

interface ShoppingBoardProps {
  items: ShoppingItem[];
  budget: number;
  onToggleCheckItem: (id: string) => void;
  onToggleAlreadyOwned: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItemCost: (id: string, cost: number) => void;
  onUpdateItemQuantity: (id: string, quantity: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id'>) => void;
}

export const ShoppingBoard: React.FC<ShoppingBoardProps> = ({
  items,
  budget,
  onToggleCheckItem,
  onToggleAlreadyOwned,
  onDeleteItem,
  onUpdateItemCost,
  onUpdateItemQuantity,
  onAddItem,
}) => {
  const [selectedStore, setSelectedStore] = React.useState<StoreType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<ItemCategory | 'all'>('all');
  const [coreOnly, setCoreOnly] = React.useState(false);
  const [hideOwned, setHideOwned] = React.useState(false);
  const [isAddingItem, setIsAddingItem] = React.useState(false);
  const [editingCostId, setEditingCostId] = React.useState<string | null>(null);
  const [tempCost, setTempCost] = React.useState<string>('');

  // New item form state
  const [newItemName, setNewItemName] = React.useState('');
  const [newItemCategory, setNewItemCategory] = React.useState<ItemCategory>('food');
  const [newItemStore, setNewItemStore] = React.useState<StoreType>('supermarket');
  const [newItemQuantity, setNewItemQuantity] = React.useState('1 pack');
  const [newItemCost, setNewItemCost] = React.useState('10');
  const [newItemAisle, setNewItemAisle] = React.useState('');
  const [newItemTip, setNewItemTip] = React.useState('');

  const stores: StoreType[] = ['supermarket', 'wholesale_club', 'liquor_store', 'party_store'];

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedStore !== 'all' && item.recommendedStore !== selectedStore) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (coreOnly && !item.isCore) return false;
    if (hideOwned && item.alreadyOwned) return false;
    return true;
  });

  // Calculate totals
  const activeItems = items.filter((i) => !i.alreadyOwned);
  const totalCartCost = activeItems.reduce((acc, i) => acc + i.estCost, 0);
  const ownedSavings = items.filter((i) => i.alreadyOwned).reduce((acc, i) => acc + i.estCost, 0);
  const checkedItemsCount = activeItems.filter((i) => i.checked).length;

  const handleSaveCost = (id: string) => {
    const parsed = parseFloat(tempCost);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateItemCost(id, parsed);
    }
    setEditingCostId(null);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      name: newItemName.trim(),
      category: newItemCategory,
      recommendedStore: newItemStore,
      quantity: newItemQuantity.trim() || '1 pack',
      unit: 'pack',
      estCost: parseFloat(newItemCost) || 0,
      aisle: newItemAisle.trim() || 'General',
      tip: newItemTip.trim() || undefined,
      isCore: true,
      customAdded: true,
    });

    // Reset
    setNewItemName('');
    setNewItemAisle('');
    setNewItemTip('');
    setIsAddingItem(false);
  };

  const getStoreIcon = (store: StoreType) => {
    switch (store) {
      case 'supermarket':
        return <Store className="w-4 h-4" />;
      case 'wholesale_club':
        return <Package className="w-4 h-4" />;
      case 'liquor_store':
        return <Wine className="w-4 h-4" />;
      case 'party_store':
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Categorized Shopping Itinerary</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {activeItems.length} Items to Buy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organized by store and aisle so your shopping trip is smooth, fast, and organized.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Item</span>
          </button>
        </div>
      </div>

      {/* Store Tabs */}
      <div className="flex items-center gap-1.5 py-4 overflow-x-auto scrollbar-none border-b border-slate-100">
        <button
          onClick={() => setSelectedStore('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedStore === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <span>All Stores ({items.length})</span>
        </button>

        {stores.map((store) => {
          const storeItems = items.filter((i) => i.recommendedStore === store);
          const storeActiveItems = storeItems.filter((i) => !i.alreadyOwned);
          const storeCost = storeActiveItems.reduce((acc, i) => acc + i.estCost, 0);

          return (
            <button
              key={store}
              onClick={() => setSelectedStore(store)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedStore === store
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {getStoreIcon(store)}
              <span>{STORE_META[store].label.split(' ')[0]}</span>
              <span className="opacity-80 text-[11px]">({storeItems.length})</span>
              <span className="font-semibold tabular-nums ml-0.5">{formatCurrency(storeCost)}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filter & Toggles Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
        {/* Category Filter */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              selectedCategory === 'all' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Categories
          </button>
          {(Object.keys(CATEGORY_META) as ItemCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                selectedCategory === cat
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${CATEGORY_META[cat].dotColor}`} />
              <span>{CATEGORY_META[cat].label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Checkbox Toggles */}
        <div className="flex items-center gap-4 text-slate-600">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={coreOnly}
              onChange={(e) => setCoreOnly(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Core Essentials Only</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={hideOwned}
              onChange={(e) => setHideOwned(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Hide "Already Have"</span>
          </label>
        </div>
      </div>

      {/* Add Custom Item Inline Drawer */}
      {isAddingItem && (
        <form
          onSubmit={handleAddNewItem}
          className="p-4 my-4 bg-amber-50/50 rounded-xl border border-amber-200 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-amber-600" />
            Add Custom Party Item
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Item Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sriracha Mayo Dip, Citronella Candles"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Category</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {(Object.keys(CATEGORY_META) as ItemCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_META[cat].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Store Destination</label>
              <select
                value={newItemStore}
                onChange={(e) => setNewItemStore(e.target.value as StoreType)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {stores.map((s) => (
                  <option key={s} value={s}>
                    {STORE_META[s].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Quantity / Size</label>
              <input
                type="text"
                placeholder="e.g. 2 bottles, 4 lbs"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Est. Cost ($ USD)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Store Aisle (optional)</label>
              <input
                type="text"
                placeholder="e.g. Deli Counter, Aisle 4"
                value={newItemAisle}
                onChange={(e) => setNewItemAisle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Host Tip (optional)</label>
              <input
                type="text"
                placeholder="e.g. Buy store brand for 30% savings"
                value={newItemTip}
                onChange={(e) => setNewItemTip(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs"
            >
              Add to Shopping List
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="divide-y divide-slate-100">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No items match the selected store/category filters.</p>
            <button
              onClick={() => {
                setSelectedStore('all');
                setSelectedCategory('all');
                setCoreOnly(false);
                setHideOwned(false);
              }}
              className="mt-2 text-xs text-amber-600 font-semibold underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isOwned = item.alreadyOwned;
            const isChecked = item.checked;
            const storeMeta = STORE_META[item.recommendedStore];
            const catMeta = CATEGORY_META[item.category];

            return (
              <div
                key={item.id}
                className={`py-3.5 px-2 transition-all rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 ${
                  isOwned ? 'bg-slate-50/50 opacity-60' : isChecked ? 'bg-emerald-50/20' : ''
                }`}
              >
                {/* Left: Checkbox & Item Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Shopping Checkbox */}
                  <button
                    onClick={() => onToggleCheckItem(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    title={isChecked ? 'Mark as unpurchased' : 'Mark as in cart'}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold transition-all ${
                          isOwned
                            ? 'line-through text-slate-400'
                            : isChecked
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Store tag */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${storeMeta.badgeColor}`}>
                        {storeMeta.label.split(' ')[0]}
                      </span>

                      {/* Aisle */}
                      {item.aisle && (
                        <span className="text-[11px] text-slate-400">
                          · {item.aisle}
                        </span>
                      )}

                      {!item.isCore && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                          Optional
                        </span>
                      )}

                      {isOwned && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Host Already Owns ($0)
                        </span>
                      )}
                    </div>

                    {/* Quantity & Tip */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Qty: {item.quantity}
                      </span>

                      {item.tip && (
                        <span className="text-slate-500 flex items-center gap-1 text-[11px] italic">
                          <HelpCircle className="w-3 h-3 text-amber-500 shrink-0" />
                          {item.tip}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Cost & Quick Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Cost Display / Edit */}
                  <div className="text-right">
                    {editingCostId === item.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">$</span>
                        <input
                          type="number"
                          step="0.5"
                          autoFocus
                          value={tempCost}
                          onChange={(e) => setTempCost(e.target.value)}
                          onBlur={() => handleSaveCost(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveCost(item.id);
                            if (e.key === 'Escape') setEditingCostId(null);
                          }}
                          className="w-16 px-1.5 py-0.5 text-xs font-bold border border-amber-400 rounded focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCostId(item.id);
                          setTempCost(item.estCost.toString());
                        }}
                        className={`text-sm font-bold tabular-nums hover:text-amber-600 transition-colors flex items-center gap-1 ${
                          isOwned ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                        title="Click to edit price"
                      >
                        <span>{formatCurrency(item.estCost)}</span>
                        <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                      </button>
                    )}
                  </div>

                  {/* Already Have Toggle */}
                  <button
                    onClick={() => onToggleAlreadyOwned(item.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors flex items-center gap-1 ${
                      isOwned
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={isOwned ? 'Move back to shopping list' : 'Mark as already in your pantry/bar'}
                  >
                    {isOwned ? (
                      <>
                        <Undo2 className="w-3 h-3 text-emerald-700" />
                        <span>In Pantry</span>
                      </>
                    ) : (
                      <span>I Have This</span>
                    )}
                  </button>

                  {/* Delete Item */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors rounded"
                    title="Remove item from shopping list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-slate-500">Active Cart Total: </span>
            <span className="text-base font-bold text-slate-900 tabular-nums">{formatCurrency(totalCartCost)}</span>
          </div>

          {ownedSavings > 0 && (
            <div className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="font-semibold">Saved by Pantry Items: </span>
              <span className="font-bold tabular-nums">+{formatCurrency(ownedSavings)}</span>
            </div>
          )}

          <div>
            <span className="text-slate-500">Target Budget: </span>
            <span className="font-semibold text-slate-700 tabular-nums">{formatCurrency(budget)}</span>
          </div>
        </div>

        <div className="text-xs font-medium">
          {totalCartCost <= budget ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Under Budget by {formatCurrency(budget - totalCartCost)}
            </span>
          ) : (
            <span className="text-amber-800 font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Over Target Budget by {formatCurrency(totalCartCost - budget)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
