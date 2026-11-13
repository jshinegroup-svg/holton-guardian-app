# Homework recognition

Entry: Homework Quest → Prepare homework (adult PIN) → Photo / upload — auto-fill.

Backend: Supabase Edge Function `homework-recognize`. It validates the bearer session using `auth.getUser`, then verifies ownership of the child. Gateway JWT validation is off only because the function performs explicit authentication (supports the project's current signing keys). Never remove the body authentication.

Required server secret: `OPENAI_API_KEY` in Supabase Edge Function Secrets. No key belongs in Expo/public env or git. Optional `HOMEWORK_VISION_MODEL`, default `gpt-5.6-terra` (Responses API, structured outputs, low reasoning). Set billing limits in the API project separately. A ChatGPT subscription does not supply this key or API balance.

Migration: `20261113_homework_recognition.sql`. RLS table is not accessible to authenticated/anonymous clients. Service-only RPC serializes requests per family owner, caches identical content, permits 20 unique submissions in a rolling 24 hours. Failed or interrupted submissions retain their reservation to avoid duplicate charged calls. A timed-out file can be rechecked for a completed cached result. New photo/manual entry remains available. Old cache entries for an owner are removed on their next submission after 24 hours. Raw images are not stored in this table; recognized text is. OpenAI request uses `store:false`; provider retention policies still apply.

Images are resized client-side to 1800px; PDF/initial photo limit 8MB. Neither client nor backend accepts arbitrary URLs. Original attachments are saved locally only after task save; quota failure there does not undo synced homework. The server returns only a draft, never writes child progress or awards. Saving uses the existing revision-controlled child progress mechanism and adds tasks, preserving previous task status. Exact title/detail duplicates are skipped. Claimed days and active timers are locked. Uncertain text must be reviewed; literal 待確認 blocks save. Parent must explicitly confirm child/date/pages. Dates are not inferred from the photo.

Verification:
- `npm run typecheck`
- `node scripts/homework/recognition-backend-check.cjs` (mock provider; auth/ownership/limits/errors/image/PDF)
- normal Expo production export
- `node scripts/homework/photo-import-check.mjs` (mock auth/AI/cloud, 320/390/844 widths)
- `node scripts/homework/model-check.cjs`, `repository-check.cjs`, `guide-check.mjs`

Live OCR accuracy and the configured API project's model access/balance require a real authenticated request after secret setup; mocked tests do NOT verify these. Do not claim real recognition is active until checked. No production child data should be seeded for tests.
