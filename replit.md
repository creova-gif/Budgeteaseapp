# PesaPlan - Budget App

## Overview
PesaPlan is a bilingual (Swahili/English) personal finance web app for East Africa. Supports M-Pesa/Airtel/Tigo/bank/cash transactions, savings goals, budget limits, spending insights, and financial education. Fully offline-first (localStorage only, no backend).

## Tech Stack
- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 6.4.2
- **Styling:** Tailwind CSS 4, Radix UI, Lucide React
- **State:** React Context API (`AppContext` in `App.tsx`), persisted to `localStorage` key `pesaplan_v1`
- **i18n:** i18next + react-i18next + custom `translations.ts`
- **Charts:** recharts
- **Animations:** Framer Motion (motion/react)
- **Package Manager:** npm

## Project Structure
- `src/main.tsx` - Entry point
- `src/i18n.ts` - Internationalization config
- `src/app/App.tsx` - Global state, context, AppProvider. Key state: transactions, goals, balances, budgets, streak, userName, appLock, etc.
- `src/app/components/dashboard/` - All dashboard components (Dashboard.tsx, GoalsView, HistoryView, InsightsView, SettingsView, etc.)
- `src/app/components/onboarding/` - Onboarding flow (language, region, user type, income frequency, goal setup)
- `src/app/components/ui/` - Reusable UI primitives
- `src/app/utils/` - translations.ts, currency.ts, categoryIcons.ts, analytics.ts
- `src/styles/` - Global CSS and Tailwind config

## Key Features
- **Transactions**: add/edit/delete, custom date picker (past dates), swipe gestures, 2-tap delete confirmation
- **Repeat last expense**: "Repeat" quick action button prefills last expense details
- **Tab swipe navigation**: swipe left/right to change tabs (80px threshold, 2.5x horizontal ratio)
- **Week-over-week comparison**: badge shown when period='week' with % change vs previous week
- **Budget alerts**: pulsing animation for over-budget categories, progress bars for near-budget
- **Spending insight card**: AI-style insight after pie chart on home screen
- **Date range filtering** in HistoryView: Today / This Week / This Month / All Time chips
- **User name personalization**: set in Settings, shown in home screen greeting
- **PIN lock**: 4-digit app lock settable in Settings (hashed with custom hashPin)
- **Goals**: savings goals with contribution tracking and progress rings
- **CSV export**: export all transactions to CSV
- **AI Assistant**: natural language spending queries
- **Notification center**: budget alerts, milestone notifications, streak reminders

## Development
- Run: `npm run dev` (serves on port 5000)
- Build: `npm run build`

## Replit Configuration
- Frontend runs on port 5000 (0.0.0.0)
- Vite configured with `allowedHosts: true` for proxy compatibility
- Deployment: static site (builds to `dist/`)
