import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, CheckCircle, TrendingDown, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { getCategoryIcon } from '@/app/utils/categoryIcons';
import { toast } from 'sonner';

/** Roadmap Feature 4 — Smart Budget Builder
 *  Analyses 30-day spend per category → suggests 10% tighter budget.
 */
export function SmartBudgetBuilder() {
  const { state, setCategoryBudget } = useApp();
  const lang = state.language;
  const [expanded, setExpanded] = useState(false);
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const fmt = (n: number) =>
    new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(n);

  const thirtyDaysAgo = useMemo(() => new Date(Date.now() - 30 * 86400000), []);

  /** Compute per-category 30-day avg → suggest 90% of that as the budget */
  const suggestions = useMemo(() => {
    const byCategory: Record<string, number[]> = {};
    state.transactions
      .filter(t => t.type === 'expense' && t.date >= thirtyDaysAgo)
      .forEach(t => {
        if (!byCategory[t.category]) byCategory[t.category] = [];
        byCategory[t.category].push(t.amount);
      });

    return Object.entries(byCategory)
      .map(([cat, amounts]) => {
        const total = amounts.reduce((s, v) => s + v, 0);
        const suggested = Math.round(total * 0.9 / 500) * 500; // 10% reduction, round to 500
        const current = state.categoryBudgets[cat] || 0;
        return { cat, total, suggested: Math.max(suggested, 1000), current, count: amounts.length };
      })
      .filter(s => s.suggested > 0)
      .sort((a, b) => b.total - a.total);
  }, [state.transactions, state.categoryBudgets, thirtyDaysAgo]);

  const hasData = suggestions.length > 0;
  const pendingCount = suggestions.filter(s => !applied[s.cat] && s.current !== s.suggested).length;

  const handleApply = (cat: string, amount: number) => {
    setCategoryBudget(cat, amount);
    setApplied(prev => ({ ...prev, [cat]: true }));
  };

  const handleApplyAll = () => {
    suggestions.forEach(s => { setCategoryBudget(s.cat, s.suggested); setApplied(prev => ({ ...prev, [s.cat]: true })); });
    toast.success(lang === 'sw' ? `✅ Bajeti ${suggestions.length} zimewekwa!` : `✅ ${suggestions.length} budgets applied!`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-4"
      >
        <div className="flex items-center gap-2">
          <div className="bg-violet-100 p-1.5 rounded-full">
            <Wand2 className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">
              {t('smartBudgetBuilder', lang)}
            </p>
            <p className="text-xs text-gray-400">
              {hasData
                ? (lang === 'sw' ? `${suggestions.length} mapendekezo kutoka takwimu za siku 30` : `${suggestions.length} suggestions from 30-day data`)
                : (lang === 'sw' ? 'Ongeza miamala zaidi ili kupata mapendekezo' : 'Add more transactions for suggestions')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{pendingCount}</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {!hasData ? (
              <div className="px-4 pb-5 text-center">
                <p className="text-sm text-gray-400">
                  {lang === 'sw'
                    ? 'Rekodi angalau miamala 5 kwa kila jamii kuona mapendekezo ya bajeti.'
                    : 'Record at least 5 transactions per category to get budget suggestions.'}
                </p>
              </div>
            ) : (
              <div className="px-4 pb-4">
                {/* Info banner */}
                <div className="flex items-start gap-2 bg-violet-50 rounded-xl px-3 py-2 mb-3">
                  <Info className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-violet-700">
                    {lang === 'sw'
                      ? 'Tumependekeza kupunguza matumizi kwa 10% katika kila jamii. Gusa "Tumia" kuweka bajeti.'
                      : 'We suggest 10% reduction per category based on your 30-day average. Tap "Apply" to set.'}
                  </p>
                </div>

                {/* Category rows */}
                <div className="space-y-2 mb-3">
                  {suggestions.map((s, i) => {
                    const isApplied = applied[s.cat] || s.current === s.suggested;
                    const saving = s.total - s.suggested;
                    return (
                      <motion.div
                        key={s.cat}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          isApplied ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <span className="text-xl shrink-0">{getCategoryIcon(s.cat)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900">{s.cat}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400">
                              {t('avg', lang)} {fmt(s.total)}
                            </span>
                            {saving > 0 && (
                              <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                                <TrendingDown className="w-3 h-3" />
                                {lang === 'sw' ? `Okoa ${fmt(saving)}` : `Save ${fmt(saving)}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {isApplied ? (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-semibold">{fmt(s.suggested)}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApply(s.cat, s.suggested)}
                              className="bg-violet-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                            >
                              {fmt(s.suggested)}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Apply all */}
                {pendingCount > 1 && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleApplyAll}
                    className="w-full py-3 bg-violet-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    {lang === 'sw' ? `Tumia Zote (${pendingCount})` : `Apply All (${pendingCount})`}
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
