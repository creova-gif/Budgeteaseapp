import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlusCircle, MinusCircle, Target, TrendingUp, History,
  Settings, Home, Flame, ChevronRight, Trash2, Search,
  Sparkles, Camera, AlertTriangle, Bell,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis,
} from 'recharts';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { formatCurrency } from '@/app/utils/currency';
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
import { BudgetLimitsSheet } from './BudgetLimitsSheet';
import { EditTransactionDialog } from './EditTransactionDialog';
import { AIAssistant } from './AIAssistant';
import { NotificationCenter } from './NotificationCenter';
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
    student: 'greetStudent', biashara: 'greetBiashara',
    informal: 'greetInformal', family: 'greetFamily',
  };
  const key = map[userType ?? ''];
  return key ? t(key, lang) : t('greetDefault', lang);
}

const PIE_COLORS = ['#10b981','#0d9488','#06b6d4','#f97316','#8b5cf6','#3b82f6','#ec4899','#f59e0b'];

// ── Natural language query parser ───────────────────────────────────────────
function nlSearch(query: string, transactions: Transaction[]): Transaction[] {
  if (!query.trim()) return transactions;
  const q = query.toLowerCase();
  // extract keywords (strip common filler words)
  const stopWords = ['show','me','my','all','the','expenses','expense','income','spending','for','in','on','of','and'];
  const keywords = q.split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w));
  if (!keywords.length) return transactions;
  return transactions.filter(tx => {
    const haystack = [tx.category, tx.notes ?? '', tx.source, tx.type].join(' ').toLowerCase();
    return keywords.some(k => haystack.includes(k));
  });
}

export function Dashboard() {
  const { state, shouldShowDailySummary, updateGoal, deleteTransaction, getCategorySpending } = useApp();
  const lang = state.language;

  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showGoalContribute, setShowGoalContribute] = useState(false);
  const [period, setPeriod] = useState<Period>('month');
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartRef = useRef<number>(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const confirmDeleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showBudgetLimits, setShowBudgetLimits] = useState(false);

  useEffect(() => {
    if (shouldShowDailySummary() && state.transactions.length > 0) {
      const t = setTimeout(() => setShowDailySummary(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const fmt = (n: number) => formatCurrency(n, state.region);
  const fmtK = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toString();

  // ── Period stats ─────────────────────────────────────────────────────────
  const periodStats = useMemo(() => {
    const now = new Date();
    let start: Date;
    if (period === 'today') {
      start = new Date(now.toDateString());
    } else if (period === 'week') {
      start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0);
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
  const animatedExpenses = useCountUp(periodStats.expenses);

  // ── Monthly progress (always month view for the arc) ─────────────────────
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const filtered = state.transactions.filter(tx => tx.date >= start);
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const budget = income > 0 ? income : 500_000;
    const pct = Math.min((expenses / budget) * 100, 100);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const dailyBudget = budget / daysInMonth;
    const expectedSpend = dailyBudget * dayOfMonth;
    const onTrack = expenses <= expectedSpend * 1.1;
    return { income, expenses, budget, pct, onTrack, expectedSpend };
  }, [state.transactions]);

  // ── Pie chart data ───────────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const spending = getCategorySpending();
    return Object.entries(spending)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cat, val]) => ({ name: cat, value: val }));
  }, [state.transactions]);

  // ── Budget alerts ────────────────────────────────────────────────────────
  const budgetAlerts = useMemo(() => {
    const spending = getCategorySpending();
    return Object.entries(state.categoryBudgets)
      .map(([cat, budget]) => ({ cat, budget, spent: spending[cat] ?? 0, pct: Math.round(((spending[cat] ?? 0) / budget) * 100) }))
      .filter(a => a.pct >= 80)
      .sort((a, b) => b.pct - a.pct);
  }, [state.transactions, state.categoryBudgets]);

  // ── 7-day trend ──────────────────────────────────────────────────────────
  const trendData = useMemo(() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const ds = d.toDateString();
      const spent = state.transactions
        .filter(tx => tx.type === 'expense' && tx.date.toDateString() === ds)
        .reduce((s, tx) => s + tx.amount, 0);
      return { day: days[d.getDay()], spent };
    });
  }, [state.transactions]);

  // ── Active goal ──────────────────────────────────────────────────────────
  const activeGoal = state.goals.find(g => !g.completed) ?? state.goals[0];
  const goalPct = activeGoal ? Math.min((activeGoal.current / activeGoal.target) * 100, 100) : 0;

  const avgDailyIncome = useMemo(() => {
    const incomeTx = state.transactions.filter(t => t.type === 'income');
    if (incomeTx.length === 0) return 5000;
    const days = new Set(incomeTx.map(t => t.date.toDateString())).size;
    const total = incomeTx.reduce((s, t) => s + t.amount, 0);
    return Math.round((total / Math.max(days, 1)) * 0.05 / 500) * 500;
  }, [state.transactions]);

  // ── NL-filtered transactions ─────────────────────────────────────────────
  const filteredTx = useMemo(() =>
    nlSearch(searchQuery, state.transactions).slice(0, searchQuery ? 20 : 5),
    [searchQuery, state.transactions]);

  // ── Swipe handlers ───────────────────────────────────────────────────────
  const onTxTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
  const onTxTouchEnd = (e: React.TouchEvent, tx: Transaction) => {
    const delta = e.changedTouches[0].clientX - touchStartRef.current;
    if (delta < -70) setSwipedId(tx.id);
    else if (delta > 70) { setEditingTx(tx); setSwipedId(null); }
    else if (Math.abs(delta) < 10) {
      if (swipedId === tx.id) setSwipedId(null);
      else setEditingTx(tx);
    }
  };

  const handleDeleteTx = (tx: Transaction) => {
    if (confirmDeleteId === tx.id) {
      if (confirmDeleteTimerRef.current) clearTimeout(confirmDeleteTimerRef.current);
      deleteTransaction(tx.id); setSwipedId(null); setConfirmDeleteId(null);
      if (navigator.vibrate) navigator.vibrate([30, 20, 50]);
    } else {
      setConfirmDeleteId(tx.id);
      if (confirmDeleteTimerRef.current) clearTimeout(confirmDeleteTimerRef.current);
      confirmDeleteTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };

  // ── Arc math for monthly progress ────────────────────────────────────────
  const arcR = 54;
  const arcCirc = 2 * Math.PI * arcR;
  const arcDash = (monthlyStats.pct / 100) * arcCirc * 0.75;
  const arcGap = arcCirc - arcDash;

  return (
    <div className="flex flex-col h-screen bg-emerald-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ══════════════ HOME VIEW ══════════════ */}
          {activeView === 'dashboard' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* ── Hero Header ── */}
              <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 px-5 pt-14 pb-28 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
                <div className="absolute top-24 -right-6 w-28 h-28 bg-teal-400/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-emerald-400/10 rounded-full" />

                {/* Top row: greeting + streak + notifs */}
                <div className="flex items-start justify-between mb-5 relative">
                  <div>
                    <p className="text-emerald-200 text-xs mb-0.5">{getGreeting(state.userType, lang)}</p>
                    <p className="text-white font-black" style={{ fontSize: '1.1rem' }}>PesaPlan</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {state.streak > 0 && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="flex items-center gap-1 bg-orange-400 px-2.5 py-1 rounded-full"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-xs font-black">{state.streak}</span>
                      </motion.div>
                    )}
                    <NotificationCenter />
                  </div>
                </div>

                {/* Balance */}
                <div className="text-center mb-4 relative">
                  <p className="text-emerald-200 text-xs mb-1">{t('totalBalance', lang)}</p>
                  <motion.p
                    key={animatedBalance}
                    className="text-white font-black tracking-tight"
                    style={{ fontSize: '2.8rem' }}
                  >
                    {fmt(animatedBalance)}
                  </motion.p>
                  <div className="flex justify-center gap-3 mt-1 text-xs text-emerald-200">
                    <span>💵 {fmtK(state.cashBalance)}</span>
                    <span>·</span>
                    <span>📱 {fmtK(state.mobileMoneyBalance)}</span>
                    {state.bankBalance > 0 && <><span>·</span><span>🏦 {fmtK(state.bankBalance)}</span></>}
                  </div>
                </div>

                {/* Period selector */}
                <div className="flex justify-center mb-4">
                  <div className="flex bg-black/20 rounded-2xl p-1 gap-1">
                    {(['today', 'week', 'month'] as Period[]).map(p => (
                      <motion.button
                        key={p} onClick={() => setPeriod(p)} whileTap={{ scale: 0.93 }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          period === p ? 'bg-white text-emerald-700 shadow' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {p === 'today' ? t('today', lang) : p === 'week' ? t('week', lang) : t('month', lang)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: t('income_label', lang), value: periodStats.income, color: 'text-emerald-200', sign: '+' },
                    { label: t('spent', lang), value: periodStats.expenses, color: 'text-red-300', sign: '-' },
                    { label: t('left', lang), value: Math.abs(periodStats.left), color: periodStats.left >= 0 ? 'text-white' : 'text-red-300', sign: periodStats.left >= 0 ? '' : '-' },
                  ].map(({ label, value, color, sign }) => (
                    <div key={label} className="bg-white/10 backdrop-blur rounded-2xl px-2 py-3 text-center">
                      <p className="text-emerald-200 text-xs mb-1">{label}</p>
                      <p className={`text-sm font-bold ${color} tabular-nums`}>{sign}{fmtK(value)}</p>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { setTxType('expense'); setShowAddTx(true); }}
                    className="bg-white/15 hover:bg-white/25 rounded-2xl p-3 flex flex-col items-center gap-1.5 transition"
                  >
                    <MinusCircle className="w-5 h-5 text-red-300" />
                    <span className="text-xs text-white font-semibold">{t('addExpense', lang)}</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { setTxType('income'); setShowAddTx(true); }}
                    className="bg-white/15 hover:bg-white/25 rounded-2xl p-3 flex flex-col items-center gap-1.5 transition"
                  >
                    <PlusCircle className="w-5 h-5 text-green-300" />
                    <span className="text-xs text-white font-semibold">{t('addIncome', lang)}</span>
                  </motion.button>
                  {/* Quick Add Expense */}
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { setTxType('expense'); setShowAddTx(true); }}
                    className="bg-white/15 hover:bg-white/25 rounded-2xl p-3 flex flex-col items-center gap-1.5 transition"
                  >
                    <Camera className="w-5 h-5 text-yellow-300" />
                    <span className="text-xs text-white font-semibold">
                      {lang === 'sw' ? 'Haraka' : 'Quick'}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* ══ CARDS AREA ══ */}
              <div className="-mt-16 px-4 space-y-4 pb-32">

                {/* ── SEARCH BAR ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className={`bg-white rounded-2xl shadow-md flex items-center gap-3 px-4 py-3 transition-all ${
                    searchFocused ? 'ring-2 ring-emerald-400 shadow-emerald-100' : ''
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder={lang === 'sw' ? 'Tafuta... "chakula wiki hii"' : 'Search... "coffee this week"'}
                    className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-300"
                  />
                  <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-2 py-1 shrink-0">
                    <Sparkles className="w-3 h-3" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>AI</span>
                  </div>
                </motion.div>

                {/* ── MONTHLY PROGRESS ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                  className="bg-white rounded-3xl shadow-md overflow-hidden"
                >
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">
                          {lang === 'sw' ? 'Muhtasari wa Mwezi' : 'Monthly Summary'}
                        </p>
                        <p className="font-black text-gray-900" style={{ fontSize: '1rem' }}>
                          {lang === 'sw' ? 'Matumizi dhidi ya Mapato' : 'Spending vs Income'}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowBudgetLimits(true)}
                        className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full"
                      >
                        {lang === 'sw' ? 'Mipaka' : 'Limits'}
                      </button>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* SVG Arc */}
                      <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
                        <svg width="132" height="132" viewBox="0 0 132 132">
                          {/* Track */}
                          <circle cx="66" cy="66" r={arcR} fill="none" stroke="#f0fdf4" strokeWidth="11"
                            strokeDasharray={`${arcCirc * 0.75} ${arcCirc * 0.25}`}
                            strokeDashoffset={arcCirc * 0.125}
                            strokeLinecap="round"
                          />
                          {/* Fill */}
                          <motion.circle
                            cx="66" cy="66" r={arcR} fill="none"
                            stroke={monthlyStats.pct >= 90 ? '#ef4444' : monthlyStats.pct >= 75 ? '#f97316' : '#10b981'}
                            strokeWidth="11"
                            strokeDasharray={`${arcDash} ${arcGap + arcCirc * 0.25}`}
                            strokeDashoffset={arcCirc * 0.125}
                            strokeLinecap="round"
                            initial={{ strokeDasharray: `0 ${arcCirc}` }}
                            animate={{ strokeDasharray: `${arcDash} ${arcGap + arcCirc * 0.25}` }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className={`font-black tabular-nums ${monthlyStats.pct >= 90 ? 'text-red-500' : monthlyStats.pct >= 75 ? 'text-orange-500' : 'text-emerald-600'}`}
                            style={{ fontSize: '1.4rem' }}>
                            {Math.round(monthlyStats.pct)}%
                          </p>
                          <p className="text-gray-400" style={{ fontSize: '0.65rem' }}>
                            {lang === 'sw' ? 'Imetumika' : 'used'}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{lang === 'sw' ? 'Imetumika' : 'Spent'}</span>
                            <span className="font-semibold text-gray-700">{fmtK(monthlyStats.expenses)}</span>
                          </div>
                          <div className="h-2 bg-emerald-50 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${monthlyStats.pct >= 90 ? 'bg-red-500' : monthlyStats.pct >= 75 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${monthlyStats.pct}%` }}
                              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{lang === 'sw' ? 'Mapato' : 'Income'}</span>
                          <span className="font-semibold text-emerald-600">+{fmtK(monthlyStats.income)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{lang === 'sw' ? 'Imebaki' : 'Left'}</span>
                          <span className={`font-semibold ${monthlyStats.income - monthlyStats.expenses >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                            {fmtK(Math.abs(monthlyStats.income - monthlyStats.expenses))}
                          </span>
                        </div>
                        <div className={`rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
                          monthlyStats.onTrack ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {monthlyStats.onTrack ? '✅' : '⚠️'}
                          {monthlyStats.onTrack
                            ? (lang === 'sw' ? 'Uko kwenye njia nzuri' : 'On track this month')
                            : (lang === 'sw' ? 'Kasi ya matumizi ni nyingi' : 'Spending above pace')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7-day sparkline */}
                  <div className="px-5 pb-4">
                    <p className="text-xs text-gray-400 mb-2">{lang === 'sw' ? 'Mwenendo wa siku 7' : '7-day spending trend'}</p>
                    <ResponsiveContainer width="100%" height={56}>
                      <AreaChart data={trendData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(v: number) => [fmtK(v), lang === 'sw' ? 'Imetumika' : 'Spent']}
                        />
                        <Area type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={2} fill="url(#trendGrad)" dot={{ r: 3, fill: '#10b981' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* ── BUDGET ALERTS ── */}
                {budgetAlerts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-md overflow-hidden"
                  >
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center">
                          <Bell className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <p className="font-bold text-gray-900 text-sm">
                          {lang === 'sw' ? 'Arifa za Bajeti' : 'Budget Alerts'}
                        </p>
                      </div>
                      <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                        {budgetAlerts.length}
                      </span>
                    </div>
                    <div className="px-5 pb-4 space-y-2.5">
                      {budgetAlerts.slice(0, 3).map(alert => (
                        <div key={alert.cat} className={`rounded-2xl px-3.5 py-3 flex items-center gap-3 ${
                          alert.pct >= 100 ? 'bg-red-50 border border-red-100' : 'bg-orange-50 border border-orange-100'
                        }`}>
                          <AlertTriangle className={`w-4 h-4 shrink-0 ${alert.pct >= 100 ? 'text-red-500' : 'text-orange-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-semibold text-gray-800 truncate">{alert.cat}</span>
                              <span className={`text-xs font-black ml-2 ${alert.pct >= 100 ? 'text-red-600' : 'text-orange-600'}`}>{alert.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-white rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${alert.pct >= 100 ? 'bg-red-500' : 'bg-orange-400'}`}
                                style={{ width: `${Math.min(alert.pct, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {fmt(alert.spent)} / {fmt(alert.budget)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── CATEGORY PIE CHART ── */}
                {pieData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                    className="bg-white rounded-3xl shadow-md overflow-hidden"
                  >
                    <div className="px-5 pt-5 pb-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">
                          {lang === 'sw' ? 'Mgawanyo wa Matumizi' : 'Spending Breakdown'}
                        </p>
                        <p className="font-black text-gray-900" style={{ fontSize: '1rem' }}>
                          {lang === 'sw' ? 'Kwa Jamii' : 'By Category'}
                        </p>
                      </div>
                      <button onClick={() => setActiveView('insights')} className="text-xs text-emerald-600 flex items-center gap-0.5">
                        {t('view', lang)}<ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 px-2 pb-4">
                      {/* Pie */}
                      <div style={{ width: 140, height: 140 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%" cy="50%"
                              innerRadius={36} outerRadius={58}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {pieData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ fontSize: 11, borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              formatter={(v: number) => [fmt(v)]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend */}
                      <div className="flex-1 space-y-2 pr-2">
                        {pieData.map((d, i) => {
                          const total = pieData.reduce((s, x) => s + x.value, 0);
                          const pct = Math.round((d.value / total) * 100);
                          return (
                            <div key={d.name} className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-xs text-gray-600 truncate flex-1">{d.name}</span>
                              <span className="text-xs font-bold text-gray-700 tabular-nums">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── ACTIVE GOAL ── */}
                {activeGoal && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                    className="bg-white rounded-3xl shadow-md overflow-hidden"
                  >
                    <div className="px-5 pt-4 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center">
                            <Target className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="font-bold text-gray-900 text-sm truncate max-w-[160px]">{activeGoal.title}</span>
                          {activeGoal.completed && <span>🎉</span>}
                        </div>
                        <button onClick={() => setActiveView('goals')} className="text-xs text-purple-600 flex items-center gap-0.5">
                          {t('view', lang)}<ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="h-2.5 bg-purple-50 rounded-full overflow-hidden mb-1.5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${goalPct}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{fmt(activeGoal.current)}</span>
                        <span className="font-bold text-purple-600">{goalPct.toFixed(0)}%</span>
                        <span>{fmt(activeGoal.target)}</span>
                      </div>
                      {!activeGoal.completed && (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowGoalContribute(true)}
                          className="w-full mt-3 bg-purple-600 text-white rounded-2xl py-3 text-sm font-bold"
                        >
                          + {t('contributeNow', lang)}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── RECENT TRANSACTIONS ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                  className="bg-white rounded-3xl shadow-md overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 pt-4 pb-3">
                    <p className="font-black text-gray-900" style={{ fontSize: '1rem' }}>
                      {searchQuery
                        ? (lang === 'sw' ? `Matokeo ya "${searchQuery}"` : `Results for "${searchQuery}"`)
                        : t('recentTransactions', lang)}
                    </p>
                    {!searchQuery && state.transactions.length > 5 && (
                      <button onClick={() => setActiveView('history')} className="text-xs text-emerald-600 flex items-center gap-0.5">
                        {t('all', lang)}<ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {filteredTx.length === 0 ? (
                    <div className="px-5 pb-6 text-center">
                      <p className="text-sm text-gray-300">
                        {searchQuery
                          ? (lang === 'sw' ? 'Hakuna matokeo' : 'No results found')
                          : t('noTransactions', lang)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-300 text-center pb-1">{t('swipeHint', lang)}</p>
                      {filteredTx.map((tx, idx) => (
                        <div key={tx.id} className="relative overflow-hidden">
                          <AnimatePresence>
                            {swipedId === tx.id && (
                              <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute right-0 top-0 h-full flex"
                              >
                                <button
                                  onClick={() => handleDeleteTx(tx)}
                                  aria-label={confirmDeleteId === tx.id ? 'Confirm delete' : 'Delete transaction'}
                                  className={`text-white px-5 h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                    confirmDeleteId === tx.id ? 'bg-red-700' : 'bg-red-500'
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-xs font-semibold">
                                    {confirmDeleteId === tx.id ? (lang === 'sw' ? 'Thibitisha?' : 'Confirm?') : t('delete', lang)}
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
                            onTouchStart={e => onTxTouchStart(e)}
                            onTouchEnd={e => onTxTouchEnd(e, tx)}
                            onClick={() => { if (swipedId === tx.id) setSwipedId(null); else setEditingTx(tx); }}
                            className={`flex items-center justify-between px-5 py-3.5 bg-white cursor-pointer hover:bg-gray-50 transition ${
                              idx < filteredTx.length - 1 ? 'border-b border-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                                tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                              }`}>
                                {getCategoryIcon(tx.category)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{tx.category}</p>
                                <p className="text-xs text-gray-400">
                                  {tx.source.toUpperCase()}{tx.notes ? ` · ${tx.notes}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
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

                {/* ── AI INSIGHT BANNER ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                  className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl shadow-md p-5 text-white relative overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full" />
                  <div className="flex items-start gap-3 relative">
                    <div className="w-9 h-9 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-4.5 h-4.5 text-yellow-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-sm">PesaPlan AI</p>
                        <span className="bg-yellow-400 text-yellow-900 rounded-full px-1.5 py-0.5 font-bold" style={{ fontSize: '0.6rem' }}>AI</span>
                      </div>
                      <p className="text-emerald-100 leading-relaxed" style={{ fontSize: '0.82rem' }}>
                        {state.transactions.length === 0
                          ? (lang === 'sw' ? 'Karibu! Anza kurekodi matumizi yako leo kwa kubonyeza "Matumizi" hapo juu.' : 'Welcome! Start tracking your spending by tapping "Expense" above.')
                          : periodStats.expenses > periodStats.income && periodStats.income > 0
                            ? (lang === 'sw' ? `⚠️ Unatumia zaidi ya unavyopata. Pata mapato zaidi au punguza matumizi ya ${pieData[0]?.name ?? 'chakula'}.` : `⚠️ Spending exceeds income. Try reducing ${pieData[0]?.name ?? 'food'} expenses.`)
                            : (lang === 'sw' ? `👍 Umeokolewa ${fmtK(Math.max(periodStats.left, 0))} wiki hii. Endelea hivyo!` : `👍 You've saved ${fmtK(Math.max(periodStats.left, 0))} so far. Keep it up!`)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('pesaplan:open-ai'))}
                    className="mt-3 w-full bg-white/15 hover:bg-white/25 rounded-2xl py-2.5 text-sm font-semibold transition text-center"
                  >
                    {lang === 'sw' ? 'Uliza Msaidizi zaidi →' : 'Ask Assistant more →'}
                  </button>
                </motion.div>

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
        className="bg-white border-t border-gray-100 grid grid-cols-5 shadow-xl z-30 shrink-0 safe-area-bottom-nav"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map(({ id, icon: Icon, sw, en }) => {
          const active = activeView === id;
          return (
            <motion.button
              key={id}
              role="tab"
              aria-selected={active}
              aria-label={lang === 'sw' ? sw : en}
              onClick={() => { setActiveView(id); if (navigator.vibrate) navigator.vibrate(8); }}
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center justify-center py-3 relative"
            >
              {active && (
                <motion.div
                  layoutId="navPill"
                  className="absolute inset-x-3 top-0 h-0.5 bg-emerald-500 rounded-full"
                />
              )}
              <div className={`w-9 h-9 flex items-center justify-center rounded-2xl mb-0.5 transition-all ${active ? 'bg-emerald-50' : ''}`}>
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
              </div>
              <span className={`text-xs font-semibold transition-colors ${active ? 'text-emerald-700' : 'text-gray-400'}`}
                style={{ fontSize: '0.65rem' }}>
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
      {showBudgetLimits && <BudgetLimitsSheet onClose={() => setShowBudgetLimits(false)} />}

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
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">{t('contributeToGoal', lang)}</h2>
        <p className="text-xs text-gray-500 mb-1">{goal.title}</p>
        <p className="text-xs text-purple-600 font-medium mb-4">
          {lang === 'sw' ? `Imebaki: ${fmt(remaining)}` : `Remaining: ${fmt(remaining)}`}
        </p>
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
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                amount === a.toString() ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {fmt(a)}
            </button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { const n = parseFloat(amount); if (n > 0) onContribute(n); }}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full bg-purple-600 disabled:opacity-40 text-white rounded-2xl py-4 font-black transition"
        >
          {lang === 'sw' ? 'Weka Akiba' : 'Save Now'}
        </motion.button>
      </motion.div>
    </>
  );
}
