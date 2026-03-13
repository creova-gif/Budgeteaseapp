import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlusCircle, MinusCircle, Target, TrendingUp, History,
  Settings, Home, TrendingDown, Flame, ChevronRight, Trash2,
} from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { getCategoryIcon } from '@/app/utils/categoryIcons';
import { AddTransactionDialog } from './AddTransactionDialog';
import { GoalsView } from './GoalsView';
import { HistoryView } from './HistoryView';
import { InsightsView } from './InsightsView';
import { SettingsView } from './SettingsView';
import { DailySummaryDialog } from './DailySummaryDialog';
import { QuickAddButton } from './QuickAddButton';
import { OfflineIndicator } from './OfflineIndicator';
import { SpendingNudge } from './SpendingNudge';
import { ExitExperience } from './ExitExperience';
import { EmergencyModeToggle } from './EmergencyModeToggle';
import { BudgetHealthBars } from './BudgetHealthBars';
import { FinancialHealthScore } from './FinancialHealthScore';
import { InsightOfDay } from './InsightOfDay';
import { EditTransactionDialog } from './EditTransactionDialog';
import { CashflowForecast } from './CashflowForecast';
import { NetWorthCard } from './NetWorthCard';
import { AIAssistant } from './AIAssistant';
import { NotificationCenter } from './NotificationCenter';
import { GrowthShareCard } from './GrowthShareCard';
import { TrustSignals } from './TrustSignals';
import type { Transaction } from '@/app/App';

type ActiveView = 'dashboard' | 'goals' | 'history' | 'insights' | 'settings';
type Period = 'today' | 'week' | 'month';

// ── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const start = prevRef.current;
    const diff = target - start;
    const startTime = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + diff * eased));
      if (progress < 1) timerRef.current = setTimeout(tick, 16);
      else prevRef.current = target;
    };
    tick();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [target, duration]);
  return value;
}

const tabs: { id: ActiveView; icon: typeof Home; sw: string; en: string }[] = [
  { id: 'dashboard', icon: Home, sw: t('home', 'sw'), en: t('home', 'en') },
  { id: 'goals', icon: Target, sw: t('goals', 'sw'), en: t('goals', 'en') },
  { id: 'history', icon: History, sw: t('history', 'sw'), en: t('history', 'en') },
  { id: 'insights', icon: TrendingUp, sw: t('insights', 'sw'), en: t('insights', 'en') },
  { id: 'settings', icon: Settings, sw: t('settings', 'sw'), en: t('settings', 'en') },
];

function getGreeting(userType: string | null, lang: 'sw' | 'en') {
  const map: Record<string, 'greetStudent' | 'greetBiashara' | 'greetInformal' | 'greetFamily'> = {
    student: 'greetStudent',
    biashara: 'greetBiashara',
    informal: 'greetInformal',
    family: 'greetFamily',
  };
  const key = map[userType ?? ''];
  return key ? t(key, lang) : t('greetDefault', lang);
}

export function Dashboard() {
  const { state, shouldShowDailySummary, updateGoal, deleteTransaction } = useApp();
  const lang = state.language;

  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showGoalContribute, setShowGoalContribute] = useState(false);
  const [period, setPeriod] = useState<Period>('today');
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartRef = useRef<number>(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const confirmDeleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shouldShowDailySummary() && state.transactions.length > 0) {
      const t = setTimeout(() => setShowDailySummary(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(n);

  // ── Period stats ────────────────────────────────────────────────────────────
  const periodStats = useMemo(() => {
    const now = new Date();
    let start: Date;
    if (period === 'today') {
      start = new Date(now.toDateString());
    } else if (period === 'week') {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const filtered = state.transactions.filter(tx => tx.date >= start);
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, left: income - expenses };
  }, [state.transactions, period]);

  const totalBalance = state.cashBalance + state.mobileMoneyBalance + state.bankBalance;
  const animatedBalance = useCountUp(totalBalance);
  const animatedIncome = useCountUp(periodStats.income);
  const animatedExpenses = useCountUp(periodStats.expenses);
  const animatedLeft = useCountUp(Math.abs(periodStats.left));

  // ── Active goal ─────────────────────────────────────────────────────────────
  const activeGoal = state.goals.find(g => !g.completed) ?? state.goals[0];
  const goalPct = activeGoal ? Math.min((activeGoal.current / activeGoal.target) * 100, 100) : 0;

  // Auto-suggest contribution: 5% of average daily income
  const avgDailyIncome = useMemo(() => {
    const incomeTx = state.transactions.filter(t => t.type === 'income');
    if (incomeTx.length === 0) return 5000;
    const days = new Set(incomeTx.map(t => t.date.toDateString())).size;
    const total = incomeTx.reduce((s, t) => s + t.amount, 0);
    return Math.round((total / Math.max(days, 1)) * 0.05 / 500) * 500;
  }, [state.transactions]);

  const recentTx = state.transactions.slice(0, 5);

  // ── Swipe handlers on recent tx ─────────────────────────────────────────────
  const onTxTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartRef.current = e.touches[0].clientX;
  };
  const onTxTouchEnd = (e: React.TouchEvent, tx: Transaction) => {
    const delta = e.changedTouches[0].clientX - touchStartRef.current;
    if (delta < -70) { setSwipedId(tx.id); }           // swipe left → reveal delete
    else if (delta > 70) { setEditingTx(tx); setSwipedId(null); }  // swipe right → edit
    else if (Math.abs(delta) < 10) {
      // tap
      if (swipedId === tx.id) setSwipedId(null);
      else setEditingTx(tx);
    }
  };

  // 2-tap delete confirmation — prevents accidental deletes (Audit Item 6)
  const handleDeleteTx = (tx: Transaction) => {
    if (confirmDeleteId === tx.id) {
      // Second tap → actually delete
      if (confirmDeleteTimerRef.current) clearTimeout(confirmDeleteTimerRef.current);
      deleteTransaction(tx.id);
      setSwipedId(null);
      setConfirmDeleteId(null);
      // Haptic feedback on delete (supported devices)
      if (navigator.vibrate) navigator.vibrate([30, 20, 50]);
    } else {
      // First tap → arm confirmation for 3 seconds
      setConfirmDeleteId(tx.id);
      if (confirmDeleteTimerRef.current) clearTimeout(confirmDeleteTimerRef.current);
      confirmDeleteTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
      // Light haptic feedback
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };

  const periodLabels: Record<Period, { sw: string; en: string }> = {
    today: { sw: 'Leo', en: 'Today' },
    week: { sw: 'Wiki', en: 'Week' },
    month: { sw: 'Mwezi', en: 'Month' },
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ══ HOME ══ */}
          {activeView === 'dashboard' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* ── SECTION 1: Financial Snapshot ── */}
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white px-5 pb-32 relative overflow-hidden min-safe-top">
                <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full" />
                <div className="absolute top-16 -right-4 w-20 h-20 bg-white/5 rounded-full" />

                {/* Greeting */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-white/70">{getGreeting(state.userType, lang)}</p>
                    <h1 className="text-sm font-bold">{t('yourMoneyToday', lang)}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    {state.streak > 0 && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="flex items-center gap-1.5 bg-orange-400 px-3 py-1.5 rounded-full shadow"
                      >
                        <Flame className="w-4 h-4" />
                        <span className="text-sm font-black">{state.streak}</span>
                      </motion.div>
                    )}
                    <NotificationCenter />
                  </div>
                </div>

                {/* Total Balance with count-up */}
                <div className="text-center mb-3">
                  <p className="text-xs text-white/70 mb-0.5">{t('totalBalance', lang)}</p>
                  <p className="text-5xl font-black tracking-tight">
                    {fmt(animatedBalance)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    💵 {fmt(state.cashBalance)} &nbsp;·&nbsp; 📱 {fmt(state.mobileMoneyBalance)}
                  </p>
                </div>

                {/* Period selector tabs */}
                <div className="flex justify-center mb-4">
                  <div className="flex bg-white/15 rounded-2xl p-1 gap-1">
                    {(['today', 'week', 'month'] as Period[]).map(p => (
                      <motion.button
                        key={p}
                        onClick={() => setPeriod(p)}
                        whileTap={{ scale: 0.93 }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                          period === p ? 'bg-white text-emerald-700 shadow' : 'text-white/80 hover:text-white'
                        }`}
                      >
                        {p === 'today' ? t('today', lang) : p === 'week' ? t('week', lang) : t('month', lang)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Income / Spent / Left cards */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: t('income_label', lang), value: animatedIncome, color: 'text-green-300', sign: '+' },
                    { label: t('spent', lang), value: animatedExpenses, color: 'text-red-300', sign: '-' },
                    {
                      label: t('left', lang),
                      value: animatedLeft,
                      color: periodStats.left >= 0 ? 'text-white' : 'text-red-300',
                      sign: periodStats.left >= 0 ? '' : '-',
                    },
                  ].map(({ label, value, color, sign }) => (
                    <div key={label} className="bg-white/15 backdrop-blur rounded-2xl px-2 py-3 text-center">
                      <p className="text-xs text-white/70 mb-0.5">{label}</p>
                      <p className={`text-sm font-bold ${color}`}>{sign}{fmt(value)}</p>
                    </div>
                  ))}
                </div>

                {/* Quick action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { setTxType('expense'); setShowAddTx(true); }}
                    className="bg-white/20 hover:bg-white/30 rounded-2xl p-3.5 flex items-center gap-2 transition"
                  >
                    <MinusCircle className="w-5 h-5 text-red-300 shrink-0" />
                    <span className="text-sm font-semibold">{t('addExpense', lang)}</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { setTxType('income'); setShowAddTx(true); }}
                    className="bg-white/20 hover:bg-white/30 rounded-2xl p-3.5 flex items-center gap-2 transition"
                  >
                    <PlusCircle className="w-5 h-5 text-green-300 shrink-0" />
                    <span className="text-sm font-semibold">{t('addIncome', lang)}</span>
                  </motion.button>
                </div>
              </div>

              {/* ── CARDS AREA (overlap) ── */}
              <div className="-mt-14 px-4 space-y-4 pb-8">

                {/* ── SECTION 2: Budget Health ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <BudgetHealthBars />
                </motion.div>

                {/* ── SECTION 3: Active Goal ── */}
                {activeGoal && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden"
                  >
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-gray-900">{activeGoal.title}</span>
                        {activeGoal.completed && <span>🎉</span>}
                      </div>
                      <button onClick={() => setActiveView('goals')} className="text-xs text-purple-600 flex items-center">
                        {t('view', lang)}<ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="px-4 mb-1">
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${goalPct}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1 mb-3">
                        <span>{fmt(activeGoal.current)}</span>
                        <span className="font-bold text-purple-700">{goalPct.toFixed(0)}%</span>
                        <span>{fmt(activeGoal.target)}</span>
                      </div>
                    </div>

                    {!activeGoal.completed && (
                      <div className="px-4 pb-4 space-y-2">
                        {/* Auto-suggest chip */}
                        {avgDailyIncome > 0 && (
                          <p className="text-xs text-gray-400 text-center">
                            💡 {lang === 'sw' ? `Pendekezo: ${fmt(avgDailyIncome)} leo` : `Suggested: ${fmt(avgDailyIncome)} today`}
                          </p>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowGoalContribute(true)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2.5 text-sm font-bold transition"
                        >
                          + {t('contributeNow', lang)}
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── SECTION 4: Recent Transactions ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {t('recentTransactions', lang)}
                    </h3>
                    {state.transactions.length > 5 && (
                      <button onClick={() => setActiveView('history')} className="text-xs text-emerald-600 flex items-center">
                        {t('all', lang)}<ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {recentTx.length === 0 ? (
                    <div className="px-4 pb-6 text-center">
                      <p className="text-sm text-gray-400">
                        {t('noTransactions', lang)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Swipe hint */}
                      <p className="text-xs text-gray-300 text-center pb-1">
                        {t('swipeHint', lang)}
                      </p>
                      {recentTx.map((tx, idx) => (
                        <div key={tx.id} className="relative overflow-hidden">
                          {/* Delete zone revealed on swipe left */}
                          <AnimatePresence>
                            {swipedId === tx.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute right-0 top-0 h-full flex"
                              >
                                <button
                                  onClick={() => handleDeleteTx(tx)}
                                  aria-label={confirmDeleteId === tx.id
                                    ? (lang === 'sw' ? 'Thibitisha ufutaji' : 'Confirm delete')
                                    : (lang === 'sw' ? 'Futa muamala' : 'Delete transaction')}
                                  className={`text-white px-5 h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                    confirmDeleteId === tx.id ? 'bg-red-700' : 'bg-red-500'
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-xs font-semibold">
                                    {confirmDeleteId === tx.id
                                      ? (lang === 'sw' ? 'Thibitisha?' : 'Confirm?')
                                      : t('delete', lang)}
                                  </span>
                                </button>
                                <button
                                  onClick={() => { setEditingTx(tx); setSwipedId(null); }}
                                  className="bg-blue-500 text-white px-4 h-full flex flex-col items-center justify-center gap-0.5"
                                >
                                  <span className="text-lg">✏️</span>
                                  <span className="text-xs font-semibold">{t('edit', lang)}</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.div
                            animate={{ x: swipedId === tx.id ? -116 : 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            onTouchStart={e => onTxTouchStart(e, tx.id)}
                            onTouchEnd={e => onTxTouchEnd(e, tx)}
                            onClick={() => { if (swipedId === tx.id) setSwipedId(null); else setEditingTx(tx); }}
                            className={`flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition ${
                              idx < recentTx.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                                tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                              }`}>
                                {getCategoryIcon(tx.category)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{tx.category}</p>
                                <p className="text-xs text-gray-400">
                                  {tx.source.toUpperCase()}{tx.notes ? ` · ${tx.notes}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                              </p>
                              <p className="text-xs text-gray-300">
                                {tx.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* ── SECTION 5: Insight of the Day ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <InsightOfDay />
                </motion.div>

                {/* ── Cashflow Forecast (Feature 4) ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                  <CashflowForecast />
                </motion.div>

                {/* ── Net Worth & Round-up (Features 8 + 11) ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                  <NetWorthCard />
                </motion.div>

                {/* ── Growth & Share Card (Risk 3) ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
                  <GrowthShareCard />
                </motion.div>

                {/* Financial Health Score */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <FinancialHealthScore />
                </motion.div>

                <EmergencyModeToggle />

                <TrustSignals />
              </div>
            </motion.div>
          )}

          {activeView === 'goals' && (
            <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GoalsView onBack={() => setActiveView('dashboard')} />
            </motion.div>
          )}
          {activeView === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HistoryView onBack={() => setActiveView('dashboard')} onEditTransaction={setEditingTx} />
            </motion.div>
          )}
          {activeView === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InsightsView onBack={() => setActiveView('dashboard')} />
            </motion.div>
          )}
          {activeView === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SettingsView onBack={() => setActiveView('dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav
        role="navigation"
        aria-label={lang === 'sw' ? 'Urambazaji wa chini' : 'Bottom navigation'}
        className="bg-white border-t border-gray-200 grid grid-cols-5 shadow-lg z-30 shrink-0 safe-area-bottom-nav"
      >
        {tabs.map(({ id, icon: Icon, sw, en }) => {
          const active = activeView === id;
          return (
            <motion.button
              key={id}
              role="tab"
              aria-selected={active}
              aria-label={lang === 'sw' ? sw : en}
              onClick={() => {
                setActiveView(id);
                if (navigator.vibrate) navigator.vibrate(8);
              }}
              whileTap={{ scale: 0.87 }}
              className="flex flex-col items-center justify-center py-2 relative"
            >
              {active && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-emerald-500 rounded-full"
                />
              )}
              <Icon className={`w-5 h-5 mb-0.5 transition-colors ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium transition-colors ${active ? 'text-emerald-700' : 'text-gray-400'}`}>
                {lang === 'sw' ? sw : en}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* ── OVERLAYS ── */}
      <QuickAddButton />
      <OfflineIndicator />
      <SpendingNudge onAddExpense={() => { setTxType('expense'); setShowAddTx(true); }} />
      <ExitExperience />

      {showAddTx && <AddTransactionDialog type={txType} onClose={() => setShowAddTx(false)} />}
      {showDailySummary && <DailySummaryDialog onClose={() => setShowDailySummary(false)} />}
      {editingTx && <EditTransactionDialog transaction={editingTx} onClose={() => setEditingTx(null)} />}

      {/* ── AI Assistant (Feature 14) ── */}
      <AIAssistant />

      {/* ── Goal Contribute Sheet ── */}
      <AnimatePresence>
        {showGoalContribute && activeGoal && (
          <GoalContributeSheet
            goal={activeGoal}
            lang={lang}
            suggestedAmount={avgDailyIncome}
            onContribute={amount => { updateGoal(activeGoal.id, amount); setShowGoalContribute(false); }}
            onClose={() => setShowGoalContribute(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Goal Contribute Sheet ────────────────────────────────────────────────────
function GoalContributeSheet({
  goal, lang, suggestedAmount, onContribute, onClose,
}: {
  goal: { id: string; title: string; target: number; current: number };
  lang: 'sw' | 'en';
  suggestedAmount: number;
  onContribute: (amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const quickAmounts = [5000, 10000, 20000, 50000];
  const fmt = (n: number) => `TSh ${n.toLocaleString()}`;
  const remaining = goal.target - goal.current;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 z-50 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">
          {t('contributeToGoal', lang)}
        </h2>
        <p className="text-xs text-gray-500 mb-1">{goal.title}</p>
        <p className="text-xs text-purple-600 font-medium mb-4">
          {lang === 'sw' ? `Imebaki: ${fmt(remaining)}` : `Remaining: ${fmt(remaining)}`}
        </p>

        {/* Auto-suggest banner */}
        {suggestedAmount > 0 && (
          <button
            onClick={() => setAmount(suggestedAmount.toString())}
            className={`w-full mb-3 py-2 px-3 rounded-xl border-2 text-xs font-semibold transition flex items-center justify-between ${
              amount === suggestedAmount.toString()
                ? 'border-purple-600 bg-purple-50 text-purple-800'
                : 'border-dashed border-purple-300 text-purple-600 hover:bg-purple-50'
            }`}
          >
            <span>💡 {lang === 'sw' ? 'Pendekezo la leo' : 'Suggested today'}</span>
            <span>{fmt(suggestedAmount)}</span>
          </button>
        )}

        <div className="flex items-center border-2 border-emerald-500 rounded-2xl mb-4 overflow-hidden">
          <span className="px-3 text-sm text-gray-400 font-medium">TSh</span>
          <input
            type="number" placeholder="0" value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 py-3 text-2xl font-black text-gray-900 outline-none"
            autoFocus
          />
        </div>

        <div className="flex gap-2 mb-5">
          {quickAmounts.map(a => (
            <button
              key={a}
              onClick={() => setAmount(a.toString())}
              className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition ${
                amount === a.toString() ? 'border-purple-600 bg-purple-50 text-purple-800' : 'border-gray-200 text-gray-600'
              }`}
            >
              {a >= 1000 ? `${a / 1000}k` : a}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold text-sm">
            {lang === 'sw' ? 'Ghairi' : 'Cancel'}
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { const v = parseFloat(amount); if (v > 0) onContribute(v); }}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex-1 py-3.5 bg-purple-600 text-white rounded-2xl font-bold text-sm disabled:opacity-40"
          >
            {lang === 'sw' ? 'Changia' : 'Contribute'}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}