# PennyPilot — Product Requirements

Date: 2025-10-30

## Product name (working)

PennyPilot — daily expenses, smart reminders, clear budgets, simple reports.

## Core jobs to be done

- “Log today’s spending in seconds”
- “See if I’m on track vs. budget”
- “Know what’s due and what renews”
- “Close the month and learn from it”

## MVP elevator pitch

A privacy-first, offline-first personal expense tracker that lets users quickly log spending, see progress vs budgets, get nightly reminders, and export month reports — all in a tiny number of taps.

## Feature list (MVP → Pro)

1) Capture & input
- Quick-add expense (≤3 taps): amount → category → payment method → save.
- Natural language add: “₹320 groceries yesterday card”.
- Recurring expenses/income (daily/weekly/biweekly/monthly/custom day-of-month).
- Split transactions (one bill → groceries 70%, household 30%).
- Attach receipts (camera or gallery) + OCR to parse amount/merchant/date (v2).
- Multi-currency with auto FX note; base currency for reports (v2).

2) Reminders & notifications
- Nightly reminder at 2:00 AM local by default; editable (time + days).
- “Nudge” if no expenses logged in the past N hours (configurable).
- End-of-day summary (“logged 4 items · ₹1,240 total · 68% food”).
- Start-of-month “set income/budgets” prompt.
- Bill & subscription renewals alerts (pre-due and due).
- Streaks/gamification (optional): “7 days in a row logged”.

3) Income & budgets
- Monthly income setup (fixed or variable).
- Category budgets (e.g., Food ₹12,000) + overall monthly cap.
- Envelope-style option (v2): move money between envelopes.
- Mid-month rebalance suggestions (v2).

4) Accounts & wallets
- Cash, Bank, Card, UPI, Wallets—each with balance tracking (optional).
- Transfers between accounts (don’t affect totals) (v2).
- Starting balances & account reconciliation (v2).

5) Categories & tags
- Default taxonomy (Food, Transport, Bills, Shopping, Health, Fun, Fees, Travel, Misc).
- Custom categories with icons & color.
- Freeform tags (#work, #trip) for cross-cutting reports.

6) Reporting & insights
- Today / Week / Month overview at a glance.
- Charts: category breakdown (pie), trend over time (line), burn-rate vs budget (bar).
- Forecast (v2): projected month-end spend based on pace.
- “Top 5 drains” & “unused subscriptions” (v2 with patterns).
- Month closeout: income, spend, savings, notes, carry-over (v2).

7) Bills & subscriptions (v2)
- Track due dates, amounts, paid/unpaid state.
- Autodetect recurring merchants over time.
- Cancellation reminders for trials.

8) Data & sync
- Offline-first; everything works without internet.
- Local encrypted store; optional cloud backup/sync (iCloud/Google Drive) (v2).
- Import CSV (from other apps/banks); Export CSV/PDF monthly report.

9) AI “mini-CA” (v2+)
- Auto-categorize using on-device model/heuristics.
- Q&A: “how much did i spend on coffee this quarter?”
- Tips: “you’re trending 18% over on Food; try setting ₹X next month.”

10) Privacy & security
- App lock (PIN/biometrics).
- Sensitive fields encrypted at rest.
- No third-party trackers by default; clear privacy policy.

11) Settings & personalization
- Reminder schedule (time, timezone-aware, skip weekends).
- Currency, number/date formats, dark mode.
- Category management, default account, default note templates.
- Localization-ready (strings via i18n).

## Information architecture (screens)

- Onboarding: pick currency → set monthly income → set reminder time (defaults 2:00 AM) → choose categories.
- Home (Today): big “+ Add Expense”, today total, quick categories, last 3 items.
- Add Transaction: amount keypad → category → date/time → account → notes → photo → save.
- Budgets: per-category meter + month progress bar + remaining days pace.
- Reports: tabs: Month / Week / Custom; pie, trends, list of top categories/merchants.
- Income: add/edit income streams (recurring/one-off).
- Bills/Subs (v2): list, calendar view, add, mark paid.
- Settings: reminders, backup, passcode, categories, export/import.

## Data model (initial schema)

- accounts
  - id, name, type ("cash|bank|card|wallet"), currency, starting_balance, archived

- categories
  - id, name, color, icon, parent_id (null), is_expense:boolean

- transactions
  - id, amount (signed), currency, timestamp, account_id, category_id, note, receipt_uri, tags_csv, is_recurring:boolean, recurring_rule_id (nullable)

- recurring_rules
  - id, type ("expense|income|bill"), frequency ("daily|weekly|biweekly|monthly|custom_cron"), day_of_month, weekday, start_date, end_date, amount, category_id, account_id, note

- budgets
  - id, category_id, month (YYYY-MM), amount

- income
  - id, source, amount, month (YYYY-MM), account_id (optional)

- subscriptions (v2)
  - id, merchant, amount, cadence, next_renewal_date, account_id, category_id, note, active

## MVP scope (4–6 core screens)

- Quick Add Expense + list (edit/delete).
- Monthly Income entry (single number).
- Category Budgets (simple per-category).
- Reports: Month pie + daily trend.
- Nightly 2:00 AM reminder (local notification, user-editable).
- CSV export (month) for backup.

## Future (v2+) add-ons

- OCR receipts, bank CSV import helpers, subscriptions, envelopes, forecast, cloud sync, on-device ML categorize.

## Tech stack (recommended)

- React Native + TypeScript (Expo).
- Local DB: SQLite (expo-sqlite) or Realm for offline & queries.
- State/query: Zustand or Redux Toolkit + RTK Query (or React Query for persistence).
- Charts: react-native-svg + victory-native or react-native-chart-kit.
- Dates: date-fns.
- Validation: zod.
- Notifications: expo-notifications (local). Optional Headless JS for Android background tasks.
- Background scheduling: expo-task-manager / expo-background-fetch for recurring jobs.
- File I/O: expo-file-system, expo-document-picker for CSV import/export.
- Camera: expo-camera (for receipts, v2).
- i18n: react-native-localize + i18next.
- Security: expo-secure-store for keys, optional database encryption wrapper.

## Notification & reminder behavior (logic sketch)

- On first run, schedule a local notification at userTime = 02:00 every day.
- If user changes time, cancel and reschedule.
- Skip days with ≥1 expense logged optionally (toggle).
- Edge cases: DST shifts, timezone changes → re-check schedule on app open.

Pseudo:

```
const scheduleNightlyReminder = async (hour: number, minute: number) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: "Log your day", body: "Add today’s expenses to stay on track." },
    trigger: { hour, minute, repeats: true }, // local device time
  });
};
```

## Analytics & quality

- Privacy-friendly event counts (no PII): opened_app, added_txn, changed_reminder, export_csv.
- Crash reporting (Sentry) and perf (Flipper/React DevTools).

## Monetization (later)

- Free: core logging, reminders, budgets, basic charts, CSV export.
- Pro: OCR receipts, subscriptions module, cloud backup/sync, advanced insights/forecast, unlimited custom categories.

## Acceptance criteria (MVP checklist)

- Add expense in ≤5 seconds; offline.
- Edit/delete expense; undo within 5 sec.
- Set income for current month; visible on dashboard.
- Create budgets; see “spent vs. budget vs. days left”.
- Local nightly reminder defaults to 2:00 AM and is user-configurable.
- Reports show month pie + daily trend; tap to drill into list.
- Export current month to CSV file.
- All strings in i18n; dark mode works.

---

## Next steps (suggested)

1. Review and approve this product requirements file.
2. Prioritize features for the first sprint (MVP backlog).
3. Scaffold an Expo + TypeScript project and wire up local DB and notifications.

If you'd like, I can now: (A) open and walk through the file contents here, (B) scaffold an Expo app in this repo, or (C) create the initial screens and the SQLite schema files. Tell me which next step you want and I'll proceed.
