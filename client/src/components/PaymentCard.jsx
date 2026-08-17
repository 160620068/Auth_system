import React from 'react';
import { CreditCard, Banknote, CheckCircle2 } from 'lucide-react';

/**
 * PaymentCard Component:
 * Selectable payment method option card with responsive layout and focus states.
 */
const PaymentCard = ({ type, title, subtitle, badgeText, isSelected, onClick }) => {
  const isCard = type === 'card';

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer glass-card ${
        isSelected
          ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/15'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              isCard
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isCard ? <CreditCard className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-base text-white">{title}</h4>
              {badgeText && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Selected Radio Indicator */}
        <div className="shrink-0 mt-1">
          {isSelected ? (
            <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-slate-700" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
