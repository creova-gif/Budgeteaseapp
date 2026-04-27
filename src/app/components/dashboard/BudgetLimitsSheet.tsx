import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';
import { REGION_CONFIG } from '@/app/utils/currency';

interface BudgetLimitsSheetProps {
  onClose: () => void;
}

const CATEGORIES = {
  sw: ['Chakula', 'Usafiri', 'Kodi', 'Malipo', 'Data na Muda', 'Familia', 'Biashara', 'Afya', 'Burudani'],
  en: ['Food', 'Transport', 'Rent', 'Bills', 'Data & Airtime', 'Family', 'Business', 'Health', 'Entertainment'],
};

const CATEGORY_EMOJI: Record<string, string> = {
  Chakula: '🍛', Food: '🍛',
  Usafiri: '🚌', Transport: '🚌',
  Kodi: '🏠', Rent: '🏠',
  Malipo: '💡', Bills: '💡',
  'Data na Muda': '📱', 'Data & Airtime': '📱',
  Familia: '👨‍👩‍👧‍👦', Family: '👨‍👩‍👧‍👦',
  Biashara: '💼', Business: '💼',
  Afya: '💊', Health: '💊',
  Burudani: '🎮', Entertainment: '🎮',
};

const DEFAULT_AMOUNTS = [10000, 20000, 30000, 50000, 100000, 200000];

export function BudgetLimitsSheet({ onClose }: BudgetLimitsSheetProps) {
  const { state, setCategoryBudget } = useApp();
  const lang = state.language;
  const cats = CATEGORIES[lang];
  const symbol = REGION_CONFIG[state.region].symbol;

  // Local draft state
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    cats.forEach(cat => {
      const existing = state.categoryBudgets[cat];
      if (existing) init[cat] = existing.toString();
    });
    return init;
  });

  const handleSave = () => {
    cats.forEach(cat => {
      const val = parseInt(drafts[cat] || '0');
      if (val > 0) {
        setCategoryBudget(cat, val);
      }
    });
    toast.success(lang === 'sw' ? 'Mipaka imehifadhiwa! ✓' : 'Budget limits saved! ✓');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {lang === 'sw' ? '🎯 Mipaka ya Bajeti' : '🎯 Budget Limits'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === 'sw' ? 'Weka kikomo cha matumizi kwa kila aina' : 'Set a spending cap per category'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {cats.map(cat => {
            const emoji = CATEGORY_EMOJI[cat] || '💰';
            const val = drafts[cat] || '';
            const numVal = parseInt(val);

            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm font-semibold text-gray-800">{cat}</span>
                  {numVal > 0 && (
                    <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      {symbol} {numVal.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Quick pick chips */}
                <div className="flex gap-2 flex-wrap mb-2">
                  {DEFAULT_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDrafts(d => ({ ...d, [cat]: amt.toString() }))}
                      className={`text-xs px-3 py-1 rounded-full border transition ${
                        drafts[cat] === amt.toString()
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-gray-200 text-gray-600 hover:border-emerald-400'
                      }`}
                    >
                      {amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>

                {/* Manual input */}
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-emerald-500 transition">
                  <span className="pl-3 text-xs text-gray-500 font-medium">{symbol}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={val}
                    onChange={e => setDrafts(d => ({ ...d, [cat]: e.target.value }))}
                    className="flex-1 px-2 py-2.5 text-sm text-gray-900 outline-none bg-transparent"
                  />
                  {numVal > 0 && (
                    <button
                      onClick={() => setDrafts(d => ({ ...d, [cat]: '' }))}
                      className="pr-3 text-gray-300 hover:text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Save button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 mt-4 shadow-lg"
          >
            <Check className="w-5 h-5" />
            {lang === 'sw' ? 'Hifadhi Mipaka' : 'Save Budget Limits'}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}