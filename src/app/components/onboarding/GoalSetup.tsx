import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { REGION_CONFIG } from '@/app/utils/currency';

interface GoalSetupProps {
  onComplete: () => void;
}

type GoalOption = {
  id: string;
  emoji: string;
  gradient: string;
  glow: string;
  labelKey: 'schoolFees' | 'bills' | 'emergencyFund' | 'data' | 'travel' | 'custom';
  descEn: string;
  descSw: string;
  defaultAmount: number;
};

const goalOptions: GoalOption[] = [
  {
    id: 'schoolFees',
    emoji: '🎓',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-purple-400/40',
    labelKey: 'schoolFees',
    descEn: 'Education fund',
    descSw: 'Akiba ya elimu',
    defaultAmount: 500000,
  },
  {
    id: 'bills',
    emoji: '💡',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-orange-400/40',
    labelKey: 'bills',
    descEn: 'Utilities & rent',
    descSw: 'Bili na kodi',
    defaultAmount: 200000,
  },
  {
    id: 'emergencyFund',
    emoji: '🛡️',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-400/40',
    labelKey: 'emergencyFund',
    descEn: '3-month buffer',
    descSw: 'Akiba ya dharura',
    defaultAmount: 300000,
  },
  {
    id: 'data',
    emoji: '📱',
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-400/40',
    labelKey: 'data',
    descEn: 'Data & airtime',
    descSw: 'Data na muda wa simu',
    defaultAmount: 50000,
  },
  {
    id: 'travel',
    emoji: '✈️',
    gradient: 'from-cyan-500 to-sky-600',
    glow: 'shadow-sky-400/40',
    labelKey: 'travel',
    descEn: 'Trip savings',
    descSw: 'Akiba ya safari',
    defaultAmount: 1000000,
  },
  {
    id: 'custom',
    emoji: '⭐',
    gradient: 'from-rose-500 to-pink-600',
    glow: 'shadow-pink-400/40',
    labelKey: 'custom',
    descEn: 'Set your own',
    descSw: 'Weka lengo lako',
    defaultAmount: 0,
  },
];

// Region-specific defaults keyed to goalOption.id
const GOAL_DEFAULTS_BY_REGION: Record<string, keyof typeof REGION_CONFIG['TZ']['goalDefaults']> = {
  schoolFees: 'schoolFees',
  bills: 'bills',
  emergencyFund: 'emergencyFund',
  data: 'data',
  travel: 'travel',
};

export function GoalSetup({ onComplete }: GoalSetupProps) {
  const { state, setFirstGoal } = useApp();
  const lang = state.language;
  const regionCfg = REGION_CONFIG[state.region];

  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [amountError, setAmountError] = useState('');

  const getRegionDefault = (goalId: string): number => {
    const key = GOAL_DEFAULTS_BY_REGION[goalId];
    return key ? regionCfg.goalDefaults[key] : 0;
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    if (goalId !== 'custom') {
      setTargetAmount(getRegionDefault(goalId).toString());
      setShowCustomInput(false);
    } else {
      setTargetAmount('');
      setShowCustomInput(true);
    }
    setAmountError('');
  };

  const handleContinue = () => {
    const amount = parseInt(targetAmount);
    if (!selectedGoal || !targetAmount || isNaN(amount) || amount < 100) {
      setAmountError(lang === 'sw'
        ? `Ingiza kiasi sahihi (angalau ${regionCfg.symbol} 100)`
        : `Enter a valid amount (min ${regionCfg.symbol} 100)`);
      return;
    }
    if (amount > 999_999_999) {
      setAmountError(lang === 'sw' ? 'Kiasi ni kikubwa sana' : 'Amount too large');
      return;
    }

    const goalTitle = showCustomInput
      ? customGoal || t('custom', lang)
      : t(goalOptions.find(g => g.id === selectedGoal)!.labelKey, lang);

    setFirstGoal({ id: '1', title: goalTitle, target: amount, current: 0, completed: false });
    setTimeout(onComplete, 300);
  };

  const selected = goalOptions.find(g => g.id === selectedGoal);
  const fmt = (n: number) => `${regionCfg.symbol} ${n.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-white flex flex-col px-5 pt-14 pb-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-5 text-center"
      >
        <h2 className="text-gray-900 font-black mb-1.5" style={{ fontSize: '1.5rem' }}>
          {t('goalQuestion', lang)}
        </h2>
        <p className="text-gray-400 text-sm">
          {t('pickFirstGoal', lang)}
        </p>
      </motion.div>

      {/* Privacy notice */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2.5 bg-gray-950 border border-white/[0.06] rounded-2xl px-4 py-3 mb-5 max-w-md mx-auto w-full"
      >
        <span className="text-lg shrink-0">🔒</span>
        <p className="text-gray-400 text-xs leading-snug">
          {lang === 'sw'
            ? 'Data yako imehifadhiwa kwenye kifaa chako peke yake. Hakuna matangazo.'
            : 'Your data stays on your device only. No ads ever.'}
        </p>
      </motion.div>

      {/* Goal grid */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full mb-5">
        {goalOptions.map(({ id, emoji, gradient, glow, labelKey, descEn, descSw }, i) => {
          const isSelected = selectedGoal === id;
          return (
            <motion.button
              key={id}
              onClick={() => handleGoalSelect(id)}
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
              whileTap={{ scale: 0.95 }}
              className={`relative overflow-hidden rounded-3xl text-left transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-br ${gradient} shadow-2xl ${glow}`
                  : 'bg-gray-950 shadow-md'
              }`}
              style={{ minHeight: 110 }}
              aria-pressed={isSelected}
              aria-label={t(labelKey, lang)}
            >
              {/* Glow blob */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.28, scale: 1.5 }}
                  className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full blur-xl pointer-events-none"
                />
              )}
              {!isSelected && (
                <div
                  className="absolute inset-0 opacity-[0.035] pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 24px)',
                  }}
                />
              )}

              <div className="relative flex flex-col p-4 h-full">
                <motion.div
                  animate={isSelected ? { scale: 1.1, rotate: 6 } : { scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-auto ${
                    isSelected ? 'bg-white/20' : 'bg-white/[0.06]'
                  }`}
                  style={{ fontSize: '1.375rem' }}
                >
                  {emoji}
                </motion.div>

                <div className="mt-3">
                  <p className="text-white font-black text-sm leading-tight">
                    {t(labelKey, lang)}
                  </p>
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/65' : 'text-gray-500'}`}>
                    {lang === 'sw' ? descSw : descEn}
                  </p>
                </div>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.35 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/35 origin-left"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Amount & custom name inputs */}
      <AnimatePresence>
        {selectedGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-md mx-auto w-full space-y-3 overflow-hidden"
          >
            {showCustomInput && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  {t('goalName', lang)}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'sw' ? 'k.m. Gari mpya' : 'e.g. New car'}
                  value={customGoal}
                  onChange={e => setCustomGoal(e.target.value)}
                  className="w-full bg-gray-950 border border-white/[0.08] text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-emerald-500/60 placeholder:text-gray-600"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('targetAmount', lang)} ({regionCfg.currency})
                </label>
                {selected && selected.id !== 'custom' && getRegionDefault(selected.id) > 0 && (
                  <span className="text-xs text-emerald-600 font-medium">
                    {t('suggested', lang)}: {fmt(getRegionDefault(selected.id))}
                  </span>
                )}
              </div>
              <input
                type="number"
                inputMode="numeric"
                placeholder="100,000"
                value={targetAmount}
                onChange={e => {
                  setTargetAmount(e.target.value);
                  setAmountError('');
                }}
                className="w-full bg-gray-950 border border-white/[0.08] text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-emerald-500/60 placeholder:text-gray-600"
                aria-label={t('targetAmount', lang)}
              />
              {amountError && (
                <p className="text-red-500 text-xs mt-1.5">{amountError}</p>
              )}
            </div>

            <motion.button
              onClick={handleContinue}
              whileTap={{ scale: 0.97 }}
              disabled={!targetAmount || (showCustomInput && !customGoal)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-3xl py-4 font-black shadow-xl shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              aria-label={t('continue', lang)}
            >
              {t('continue', lang)} →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
