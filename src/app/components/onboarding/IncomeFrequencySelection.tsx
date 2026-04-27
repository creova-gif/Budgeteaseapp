import { motion } from 'motion/react';
import { useApp, type IncomeFrequency } from '@/app/App';
import { t } from '@/app/utils/translations'

interface IncomeFrequencySelectionProps {
  onComplete: () => void;
}

type FreqConfig = {
  freq: IncomeFrequency;
  emoji: string;
  gradient: string;
  glow: string;
  descEn: string;
  descSw: string;
  exampleEn: string;
  exampleSw: string;
};

const frequencies: FreqConfig[] = [
  {
    freq: 'daily',
    emoji: '☀️',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    glow: 'shadow-orange-400/40',
    descEn: 'Daily income',
    descSw: 'Mapato ya kila siku',
    exampleEn: 'Market traders · hawkers',
    exampleSw: 'Wachuuzi · mafundi',
  },
  {
    freq: 'weekly',
    emoji: '📅',
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    glow: 'shadow-indigo-400/40',
    descEn: 'Weekly income',
    descSw: 'Mapato ya kila wiki',
    exampleEn: 'Casual workers · drivers',
    exampleSw: 'Wafanyakazi wa muda · madereva',
  },
  {
    freq: 'monthly',
    emoji: '💼',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glow: 'shadow-emerald-400/40',
    descEn: 'Monthly income',
    descSw: 'Mapato ya kila mwezi',
    exampleEn: 'Employed · salaried',
    exampleSw: 'Wafanyakazi wa kudumu',
  },
  {
    freq: 'irregular',
    emoji: '🔀',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    glow: 'shadow-pink-400/40',
    descEn: 'Irregular (mix)',
    descSw: 'Mchanganyiko',
    exampleEn: 'Freelancers · farmers',
    exampleSw: 'Wakulima · kazi za muda',
  },
];

export function IncomeFrequencySelection({ onComplete }: IncomeFrequencySelectionProps) {
  const { state, setIncomeFrequency } = useApp();
  const lang = state.language;

  const handleSelect = (freq: IncomeFrequency) => {
    setIncomeFrequency(freq);
    setTimeout(onComplete, 320);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-5 pt-14 pb-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8 text-center"
      >
        <h2 className="text-gray-900 font-black mb-1.5" style={{ fontSize: '1.5rem' }}>
          {t('incomeQuestion', lang)}
        </h2>
        <p className="text-gray-400 text-sm">
          {t('cashflowHelper', lang)}
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
        {frequencies.map(({ freq, emoji, gradient, glow, descEn, descSw, exampleEn, exampleSw }, i) => {
          const isSelected = state.incomeFrequency === freq;
          return (
            <motion.button
              key={freq}
              onClick={() => handleSelect(freq)}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.09, type: 'spring', stiffness: 280, damping: 24 }}
              whileTap={{ scale: 0.97 }}
              className={`relative overflow-hidden rounded-3xl text-left transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-br ${gradient} shadow-2xl ${glow}`
                  : 'bg-gray-950 shadow-lg'
              }`}
              style={{ minHeight: 92 }}
              aria-pressed={isSelected}
              aria-label={lang === 'sw' ? descSw : descEn}
            >
              {/* Glow blob */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.3, scale: 1.5 }}
                  className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-xl pointer-events-none"
                />
              )}

              {/* Grid texture */}
              {!isSelected && (
                <div
                  className="absolute inset-0 opacity-[0.035] pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px)',
                  }}
                />
              )}

              <div className="relative flex items-center gap-4 px-5 py-5">
                {/* Emoji tile */}
                <motion.div
                  animate={isSelected ? { scale: 1.12, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20' : 'bg-white/[0.06]'
                  }`}
                  style={{ fontSize: '1.75rem' }}
                >
                  {emoji}
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {/* Selected badge */}
                  <motion.div
                    initial={false}
                    animate={isSelected ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="mb-0.5"
                  >
                    <span className="bg-white/25 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                      ✓ {t('selected', lang)}
                    </span>
                  </motion.div>

                  <p className="text-white font-black text-base leading-tight">
                    {lang === 'sw' ? descSw : descEn}
                  </p>
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/65' : 'text-gray-500'}`}>
                    {lang === 'sw' ? exampleSw : exampleEn}
                  </p>
                </div>
              </div>

              {/* Bottom shimmer */}
              {isSelected && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.38, ease: 'easeOut' }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/35 origin-left"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
