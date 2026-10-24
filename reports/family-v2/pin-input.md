# PIN input verification — 2026-10-24

User reports a correct parent PIN rejected again. Family management, solo and duo use the same family-scoped key. User browser/input method and actual error text remain unconfirmed; no real PIN or lock record inspected, reset, or copied.

Reproduced browser case with synthetic credentials: assigning visible input through the native DOM value setter without React input events leaves React state stale, and the old gate rejects the correct displayed value. Submit now snapshots the current web input value before any busy-state render, including setup confirmation; native uses controlled state. Show/hide synchronizes DOM-filled values before rerender. Busy inputs cannot be edited mid-check.

PIN-only normalization accepts fullwidth decimal digits and outer whitespace. Non-six-digit submissions are rejected before verification and do not increment failed attempts. No silent six-character truncation. Existing hashes/keys unchanged; genuine wrong PINs still count and cooldown still applies. Recovery remains required for forgotten/mismatched stored PIN; no bypass introduced.

Validation: typecheck/export/targeted lint; six model tests covering latest-only PIN, concurrent/stale-write guards, recovery/isolation, normalization/malformed submissions, real-wrong throttling. Browser320/390 synthetic DOM-only fill and show/hide, change/save/reload, old PIN rejection, blank no penalty, fullwidth input, unchanged child/sibling progress. Physical iPhone behavior not yet verified; this is a reproduced potential cause, not confirmation of the reported incident.
