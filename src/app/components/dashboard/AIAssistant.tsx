import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import { useApp } from '@/app/App';
import { getCategoryIcon } from '@/app/utils/categoryIcons';
import { formatCurrency } from '@/app/utils/currency';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

function generateReply(
  input: string,
  state: ReturnType<typeof useApp>['state'],
  lang: 'sw' | 'en'
): string {
  const fmt = (n: number) => formatCurrency(n, state.region);
  const lower = input.toLowerCase();
  const now = new Date();

  // ── Helpers ─────────────────────────────────────────────────────────────
  const expenses = state.transactions.filter(t => t.type === 'expense');
  const income = state.transactions.filter(t => t.type === 'income');

  const byCategory: Record<string, number> = {};
  expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
  const topCat = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0, 0, 0, 0);
  const thisWeekExp = expenses.filter(t => t.date >= weekStart).reduce((s, t) => s + t.amount, 0);
  const thisWeekInc = income.filter(t => t.date >= weekStart).reduce((s, t) => s + t.amount, 0);

  const todayExp = expenses.filter(t => t.date.toDateString() === now.toDateString()).reduce((s, t) => s + t.amount, 0);
  const totalBalance = state.cashBalance + state.mobileMoneyBalance + state.bankBalance;

  // ── Pattern matching ─────────────────────────────────────────────────
  const matches = (keywords: string[]) => keywords.some(k => lower.includes(k));

  // Balance / how much
  if (matches(['balance', 'bakaa', 'baki', 'how much do i have', 'nina kiasi'])) {
    return lang === 'sw'
      ? `Bakaa yako: ${fmt(totalBalance)}. 💵 Taslimu: ${fmt(state.cashBalance)}, 📱 Mobile: ${fmt(state.mobileMoneyBalance)}, 🏦 Benki: ${fmt(state.bankBalance)}.`
      : `Your balance: ${fmt(totalBalance)}. 💵 Cash: ${fmt(state.cashBalance)}, 📱 Mobile: ${fmt(state.mobileMoneyBalance)}, 🏦 Bank: ${fmt(state.bankBalance)}.`;
  }

  // Where did money go / spending
  if (matches(['where', 'wapi', 'pesa zangu', 'money go', 'spent on', 'spending', 'matumizi'])) {
    if (topCat.length === 0) {
      return lang === 'sw' ? 'Bado haujafanya matumizi yoyote.' : 'No expenses recorded yet.';
    }
    const top3 = topCat.slice(0, 3).map(([cat, amt]) => `${getCategoryIcon(cat)} ${cat}: ${fmt(amt)}`).join(', ');
    return lang === 'sw'
      ? `Matumizi makubwa: ${top3}.`
      : `Top spending categories: ${top3}.`;
  }

  // Today
  if (matches(['leo', 'today', 'siku ya leo'])) {
    return lang === 'sw'
      ? `Leo umetumia ${fmt(todayExp)}. ${todayExp > 10000 ? 'Angalia matumizi yako! ⚠️' : 'Uko vizuri. ✅'}`
      : `Today you spent ${fmt(todayExp)}. ${todayExp > 10000 ? 'Watch your spending! ⚠️' : "You're doing well. ✅"}`;
  }

  // This week
  if (matches(['wiki', 'week', 'this week', 'wiki hii'])) {
    const net = thisWeekInc - thisWeekExp;
    return lang === 'sw'
      ? `Wiki hii: Mapato ${fmt(thisWeekInc)}, Matumizi ${fmt(thisWeekExp)}. ${net >= 0 ? `Umeokolewa ${fmt(net)} 🎉` : `Hasara ya ${fmt(Math.abs(net))} ⚠️`}`
      : `This week: Income ${fmt(thisWeekInc)}, Spent ${fmt(thisWeekExp)}. ${net >= 0 ? `Saved ${fmt(net)} 🎉` : `Overspent by ${fmt(Math.abs(net))} ⚠️`}`;
  }

  // Budget status
  if (matches(['budget', 'bajeti', 'on track', 'on budget'])) {
    const over = Object.entries(state.categoryBudgets).filter(([cat, limit]) => (byCategory[cat] || 0) > limit);
    if (over.length === 0 && Object.keys(state.categoryBudgets).length === 0) {
      return lang === 'sw' ? 'Hujaweka bajeti bado. Nenda Mipangilio → Weka Mipaka.' : 'No budget limits set yet. Go to Budget Health → Set Limits.';
    }
    if (over.length === 0) {
      return lang === 'sw' ? 'Uko kwenye bajeti. Endelea hivyo! 🎉' : "You're within budget on all categories! 🎉";
    }
    const overNames = over.map(([cat]) => `${getCategoryIcon(cat)} ${cat}`).join(', ');
    return lang === 'sw' ? `Umezidi bajeti: ${overNames}. Punguza matumizi.` : `Over budget in: ${overNames}. Try to reduce spending.`;
  }

  // Goal progress
  if (matches(['goal', 'lengo', 'target', 'save', 'akiba', 'saving'])) {
    const active = state.goals.filter(g => !g.completed);
    if (active.length === 0) return lang === 'sw' ? 'Huna malengo ya sasa.' : 'You have no active goals.';
    const g = active[0];
    const pct = Math.round((g.current / g.target) * 100);
    const remaining = g.target - g.current;
    return lang === 'sw'
      ? `Lengo "${g.title}": ${pct}% imekamilika. Imebaki ${fmt(remaining)}.`
      : `Goal "${g.title}": ${pct}% complete. ${fmt(remaining)} remaining.`;
  }

  // Food / specific categories
  for (const [cat, amt] of topCat) {
    const catLower = cat.toLowerCase();
    if (lower.includes(catLower) || lower.includes(catLower.replace('&', 'and'))) {
      const budget = state.categoryBudgets[cat];
      const budgetInfo = budget ? (lang === 'sw' ? ` (Bajeti: ${fmt(budget)})` : ` (Budget: ${fmt(budget)})`) : '';
      return lang === 'sw'
        ? `${getCategoryIcon(cat)} ${cat}: umetumia ${fmt(amt)} jumla.${budgetInfo}`
        : `${getCategoryIcon(cat)} ${cat}: you've spent ${fmt(amt)} total.${budgetInfo}`;
    }
  }

  // Streak
  if (matches(['streak', 'mfululizo', 'days'])) {
    return lang === 'sw'
      ? `Mfululizo wako: ${state.streak} siku! ${state.streak >= 7 ? 'Hongera sana! 🔥' : 'Endelea kurekodi!'}`
      : `Your streak: ${state.streak} days! ${state.streak >= 7 ? 'Amazing! 🔥' : 'Keep logging daily!'}`;
  }

  // Net worth
  if (matches(['net worth', 'thamani', 'worth', 'assets', 'rasilimali'])) {
    const nw = (state.cashBalance + state.mobileMoneyBalance + state.bankBalance) - state.loanBalance;
    return lang === 'sw'
      ? `Thamani halisi yako: ${fmt(nw)}. Rasilimali: ${fmt(state.cashBalance + state.mobileMoneyBalance + state.bankBalance)}, Madeni: ${fmt(state.loanBalance)}.`
      : `Your net worth: ${fmt(nw)}. Assets: ${fmt(state.cashBalance + state.mobileMoneyBalance + state.bankBalance)}, Liabilities: ${fmt(state.loanBalance)}.`;
  }

  // Tip / coaching
  if (matches(['tip', 'advice', 'coaching', 'ushauri', 'nisaidie', 'help me'])) {
    const tips = {
      sw: [
        'Hifadhi 20% ya mapato yako kabla ya kutumia. Jaribu mbinu ya "ulipe mwenyewe kwanza".',
        'Tumia M-Pesa savings badala ya kutunza pesa mfukoni — zinakua kidogo.',
        'Nunua chakula sokoni badala ya supermarket — unaokoa hadi 30%.',
        'Weka bajeti kwa chakula siku ya Jumapili — inakusaidia kujua unatumia kiasi gani.',
      ],
      en: [
        'Save 20% of income before spending. Try the "pay yourself first" method.',
        'Use M-Pesa savings instead of cash — your money grows a little.',
        'Buy food at the market instead of supermarket — save up to 30%.',
        'Set a food budget every Sunday — helps you track weekly spending.',
      ],
    };
    const tip = tips[lang][Math.floor(Math.random() * tips[lang].length)];
    return `💡 ${tip}`;
  }

  // Default response
  const defaults = {
    sw: [
      `Unaweza kuniuliza: "Pesa zangu ziko wapi?", "Wiki hii nikitumia kiasi gani?", "Bajeti yangu iko sawa?", au "Nisaidie akiba".`,
      `Sina data ya kutosha kujibu hilo. Jaribu: "Ninavyotumia leo" au "Lengo langu liko wapi?"`,
    ],
    en: [
      `Try asking: "Where did my money go?", "How much did I spend this week?", "Am I on budget?", or "Give me a savings tip."`,
      `I don't have enough data for that. Try: "What did I spend today?" or "How's my goal going?"`,
    ],
  };
  return defaults[lang][Math.floor(Date.now() / 1000) % 2];
}

export function AIAssistant() {
  const { state } = useApp();
  const lang = state.language;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const QUICK_QUESTIONS = lang === 'sw'
    ? ['Pesa zangu ziko wapi?', 'Bajeti yangu iko sawa?', 'Leo nimetumia kiasi gani?', 'Lengo langu liko wapi?']
    : ["Where did my money go?", "Am I on budget?", "What did I spend today?", "How's my goal?"];

  const initMessages = (): Message[] => [{
    role: 'assistant',
    text: lang === 'sw'
      ? `Habari! Mimi ni msaidizi wako wa fedha wa PesaPlan. 🤖\nNiulize chochote kuhusu matumizi yako!`
      : `Hello! I'm your PesaPlan budget assistant. 🤖\nAsk me anything about your spending!`,
  }];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for open event fired by "Ask Assistant more" button in Dashboard
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setMessages(prev => prev.length === 0 ? initMessages() : prev);
    };
    window.addEventListener('pesaplan:open-ai', handler);
    return () => window.removeEventListener('pesaplan:open-ai', handler);
  }, [lang]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text };
    const reply = generateReply(text, state, lang);
    const botMsg: Message = { role: 'assistant', text: reply };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <>
      {/* Floating AI button — world-class redesign */}
      <motion.button
        onClick={() => { setOpen(true); if (messages.length === 0) setMessages(initMessages()); }}
        className="fixed bottom-20 right-4 z-40 w-16 h-16"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label="Open AI assistant"
      >
        {/* Pulse rings */}
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: `${1.8 - i * 0.4}px solid`,
              borderColor: i === 0
                ? 'rgba(52,211,153,0.85)'
                : i === 1
                ? 'rgba(20,184,166,0.55)'
                : 'rgba(16,185,129,0.30)',
              background: i === 0
                ? 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 65%)'
                : 'transparent',
              boxShadow: i === 0 ? '0 0 8px 1px rgba(52,211,153,0.25)' : 'none',
            }}
            animate={{
              scale: [1, 1.95 + i * 0.55],
              opacity: [0.9 - i * 0.18, 0],
            }}
            transition={{
              duration: 2.6 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.72,
              ease: [0.15, 0.6, 0.25, 0.95],
            }}
          />
        ))}

        {/* Main disc */}
        <motion.div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #059669 0%, #0d9488 45%, #065f46 100%)',
            boxShadow: '0 8px 32px rgba(5,150,105,0.55), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ scale: 0.86 }}
        >
          {/* Rotating shimmer ring */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 60%, rgba(255,255,255,0.22) 80%, transparent 100%)',
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Premium AI icon — geometric neural spark */}
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>
            {/* Outer glow halo */}
            <circle cx="15" cy="15" r="13.5" stroke="white" strokeOpacity="0.1" strokeWidth="1" />

            {/* 4-point star sparkle — main icon */}
            <path
              d="M15 4 C15 4 15.9 10.5 18.5 12.5 C21.1 14.5 27 15 27 15 C27 15 21.1 15.5 18.5 17.5 C15.9 19.5 15 26 15 26 C15 26 14.1 19.5 11.5 17.5 C8.9 15.5 3 15 3 15 C3 15 8.9 14.5 11.5 12.5 C14.1 10.5 15 4 15 4Z"
              fill="white"
              fillOpacity="0.95"
            />

            {/* Secondary small star — top right */}
            <path
              d="M22 6 C22 6 22.45 8.6 23.6 9.4 C24.75 10.2 27.2 10.4 27.2 10.4 C27.2 10.4 24.75 10.6 23.6 11.4 C22.45 12.2 22 14.8 22 14.8 C22 14.8 21.55 12.2 20.4 11.4 C19.25 10.6 16.8 10.4 16.8 10.4 C16.8 10.4 19.25 10.2 20.4 9.4 C21.55 8.6 22 6 22 6Z"
              fill="white"
              fillOpacity="0.65"
              transform="scale(0.58) translate(15.5, 2)"
            />

            {/* Tiny accent dot — bottom left */}
            <circle cx="8" cy="22" r="1.5" fill="white" fillOpacity="0.5" />
          </svg>

          {/* Live status dot */}
          <motion.span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-emerald-700"
            style={{ background: '#86efac' }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.button>

      {/* Chat sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl flex flex-col"
              style={{ height: '75vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white px-5 py-4 rounded-t-3xl flex items-center justify-between shrink-0">

                {/* Background decorative orbs */}
                <div className="pointer-events-none absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-4 left-10 w-20 h-20 rounded-full bg-teal-300/10 blur-xl" />

                {/* Subtle dot-grid texture overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '14px 14px',
                  }}
                />

                <div className="flex items-center gap-3 relative z-10">
                  {/* Avatar container — rotating conic shimmer ring */}
                  <div className="relative flex items-center justify-center">
                    {/* Outer shimmer ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          'conic-gradient(from 0deg, transparent 60%, rgba(255,255,255,0.55) 80%, transparent 100%)',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                      }}
                    />
                    {/* Inner disc */}
                    <div
                      className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: 42,
                        height: 42,
                        background:
                          'radial-gradient(circle at 35% 35%, #34d399, #059669 60%, #047857)',
                        boxShadow: '0 0 0 1.5px rgba(255,255,255,0.18) inset, 0 4px 12px rgba(0,0,0,0.25)',
                      }}
                    >
                      {/* 4-point geometric star icon */}
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        {/* Main 4-point star */}
                        <path
                          d="M11 2 C11 2 11.9 7.2 14.8 9.2 C17.7 11.2 22 11 22 11 C22 11 17.7 10.8 14.8 12.8 C11.9 14.8 11 20 11 20 C11 20 10.1 14.8 7.2 12.8 C4.3 10.8 0 11 0 11 C0 11 4.3 11.2 7.2 9.2 C10.1 7.2 11 2 11 2 Z"
                          fill="white"
                          fillOpacity="0.97"
                        />
                        {/* Small accent star top-right */}
                        <path
                          d="M18 2 C18 2 18.45 4.1 19.7 4.95 C20.95 5.8 23 5.75 23 5.75 C23 5.75 20.95 5.7 19.7 6.55 C18.45 7.4 18 9.5 18 9.5 C18 9.5 17.55 7.4 16.3 6.55 C15.05 5.7 13 5.75 13 5.75 C13 5.75 15.05 5.8 16.3 4.95 C17.55 4.1 18 2 18 2 Z"
                          fill="white"
                          fillOpacity="0.5"
                          transform="scale(0.38) translate(19, 0)"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Text info */}
                  <div>
                    <p className="font-bold text-sm tracking-wide">PesaPlan AI</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {/* Pulsing live status dot */}
                      <span className="relative flex h-2 w-2">
                        <motion.span
                          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                          className="absolute inline-flex h-full w-full rounded-full bg-emerald-200"
                        />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-300" />
                      </span>
                      <p className="text-xs text-white/75">
                        {lang === 'sw' ? 'Mshauri wa Fedha · Mtandaoni' : 'Financial Assistant · Online'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setOpen(false)}
                  className="relative z-10 p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors border border-white/20 backdrop-blur-sm"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Quick questions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-400 mb-2">
                    {lang === 'sw' ? '💬 Maswali ya haraka' : '💬 Quick questions'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {QUICK_QUESTIONS.map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 px-4 pb-5 pt-2 shrink-0 border-t border-gray-100">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
                  placeholder={lang === 'sw' ? 'Niulize chochote...' : 'Ask me anything...'}
                  className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}