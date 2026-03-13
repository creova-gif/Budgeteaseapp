import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Wifi, WifiOff, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/app/App';

/**
 * Audit Item #20 — Fintech Trust Signals
 * Visible trust indicators required by App Store policy and fintech UX best practice.
 * Covers: offline status, data privacy, PIN lock status, accuracy guarantee.
 */

export function TrustSignals() {
  const { state } = useApp();
  const lang = state.language;
  const [online, setOnline] = useState(navigator.onLine);
  const [expanded, setExpanded] = useState(false);

  // Listen for connectivity changes
  useState(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const signals = [
    {
      icon: Shield,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      label: lang === 'sw' ? 'Data Salama' : 'Data Private',
      detail: lang === 'sw'
        ? 'Data zako zote zinahifadhiwa ndani ya kifaa chako tu. Hatutumi chochote nje.'
        : 'All your data lives only on your device. We never send it anywhere.',
    },
    {
      icon: online ? Wifi : WifiOff,
      color: online ? 'text-blue-600' : 'text-orange-500',
      bg: online ? 'bg-blue-100' : 'bg-orange-100',
      label: online
        ? (lang === 'sw' ? 'Unaendesha' : 'Connected')
        : (lang === 'sw' ? 'Bila Mtandao' : 'Offline Mode'),
      detail: lang === 'sw'
        ? 'Programu inafanya kazi nje ya mtandao — hakuna intaneti inahitajika kwa miamala.'
        : 'App works fully offline — no internet needed for transactions.',
    },
    {
      icon: Lock,
      color: state.appLockEnabled ? 'text-purple-600' : 'text-gray-400',
      bg: state.appLockEnabled ? 'bg-purple-100' : 'bg-gray-100',
      label: state.appLockEnabled
        ? (lang === 'sw' ? 'PIN Imewezeshwa' : 'PIN Protected')
        : (lang === 'sw' ? 'PIN Imezimwa' : 'PIN Disabled'),
      detail: state.appLockEnabled
        ? (lang === 'sw' ? 'Programu inalindwa na PIN yako ya siri.' : 'App is protected by your secret PIN.')
        : (lang === 'sw' ? 'Wezesha PIN kwa usalama zaidi (Mipangilio → Usalama).' : 'Enable PIN for better security (Settings → Security).'),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Compact trust bar — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        aria-expanded={expanded}
        aria-label={lang === 'sw' ? 'Ishara za uaminifu' : 'Trust signals'}
      >
        <div className="flex items-center gap-3">
          {signals.map((s, i) => (
            <div key={i} className={`${s.bg} p-1.5 rounded-full`}>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
          ))}
          <p className="text-xs text-gray-500 font-medium">
            {lang === 'sw' ? 'Data yako inalindwa · Offline imara' : 'Your data is protected · Rock-solid offline'}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
      </button>

      {/* Expanded trust details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {signals.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <div className={`${s.bg} p-2 rounded-full shrink-0`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.detail}</p>
                  </div>
                </motion.div>
              ))}

              {/* Accuracy disclaimer — required by App Store fintech policy */}
              <div className="px-4 py-3 bg-amber-50">
                <p className="text-xs text-amber-700 leading-relaxed">
                  ⚠️ {lang === 'sw'
                    ? 'PesaPlan ni chombo cha msaada wa bajeti tu. Haifanyi maamuzi ya uwekezaji wa kitaalamu. Thamani zote zinahesabiwa kutoka kwa data unayoingiza wewe mwenyewe.'
                    : 'PesaPlan is a budgeting aid only. It does not make professional investment decisions. All values are calculated from data you enter yourself.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}