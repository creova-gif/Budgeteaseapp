import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X } from 'lucide-react';
import { useApp } from '@/app/App';
import { Button } from '@/app/components/ui/button';

interface SpendingNudgeProps {
  onAddExpense: () => void;
}

export function SpendingNudge({ onAddExpense }: SpendingNudgeProps) {
  const { state, getTodayExpenses } = useApp();
  const lang = state.language;
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check at 6 PM if no expenses logged today
    const checkNudge = () => {
      const hour = new Date().getHours();
      const todayExpenses = getTodayExpenses();

      // Show nudge if it's evening (6-10 PM) and no expenses logged
      if (hour >= 18 && hour < 22 && todayExpenses === 0 && state.onboardingComplete) {
        // Wait a bit before showing
        setTimeout(() => setShow(true), 2000);
      }
    };

    // Check immediately
    checkNudge();

    // Check every 30 minutes
    const interval = setInterval(checkNudge, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [getTodayExpenses, state.onboardingComplete]);

  const handleQuickAdd = () => {
    setShow(false);
    onAddExpense();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 left-6 right-6 z-40"
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {lang === 'sw' ? 'Je, ulitumia pesa leo?' : 'Did you spend any money today?'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {lang === 'sw' 
                      ? 'Gusa kuongeza kwa sekunde 5'
                      : 'Tap to add in 5 seconds'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleQuickAdd}
                className="flex-1 bg-white text-blue-700 hover:bg-blue-50"
              >
                {lang === 'sw' ? 'Ndio, Ongeza' : 'Yes, Add'}
              </Button>
              <Button
                onClick={() => setShow(false)}
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10"
              >
                {lang === 'sw' ? 'Hapana' : 'No'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}