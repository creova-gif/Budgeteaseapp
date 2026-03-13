import { motion } from 'motion/react';
import { useApp, type Language } from '@/app/App';
import { t } from '@/app/utils/translations';

interface LanguageChoiceProps {
  onComplete: () => void;
}

export function LanguageChoice({ onComplete }: LanguageChoiceProps) {
  const { state, setLanguage } = useApp();
  const lang = state.language;

  const handleLanguageSelect = (selectedLang: Language) => {
    setLanguage(selectedLang);
    setTimeout(onComplete, 300);
  };

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
          {t('chooseLanguage', lang)}
        </h2>

        <div className="flex flex-col gap-4">
          {([
            {
              code: 'sw' as Language,
              name: 'Kiswahili',
              sub: 'Lugha ya kwanza · Tanzania',
              flag: '🇹🇿',
              gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
              glow: 'shadow-emerald-400/40',
            },
            {
              code: 'en' as Language,
              name: 'English',
              sub: 'International language',
              flag: '🇬🇧',
              gradient: 'from-blue-500 via-indigo-500 to-violet-500',
              glow: 'shadow-blue-400/40',
            },
          ]).map((lang, i) => {
            const isSelected = state.language === lang.code;
            return (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 280, damping: 22 }}
                whileTap={{ scale: 0.97 }}
                className={`relative w-full overflow-hidden rounded-3xl text-left transition-all duration-300 ${
                  isSelected
                    ? `bg-gradient-to-br ${lang.gradient} shadow-2xl ${lang.glow}`
                    : 'bg-gray-950 shadow-lg'
                }`}
                style={{ minHeight: 108 }}
                aria-pressed={isSelected}
                aria-label={`Select ${lang.name}`}
              >
                {/* Ambient glow blob */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 0.35, scale: 1.4 }}
                    className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white blur-2xl pointer-events-none"
                  />
                )}

                {/* Subtle grid texture on dark */}
                {!isSelected && (
                  <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px)',
                    }}
                  />
                )}

                <div className="relative flex items-center justify-between px-6 py-7">
                  {/* Left: text */}
                  <div className="flex flex-col gap-1">
                    {/* Active pill */}
                    <motion.div
                      initial={false}
                      animate={isSelected ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5 mb-1"
                    >
                      <span className="bg-white/25 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                        ✓ Selected
                      </span>
                    </motion.div>

                    <span className={`text-2xl font-black tracking-tight ${isSelected ? 'text-white' : 'text-white'}`}>
                      {lang.name}
                    </span>
                    <span className={`text-xs font-medium ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                      {lang.sub}
                    </span>
                  </div>

                  {/* Right: flag in floating circle */}
                  <motion.div
                    animate={isSelected ? { scale: 1.15, rotate: 4 } : { scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0 ${
                      isSelected ? 'bg-white/20 shadow-inner' : 'bg-white/5'
                    }`}
                  >
                    {lang.flag}
                  </motion.div>
                </div>

                {/* Bottom shimmer line */}
                {isSelected && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 origin-left"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('changeLater', lang)}
        </p>
      </motion.div>
    </div>
  );
}