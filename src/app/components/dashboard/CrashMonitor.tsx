import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Clock, Cpu, Zap, ExternalLink } from 'lucide-react';
import { Analytics } from '@/app/utils/analytics';
import { useApp } from '@/app/App';

/**
 * CrashMonitor — Real-time session health + crash reporting dashboard.
 * Audit Item #19: Firebase Crashlytics integration guide + in-app fallback.
 *
 * Production: swap Analytics calls with Firebase Crashlytics SDK.
 */

export function CrashMonitor() {
  const { state } = useApp();
  const lang = state.language;
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState(Analytics.getSessionStats());
  const [showIntegration, setShowIntegration] = useState(false);

  // Refresh stats every 5 seconds when expanded
  useEffect(() => {
    if (!expanded) return;
    const iv = setInterval(() => setStats(Analytics.getSessionStats()), 5000);
    return () => clearInterval(iv);
  }, [expanded]);

  const durationMin = Math.floor(stats.sessionDurationMs / 60000);
  const durationSec = Math.floor((stats.sessionDurationMs % 60000) / 1000);
  const sessionStr = durationMin > 0
    ? `${durationMin}m ${durationSec}s`
    : `${durationSec}s`;

  const isHealthy = stats.crashCount === 0;

  const FIREBASE_STEPS = [
    {
      step: 1,
      title: lang === 'sw' ? 'Sakinisha Firebase' : 'Install Firebase',
      code: 'npm install @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics',
      done: false,
    },
    {
      step: 2,
      title: lang === 'sw' ? 'Badilisha logEvent' : 'Swap logEvent',
      code: "await analytics().logEvent(event, params);",
      done: false,
    },
    {
      step: 3,
      title: lang === 'sw' ? 'Badilisha captureException' : 'Swap captureException',
      code: "crashlytics().recordError(error);",
      done: false,
    },
    {
      step: 4,
      title: lang === 'sw' ? 'Weka Kitambulisho cha Mtumiaji' : 'Set User ID',
      code: `crashlytics().setUserId(\`user_\${userType}_\${sessionId}\`);`,
      done: false,
    },
    {
      step: 5,
      title: lang === 'sw' ? 'Au tumia Sentry (web)' : 'Or use Sentry (web)',
      code: `Sentry.init({ dsn: 'YOUR_SENTRY_DSN', tracesSampleRate: 1.0 });`,
      done: false,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => { setExpanded(v => !v); setStats(Analytics.getSessionStats()); }}
        className="w-full"
        aria-expanded={expanded}
        aria-label={lang === 'sw' ? 'Angalia hali ya kikao' : 'View session health'}
      >
        <div className={`flex items-center justify-between p-4 ${isHealthy ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : 'bg-gradient-to-r from-red-50 to-orange-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isHealthy ? 'bg-emerald-100' : 'bg-red-100'}`}>
              <Activity className={`w-4 h-4 ${isHealthy ? 'text-emerald-600' : 'text-red-500'}`} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">
                {lang === 'sw' ? 'Ufuatiliaji wa Hitilafu' : 'Crash Monitoring'}
              </p>
              <p className={`text-xs font-medium ${isHealthy ? 'text-emerald-600' : 'text-red-500'}`}>
                {isHealthy
                  ? (lang === 'sw' ? '✅ Hakuna hitilafu za kikao hiki' : '✅ No crashes this session')
                  : `⚠️ ${stats.crashCount} ${lang === 'sw' ? 'hitilafu' : 'crash(es) recorded'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
              {lang === 'sw' ? 'Hifadhi' : 'Local'}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Session metrics grid */}
            <div className="grid grid-cols-3 gap-0 border-t border-gray-100">
              {[
                {
                  icon: Clock,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50',
                  label: lang === 'sw' ? 'Muda wa Kikao' : 'Session Time',
                  value: sessionStr,
                },
                {
                  icon: Zap,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50',
                  label: lang === 'sw' ? 'Matukio' : 'Events',
                  value: String(stats.totalEvents),
                },
                {
                  icon: isHealthy ? CheckCircle : AlertTriangle,
                  color: isHealthy ? 'text-emerald-500' : 'text-red-500',
                  bg: isHealthy ? 'bg-emerald-50' : 'bg-red-50',
                  label: lang === 'sw' ? 'Hitilafu' : 'Crashes',
                  value: String(stats.crashCount),
                },
              ].map((m, i) => (
                <div key={i} className={`p-3 text-center ${i < 2 ? 'border-r border-gray-100' : ''}`}>
                  <div className={`${m.bg} w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1.5`}>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <p className="text-sm font-black text-gray-900">{m.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Session ID */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{lang === 'sw' ? 'ID ya Kikao' : 'Session ID'}</p>
                <p className="text-xs font-mono font-bold text-gray-600">{stats.sessionId}</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">{lang === 'sw' ? 'Toleo' : 'Version'}</p>
                <p className="text-xs font-mono font-bold text-gray-600">{stats.appVersion}</p>
              </div>
            </div>

            {/* Recent events log */}
            {stats.recentEvents.length > 0 && (
              <div className="border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 pt-3 pb-2">
                  {lang === 'sw' ? 'Matukio ya Hivi Karibuni' : 'Recent Events'}
                </p>
                <div className="space-y-0 pb-2">
                  {(stats.recentEvents as Array<{ event: string; timestamp: number }>).slice(0, 5).map((e, i) => {
                    const ago = Math.round((Date.now() - e.timestamp) / 1000);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between px-4 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <p className="text-xs font-mono text-gray-600">{e.event}</p>
                        </div>
                        <p className="text-[10px] text-gray-400">{ago}s {lang === 'sw' ? 'iliyopita' : 'ago'}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Crash log — only shown if crashes exist */}
            {stats.crashCount > 0 && (
              <div className="border-t border-red-100 bg-red-50">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide px-4 pt-3 pb-2">
                  ⚠️ {lang === 'sw' ? 'Rekodi za Hitilafu' : 'Crash Log'}
                </p>
                {(stats.recentCrashes as Array<{ message: string; timestamp: number; recentEvents: string[] }>).map((c, i) => (
                  <div key={i} className="px-4 pb-3">
                    <p className="text-xs font-mono text-red-700 bg-red-100 rounded-lg p-2 leading-relaxed">
                      {c.message}
                    </p>
                    <p className="text-[10px] text-red-400 mt-1">
                      {new Date(c.timestamp).toLocaleTimeString()} · {lang === 'sw' ? 'Kabla:' : 'Before:'} {c.recentEvents.join(' → ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Firebase integration guide */}
            <div className="border-t border-gray-100">
              <button
                onClick={() => setShowIntegration(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-500" />
                  <p className="text-xs font-bold text-gray-700">
                    {lang === 'sw' ? '🔥 Unganisha Firebase Crashlytics' : '🔥 Connect Firebase Crashlytics'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">
                    {lang === 'sw' ? 'Inapendekezwa' : 'Recommended'}
                  </span>
                  {showIntegration ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {showIntegration && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-950"
                  >
                    <div className="px-4 pb-4 pt-2">
                      <p className="text-xs text-gray-400 mb-3">
                        {lang === 'sw'
                          ? 'Mfumo wa Analytics wa BudgetEase umejengwa kuiga Firebase Crashlytics API. Kufanya mabadiliko:'
                          : 'BudgetEase Analytics mirrors the Firebase Crashlytics API exactly. To swap:'}
                      </p>
                      <div className="space-y-3">
                        {FIREBASE_STEPS.map((s) => (
                          <div key={s.step} className="flex gap-2">
                            <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[10px] font-black text-orange-400">{s.step}</span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-300 mb-1">{s.title}</p>
                              <code className="text-[10px] font-mono text-green-400 bg-gray-800 rounded px-2 py-1 block leading-relaxed break-all">
                                {s.code}
                              </code>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center gap-2 bg-orange-500/10 rounded-xl px-3 py-2">
                        <ExternalLink className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <p className="text-[10px] text-orange-300">
                          {lang === 'sw'
                            ? 'Tazama: firebase.google.com/docs/crashlytics · sentry.io/for/react-native'
                            : 'Docs: firebase.google.com/docs/crashlytics · sentry.io/for/react-native'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
