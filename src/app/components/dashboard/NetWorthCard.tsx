import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { useApp } from '@/app/App';

export function NetWorthCard() {
  const { state, setLoanBalance, toggleRoundUp } = useApp();
  const lang = state.language;
  const [showDetails, setShowDetails] = useState(false);
  const [editingLoans, setEditingLoans] = useState(false);
  const [loanInput, setLoanInput] = useState(state.loanBalance.toString());

  const fmt = (n: number) =>
    new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(n);

  const totalAssets = state.cashBalance + state.mobileMoneyBalance + state.bankBalance + (state.roundUpSavings || 0);
  const netWorth = totalAssets - state.loanBalance;
  const isPositive = netWorth >= 0;

  const assets = [
    { label: lang === 'sw' ? '💵 Taslimu' : '💵 Cash', value: state.cashBalance },
    { label: lang === 'sw' ? '📱 M-Money' : '📱 Mobile Money', value: state.mobileMoneyBalance },
    { label: lang === 'sw' ? '🏦 Benki' : '🏦 Bank', value: state.bankBalance },
    { label: '🪙 Round-up', value: state.roundUpSavings || 0 },
  ].filter(a => a.value > 0);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between px-4 pt-4 pb-3"
      >
        <div className="flex items-center gap-2">
          {isPositive
            ? <TrendingUp className="w-4 h-4 text-emerald-600" />
            : <TrendingDown className="w-4 h-4 text-red-500" />}
          <span className="text-sm font-bold text-gray-900">
            {lang === 'sw' ? 'Thamani Halisi' : 'Net Worth'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-base font-black ${isPositive ? 'text-emerald-700' : 'text-red-600'}`}>
            {fmt(netWorth)}
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Assets */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {lang === 'sw' ? 'Rasilimali' : 'Assets'} — {fmt(totalAssets)}
                </p>
                <div className="space-y-1.5">
                  {assets.map(a => (
                    <div key={a.label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">{a.label}</span>
                      <span className="text-xs font-semibold text-emerald-700">{fmt(a.value)}</span>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-1">
                      {lang === 'sw' ? 'Hakuna rasilimali' : 'No assets recorded'}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Liabilities */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {lang === 'sw' ? 'Madeni' : 'Liabilities'} — {fmt(state.loanBalance)}
                </p>
                {editingLoans ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={loanInput}
                      onChange={e => setLoanInput(e.target.value)}
                      placeholder="0"
                      className="flex-1 border-2 border-red-300 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-red-500"
                      autoFocus
                    />
                    <button
                      onClick={() => { setLoanBalance(parseFloat(loanInput) || 0); setEditingLoans(false); }}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold"
                    >
                      {lang === 'sw' ? 'Hifadhi' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">💳</span>
                      <span className="text-xs text-gray-600">{lang === 'sw' ? 'Mikopo / Madeni' : 'Loans / Debts'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${state.loanBalance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {fmt(state.loanBalance)}
                      </span>
                      <button onClick={() => setEditingLoans(true)} className="p-1 hover:bg-gray-100 rounded-full">
                        <Edit2 className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Round-up savings toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-800">🪙 {lang === 'sw' ? 'Akiba ya Round-up' : 'Round-up Savings'}</p>
                  <p className="text-xs text-gray-400">
                    {lang === 'sw'
                      ? 'Okoa chenji kila unapotumia'
                      : 'Save spare change on every purchase'}
                  </p>
                </div>
                <button
                  onClick={toggleRoundUp}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    state.roundUpEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                    animate={{ left: state.roundUpEnabled ? '26px' : '2px' }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </button>
              </div>
              {state.roundUpEnabled && (state.roundUpSavings || 0) > 0 && (
                <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs text-emerald-700">
                    🎉 {lang === 'sw' ? `Umeokolewa na round-up: ${fmt(state.roundUpSavings)}` : `Saved via round-up: ${fmt(state.roundUpSavings)}`}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
