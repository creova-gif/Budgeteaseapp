import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Globe, DollarSign, Calendar, Download, Trash2, AlertTriangle, X, CheckCircle, Shield, Rocket, Lock, Unlock, BarChart2 } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { REGION_CONFIG } from '@/app/utils/currency';
import { SmartBudgetBuilder } from './SmartBudgetBuilder';
import { LegalView } from './LegalView';
import { AppStoreReadiness } from './AppStoreReadiness';
import { AppStoreListing } from './AppStoreListing';
import { CrashMonitor } from './CrashMonitor';
import { AppIconPreview } from './AppIconPreview';
import { AppLockSetup } from './AppLock';
import { Analytics } from '@/app/utils/analytics';

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { state, setLanguage, setRegion, clearAllData, setAppLockPin, disableAppLock } = useApp();
  const lang = state.language;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showLockSetup, setShowLockSetup] = useState(false);
  const [showDisableLockConfirm, setShowDisableLockConfirm] = useState(false);

  const handleExportCSV = () => {
    if (state.transactions.length === 0) return;
    Analytics.logEvent('data_exported', { count: state.transactions.length });

    const regionCfg = REGION_CONFIG[state.region];
    const headers = ['Date', 'Time', 'Type', 'Category', `Amount (${regionCfg.currency})`, 'Source', 'Notes'];
    const rows = state.transactions.map(tx => [
      tx.date.toLocaleDateString(regionCfg.locale),
      tx.date.toLocaleTimeString(regionCfg.locale, { hour: '2-digit', minute: '2-digit' }),
      tx.type,
      tx.category,
      tx.amount.toString(),
      tx.source,
      (tx.notes || '').replace(/"/g, '""'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `pesaplan_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  const handleDeleteData = () => {
    Analytics.logEvent('data_deleted');
    clearAllData();
    setShowDeleteConfirm(false);
    // App will re-render showing onboarding since onboardingComplete is reset
  };

  const settingsItems = [
    {
      icon: Globe,
      label: t('language', lang),
      value: lang === 'sw' ? 'Kiswahili' : 'English',
      action: () => setLanguage(lang === 'sw' ? 'en' : 'sw'),
      badge: null,
    },
    {
      icon: DollarSign,
      label: lang === 'sw' ? 'Nchi / Sarafu' : 'Country / Currency',
      value: `${REGION_CONFIG[state.region].flag} ${REGION_CONFIG[state.region].currency}`,
      action: () => {
        const order = ['TZ', 'KE', 'UG', 'RW', 'BI'] as const;
        const next = order[(order.indexOf(state.region) + 1) % order.length];
        setRegion(next);
      },
      badge: null,
    },
    {
      icon: Calendar,
      label: t('incomeFrequency', lang),
      value: state.incomeFrequency
        ? { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', irregular: 'Irregular' }[state.incomeFrequency]
        : (lang === 'sw' ? 'Haijawekwa' : 'Not set'),
      action: () => {},
      badge: null,
    },
    {
      icon: Shield,
      label: lang === 'sw' ? 'Kisheria & Faragha' : 'Legal & Privacy',
      value: lang === 'sw' ? 'Sera · Masharti' : 'Policy · Terms',
      action: () => setShowLegal(true),
      badge: null,
    },
  ];

  const profileData = [
    {
      label: lang === 'sw' ? 'Jumla ya Miamala' : 'Total Transactions',
      value: state.transactions.length.toString(),
    },
    {
      label: lang === 'sw' ? 'Malengo' : 'Goals',
      value: state.goals.length.toString(),
    },
    {
      label: lang === 'sw' ? 'Siku Mfululizo' : 'Day Streak',
      value: `🔥 ${state.streak}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6 pb-6 min-safe-top">
        <div className="flex items-center mb-2">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('settings', lang)}</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Profile Stats */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            {lang === 'sw' ? 'Takwimu Zangu' : 'My Stats'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {profileData.map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* General Settings */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            {lang === 'sw' ? 'Mipangilio' : 'General'}
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
                  <div className="bg-gray-100 p-2 rounded-full">
                    <item.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{item.value}</span>
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Data Storage Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            {lang === 'sw'
              ? 'Data yako imehifadhiwa kwenye kifaa hiki peke yake. Hakuna akiba ya wingu. Hamisha CSV mara kwa mara ili kulinda data yako.'
              : 'Your data is stored on this device only. No cloud backup. Export CSV regularly to keep a safe copy.'}
          </p>
        </div>

        {/* Actions */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            {lang === 'sw' ? 'Vitendo' : 'Actions'}
          </h2>
          <div className="space-y-3">
            {/* Export CSV */}
            <motion.button
              onClick={handleExportCSV}
              disabled={state.transactions.length === 0}
              className={`w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition ${
                state.transactions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileTap={state.transactions.length > 0 ? { scale: 0.98 } : {}}
            >
              <div className={`p-2 rounded-full ${exportDone ? 'bg-emerald-100' : 'bg-emerald-100'}`}>
                {exportDone
                  ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                  : <Download className="w-5 h-5 text-emerald-600" />
                }
              </div>
              <div className="text-left">
                <span className="font-medium text-gray-900 block text-sm">
                  {exportDone
                    ? (lang === 'sw' ? 'Imepakuliwa!' : 'Downloaded!')
                    : t('exportHistory', lang)}
                </span>
                <span className="text-xs text-gray-500">
                  {state.transactions.length === 0
                    ? (lang === 'sw' ? 'Hakuna data ya kuhamisha' : 'No data to export')
                    : (lang === 'sw'
                        ? `${state.transactions.length} miamala → CSV`
                        : `${state.transactions.length} transactions → CSV`)}
                </span>
              </div>
            </motion.button>

            {/* Delete Data */}
            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition border border-red-100"
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <span className="font-medium text-red-700 block text-sm">{t('deleteData', lang)}</span>
                <span className="text-xs text-gray-500">
                  {lang === 'sw' ? 'Futa data zote na anza upya' : 'Erase all data and restart'}
                </span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* ── Smart Budget Builder (Roadmap Feature 4) ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            {lang === 'sw' ? '🤖 Muundaji wa Bajeti' : '🤖 Smart Budget Builder'}
          </h2>
          <SmartBudgetBuilder />
        </div>

        {/* ── Crash Monitor (Audit Item 19) ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            🔥 {lang === 'sw' ? 'Ufuatiliaji wa Hitilafu' : 'Crash Monitoring'}
          </h2>
          <CrashMonitor />
        </div>

        {/* ── App Store Readiness (Audit Item 20) ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            <Rocket className="inline w-3 h-3 mr-1" />
            {lang === 'sw' ? 'Utayari wa Uzinduzi' : 'Launch Readiness'}
          </h2>
          <AppStoreReadiness />
        </div>

        {/* ── App Store Listing Draft (Audit Item 19) ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            🏪 {lang === 'sw' ? 'Orodha ya Duka la Programu' : 'App Store Listing'}
          </h2>
          <AppStoreListing />
        </div>

        {/* ── App Icon Preview (Audit Item 19) ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            🎨 {lang === 'sw' ? 'Muundo wa Ikoni' : 'App Icon Design'}
          </h2>
          <AppIconPreview />
        </div>

        {/* ── Security (App Lock) ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            🔒 {lang === 'sw' ? 'Usalama' : 'Security'}
          </h2>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* App Lock toggle */}
            <motion.button
              onClick={() => {
                if (state.appLockEnabled) {
                  setShowDisableLockConfirm(true);
                } else {
                  setShowLockSetup(true);
                }
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition border-b border-gray-100"
              whileTap={{ scale: 0.98 }}
              aria-label={lang === 'sw' ? 'Dhibiti kufunga programu kwa PIN' : 'Toggle App PIN lock'}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${state.appLockEnabled ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  {state.appLockEnabled
                    ? <Lock className="w-4 h-4 text-emerald-600" />
                    : <Unlock className="w-4 h-4 text-gray-500" />
                  }
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">
                    {lang === 'sw' ? 'Kufunga kwa PIN' : 'App PIN Lock'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {state.appLockEnabled
                      ? (lang === 'sw' ? 'Imewezeshwa — gusa kubadilisha' : 'Enabled — tap to change')
                      : (lang === 'sw' ? 'Ongeza PIN ya usalama' : 'Add a security PIN')
                    }
                  </p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center transition-colors duration-300 ${
                state.appLockEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'
              } px-0.5`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </div>
            </motion.button>

            {/* Analytics info row */}
            <div className="flex items-center gap-3 p-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <BarChart2 className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">
                  {lang === 'sw' ? 'Takwimu za Matumizi' : 'Analytics'}
                </p>
                <p className="text-xs text-gray-400">
                  {lang === 'sw'
                    ? `Matukio ${Analytics.getSessionStats().totalEvents} ya vikao hivi · Hakuna data inayotumwa nje`
                    : `${Analytics.getSessionStats().totalEvents} session events · No data sent externally`
                  }
                </p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                {lang === 'sw' ? 'Ndani' : 'Local'}
              </span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p className="font-medium">PesaPlan v1.0.0</p>
          <p className="mt-0.5">{lang === 'sw' ? 'Imetengenezwa kwa East Africa 🌍' : 'Made for East Africa 🌍'}</p>
          <button
            onClick={() => setShowLegal(true)}
            className="mt-2 text-xs text-gray-400 underline underline-offset-2"
          >
            {lang === 'sw' ? 'Sera ya Faragha · Masharti ya Huduma' : 'Privacy Policy · Terms of Service'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 z-50 shadow-2xl"
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                {lang === 'sw' ? 'Futa Data Zote?' : 'Delete All Data?'}
              </h2>
              <p className="text-sm text-gray-600 text-center mb-6">
                {lang === 'sw'
                  ? 'Hii itafuta miamala yote, malengo, na mipangilio yako. Haitaweza kutenduliwa.'
                  : 'This will permanently erase all your transactions, goals, and settings. This cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  onClick={handleDeleteData}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-semibold"
                >
                  {lang === 'sw' ? 'Ndio, Futa' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* App Lock Setup Overlay */}
      <AnimatePresence>
        {showLockSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <AppLockSetup
              onDone={(pin) => {
                setAppLockPin(pin);
                setShowLockSetup(false);
              }}
              onCancel={() => setShowLockSetup(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disable Lock Confirmation */}
      <AnimatePresence>
        {showDisableLockConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowDisableLockConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 z-50 shadow-2xl"
            >
              <div className="bg-amber-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Unlock className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                {lang === 'sw' ? 'Zima Kufunga?' : 'Disable PIN Lock?'}
              </h2>
              <p className="text-sm text-gray-600 text-center mb-6">
                {lang === 'sw'
                  ? 'App yako itakuwa wazi bila PIN. Unaweza kuwezesha tena wakati wowote.'
                  : 'Your app will be accessible without a PIN. You can re-enable at any time.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisableLockConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  onClick={() => {
                    disableAppLock();
                    Analytics.logEvent('app_lock_disabled');
                    setShowDisableLockConfirm(false);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-semibold"
                >
                  {lang === 'sw' ? 'Zima' : 'Disable'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Legal View */}
      <AnimatePresence>
        {showLegal && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
          >
            <LegalView onBack={() => setShowLegal(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}