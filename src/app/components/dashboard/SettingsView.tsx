import { motion } from 'motion/react';
import { ArrowLeft, Globe, DollarSign, Calendar, Upload, Download, Trash2 } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { state, setLanguage } = useApp();
  const lang = state.language;

  const settingsItems = [
    {
      icon: Globe,
      label: t('language', lang),
      value: lang === 'sw' ? 'Kiswahili' : 'English',
      action: () => setLanguage(lang === 'sw' ? 'en' : 'sw'),
    },
    {
      icon: DollarSign,
      label: t('currency', lang),
      value: 'TZS',
      action: () => {},
    },
    {
      icon: Calendar,
      label: t('incomeFrequency', lang),
      value: state.incomeFrequency || 'Not set',
      action: () => {},
    },
  ];

  const actionItems = [
    {
      icon: Upload,
      label: t('backup', lang),
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      action: () => alert(lang === 'sw' ? 'Kazi inakuja hivi karibuni' : 'Coming soon'),
    },
    {
      icon: Download,
      label: t('exportHistory', lang),
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      action: () => alert(lang === 'sw' ? 'Kazi inakuja hivi karibuni' : 'Coming soon'),
    },
    {
      icon: Trash2,
      label: t('deleteData', lang),
      color: 'text-red-600',
      bg: 'bg-red-100',
      action: () => {
        if (confirm(lang === 'sw' ? 'Je, una uhakika? Hii haitaweza kutenduliwa.' : 'Are you sure? This cannot be undone.')) {
          // Would delete data here
        }
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6 pt-8 pb-6">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('settings', lang)}</h1>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-6 py-6 space-y-6">
        {/* General Settings */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-2">
            {lang === 'sw' ? 'Jumla' : 'General'}
          </h2>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {settingsItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={item.action}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition ${
                  index < settingsItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{item.value}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-2">
            {lang === 'sw' ? 'Vitendo' : 'Actions'}
          </h2>
          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={item.action}
                className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition"
                whileTap={{ scale: 0.98 }}
              >
                <div className={`${item.bg} p-2 rounded-full`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-gray-900">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>BudgetEase v1.0.0</p>
          <p className="mt-1">{lang === 'sw' ? 'Imetengenezwa kwa East Africa' : 'Made for East Africa'}</p>
        </div>
      </div>
    </div>
  );
}