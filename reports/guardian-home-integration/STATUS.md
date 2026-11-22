# Guardian playhouse / four music groups — 2026-11-22

Authorized by Jerry: add all 20 proposed tracks as Piano and Calm ambient groups, retain the existing two groups, and begin integrating the complete guardian home into Adventure Squad.

- Entry: village → companions → guardian playhouse. Full-screen same-origin iframe with microphone permission, return to village unmounts it.
- Retains original home2 artwork, audio and gameplay (ball, brush, feeding/joy, bell, music box, rooms, actions, hold-to-record/release-to-play/9-second cap). Imported original assets and five voice clips are byte-identical.
- No AI or speech-recognition integration; recording stays in the frame. No changes to task/reward/cloud data contracts. Room decoration/sound preference remains browser-local, not per-child cloud progress.
- Four groups of ten songs; original IDs and selections retained. New full-length recordings converted to 96kbps MP3 with -23 LUFS target and fades; official sources and CC BY4 attribution in music files' attribution and reports/music-four-groups.
- Main-app music and onboarding overlay suppressed while home is open. Closing iframe releases active microphone tracks (tested).
- Offline worker serves home HTML instead of main-app HTML for the embedded navigation. Full optional offline package now ~406 MB; normal playback is on demand.

Validation:
- TypeScript and web export passed.
- Synthetic family fixtures at 390×844 and 1024×900: actual entry, rendered original face, room switching, ball, feeding/joy, fixed speech, hold recording/replay, return, all four categories and new-group audio playback; no page errors or changes to fixture child saves.
- Active microphone tracks end when frame closes.
- Browser offline reload of playhouse and its assets passed without recursive main app.
- ffprobe validates all 20 new full-length recordings against official durations (within 10s). 40 tracks total.
- Physical iPhone Safari not tested in this environment; user acceptance still needed.

Production verification: Render deploy dep-dc17j1l9fdbs73a1k470 is Live at commit a979dd5. The same synthetic-family browser checks passed against https://holton-family-v2.onrender.com at390/1024, including mic release on close and unchanged child saves. All20 new media HEAD responses and byte lengths verified.
