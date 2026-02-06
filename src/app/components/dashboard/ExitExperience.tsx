import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, TrendingUp, Target } from 'lucide-react';
import { useApp } from '@/app/App';

export function ExitExperience() {
  const { state, getTodayExpenses, shouldShowDailySummary } = useApp();
  const lang = state.language;
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && state.onboardingComplete) {
        // Generate personalized message
        const messages = getExitMessages();
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        setShow(true);

        // Auto-hide after 3 seconds
        setTimeout(() => setShow(false), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.onboardingComplete, lang]);

  const getExitMessages = () => {
    const todayExpenses = getTodayExpenses();
    const goalsCount = state.goals.length;
    const completedGoals = state.goals.filter(g => g.completed).length;

    if (lang === 'sw') {
      return [
        '💚 Unafanya vizuri kuliko jana. Tutaonana!',
        '✨ Kila siku ni hatua. Endelea!',
        '🎯 Malengo yako yanakungoja. Rudi hivi karibuni!',
        todayExpenses > 0 ? '📊 Umefuatilia vizuri leo!' : '👋 Asante! Hadi tukutane tena.',
        completedGoals > 0 ? '🎉 Umefanikisha malengo! Hongera!' : '💪 Unaendelea vizuri!',
        '🌟 Tunakupenda! Tutaonana kesho.',
      ];
    } else {
      return [
        "💚 You're doing better than yesterday. See you soon!",
        '✨ Every day is a step forward. Keep going!',
        '🎯 Your goals are waiting. Come back soon!',
        todayExpenses > 0 ? '📊 Great tracking today!' : '👋 Thank you! See you again.',
        completedGoals > 0 ? '🎉 Goals achieved! Congratulations!' : "💪 You're making progress!",
        '🌟 We appreciate you! See you tomorrow.',
      ];
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-6 right-6 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 animate-pulse" />
              <p className="flex-1 font-medium">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}