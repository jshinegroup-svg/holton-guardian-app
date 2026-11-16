# Fixed guardian voices — 2026-11-16

The owner approved the eight-role audition before this integration. Playback uses generated, static AAC/M4A files, not Web Speech, voice-name heuristics, or pitch manipulation.

| Role | Approved local voice |
| --- | --- |
| HOP | Vivian (female) |
| Tidefin | Serena (female) |
| PIP | Aiden (male) |
| BOMO | Uncle Fu (male) |
| Stoneback | Jerry's authorized local reference (male) |
| Emberwing | Ryan (male) |
| Steel Eagle | Dylan (male) |
| Bramblefang | Eric (male) |
| Generic fallback guardian | Jerry, reusing the approved voice |

## Asset boundary

- `public/companion-voices/v1/` contains only generated lines. Jerry's source recording, reference transcript, model weights, and credentials are not included.
- `companionVoiceClips.ts` maps exact spoken text, language and normalized species to a content-keyed asset. A changed speaker/text produces a new filename. Regeneration with different audio must also change its filename before publication to avoid stale caches.
- Chinese role lines and English lines cover all four moods. Opening the voice switch plays a clear line for the current mood. Unclear generated takes are withheld from both speech and text rotation; the original text remains in the source list for future re-recording.
- Personalized text keeps the child's name on screen. Its spoken counterpart omits the name. Where a generic personalized encouragement has no reviewed clip, both bubble and voice use a reviewed line for the same mood. No child name is uploaded or synthesized.
- Audio is requested only when tapped. The existing local opt-in, four-second text bubble, and mute control are retained. No Web Speech fallback occurs when an audio file is missing or blocked.
- One voice can play at a time. Owner identity prevents an old component unmount from stopping a newer component's voice; generation identity prevents late playback promises from resuming cancelled audio.
- No game records, timers, rewards or authentication are modified by playback.

## Local generation

The generation record and corpus are in the operator's `output/guardian-voices-production/` workspace folder. The local process uses MLX Qwen3-TTS 0.6B Base for Jerry and Qwen3-TTS 0.6B CustomVoice for the seven stock voices (Apache-2.0 models). Only generated outputs are deployed. Voice Design/instruction control is not supported by this 0.6B preset model; distinct speaker embeddings provide the cast, not unsupported emotion prompts.

The preset model's automatic dialect overrides are disabled in memory during generation, matching the accepted audition. This does not assert that all accents are identical to Taiwan Mandarin. Loudness normalization does not alter pitch or speaking speed.

## Checks

Run `node scripts/companion-fixed-voice-check.mjs` for selection and playback lifecycle tests; use `CHECK_AUDIO_FILES=1` to also require every referenced asset. `node scripts/companion-voice-check.mjs` uses isolated synthetic account data and simulated media playback to check mobile UI, mute, persistence and the four-second bubble. These do not replace actual listening or physical iPhone playback validation.

## Publication selection

Only takes with normalized ASR-text similarity of at least 0.90, or the exact recordings from the owner-approved audition, are published. ASR is an automated screening aid, not a claim of perfect pronunciation or an iPhone listening test. Supplemental approved audition lines retain role and mood. Stoneback also uses Jerry’s clear generic rest line. Withheld takes remain in local working storage, outside the web export.
