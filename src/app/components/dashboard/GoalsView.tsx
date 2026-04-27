import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Target, Plus, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { toast } from 'sonner';
import { formatCurrency as fmtCurrency, REGION_CONFIG } from '@/app/utils/currency';

interface GoalsViewProps {
  onBack: () => void;
}

const QUICK_TARGETS = [50000, 100000, 200000, 500000, 1000000];

export function GoalsView({ onBack }: GoalsViewProps) {
  const { state, addGoal, updateGoal } = useApp();
  const lang = state.language;

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDeadlineDays, setNewGoalDeadlineDays] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedGoal, setCelebratedGoal] = useState('');

  const fmt = (n: number) => fmtCurrency(n, state.region);
  const fmtShort = fmt;
  const symbol = REGION_CONFIG[state.region].symbol;

  const handleAddGoal = () => {
    if (!newGoalTitle || !newGoalTarget) return;
    const days = parseInt(newGoalDeadlineDays);
    const deadline = days > 0
      ? new Date(Date.now() + days * 86400000).toISOString()
      : undefined;

    addGoal({
      title: newGoalTitle,
      target: parseInt(newGoalTarget),
      current: 0,
      daysLeft: days > 0 ? days : undefined,
      deadline,
    });

    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalDeadlineDays('');
    setShowAddGoal(false);
    toast.success(t('goalAdded', lang));
  };

  const handleContribute = () => {
    if (!contributionAmount || !showContribute) return;
    const goal = state.goals.find(g => g.id === showContribute);
    if (!goal) return;

    updateGoal(showContribute, parseInt(contributionAmount));
    const newCurrent = goal.current + parseInt(contributionAmount);
    if (newCurrent >= goal.target) {
      setCelebratedGoal(goal.title);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3500);
    }

    setContributionAmount('');
    setShowContribute(null);
    toast.success(t('contributionAdded', lang));
  };

  const getDailyRequired = (goal: typeof state.goals[0]) => {
    if (!goal.deadline) return null;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);
    if (daysLeft <= 0) return null;
    return Math.ceil((goal.target - goal.current) / daysLeft);
  };

  const getDaysLeft = (goal: typeof state.goals[0]) => {
    if (!goal.deadline) return null;
    return Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000));
  };

  const QUICK_CONTRIB = [5000, 10000, 20000, 50000];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 pb-8 min-safe-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">{t('goals', lang)}</h1>
          </div>
          <span className="text-white/70 text-sm">
            {state.goals.filter(g => !g.completed).length} {t('active', lang)}
          </span>
        </div>
        {/* Summary */}
        {state.goals.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t('goals', lang), value: state.goals.length },
              { label: t('done', lang), value: state.goals.filter(g => g.completed).length },
              {
                label: t('savedLabel', lang),
                value: fmtShort(state.goals.reduce((s, g) => s + g.current, 0)),
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-xl px-3 py-2 text-center">
                <p className="text-xs text-white/70">{label}</p>
                <p className="text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-4">
        {state.goals.map((goal, index) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const dailyRequired = getDailyRequired(goal);
          const daysLeft = getDaysLeft(goal);
          const isUrgent = daysLeft !== null && daysLeft <= 7 && !goal.completed;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-white rounded-2xl shadow-md overflow-hidden ${
                goal.completed ? 'opacity-75' : ''
              }`}
            >
              {/* Goal header */}
              <div className={`px-4 pt-4 pb-2 flex items-start justify-between ${
                isUrgent ? 'bg-orange-50' : ''
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    goal.completed ? 'bg-emerald-100' : 'bg-purple-100'
                  }`}>
                    {goal.completed ? <span className="text-xl">🎉</span> : <Target className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{goal.title}</h3>
                    <p className="text-xs text-gray-500">{fmt(goal.current)} / {fmt(goal.target)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${
                    progress >= 100 ? 'text-emerald-600' : 'text-purple-700'
                  }`}>
                    {progress.toFixed(0)}%
                  </p>
                  {isUrgent && <p className="text-xs text-orange-600 font-medium">⚡ {daysLeft}d left</p>}
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-4 pb-1">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${goal.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-purple-600'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Timeline & daily saving */}
              <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
                {daysLeft !== null && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {lang === 'sw' ? `Siku ${daysLeft} zimebaki` : `${daysLeft} days left`}
                    </span>
                  </div>
                )}
                {dailyRequired !== null && dailyRequired > 0 && !goal.completed && (
                  <div className="flex items-center gap-1 text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>{lang === 'sw' ? `${fmtShort(dailyRequired)}/siku` : `${fmtShort(dailyRequired)}/day needed`}</span>
                  </div>
                )}
                {goal.completed && (
                  <span className="text-xs text-emerald-600 font-semibold">✅ {t('completed', lang)}</span>
                )}
              </div>

              {!goal.completed && (
                <div className="px-4 pb-4 flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowContribute(goal.id)}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition"
                  >
                    + {t('contributeNow', lang)}
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Add Goal CTA */}
        <motion.button
          onClick={() => setShowAddGoal(true)}
          whileTap={{ scale: 0.98 }}
          className="w-full border-2 border-dashed border-purple-300 rounded-2xl p-8 flex flex-col items-center hover:border-purple-500 hover:bg-purple-50 transition"
        >
          <Plus className="w-8 h-8 text-purple-400 mb-2" />
          <p className="text-gray-600 font-semibold">{t('addGoal', lang)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {t('setGoalDeadline', lang)}
          </p>
        </motion.button>
      </div>

      {/* ── Add Goal Sheet ── */}
      <AnimatePresence>
        {showAddGoal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowAddGoal(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 pb-8 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-4 text-gray-900">
                🎯 {t('addGoal', lang)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                    {t('goalName', lang)}
                  </label>
                  <input
                    placeholder={lang === 'sw' ? 'Mf: Simu mpya, Ada ya shule...' : 'e.g. New phone, School fees...'}
                    value={newGoalTitle}
                    onChange={e => setNewGoalTitle(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                    {t('targetAmountLabel', lang)}
                  </label>
                  <input
                    type="number"
                    placeholder="200,000"
                    value={newGoalTarget}
                    onChange={e => setNewGoalTarget(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-purple-500 transition"
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {QUICK_TARGETS.map(amt => (
                      <button
                        key={amt}
                        onClick={() => setNewGoalTarget(amt.toString())}
                        className={`px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition ${
                          newGoalTarget === amt.toString()
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature 15: Deadline */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {t('deadlineDaysOptional', lang)}
                  </label>
                  <input
                    type="number"
                    placeholder={lang === 'sw' ? 'Mf: 90 (siku 90)' : 'e.g. 90 (days from now)'}
                    value={newGoalDeadlineDays}
                    onChange={e => setNewGoalDeadlineDays(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition"
                  />
                  {/* Show daily saving required preview */}
                  {newGoalTarget && newGoalDeadlineDays && parseInt(newGoalDeadlineDays) > 0 && (() => {
                    const daily = Math.ceil(parseInt(newGoalTarget) / parseInt(newGoalDeadlineDays));
                    return (
                      <div className="mt-2 bg-purple-50 rounded-xl px-3 py-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600 shrink-0" />
                        <p className="text-xs text-purple-800 font-medium">
                          {lang === 'sw'
                            ? `Unahitaji kuokoa ${fmt(daily)} kwa siku`
                            : `You need to save ${fmt(daily)} per day`}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddGoal(false)}
                    className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold text-sm"
                  >
                    {t('cancel', lang)}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddGoal}
                    disabled={!newGoalTitle || !newGoalTarget}
                    className="flex-1 py-3.5 bg-purple-600 text-white rounded-2xl font-bold text-sm disabled:opacity-40"
                  >
                    {t('save', lang)}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Contribute Sheet ── */}
      <AnimatePresence>
        {showContribute && (() => {
          const goal = state.goals.find(g => g.id === showContribute);
          if (!goal) return null;
          const remaining = goal.target - goal.current;
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50"
                onClick={() => setShowContribute(null)}
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 pb-8"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                  + {t('contributeNow', lang)}
                </h2>
                <p className="text-xs text-gray-500 mb-1">{goal.title}</p>
                <p className="text-xs text-purple-600 font-medium mb-4">
                  {t('goalRemaining', lang)}: {fmt(remaining)}
                </p>

                <div className="flex items-center border-2 border-purple-500 rounded-2xl mb-4 overflow-hidden">
                  <span className="px-3 text-sm text-gray-400">{symbol}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={contributionAmount}
                    onChange={e => setContributionAmount(e.target.value)}
                    className="flex-1 py-3 text-2xl font-black text-gray-900 outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2 mb-5">
                  {QUICK_CONTRIB.map(a => (
                    <button
                      key={a}
                      onClick={() => setContributionAmount(a.toString())}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition ${
                        contributionAmount === a.toString()
                          ? 'border-purple-600 bg-purple-50 text-purple-800'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {a >= 1000 ? `${a / 1000}k` : a}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowContribute(null)}
                    className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold text-sm"
                  >
                    {t('cancel', lang)}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleContribute}
                    disabled={!contributionAmount || parseInt(contributionAmount) <= 0}
                    className="flex-1 py-3.5 bg-purple-600 text-white rounded-2xl font-bold text-sm disabled:opacity-40"
                  >
                    {t('contributeNow', lang)}
                  </motion.button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ── Celebration overlay ── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-8"
            onClick={() => setShowCelebration(false)}
          >
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                {t('congratulations', lang)}
              </h2>
              <p className="text-sm text-gray-600">
                {lang === 'sw'
                  ? `Umefika lengo lako la "${celebratedGoal}"!`
                  : `You've reached your goal "${celebratedGoal}"!`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}