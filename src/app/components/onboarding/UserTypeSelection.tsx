import { motion } from 'motion/react';
import { useApp, type UserType } from '@/app/App';
import { t } from '@/app/utils/translations';

interface UserTypeSelectionProps {
  onComplete: () => void;
}

type UserTypeConfig = {
  type: UserType;
  emoji: string;
  gradient: string;
  glow: string;
  subEn: string;
  subSw: string;
};

const userTypes: UserTypeConfig[] = [
  {
    type: 'student',
    emoji: '🎓',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'shadow-purple-400/40',
    subEn: 'Stipends & school fees',
    subSw: 'Posho na ada za shule',
  },
  {
    type: 'biashara',
    emoji: '🏪',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glow: 'shadow-amber-400/40',
    subEn: 'Business cash flow',
    subSw: 'Mzunguko wa pesa biashara',
  },
  {
    type: 'informal',
    emoji: '🔧',
    gradient: 'from-blue-500 via-sky-500 to-cyan-500',
    glow: 'shadow-sky-400/40',
    subEn: 'Daily wages & gigs',
    subSw: 'Mishahara ya kila siku',
  },
  {
    type: 'family',
    emoji: '🏠',
    gradient: 'from-emerald-500 via-teal-500 to-green-500',
    glow: 'shadow-emerald-400/40',
    subEn: 'Household budget',
    subSw: 'Bajeti ya familia',
  },
  {
    type: 'other',
    emoji: '✨',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    glow: 'shadow-pink-400/40',
    subEn: 'Custom tracking',
    subSw: 'Ufuatiliaji maalum',
  },
];

export function UserTypeSelection({ onComplete }: UserTypeSelectionProps) {
  const { state, setUserType } = useApp();
  const lang = state.language;

  const handleSelect = (type: UserType) => {
    setUserType(type);
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
          {t('welcomeQuestion', lang)}
        </h2>
        <p className="text-gray-400 text-sm">
          {lang === 'sw' ? 'Tunaboresha uzoefu wako' : 'We personalise your experience'}
        </p>
      </motion.div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
        {userTypes.map(({ type, emoji, gradient, glow, subEn, subSw }, i) => {
          const isSelected = state.userType === type;
          const isLastOdd = userTypes.length % 2 !== 0 && i === userTypes.length - 1;

          return (
            <motion.button
              key={type}
              onClick={() => handleSelect(type)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
              whileTap={{ scale: 0.96 }}
              className={`relative overflow-hidden rounded-3xl text-left transition-all duration-300 ${
                isLastOdd ? 'col-span-2' : ''
              } ${
                isSelected
                  ? `bg-gradient-to-br ${gradient} shadow-2xl ${glow}`
                  : 'bg-gray-950 shadow-lg'
              }`}
              style={{ minHeight: isLastOdd ? 90 : 130 }}
              aria-pressed={isSelected}
              aria-label={t(type === 'biashara' ? 'biashara' : type === 'informal' ? 'informal' : type === 'family' ? 'family' : type === 'student' ? 'student' : 'other', lang)}
            >
              {/* Glow blob on selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.3, scale: 1.5 }}
                  className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full blur-xl pointer-events-none"
                />
              )}

              {/* Grid texture on unselected */}
              {!isSelected && (
                <div
                  className="absolute inset-0 opacity-[0.035] pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px)',
                  }}
                />
              )}

              <div className={`relative flex ${isLastOdd ? 'flex-row items-center gap-4 px-5 py-5' : 'flex-col justify-between p-4 h-full'}`}>

                {/* Emoji */}
                <motion.div
                  animate={isSelected ? { scale: 1.12, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className={`flex items-center justify-center rounded-xl ${
                    isLastOdd ? 'w-12 h-12 shrink-0' : 'w-12 h-12 mb-auto'
                  } ${isSelected ? 'bg-white/20' : 'bg-white/[0.06]'}`}
                  style={{ fontSize: '1.625rem' }}
                >
                  {emoji}
                </motion.div>

                {/* Text */}
                <div className={isLastOdd ? 'flex-1' : 'mt-3'}>
                  {/* Selected pill */}
                  <motion.div
                    initial={false}
                    animate={isSelected ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="mb-0.5"
                  >
                    <span className="bg-white/25 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                      ✓
                    </span>
                  </motion.div>

                  <p className="text-white font-black text-sm leading-tight">
                    {t(type === 'biashara' ? 'biashara' : type === 'informal' ? 'informal' : type === 'family' ? 'family' : type === 'student' ? 'student' : 'other', lang)}
                  </p>
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/65' : 'text-gray-500'}`}>
                    {lang === 'sw' ? subSw : subEn}
                  </p>
                </div>
              </div>

              {/* Bottom line */}
              {isSelected && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
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
