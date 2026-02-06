import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useApp, type TransactionType, type PaymentSource } from '@/app/App';
import { t } from '@/app/utils/translations';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';

interface AddTransactionDialogProps {
  type: TransactionType;
  onClose: () => void;
}

export function AddTransactionDialog({ type, onClose }: AddTransactionDialogProps) {
  const { state, addTransaction } = useApp();
  const lang = state.language;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState<PaymentSource>('cash');
  const [notes, setNotes] = useState('');

  const categories = type === 'expense'
    ? ['chakula', 'transport', 'rent', 'billsCategory', 'dataCategory', 'biasharaCosts', 'health', 'entertainment']
    : ['biasharaCosts', 'other'];

  const sources: PaymentSource[] = ['cash', 'mpesa', 'airtel', 'tigo', 'bank'];

  const handleSubmit = () => {
    if (!amount || !category) {
      toast.error(lang === 'sw' ? 'Jaza taarifa zote' : 'Please fill all fields');
      return;
    }

    addTransaction({
      type,
      amount: parseFloat(amount),
      category: t(category as keyof typeof import('@/app/utils/translations').translations, lang),
      source,
      notes,
    });

    toast.success(
      type === 'expense'
        ? lang === 'sw' ? 'Matumizi yameongezwa!' : 'Expense added!'
        : lang === 'sw' ? 'Mapato yameongezwa!' : 'Income added!'
    );

    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {type === 'expense' ? t('addExpense', lang) : t('addIncome', lang)}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('amount', lang)} (TZS)
            </label>
            <Input
              type="number"
              placeholder="10,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700">
              {t('category', lang)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    category === cat
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-sm font-medium">
                    {t(cat as keyof typeof import('@/app/utils/translations').translations, lang)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Source */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700">
              {t('paymentSource', lang)}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sources.map((src) => (
                <button
                  key={src}
                  onClick={() => setSource(src)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    source === src
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-sm font-medium">
                    {t(src as keyof typeof import('@/app/utils/translations').translations, lang)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('notes', lang)}
            </label>
            <Textarea
              placeholder={lang === 'sw' ? 'Andika maelezo...' : 'Add notes...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {t('cancel', lang)}
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {t('save', lang)}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}