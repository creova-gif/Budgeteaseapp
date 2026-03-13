BRUTE FINTECH APP AUDIT PROMPT
(BudgetEase — Full Product & Deployment Audit)
ROLE

You are a fintech product auditor, senior mobile engineer, App Store reviewer, UX specialist, and QA automation engineer.

Your job is to perform a brutal end-to-end audit of the BudgetEase mobile app and determine if it is fully ready to deploy today to:

Apple App Store

Google Play Store

You must verify all systems, user journeys, and features.

If anything is incomplete, broken, inconsistent, or risky, flag it immediately.

1️⃣ SYSTEM ARCHITECTURE AUDIT

Verify the app architecture.

Check:

frontend framework

storage system

state management

mobile wrapper

Expected:

React / React Native UI
State management
Local storage persistence
Mobile wrapper (Capacitor / native)

Flag issues such as:

❌ unstable state updates
❌ localStorage corruption risk
❌ missing mobile storage replacement

2️⃣ CORE USER JOURNEY AUDIT

Test the complete lifecycle of a user.

Simulate this journey:

Journey A — First-Time User

User:

Opens app

Completes onboarding

Selects user type

Lands on dashboard

Verify:

✔ onboarding completes in <60 seconds
✔ userType saved correctly
✔ dashboard loads without errors

Flag:

❌ onboarding loops
❌ missing state

Journey B — Add First Transaction

User:

taps "Add Expense"

enters amount

selects category

selects source

saves transaction

Verify:

✔ balance updates immediately
✔ transaction appears in history
✔ budget bars update

Journey C — Edit Transaction

User:

opens history

swipes transaction

edits amount

saves

Verify:

✔ balances recalculate
✔ insights recompute
✔ goal contributions update if affected

Journey D — Delete Transaction

User deletes a transaction.

Verify:

✔ balance recalculates
✔ history updates
✔ daily totals update

Journey E — Budget Management

User:

opens Smart Budget Builder

applies suggested budgets

returns to dashboard

Verify:

✔ category budgets saved
✔ health bars reflect new limits

Journey F — Goals

User:

creates goal

contributes money

tracks progress

Verify:

✔ progress updates
✔ balance reduces correctly

Journey G — Insights

Verify insights logic:

budget warnings
weekly report
predictive spending
top category analysis

Ensure:

✔ insights derive from real data
✔ insights rotate correctly

Journey H — Challenges

User:

joins challenge

logs progress

views community stats

Verify:

✔ progress persists
✔ streak calculations correct

Journey I — Education System

User:

opens lessons

reads content

marks lesson complete

Verify:

✔ lesson progress saved
✔ completion points update

Journey J — Notifications

Verify notification center.

Check triggers:

budget near limit
budget exceeded
goal milestone
weekly report
streak risk
low balance

Ensure:

✔ notifications generate correctly
✔ dismiss works

3️⃣ DASHBOARD UX AUDIT

Verify the 5-section structure.

Expected layout:

Financial Snapshot
Budget Health
Active Goal
Recent Transactions
Insight of the Day

Check:

✔ correct hierarchy
✔ animations functional
✔ no layout overflow

4️⃣ GESTURE AUDIT

Verify gestures:

swipe left → delete
swipe left → edit
swipe right → edit

Ensure:

✔ gestures responsive
✔ no accidental actions

5️⃣ DATA INTEGRITY TEST

Test extreme cases.

Examples:

very large transactions
negative values
rapid transaction creation
rapid delete

Ensure:

✔ no corrupted balances
✔ state remains consistent

6️⃣ PERFORMANCE AUDIT

Measure:

App launch time
Screen transition speed
Transaction save time

Targets:

Launch < 2s
Navigation < 300ms
Transaction save < 1s

Flag slow operations.

7️⃣ MOBILE RESPONSIVENESS AUDIT

Test on:

small phones
large phones
tablets

Verify:

✔ UI scales correctly
✔ gestures consistent
✔ no clipped text

8️⃣ OFFLINE MODE TEST

Disable internet.

Verify:

✔ transactions still work
✔ history loads
✔ insights compute

Flag blank states.

9️⃣ STORAGE PERSISTENCE TEST

Verify persistence.

Steps:

create transactions

refresh app

close app

reopen app

Ensure:

✔ all data restored

🔟 SECURITY AUDIT

Check:

✔ no exposed API keys
✔ secure data handling
✔ financial data protected

Flag sensitive logs.

1️⃣1️⃣ ACCESSIBILITY AUDIT

Verify:

✔ readable font sizes
✔ sufficient color contrast
✔ icon clarity

Standard:

WCAG 2.1
1️⃣2️⃣ LOCALIZATION AUDIT

Verify languages.

Example:

Swahili
English

Check translations and grammar.

1️⃣3️⃣ SHARE & GROWTH LOOP TEST

Verify share system.

User taps:

Share stats
Invite friend

Ensure:

✔ message generated correctly
✔ share links work

1️⃣4️⃣ APP STORE POLICY AUDIT

Verify compliance with:

Apple App Store guidelines

Google Play policies

Ensure:

✔ privacy policy present
✔ terms of service
✔ no misleading financial claims

1️⃣5️⃣ APP STORE ASSET AUDIT

Verify:

✔ app icon
✔ screenshots
✔ preview video
✔ app description

1️⃣6️⃣ CRASH TEST

Force errors.

Examples:

invalid inputs
rapid screen switching
low device memory

Verify app stability.

1️⃣7️⃣ ANALYTICS & CRASH MONITORING

Check if installed:

examples:

analytics
crash tracking

Flag if missing.

1️⃣8️⃣ FINAL DEPLOYMENT SCORECARD

Score categories:

Category	Score
UX	
Performance	
Security	
Data integrity	
Mobile readiness	
Feature completeness	
App store compliance	
FINAL TASK

Provide a deployment verdict:

READY TO DEPLOY
OR
NOT READY

If not ready, list blocking issues preventing launch today