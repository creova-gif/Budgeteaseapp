# PesaPlan - Budget App

## Overview
PesaPlan is a personal finance management web application with features for budgeting, transaction tracking, savings goals, and financial education. Supports English and Swahili languages.

## Tech Stack
- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4, Radix UI, Lucide React
- **State:** React Context API
- **i18n:** i18next + react-i18next
- **Charts:** recharts
- **Animations:** Framer Motion (motion)
- **Package Manager:** npm

## Project Structure
- `src/main.tsx` - Entry point
- `src/i18n.ts` - Internationalization config
- `src/app/App.tsx` - Main app with global state/routing
- `src/app/components/dashboard/` - Dashboard feature components
- `src/app/components/onboarding/` - Onboarding flow
- `src/app/components/ui/` - Reusable UI primitives
- `src/styles/` - Global CSS and Tailwind config

## Development
- Run: `npm run dev` (serves on port 5000)
- Build: `npm run build`

## Replit Configuration
- Frontend runs on port 5000 (0.0.0.0)
- Vite configured with `allowedHosts: true` for proxy compatibility
- Deployment: static site (builds to `dist/`)
