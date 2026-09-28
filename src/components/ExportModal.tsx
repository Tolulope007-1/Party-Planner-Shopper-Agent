import React from 'react';
import { X, Copy, Check, Printer, Share2, FileText } from 'lucide-react';
import { PartyPlan, StoreType } from '../types/party';
import { STORE_META, formatCurrency } from '../utils/partyMath';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, plan }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const stores: StoreType[] = ['supermarket', 'wholesale_club', 'liquor_store', 'party_store'];

  // Generate plain text formatted list
  const activeItems = plan.items.filter((i) => !i.alreadyOwned);
  const totalCost = activeItems.reduce((acc, i) => acc + i.estCost, 0);

  const generateShareText = () => {
    let text = `🎉 PARTY SHOPPING LIST: ${plan.eventName.toUpperCase()}\n`;
    text += `👥 ${plan.portionBreakdown.totalGuests} Guests (${plan.adultCount} adults, ${plan.kidCount} kids) · ${plan.durationHours} Hours\n`;
    text += `💰 Estimated Spend: ${formatCurrency(totalCost)} (Budget: ${formatCurrency(plan.budget)})\n`;
    text += `🧊 Ice Needed: ${plan.portionBreakdown.iceLbsEstimated} lbs (~${Math.ceil(plan.portionBreakdown.iceLbsEstimated / 10)} bags)\n\n`;

    stores.forEach((store) => {
      const storeItems = activeItems.filter((i) => i.recommendedStore === store);
      if (storeItems.length > 0) {
        text += `🏪 [${STORE_META[store].label.toUpperCase()}]\n`;
        storeItems.forEach((item) => {
          text += `[ ] ${item.name} — ${item.quantity} (~${formatCurrency(item.estCost)})${item.aisle ? ` (${item.aisle})` : ''}\n`;
        });
        text += `\n`;
      }
    });

    const owned = plan.items.filter((i) => i.alreadyOwned);
    if (owned.length > 0) {
      text += `✅ [ALREADY AT HOME IN PANTRY/BAR]\n`;
      owned.forEach((item) => {
        text += `• ${item.name} (${item.quantity})\n`;
      });
      text += `\n`;
    }

    text += `🍹 SIGNATURE DRINK: ${plan.signatureCocktailOrMocktail.name}\n`;
    plan.signatureCocktailOrMocktail.ingredients.forEach((ing) => {
      text += `  - ${ing}\n`;
    });

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Shopping Itinerary</h3>
              <p className="text-xs text-slate-500">Copy for WhatsApp, Notes, or print a hardcopy checklist.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50">
          <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200 leading-relaxed shadow-2xs select-all">
            {generateShareText()}
          </pre>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Checklist</span>
          </button>

          <button
            onClick={handleCopy}
            className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy for Notes / SMS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
