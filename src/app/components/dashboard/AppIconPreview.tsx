import { motion } from 'motion/react';
import { useApp } from '@/app/App';

/**
 * AppIconPreview — Visual reference for the 1024×1024 App Store icon.
 * The design uses the 4-point geometric star on a deep emerald radial gradient.
 * Export this view as a PNG at 1024×1024 for App Store submission.
 *
 * Asset required: iOS App Store: 1024×1024px PNG (no transparency)
 *                 Android: 512×512px PNG + adaptive icon layers
 */

interface AppIconPreviewProps {
  size?: number;
  className?: string;
}

export function AppIcon({ size = 120, className = '' }: AppIconPreviewProps) {
  const r = size / 2;
  const cornerRadius = size * 0.22; // iOS icon corner radius ratio

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BudgetEase app icon"
      role="img"
    >
      <defs>
        {/* Deep emerald radial gradient — matches the AI button */}
        <radialGradient id={`iconGrad_${size}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="45%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>

        {/* Shine overlay */}
        <radialGradient id={`iconShine_${size}`} cx="35%" cy="20%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Clip path for rounded square */}
        <clipPath id={`iconClip_${size}`}>
          <rect x={0} y={0} width={size} height={size} rx={cornerRadius} ry={cornerRadius} />
        </clipPath>
      </defs>

      <g clipPath={`url(#iconClip_${size})`}>
        {/* Background gradient */}
        <rect x={0} y={0} width={size} height={size} fill={`url(#iconGrad_${size})`} />

        {/* Subtle dark vignette bottom */}
        <rect x={0} y={size * 0.5} width={size} height={size * 0.5} fill="black" fillOpacity="0.12" />

        {/* Shine overlay */}
        <rect x={0} y={0} width={size} height={size} fill={`url(#iconShine_${size})`} />

        {/* Main 4-point star — centered, ~55% of icon size */}
        {(() => {
          const s = size * 0.56;  // star container size
          const cx = r;
          const cy = r * 0.97;   // slightly above center for visual weight
          const hs = s / 2;
          // Parametric 4-point star: M cx,cy-hs  ... bezier curve
          const d = `M ${cx} ${cy - hs}
            C ${cx} ${cy - hs}
              ${cx + hs * 0.28} ${cy - hs * 0.28}
              ${cx + hs} ${cy}
            C ${cx + hs} ${cy}
              ${cx + hs * 0.28} ${cy + hs * 0.28}
              ${cx} ${cy + hs}
            C ${cx} ${cy + hs}
              ${cx - hs * 0.28} ${cy + hs * 0.28}
              ${cx - hs} ${cy}
            C ${cx - hs} ${cy}
              ${cx - hs * 0.28} ${cy - hs * 0.28}
              ${cx} ${cy - hs}
            Z`;
          return (
            <path
              d={d}
              fill="white"
              fillOpacity="0.97"
              style={{ filter: `drop-shadow(0 ${size * 0.02}px ${size * 0.05}px rgba(0,0,0,0.35))` }}
            />
          );
        })()}

        {/* Small accent star — top right */}
        {(() => {
          const s = size * 0.16;
          const cx = r + size * 0.28;
          const cy = r - size * 0.26;
          const hs = s / 2;
          const d = `M ${cx} ${cy - hs}
            C ${cx} ${cy - hs} ${cx + hs * 0.3} ${cy - hs * 0.3} ${cx + hs} ${cy}
            C ${cx + hs} ${cy} ${cx + hs * 0.3} ${cy + hs * 0.3} ${cx} ${cy + hs}
            C ${cx} ${cy + hs} ${cx - hs * 0.3} ${cy + hs * 0.3} ${cx - hs} ${cy}
            C ${cx - hs} ${cy} ${cx - hs * 0.3} ${cy - hs * 0.3} ${cx} ${cy - hs} Z`;
          return <path d={d} fill="white" fillOpacity="0.55" />;
        })()}

        {/* Tiny dot accent — bottom left */}
        <circle
          cx={r - size * 0.28}
          cy={r + size * 0.3}
          r={size * 0.04}
          fill="white"
          fillOpacity="0.4"
        />
      </g>
    </svg>
  );
}

export function AppIconPreview() {
  const { state } = useApp();
  const lang = state.language;

  const sizes = [
    { label: '1024×1024', sublabel: lang === 'sw' ? 'iOS App Store' : 'iOS App Store', px: 1024, display: 96 },
    { label: '512×512', sublabel: lang === 'sw' ? 'Google Play' : 'Google Play', px: 512, display: 72 },
    { label: '180×180', sublabel: lang === 'sw' ? 'iPhone (3×)' : 'iPhone (3×)', px: 180, display: 56 },
    { label: '167×167', sublabel: 'iPad Pro', px: 167, display: 52 },
    { label: '120×120', sublabel: lang === 'sw' ? 'iPhone (2×)' : 'iPhone (2×)', px: 120, display: 44 },
    { label: '87×87', sublabel: lang === 'sw' ? 'Arifa (3×)' : 'Notification (3×)', px: 87, display: 36 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-4 flex items-center gap-3">
        <AppIcon size={44} />
        <div>
          <p className="text-sm font-black text-white">BudgetEase</p>
          <p className="text-xs text-white/70">
            {lang === 'sw' ? 'Muundo wa Ikoni ya Programu' : 'App Icon Design Reference'}
          </p>
        </div>
      </div>

      {/* Icon sizes grid */}
      <div className="px-4 py-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          {lang === 'sw' ? 'Ukubwa Wote Unaohitajika' : 'All Required Sizes'}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2 bg-gray-50 rounded-2xl p-3"
            >
              <div className="relative">
                <AppIcon size={s.display} />
                {/* iOS rounded mask overlay — visual only */}
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-700">{s.label}</p>
                <p className="text-[9px] text-gray-400">{s.sublabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dark background preview */}
      <div className="mx-4 mb-4 rounded-2xl bg-gray-900 p-4">
        <p className="text-xs text-gray-400 mb-3">
          {lang === 'sw' ? 'Mandhari ya Giza (Hali ya Usiku)' : 'Dark Background (Night Mode)'}
        </p>
        <div className="flex items-center gap-4">
          <AppIcon size={60} />
          <div>
            <p className="text-sm font-black text-white">BudgetEase</p>
            <p className="text-xs text-gray-400">{lang === 'sw' ? 'Fedha za Afrika Mashariki' : 'East Africa Finance'}</p>
          </div>
        </div>
      </div>

      {/* Export instructions */}
      <div className="border-t border-gray-100 px-4 py-3 bg-amber-50">
        <p className="text-xs font-bold text-amber-700 mb-1">
          {lang === 'sw' ? '📤 Jinsi ya Kusafirisha kwa Uwasilishaji' : '📤 Export for Submission'}
        </p>
        <ul className="text-[10px] text-amber-600 space-y-0.5">
          <li>• {lang === 'sw' ? 'Tumia Figma / Sketch kupakua PNG za ukubwa wote' : 'Use Figma / Sketch to export all size PNGs'}</li>
          <li>• {lang === 'sw' ? 'iOS: PNG isiyo na uwazi (1024×1024)' : 'iOS: No transparency PNG required (1024×1024)'}</li>
          <li>• {lang === 'sw' ? 'Android: Ikoni inayobadilika (Adaptive Icon) inahitajika' : 'Android: Adaptive Icon layers required'}</li>
        </ul>
      </div>
    </div>
  );
}
