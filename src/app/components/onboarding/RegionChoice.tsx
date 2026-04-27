import { motion } from 'motion/react';
import { useApp } from '@/app/App';
import { REGION_CONFIG, type Region } from '@/app/utils/currency';

interface RegionChoiceProps {
  onComplete: () => void;
}

const REGIONS: { code: Region; gradient: string; glow: string }[] = [
  { code: 'TZ', gradient: 'from-emerald-500 to-teal-600',   glow: 'shadow-emerald-400/40' },
  { code: 'KE', gradient: 'from-red-500 to-rose-600',        glow: 'shadow-red-400/40'     },
  { code: 'UG', gradient: 'from-yellow-500 to-amber-600',    glow: 'shadow-yellow-400/40'  },
  { code: 'RW', gradient: 'from-blue-500 to-indigo-600',     glow: 'shadow-blue-400/40'    },
  { code: 'BI', gradient: 'from-green-500 to-emerald-700',   glow: 'shadow-green-400/40'   },
];

export function RegionChoice({ onComplete }: RegionChoiceProps) {
  const { state, setRegion } = useApp();
  const lang = state.language;

  const handleSelect = (code: Region) => {
    setRegion(code);
    setTimeout(onComplete, 300);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
          {lang === 'sw' ? 'Uko wapi?' : 'Where are you?'}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
          {lang === 'sw' ? 'Tutapanga sarafu na malengo kwa nchi yako' : 'We\'ll set the right currency and goal amounts for your country'}
        </p>

        <div className="flex flex-col gap-3">
          {REGIONS.map(({ code, gradient, glow }, i) => {
            const cfg = REGION_CONFIG[code];
            const isSelected = state.region === code;
            return (
              <motion.button
                key={code}
                onClick={() => handleSelect(code)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
                whileTap={{ scale: 0.97 }}
                className={`relative w-full overflow-hidden rounded-3xl text-left transition-all duration-300 ${
                  isSelected
                    ? `bg-gradient-to-br ${gradient} shadow-2xl ${glow}`
                    : 'bg-gray-950 shadow-lg'
                }`}
                style={{ minHeight: 76 }}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 0.3, scale: 1.4 }}
                    className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white blur-2xl pointer-events-none"
                  />
                )}
                {!isSelected && (
                  <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px)',
                    }}
                  />
                )}
                <div className="relative flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{cfg.flag}</span>
                    <div>
                      <p className="text-white font-black text-base leading-tight">
                        {lang === 'sw' ? cfg.nameSw : cfg.nameEn}
                      </p>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                        {cfg.currency} · {cfg.symbol}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="bg-white/25 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shrink-0">
                      ✓
                    </span>
                  )}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.35 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 origin-left"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {lang === 'sw' ? 'Unaweza kubadilisha baadaye katika Mipangilio' : 'You can change this later in Settings'}
        </p>
      </motion.div>
    </div>
  );
}
