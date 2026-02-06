import { createContext, useContext, useState, ReactNode } from 'react';

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
  onboardingComplete: boolean;
  emergencyMode: boolean;
  lastDailySummaryDate: string | null;
  spendingPatterns: Record<string, { amount: number; count: number; category: string; source: PaymentSource }>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    language: 'sw',
    userType: null,
    incomeFrequency: null,
    firstGoal: null,
    transactions: [],
    goals: [],
    cashBalance: 50000,
    mobileMoneyBalance: 125000,
    bankBalance: 0,
    onboardingComplete: false,
    emergencyMode: false,
    lastDailySummaryDate: null,
    spendingPatterns: {},
  });

  const setLanguage = (lang: Language) => {
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
      const source = 'cash'; // Default source for suggestions
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
