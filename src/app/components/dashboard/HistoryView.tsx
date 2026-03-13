import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, TrendingUp, TrendingDown, Filter, X, Trash2 } from 'lucide-react';
import { useApp, type PaymentSource, type Transaction } from '@/app/App';
import { t } from '@/app/utils/translations';
import { getCategoryIcon } from '@/app/utils/categoryIcons';
import { format } from 'date-fns';

interface HistoryViewProps {
  onBack: () => void;
  onEditTransaction?: (tx: Transaction) => void;
}

type FilterType = 'all' | 'income' | 'expense';
type FilterSource = PaymentSource | 'all';

const PAGE_SIZE = 25;

export function HistoryView({ onBack, onEditTransaction }: HistoryViewProps) {
  const { state, deleteTransaction } = useApp();
  const lang = state.language;
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartRef = useRef<number>(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);

  const filteredTransactions = state.transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterSource !== 'all' && tx.source !== filterSource) return false;
    return true;
  });

  const isFiltered = filterType !== 'all' || filterSource !== 'all';

  // Paginate before grouping
  const paginatedTransactions = filteredTransactions.slice(0, visibleCount);

  const groupedTransactions = paginatedTransactions.reduce((acc, transaction) => {
    const dateKey = format(transaction.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, typeof filteredTransactions>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
      return lang === 'sw' ? 'Leo' : 'Today';
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd'))
      return lang === 'sw' ? 'Jana' : 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const typeOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: lang === 'sw' ? 'Zote' : 'All' },
    { value: 'income', label: lang === 'sw' ? 'Mapato' : 'Income' },
    { value: 'expense', label: lang === 'sw' ? 'Matumizi' : 'Expenses' },
  ];

  const sourceOptions: { value: FilterSource; label: string }[] = [
    { value: 'all', label: lang === 'sw' ? 'Zote' : 'All' },
    { value: 'cash', label: lang === 'sw' ? 'Taslimu' : 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'airtel', label: 'Airtel' },
    { value: 'tigo', label: 'Tigo' },
    { value: 'bank', label: lang === 'sw' ? 'Benki' : 'Bank' },
  ];

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartRef.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent, tx: Transaction) => {
    const delta = e.changedTouches[0].clientX - touchStartRef.current;
    if (delta < -70) {
      setSwipedId(tx.id);
    } else if (delta > 70) {
      onEditTransaction?.(tx);
      setSwipedId(null);
    } else if (Math.abs(delta) < 10) {
      if (swipedId === tx.id) setSwipedId(null);
      else onEditTransaction?.(tx);
    }
  };

  // 2-tap delete confirmation — prevents accidental deletes (consistent with Dashboard)
  const handleDeleteTx = (txId: string) => {
    if (confirmDeleteId === txId) {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      deleteTransaction(txId);
      setSwipedId(null);
      setConfirmDeleteId(null);
      if (navigator.vibrate) navigator.vibrate([30, 20, 50]);
    } else {
      setConfirmDeleteId(txId);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };

  // Daily totals for date header
  const getDayTotals = (txs: Transaction[]) => {
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white px-6 pb-6 min-safe-top">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">{t('history', lang)}</h1>
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${
              isFiltered ? 'bg-white text-orange-700' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{t('filter', lang)}</span>
            {isFiltered && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
          </button>
        </div>
        <p className="text-sm opacity-80 ml-14">
          {filteredTransactions.length} {lang === 'sw' ? 'miamala' : 'transactions'}
          {isFiltered && ` (${lang === 'sw' ? 'imechujwa' : 'filtered'})`}
        </p>
      </div>

      {/* Swipe hint */}
      {filteredTransactions.length > 0 && (
        <p className="text-xs text-gray-400 text-center py-2 bg-white border-b border-gray-100">
          {lang === 'sw' ? '← Buruta kufuta · Buruta → kuhariri' : '← Swipe to delete · Swipe → to edit'}
        </p>
      )}

      <div className="px-4 py-4">
        {filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-10 shadow-md text-center mt-4"
          >
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 font-medium">
              {isFiltered
                ? (lang === 'sw' ? 'Hakuna miamala inayolingana na kichujio' : 'No transactions match the filter')
                : (lang === 'sw' ? 'Bado hakuna miamala' : 'No transactions yet')}
            </p>
            {isFiltered && (
              <button
                onClick={() => { setFilterType('all'); setFilterSource('all'); }}
                className="mt-3 text-sm text-orange-600 font-medium"
              >
                {lang === 'sw' ? 'Futa kichujio' : 'Clear filter'}
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((dateKey, dateIndex) => {
              const txs = groupedTransactions[dateKey];
              const { income, expense } = getDayTotals(txs);
              return (
                <div key={dateKey}>
                  {/* Date header with daily totals */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-sm font-bold text-gray-700">{getDateLabel(dateKey)}</span>
                    <div className="flex items-center gap-2 text-xs">
                      {income > 0 && <span className="text-emerald-600 font-semibold">+{formatCurrency(income)}</span>}
                      {expense > 0 && <span className="text-red-500 font-semibold">-{formatCurrency(expense)}</span>}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    {txs.map((transaction, index) => (
                      <div key={transaction.id} className="relative overflow-hidden">
                        {/* Swipe-revealed action buttons */}
                        <AnimatePresence>
                          {swipedId === transaction.id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute right-0 top-0 h-full flex"
                            >
                              <button
                                onClick={() => handleDeleteTx(transaction.id)}
                                aria-label={confirmDeleteId === transaction.id
                                  ? (lang === 'sw' ? 'Thibitisha ufutaji' : 'Confirm delete')
                                  : (lang === 'sw' ? 'Futa muamala' : 'Delete transaction')}
                                className={`text-white px-5 h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                  confirmDeleteId === transaction.id ? 'bg-red-700' : 'bg-red-500'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-semibold">
                                  {confirmDeleteId === transaction.id
                                    ? (lang === 'sw' ? 'Thibitisha?' : 'Confirm?')
                                    : (lang === 'sw' ? 'Futa' : 'Delete')}
                                </span>
                              </button>
                              <button
                                onClick={() => { onEditTransaction?.(transaction); setSwipedId(null); }}
                                className="bg-blue-500 text-white px-4 h-full flex flex-col items-center justify-center gap-0.5"
                              >
                                <span className="text-lg leading-none">✏️</span>
                                <span className="text-xs font-semibold">{lang === 'sw' ? 'Hariri' : 'Edit'}</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div
                          animate={{ x: swipedId === transaction.id ? -116 : 0 }}
                          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                          onTouchStart={e => onTouchStart(e, transaction.id)}
                          onTouchEnd={e => onTouchEnd(e, transaction)}
                          initial={{ opacity: 0, x: -20 }}
                          className={`flex items-center justify-between p-4 bg-white ${
                            index < txs.length - 1 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          {/* Category icon */}
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                              transaction.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                            }`}>
                              <span>{getCategoryIcon(transaction.category)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{transaction.category}</p>
                              <p className="text-xs text-gray-400">
                                {transaction.source.toUpperCase()}
                                {transaction.notes ? ` · ${transaction.notes}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <p className={`font-bold text-sm ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-300">{format(transaction.date, 'HH:mm')}</p>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* ── Load More (Pagination) ── */}
            {filteredTransactions.length > visibleCount && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="w-full py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-600 transition shadow-sm"
              >
                {lang === 'sw'
                  ? `Pakia zaidi (${filteredTransactions.length - visibleCount} zimebaki)`
                  : `Load more (${filteredTransactions.length - visibleCount} remaining)`}
              </motion.button>
            )}

            {/* ── End of list ── */}
            {filteredTransactions.length <= visibleCount && filteredTransactions.length > 0 && (
              <p className="text-center text-xs text-gray-300 py-2">
                {lang === 'sw' ? '— Mwisho wa historia —' : '— End of history —'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Filter Sheet ── */}
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFilter(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">{t('filter', lang)}</h3>
                <button onClick={() => setShowFilter(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Type filter */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('type', lang)}</p>
                <div className="flex gap-2">
                  {typeOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterType(opt.value)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                        filterType === opt.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source filter */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('source', lang)}</p>
                <div className="flex gap-2 flex-wrap">
                  {sourceOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterSource(opt.value)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition ${
                        filterSource === opt.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setFilterType('all'); setFilterSource('all'); }}
                  className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-600 font-medium text-sm"
                >
                  {lang === 'sw' ? 'Futa Kichujio' : 'Clear All'}
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="flex-1 py-3.5 bg-orange-500 rounded-2xl text-white font-bold text-sm"
                >
                  {lang === 'sw' ? 'Tazama Matokeo' : 'Show Results'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}