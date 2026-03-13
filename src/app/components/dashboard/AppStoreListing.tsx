import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Star, Globe, Shield, Smartphone, Tag } from 'lucide-react';
import { useApp } from '@/app/App';
import { AppIcon } from './AppIconPreview';

/**
 * Audit Item #19 — App Store Assets
 * Displays a draft App Store listing inside the app for review & launch prep.
 * Covers: App name, description, keywords, age rating, category, screenshots.
 */

const DESCRIPTION_EN = `PesaPlan is East Africa's smartest personal finance app — built from the ground up for M-Pesa, Airtel Money, and Tigo Pesa users in Tanzania and across the region.

TRACK EVERY SHILLING
• Log income and expenses in under 5 seconds
• Supports Cash, M-Pesa, Airtel Money, Tigo Pesa, and Bank
• Smart auto-categorization (Food, Transport, Rent, Data, Health & more)

BILINGUAL — SWAHILI & ENGLISH
• Full Swahili and English interface
• Switch languages instantly, anytime
• All legal documents in both languages

SMART BUDGETING
• Set spending limits per category
• Get real-time alerts before you overspend
• Smart Budget Builder based on your income pattern

SAVINGS GOALS & CHALLENGES
• Create personalized savings goals with deadlines
• Join 30-day savings challenges
• Round-up savings on every expense automatically

AI FINANCIAL ASSISTANT
• Ask PesaPlan AI anything about your money
• Get personalized tips in Swahili or English
• Powered by your own spending data — fully private

100% OFFLINE — YOUR DATA STAYS PRIVATE
• No account or sign-up required
• No data ever sent to external servers
• All data stored securely on your device

BUILT FOR EAST AFRICA
• Handles irregular income (daily, weekly, monthly)
• Works for students, traders, families, and informal workers
• Currency: Tanzanian Shilling (TZS)
• Made in Dar es Salaam 🇹🇿`;

const DESCRIPTION_SW = `PesaPlan ni programu bora zaidi ya fedha za kibinafsi Afrika Mashariki — imetengenezwa maalum kwa watumiaji wa M-Pesa, Airtel Money, na Tigo Pesa nchini Tanzania na mkoa wote.

FUATILIA KILA SHILINGI
• Rekodi mapato na matumizi kwa sekunde chini ya 5
• Inasaidia Taslimu, M-Pesa, Airtel Money, Tigo Pesa, na Benki
• Kugundua jamii otomatifu (Chakula, Usafiri, Kodi, Data, Afya na zaidi)

LUGHA MBILI — KISWAHILI & KIINGEREZA
• Kiolesura kamili katika Kiswahili na Kiingereza
• Badilisha lugha wakati wowote
• Nyaraka zote za kisheria katika lugha zote mbili

BAJETI MAHIRI
• Weka mipaka ya matumizi kwa kila jamii
• Pokea arifa za wakati halisi kabla ya kuzidi bajeti
• Muundaji wa Bajeti Mahiri kulingana na mfumo wako wa mapato

MALENGO NA CHANGAMOTO ZA AKIBA
• Unda malengo ya akiba ya kibinafsi na muda maalum
• Jiunge na changamoto za akiba za siku 30
• Akiba ya round-up katika kila matumizi otomatifu

MSHAURI WA AI WA FEDHA
• Uliza PesaPlan AI chochote kuhusu pesa zako
• Pata vidokezo vya kibinafsi kwa Kiswahili au Kiingereza
• Inafanya kazi na data yako — faragha kamili

100% BEZ YA INTANETI — DATA YAKO INABAKI SALAMA
• Hakuna akaunti au usajili unaohitajika
• Hakuna data inayotumwa kwa seva za nje kamwe
• Data yote imehifadhiwa salama kwenye kifaa chako

IMETENGENEZWA KWA AFRIKA MASHARIKI
• Inashughulikia mapato yasiyo ya kawaida (ya kila siku, wiki, mwezi)
• Inafanya kazi kwa wanafunzi, wafanyabiashara, familia, na wafanyakazi wa kawaida
• Sarafu: Shilingi ya Tanzania (TZS)
• Imetengenezwa Dar es Salaam 🇹🇿`;

const KEYWORDS = [
  'budget Tanzania', 'M-Pesa tracker', 'Airtel Money', 'Tigo Pesa',
  'bajeti', 'akiba', 'pesa', 'finance app East Africa',
  'expense tracker Swahili', 'offline budgeting', 'mobile money budget',
  'savings goals Tanzania', 'TZS currency', 'Swahili finance',
];

const SCREENSHOTS = [
  { label: 'Dashboard', emoji: '🏠', desc: 'Total balance, income/expense summary, quick actions' },
  { label: 'Add Transaction', emoji: '➕', desc: 'Fast entry with M-Pesa/Cash/Airtel/Tigo sources' },
  { label: 'Budget Health', emoji: '📊', desc: 'Real-time spending bars per category' },
  { label: 'Savings Goals', emoji: '🎯', desc: 'Goal progress with contribution tracking' },
  { label: 'AI Assistant', emoji: '🤖', desc: 'Bilingual financial advisor chat' },
  { label: 'Insights', emoji: '📈', desc: 'Spending patterns and cashflow forecast' },
];

export function AppStoreListing() {
  const { state } = useApp();
  const lang = state.language;
  const [expanded, setExpanded] = useState(false);
  const [descLang, setDescLang] = useState<'en' | 'sw'>('en');

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full"
        aria-expanded={expanded}
        aria-label={lang === 'sw' ? 'Angalia maelezo ya App Store' : 'View App Store listing draft'}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* App icon preview */}
              <AppIcon size={48} />
              <div className="text-left">
                <p className="font-black text-sm">PesaPlan</p>
                <p className="text-xs text-white/70">
                  {lang === 'sw' ? 'Muswada wa Orodha ya App Store' : 'App Store Listing Draft'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                <p className="text-xs font-black">Draft</p>
                <p className="text-[10px] text-white/70">{lang === 'sw' ? 'Tayari' : 'Ready'}</p>
              </div>
              {expanded
                ? <ChevronUp className="w-4 h-4 text-white/70" />
                : <ChevronDown className="w-4 h-4 text-white/70" />}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
              {[
                { icon: Globe, label: lang === 'sw' ? 'Jamii' : 'Category', value: 'Finance' },
                { icon: Shield, label: lang === 'sw' ? 'Umri' : 'Age Rating', value: '13+' },
                { icon: Smartphone, label: lang === 'sw' ? 'Majukwaa' : 'Platforms', value: 'iOS · Android' },
                { icon: Tag, label: lang === 'sw' ? 'Bei' : 'Price', value: lang === 'sw' ? 'Bure' : 'Free' },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-3 ${i % 2 === 0 ? 'border-r' : ''} border-b border-gray-100`}>
                  <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="text-xs font-bold text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rating preview */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-amber-50">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-amber-800 font-medium">
                {lang === 'sw' ? 'Mapitio mapya — hakuna bado' : 'New release — no reviews yet'}
              </p>
            </div>

            {/* Description */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  {lang === 'sw' ? 'Maelezo' : 'Description'}
                </p>
                <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
                  {(['en', 'sw'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setDescLang(l)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        descLang === l ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {l === 'en' ? '🇬🇧 EN' : '🇹🇿 SW'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {descLang === 'en' ? DESCRIPTION_EN : DESCRIPTION_SW}
              </p>
            </div>

            {/* Keywords */}
            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                {lang === 'sw' ? 'Maneno ya Utafutaji' : 'Search Keywords'}
                <span className="ml-2 font-normal text-gray-400 normal-case">
                  ({KEYWORDS.length}/{lang === 'sw' ? 'inayopendekezwa 100' : '100 recommended'})
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {KEYWORDS.map(kw => (
                  <span key={kw} className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Screenshots checklist */}
            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                {lang === 'sw' ? 'Picha za Skrini' : 'Screenshots'}
                <span className="ml-2 font-normal text-gray-400 normal-case">
                  ({SCREENSHOTS.length} {lang === 'sw' ? 'zinazohitajika' : 'required'})
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {SCREENSHOTS.map((ss, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 text-center"
                  >
                    <div className="text-2xl mb-1">{ss.emoji}</div>
                    <p className="text-[10px] font-bold text-gray-700">{ss.label}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{ss.desc}</p>
                  </motion.div>
                ))}
              </div>
              <p className="text-[10px] text-orange-500 font-medium mt-2 flex items-center gap-1">
                ⚠️ {lang === 'sw'
                  ? 'Picha za skrini za kweli zinahitajika kabla ya kuwasilisha.'
                  : 'Real device screenshots required before submission.'}
              </p>
            </div>

            {/* Submission checklist */}
            <div className="px-4 py-4 bg-gray-50">
              <p className="text-xs font-bold text-gray-700 mb-3">
                {lang === 'sw' ? '✅ Orodha ya Kuwasilisha' : '✅ Submission Checklist'}
              </p>
              {[
                { done: true, label: lang === 'sw' ? 'Sera ya Faragha (ndani ya programu)' : 'Privacy Policy (in-app)' },
                { done: true, label: lang === 'sw' ? 'Masharti ya Huduma (ndani ya programu)' : 'Terms of Service (in-app)' },
                { done: true, label: lang === 'sw' ? 'Ufutaji wa Data wa GDPR' : 'GDPR Data Deletion' },
                { done: true, label: lang === 'sw' ? 'Kazi bila Intaneti' : 'Offline Functionality' },
                { done: true, label: lang === 'sw' ? 'Maelezo ya App Store (Kiingereza)' : 'App Store Description (English)' },
                { done: true, label: lang === 'sw' ? 'Maelezo ya App Store (Kiswahili)' : 'App Store Description (Swahili)' },
                { done: false, label: lang === 'sw' ? 'Ikoni ya Programu (1024×1024px PNG)' : 'App Icon (1024×1024px PNG)' },
                { done: false, label: lang === 'sw' ? 'Picha za Skrini (iPhone 6.7" + 6.5" + 5.5")' : 'Screenshots (iPhone 6.7" + 6.5" + 5.5")' },
                { done: false, label: lang === 'sw' ? 'Picha za Skrini (Android Phone + Tablet)' : 'Screenshots (Android Phone + Tablet)' },
                { done: false, label: lang === 'sw' ? 'Firebase Crashlytics kwa uzalishaji' : 'Firebase Crashlytics for production' },
              ].map(({ done, label }, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <span className={`text-sm shrink-0 mt-0.5 ${done ? 'text-emerald-500' : 'text-gray-300'}`}>
                    {done ? '✅' : '⬜'}
                  </span>
                  <p className={`text-xs ${done ? 'text-gray-700' : 'text-gray-400'}`}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}