# Offline homework (2026-11-17)

## Usage
Sign in online, select the child, then use Prepare offline at the bottom of Homework Quest. Wait for the ready confirmation. First public-resource download is approximately 151 MB; Wi-Fi recommended. Repeat preparation after adding homework on another device. Each child needs their own progress/photos prepared. Initial login and AI recognition remain online-only.

Offline saves and photos are device/account scoped in IndexedDB, migrated from existing AsyncStorage when needed. Do not clear website data or use private browsing for durable offline work. Online, visible/open app retries every 30 seconds, on online events and visibility changes. A closed iOS page has no guaranteed background upload.

## Consistency
Queued snapshots retain operation IDs and expected revisions. Only transport failures defer saves. Durable local writes must succeed before presenting success. Lost acknowledgements replay the same ID. Cross-tab Web Locks serialize local operations; revision conflicts preserve local queued work and stop automatic retry. Explicit existing Use Cloud recovery backs up queued state. No automatic merge or blind overwrite of another device's progress.

Notebook intents record the previously viewed cloud image and compare before replacing. A changed remote image causes a conflict rather than an automatic overwrite; this is not a server-side atomic compare-and-swap. Avoid simultaneous edits of the same notebook. Photo conflict recovery requires adult assistance, and pending images remain on device.

Service worker caches only same-origin public resources, never API/auth/private notebooks. Readiness marker changes only after all files finish downloading. Media byte ranges are supported. Previous cache remains available if an update fails. Progress/photos are separate from public caches. Resetting browser data removes unsynced progress.

## Validation
Typecheck and web export; existing repository and notebook checks; offline-repository-check.cjs (queue, lost ACK, conflicts, quota); offline-browser-check.mjs (downloaded app/photo, offline reload with expired cached auth, timer/help/reload/report, reconnect sync, no unconfirmed rewards or other-child changes). Browser fixture uses synthetic auth and mocked backend; no real family progress is modified. Physical iOS flight-mode acceptance is still required.
