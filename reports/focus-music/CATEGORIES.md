# Music categories — 2026-10-21

User request: ten focus recordings plus ten relaxation recordings; initially show only two category entries, then reveal the ten tracks for the chosen category.

Completed from the existing prepared audio assets. No unrelated reward/journey edits included. Category landing defaults closed on each mount. Back navigation stops preview. Each track expands to reveal selection and 20-second preview; selected track persists independently of navigation. Existing single-player and task lifecycle behavior retained. Backups now validate against all twenty catalog IDs, preserving legacy seven-track choices.

Validation: twenty SHA256 metadata matches and full ffmpeg decodes; TypeScript; lint (existing 56 warnings, zero errors); web export; backup model including all twenty IDs and unknown-ID rejection. Browser test covers both categories, ten tracks each, all twenty audible waveforms, actual selection/preview, category back stops playback, fresh category landing, 20-second cutoff, task lifecycle, autoplay fallback, 320/390 layouts and reset settings preservation. Not physical-device listening.

Release: source487b165; Pages bfbf653; run39463621125 successful. Public bundle matched and full public music suite PASS. Additional live check confirms three worlds x three distinct backgrounds and 0/4/5/9/10/15 thresholds. Village landing remains fixed artwork.
