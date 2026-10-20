# Adventure village / 2026-10-20

Authorized by Jerry: implement village home with map, wishes, companions and parent rooms; additionally prefill reward prices so friends can start immediately.

- Ready/done cold launch opens village; preparing/active/finishing resume mission. Pending story/draw/challenge retains existing handling.
- Prominent start action; map forest→sky→cosmos and locks unchanged. Four labeled accessible destinations and return links. Parent settings split into tasks/goals, wishes, preferences/old-card restoration, records. Goal can be saved without a task title.
- Wish room always accessible, including closed-shop explanation/receipts; parent shortcut enters the same rewards editor. Companion room routes collection, previews, world cards, conversion.
- New installs: 10 original wishes enabled, with recommended prices 100/20/20/60/20/30/30/30/60/20 in original catalog order. Empty/zero original card prices prefilled in catalog; existing positive prices, names, enabled flags and receipts retained. Custom slots stay blank/closed. No account/auth branch included.
- No storage keys changed; no remote user-data access or reset. No new currency or reward mechanics.

## Art
Built-in image_gen produced `assets/worlds/village/village.png`. Exact prompt/provenance in `image-prompt.json`. Scene is decorative, with independent live labeled buttons.

## Checks
TypeScript, scoped ESLint, web export, diff whitespace and existing atomic wish transaction checks passed.
`browser-check.mjs` uses isolated headless Chrome profiles only: 320/390 layout and screenshots, all four destinations/returns, settings split, closed shop, zero fresh state + ready-to-use default wishes, parent price override/reload, save goal without title, task picker, unchanged navigation storage, existing cards, map lock, preparing/active/finishing reload, single reward/milestone, done restart, wish select/cancel/checkout/reload. Not tested on a physical phone.
An initial 320px background overflow was found and fixed with explicit image dimensions; full rerun passed.
