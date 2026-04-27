import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Check } from 'lucide-react';
import { useApp, type Transaction, type PaymentSource } from '@/app/App';
import { t } from '@/app/utils/translations';
import { toast } from 'sonner';
import { REGION_CONFIG } from '@/app/utils/currency';

interface EditTransactionDialogProps {
  transaction: Transaction;
  onClose: () => void;
}

const EXPENSE_CATEGORIES = {
  sw: ['Chakula', 'Usafiri', 'Kodi', 'Malipo', 'Data na Muda', 'Biashara', 'Afya', 'Burudani'],
  en: ['Food', 'Transport', 'Rent', 'Bills', 'Data & Airtime', 'Business', 'Health', 'Entertainment'],
};
const INCOME_CATEGORIES = {
  sw: ['Biashara', 'Nyingine'],
  en: ['Business', 'Other'],
};

const SOURCES: PaymentSource[] = ['cash', 'mpesa', 'airtel', 'tigo', 'bank'];
const SOURCE_LABELS: Record<string, { sw: string; en: string }> = {
  cash: { sw: 'Taslimu', en: 'Cash' },
  mpesa: { sw: 'M-Pesa', en: 'M-Pesa' },
  airtel: { sw: 'Airtel', en: 'Airtel' },
  tigo: { sw: 'Tigo', en: 'Tigo' },
  bank: { sw: 'Benki', en: 'Bank' },
};

export function EditTransactionDialog({ transaction, onClose }: EditTransactionDialogProps) {
  const { state, editTransaction, deleteTransaction } = useApp();
  const lang = state.language;
  const symbol = REGION_CONFIG[state.region].symbol;

  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [source, setSource] = useState<PaymentSource>(transaction.source);
  const [notes, setNotes] = useState(transaction.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const cats = transaction.type === 'expense' ? EXPENSE_CATEGORIES[lang] : INCOME_CATEGORIES[lang];

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error(lang === 'sw' ? 'Kiasi lazima iwe zaidi ya sifuri' : 'Amount must be greater than zero');
      return;
    }
    editTransaction(transaction.id, { amount: parsedAmount, category, source, notes });
    toast.success(lang === 'sw' ? 'Muamala umesasishwa ✓' : 'Transaction updated ✓');
    onClose();
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    toast.success(lang === 'sw' ? 'Muamala umefutwa' : 'Transaction deleted');
    onClose();
  };

  const isExpense = transaction.type === 'expense';
  const accentColor = isExpense ? 'border-red-500 bg-red-50' : 'border-emerald-500 bg-emerald-50';
  const btnColor = isExpense ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {lang === 'sw' ? 'Hariri Muamala' : 'Edit Transaction'}
              </h2>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${isExpense ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isExpense ? (lang === 'sw' ? 'Matumizi' : 'Expense') : (lang === 'sw' ? 'Mapato' : 'Income')}
              </span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-5">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {t('amount', lang)}
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-emerald-500 transition">
                <span className="px-4 text-sm text-gray-400 font-medium">{symbol}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 py-3.5 pr-4 text-xl font-bold text-gray-900 outline-none bg-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {t('category', lang)}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {cats.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2.5 px-2 rounded-xl border-2 text-xs font-medium transition ${
                      category === cat
                        ? `${isExpense ? 'border-red-500 bg-red-50 text-red-800' : 'border-emerald-500 bg-emerald-50 text-emerald-800'}`
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {t('paymentSource', lang)}
              </label>
              <div className="flex gap-2 flex-wrap">
                {SOURCES.map(src => (
                  <button
                    key={src}
                    onClick={() => setSource(src)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition ${
                      source === src
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {SOURCE_LABELS[src][lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {t('notes', lang)}
              </label>
              <textarea
                rows={2}
                placeholder={lang === 'sw' ? 'Maelezo ya ziada...' : 'Additional notes...'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-4">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                {lang === 'sw' ? 'Futa' : 'Delete'}
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition ${btnColor}`}
              >
                <Check className="w-4 h-4" />
                {lang === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center px-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🗑️</div>
              <h3 className="text-lg font-bold text-gray-900">
                {lang === 'sw' ? 'Futa Muamala?' : 'Delete Transaction?'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {lang === 'sw' ? 'Hii haitaweza kutenduliwa' : 'This cannot be undone'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 font-medium"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 rounded-2xl text-white font-bold"
              >
                {lang === 'sw' ? 'Ndio, Futa' : 'Yes, Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
