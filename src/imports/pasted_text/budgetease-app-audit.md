BRUTE APP-STORE READINESS AUDIT PROMPT
(For BudgetEase Fintech Mobile App)
ROLE

You are a senior mobile app reviewer, fintech product auditor, App Store policy expert, and UX engineer.

Your task is to perform a brutal, comprehensive audit of the BudgetEase budgeting app to determine if it is fully ready for submission to the Apple App Store and Google Play Store.

Evaluate the app across product quality, mobile UX, technical architecture, security, legal compliance, and app store policies.

If anything is unclear, incomplete, or non-compliant, flag it as a blocking issue.

1️⃣ PLATFORM COMPATIBILITY AUDIT

Determine whether the app is a true mobile app or only a web app.

Verify:

✔ Native mobile build (iOS or Android)
✔ Cross-platform framework (React Native / Flutter / Swift / Kotlin)
✔ No reliance on desktop browser behavior

Flag if:

❌ app only runs as a web page
❌ UI depends on desktop layouts
❌ gestures inconsistent with mobile standards

2️⃣ MOBILE UX AUDIT

Test usability on:

• small phones
• large phones
• tablets

Verify:

✔ thumb-friendly buttons
✔ bottom navigation reachable
✔ swipe gestures functional

Check for:

❌ tiny tap targets
❌ clipped layouts
❌ overlapping UI elements

Minimum touch target:

44px × 44px
3️⃣ PERFORMANCE TEST

Measure:

App launch time
Navigation speed
Transaction save speed

Targets:

App launch < 2 seconds
Screen transitions < 300ms
Transaction save < 1 second

Flag slow interactions.

4️⃣ OFFLINE FUNCTIONALITY TEST

Disable internet.

Verify:

✔ transactions can still be added
✔ history loads
✔ insights load

Flag if:

❌ crashes
❌ blank screens

5️⃣ DATA STORAGE AUDIT

Verify how financial data is stored.

Check:

• localStorage usage
• encryption
• backup options

Flag risks:

❌ financial data stored insecurely
❌ no data backup
❌ no device migration support

Recommend:

secure storage APIs.

6️⃣ FINANCIAL ACCURACY TEST

Validate balance logic.

Formula:

Balance = income − expenses

Test:

• editing transaction
• deleting transaction
• goal contributions

Ensure calculations update everywhere.

7️⃣ NAVIGATION FLOW AUDIT

Verify navigation works correctly.

Expected tabs:

Home
Goals
History
Insights
Settings

Check:

✔ navigation state persists
✔ swipe gestures do not conflict
✔ back navigation works

Flag:

❌ dead links
❌ confusing flows

8️⃣ ONBOARDING EXPERIENCE AUDIT

Test first-time user journey.

Evaluate:

• clarity
• speed
• motivation

Ensure onboarding:

< 60 seconds

User must quickly understand:

purpose of app

value

9️⃣ APP STORE POLICY COMPLIANCE

Verify compliance with:

Apple App Store Review Guidelines

and

Google Play Developer Policies

Check:

✔ no misleading claims
✔ no hidden payments
✔ no restricted content

Flag violations.

🔟 PRIVACY & LEGAL COMPLIANCE

Verify required documents exist:

✔ Privacy Policy
✔ Terms of Service
✔ Data deletion option

Ensure users can:

delete their data
export their data

Required for GDPR-style standards.

1️⃣1️⃣ SECURITY AUDIT

Verify:

✔ secure data handling
✔ no exposed credentials
✔ no console errors

Check if financial data is protected.

1️⃣2️⃣ ACCESSIBILITY TEST

Ensure support for:

• larger fonts
• color contrast
• screen readers

Accessibility standards:

WCAG 2.1
1️⃣3️⃣ DEVICE TESTING

Simulate on:

iPhone SE
iPhone 14
Android small phone
Android tablet

Check:

✔ layout responsiveness
✔ gestures
✔ performance

1️⃣4️⃣ APP SIZE & RESOURCE USAGE

Targets:

App size < 100MB

Check memory usage.

Flag excessive resources.

1️⃣5️⃣ ERROR HANDLING AUDIT

Simulate errors:

• invalid inputs
• extremely large numbers
• deleting items rapidly

Ensure app handles gracefully.

1️⃣6️⃣ ANALYTICS & CRASH REPORTING

Verify monitoring tools exist.

Examples:

• Firebase Analytics
• Crashlytics
• Sentry

Flag if missing.

1️⃣7️⃣ APP STORE ASSETS AUDIT

Verify assets prepared.

Required:

✔ App icon
✔ Screenshots
✔ Preview video
✔ App description
✔ Keywords

1️⃣8️⃣ LOCALIZATION AUDIT

Check languages.

Example:

Swahili
English

Verify translation accuracy.

1️⃣9️⃣ USER RETENTION FEATURES

Verify presence of:

✔ insights
✔ streaks
✔ goals
✔ reminders

Flag weak engagement loops.

2️⃣0️⃣ FINAL APP STORE SCORECARD

Score categories:

Category	Score
Mobile UX	
Performance	
Security	
Legal compliance	
Feature completeness	
App store readiness	

Provide overall score out of 100.

🚨 FINAL TASK

Return a brutally honest report identifying:

1️⃣ Critical blockers for App Store approval
2️⃣ UX flaws affecting user reviews
3️⃣ Security or compliance risks
4️⃣ Missing mobile features
5️⃣ Recommendations to achieve 5-star App Store rating