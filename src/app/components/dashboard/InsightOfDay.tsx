import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { useApp } from '@/app/App';

type InsightType = 'over_budget' | 'weekly_up' | 'weekly_down' | 'top_cat' | 'savings_tip' | 'motivation' | 'streak';

interface Insight {
  type: InsightType;
  emoji: string;
  text: string;
  style: 'alert' | 'success' | 'tip' | 'motivation';
}

/** Rotate insight type each day to avoid repetition */
function getDailyRotationIndex(): number {
  const startEpoch = new Date('2024-01-01').getTime();
  const daysSince = Math.floor((Date.now() - startEpoch) / 86400000);
  return daysSince;
}

export function InsightOfDay() {
  const { state, getCategorySpending } = useApp();
  const lang = state.language;

  const insight = useMemo((): Insight => {
    const allTx = state.transactions;
    const categorySpending = getCategorySpending();
    const totalExpense = Object.values(categorySpending).reduce((s, v) => s + v, 0);
    const topCat = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0];
    const rotIdx = getDailyRotationIndex();

    // Build a priority-ordered candidate list
    const candidates: Insight[] = [];

    // 1. Over-budget alerts (highest priority, always show first)
    const overBudget = Object.entries(state.categoryBudgets).find(([cat, limit]) => {
      const spent = categorySpending[cat] || 0;
      return limit > 0 && spent / limit >= 0.8;
    });
    if (overBudget) {
      const [cat, limit] = overBudget;
      const spent = categorySpending[cat] || 0;
      const pct = Math.round((spent / limit) * 100);
      candidates.push({
        type: 'over_budget', emoji: '⚠️',
        text: lang === 'sw' ? `${cat}: ${pct}% ya bajeti yako.` : `${cat}: ${pct}% of your budget used.`,
        style: 'alert',
      });
    }

    // 2. Weekly comparison
    const thisWeekStart = new Date(); thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay()); thisWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const thisWeekSpent = allTx.filter(t => t.type === 'expense' && t.date >= thisWeekStart).reduce((s, t) => s + t.amount, 0);
    const lastWeekSpent = allTx.filter(t => t.type === 'expense' && t.date >= lastWeekStart && t.date < thisWeekStart).reduce((s, t) => s + t.amount, 0);
    if (lastWeekSpent > 0 && thisWeekSpent > 0) {
      const diff = Math.round(((thisWeekSpent - lastWeekSpent) / lastWeekSpent) * 100);
      if (diff > 15) {
        candidates.push({
          type: 'weekly_up', emoji: '📈',
          text: lang === 'sw' ? `Matumizi +${diff}% wiki hii.` : `Spending up ${diff}% this week.`,
          style: 'alert',
        });
      } else if (diff < -10) {
        candidates.push({
          type: 'weekly_down', emoji: '📉',
          text: lang === 'sw' ? `Matumizi -${Math.abs(diff)}% wiki hii. Hongera!` : `Spending down ${Math.abs(diff)}% this week. Great!`,
          style: 'success',
        });
      }
    }

    // 3. Top category insight (rotate with index to avoid always showing same)
    if (topCat && totalExpense > 0) {
      const pct = Math.round((topCat[1] / totalExpense) * 100);
      candidates.push({
        type: 'top_cat', emoji: '📊',
        text: lang === 'sw' ? `${topCat[0]} = ${pct}% ya matumizi yako.` : `${topCat[0]} is ${pct}% of spending.`,
        style: 'tip',
      });
    }

    // 4. Streak encouragement
    if (state.streak >= 3) {
      candidates.push({
        type: 'streak', emoji: '🔥',
        text: lang === 'sw' ? `Siku ${state.streak} mfululizo! Endelea!` : `${state.streak}-day streak! Keep going!`,
        style: 'success',
      });
    }

    // 5. Predictive: "At this pace..."
    if (topCat) {
      const budgetForTopCat = state.categoryBudgets[topCat[0]];
      if (budgetForTopCat) {
        const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
        const daysPassed = new Date().getDate();
        const dailyRate = topCat[1] / Math.max(daysPassed, 1);
        const projected = topCat[1] + dailyRate * daysLeft;
        if (projected > budgetForTopCat * 1.1) {
          candidates.push({
            type: 'over_budget', emoji: '🚨',
            text: lang === 'sw'
              ? `${topCat[0]}: utazidi bajeti Ijumaa hii.`
              : `${topCat[0]}: you'll exceed budget by Friday.`,
            style: 'alert',
          });
        }
      }
    }

    // 6. Savings tip
    if (totalExpense > 0) {
      const save10 = Math.round(totalExpense * 0.1);
      candidates.push({
        type: 'savings_tip', emoji: '💰',
        text: lang === 'sw' ? `Piga 10% — okoa TSh ${save10.toLocaleString()}.` : `Cut 10% → save TSh ${save10.toLocaleString()}.`,
        style: 'tip',
      });
    }

    // 7. Motivation (fallback)
    const motivations: Insight[] = [
      { type: 'motivation', emoji: '🌱', text: lang === 'sw' ? 'Kila shilingi iliyookolewa inakua.' : 'Every saved shilling grows.', style: 'motivation' },
      { type: 'motivation', emoji: '🎯', text: lang === 'sw' ? 'Lengo moja kwa wakati mmoja.' : 'One goal at a time.', style: 'motivation' },
      { type: 'motivation', emoji: '⚡', text: lang === 'sw' ? 'Anza kurekodi — maarifa yanakuja.' : 'Start logging — insights follow.', style: 'motivation' },
      { type: 'motivation', emoji: '🏆', text: lang === 'sw' ? 'Nidhamu ya leo = uhuru wa kesho.' : "Today's discipline = tomorrow's freedom.", style: 'motivation' },
    ];
    candidates.push(motivations[rotIdx % motivations.length]);

    if (candidates.length === 0) return motivations[0];

    // If alert exists, always show it. Otherwise rotate
    const alert = candidates.find(c => c.style === 'alert');
    if (alert) return alert;

    // Rotate through non-alert candidates daily
    const nonAlert = candidates.filter(c => c.style !== 'alert');
    return nonAlert[rotIdx % nonAlert.length];
  }, [state.transactions, state.categoryBudgets, state.streak, lang, getCategorySpending]);

  const styles: Record<string, string> = {
    alert: 'bg-orange-50 border-orange-200',
    success: 'bg-emerald-50 border-emerald-200',
    tip: 'bg-blue-50 border-blue-200',
    motivation: 'bg-purple-50 border-purple-200',
  };
  const textStyles: Record<string, string> = {
    alert: 'text-orange-800',
    success: 'text-emerald-800',
    tip: 'text-blue-800',
    motivation: 'text-purple-800',
  };
  const glowStyles: Record<string, string> = {
    alert: 'shadow-orange-100',
    success: 'shadow-emerald-100',
    tip: 'shadow-blue-100',
    motivation: 'shadow-purple-100',
  };

  return (
    <motion.div
      key={insight.type + insight.text}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl p-4 border shadow-lg ${styles[insight.style]} ${glowStyles[insight.style]}`}
    >
      <div className="flex items-center gap-3">
        {/* Pulsing glow icon */}
        <motion.div
          className="bg-white/70 p-2 rounded-full shadow-sm shrink-0"
          animate={{ boxShadow: ['0 0 0 0px rgba(0,0,0,0.05)', '0 0 0 6px rgba(0,0,0,0)', '0 0 0 0px rgba(0,0,0,0)'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
        </motion.div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">
            {lang === 'sw' ? 'Maarifa ya Leo' : 'Insight of the Day'}
          </p>
          <p className={`text-sm font-semibold leading-snug ${textStyles[insight.style]}`}>
            {insight.emoji} {insight.text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
