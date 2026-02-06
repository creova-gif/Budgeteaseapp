import { motion } from 'motion/react';
import { BookOpen, Clock } from 'lucide-react';
import { useApp } from '@/app/App';

interface LearningCardProps {
  title: string;
  content: string;
  readTime: number;
  category: string;
}

export function LearningCard({ title, content, readTime, category }: LearningCardProps) {
  const { state } = useApp();
  const lang = state.language;

  return (
    <motion.div
      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition cursor-pointer"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="bg-emerald-100 p-2 rounded-full">
          <BookOpen className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{readTime} {lang === 'sw' ? 'dak' : 'min'}</span>
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{content}</p>
      <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
        {category}
      </div>
    </motion.div>
  );
}

export const learningContent = {
  sw: [
    {
      title: 'Jinsi ya kuweka bajeti',
      content: 'Bajeti ni mpango wa jinsi ya kutumia pesa zako. Anza kwa kuandika mapato yako yote na matumizi yako ya lazima. Kisha, weka akiba kwa malengo yako.',
      readTime: 1,
      category: 'Msingi',
    },
    {
      title: 'Njia bora za M-Pesa',
      content: 'Tumia M-Pesa kwa usalama. Hakikisha unaweka PIN yako fiche, angalia kila muamala kabla ya kuthibitisha, na hifadhi maandishi yako yote.',
      readTime: 1,
      category: 'Pesa za Simu',
    },
    {
      title: 'Tabia za kuhifadhi salama',
      content: 'Anza kidogo. Weka akiba ya TSh 1,000 kila siku - baada ya mwezi utakuwa na TSh 30,000! Fanya kuhifadhi kuwe tabia, si mchezo wa bahati.',
      readTime: 1,
      category: 'Akiba',
    },
  ],
  en: [
    {
      title: 'How to set a budget',
      content: 'A budget is a plan for your money. Start by writing down all your income and essential expenses. Then, allocate savings for your goals.',
      readTime: 1,
      category: 'Basics',
    },
    {
      title: 'Mobile money best practices',
      content: 'Use M-Pesa safely. Always keep your PIN private, verify every transaction before confirming, and save all your receipts.',
      readTime: 1,
      category: 'Mobile Money',
    },
    {
      title: 'Safe saving habits',
      content: 'Start small. Save TSh 1,000 daily - after a month you\'ll have TSh 30,000! Make saving a habit, not a game of chance.',
      readTime: 1,
      category: 'Savings',
    },
  ],
};