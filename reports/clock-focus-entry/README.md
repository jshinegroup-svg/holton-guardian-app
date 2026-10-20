Clock → focus screen

Jerry22844: whole active non-help time frame is an accessible press target. One activation directly opens the existing enlarged handoff screen, now titled 專注時間, and scrolls to its top. Removed separate leave button and confirmation dialog/state. Return remains explicit. No timer, reminder, reward, storage or help-pause logic changes. Original clock artwork, enlarged focus task/timer retained.

Validation: typecheck/lint (existing warnings)/base-path web export. Browser suite adapted from existing handoff/audio tests, adds whole-frame touch, keyboard Enter, zero-time entry, long task title and no focus entry while help is active. Headless keyboard emulation requires page bring-to-front/focus emulation; initial synthetic key test without focus did not activate native HTML button.

Separate new-user guidance request is proposal-only: contextual spotlight on actual controls, one short instruction at a time; defer wallet/shop explanations until first genuine completion; allow skip/replay. No new onboarding implemented in this release.
