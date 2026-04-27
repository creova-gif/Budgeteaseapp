import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Globe, DollarSign, Calendar, Download, Upload, Trash2, AlertTriangle, X, CheckCircle, Shield, Lock, Unlock } from 'lucide-react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';
import { REGION_CONFIG } from '@/app/utils/currency';
import { LegalView } from './LegalView';
import { AppLockSetup } from './AppLock';
import { Analytics } from '@/app/utils/analytics';

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { state, setLanguage, setRegion, clearAllData, setAppLockPin, disableAppLock, setUserName } = useApp();
  const lang = state.language;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showLockSetup, setShowLockSetup] = useState(false);
  const [showDisableLockConfirm, setShowDisableLockConfirm] = useState(false);
  const [nameInput, setNameInput] = useState(state.userName);
  const [importDone, setImportDone] = useState(false);
  const [importError, setImportError] = useState('');
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

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
  };

  const handleExportJSON = () => {
    const raw = localStorage.getItem('pesaplan_v1');
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesaplan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Analytics.logEvent('data_exported_json');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || !Array.isArray(parsed.transactions)) {
          setImportError(t('invalidBackupFile', lang));
          return;
        }
        setPendingImport(text);
        setShowImportConfirm(true);
      } catch {
        setImportError(t('invalidJSONFile', lang));
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    localStorage.setItem('pesaplan_v1', pendingImport);
    Analytics.logEvent('data_imported_json');
    window.location.reload();
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
      label: t('countryCurrency', lang),
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
        ? {
            daily:     lang === 'sw' ? 'Kila Siku'    : 'Daily',
            weekly:    lang === 'sw' ? 'Kila Wiki'    : 'Weekly',
            monthly:   lang === 'sw' ? 'Kila Mwezi'  : 'Monthly',
            irregular: lang === 'sw' ? 'Isiyo ya Kawaida' : 'Irregular',
          }[state.incomeFrequency]
        : t('notSet', lang),
      action: () => {},
      badge: null,
    },
    {
      icon: Shield,
      label: t('legal', lang),
      value: lang === 'sw' ? 'Sera · Masharti' : 'Policy · Terms',
      action: () => setShowLegal(true),
      badge: null,
    },
  ];

  const profileData = [
    {
      label: t('totalTransactions', lang),
      value: state.transactions.length.toString(),
    },
    {
      label: t('goals', lang),
      value: state.goals.length.toString(),
    },
    {
      label: t('dayStreak', lang),
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
        {/* Name input */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
            {t('yourName', lang)}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder={lang === 'sw' ? 'Weka jina lako...' : 'Enter your name...'}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              maxLength={30}
            />
            <button
              onClick={() => setUserName(nameInput)}
              disabled={nameInput.trim() === state.userName}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40 hover:bg-emerald-600 transition"
            >
              {t('save', lang)}
            </button>
          </div>
        </div>

        {/* Profile Stats */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            {t('myStats', lang)}
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
            {t('settings', lang)}
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
            {t('actions', lang)}
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
                    ? t('downloaded', lang)
                    : t('exportHistory', lang)}
                </span>
                <span className="text-xs text-gray-500">
                  {state.transactions.length === 0
                    ? t('noDataToExport', lang)
                    : (lang === 'sw'
                        ? `${state.transactions.length} miamala → CSV`
                        : `${state.transactions.length} transactions → CSV`)}
                </span>
              </div>
            </motion.button>

            {/* Export JSON Backup */}
            <motion.button
              onClick={handleExportJSON}
              className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition"
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-blue-100 p-2 rounded-full">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <span className="font-medium text-gray-900 block text-sm">
                  {t('saveBackupJSON', lang)}
                </span>
                <span className="text-xs text-gray-500">
                  {t('fullDataBackup', lang)}
                </span>
              </div>
            </motion.button>

            {/* Import JSON Backup */}
            <label className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition cursor-pointer active:scale-[0.98]">
              <div className={`p-2 rounded-full ${importDone ? 'bg-emerald-100' : 'bg-purple-100'}`}>
                {importDone
                  ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                  : <Upload className="w-5 h-5 text-purple-600" />
                }
              </div>
              <div className="text-left">
                <span className="font-medium text-gray-900 block text-sm">
                  {importDone ? t('restoredDone', lang) : t('restoreBackupJSON', lang)}
                </span>
                <span className="text-xs text-gray-500">
                  {t('restoreFromFile', lang)}
                </span>
              </div>
              <input type="file" accept=".json,application/json" className="hidden" onChange={handleImportJSON} />
            </label>
            {importError && (
              <p className="text-red-500 text-xs px-1">{importError}</p>
            )}

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
                  {t('eraseAllData', lang)}
                </span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* ── Security (App Lock) ── */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            🔒 {t('security', lang)}
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
                    {t('appLock', lang)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {state.appLockEnabled
                      ? t('enabledTapToChange', lang)
                      : t('secureApp', lang)
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
            {t('privacyPolicy', lang)} · {t('termsOfService', lang)}
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
                {t('deleteAllDataTitle', lang)}
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
                  {t('yesDelete', lang)}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Import Confirm Modal */}
      <AnimatePresence>
        {showImportConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowImportConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 z-50 shadow-2xl"
            >
              <button onClick={() => setShowImportConfirm(false)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                {t('restoreBackupTitle', lang)}
              </h2>
              <p className="text-sm text-gray-600 text-center mb-6">
                {lang === 'sw'
                  ? 'Data yako ya sasa itafutwa na kubadilishwa na nakala. Hii haiwezi kutenduliwa.'
                  : 'Your current data will be replaced with the backup. This cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowImportConfirm(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold">
                  {t('cancel', lang)}
                </button>
                <button onClick={confirmImport} className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-semibold">
                  {t('yesRestore', lang)}
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
                {t('disablePinLock', lang)}
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
                  {t('disable', lang)}
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