# Integrated clickable village map — 2026-10-20

Jerry22809 requested houses integrated into the actual map and clicked directly there. Replaced the four separate foreground sprite/plaque blocks with one coherent illustrated village: all four houses, paths, stream, bridges and terrain in a single image. Four transparent responsive hotspots are aligned to the actual roof/door positions; compact labels sit near each doorstep. No avatar movement or extra game mechanics introduced.

Image generated with built-in image_gen at `assets/worlds/village/integrated-map.png`; exact final prompt in `image-prompt.json`. All house art is part of the image, not additional overlaid house sprites. Geometry manually aligned after visual inspection (not blindly using prompt coordinates). Aspect ratio fixed2:3 so hotspots stay aligned at different widths. Door glows3 gentle cycles, warm windows stay; reduced-motion mode static. Press highlight/name plaque feedback and keyboard focus supported. Paths/plaza are inert.

Unchanged: start mission, four destination contents, return links, default wish prices, points/collections/records, local storage key, world lock and task-resume logic. Source change limited to AdventureVillage plus new art.

Validation: typecheck/scoped lint/export/diff check PASS. Isolated Chrome320/390 roof/door elementFromPoint alignment, real touch entry+press feedback for all4 buildings, blank-ground inertness, aspect ratio/no overflow, keyboardEnter, changing finite glow, system/app reduced motion, all previous village/parent/default-price/cart/task-resume regression checks PASS. No physical phone claim.
