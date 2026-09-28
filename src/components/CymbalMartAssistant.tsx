import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Trash2,
  Check,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Zap,
  ArrowRight,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { PartyPlan, ShoppingItem, AssistantListUpdates, AssistantChatResponse } from '../types/party';
import { formatCurrency } from '../utils/partyMath';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  updatesApplied?: AssistantListUpdates;
  budgetSummary?: string;
}

interface CymbalMartAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  onApplyAssistantUpdates: (updates: AssistantListUpdates) => void;
}

export const CymbalMartAssistant: React.FC<CymbalMartAssistantProps> = ({
  isOpen,
  onClose,
  plan,
  onApplyAssistantUpdates,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Hello! I am your CymbalMart Assistant. I'm here to help you plan, update your shopping list in real-time, and keep your budget in check.\n\nYou can ask me to add items, remove items, swap ingredients for Cymbal Select savings, or adjust your budget. What can I do for you today?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Active items math
  const activeItems = plan.items.filter((i) => !i.alreadyOwned);
  const currentTotal = activeItems.reduce((acc, i) => acc + i.estCost, 0);
  const targetBudget = plan.budget;
  const isUnderBudget = currentTotal <= targetBudget;

  const quickPrompts = [
    'Add 2 packs of gluten-free buns',
    'Swap carnitas for chicken thighs to save $12',
    'Add 3 extra bags of party ice',
    'I already have paper napkins at home',
    'Suggest 2 vegan appetizers under $15',
    'Set my target budget to $220',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/party/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          plan: plan,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach CymbalMart Assistant');
      }

      const data: AssistantChatResponse = await res.json();

      // If assistant suggested updates to the shopping list or budget, apply them automatically!
      if (data.updates && (
        (data.updates.itemsToAdd && data.updates.itemsToAdd.length > 0) ||
        (data.updates.itemsToRemove && data.updates.itemsToRemove.length > 0) ||
        (data.updates.itemsToUpdate && data.updates.itemsToUpdate.length > 0) ||
        data.updates.newTargetBudget !== undefined
      )) {
        onApplyAssistantUpdates(data.updates);
      }

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatesApplied: data.updates,
        budgetSummary: data.budgetRecalculationSummary,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `I'm having a brief connection hitch, but here is a quick CymbalMart tip: Check the Cymbal Select brand in aisle 4 for 25% savings on all party staples!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header with Live Cart & Budget Status */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 text-white shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">CymbalMart Assistant</h3>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Shopping & Budget Copilot
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Budget Ticker inside Chat Header */}
        <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Cart:</span>
            <span className="font-bold text-white tabular-nums">{formatCurrency(currentTotal)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Target: {formatCurrency(targetBudget)}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isUnderBudget
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {isUnderBudget
                ? `-${formatCurrency(targetBudget - currentTotal)}`
                : `+${formatCurrency(currentTotal - targetBudget)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'agent' && (
              <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                C
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                  : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Visual Card showing Applied Shopping List Updates */}
              {msg.updatesApplied && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span>Shopping List Automatically Updated:</span>
                  </div>

                  {/* Added Items */}
                  {msg.updatesApplied.itemsToAdd?.map((add, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 text-[11px] flex items-center justify-between"
                    >
                      <span className="font-semibold">+ Added: {add.name} ({add.quantity})</span>
                      <span className="font-bold tabular-nums">+{formatCurrency(add.estCost)}</span>
                    </div>
                  ))}

                  {/* Removed Items */}
                  {msg.updatesApplied.itemsToRemove?.map((rem, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-rose-50 text-rose-900 rounded-lg border border-rose-200 text-[11px] flex items-center justify-between"
                    >
                      <span className="font-semibold">- Removed: {rem}</span>
                      <span className="text-[10px] text-rose-700">Cost deducted</span>
                    </div>
                  ))}

                  {/* Updated Items */}
                  {msg.updatesApplied.itemsToUpdate?.map((upd, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 text-[11px]"
                    >
                      <span className="font-semibold">↻ Updated: {upd.nameOrId}</span>
                      {upd.newQuantity && <span> · Qty: {upd.newQuantity}</span>}
                      {upd.alreadyOwned && <span> · Marked as Pantry ($0)</span>}
                    </div>
                  ))}

                  {/* Budget Target Update */}
                  {msg.updatesApplied.newTargetBudget && (
                    <div className="p-1.5 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-[11px] font-bold">
                      🎯 New Target Budget: {formatCurrency(msg.updatesApplied.newTargetBudget)}
                    </div>
                  )}

                  {/* Automatic Budget Recalculation Note */}
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Totals & budget gauge recalculated in real time.</span>
                  </div>
                </div>
              )}

              <div
                className={`text-[9px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-slate-500 text-xs pl-9">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>CymbalMart Assistant updating shopping list & budget...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Customer Prompts */}
      <div className="px-4 py-2 bg-white border-t border-slate-200">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Ask CymbalMart Assistant:
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              className="px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 hover:border-amber-400 hover:bg-amber-50/50 whitespace-nowrap transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask CymbalMart Assistant to add, remove, or swap..."
          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold disabled:opacity-40 transition-colors"
          title="Send message to CymbalMart Assistant"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
