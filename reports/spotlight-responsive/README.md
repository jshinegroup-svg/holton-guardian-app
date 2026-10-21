# Responsive layout and first-use spotlight

Authorized by Jerry22948, following22946 photos and agreed design.

## Layout
- Global full-width dark background removes desktop white area; mobile single column retained.
- >=700px: centered720px content. >=1000px landscape or >=1200px: centered1120px shell, village overview/map columns, mission/card+companion columns, parent navigation/content columns.1024px portrait stays single-column. Secondary collection pages expand to720px; dialogs retain readable max widths.
- Original art/card ratios preserved; no generated replacements. CSS-only viewport adaptation, no device sniffing. Short-height category chooser scrolls horizontally.

## Guide
- Separate local key holton-guardian-app::spotlight-v1; legacy users initialized complete, fresh users pending. Primary game backup/progress schema unchanged. Reset marks tutorials pending. Parent preferences has manual replay (available only outside ongoing tasks).
- Six steps: actual village start, actual previous-time arrow, task title, one of five actual categories, prepare, then instruction about the real start button. Last instruction ends guide without starting timer. Children explicitly start afterwards. No demo rewards or invented completions.
- First visits to companion/wish/parent rooms show contextual tips. Companion tap actually reacts; wish/parent steps are informational and cannot purchase/reset. Skip/complete persist per-browser. Existing users not forced through new guide.
- Portal overlay uses four input-blocking dark panels and an unobscured target, live bounds on scrolling/rotation, measured tooltip height, real target clicks, keyboard Tab containment and Escape skip. No broad data deletion or reset to replay.

## Verification
- Typecheck PASS; lint0 errors/56 existing legacy warnings; production base-path export PASS.
- Isolated Chrome320x740,390x844,768x1024,1024x768,1366x900,1024x1366: full-width shell/no overflow/centered responsive layout and parent controls. Screenshots reviewed.
- Main guide performs actual choices; unrelated clicks blocked; prepare has no deadline/no added points; completion persists after reload. Fresh starter/welcome, skip, legacy no guide, companion once, wish no spending, parent replay. Rotation bounds and real pointer/keyboard checks included.
- Existing world-draw suite PASS. Synthetic test storage only, not physical iPad validation.
