# Vercel recognition CORS repair — 2026-11-25

Updated homework-recognize to allow exact production Vercel and legacy Render origins. CORS response headers are request-local; Vary: Origin added. Unknown origins rejected before OPTIONS. Authentication, ownership, reservation and model logic unchanged.

Validation: node reports/recognition-vercel/cors-check.mjs passed for both preflights, unauthenticated POST responses, and disallowed/lookalike origins.

NOT DEPLOYED: Supabase browser sessions require sign-in; GitHub OAuth also requires login. Protected credential store empty. Production OPTIONS still returns legacy Render origin. After user signs in, deploy this function to project hzihwjpjcbsuqipaeeit and validate production preflight plus authenticated synthetic-image recognition without saving homework or changing family records.
