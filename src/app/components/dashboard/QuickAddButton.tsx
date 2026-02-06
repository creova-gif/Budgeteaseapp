import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, TrendingDown } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

export function QuickAddButton() {
  const { state, addTransaction } = useApp();
  const lang = state.language;
  const [isOpen, setIsOpen] = useState(false);

  const getSmartSuggestions = () => {
    const hour = new Date().getHours();
    const suggestions: { category: string; amount: number; emoji: string; time: string }[] = [];

    // Time-based smart suggestions
    if (hour >= 6 && hour < 10) {
      suggestions.push({ category: 'Chakula', amount: 3000, emoji: '🍳', time: 'Breakfast' });
    } else if (hour >= 12 && hour < 15) {
      suggestions.push({ category: 'Chakula', amount: 5000, emoji: '🍛', time: 'Lunch' });
    } else if (hour >= 18 && hour < 22) {
      suggestions.push({ category: 'Chakula', amount: 6000, emoji: '🍽️', time: 'Dinner' });
    }

    // Common expenses
    if (hour >= 7 && hour < 20) {
      suggestions.push({ category: 'Usafiri', amount: 2000, emoji: '🚌', time: 'Transport' });
    }

    // Pattern-based (from history)
    const recentExpenses = state.transactions
      .filter(t => t.type === 'expense')
      .slice(0, 10);

    const categoryFrequency = recentExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequent = Object.entries(categoryFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    mostFrequent.forEach(([category]) => {
      const avgAmount = recentExpenses
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0) / recentExpenses.filter(t => t.category === category).length;

      if (!suggestions.find(s => s.category === category)) {
        const emoji = category === 'Data na Muda' ? '📱' : category === 'Biashara' ? '💼' : '💰';
        suggestions.push({ category, amount: Math.round(avgAmount), emoji, time: 'Recent' });
      }
    });

    return suggestions.slice(0, 4);
  };

  const suggestions = getSmartSuggestions();

  const handleQuickAdd = (category: string, amount: number) => {
    addTransaction({
      type: 'expense',
      amount,
      category,
      source: 'cash',
      notes: lang === 'sw' ? 'Imeongezwa haraka' : 'Quick added',
    });

    toast.success(
      lang === 'sw' 
        ? `${category} - TSh ${amount.toLocaleString()} imeongezwa!`
        : `${category} - TSh ${amount.toLocaleString()} added!`,
      { duration: 2000 }
    );

    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-emerald-700 transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Quick Add Modal */}
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
              className="bg-white w-full rounded-t-3xl p-6 pb-8 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {lang === 'sw' ? 'Ongeza Haraka' : 'Quick Add'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {lang === 'sw' ? 'Chagua au gusa bidhaa' : 'Select or tap item'}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Smart Suggestions */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  {lang === 'sw' ? 'Mapendekezo ya Akili' : 'Smart Suggestions'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickAdd(suggestion.category, suggestion.amount)}
                      className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-4 text-left hover:shadow-lg hover:scale-105 transition-all"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-3xl">{suggestion.emoji}</span>
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{suggestion.category}</p>
                      <p className="text-lg font-bold text-emerald-700">
                        TSh {suggestion.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lang === 'sw' ? suggestion.time : suggestion.time}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Manual Entry Button */}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  // This will trigger the full add transaction dialog
                }}
                variant="outline"
                className="w-full py-6 border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                {lang === 'sw' ? 'Ongeza Kwa Mikono' : 'Add Manually'}
              </Button>

              {/* Quick Tip */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-900">
                  💡 {lang === 'sw' 
                    ? 'Tip: Tunapenda mienendo yako ili kukupatia mapendekezo bora zaidi!'
                    : 'Tip: We learn your patterns to give you better suggestions!'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}