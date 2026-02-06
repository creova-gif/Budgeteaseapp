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

        <div className="space-y-4">
          {/* Swahili Button */}
          <motion.button
            onClick={() => handleLanguageSelect('sw')}
            className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
              state.language === 'sw'
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-emerald-300'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-4xl">🇹🇿</span>
              <div className="text-left">
                <p className="font-semibold text-lg">Kiswahili</p>
                <p className="text-sm text-gray-500">Default</p>
              </div>
            </div>
            {state.language === 'sw' && (
              <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </motion.button>

          {/* English Button */}
          <motion.button
            onClick={() => handleLanguageSelect('en')}
            className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
              state.language === 'en'
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-emerald-300'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-4xl">🇬🇧</span>
              <div className="text-left">
                <p className="font-semibold text-lg">English</p>
              </div>
            </div>
            {state.language === 'en' && (
              <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </motion.button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('changeLater', lang)}
        </p>
      </motion.div>
    </div>
  );
}