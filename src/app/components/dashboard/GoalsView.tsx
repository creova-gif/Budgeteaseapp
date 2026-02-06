import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Target, Plus } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { toast } from 'sonner';

interface GoalsViewProps {
  onBack: () => void;
}

export function GoalsView({ onBack }: GoalsViewProps) {
  const { state, addGoal, updateGoal } = useApp();
  const lang = state.language;
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddGoal = () => {
    if (!newGoalTitle || !newGoalTarget) return;

    addGoal({
      title: newGoalTitle,
      target: parseInt(newGoalTarget),
      current: 0,
    });

    setNewGoalTitle('');
    setNewGoalTarget('');
    setShowAddGoal(false);
    toast.success(lang === 'sw' ? 'Lengo limeongezwa!' : 'Goal added!');
  };

  const handleContribute = () => {
    if (!contributionAmount || !showContribute) return;

    const goal = state.goals.find(g => g.id === showContribute);
    if (!goal) return;

    updateGoal(showContribute, parseInt(contributionAmount));
    
    const newCurrent = goal.current + parseInt(contributionAmount);
    if (newCurrent >= goal.target) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    setContributionAmount('');
    setShowContribute(null);
    toast.success(lang === 'sw' ? 'Mchango umeongezwa!' : 'Contribution added!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 pt-8 pb-6">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('goals', lang)}</h1>
        </div>
      </div>

      {/* Goals List */}
      <div className="px-6 py-6 space-y-4">
        {state.goals.map((goal, index) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </p>
                  </div>
                </div>
                {goal.completed && (
                  <span className="text-2xl">🎉</span>
                )}
              </div>

              <Progress value={progress} className="mb-4" />

              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-purple-600">
                  {progress.toFixed(0)}% {lang === 'sw' ? 'imekamilika' : 'complete'}
                </p>
                {!goal.completed && (
                  <Button
                    onClick={() => setShowContribute(goal.id)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {t('contributeNow', lang)}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Add Goal Button */}
        <motion.button
          onClick={() => setShowAddGoal(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition"
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-600 font-medium">{t('addGoal', lang)}</p>
        </motion.button>
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addGoal', lang)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'sw' ? 'Jina la Lengo' : 'Goal Name'}
              </label>
              <Input
                placeholder={lang === 'sw' ? 'Akiba ya dharura' : 'Emergency fund'}
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('targetAmount', lang)} (TZS)
              </label>
              <Input
                type="number"
                placeholder="300,000"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowAddGoal(false)} variant="outline" className="flex-1">
                {t('cancel', lang)}
              </Button>
              <Button onClick={handleAddGoal} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {t('save', lang)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={!!showContribute} onOpenChange={() => setShowContribute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contributeNow', lang)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('amount', lang)} (TZS)
              </label>
              <Input
                type="number"
                placeholder="50,000"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowContribute(null)} variant="outline" className="flex-1">
                {t('cancel', lang)}
              </Button>
              <Button onClick={handleContribute} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {lang === 'sw' ? 'Changia' : 'Contribute'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Celebration */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">{t('goalAchieved', lang)}</h2>
          </div>
        </motion.div>
      )}
    </div>
  );
}