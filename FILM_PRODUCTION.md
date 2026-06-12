# KAWSAY RIPUY — THE FILM
### Production package: the full essay as a cinematic 3D animated short

The film exists at **two fidelities**:

1. **In-engine animated short (LIVE NOW)** — `src/film.js`. Click **"✦ Watch the Film"**
   on the title screen. A real-time machinima director performs the entire essay in 16
   fully animated shots (~2 minutes): animated characters (the boy, the father, the
   grandfather, the grandmother), four sets (the room, a grey memory-void, the valley,
   the night sky), dynamic cameras per shot, synced captions, letterbox bars, the
   cinematic post-grade, and a score conducted shot-by-shot through the procedural
   soundscape. Skippable. Ends by handing the visitor back into the explorable Room.

2. **Photoreal Pixar/UE5-grade pass (THIS DOCUMENT)** — paste-ready prompts for
   Higgsfield video models, one per shot, matching the same 16-shot structure so the
   generated clips can replace the in-engine shots 1:1.

---

## Production requirements (verified 2026-06-12)

| Item | Status |
|---|---|
| Kling 3.0 (recommended) | **Requires Higgsfield Basic plan or higher** |
| Seedance 2.0 (identity consistency) | Requires Plus plan or higher |
| Cost per 5s Kling shot (std mode, 16:9) | **10 credits** (preflighted) |
| Full film (16 shots, 5–7s) | **~160–220 credits** |
| Character consistency | Train a **Soul** for the boy (5–20 stills of the same generated character), reuse across shots; or generate a reference sheet with Nano Banana and pass as `start_image` |

**Pipeline per shot:** generate still (Nano Banana, 2 credits) → approve → image-to-video
(Kling 3.0, `start_image` = approved still) → download to `public/filmclips/shot_NN.mp4`.

**Style DNA — append to every prompt:**
> Hyper-realistic stylized 3D animation, Pixar-quality character design, Unreal Engine 5
> cinematic lighting with Lumen GI, physically accurate cloth, emotional facial animation,
> volumetric light, cinematic depth of field, fine film grain, ACES filmic color, warm gold
> highlights and deep teal shadows, authentic Peruvian Andean detail. No text, no watermark.

**Characters (lock once, reuse):**
- **The boy** — thin Indigenous Quechua boy, ~12, dark hair, expressive vulnerable eyes, modest rural clothing
- **The father** — physically imposing, military bearing, heavy boots, complex weariness (never cartoon villainy)
- **The grandmother** — warm, traditional Andean dress and braids, flour-dusted hands

---

## The 16 shots

Each entry: the essay beat it animates → the Kling 3.0 prompt (motion included — Kling takes one combined prompt). Durations 5–7s.

**1 · The clomp (7s)** — *"His clomp signaled that he would soon enter my room."*
> Night, adobe bedroom in rural Andean Peru, kerosene lamp flickering. A thin Quechua boy writes vocabulary at an ironing board used as a desk. Heavy military footsteps approach outside; he freezes mid-stroke, eyes widening, breath held; the lamp flame shudders with each thud. Camera: slow dolly-in from medium to close-up. + Style DNA

**2 · The desk (5s)** — *"The firm ironing board I used as a desk felt on the verge of collapsing…"*
> Extreme close-up: a boy's hand pressing hard on paper covered in handwritten Quechua words; the ironing-board desk wobbles, its hinge straining; pencil trembling. Camera: macro, shallow focus racking from the words to the white-knuckled hand. + Style DNA

**3 · He bulldozes in (7s)** — *"¡¿Qué estupidez haces?! Those dialects you learn are useless."*
> The door slams open; a physically imposing Peruvian father in work clothes fills the doorway, backlit, shouting; the boy shrinks at his desk; papers lift in the gust. Camera: low-angle from beside the boy, tilting up at the father. + Style DNA

**4 · Quietness or the chicote (6s)** — *"Anything other than quietness would guarantee dozens of hits with his chicote…"*
> Slow pan across an adobe wall to a coiled leather whip — a chicote — hanging on a nail, its shadow long in lamplight; in soft-focus background the boy sits perfectly still, head down. Camera: creeping lateral dolly, rack focus from whip to boy. + Style DNA

**5 · The internal scream (5s)** — *"I held back my tears and internally screamed… Cobarde. Imbécil. Estúpido."*
> Tight close-up on the boy's face fighting back tears, jaw clenched, eyes glassy; faint ghosted Spanish insults dissolve like smoke around his head. Camera: static, almost imperceptible push; one tear never falls. + Style DNA

**6 · The prayer (6s)** — *"Like never before, I prayed to God with sincerity… I had nothing left but faith."*
> The boy kneels beside his bed in lamplight, hands clasped, whispering; dust motes float in a single warm beam from above. Camera: slow descending crane from overhead — grace looking down. + Style DNA

**7 · The grandfather (7s)** — *"A flame of courage flared when I recalled my grandfather, who used to come home drunk…"*
> Desaturated grey memory: a staggering older man's silhouette weaves through a doorway, bottle in hand; rain; a small boy watches from shadow. The image ripples like disturbed water. Camera: slow push through the rain toward the silhouette. + Style DNA

**8 · Break the cycle (5s)** — *"I had to be the one who would break the generational cycle."*
> The boy walks out of a grey void toward camera; with each step color returns to the world around him — grey stone blooming into terracotta and gold. Camera: steady backward track ahead of him, light rising. + Style DNA

**9 · Grandma and the chuta (7s)** — *"I reminisced about how we baked sweet bread: chuta…"*
> Warm adobe kitchen, wood-fired oven glow; a Quechua grandmother in traditional dress and braids shapes chuta dough beside the boy, flour in the air catching firelight, both laughing. Camera: intimate handheld feel, orbiting slowly. + Style DNA

**10 · The words (6s)** — *"sinchi (bold), sumaq (handsome), umasapa (intelligent, but a bit stubborn)…"*
> As the grandmother speaks, glowing golden Quechua words — sinchi, sumaq, umasapa — rise from the steam of fresh bread like fireflies, drifting around the boy's wondering face. Camera: slow upward tilt following the words. + Style DNA

**11 · Huaynito (6s)** — *"Dancing Huaycapata's huaynito motivated me to overcome my stage fright…"*
> A village plaza at golden hour; the boy dances a huaynito among swirling textile skirts and musicians, sneakers stomping dust, finally laughing freely. Camera: circling dolly, cloth simulation on flying ponchos. + Style DNA

**12 · The scholar (6s)** — *"Pulling all-nighters searching for STEM vocabulary in dusty dictionaries…"*
> Night desk montage: dictionaries stacked like mountains, sticky notes, a glowing laptop with colorful slides; the boy — now a teenager — writes Quechua scientific neologisms; antique books from the flea market teeter beside him. Camera: top-down slow spiral. + Style DNA

**13 · He is slowly changing (7s)** — *"I still hear my father's footsteps entering my room. Yet, he is slowly changing."*
> The same bedroom doorway as shot 3 — but now the father stands at the threshold quietly, hat in hand, not entering; the boy looks up from his desk; a long beat of fragile peace between them. Camera: static frame holding both, soft dawn light. + Style DNA

**14 · Identity (7s)** — *"Through the languages I know, I embrace my identities… indigenous, Latino, and bisexual."*
> The boy — now a young man — walks toward camera through a terracotta valley at golden hour, mountains behind him, textile banners rippling; his stride opens, shoulders unguarded, half-smile. Camera: backward steadicam ahead of him. + Style DNA

**15 · Reclaiming (7s)** — *"I want them to reclaim their kallpacharikuy, sunqulliy, and sullullchay…"*
> Andean night sky; glowing Quechua words rise from a valley of small lit houses and assemble into constellations above snow-capped peaks. Camera: sweeping crane up from the valley into the star field. + Style DNA

**16 · The dedication (7s)** — *"Dad, my dearest Quechua people, Musqusqaykimanta astawan karutaraq chayasaqku."*
> The young man stands beneath the constellation words, the warm halo of his village behind him; he looks up; the camera rises past him into the stars until he is a small brave figure against the infinite Andean night. Fade to black. Camera: slow ascending pull-back. + Style DNA

---

## Integration

When clips exist, drop them in `public/filmclips/shot_01.mp4 … shot_16.mp4` and the film
player can be switched from in-engine sets to video planes per shot (the 16-shot timeline
in `src/film.js` is the single source of truth for timing, captions and audio cues either way).
