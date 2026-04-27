import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { useApp } from '@/app/App';

export function OfflineIndicator() {
  const { state } = useApp();
  const lang = state.language;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Persistent Indicator (always visible when offline) */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium z-40 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <CloudOff className="w-4 h-4" />
            <span>
              {lang === 'sw'
                ? 'Offline - Data zimehifadhiwa kwenye kifaa chako'
                : 'Offline - Data saved locally'}
            </span>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm"
          >
            <div
              className={`${
                isOnline
                  ? 'bg-emerald-600'
                  : 'bg-orange-600'
              } text-white rounded-2xl px-6 py-4 shadow-2xl`}
            >
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Cloud className="w-6 h-6" />
                ) : (
                  <CloudOff className="w-6 h-6" />
                )}
                <div>
                  <p className="font-semibold">
                    {isOnline
                      ? lang === 'sw' ? 'Umeunganishwa!' : 'Connected!'
                      : lang === 'sw' ? 'Hakuna mtandao' : 'No connection'}
                  </p>
                  <p className="text-sm opacity-90">
                    {isOnline
                      ? lang === 'sw'
                        ? 'Data zote zimehifadhiwa kwenye kifaa'
                        : 'All data saved on this device'
                      : lang === 'sw'
                      ? 'Kila kitu kimehifadhiwa kwenye kifaa'
                      : 'Everything saved on device'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}