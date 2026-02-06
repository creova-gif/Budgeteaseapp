import { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Receipt, Shield, Smartphone, Plane, PlusCircle } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

interface GoalSetupProps {
  onComplete: () => void;
}

export function GoalSetup({ onComplete }: GoalSetupProps) {
  const { state, setFirstGoal } = useApp();
  const lang = state.language;
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const goalOptions = [
    { id: 'schoolFees', icon: GraduationCap, labelKey: 'schoolFees' as const, defaultAmount: 500000 },
    { id: 'bills', icon: Receipt, labelKey: 'bills' as const, defaultAmount: 200000 },
    { id: 'emergencyFund', icon: Shield, labelKey: 'emergencyFund' as const, defaultAmount: 300000 },
    { id: 'data', icon: Smartphone, labelKey: 'data' as const, defaultAmount: 50000 },
    { id: 'travel', icon: Plane, labelKey: 'travel' as const, defaultAmount: 1000000 },
    { id: 'custom', icon: PlusCircle, labelKey: 'custom' as const, defaultAmount: 0 },
  ];

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    const goal = goalOptions.find(g => g.id === goalId);
    if (goal && goalId !== 'custom') {
      setTargetAmount(goal.defaultAmount.toString());
      setShowCustomInput(false);
    } else {
      setShowCustomInput(true);
    }
  };

  const handleContinue = () => {
    if (!selectedGoal || !targetAmount) return;

    const goalTitle = showCustomInput 
      ? customGoal 
      : t(goalOptions.find(g => g.id === selectedGoal)!.labelKey, lang);

    setFirstGoal({
      id: '1',
      title: goalTitle,
      target: parseInt(targetAmount),
      current: 0,
      completed: false,
    });

    setTimeout(onComplete, 300);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-12 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
          {t('goalQuestion', lang)}
        </h2>

        {/* Data Privacy Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                {lang === 'sw' ? 'Data Yako ni Yako' : 'Your Data Belongs to You'}
              </h3>
              <p className="text-sm text-blue-800">
                {lang === 'sw'
                  ? 'Hatuwauzi data yako. Hakuna matangazo. Kila kitu kimehifadhiwa kwenye kifaa chako kwa usalama.'
                  : 'We never sell your data. No ads. Everything is securely stored on your device.'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
          {goalOptions.map(({ id, icon: Icon, labelKey }, index) => (
            <motion.button
              key={id}
              onClick={() => handleGoalSelect(id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                selectedGoal === id
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`w-7 h-7 mb-2 ${selectedGoal === id ? 'text-emerald-700' : 'text-gray-600'}`} />
              <p className="text-xs font-medium text-center text-gray-800">
                {t(labelKey, lang)}
              </p>
            </motion.button>
          ))}
        </div>

        {showCustomInput && (
          <motion.div
            className="max-w-md mx-auto mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <Input
              placeholder={t('custom', lang)}
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="mb-3"
            />
          </motion.div>
        )}

        {selectedGoal && (
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('targetAmount', lang)} (TZS)
            </label>
            <Input
              type="number"
              placeholder="100,000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="mb-6"
            />

            <Button
              onClick={handleContinue}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-full"
              disabled={!targetAmount || (showCustomInput && !customGoal)}
            >
              {t('continue', lang)}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}