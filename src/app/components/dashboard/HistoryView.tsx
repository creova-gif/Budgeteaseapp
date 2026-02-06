import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { format } from 'date-fns';

interface HistoryViewProps {
  onBack: () => void;
}

export function HistoryView({ onBack }: HistoryViewProps) {
  const { state } = useApp();
  const lang = state.language;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const groupedTransactions = state.transactions.reduce((acc, transaction) => {
    const dateKey = format(transaction.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, typeof state.transactions>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return lang === 'sw' ? 'Leo' : 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return lang === 'sw' ? 'Jana' : 'Yesterday';
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">{t('history', lang)}</h1>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Filter className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm opacity-90">
          {state.transactions.length} {lang === 'sw' ? 'miamala' : 'transactions'}
        </p>
      </div>

      {/* Transactions List */}
      <div className="px-6 py-6">
        {state.transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {lang === 'sw' ? 'Hakuna miamala bado' : 'No transactions yet'}
            </p>
          </div>
        ) : (
          sortedDates.map((dateKey, dateIndex) => (
            <div key={dateKey} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 px-2">
                {getDateLabel(dateKey)}
              </h3>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {groupedTransactions[dateKey].map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (dateIndex * 0.1) + (index * 0.05) }}
                    className={`flex items-center justify-between p-4 ${
                      index < groupedTransactions[dateKey].length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-emerald-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.category}</p>
                        <p className="text-xs text-gray-500">
                          {t(transaction.source as keyof typeof import('@/app/utils/translations').translations, lang)}
                          {transaction.notes && ` • ${transaction.notes}`}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}