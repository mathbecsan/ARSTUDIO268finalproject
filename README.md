# KAWSAY RIPUY — The Journey of Living

An interactive 3D web environment that turns an autobiographical narrative into a
walkable multiverse: one night in an adobe house in rural Peru, one mirror,
and three possible lives.

Built for ARTSTUDIO 268 (Advanced 3D Animation: Simulation & Avatarism) —
Project 3 (Interactive Environment) + Final Project (Collaborative Exhibition).

> **Musqusqaykimanta astawan karutaraq chayasaqku.**
> "We will get farther than you ever dreamed."

## The experience

1. **The Room** — kerosene lamp, ironing-board desk, the chicote on the wall. Click objects to remember. Touch the mirror to open three portals.
2. **Universe 1 — The Silence (What Was)** — grey stone, cold rain, doors that shudder but never open.
3. **Universe 2 — The Break (What Could Have Been)** — a half-rendered wireframe world that ejects you. A glimpse, a warning, an act of grief.
4. **Universe 3 — The Return (What Is)** — terracotta valley, the grandmother's kitchen, six Quechua words floating as light. Gather them all.
5. **Finale** — the words rise as constellations over the apus.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # static exhibition bundle in dist/
```

**Controls:** drag to look · WASD to walk · click objects, portals, and words · R to return to the room · 0–3 docent chapter jumps (exhibition).

## Stack

Three.js · GSAP · Vite · procedural WebAudio soundscapes (zero audio assets) · procedural avatar with three universe-specific renderings.

Full concept, world design, interaction mechanics, technical architecture, and
exhibition setup: **[DESIGN.md](DESIGN.md)**.
