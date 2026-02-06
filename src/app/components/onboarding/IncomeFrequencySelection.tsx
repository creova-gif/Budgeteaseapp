import { motion } from 'motion/react';
import { Calendar, CalendarDays, CalendarRange, Shuffle } from 'lucide-react';
import { useApp, type IncomeFrequency } from '@/app/App';
import { t } from '@/app/utils/translations';

interface IncomeFrequencySelectionProps {
  onComplete: () => void;
}

export function IncomeFrequencySelection({ onComplete }: IncomeFrequencySelectionProps) {
  const { state, setIncomeFrequency } = useApp();
  const lang = state.language;

  const frequencies: { freq: IncomeFrequency; icon: typeof Calendar; labelKey: keyof typeof import('@/app/utils/translations').translations }[] = [
    { freq: 'daily', icon: Calendar, labelKey: 'daily' },
    { freq: 'weekly', icon: CalendarDays, labelKey: 'weekly' },
    { freq: 'monthly', icon: CalendarRange, labelKey: 'monthly' },
    { freq: 'irregular', icon: Shuffle, labelKey: 'irregular' },
  ];

  const handleSelect = (freq: IncomeFrequency) => {
    setIncomeFrequency(freq);
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
          {t('incomeQuestion', lang)}
        </h2>

        <div className="space-y-4 max-w-md mx-auto">
          {frequencies.map(({ freq, icon: Icon, labelKey }, index) => (
            <motion.button
              key={freq}
              onClick={() => handleSelect(freq)}
              className="w-full flex items-center space-x-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-emerald-100 p-3 rounded-full">
                <Icon className="w-6 h-6 text-emerald-700" />
              </div>
              <p className="text-lg font-medium text-gray-800">
                {t(labelKey, lang)}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}