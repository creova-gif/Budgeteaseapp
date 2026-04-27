import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Settings2 } from 'lucide-react';
import { useApp } from '@/app/App';
import { BudgetLimitsSheet } from './BudgetLimitsSheet';
import { getCategoryIcon } from '@/app/utils/categoryIcons';
import { formatCurrency } from '@/app/utils/currency';

function getBarColor(pct: number) {
  if (pct >= 100) return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200' };
  if (pct >= 80) return { bar: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' };
  if (pct >= 60) return { bar: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
}

export function BudgetHealthBars() {
  const { state, getCategorySpending } = useApp();
  const lang = state.language;
  const [showLimits, setShowLimits] = useState(false);
  const categorySpending = getCategorySpending();
  const formatK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toString();
  const fmt = (n: number) => formatCurrency(n, state.region);

  const budgetedCategories = Object.keys(state.categoryBudgets);
  const spendingCategories = Object.keys(categorySpending).filter(c => !budgetedCategories.includes(c));
  const allCategories = [...budgetedCategories, ...spendingCategories];
  const hasData = allCategories.length > 0;

  const alerts = budgetedCategories.filter(cat => {
    const spent = categorySpending[cat] || 0;
    const budget = state.categoryBudgets[cat];
    return budget > 0 && spent / budget >= 0.8;
  });

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-bold text-gray-900">
            {lang === 'sw' ? '📊 Afya ya Bajeti' : '📊 Budget Health'}
          </h3>
          <button
            onClick={() => setShowLimits(true)}
            className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full"
          >
            <Settings2 className="w-3 h-3" />
            {lang === 'sw' ? 'Weka Mipaka' : 'Set Limits'}
          </button>
        </div>

        {/* Alert banner */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mx-4 mb-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-xs text-orange-800 font-medium">
              {lang === 'sw'
                ? `⚠️ ${alerts.join(', ')}: umekaribia mipaka!`
                : `⚠️ ${alerts.join(', ')}: approaching budget limits!`}
            </p>
          </motion.div>
        )}

        <div className="px-4 pb-4 space-y-4">
          {!hasData ? (
            <div className="py-5 text-center">
              <p className="text-sm text-gray-400">
                {lang === 'sw' ? 'Ongeza miamala au weka mipaka' : 'Add transactions or set budget limits'}
              </p>
            </div>
          ) : (
            allCategories.slice(0, 6).map(cat => {
              const spent = categorySpending[cat] || 0;
              const budget = state.categoryBudgets[cat];
              const pct = budget ? Math.min((spent / budget) * 100, 100) : null;
              const colors = pct !== null ? getBarColor(pct) : { bar: 'bg-blue-400', text: 'text-blue-600', bg: '' };
              const emoji = getCategoryIcon(cat);
              const remaining = budget ? budget - spent : null;

              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{emoji}</span>
                      <span className="text-xs font-semibold text-gray-800">{cat}</span>
                      {pct !== null && pct >= 80 && <span className="text-xs">⚠️</span>}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-600">{fmt(spent)}</span>
                      {budget && <span className="text-xs text-gray-400"> / {formatK(budget)}</span>}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${colors.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: pct !== null ? `${pct}%` : '60%' }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                  {/* Remaining amount row */}
                  <div className="flex justify-between items-center mt-0.5">
                    {pct !== null && (
                      <p className={`text-xs ${colors.text}`}>{pct.toFixed(0)}%</p>
                    )}
                    {remaining !== null && remaining > 0 && (
                      <p className="text-xs text-gray-400 ml-auto">
                        {lang === 'sw' ? 'Imebaki:' : 'Remaining:'}{' '}
                        <span className={`font-semibold ${colors.text}`}>{fmt(remaining)}</span>
                      </p>
                    )}
                    {remaining !== null && remaining <= 0 && (
                      <p className="text-xs text-red-500 font-semibold ml-auto">
                        {lang === 'sw' ? 'Umezidi!' : 'Over budget!'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showLimits && <BudgetLimitsSheet onClose={() => setShowLimits(false)} />}
    </>
  );
}