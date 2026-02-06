import { motion } from 'motion/react';
import { Wallet, Smartphone, Zap } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';

interface SplashScreensProps {
  onComplete: () => void;
}

export function SplashScreens({ onComplete }: SplashScreensProps) {
  const { state } = useApp();
  const lang = state.language;

  return (
    <div className="h-screen bg-gradient-to-b from-emerald-600 to-emerald-800 flex items-center justify-center">
      <motion.div
        className="text-center px-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="mb-6 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="bg-white rounded-full p-6 shadow-2xl">
            <Wallet className="w-16 h-16 text-emerald-600" />
          </div>
        </motion.div>

        {/* App Name */}
        <motion.h1
          className="text-4xl font-bold mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          BudgetEase
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl mb-8 opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t('tagline', lang)}
        </motion.p>

        {/* Features */}
        <motion.div
          className="space-y-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-3">
            <Smartphone className="w-6 h-6" />
            <p>{t('dailyFinances', lang)}</p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Zap className="w-6 h-6" />
            <p>{t('fastSetup', lang)}</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={onComplete}
          className="bg-white text-emerald-700 px-12 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('continue', lang)}
        </motion.button>
      </motion.div>
    </div>
  );
}