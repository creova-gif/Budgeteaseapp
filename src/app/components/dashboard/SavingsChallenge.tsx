import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, X, Play, CheckCircle, Users, Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

/** Roadmap Feature 7 — Community Savings Challenges */

interface ChallengeTemplate {
  id: string;
  emoji: string;
  name: { sw: string; en: string };
  desc: { sw: string; en: string };
  targetDays: number;
  dailyAmount: number;
  communityPct: number; // mocked % of users on track
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'tpl-30day',
    emoji: '🔥',
    name: { sw: 'Changamoto ya Siku 30', en: '30-Day Savings Sprint' },
    desc: { sw: 'Hifadhi TSh 3,000 kila siku kwa siku 30', en: 'Save TSh 3,000 every day for 30 days' },
    targetDays: 30, dailyAmount: 3000, communityPct: 68,
    color: 'text-orange-600',
    gradientFrom: 'from-orange-500', gradientTo: 'to-orange-600',
  },
  {
    id: 'tpl-emergency',
    emoji: '🏦',
    name: { sw: 'Sprint ya Mfuko wa Dharura', en: 'Emergency Fund Sprint' },
    desc: { sw: 'Hifadhi TSh 5,000 kila siku kwa miezi 3', en: 'Save TSh 5,000 daily for 90 days' },
    targetDays: 90, dailyAmount: 5000, communityPct: 42,
    color: 'text-blue-600',
    gradientFrom: 'from-blue-500', gradientTo: 'to-blue-600',
  },
  {
    id: 'tpl-no-spend',
    emoji: '🚫',
    name: { sw: 'Wiki ya Bila Starehe', en: 'No-Entertainment Week' },
    desc: { sw: 'Epuka matumizi ya burudani kwa siku 7', en: 'Zero entertainment spending for 7 days' },
    targetDays: 7, dailyAmount: 2000, communityPct: 55,
    color: 'text-purple-600',
    gradientFrom: 'from-purple-500', gradientTo: 'to-purple-600',
  },
  {
    id: 'tpl-data',
    emoji: '📱',
    name: { sw: 'Punguza Data – Siku 14', en: 'Data Detox – 14 Days' },
    desc: { sw: 'Hifadhi TSh 1,000 kwa siku kwa kupunguza data', en: 'Save TSh 1,000/day by cutting data costs' },
    targetDays: 14, dailyAmount: 1000, communityPct: 74,
    color: 'text-teal-600',
    gradientFrom: 'from-teal-500', gradientTo: 'to-teal-600',
  },
];

export function SavingsChallenge() {
  const { state, startChallenge, logChallengeDay, abandonChallenge } = useApp();
  const lang = state.language;
  const [showStart, setShowStart] = useState<ChallengeTemplate | null>(null);
  const [logAmount, setLogAmount] = useState('');
  const [logTarget, setLogTarget] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const fmt = (n: number) => n >= 1000 ? `TSh ${(n / 1000).toFixed(0)}k` : `TSh ${n}`;
  const fmtFull = (n: number) =>
    new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(n);

  const activeChallenges = state.challenges?.filter(c => !c.completed) ?? [];
  const completedChallenges = state.challenges?.filter(c => c.completed) ?? [];

  const getChallengeProgress = (c: typeof state.challenges[0]) => {
    const daysElapsed = Math.floor((Date.now() - new Date(c.startDate).getTime()) / 86400000);
    const daysLogged = c.contributions.length;
    const totalSaved = c.contributions.reduce((s, v) => s + v, 0);
    const pct = Math.round((daysLogged / c.targetDays) * 100);
    const expectedByNow = Math.min(daysElapsed + 1, c.targetDays) * c.dailyAmount;
    const onTrack = totalSaved >= expectedByNow * 0.8;
    return { daysElapsed, daysLogged, totalSaved, pct, onTrack, remaining: c.targetDays - daysLogged };
  };

  const handleStart = (tpl: ChallengeTemplate) => {
    const dailyAmt = customAmount ? parseInt(customAmount) : tpl.dailyAmount;
    startChallenge({
      name: tpl.name[lang],
      emoji: tpl.emoji,
      targetDays: tpl.targetDays,
      dailyAmount: dailyAmt,
      startDate: new Date().toISOString(),
    });
    setShowStart(null);
    setCustomAmount('');
    toast.success(lang === 'sw' ? `🔥 Changamoto imeanza!` : `🔥 Challenge started!`);
  };

  const handleLogDay = (id: string) => {
    const amount = parseFloat(logAmount);
    if (!amount || amount <= 0) return;
    logChallengeDay(id, amount);
    setLogTarget(null);
    setLogAmount('');
    toast.success(lang === 'sw' ? `✅ Siku imerekodiwa! +${fmtFull(amount)}` : `✅ Day logged! +${fmtFull(amount)}`);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-gray-900">
              {lang === 'sw' ? 'Changamoto za Akiba' : 'Savings Challenges'}
            </h3>
          </div>
          {completedChallenges.length > 0 && (
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-full">
              🏆 {completedChallenges.length} {lang === 'sw' ? 'zilizokamilika' : 'completed'}
            </span>
          )}
        </div>

        {/* Active challenges */}
        {activeChallenges.map(c => {
          const { daysLogged, totalSaved, pct, onTrack, remaining } = getChallengeProgress(c);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden"
            >
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{c.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium ${onTrack ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {onTrack ? '✅ On track' : '⚠️ Behind'}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">
                        {remaining} {lang === 'sw' ? 'siku zimebaki' : 'days left'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { if (confirm(lang === 'sw' ? 'Acha changamoto?' : 'Abandon challenge?')) abandonChallenge(c.id); }}
                  className="p-1.5 text-gray-300 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="px-4 pb-2">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${onTrack ? 'bg-emerald-500' : 'bg-orange-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{daysLogged}/{c.targetDays} {lang === 'sw' ? 'siku' : 'days'}</span>
                  <span className="font-bold text-gray-700">{fmtFull(totalSaved)} {lang === 'sw' ? 'imeokolewa' : 'saved'}</span>
                </div>
              </div>

              {/* Log today's contribution */}
              {logTarget === c.id ? (
                <div className="px-4 pb-4 flex gap-2">
                  <div className="flex-1 flex items-center border-2 border-emerald-400 rounded-xl overflow-hidden">
                    <span className="px-2 text-xs text-gray-400">TSh</span>
                    <input
                      type="number"
                      placeholder={c.dailyAmount.toString()}
                      value={logAmount}
                      onChange={e => setLogAmount(e.target.value)}
                      className="flex-1 py-2 text-sm font-bold outline-none"
                      autoFocus
                    />
                  </div>
                  <button onClick={() => handleLogDay(c.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                    ✅
                  </button>
                  <button onClick={() => setLogTarget(null)} className="text-gray-400 px-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="px-4 pb-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setLogTarget(c.id); setLogAmount(c.dailyAmount.toString()); }}
                    className="w-full py-2.5 border-2 border-emerald-500 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'sw' ? `Rekodi Leo (+${fmt(c.dailyAmount)})` : `Log Today (+${fmt(c.dailyAmount)})`}
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Challenge templates */}
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.filter(tpl => !activeChallenges.some(c => c.name === tpl.name[lang])).map((tpl, i) => (
            <motion.button
              key={tpl.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowStart(tpl)}
              className="bg-white rounded-2xl shadow-md p-4 text-left hover:shadow-lg transition"
            >
              <div className="text-2xl mb-2">{tpl.emoji}</div>
              <p className="text-xs font-bold text-gray-900 mb-1">{tpl.name[lang]}</p>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">{tpl.desc[lang]}</p>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-300" />
                <span className="text-xs text-gray-400">{tpl.communityPct}% {lang === 'sw' ? 'wamefanikiwa' : 'succeed'}</span>
              </div>
              <div className={`mt-2 py-1.5 rounded-lg text-xs font-bold text-center bg-gradient-to-r ${tpl.gradientFrom} ${tpl.gradientTo} text-white`}>
                {lang === 'sw' ? 'Anza' : 'Start'} →
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start challenge sheet */}
      <AnimatePresence>
        {showStart && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowStart(null)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 pb-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              <div className={`bg-gradient-to-r ${showStart.gradientFrom} ${showStart.gradientTo} text-white rounded-2xl p-5 mb-5`}>
                <div className="text-4xl mb-2">{showStart.emoji}</div>
                <h2 className="text-xl font-black mb-1">{showStart.name[lang]}</h2>
                <p className="text-sm text-white/80">{showStart.desc[lang]}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {showStart.targetDays} {lang === 'sw' ? 'siku' : 'days'} ·{' '}
                    {lang === 'sw' ? 'Lengo:' : 'Goal:'} {fmtFull(showStart.targetDays * showStart.dailyAmount)}
                  </span>
                </div>
              </div>

              {/* Community stat */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-4">
                <Users className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-600">
                  <span className="font-bold text-gray-800">{showStart.communityPct}%</span>{' '}
                  {lang === 'sw'
                    ? 'ya watumiaji wa PesaPlan wanaofanya changamoto hii wanafanikiwa.'
                    : 'of PesaPlan users taking this challenge succeed.'}
                </p>
              </div>

              {/* Custom daily amount */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                  {lang === 'sw' ? 'Kiasi cha kila siku (TSh) — hiari' : 'Daily amount (TSh) — optional'}
                </label>
                <input
                  type="number"
                  placeholder={showStart.dailyAmount.toString()}
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'sw' ? `Kiasi cha chaguo msingi: ${fmtFull(showStart.dailyAmount)}/siku` : `Default: ${fmtFull(showStart.dailyAmount)}/day`}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStart(null)}
                  className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold text-sm"
                >
                  {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleStart(showStart)}
                  className={`flex-1 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r ${showStart.gradientFrom} ${showStart.gradientTo}`}
                >
                  <Play className="w-4 h-4" />
                  {lang === 'sw' ? 'Anza Sasa!' : 'Start Now!'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}