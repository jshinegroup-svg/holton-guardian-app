# Notebook idle repaint hardening — 2026-11-19

User confirms the notebook photo page flickers without touch on iPhone. Source inspected: HomeworkAdventure refreshed now every 500ms solely for day labels/history; parent also ticks. Chromium baseline observed no photo reload, source mutation or remount, so physical iPhone cause is NOT proven.

Replace 500ms page clock with date-only minute/visibility refresh (same-day state bails out); share memoized NotebookMedia for regular and focus views, keeping decoded img/iframe isolated from timer/sync renders. Block display avoids inline baseline layout, dark backing prevents white empty backing. Focus deadlines and progress logic unchanged.

Typecheck and web/offline export passed. Synthetic photo-idle checks at 320/390/844: stable node, zero idle load/attribute mutations/removal, foreground preservation, explicit refresh, return, no family-state change. Focus regression 320/744/890 passed cards/start/help/photo return/duration/report. Real iPhone visual acceptance pending.
