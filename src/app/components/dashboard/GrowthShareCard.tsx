import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, CheckCircle, Users, Zap, ChevronRight } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';
import { t } from '@/app/utils/translations';

/** Risk 3 — Growth Loops: Share progress, referral + savings challenges */

export function GrowthShareCard() {
  const { state } = useApp();
  const lang = state.language;
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const fmt = (n: number) => n >= 1000 ? `TSh ${(n / 1000).toFixed(0)}k` : `TSh ${n}`;

  // ── Compute shareable stats ──
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthExpenses = state.transactions
    .filter(t => t.type === 'expense' && t.date >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
  const monthIncome = state.transactions
    .filter(t => t.type === 'income' && t.date >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
  const saved = Math.max(0, monthIncome - monthExpenses);
  const streak = state.streak;
  const completedGoals = state.goals.filter(g => g.completed).length;
  const completedLessons = (state.lessonProgress ?? []).length;
  const completedChallenges = (state.challenges ?? []).filter(c => c.completed).length;

  // Generate a dynamic share text
  const shareText = lang === 'sw'
    ? `🌟 PesaPlan Tanzania!\n\nNarekodi matumizi yangu kwa ${streak} siku mfululizo! 🔥\nNimeokolewa ${fmt(saved)} mwezi huu.\n${completedGoals > 0 ? `✅ Malengo ${completedGoals} yamekamilika!\n` : ''}Jaribu PesaPlan - programu bora ya bajeti kwa Watanzania! 📱💚\n#PesaPlan #AkibaTanzania`
    : `🌟 PesaPlan — East Africa's #1 Budget App!\n\nI've been logging my finances for ${streak} days straight! 🔥\nSaved ${fmt(saved)} this month.\n${completedGoals > 0 ? `✅ Completed ${completedGoals} goals!\n` : ''}Try PesaPlan — the best budgeting app for East Africa! 📱💚\n#PesaPlan #EastAfrica`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success(lang === 'sw' ? '📋 Nakiliwa! Bandika kwenye WhatsApp au TikTok.' : '📋 Copied! Paste to WhatsApp or TikTok.');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'PesaPlan', text: shareText });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const stats = [
    { label: t('streakLabel', lang), value: `${streak}🔥`, color: 'text-orange-600' },
    { label: t('savedLabel', lang), value: fmt(saved), color: 'text-emerald-600' },
    { label: t('lessonsLabel', lang), value: `${completedLessons}/6 📚`, color: 'text-amber-600' },
    { label: t('challengesLabel', lang), value: `${completedChallenges}🏆`, color: 'text-purple-600' },
  ];

  return (
    <>
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl shadow-md overflow-hidden text-white">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-black">
              {t('shareProgress', lang)}
            </p>
            <p className="text-xs text-white/70 mt-0.5">
              {t('inspireYourFriends', lang)}
            </p>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <Share2 className="w-4 h-4" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-1 px-4 pb-3">
          {stats.map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl py-2 px-1 text-center">
              <p className="text-sm font-black">{s.value}</p>
              <p className="text-xs text-white/70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleNativeShare}
            className="bg-white text-emerald-700 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            {t('share', lang)}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowShare(true)}
            className="bg-white/20 border border-white/30 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            {t('inviteFriend', lang)}
          </motion.button>
        </div>
      </div>

      {/* Invite / share sheet */}
      <AnimatePresence>
        {showShare && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowShare(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 pb-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-black text-gray-900 mb-1">
                👋 {t('inviteFriends', lang)}
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {t('shareOnWhatsApp', lang)}
              </p>

              {/* Share text preview */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">{shareText}</p>
              </div>

              {/* Channel buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'WhatsApp', emoji: '💬', color: 'bg-green-500' },
                  { label: 'TikTok', emoji: '🎵', color: 'bg-black' },
                  { label: 'Instagram', emoji: '📸', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
                ].map(ch => (
                  <button
                    key={ch.label}
                    onClick={handleNativeShare}
                    className={`${ch.color} text-white rounded-xl py-2.5 text-xs font-bold flex flex-col items-center gap-0.5`}
                  >
                    <span className="text-lg">{ch.emoji}</span>
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>

              {/* Copy button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCopy}
                className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied
                  ? t('copied', lang)
                  : t('copyMessage', lang)}
              </motion.button>

              {/* Growth tip */}
              <div className="mt-3 flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2">
                <Zap className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  {t('growthTip', lang)}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}