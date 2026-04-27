import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, TrendingDown, Zap } from 'lucide-react';
import { useApp } from '@/app/App';
import { AddTransactionDialog } from './AddTransactionDialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/app/utils/currency';

export function QuickAddButton() {
  const { state, addTransaction } = useApp();
  const lang = state.language;
  const [isOpen, setIsOpen] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const getSmartSuggestions = () => {
    const hour = new Date().getHours();
    const suggestions: { category: string; amount: number; emoji: string; label: string }[] = [];

    if (hour >= 6 && hour < 10) suggestions.push({ category: lang === 'sw' ? 'Chakula' : 'Food', amount: 3000, emoji: '🍳', label: lang === 'sw' ? 'Kiamsha kinywa' : 'Breakfast' });
    else if (hour >= 11 && hour < 15) suggestions.push({ category: lang === 'sw' ? 'Chakula' : 'Food', amount: 5000, emoji: '🍛', label: lang === 'sw' ? 'Chakula cha mchana' : 'Lunch' });
    else if (hour >= 17 && hour < 22) suggestions.push({ category: lang === 'sw' ? 'Chakula' : 'Food', amount: 6000, emoji: '🍽️', label: lang === 'sw' ? 'Chakula cha jioni' : 'Dinner' });

    if (hour >= 7 && hour < 20) suggestions.push({ category: lang === 'sw' ? 'Usafiri' : 'Transport', amount: 2000, emoji: '🚌', label: lang === 'sw' ? 'Usafiri' : 'Transport' });

    // History-based suggestions
    const recent = state.transactions.filter(t => t.type === 'expense').slice(0, 15);
    const freq: Record<string, { count: number; total: number }> = {};
    recent.forEach(t => {
      if (!freq[t.category]) freq[t.category] = { count: 0, total: 0 };
      freq[t.category].count++;
      freq[t.category].total += t.amount;
    });
    Object.entries(freq)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 2)
      .forEach(([cat, data]) => {
        const avg = Math.round(data.total / data.count);
        if (!suggestions.find(s => s.category === cat)) {
          const emoji = cat.includes('Data') || cat.includes('Airtime') ? '📱' : cat.includes('Biashara') || cat.includes('Business') ? '💼' : '💰';
          suggestions.push({ category: cat, amount: avg, emoji, label: lang === 'sw' ? 'Karibuni' : 'Recent' });
        }
      });

    return suggestions.slice(0, 4);
  };

  const suggestions = getSmartSuggestions();

  const handleQuickAdd = (category: string, amount: number) => {
    addTransaction({ type: 'expense', amount, category, source: 'cash', notes: '' });
    toast.success(`✓ ${category} – ${formatCurrency(amount, state.region)}`, { duration: 2000 });
    setIsOpen(false);
  };

  if (showManual) {
    return <AddTransactionDialog type="expense" onClose={() => setShowManual(false)} />;
  }

  return (
    <>
      {/* FAB — left side so it doesn't overlap the AI assistant (right-4) */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 bg-emerald-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-emerald-700 transition"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Quick Add Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white w-full rounded-t-3xl p-5 pb-8 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {lang === 'sw' ? '⚡ Ongeza Haraka' : '⚡ Quick Add'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'sw' ? 'Gusa mara moja kurekodi' : 'One tap to record'}
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Smart Suggestions Grid */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {lang === 'sw' ? 'Mapendekezo ya Akili' : 'Smart Suggestions'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      onClick={() => handleQuickAdd(s.category, s.amount)}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-4 text-left hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{s.emoji}</span>
                        <TrendingDown className="w-4 h-4 text-red-400 mt-0.5" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm truncate">{s.category}</p>
                      <p className="text-base font-black text-emerald-700">{formatCurrency(s.amount, state.region)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Manual entry button */}
              <button
                onClick={() => { setIsOpen(false); setTimeout(() => setShowManual(true), 200); }}
                className="w-full py-3.5 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 font-medium text-sm hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {lang === 'sw' ? 'Ongeza Kwa Mikono (na ziada)' : 'Add Manually (with details)'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}