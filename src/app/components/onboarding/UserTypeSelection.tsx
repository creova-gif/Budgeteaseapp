import { motion } from 'motion/react';
import { GraduationCap, Store, Briefcase, Users, MoreHorizontal } from 'lucide-react';
import { useApp, type UserType } from '@/app/App';
import { t } from '@/app/utils/translations';

interface UserTypeSelectionProps {
  onComplete: () => void;
}

export function UserTypeSelection({ onComplete }: UserTypeSelectionProps) {
  const { state, setUserType } = useApp();
  const lang = state.language;

  const userTypes: { type: UserType; icon: typeof GraduationCap; labelKey: keyof typeof import('@/app/utils/translations').translations }[] = [
    { type: 'student', icon: GraduationCap, labelKey: 'student' },
    { type: 'biashara', icon: Store, labelKey: 'biashara' },
    { type: 'informal', icon: Briefcase, labelKey: 'informal' },
    { type: 'family', icon: Users, labelKey: 'family' },
    { type: 'other', icon: MoreHorizontal, labelKey: 'other' },
  ];

  const handleSelect = (type: UserType) => {
    setUserType(type);
    setTimeout(onComplete, 300);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-12 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">
          {t('welcomeQuestion', lang)}
        </h2>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {userTypes.map(({ type, icon: Icon, labelKey }, index) => (
            <motion.button
              key={type}
              onClick={() => handleSelect(type)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="bg-emerald-100 p-4 rounded-full mb-3">
                <Icon className="w-8 h-8 text-emerald-700" />
              </div>
              <p className="text-sm font-medium text-center text-gray-800">
                {t(labelKey, lang)}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}