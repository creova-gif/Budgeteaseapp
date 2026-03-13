import { useMemo } from 'react';
import { motion } from 'motion/react';
import { PiggyBank, Shield, Flame } from 'lucide-react';
import { useApp } from '@/app/App';

function ScoreArc({ score }: { score: number }) {
  const r = 52, cx = 70, cy = 70;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const polar = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });
  const startAngle = -210, sweepAngle = 240;
  const s = polar(startAngle);
  const e = polar(startAngle + sweepAngle);
  const bgPath = `M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`;
  const filled = (score / 100) * sweepAngle;
  const fe = polar(startAngle + filled);
  const fgPath = score > 0
    ? `M ${s.x} ${s.y} A ${r} ${r} 0 ${filled > 180 ? 1 : 0} 1 ${fe.x} ${fe.y}`
    : '';
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="140" height="95" viewBox="0 0 140 95">
      <path d={bgPath} fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
      {fgPath && (
        <motion.path
          d={fgPath} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      )}
    </svg>
  );
}

export function FinancialHealthScore() {
  const { state } = useApp();
  const lang = state.language;

  const { score, savingsScore, disciplineScore, consistencyScore, grade } = useMemo(() => {
    const allTx = state.transactions;

    // ── Savings Score (0–40): Reward CONSISTENCY, not amount ──
    // Count days in last 30 where income > 0 AND net ≥ 0 (didn't overspend)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toDateString();
    });
    const consistentDays = last30Days.filter(day => {
      const dayTx = allTx.filter(t => t.date.toDateString() === day);
      if (dayTx.length === 0) return false;
      const income = dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return income > 0 && income >= expense; // Saved something
    }).length;
    const savingsScore = Math.min(40, Math.round((consistentDays / Math.max(1, last30Days.filter(d => allTx.some(t => t.date.toDateString() === d)).length)) * 40));

    // ── Discipline Score (0–35): Days tracked in last 7 ──
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toDateString();
    });
    const activeDays = last7.filter(day => allTx.some(t => t.date.toDateString() === day)).length;
    const disciplineScore = Math.round((activeDays / 7) * 35);

    // ── Consistency Score (0–25): Streak ──
    const consistencyScore = Math.min(25, state.streak * 5);

    const score = Math.min(100, savingsScore + disciplineScore + consistencyScore);
    const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D';

    return { score, savingsScore, disciplineScore, consistencyScore, grade };
  }, [state.transactions, state.streak]);

  const gradeInfo = (() => {
    if (score >= 80) return { label: lang === 'sw' ? 'Bora Sana! 🌟' : 'Excellent! 🌟', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 65) return { label: lang === 'sw' ? 'Vizuri! 👍' : 'Good! 👍', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 50) return { label: lang === 'sw' ? 'Inakubalika' : 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: lang === 'sw' ? 'Inaweza Kuimarika' : 'Needs Work', color: 'text-red-600', bg: 'bg-red-50' };
  })();

  const bars = [
    { icon: PiggyBank, color: 'text-emerald-500', barColor: 'bg-emerald-500', label: lang === 'sw' ? 'Akiba Thabiti' : 'Saving Habit', val: savingsScore, max: 40 },
    { icon: Shield, color: 'text-blue-500', barColor: 'bg-blue-500', label: lang === 'sw' ? 'Nidhamu' : 'Discipline', val: disciplineScore, max: 35 },
    { icon: Flame, color: 'text-orange-500', barColor: 'bg-orange-500', label: lang === 'sw' ? 'Mfululizo' : 'Streak', val: consistencyScore, max: 25 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">
          {lang === 'sw' ? '💡 Afya ya Fedha' : '💡 Money Health'}
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeInfo.bg} ${gradeInfo.color}`}>
          Grade {grade}
        </span>
      </div>

      <div className="flex items-center gap-3 px-4 pb-4">
        {/* Arc gauge */}
        <div className="relative shrink-0">
          <ScoreArc score={score} />
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: 8 }}>
            <motion.span
              className="text-3xl font-black text-gray-900"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-2.5">
          {bars.map(({ icon: Icon, color, barColor, label, val, max }, i) => (
            <div key={label}>
              <div className="flex justify-between items-center mb-0.5">
                <div className="flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${color}`} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
                <span className="text-xs font-bold text-gray-800">{val}/{max}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${barColor} rounded-full`}
                  animate={{ width: `${(val / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`mx-4 mb-4 ${gradeInfo.bg} ${gradeInfo.color} text-xs font-medium py-2 px-3 rounded-xl text-center`}>
        {gradeInfo.label} — {lang === 'sw'
          ? 'Hifadhi kidogo kila siku ili uimarishe alama!'
          : 'Save something daily to boost your score!'}
      </div>
    </div>
  );
}
