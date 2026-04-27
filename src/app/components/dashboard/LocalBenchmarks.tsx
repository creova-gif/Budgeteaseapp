import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { useApp } from '@/app/App';
import { formatCurrency } from '@/app/utils/currency';

export function LocalBenchmarks() {
  const { state, getTodayExpenses, getCategorySpending } = useApp();
  const lang = state.language;

  const todayExpenses = getTodayExpenses();
  const categorySpending = getCategorySpending();

  // Mock local averages (in production, this would come from anonymized data)
  const localAverages = {
    dailyTotal: 15000,
    'Chakula': 7000,
    'Usafiri': 3000,
    'Data na Muda': 2000,
  };

  const getComparison = (userSpend: number, average: number) => {
    const diff = userSpend - average;
    const percentDiff = Math.abs((diff / average) * 100);

    if (Math.abs(diff) < average * 0.1) {
      return {
        icon: Minus,
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        text: lang === 'sw' ? 'Sawa na wastani' : 'On average',
      };
    } else if (diff < 0) {
      return {
        icon: TrendingDown,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
        text: lang === 'sw' 
          ? `${percentDiff.toFixed(0)}% chini ya wastani`
          : `${percentDiff.toFixed(0)}% below average`,
      };
    } else {
      return {
        icon: TrendingUp,
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        text: lang === 'sw'
          ? `${percentDiff.toFixed(0)}% juu ya wastani`
          : `${percentDiff.toFixed(0)}% above average`,
      };
    }
  };

  const dailyComparison = getComparison(todayExpenses, localAverages.dailyTotal);
  const DailyIcon = dailyComparison.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-md"
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">
          {lang === 'sw' ? 'Ulinganisho wa Eneo Lako' : 'Local Comparison'}
        </h3>
      </div>

      {/* Daily Total Comparison */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            {lang === 'sw' ? 'Matumizi ya Leo' : 'Daily Spending'}
          </p>
          <div className={`flex items-center gap-2 ${dailyComparison.bg} px-3 py-1 rounded-full`}>
            <DailyIcon className={`w-4 h-4 ${dailyComparison.color}`} />
            <span className={`text-xs font-medium ${dailyComparison.color}`}>
              {dailyComparison.text}
            </span>
          </div>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <p className="text-xs text-gray-500">
              {lang === 'sw' ? 'Wewe' : 'You'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(todayExpenses, state.region)}
            </p>
          </div>
          <div className="text-gray-400">vs</div>
          <div>
            <p className="text-xs text-gray-500">
              {lang === 'sw' ? 'Wastani wa eneo' : 'Area average'}
            </p>
            <p className="text-lg font-semibold text-gray-600">
              {formatCurrency(localAverages.dailyTotal, state.region)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Comparisons */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {lang === 'sw' ? 'Kwa Jamii' : 'By Category'}
        </p>
        {Object.entries(localAverages)
          .filter(([key]) => key !== 'dailyTotal')
          .map(([category, average]) => {
            const userSpend = categorySpending[category] || 0;
            const comparison = getComparison(userSpend, average);
            const CompIcon = comparison.icon;

            return (
              <div key={category} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="text-gray-700">{category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(userSpend, state.region)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500">
                      {formatCurrency(average, state.region)}
                    </span>
                  </div>
                </div>
                <div className={`${comparison.bg} p-1.5 rounded-full`}>
                  <CompIcon className={`w-3.5 h-3.5 ${comparison.color}`} />
                </div>
              </div>
            );
          })}
      </div>

      {/* Privacy Note */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          🔒 {lang === 'sw'
            ? 'Data hizi ni za wastani na hazijulikani kwa mtu binafsi'
            : 'This data is anonymous and aggregated'}
        </p>
      </div>
    </motion.div>
  );
}