import { motion } from 'motion/react';
import { useApp } from '@/app/App';
import { t } from '@/app/utils/translations';

interface SplashScreensProps {
  onComplete: () => void;
}

const features = [
  {
    icon: '📱',
    en: 'M-Pesa · Airtel · Tigo Pesa',
    sw: 'M-Pesa · Airtel · Tigo Pesa',
    label: { en: 'Mobile Money', sw: 'Pesa ya Simu' },
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/40',
    bar: 'bg-emerald-400',
  },
  {
    icon: '📊',
    en: 'Smart budget tracking',
    sw: 'Ufuatiliaji wa bajeti mahiri',
    label: { en: 'AI Budgeting', sw: 'Bajeti ya AI' },
    gradient: 'from-teal-500 to-cyan-400',
    glow: 'shadow-teal-500/40',
    bar: 'bg-teal-400',
  },
  {
    icon: '🔒',
    en: 'Your data stays on your device',
    sw: 'Data yako inabaki kwenye kifaa chako',
    label: { en: '100% Private', sw: 'Faragha Kamili' },
    gradient: 'from-cyan-500 to-sky-400',
    glow: 'shadow-cyan-500/40',
    bar: 'bg-cyan-400',
  },
];

export function SplashScreens({ onComplete }: SplashScreensProps) {
  const { state } = useApp();
  const lang = state.language;

  return (
    <div className="h-screen bg-gray-950 flex flex-col items-center justify-between overflow-hidden relative select-none">

      {/* Ambient gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-emerald-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 1.8, delay: 0.4 }}
          className="absolute bottom-20 -right-16 w-64 h-64 bg-teal-400 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 2, delay: 0.6 }}
          className="absolute bottom-0 -left-12 w-52 h-52 bg-cyan-400 rounded-full blur-3xl"
        />
      </div>

      {/* ── Top: Logo + Name ── */}
      <div className="relative flex flex-col items-center flex-1 justify-center px-8 pb-6">

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.2 }}
          className="relative mb-7"
        >
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-[28px] bg-emerald-400/20 blur-xl scale-125" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <span style={{ fontSize: '2.75rem' }}>💰</span>
          </div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-center mb-3"
        >
          <h1
            className="font-black tracking-tight text-transparent bg-clip-text"
            style={{
              fontSize: '2.75rem',
              backgroundImage: 'linear-gradient(135deg, #ffffff 30%, #6ee7b7 100%)',
            }}
          >
            PesaPlan
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.65, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-white text-center mb-10 max-w-[260px] leading-snug"
          style={{ fontSize: '1.0625rem' }}
        >
          {t('tagline', lang)}
        </motion.p>

        {/* Feature pills */}
        <div className="flex flex-col gap-3 w-full max-w-[320px]">
          {features.map((f, i) => (
            <motion.div
              key={f.en}
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.14, type: 'spring', stiffness: 280, damping: 24 }}
              className="relative overflow-hidden rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Animated shimmer sweep */}
              <motion.div
                initial={{ x: '-120%' }}
                animate={{ x: '220%' }}
                transition={{ repeat: Infinity, duration: 3.2, delay: 1.6 + i * 0.5, ease: 'linear' }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent skew-x-[-18deg] pointer-events-none"
              />

              {/* Left accent bar */}
              <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${f.bar} opacity-80`} />

              <div className="flex items-center gap-3.5 px-5 py-3.5 pl-5">
                {/* Icon bubble */}
                <div className={`relative shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg ${f.glow}`}>
                  <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{f.icon}</span>
                  {/* Tiny live dot */}
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-white rounded-full border-2 border-gray-950"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col min-w-0">
                  <span className="text-white/40 uppercase tracking-widest" style={{ fontSize: '0.6rem', letterSpacing: '0.12em' }}>
                    {lang === 'sw' ? f.label.sw : f.label.en}
                  </span>
                  <span className="text-white/85 font-semibold leading-tight mt-0.5" style={{ fontSize: '0.9rem' }}>
                    {lang === 'sw' ? f.sw : f.en}
                  </span>
                </div>

                {/* Right checkmark */}
                <div className={`shrink-0 ml-auto w-5 h-5 rounded-full bg-gradient-to-br ${f.gradient} flex items-center justify-center`}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Bottom: CTA ── */}
      <div className="relative w-full px-6 pb-14">
        <motion.button
          onClick={onComplete}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, type: 'spring', stiffness: 240, damping: 22 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-3xl py-5 shadow-2xl shadow-emerald-500/30 relative overflow-hidden"
          aria-label={lang === 'sw' ? 'Endelea kuanza PesaPlan' : 'Continue to start PesaPlan'}
        >
          {/* Shimmer on button */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 1.5, ease: 'linear' }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
          />
          <span className="relative font-black tracking-wide" style={{ fontSize: '1.0625rem' }}>
            {t('continue', lang)} →
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 1.4 }}
          className="text-white text-center text-xs mt-4"
        >
          {lang === 'sw' ? 'Bila malipo · Bila matangazo · Bila mtandao' : 'Free · No ads · Works offline'}
        </motion.p>
      </div>
    </div>
  );
}