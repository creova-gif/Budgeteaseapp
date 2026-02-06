import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Lightbulb, PieChart } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface InsightsViewProps {
  onBack: () => void;
}

export function InsightsView({ onBack }: InsightsViewProps) {
  const { state, getCategorySpending } = useApp();
  const lang = state.language;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const categorySpending = getCategorySpending();
  const pieData = Object.entries(categorySpending).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Mock weekly data
  const weeklyData = [
    { day: lang === 'sw' ? 'Jum' : 'Mon', income: 45000, expenses: 32000 },
    { day: lang === 'sw' ? 'Jmt' : 'Tue', income: 52000, expenses: 28000 },
    { day: lang === 'sw' ? 'Jmn' : 'Wed', income: 38000, expenses: 41000 },
    { day: lang === 'sw' ? 'Alh' : 'Thu', income: 61000, expenses: 35000 },
    { day: lang === 'sw' ? 'Iju' : 'Fri', income: 55000, expenses: 48000 },
    { day: lang === 'sw' ? 'Jms' : 'Sat', income: 72000, expenses: 52000 },
    { day: lang === 'sw' ? 'Jpl' : 'Sun', income: 48000, expenses: 38000 },
  ];

  const insights = [
    {
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      title: lang === 'sw' ? 'Matumizi ya Usafiri' : 'Transport Spending',
      text: lang === 'sw'
        ? 'Umetumia 23% zaidi kwa usafiri wiki hii kuliko wiki iliyopita.'
        : 'You spent 23% more on transport this week compared to last week.',
    },
    {
      icon: Lightbulb,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      title: lang === 'sw' ? 'Mapendekezo ya Akiba' : 'Savings Tip',
      text: lang === 'sw'
        ? 'Jaribu kuhifadhi TSh 5,000 kila siku kwa siku 30 → TSh 150,000.'
        : 'Try saving TSh 5,000 daily for 30 days → TSh 150,000.',
    },
    {
      icon: Smartphone,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      title: lang === 'sw' ? 'Mipango ya Data' : 'Data Plans',
      text: lang === 'sw'
        ? 'Kwa data, fikiria kununua bundles wikendi — unaokoa zaidi!'
        : 'For data, consider buying bundles on weekends — you save more!',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-6 pt-8 pb-6">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('insights', lang)}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* AI Insights */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            {lang === 'sw' ? 'Maarifa ya AI' : 'AI Insights'}
          </h2>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`${insight.bg} p-2 rounded-full`}>
                    <insight.icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-600">{insight.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Trends */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            {lang === 'sw' ? 'Mwenendo wa Wiki' : 'Weekly Trends'}
          </h2>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="income" fill="#10b981" name={t('income', lang)} />
                <Bar dataKey="expenses" fill="#ef4444" name={t('expense', lang)} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        {pieData.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-900">
              {lang === 'sw' ? 'Mgawanyo wa Jamii' : 'Category Breakdown'}
            </h2>
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Smartphone({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}