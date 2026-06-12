# KAWSAY RIPUY — The Journey of Living
## A 3D Interactive Multiverse & Cinematic Aftermath

An immersive 3D web experience that transforms an autobiographical narrative into a
walkable multiverse spanning two acts: **The Personal Story** (one night, three possible lives)
and **The Aftermath** (a mother's journey through grief and redemption).

Built for ARTSTUDIO 268 (Advanced 3D Animation: Simulation & Avatarism) —
Project 3 (Interactive Environment) + Final Project (Collaborative Exhibition).

> **Musqusqaykimanta astawan karutaraq chayasaqku.**
> "We will get farther than you ever dreamed."

---

## ACT I — The Personal Story

### The Room
An adobe bedroom in rural Peru. One night. One kerosene lamp. One mirror that fractures reality.
- **Interactable objects:** desk, chicote, lamp, mirror
- **Narration:** Each object triggers a memory, building the emotional context
- **The choice:** Touch the mirror to open three portals into alternate universes

### Universe 1 — The Silence (What Was)
*Grey stone. Cold rain. A world of refusal.*

A boy who learned to disappear. Closed doors. Rigid posture. No words spoken.
- The costs of stoicism
- The pain of unexpressed emotion
- Safety through suppression

### Universe 2 — The Break (What Could Have Been)
*Wireframe. Glitch. A world that never loaded.*

A glimpse of a life that almost was—and the tragedy of near-misses.
- The universe that fractured under pressure
- Half-rendered, unfinished, impossible to inhabit
- Auto-ejects after ~55 seconds (you cannot stay; no one could)

### Universe 3 — The Return (What Is)
*Terracotta. Warmth. The grandmother's kitchen.*

The world where the story actually lived. Where words were reclaimed. Where culture became refuge.
- Six Quechua words float as light: *sinchi, sumaq, umasapa, kallpacharikuy, sunqulliy, sullullchay*
- Language as landscape, culture as salvation
- The active choice to honor both indigenous roots and personal growth

### Finale
*Night sky. Constellations. Words become stars.*

All six Quechua words rise as living constellations over the Andean apus.
The camera pulls back into infinite space.
A meditation on parental grief, resilience, and the futures that exist in memory.

---

## ACT II — The Aftermath (Unlockable)

A cinematic 5-shot sequence: **A Mother's Reckoning** (inspired by "After All" by Goldrich & Heisler).

**Accessible:** Post-finale unlock button OR unlockable button at the game start (after completing Act I).

### The Five Shots

1. **The Beginning** — Warmth, newborn, a mother's perfect love crystallized
2. **Conflict** — The house darkens; violence seeps through windows; isolation deepens
3. **The Moment** — Outside a bedroom door; a choice not made; forgiveness for silence
4. **Collapse** — Every possible future dies at once; the multiverse fractures
5. **Transformation** — Grief becomes light; the mother transforms sorrow into community work and advocacy

**Total runtime:** ~41 seconds  
**Audio:** Procedural emotional soundscape (warm → conflict → silence → collapse → redemption)  
**Production-ready:** Full cinematic shot prompts with Higgsfield Seedream + image-to-video format (see [AFTERMATH_PRODUCTION.md](AFTERMATH_PRODUCTION.md))

---

## Run

```bash
npm install
npm run dev      # local dev server at localhost:5184
npm run build    # static exhibition bundle in dist/
```

**Controls:**
- **Drag** to look around
- **WASD / Arrow keys** to walk
- **Click** objects, portals, and words to interact
- **R** to return to the room (from any universe)
- **0–3** docent chapter jumps (exhibition mode)
- **ESC** to dismiss the Aftermath unlock dialog and return to the room

---

## Stack

- **Three.js** — 3D rendering, geometry, materials, lighting
- **GSAP** — timeline-driven animations and camera movements
- **Vite** — fast dev server and static bundling
- **Procedural WebAudio** — all soundscapes synthesized in real-time (zero audio assets)
- **Procedural avatar** — one rig, three universe-specific renderings (material/motion modes)
- **Canvas textures** — Quechua word sprites, Andean textile patterns, procedurally generated

---

## Documentation

- **[DESIGN.md](DESIGN.md)** — Full concept, world design, interaction mechanics, technical architecture, exhibition setup, asset recommendations
- **[AFTERMATH_PRODUCTION.md](AFTERMATH_PRODUCTION.md)** — Cinematic production pipeline; 5-shot breakdown with locked STYLE DNA; Higgsfield Seedream + image-to-video prompts; production checklist

---

## Exhibition Setup

The project is gallery-ready:
- **Attract loop:** Title screen idles; experience resets after finale
- **Docent controls:** Keys 0–3 to navigate chapters for guided tours
- **Multi-user extension:** Event bus architecture allows WebSocket relay for shared constellation finale
- **Wall text:** Artist statement + central question: *Who taught you what a man looks like? And what would you choose, if you could start again?*

---

## Project Status

✅ **Core experience:** Complete and playable  
✅ **Act I:** Room + 3 universes + finale sequence  
✅ **Act II framework:** Aftermath world builder + unlock UI + procedural audio system  
🔄 **Act II cinematic:** Awaiting generated images from Higgsfield (infrastructure ready; see AFTERMATH_PRODUCTION.md)

The entire narrative, interaction system, and technical foundation is live and functional. The Aftermath sequence is structured and ready for cinematic asset integration.
