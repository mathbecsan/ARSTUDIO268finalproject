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

*A Mother's Reckoning* — a cinematic 5-movement animatic (inspired by "After All" by Zina Goldrich & Marcy Heisler).

> **The alternate ending.** Where Act I asks what it took for the protagonist to *live*,
> The Aftermath is the universe where he doesn't make it — the timeline that ends in suicide —
> told entirely from the side of **the people who survive him**: his mother first, then the
> community, and the grief his loss leaves in a world that continues without him.

⚠️ **Content note:** depicts suicide and grief (without graphic depiction). If you're
struggling: **US** call/text **988** · **Perú** **Línea 113, opción 5** · anywhere
[findahelpline.com](https://findahelpline.com).

### The Two Hopes — why the acts differ in tone

|  | **Act I — Personal Story** | **Act II — The Aftermath** |
|---|---|---|
| **Hope** | Hope *about the future*, despite hardship | Hope that *does not heal* the pain of the past |
| **Outcome** | He survives; transformation is possible | He is gone; the loss is permanent |
| **Resolution** | Redemption *forward* | Redemption *without erasure* — grief and purpose coexist |
| **Voice** | First person; he is the guide | He is absent; the mother is the center |

Act I says *the future can be better than the past.* Act II says *the future can hold meaning —
and the loss still happened, and still hurts.* The mother turns sorrow into mental-health
advocacy and the breaking of the cycle, but it is explicitly **not a cure**. The empty chair
stays empty.

### The Five Movements

1. **The Beginning** — A newborn; a mother's love before any expectation, disappointment, or grief
2. **Conflict** — The house darkens; violence seeps through walls and windows; isolation deepens
3. **The Moment** — Outside his bedroom door, the night she almost knocked: the intervention not made
4. **Collapse** — Not one life ending but *thousands of futures* dying at once, star by star
5. **Transformation** — Years later: grief turned into advocacy, support groups, protection for other sons — hope that does not undo the loss

**Accessible:** post-finale **"Experience the Aftermath"** button, plus a persistent
title-screen shortcut once Act I is completed (remembered in the browser).
**Runtime:** ~41s · **Audio:** procedural grief-arc soundscape (warmth → conflict → silence → collapse → redemption).

📖 **Full treatment:** **[AFTERMATH.md](AFTERMATH.md)** (concept, tonal thesis, systems) ·
**[AFTERMATH_PRODUCTION.md](AFTERMATH_PRODUCTION.md)** (photoreal shot prompts / video pipeline)

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

## The Film

Click **"✦ Watch the Film"** on the title screen: the entire essay performed as a fully
animated, in-engine 3D short (~2 min, 16 shots) — animated characters (the boy, father,
grandfather, grandmother), four sets, dynamic cameras, captions, letterbox, and a
shot-conducted score. Skippable; ends inside the explorable Room.
Photoreal Pixar/UE5-grade production prompts for all 16 shots: **[FILM_PRODUCTION.md](FILM_PRODUCTION.md)**.

---

## Documentation

- **[DESIGN.md](DESIGN.md)** — **Act I** concept: world design, interaction mechanics, technical architecture, exhibition setup, asset recommendations
- **[FILM_PRODUCTION.md](FILM_PRODUCTION.md)** — **The Film**: 16-shot breakdown of the essay, in-engine machinima (live) + paste-ready photoreal video prompts, plan/credit budget
- **[AFTERMATH.md](AFTERMATH.md)** — **Act II** concept: the alternate ending, the *Two Hopes* tonal thesis, narrative structure, unlock workflow, implemented systems
- **[AFTERMATH_PRODUCTION.md](AFTERMATH_PRODUCTION.md)** — Cinematic production pipeline; 5-shot breakdown with locked STYLE DNA; Higgsfield Seedream/Nano Banana + image-to-video prompts; production checklist

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
✅ **Act I:** Cinematic prologue + Room + 3 universes + finale sequence  
✅ **Cinematic prologue:** 7-shot opening animatic — **4 shots now play real photoreal stills** generated via the Higgsfield pipeline (`public/prologue/`); 3 remain stylized illustrations  
✅ **Act II (The Aftermath):** Unlockable 5-movement animatic — world builder + unlock UI + persistent start-screen shortcut + procedural grief-arc audio, all live in-engine  
🔄 **Act II photoreal pass (optional):** In-engine animatic plays now; photoreal footage can be dropped in via the validated Higgsfield pipeline (see AFTERMATH_PRODUCTION.md)

The entire narrative, interaction system, and technical foundation is live and functional across both acts. The Higgsfield photoreal pipeline is proven (the prologue already runs generated footage) and ready to extend to the Aftermath shots when desired.
