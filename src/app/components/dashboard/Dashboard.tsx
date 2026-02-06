import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlusCircle, MinusCircle, Target, TrendingUp, History, Settings, BookOpen } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { AddTransactionDialog } from './AddTransactionDialog';
import { GoalsView } from './GoalsView';
import { HistoryView } from './HistoryView';
import { InsightsView } from './InsightsView';
import { SettingsView } from './SettingsView';
import { DailySummaryDialog } from './DailySummaryDialog';
import { LearningCard, learningContent } from '@/app/components/learning/LearningCard';
import { QuickAddButton } from './QuickAddButton';
import { EmergencyModeToggle } from './EmergencyModeToggle';
import { OfflineIndicator } from './OfflineIndicator';
import { SpendingNudge } from './SpendingNudge';
import { ExitExperience } from './ExitExperience';
import { LocalBenchmarks } from './LocalBenchmarks';

export function Dashboard() {
  const { state, getTodayIncome, getTodayExpenses, shouldShowDailySummary } = useApp();
  const lang = state.language;
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [activeView, setActiveView] = useState<'dashboard' | 'goals' | 'history' | 'insights' | 'settings'>('dashboard');
  const [showDailySummary, setShowDailySummary] = useState(false);

  // Auto-show daily summary
  useEffect(() => {
    if (shouldShowDailySummary() && state.transactions.length > 0) {
      // Show after 2 seconds
      const timer = setTimeout(() => {
        setShowDailySummary(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowDailySummary, state.transactions.length]);

  const totalBalance = state.cashBalance + state.mobileMoneyBalance + state.bankBalance;
  const todayIncome = getTodayIncome();
  const todayExpenses = getTodayExpenses();
  const remaining = todayIncome - todayExpenses;

  const getBudgetStatus = () => {
    if (remaining > 0) return { status: 'onTrack', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (remaining < 0 && Math.abs(remaining) < todayIncome * 0.2) return { status: 'caution', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { status: 'overspent', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const budgetStatus = getBudgetStatus();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddTransaction = (type: 'expense' | 'income') => {
    setTransactionType(type);
    setShowAddTransaction(true);
  };

  if (activeView === 'goals') {
    return <GoalsView onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'history') {
    return <HistoryView onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'insights') {
    return <InsightsView onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'settings') {
    return <SettingsView onBack={() => setActiveView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white px-6 pt-8 pb-24 rounded-b-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{t('yourMoneyToday', lang)}</h1>
          <button
            onClick={() => setActiveView('settings')}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <p className="text-sm opacity-90 mb-2">{t('totalBalance', lang)}</p>
          <p className="text-4xl font-bold mb-4">{formatCurrency(totalBalance)}</p>
          
          {/* Balance Breakdown */}
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>{t('cash', lang)}: {formatCurrency(state.cashBalance)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>{t('mobileMoney', lang)}: {formatCurrency(state.mobileMoneyBalance)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Daily Snapshot Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 -mt-16 mb-6 bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="font-semibold mb-4 text-gray-900">{lang === 'sw' ? 'Muhtasari wa Leo' : 'Daily Snapshot'}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('todayIncome', lang)}</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(todayIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('todayExpenses', lang)}</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(todayExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('remaining', lang)}</p>
            <p className={`text-lg font-bold ${budgetStatus.color}`}>{formatCurrency(remaining)}</p>
          </div>
        </div>
        <div className={`mt-4 ${budgetStatus.bg} ${budgetStatus.color} px-3 py-2 rounded-lg text-sm font-medium text-center`}>
          {t(budgetStatus.status, lang)}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddTransaction('expense')}
            className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center justify-center hover:shadow-lg transition"
          >
            <MinusCircle className="w-10 h-10 text-red-600 mb-2" />
            <p className="font-medium text-gray-900">{t('addExpense', lang)}</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddTransaction('income')}
            className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center justify-center hover:shadow-lg transition"
          >
            <PlusCircle className="w-10 h-10 text-emerald-600 mb-2" />
            <p className="font-medium text-gray-900">{t('addIncome', lang)}</p>
          </motion.button>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="px-6 space-y-3 pb-24">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveView('goals')}
          className="w-full bg-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{t('goals', lang)}</p>
              <p className="text-sm text-gray-500">{state.goals.length} {lang === 'sw' ? 'lengo' : 'goals'}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveView('insights')}
          className="w-full bg-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{t('insights', lang)}</p>
              <p className="text-sm text-gray-500">{lang === 'sw' ? 'Angalia mwenendo wako' : 'View your trends'}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveView('history')}
          className="w-full bg-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <History className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{t('history', lang)}</p>
              <p className="text-sm text-gray-500">{state.transactions.length} {lang === 'sw' ? 'muamala' : 'transactions'}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDailySummary(true)}
          className="w-full bg-white rounded-2xl p-5 shadow-md flex items-center justify-between hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <BookOpen className="w-6 h-6 text-gray-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{t('dailySummary', lang)}</p>
              <p className="text-sm text-gray-500">{lang === 'sw' ? 'Maelezo ya Leo' : 'Daily Summary'}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Learning Section */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            {lang === 'sw' ? 'Jifunze Zaidi' : 'Learn More'}
          </h2>
          <div className="grid gap-3">
            {learningContent[lang].slice(0, 2).map((card, index) => (
              <LearningCard
                key={index}
                title={card.title}
                content={card.content}
                readTime={card.readTime}
                category={card.category}
              />
            ))}
          </div>
        </div>

        {/* Emergency Mode Toggle */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            {lang === 'sw' ? 'Mipangilio ya Haraka' : 'Quick Settings'}
          </h2>
          <EmergencyModeToggle />
        </div>

        {/* Local Benchmarks */}
        {getTodayExpenses() > 0 && (
          <div className="mt-6">
            <LocalBenchmarks />
          </div>
        )}

        {/* Data Privacy Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="font-semibold text-blue-900 mb-2">
            🔒 {lang === 'sw' ? 'Data Yako ni Yako' : 'Your Data Belongs to You'}
          </h3>
          <p className="text-sm text-blue-800">
            {lang === 'sw'
              ? 'Hatuwauzi data yako. Hakuna matangazo. Kila kitu kimehifadhiwa kwenye kifaa chako kwa usalama.'
              : 'We never sell your data. No ads. Everything is securely stored on your device.'}
          </p>
        </div>
      </div>

      {/* Floating Components */}
      <QuickAddButton />
      <OfflineIndicator />
      <SpendingNudge onAddExpense={() => handleAddTransaction('expense')} />
      <ExitExperience />

      {/* Dialogs */}
      {showAddTransaction && (
        <AddTransactionDialog
          type={transactionType}
          onClose={() => setShowAddTransaction(false)}
        />
      )}

      {showDailySummary && (
        <DailySummaryDialog onClose={() => setShowDailySummary(false)} />
      )}
    </div>
  );
}