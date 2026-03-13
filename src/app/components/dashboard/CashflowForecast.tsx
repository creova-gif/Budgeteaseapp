import { useMemo } from 'react';
import { motion } from 'motion/react';
import { CalendarClock, TrendingDown, AlertCircle } from 'lucide-react';
import { useApp } from '@/app/App';
import { getCategoryIcon } from '@/app/utils/categoryIcons';

interface RecurringItem {
  category: string;
  avgAmount: number;
  nextDue: Date;
  daysUntil: number;
  source: string;
}

/** Detect recurring expenses: category appears ≥ 3× in last 60 days with similar amounts */
function detectRecurring(transactions: ReturnType<typeof useApp>['state']['transactions']): RecurringItem[] {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

  const byCategory: Record<string, { dates: Date[]; amounts: number[]; source: string }> = {};
  transactions
    .filter(t => t.type === 'expense' && t.date >= sixtyDaysAgo)
    .forEach(t => {
      if (!byCategory[t.category]) byCategory[t.category] = { dates: [], amounts: [], source: t.source };
      byCategory[t.category].dates.push(t.date);
      byCategory[t.category].amounts.push(t.amount);
      byCategory[t.category].source = t.source;
    });

  const items: RecurringItem[] = [];
  for (const [cat, data] of Object.entries(byCategory)) {
    if (data.dates.length < 2) continue;
    const sorted = [...data.dates].sort((a, b) => a.getTime() - b.getTime());
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((sorted[i].getTime() - sorted[i - 1].getTime()) / 86400000);
    }
    const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    // Consider recurring if avg interval is 7–35 days (weekly/monthly)
    if (avgInterval < 4 || avgInterval > 45) continue;

    const avgAmount = Math.round(data.amounts.reduce((s, v) => s + v, 0) / data.amounts.length);
    const lastDate = sorted[sorted.length - 1];
    const nextDue = new Date(lastDate.getTime() + avgInterval * 86400000);
    const daysUntil = Math.round((nextDue.getTime() - now.getTime()) / 86400000);

    items.push({ category: cat, avgAmount, nextDue, daysUntil, source: data.source });
  }

  return items.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);
}

export function CashflowForecast() {
  const { state } = useApp();
  const lang = state.language;

  const fmt = (n: number) => `TSh ${n.toLocaleString()}`;

  const recurring = useMemo(() => detectRecurring(state.transactions), [state.transactions]);

  const totalBalance = state.cashBalance + state.mobileMoneyBalance + state.bankBalance;
  const upcoming30 = recurring.filter(r => r.daysUntil >= 0 && r.daysUntil <= 30);
  const projected = totalBalance - upcoming30.reduce((s, r) => s + r.avgAmount, 0);

  if (recurring.length === 0) return null;

  const getDueLabel = (days: number) => {
    if (days < 0) return lang === 'sw' ? 'Imepita' : 'Overdue';
    if (days === 0) return lang === 'sw' ? 'Leo' : 'Today';
    if (days === 1) return lang === 'sw' ? 'Kesho' : 'Tomorrow';
    if (days <= 7) return lang === 'sw' ? `Siku ${days}` : `In ${days} days`;
    if (days <= 14) return lang === 'sw' ? 'Wiki 2' : '2 weeks';
    return lang === 'sw' ? `Siku ${days}` : `In ${days} days`;
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (days <= 7) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">
            {lang === 'sw' ? 'Utabiri wa Cashflow' : 'Cashflow Forecast'}
          </h3>
        </div>
        <span className="text-xs text-gray-400">
          {lang === 'sw' ? 'Siku 30 zijazo' : 'Next 30 days'}
        </span>
      </div>

      <div className="px-4 pb-2 space-y-2">
        {recurring.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCategoryIcon(item.category)}</span>
              <div>
                <p className="text-xs font-semibold text-gray-900">{item.category}</p>
                <p className="text-xs text-gray-400">{item.source.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getUrgencyColor(item.daysUntil)}`}>
                {getDueLabel(item.daysUntil)}
              </span>
              <span className="text-xs font-bold text-gray-800">{fmt(item.avgAmount)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Projected balance after upcoming bills */}
      {upcoming30.length > 0 && (
        <div className={`mx-4 mb-4 rounded-xl px-3 py-2.5 flex items-center gap-2 ${
          projected >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
        }`}>
          {projected >= 0
            ? <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
          <p className={`text-xs font-medium ${projected >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
            {lang === 'sw'
              ? `Bakaa baada ya malipo: ${fmt(projected)}`
              : `Balance after bills: ${fmt(projected)}`}
          </p>
        </div>
      )}
    </div>
  );
}
