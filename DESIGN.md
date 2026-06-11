# KAWSAY RIPUY — The Journey of Living
### Concept & Implementation Plan — Interactive 3D Environment
*ARTSTUDIO 268 · Project 3 (Interactive Environment) + Final Project (Collaborative Exhibition)*

> **Musqusqaykimanta astawan karutaraq chayasaqku.**
> "We will get farther than you ever dreamed."

---

## 1. Concept

KAWSAY RIPUY transforms an autobiographical narrative — a boy at an ironing-board desk learning the Quechua words his father called useless — into a walkable, symbolic 3D world. The visitor does not watch the story; they stand inside the room where it branches, and they choose which of three possible lives to enter.

The piece argues, spatially, what the proposal argues in text: **masculinity is not inherited — it is performed, reinforced, and chosen.** The multiverse structure makes visible that the person we become is not inevitable.

Nothing literal is depicted. Violence appears only as objects (the chicote on the wall), sound (footsteps), and architecture (walls that close in, doors that never open). This follows the proposal's rule: *no literal violence shown — only psychological reconstruction.*

## 2. Narrative Structure & User Flow

```
TITLE SCREEN  →  THE ROOM (hub)  →  [touch the mirror]  →  3 PORTALS
                     ↑                                        │
                     └────────── R to return ←────────────────┤
                                                              ▼
   U1 THE SILENCE (grey)   U2 THE BREAK (glitch)   U3 THE RETURN (warm)
        explore                  glimpse only           collect 6 words
                                 (auto-ejects ~55s)            │
                                                               ▼
                                              FINALE — words become constellations
```

1. **The Room (Chapter 0 — hub).** A small adobe room at night: kerosene lamp, fragile ironing-board desk with Quechua notes, the chicote on the wall, a mirror, a door. Each object, when clicked, speaks a fragment of the narrative. The mirror is the inciting interaction ("He mirrored his own father. I was meant to mirror him.") — touching it opens three portals.
2. **Universe 1 — The Silence (What Was).** Grey stone valley, cold rain, a corridor of doors that shudder but never open. The avatar stands rigid, clipped, military-green. He never speaks Quechua again. He is safe and completely lost.
3. **Universe 2 — The Break (What Could Have Been).** A half-rendered wireframe world. Bridge planks flicker out underfoot; an envelope (the acceptance that never came) hovers out of reach; the avatar itself drops frames. This universe **does not let you linger** — after ~55 seconds it ejects you back to the room. It is a glimpse: a warning, and an act of grief.
4. **Universe 3 — The Return (What Is).** Terracotta valley under snow-capped apus, the grandmother's kitchen spilling warm light, textile banners, golden pollen. Six Quechua words float as light — *sinchi, sumaq, umasapa, kallpacharikuy, sunqulliy, sullullchay* — language as landscape, exactly as the proposal specifies. Gathering all six triggers the finale.
5. **Finale.** Night sky. The collected words rise as constellations over silhouette mountains while the camera pulls back. The widow/widower/orphan text appears line by line, ending on the Quechua dedication. The avatar stands still, centered: the version who made it, carrying the others with him.

## 3. World Design (palette per proposal §IV)

| World | Palette | Light | Sound | Emotional register |
|---|---|---|---|---|
| The Room | adobe brown, near-black | flickering bulb + kerosene flame | low drone, heartbeat, approaching footsteps | dread, compression |
| U1 Silence | desaturated stone grey, military green | cold directional, heavy fog | band-filtered wind | suppression |
| U2 Break | incomplete render: wireframe blue on void | strobing point light | random square-wave glitches | grief, instability |
| U3 Return | terracotta, gold thread, textile bands, open sky | warm sun + hearth fire | pentatonic plucks over warm pad (huayno gesture) | presence, aliveness |
| Finale | indigo night, gold words | moonlight + halo on avatar | held consonant chord | stillness, address |

## 4. Avatar Design

One procedural body (`src/avatar.js`), **three renderings** — the proposal's "body language system that reflects each universe's emotional state":

- **Silence:** grey/military materials; animation is nearly frozen — micro-twitches quantized to a step function (clipped gestures).
- **Break:** wireframe, semi-transparent; per-frame random visibility dropouts, positional jitter, opacity flicker (half-rendered, unfinished).
- **Return:** warm skin, Andean-textile poncho (procedural canvas texture: terracotta/gold bands with white diamonds), chullo hat; breathing, swaying, arms moving in huaynito rhythm.

Hybridity is built in: same geometry, different clothing/material/motion — Western-to-traditional shift across universes.

## 5. Interaction Mechanics

- **Navigation:** drag-to-look + WASD/arrow walk, bounded per world (first-person — the visitor occupies the protagonist's eye).
- **Raycast storytelling:** every interactable (desk, chicote, lamp, mirror, doors, avatars, letter, kitchen, words) emits a story beat → subtitle narration drawn verbatim from the narrative script.
- **Reactive refusal:** U1 doors shake but never open — interaction that answers back with denial.
- **Collection system:** six Quechua word-sprites with chimes rising in pitch; a tracker UI fills in; completion is the trigger for the finale (event-driven storytelling).
- **Temporal mechanic:** U2 expels the visitor — the environment itself enacts "this universe does not linger."
- **Cinematic camera:** GSAP pull-back/tilt-up for the 26-second finale shot ("slow zoom out into infinite sky").
- **Docent controls (exhibition):** keys 0/1/2/3 jump between chapters; `window.__kawsay` exposes the event bus for installation control software / show-control integration.

## 6. Animation & Simulation Systems

- Per-world `update(dt)` loops: rain fall + respawn (1,600 particles), pollen drift (500), glitch-fragment flicker (60 bodies), starfield rotation (3,000), banner wind sway, desk wobble, lamp/hearth flame flicker, portal rotation/pulse.
- Avatar procedural animation per mode (see §4).
- Light simulation: randomized flicker (room), strobing glitch glow (U2), sinusoidal hearth (U3).
- All audio is **procedurally synthesized** (WebAudio oscillators + noise buffers) — zero audio assets, instant load, infinitely loopable for gallery hours.

## 7. Technical Architecture

```
kawsay-ripuy/
├── index.html        UI overlay: title, subtitles, chapter, hints, word tracker, finale text
└── src/
    ├── main.js       renderer, camera, event bus, controls, raycasting,
    │                 world state machine, narration queue, finale director
    ├── worlds.js     buildRoom / buildSilence / buildBreak / buildReturn / buildFinale
    │                 each returns { group, interactables, update, playerStart, bounds, fog, … }
    ├── avatar.js     one rig, three material/motion modes
    ├── words.js      Quechua lexicon + canvas-texture word sprites
    └── audio.js      procedural Soundscape engine (layers per universe)
```

- **Stack:** Three.js + GSAP + Vite, vanilla ES modules (no framework lock-in; trivially portable to React Three Fiber later).
- **Pattern:** worlds are pure builders returning a uniform contract; `main.js` is the only stateful conductor. Adding a chapter = one builder + one entry in `switchWorld`.
- **Performance:** shared geometries, `BufferGeometry` particles, pixel-ratio cap at 2, fog-culled draw distance. Runs at 60fps on integrated graphics.
- **Deployment:** `npm run build` → static WebGL bundle; host anywhere (GitHub Pages, Vercel, a gallery laptop with no internet).

## 8. Asset Recommendations (upgrade path)

The piece currently uses 100% procedural assets (fast iteration, tiny bundle). For the exhibition cut:

1. **Blender:** replace primitive avatar with a sculpted/rigged character (export glTF + three animation clips matching the three modes); adobe house and apus as low-poly sculpts with baked AO.
2. **Photogrammetry (Polycam/Reality Capture, per syllabus):** scan a real chuta loaf, vicuña-wool textile, antique Quechua dictionary — placing real cultural objects in the symbolic world.
3. **Audio:** recorded Quechua voice (the grandmother's words, the final address) layered over the procedural bed; a licensed Huaycapata huaynito recording rising in U3.
4. **Type:** a serif with full Quechua diacritic support for the word sprites.

## 9. Exhibition Setup (Final Project)

- **Station:** large display or short-throw projection + one wired mouse/keyboard (or trackpad); over-ear headphones, or open speakers if the room allows — the soundscape is the father's footsteps; it should be felt.
- **Attract loop:** the title screen is the idle state; the experience resets there (reload) after the finale credits — a docent or a timed reload script can cycle it.
- **Docent keys** (0–3) let a facilitator move visitors between chapters during crit or guided tours.
- **Multi-user extension (collaborative requirement):** the event bus is the seam. A small WebSocket relay (e.g. 20-line Node + `ws`) broadcasting `wordCollected` events would let multiple stations share one constellation — every visitor's gathered words rise into a *communal* sky, which is the project's thesis (knowledge flowing back into community) made mechanical. Second option: a phone-based companion (QR code) where visitors type a word for someone who taught them who they are; words join the finale sky.
- **Wall text:** the artist statement, the central question — *Who taught you what a man looks like? And what would you choose, if you could start again?*

## 10. Course Alignment

- **Project 3 — Interactive Environment:** raycast-reactive objects, environment that responds (doors refusing, U2 ejecting, words collected), dynamic lighting, particles, event-driven narrative, web connectivity hooks. The space is alive, not static.
- **Final Project — Collaborative Exhibition:** exhibition-ready static build, docent controls, attract/idle loop, documented multi-user architecture, cinematic finale that functions as the "short animated film" inside the installation.

## Run it

```bash
cd kawsay-ripuy
npm install
npm run dev      # local
npm run build    # exhibition bundle in dist/
```

Controls: **drag** to look · **WASD** to walk · **click** objects, portals, and words · **R** to return to the room · **0–3** docent chapter jumps.
