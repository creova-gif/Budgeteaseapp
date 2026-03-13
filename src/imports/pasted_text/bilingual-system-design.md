Bilingual System Design (English + Swahili)

Your goal:
Users should be able to switch language instantly and the entire UI updates without breaking layouts.

Recommended approach:

Use react-i18next, which is widely used in production apps.

1️⃣ Install Translation Framework

Install dependencies:

npm install react-i18next i18next

Optional for detection:

npm install i18next-browser-languagedetector
2️⃣ Create Translation Files

Structure:

/src/locales/
   en/
      common.json
   sw/
      common.json

Example:

English
{
  "dashboard": "Dashboard",
  "income": "Income",
  "spent": "Spent",
  "left": "Left",
  "addExpense": "Add Expense",
  "addIncome": "Add Income",
  "recentTransactions": "Recent Transactions",
  "insightOfDay": "Insight of the Day"
}
Swahili
{
  "dashboard": "Dashibodi",
  "income": "Mapato",
  "spent": "Matumizi",
  "left": "Zilizobaki",
  "addExpense": "Ongeza Matumizi",
  "addIncome": "Ongeza Mapato",
  "recentTransactions": "Miamala ya Hivi Karibuni",
  "insightOfDay": "Ushauri wa Leo"
}
3️⃣ Initialize Language Engine

Create:

/src/i18n.ts

Example:

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/common.json";
import sw from "./locales/sw/common.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sw: { translation: sw }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
4️⃣ Use Translations in Components

Example in Dashboard:

import { useTranslation } from "react-i18next";

const { t } = useTranslation();

<h1>{t("dashboard")}</h1>

Now the text automatically changes based on language.

5️⃣ Language Toggle in Settings

Add a selector:

English 🇬🇧
Swahili 🇹🇿

Example:

i18n.changeLanguage("sw");

Persist the choice in storage:

Preferences.set("language", "sw")
6️⃣ Translate Dynamic Content

You must translate:

✔ UI labels
✔ insights
✔ notifications
✔ lessons
✔ challenge descriptions

Example:

Instead of:

"You are close to exceeding your transport budget"

Use:

t("transportWarning")
7️⃣ Localize Currency Format

East Africa primarily uses TZS, KES, UGX.

Format properly.

Example:

TSh 15,000

Swahili often uses:

TSh 15,000

but numeric grouping must remain consistent.

8️⃣ Swahili UX Considerations

Swahili text tends to be longer than English, so check:

button widths

card layouts

insight text limits

Example:

English:

Add Expense

Swahili:

Ongeza Matumizi
🔎 Bilingual System BRUTE AUDIT PROMPT

Use this to test the entire app.

ROLE

You are a mobile UX auditor and internationalization engineer.

Your task is to verify that the BudgetEase fintech app fully supports bilingual operation (English and Swahili) across all screens, features, and systems.

1️⃣ LANGUAGE SWITCH TEST

Test switching languages.

Steps:

Open settings

Select Swahili

Navigate through entire app

Verify:

✔ UI instantly updates
✔ no page reload required
✔ language preference persists

2️⃣ SCREEN COVERAGE TEST

Ensure translation exists on all screens:

Onboarding
Dashboard
Goals
History
Insights
Settings
Notifications
Challenges
Education

Flag any untranslated strings.

3️⃣ DYNAMIC CONTENT TEST

Verify translated dynamic text:

alerts
insights
lesson titles
challenge descriptions

Ensure translation keys are used.

4️⃣ LAYOUT BREAK TEST

Check if Swahili breaks UI.

Examples:

buttons overflow
cards expand
icons misaligned

Flag layout issues.

5️⃣ NUMBER & CURRENCY TEST

Verify consistent formatting:

TSh 10,000

Ensure numbers remain readable in both languages.

6️⃣ NOTIFICATION LANGUAGE TEST

Generate notifications in both languages.

Examples:

English:

Transport budget almost exceeded

Swahili:

Bajeti ya usafiri karibu imevuka

Ensure notifications respect selected language.

7️⃣ SHARE MESSAGE TEST

Test the share system.

Verify message output:

English:

I saved TSh 15,000 using BudgetEase.

Swahili:

Nimehifadhi TSh 15,000 kwa kutumia BudgetEase.
8️⃣ LESSON SYSTEM TEST

Ensure education content supports both languages.

Check:

✔ lesson titles
✔ lesson descriptions
✔ progress labels

9️⃣ CHALLENGE SYSTEM TEST

Verify challenge descriptions.

Example:

30 Day Saving Sprint

Swahili:

Mbio za Kuokoa za Siku 30
🔟 FINAL LANGUAGE SCORE

Provide scores:

Category	Score
Translation coverage	
UI stability	
Localization quality	
User comprehension	
Deployment Verdict

Return:

BILINGUAL READY
OR
LANGUAGE SYSTEM NOT READY

✅ If you implement this correctly, your app will feel native to East African users, which is a major competitive advantage over Western budgeting apps like Mint and YNAB.