import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { motion } from 'motion/react';
import { Progress } from '@/app/components/ui/progress';

// ── Bootstrap i18next (side-effect import — must be first) ────────────────────
import '@/i18n';
import { syncI18nLanguage } from '@/i18n';
import { Analytics } from '@/app/utils/analytics';

// Types
export type Language = 'sw' | 'en';
export type UserType = 'student' | 'biashara' | 'informal' | 'family' | 'other';
export type IncomeFrequency = 'daily' | 'weekly' | 'monthly' | 'irregular';
export type PaymentSource = 'cash' | 'mpesa' | 'airtel' | 'tigo' | 'bank' | 'loan';
export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  source: PaymentSource;
  notes?: string;
  date: Date;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  daysLeft?: number;
  deadline?: string;
  completed: boolean;
}

export interface SavingsChallenge {
  id: string;
  name: string;
  emoji: string;
  targetDays: number;
  dailyAmount: number;
  startDate: string;       // ISO string
  contributions: number[]; // one entry per day completed
  completed: boolean;
}

export interface AppState {
  language: Language;
  userType: UserType | null;
  incomeFrequency: IncomeFrequency | null;
  firstGoal: Goal | null;
  transactions: Transaction[];
  goals: Goal[];
  cashBalance: number;
  mobileMoneyBalance: number;
  bankBalance: number;
  loanBalance: number;
  roundUpEnabled: boolean;
  roundUpSavings: number;
  onboardingComplete: boolean;
  emergencyMode: boolean;
  lastDailySummaryDate: string | null;
  spendingPatterns: Record<string, { amount: number; count: number; category: string; source: PaymentSource }>;
  streak: number;
  lastActiveDate: string | null;
  categoryBudgets: Record<string, number>;
  challenges: SavingsChallenge[];
  lessonProgress: string[];
  dismissedNotifications: string[];
  appLockEnabled: boolean;   // Audit Item 11 — Security: PIN lock
  appLockPin: string;        // 4-digit PIN (hashed in production with bcrypt)
}

interface AppContextType {
  state: AppState;
  setLanguage: (lang: Language) => void;
  setUserType: (type: UserType) => void;
  setIncomeFrequency: (freq: IncomeFrequency) => void;
  setFirstGoal: (goal: Goal) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  updateGoal: (id: string, amount: number) => void;
  completeOnboarding: () => void;
  getTodayIncome: () => number;
  getTodayExpenses: () => number;
  getCategorySpending: () => Record<string, number>;
  toggleEmergencyMode: () => void;
  getSmartSuggestions: () => { category: string; amount: number; source: PaymentSource }[];
  markDailySummaryShown: () => void;
  shouldShowDailySummary: () => boolean;
  clearAllData: () => void;
  setCategoryBudget: (category: string, amount: number) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, updates: Partial<Pick<Transaction, 'amount' | 'category' | 'source' | 'notes'>>) => void;
  setLoanBalance: (amount: number) => void;
  toggleRoundUp: () => void;
  startChallenge: (c: Omit<SavingsChallenge, 'id' | 'contributions' | 'completed'>) => void;
  logChallengeDay: (id: string, amount: number) => void;
  abandonChallenge: (id: string) => void;
  completeLesson: (lessonId: string) => void;
  dismissNotification: (id: string) => void;
  setAppLockPin: (pin: string) => void;
  disableAppLock: () => void;
}

// Context
const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultState: AppState = {
  language: 'sw',
  userType: null,
  incomeFrequency: null,
  firstGoal: null,
  transactions: [],
  goals: [],
  cashBalance: 0,
  mobileMoneyBalance: 0,
  bankBalance: 0,
  loanBalance: 0,
  roundUpEnabled: false,
  roundUpSavings: 0,
  onboardingComplete: false,
  emergencyMode: false,
  lastDailySummaryDate: null,
  spendingPatterns: {},
  streak: 0,
  lastActiveDate: null,
  categoryBudgets: {},
  challenges: [],
  lessonProgress: [],
  dismissedNotifications: [],
  appLockEnabled: false,
  appLockPin: '',
};

function loadPersistedState(): AppState {
  try {
    const saved = localStorage.getItem('budgetease_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultState,
        ...parsed,
        transactions: (parsed.transactions || []).map((t: any) => ({
          ...t,
          date: new Date(t.date),
        })),
      };
    }
  } catch (e) {
    console.error('Failed to load persisted state', e);
  }
  return defaultState;
}

// ── AUDIT FIX #2: PIN hash at module level so AppLock can import verifyPin ──
// djb2-style hash → base36 (deterministic, not bcrypt — replace in production)
export function hashPin(pin: string): string {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) {
    h = (h * 33) ^ pin.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(36);
}

/** Verify a PIN against stored value — supports legacy plaintext + hashed */
export function verifyPin(input: string, stored: string): boolean {
  if (/^\d{4}$/.test(stored)) return stored === input;       // legacy plaintext
  return hashPin(input) === stored;                           // hashed
}

function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadPersistedState);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('budgetease_v1', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [state]);

  const setLanguage = (lang: Language) => {
    syncI18nLanguage(lang);          // keep i18next in sync with AppState
    setState(prev => ({ ...prev, language: lang }));
  };

  const setUserType = (type: UserType) => {
    setState(prev => ({ ...prev, userType: type }));
  };

  const setIncomeFrequency = (freq: IncomeFrequency) => {
    setState(prev => ({ ...prev, incomeFrequency: freq }));
  };

  const setFirstGoal = (goal: Goal) => {
    setState(prev => ({ ...prev, firstGoal: goal, goals: [goal] }));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
    };

    setState(prev => {
      const newState = { ...prev, transactions: [newTransaction, ...prev.transactions] };
      
      // Update balances
      const amount = transaction.amount;
      if (transaction.type === 'income') {
        if (transaction.source === 'cash') newState.cashBalance += amount;
        else if (['mpesa', 'airtel', 'tigo'].includes(transaction.source)) newState.mobileMoneyBalance += amount;
        else if (transaction.source === 'bank') newState.bankBalance += amount;
      } else {
        if (transaction.source === 'cash') newState.cashBalance -= amount;
        else if (['mpesa', 'airtel', 'tigo'].includes(transaction.source)) newState.mobileMoneyBalance -= amount;
        else if (transaction.source === 'bank') newState.bankBalance -= amount;

        // Feature 8: Round-up savings
        if (prev.roundUpEnabled) {
          const roundUpTo = Math.ceil(amount / 500) * 500;
          const roundUp = roundUpTo - amount;
          if (roundUp > 0 && roundUp < 500) {
            newState.roundUpSavings = (prev.roundUpSavings || 0) + roundUp;
          }
        }
      }

      // Update streak tracking
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (prev.lastActiveDate !== today) {
        newState.streak = prev.lastActiveDate === yesterday ? prev.streak + 1 : 1;
        newState.lastActiveDate = today;
      }

      return newState;
    });
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'completed'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
    };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoal = (id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id === id) {
          const newCurrent = goal.current + amount;
          return {
            ...goal,
            current: newCurrent,
            completed: newCurrent >= goal.target,
          };
        }
        return goal;
      }),
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, onboardingComplete: true }));
  };

  const getTodayIncome = () => {
    const today = new Date().toDateString();
    return state.transactions
      .filter(t => t.type === 'income' && t.date.toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTodayExpenses = () => {
    const today = new Date().toDateString();
    return state.transactions
      .filter(t => t.type === 'expense' && t.date.toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCategorySpending = () => {
    return state.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  };

  const toggleEmergencyMode = () => {
    setState(prev => ({ ...prev, emergencyMode: !prev.emergencyMode }));
  };

  const getSmartSuggestions = () => {
    const today = new Date().toDateString();
    const todayExpenses = state.transactions
      .filter(t => t.type === 'expense' && t.date.toDateString() === today)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const suggestions: { category: string; amount: number; source: PaymentSource }[] = [];
    for (const category in todayExpenses) {
      const amount = todayExpenses[category];
      const source = 'cash' as PaymentSource;
      suggestions.push({ category, amount, source });
    }

    return suggestions;
  };

  const markDailySummaryShown = () => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({ ...prev, lastDailySummaryDate: today }));
  };

  const shouldShowDailySummary = () => {
    const today = new Date().toISOString().split('T')[0];
    return state.lastDailySummaryDate !== today;
  };

  const clearAllData = () => {
    try {
      localStorage.removeItem('budgetease_v1');
    } catch (e) {}
    Analytics.clearCrashLog();
    setState(defaultState);
  };

  const setCategoryBudget = (category: string, amount: number) => {
    setState(prev => ({
      ...prev,
      categoryBudgets: { ...prev.categoryBudgets, [category]: amount },
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => {
      const tx = prev.transactions.find(t => t.id === id);
      if (!tx) return prev;
      const newState = { ...prev, transactions: prev.transactions.filter(t => t.id !== id) };
      // Reverse balance effect
      if (tx.type === 'income') {
        if (tx.source === 'cash') newState.cashBalance -= tx.amount;
        else if (['mpesa', 'airtel', 'tigo'].includes(tx.source)) newState.mobileMoneyBalance -= tx.amount;
        else if (tx.source === 'bank') newState.bankBalance -= tx.amount;
      } else {
        if (tx.source === 'cash') newState.cashBalance += tx.amount;
        else if (['mpesa', 'airtel', 'tigo'].includes(tx.source)) newState.mobileMoneyBalance += tx.amount;
        else if (tx.source === 'bank') newState.bankBalance += tx.amount;
      }
      return newState;
    });
  };

  const editTransaction = (id: string, updates: Partial<Pick<Transaction, 'amount' | 'category' | 'source' | 'notes'>>) => {
    setState(prev => {
      const oldTx = prev.transactions.find(t => t.id === id);
      if (!oldTx) return prev;
      const newTx = { ...oldTx, ...updates };
      const newState = { ...prev, transactions: prev.transactions.map(t => t.id === id ? newTx : t) };
      // Reverse old effect
      if (oldTx.type === 'income') {
        if (oldTx.source === 'cash') newState.cashBalance -= oldTx.amount;
        else if (['mpesa', 'airtel', 'tigo'].includes(oldTx.source)) newState.mobileMoneyBalance -= oldTx.amount;
        else if (oldTx.source === 'bank') newState.bankBalance -= oldTx.amount;
      } else {
        if (oldTx.source === 'cash') newState.cashBalance += oldTx.amount;
        else if (['mpesa', 'airtel', 'tigo'].includes(oldTx.source)) newState.mobileMoneyBalance += oldTx.amount;
        else if (oldTx.source === 'bank') newState.bankBalance += oldTx.amount;
      }
      // Apply new effect
      if (newTx.type === 'income') {
        if (newTx.source === 'cash') newState.cashBalance += newTx.amount;
        else if (['mpesa', 'airtel', 'tigo'].includes(newTx.source)) newState.mobileMoneyBalance += newTx.amount;
        else if (newTx.source === 'bank') newState.bankBalance += newTx.amount;
      } else {
        if (newTx.source === 'cash') newState.cashBalance -= newTx.amount;
        else if (['mpesa', 'airtel', 'tigo'].includes(newTx.source)) newState.mobileMoneyBalance -= newTx.amount;
        else if (newTx.source === 'bank') newState.bankBalance -= newTx.amount;
      }
      return newState;
    });
  };

  const setLoanBalance = (amount: number) => {
    setState(prev => ({ ...prev, loanBalance: amount }));
  };

  const toggleRoundUp = () => {
    setState(prev => ({ ...prev, roundUpEnabled: !prev.roundUpEnabled }));
  };

  const startChallenge = (c: Omit<SavingsChallenge, 'id' | 'contributions' | 'completed'>) => {
    const challenge: SavingsChallenge = {
      ...c,
      id: Math.random().toString(36).substr(2, 9),
      contributions: [],
      completed: false,
    };
    setState(prev => ({ ...prev, challenges: [...prev.challenges, challenge] }));
  };

  const logChallengeDay = (id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c => {
        if (c.id !== id) return c;
        const newContribs = [...c.contributions, amount];
        return { ...c, contributions: newContribs, completed: newContribs.length >= c.targetDays };
      }),
    }));
  };

  const abandonChallenge = (id: string) => {
    setState(prev => ({ ...prev, challenges: prev.challenges.filter(c => c.id !== id) }));
  };

  const completeLesson = (lessonId: string) => {
    setState(prev => ({
      ...prev,
      lessonProgress: prev.lessonProgress.includes(lessonId)
        ? prev.lessonProgress
        : [...prev.lessonProgress, lessonId],
    }));
  };

  const dismissNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      dismissedNotifications: [...(prev.dismissedNotifications || []), id],
    }));
  };

  // hashPin and verifyPin are defined at module level (exported above AppProvider)
  // and are used directly by setAppLockPin below.

  const setAppLockPin = (pin: string) => {
    setState(prev => ({ ...prev, appLockPin: hashPin(pin), appLockEnabled: true }));
  };

  const disableAppLock = () => {
    setState(prev => ({ ...prev, appLockPin: '', appLockEnabled: false }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setLanguage,
        setUserType,
        setIncomeFrequency,
        setFirstGoal,
        addTransaction,
        addGoal,
        updateGoal,
        completeOnboarding,
        getTodayIncome,
        getTodayExpenses,
        getCategorySpending,
        toggleEmergencyMode,
        getSmartSuggestions,
        markDailySummaryShown,
        shouldShowDailySummary,
        clearAllData,
        setCategoryBudget,
        deleteTransaction,
        editTransaction,
        setLoanBalance,
        toggleRoundUp,
        startChallenge,
        logChallengeDay,
        abandonChallenge,
        completeLesson,
        dismissNotification,
        setAppLockPin,
        disableAppLock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Import components directly (no lazy loading to avoid circular dependencies)
import { SplashScreens } from '@/app/components/onboarding/SplashScreens';
import { LanguageChoice } from '@/app/components/onboarding/LanguageChoice';
import { UserTypeSelection } from '@/app/components/onboarding/UserTypeSelection';
import { IncomeFrequencySelection } from '@/app/components/onboarding/IncomeFrequencySelection';
import { GoalSetup } from '@/app/components/onboarding/GoalSetup';
import { Dashboard } from '@/app/components/dashboard/Dashboard';
import { Toaster } from '@/app/components/ui/sonner';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { AppLock } from '@/app/components/dashboard/AppLock';

// App Content
function AppContent() {
  const { state, completeOnboarding } = useApp();
  const [onboardingStep, setOnboardingStep] = useState<
    'splash' | 'language' | 'userType' | 'incomeFreq' | 'goal' | 'complete'
  >('splash');

  // ── App Lock ────────────────────────────────────────────────────────────────
  const [isAppLocked, setIsAppLocked] = useState(() => state.appLockEnabled && state.onboardingComplete);

  // AUDIT FIX #3a: Re-lock when appLockEnabled is toggled ON in Settings
  useEffect(() => {
    if (state.appLockEnabled && state.onboardingComplete) {
      setIsAppLocked(true);
    }
  }, [state.appLockEnabled]);

  // AUDIT FIX #3b: Re-lock when app returns from background (tab/app switch)
  useEffect(() => {
    if (!state.appLockEnabled || !state.onboardingComplete) return;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        setIsAppLocked(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [state.appLockEnabled, state.onboardingComplete]);

  if (state.appLockEnabled && state.onboardingComplete && isAppLocked) {
    return <AppLock mode="unlock" storedPin={state.appLockPin} onUnlocked={() => setIsAppLocked(false)} />;
  }

  const handleStepComplete = (nextStep: typeof onboardingStep) => {
    setOnboardingStep(nextStep);
  };

  const handleOnboardingComplete = () => {
    completeOnboarding();
    setOnboardingStep('complete');
  };

  // Show dashboard if onboarding is complete
  if (state.onboardingComplete || onboardingStep === 'complete') {
    return <Dashboard />;
  }

  // Progress bar for onboarding
  const getProgress = () => {
    const steps = ['splash', 'language', 'userType', 'incomeFreq', 'goal'];
    const currentIndex = steps.indexOf(onboardingStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="relative">
      {/* Progress Indicator */}
      {onboardingStep !== 'splash' && onboardingStep !== 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Progress value={getProgress()} className="h-1 rounded-none" />
        </motion.div>
      )}

      {/* Onboarding Screens */}
      {onboardingStep === 'splash' && (
        <SplashScreens onComplete={() => handleStepComplete('language')} />
      )}
      {onboardingStep === 'language' && (
        <LanguageChoice onComplete={() => handleStepComplete('userType')} />
      )}
      {onboardingStep === 'userType' && (
        <UserTypeSelection onComplete={() => handleStepComplete('incomeFreq')} />
      )}
      {onboardingStep === 'incomeFreq' && (
        <IncomeFrequencySelection onComplete={() => handleStepComplete('goal')} />
      )}
      {onboardingStep === 'goal' && (
        <GoalSetup onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}

// Main App
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="size-full bg-gray-50">
          <AppContent />
          <Toaster position="top-center" />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;