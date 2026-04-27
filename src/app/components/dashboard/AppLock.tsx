import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, Fingerprint, ShieldCheck } from 'lucide-react';
import { useApp, verifyPin } from '@/app/App';
import { Analytics } from '@/app/utils/analytics';

/**
 * Audit Item 11 — Security: PIN App Lock
 * Two modes:
 *   - "setup"  → create + confirm a new 4-digit PIN
 *   - "unlock" → enter existing PIN to access the app
 */

interface AppLockProps {
  mode: 'setup' | 'unlock';
  storedPin?: string;
  onUnlocked?: () => void;
  onPinSet?: (pin: string) => void;
  onCancel?: () => void;
}

const PIN_LENGTH = 4;

export function AppLock({ mode, storedPin = '', onUnlocked, onPinSet, onCancel }: AppLockProps) {
  const { state } = useApp();
  const lang = state.language;

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');
  const [shakeKey, setShakeKey] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [successFlash, setSuccessFlash] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSetup = mode === 'setup';
  const activePin = isSetup ? (setupStep === 'confirm' ? confirmPin : pin) : pin;

  // ── Numpad press ─────────────────────────────────────────────────────────────
  const pressDigit = useCallback((digit: string) => {
    setErrorMsg('');
    if (isSetup) {
      if (setupStep === 'enter') {
        if (pin.length < PIN_LENGTH) {
          const next = pin + digit;
          setPin(next);
          if (next.length === PIN_LENGTH) {
            setTimeout(() => setSetupStep('confirm'), 300);
          }
        }
      } else {
        if (confirmPin.length < PIN_LENGTH) {
          const next = confirmPin + digit;
          setConfirmPin(next);
          if (next.length === PIN_LENGTH) {
            setTimeout(() => handleConfirm(next), 200);
          }
        }
      }
    } else {
      if (pin.length < PIN_LENGTH) {
        const next = pin + digit;
        setPin(next);
        if (next.length === PIN_LENGTH) {
          setTimeout(() => handleUnlock(next), 200);
        }
      }
    }
  }, [pin, confirmPin, setupStep, isSetup]);

  const pressDelete = useCallback(() => {
    setErrorMsg('');
    if (isSetup) {
      if (setupStep === 'confirm') setConfirmPin(p => p.slice(0, -1));
      else setPin(p => p.slice(0, -1));
    } else {
      setPin(p => p.slice(0, -1));
    }
  }, [isSetup, setupStep]);

  // ── Keyboard support ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') pressDigit(e.key);
      if (e.key === 'Backspace') pressDelete();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pressDigit, pressDelete]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleUnlock = (enteredPin: string) => {
    // AUDIT FIX #4: Use verifyPin (supports both hashed and legacy plaintext PINs)
    if (verifyPin(enteredPin, storedPin)) {
      setSuccessFlash(true);
      Analytics.logEvent('app_unlock_success');
      setTimeout(() => onUnlocked?.(), 400);
    } else {
      const newCount = failCount + 1;
      setFailCount(newCount);
      setShakeKey(k => k + 1);
      setPin('');
      setErrorMsg(
        lang === 'sw'
          ? `PIN isiyo sahihi (${newCount} jaribio)`
          : `Wrong PIN (attempt ${newCount})`
      );
      Analytics.logEvent('app_unlock_failed', { attempt: newCount });
    }
  };

  const handleConfirm = (enteredConfirm: string) => {
    if (enteredConfirm === pin) {
      setSuccessFlash(true);
      Analytics.logEvent('app_lock_enabled');
      setTimeout(() => onPinSet?.(pin), 400);
    } else {
      setShakeKey(k => k + 1);
      setConfirmPin('');
      setErrorMsg(lang === 'sw' ? 'PIN hazilingani. Jaribu tena.' : 'PINs do not match. Try again.');
    }
  };

  // ── Dot indicators ────────────────────────────────────────────────────────────
  const currentLength = activePin.length;

  const title = isSetup
    ? (setupStep === 'enter'
        ? (lang === 'sw' ? 'Weka PIN yako' : 'Create your PIN')
        : (lang === 'sw' ? 'Thibitisha PIN yako' : 'Confirm your PIN'))
    : (lang === 'sw' ? 'Weka PIN kufungua' : 'Enter PIN to unlock');

  const subtitle = isSetup
    ? (setupStep === 'enter'
        ? (lang === 'sw' ? 'Chagua nambari 4 za siri' : 'Choose a 4-digit secret code')
        : (lang === 'sw' ? 'Ingiza tena PIN yako kuthibitisha' : 'Re-enter your PIN to confirm'))
    : (lang === 'sw' ? 'PesaPlan imelindwa' : 'PesaPlan is protected');

  const numpad = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['','0','⌫'],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gray-950 select-none overflow-hidden"
      aria-label={lang === 'sw' ? 'Skrini ya Kufungulia' : 'App Lock Screen'}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top section */}
      <div className="relative flex flex-col items-center pt-20 px-6 w-full">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transition-colors duration-500 ${
            successFlash ? 'bg-emerald-500' : 'bg-emerald-500/15 border border-emerald-500/30'
          }`}
        >
          {successFlash
            ? <ShieldCheck className="w-10 h-10 text-white" />
            : <Fingerprint className="w-10 h-10 text-emerald-400" />
          }
        </motion.div>

        {/* Brand */}
        <p className="text-white/40 text-xs tracking-[0.25em] uppercase mb-1">PesaPlan</p>

        {/* Title */}
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-xl font-black mb-1 text-center"
        >
          {title}
        </motion.h1>
        <p className="text-white/40 text-sm text-center mb-3">{subtitle}</p>

        {/* PIN recovery warning — shown only during setup */}
        {isSetup && setupStep === 'enter' && (
          <p className="text-amber-400/70 text-xs text-center px-8 mb-7">
            {lang === 'sw'
              ? '⚠️ Ukisahau PIN yako, itabidi ufute data yote ya programu.'
              : '⚠️ If you forget your PIN, you will need to clear all app data.'}
          </p>
        )}
        {!isSetup && <div className="mb-10" />}
        {isSetup && setupStep !== 'enter' && <div className="mb-10" />}

        {/* Dot indicators */}
        <motion.div
          key={shakeKey}
          animate={shakeKey > 0
            ? { x: [0, -10, 10, -10, 10, -6, 6, 0] }
            : { x: 0 }
          }
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-3"
          aria-label={`${currentLength} of ${PIN_LENGTH} digits entered`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              animate={i < currentLength
                ? { scale: [1.3, 1], opacity: 1 }
                : { scale: 1, opacity: 1 }
              }
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`rounded-full transition-all duration-200 ${
                i < currentLength
                  ? 'w-4 h-4 bg-emerald-400 shadow-lg shadow-emerald-500/50'
                  : 'w-3.5 h-3.5 bg-white/15 border border-white/20'
              }`}
            />
          ))}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm font-medium text-center"
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Fail count warning */}
        {failCount >= 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-orange-400 text-xs text-center mt-1"
          >
            {lang === 'sw'
              ? '⚠️ Majaribio mengi. Tumia "Sahau PIN" hapa chini.'
              : '⚠️ Too many attempts. Use "Forgot PIN" below.'}
          </motion.p>
        )}
      </div>

      {/* Numpad */}
      <div className="relative w-full max-w-xs px-6 pb-12">
        <div className="grid grid-cols-3 gap-3">
          {numpad.map((row, ri) =>
            row.map((key, ci) => {
              if (key === '') return <div key={`${ri}-${ci}`} />;
              const isDelete = key === '⌫';
              return (
                <motion.button
                  key={key}
                  onTouchStart={() => isDelete ? pressDelete() : pressDigit(key)}
                  onClick={() => isDelete ? pressDelete() : pressDigit(key)}
                  whileTap={{ scale: 0.88, backgroundColor: 'rgba(255,255,255,0.12)' }}
                  className="flex items-center justify-center h-16 rounded-2xl bg-white/[0.07] border border-white/[0.08] active:bg-white/[0.15] transition-colors"
                  aria-label={isDelete ? (lang === 'sw' ? 'Futa' : 'Delete') : key}
                >
                  {isDelete
                    ? <Delete className="w-5 h-5 text-white/70" />
                    : (
                      <span className="text-white font-bold" style={{ fontSize: '1.375rem' }}>
                        {key}
                      </span>
                    )
                  }
                </motion.button>
              );
            })
          )}
        </div>

        {/* Cancel / Forgot PIN */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white/30 text-sm"
            >
              {lang === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
          )}
          {!isSetup && failCount >= 3 && (
            <button
              onClick={() => {
                if (confirm(
                  lang === 'sw'
                    ? 'Hii itafuta data yote. Endelea?'
                    : 'This will erase all data. Continue?'
                )) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-orange-400/70 text-sm"
            >
              {lang === 'sw' ? 'Sahau PIN' : 'Forgot PIN'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Setup flow component (used in Settings) ──────────────────────────────────
interface AppLockSetupProps {
  onDone: (pin: string) => void;
  onCancel: () => void;
}

export function AppLockSetup({ onDone, onCancel }: AppLockSetupProps) {
  return (
    <AppLock
      mode="setup"
      onPinSet={onDone}
      onCancel={onCancel}
    />
  );
}