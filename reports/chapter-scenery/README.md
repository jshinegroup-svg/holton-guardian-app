# Chapter scenery and compact world map

User requested sky at top, forest middle, cosmos bottom; smaller map entries, gray locked regions, and at least three changing pictures per world.

Implemented: three scenic map bands with 216px translucent entries, disabled desaturated locked destinations, same existing unlock predicates. Nine generated chapter backgrounds: steps 0–4 -> scene1, 5–9 -> scene2, 10–15 -> scene3. Step15 still unlocks next world; no currency/state migration changes. All task modes use current chapter scenery with calm focus/rest shade. Journey overview previews three images; existing persistent completion modal now compares actual chapter scenes before/after as well as landmarks. No flashing or autoplay added.

Built-in image_gen produced three 1536x1024 triptych texture atlases; exact prompts in prompts.json. Panels losslessly extracted by ffmpeg into assets/worlds/chapters/{sky,forest,cosmos}-{0,1,2}.png. Original cards unchanged. Images depict chapter locations; small landmark/star overlays still track each of five steps.

Validation: TypeScript, scoped ESLint, Expo web export, existing 45-step journey model suite. Isolated Chrome 390/320 checks: order, disabled grayscale destinations, entry width, all nine loaded images, boundaries0/4/5/9/10/15, real fifth completion, before/after, wallet unchanged except expected reward, reload no duplicate. Screenshots contain synthetic data. No physical iPhone claim.

Public deployment ba70af4 submitted; GitHub Pages run 39280796463 remained queued at 15:54 UTC. Live URL still served prior bundle. A background watch runs the public browser suite after successful deployment (logs public-pipeline.log / public-check.log); do not claim public verified until PASS is recorded.
