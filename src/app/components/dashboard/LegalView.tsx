import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Shield, FileText, ChevronDown, ChevronUp, Mail, Globe } from 'lucide-react';
import { useApp } from '@/app/App';

/**
 * Audit Items 9 + 10 — App Store Policy & Privacy/Legal Compliance
 * Privacy Policy + Terms of Service (bilingual Swahili/English)
 * Required by Apple App Store, Google Play, and GDPR-style standards.
 */

interface LegalViewProps {
  onBack: () => void;
}

type Tab = 'privacy' | 'terms';

interface Section {
  id: string;
  title: { sw: string; en: string };
  body: { sw: string; en: string };
}

const PRIVACY_SECTIONS: Section[] = [
  {
    id: 'intro',
    title: { sw: 'Utangulizi', en: 'Introduction' },
    body: {
      sw: 'PesaPlan ("Programu", "Sisi") inakuheshimu faragha yako. Sera hii ya faragha inaelezea jinsi tunavyokusanya, kutumia, na kulinda taarifa zako unapotumia programu yetu ya bajeti.',
      en: 'PesaPlan ("App", "We") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our budgeting application.',
    },
  },
  {
    id: 'data-collected',
    title: { sw: 'Data Tunazokusanya', en: 'Data We Collect' },
    body: {
      sw: 'Tunakusanya data zifuatazo:\n• Miamala ya fedha (kiasi, aina, jamii, chanzo, maelezo)\n• Malengo ya akiba na maendeleo yake\n• Mipangilio ya lugha na aina ya mtumiaji\n• Rekodi ya akiba na bajeti\n\nHATUKUSANYI: jina lako la kweli, namba ya simu, barua pepe, au taarifa yoyote ya utambulisho wa kibinafsi.',
      en: 'We collect the following data:\n• Financial transactions (amount, type, category, source, notes)\n• Savings goals and progress\n• Language and user type preferences\n• Budget and savings records\n\nWE DO NOT COLLECT: your real name, phone number, email, or any personally identifiable information.',
    },
  },
  {
    id: 'storage',
    title: { sw: 'Uhifadhi wa Data', en: 'Data Storage' },
    body: {
      sw: 'Data zote huhifadhiwa NDANI ya kifaa chako peke yake kwa kutumia localStorage ya kivinjari. Hatutumi data yako kwa seva yoyote ya nje. Hii inamaanisha:\n• Data yako haifiki mtandaoni bila idhini yako\n• Kufuta programu au kufuta akiba ya kivinjari kutafuta data yako\n• Haiwezekani kurejesha data iliyofutwa',
      en: 'All data is stored LOCALLY on your device only using browser localStorage. We do not transmit your data to any external server. This means:\n• Your data never leaves your device without your permission\n• Uninstalling the app or clearing browser storage will delete your data\n• Deleted data cannot be recovered',
    },
  },
  {
    id: 'third-party',
    title: { sw: 'Watu wa Tatu', en: 'Third Parties' },
    body: {
      sw: 'PesaPlan haitumii wala kushiriki data yako na kampuni yoyote ya nje. Programu inafanya kazi nje ya mtandao (offline) na haihitaji muunganisho wa intaneti kwa kazi zake za msingi.',
      en: 'PesaPlan does not sell or share your data with any third parties. The app operates offline and does not require an internet connection for its core functions.',
    },
  },
  {
    id: 'rights',
    title: { sw: 'Haki Zako', en: 'Your Rights' },
    body: {
      sw: 'Una haki zifuatazo:\n• Kuona data zako zote (zinaweza kupakuliwa kama CSV)\n• Kufuta data zako zote (Mipangilio → Futa Data)\n• Kubadilisha lugha wakati wowote\n• Kutoa idhini ya kutumia programu wakati wowote',
      en: 'You have the following rights:\n• View all your data (downloadable as CSV)\n• Delete all your data (Settings → Delete Data)\n• Change language at any time\n• Withdraw consent to use the app at any time',
    },
  },
  {
    id: 'minors',
    title: { sw: 'Watoto', en: 'Minors' },
    body: {
      sw: 'PesaPlan imetengenezwa kwa watu wazima wenye umri wa miaka 13 na zaidi. Hatukusanyi kwa makusudi data ya watoto chini ya miaka 13.',
      en: 'PesaPlan is designed for users aged 13 and older. We do not knowingly collect data from children under 13 years of age.',
    },
  },
  {
    id: 'changes',
    title: { sw: 'Mabadiliko ya Sera', en: 'Policy Changes' },
    body: {
      sw: 'Tunaweza kubadilisha Sera hii ya Faragha mara kwa mara. Mabadiliko yatakuwa na tarehe iliyosasishwa. Matumizi yako yanayoendelea ya programu baada ya mabadiliko yanakubaliana na sera mpya.',
      en: 'We may update this Privacy Policy periodically. Changes will include an updated date. Your continued use of the app after changes constitutes acceptance of the new policy.',
    },
  },
  {
    id: 'contact',
    title: { sw: 'Wasiliana Nasi', en: 'Contact Us' },
    body: {
      sw: 'Kwa maswali kuhusu faragha:\n📧 support@pesaplan.tz\n🌐 www.pesaplan.tz\n📍 Dar es Salaam, Tanzania',
      en: 'For privacy questions:\n📧 support@pesaplan.tz\n🌐 www.pesaplan.tz\n📍 Dar es Salaam, Tanzania',
    },
  },
];

const TERMS_SECTIONS: Section[] = [
  {
    id: 'agreement',
    title: { sw: 'Makubaliano', en: 'Agreement' },
    body: {
      sw: 'Kwa kutumia PesaPlan, unakubaliana na Masharti haya ya Huduma. Ikiwa hukubaliani, tafadhali acha kutumia programu.',
      en: 'By using PesaPlan, you agree to these Terms of Service. If you do not agree, please discontinue use of the app.',
    },
  },
  {
    id: 'service',
    title: { sw: 'Huduma Inayotolewa', en: 'Service Provided' },
    body: {
      sw: 'PesaPlan ni programu ya usimamizi wa fedha binafsi. Inakusaidia:\n• Kurekodi mapato na matumizi\n• Kufuatilia malengo ya akiba\n• Kupata maarifa ya matumizi yako\n\nHAITOLEI ushauri wa uwekezaji wa kitaalamu wala huduma za benki.',
      en: 'PesaPlan is a personal finance management app. It helps you:\n• Record income and expenses\n• Track savings goals\n• Get spending insights\n\nIt does NOT provide professional investment advice or banking services.',
    },
  },
  {
    id: 'accuracy',
    title: { sw: 'Usahihi wa Data', en: 'Data Accuracy' },
    body: {
      sw: 'Wewe peke yako una jukumu la usahihi wa data unayoingiza. PesaPlan haitoi uhakika kwamba hesabu au ushauri wowote ndani ya programu ni sahihi kwa maamuzi yako ya kibinafsi ya fedha.',
      en: 'You are solely responsible for the accuracy of data you enter. PesaPlan does not guarantee that any calculations or insights are accurate for your personal financial decisions.',
    },
  },
  {
    id: 'liability',
    title: { sw: 'Mipaka ya Wajibu', en: 'Limitation of Liability' },
    body: {
      sw: 'PesaPlan haitawajibika kwa:\n• Hasara za fedha zilizotokana na matumizi ya programu\n• Upotezaji wa data kutokana na hitilafu za kifaa\n• Maamuzi ya fedha yaliyofanywa kulingana na maarifa ya programu\n\nTumia programu kwa hatari yako mwenyewe.',
      en: 'PesaPlan is not liable for:\n• Financial losses resulting from use of the app\n• Data loss due to device failures\n• Financial decisions made based on app insights\n\nUse the app at your own risk.',
    },
  },
  {
    id: 'ip',
    title: { sw: 'Haki za Miliki ya Akili', en: 'Intellectual Property' },
    body: {
      sw: 'Yaliyomo yote ya PesaPlan — ikiwemo muundo, msimbo, na maudhui — yamepewa haki miliki. Hairuhusiwi kunakili, kusambaza, au kubadilisha programu bila idhini ya maandishi.',
      en: 'All PesaPlan content — including design, code, and content — is protected by intellectual property rights. You may not copy, distribute, or modify the app without written permission.',
    },
  },
  {
    id: 'termination',
    title: { sw: 'Kusimamishwa', en: 'Termination' },
    body: {
      sw: 'Unaweza kusimamisha matumizi yako wakati wowote kwa kufuta data yako na kuacha kutumia programu. Hatuna uwezo wa kusimamisha akaunti yako kwa sababu hatunzi akaunti zozote.',
      en: 'You can terminate your use at any time by deleting your data and discontinuing app use. We cannot terminate your account as we do not maintain any accounts.',
    },
  },
  {
    id: 'governing-law',
    title: { sw: 'Sheria Inayotumika', en: 'Governing Law' },
    body: {
      sw: 'Masharti haya yanafuata sheria za Jamhuri ya Muungano wa Tanzania. Migogoro yoyote itashughulikiwa mahakamani huko Dar es Salaam, Tanzania.',
      en: 'These Terms are governed by the laws of the United Republic of Tanzania. Any disputes will be handled in courts in Dar es Salaam, Tanzania.',
    },
  },
  {
    id: 'updates',
    title: { sw: 'Masharti Mapya', en: 'Updated Terms' },
    body: {
      sw: 'Tunaweza kusasisha Masharti haya wakati wowote. Tarehe ya "Ilisasishwa Mara ya Mwisho" itabadilika. Matumizi yanayoendelea yanawakilisha makubaliano.',
      en: 'We may update these Terms at any time. The "Last Updated" date will change. Continued use represents acceptance.',
    },
  },
];

function AccordionSection({ section, lang }: { section: Section; lang: 'sw' | 'en' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`legal-${section.id}`}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{section.title[lang]}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={`legal-${section.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {section.body[lang]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LegalView({ onBack }: LegalViewProps) {
  const { state } = useApp();
  const lang = state.language;
  const [tab, setTab] = useState<Tab>('privacy');

  const LAST_UPDATED = '12 Machi 2026 / 12 March 2026';

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            aria-label={lang === 'sw' ? 'Rudi nyuma' : 'Go back'}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black">
            {lang === 'sw' ? 'Kisheria & Faragha' : 'Legal & Privacy'}
          </h1>
        </div>
        <p className="text-xs text-white/60 ml-12">
          {lang === 'sw' ? 'Ilisasishwa Mara ya Mwisho:' : 'Last Updated:'} {LAST_UPDATED}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-4 pt-4 mb-1">
        <div className="flex bg-white rounded-2xl shadow-sm p-1 gap-1">
          {([
            { id: 'privacy', icon: Shield, sw: 'Sera ya Faragha', en: 'Privacy Policy' },
            { id: 'terms', icon: FileText, sw: 'Masharti ya Huduma', en: 'Terms of Service' },
          ] as const).map(({ id, icon: Icon, sw, en }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                tab === id ? 'bg-gray-900 text-white shadow' : 'text-gray-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {lang === 'sw' ? sw : en}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="px-4 mt-3"
        >
          {/* Summary banner */}
          <div className={`rounded-2xl p-4 mb-3 ${tab === 'privacy' ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-start gap-2">
              {tab === 'privacy'
                ? <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                : <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              }
              <p className={`text-xs leading-relaxed ${tab === 'privacy' ? 'text-emerald-800' : 'text-blue-800'}`}>
                {tab === 'privacy'
                  ? (lang === 'sw'
                    ? '🔒 Data zako zote zinabaki kwenye kifaa chako. Hatutumi chochote nje. Hakuna akaunti. Hakuna seva.'
                    : '🔒 All your data stays on your device. We send nothing outside. No accounts. No servers.')
                  : (lang === 'sw'
                    ? '📋 Programu hii ni chombo tu. Wewe ni mwenye maamuzi ya fedha zako. Hatutoi ushauri wa kitaalamu wa uwekezaji.'
                    : '📋 This app is a tool only. You own your financial decisions. We do not provide professional investment advice.')
                }
              </p>
            </div>
          </div>

          {/* Accordion sections */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {(tab === 'privacy' ? PRIVACY_SECTIONS : TERMS_SECTIONS).map(section => (
              <AccordionSection key={section.id} section={section} lang={lang} />
            ))}
          </div>

          {/* Contact footer */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-bold text-gray-700 mb-2">
              {lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">support@pesaplan.tz</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">www.pesaplan.tz</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}