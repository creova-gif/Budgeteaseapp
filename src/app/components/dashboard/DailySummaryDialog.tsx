import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, Target, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency as fmtCurrency } from '@/app/utils/currency';

interface DailySummaryDialogProps {
  onClose: () => void;
}

export function DailySummaryDialog({ onClose }: DailySummaryDialogProps) {
  const { state, getTodayIncome, getTodayExpenses, updateGoal, markDailySummaryShown } = useApp();
  const lang = state.language;
  const [autoSaveAmount, setAutoSaveAmount] = useState(1000);

  const formatCurrency = (amount: number) => fmtCurrency(amount, state.region);

  const todayIncome = getTodayIncome();
  const todayExpenses = getTodayExpenses();
  const remaining = todayIncome - todayExpenses;
  const goalContributions = 0; // Could calculate this from transactions

  // Smart auto-save suggestion (10% of income or TSh 1000, whichever is higher)
  const suggestedSave = Math.max(Math.round(todayIncome * 0.1), 1000);

  const getBudgetStatus = () => {
    if (remaining > 0) {
      return {
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        message: lang === 'sw' ? "Uko sawa! Unatumia vizuri." : "You're on track! Spending wisely.",
      };
    } else if (Math.abs(remaining) < todayIncome * 0.2) {
      return {
        icon: AlertCircle,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        message: lang === 'sw' ? "Umetumia zaidi kuliko kawaida." : "You spent more than usual.",
      };
    }
    return {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        message: lang === 'sw' ? "Umetumia zaidi ya mapato yako." : "You spent more than your income.",
      };
  };

  const status = getBudgetStatus();
  const StatusIcon = status.icon;

  const handleAutoSave = () => {
    if (state.goals.length > 0) {
      const activeGoal = state.goals.find(g => !g.completed) || state.goals[0];
      updateGoal(activeGoal.id, suggestedSave);
      toast.success(
        lang === 'sw'
          ? `${formatCurrency(suggestedSave)} imehifadhiwa kwenye "${activeGoal.title}"!`
          : `${formatCurrency(suggestedSave)} saved to "${activeGoal.title}"!`
      );
    }
    markDailySummaryShown();
    onClose();
  };

  const handleLater = () => {
    markDailySummaryShown();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={handleLater}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`${status.bg} p-2 rounded-full`}>
                <StatusIcon className={`w-6 h-6 ${status.color}`} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('dailySummary', lang)}</h2>
            </div>
            <button
              onClick={handleLater}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Status Message */}
          <div className={`${status.bg} ${status.color} px-4 py-3 rounded-2xl mb-6 text-center font-medium`}>
            {status.message}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-medium text-emerald-900">{t('todayIncome', lang)}</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(todayIncome)}</p>
            </div>

            <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <p className="text-xs font-medium text-red-900">{t('todayExpenses', lang)}</p>
              </div>
              <p className="text-xl font-bold text-red-600">{formatCurrency(todayExpenses)}</p>
            </div>
          </div>

          {/* Remaining */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">{t('remaining', lang)}</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {/* Auto-Save Suggestion (Only if there's positive income) */}
          {todayIncome > 0 && state.goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl p-5 mb-6"
            >
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-purple-900 mb-1">
                    {lang === 'sw' ? 'Hifadhi Leo?' : 'Save Today?'}
                  </p>
                  <p className="text-sm text-purple-700">
                    {lang === 'sw'
                      ? `Hifadhi ${formatCurrency(suggestedSave)} kwenye lengo lako?`
                      : `Save ${formatCurrency(suggestedSave)} toward your goal?`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAutoSave}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {lang === 'sw' ? 'Ndio, Hifadhi' : 'Yes, Save'}
                </Button>
                <Button
                  onClick={handleLater}
                  variant="outline"
                  className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  {lang === 'sw' ? 'Baadaye' : 'Later'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Actionable Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-900">
              💡 <strong>{lang === 'sw' ? 'Ushauri:' : 'Tip:'}</strong>{' '}
              {lang === 'sw'
                ? 'Jaribu kupunguza matumizi ya chakula kidogo ili kuokoa kiasi zaidi kwa siku.'
                : 'Try limiting food spending slightly to save more each day.'}
            </p>
          </div>

          {/* Close Button */}
          {!(todayIncome > 0 && state.goals.length > 0) && (
            <div className="flex gap-3">
              <Button onClick={handleLater} variant="outline" className="flex-1">
                {t('ok', lang)}
              </Button>
              <Button onClick={handleLater} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {t('viewFullReport', lang)}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}