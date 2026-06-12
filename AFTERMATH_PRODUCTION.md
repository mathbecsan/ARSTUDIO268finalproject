# THE AFTERMATH: Production Pipeline & Shot Prompts

**Status:** Ready for Higgsfield Seedream + Image-to-Video generation  
**Total Runtime:** ~41 seconds (7s + 8s + 8s + 10s + 12s)  
**Color Language:** Warm amber-gold → cool desaturated grays → deep indigo → warm gold-amber  
**Audio:** "After All" (Goldrich/Heisler) or procedural grief-to-redemption soundscape  

---

## How to Use This Document

1. **For Higgsfield Seedream (Still Generation):**
   - Copy each STILL PROMPT exactly as written
   - Paste into Higgsfield with negative prompt: `plastic skin, waxy faces, oversaturated colors, blown-out highlights, garbled text, extra fingers, distorted hands, flat lighting, video-game HUD, low detail, cartoonish, watermark, logo`
   - Generate 2–3 variations per shot; select the one with strongest emotional clarity
   - **Lock the mother's face as a Higgsfield Soul across Shots 2, 3, and 5** to ensure facial continuity

2. **For Higgsfield Image-to-Video (Animation):**
   - Once you have approved stills, copy each MOTION PROMPT
   - Feed the still + motion prompt to Kling 3.0 or Sora 2
   - Generate at 60fps, 1080p or higher
   - Export as 16:9 MP4

3. **For Editing/Assembly:**
   - Import all 5 shots into your NLE (Premiere, Final Cut, DaVinci)
   - Cut on motion: Shot 1 ends with the laugh/tear; Shot 2 starts as the camera moves; etc.
   - Sync audio (song or procedural soundtrack) to the overall 41-second arc
   - Grade to the locked color palette (amber → gray → indigo → amber)
   - Add subtle film grain and anamorphic flare in post if not present in generations

4. **For Interactive Integration:**
   - See Section 4 (code additions below)

---

## Section 4: Code Integration

### A. New World Builder: `buildAfterall()`

Add to `src/worlds.js`:

```javascript
export function buildAfterall(events) {
  const group = new THREE.Group();
  const interactables = [];
  const updaters = [];

  // Placeholder for now: we'll display the cinematic sequence
  // as texture planes or as an embedded video/canvas element
  group.add(ground(120, 0x0a0810));

  // The 5 shots will be displayed as sequential scenes
  // For MVP: use canvas/texture planes showing the stills,
  // with procedural audio + text overlay (shot descriptions).
  // For full: embed MP4 videos of the generated shots.

  const shots = [
    { duration: 7, title: 'SHOT 1 — The Beginning', subtitle: 'The bond...' },
    { duration: 8, title: 'SHOT 2 — First Crack', subtitle: 'Conflict as environment...' },
    { duration: 8, title: 'SHOT 3 — The Moment', subtitle: 'Outside the door...' },
    { duration: 10, title: 'SHOT 4 — Collapse', subtitle: 'Every possible future...' },
    { duration: 12, title: 'SHOT 5 — Transformation', subtitle: 'Grief becomes light...' },
  ];

  let currentShot = 0;
  let shotTimer = 0;

  updaters.push(dt => {
    shotTimer += dt;
    if (shotTimer > shots[currentShot].duration) {
      currentShot = (currentShot + 1) % shots.length;
      shotTimer = 0;
    }
    // Update UI with current shot info
  });

  return {
    group,
    interactables,
    update: dt => updaters.forEach(u => u(dt)),
    playerStart: new THREE.Vector3(0, 1.65, 3),
    bounds: { minX: -40, maxX: 40, minZ: -40, maxZ: 20 },
    fog: new THREE.Fog(0x0a0810, 20, 100),
    background: new THREE.Color(0x0a0810),
    ambient: 0.2,
  };
}
```

### B. New UI: Finale Button + Unlock

In `index.html`, add after `#finale-text`:

```html
<div id="aftermath-unlock" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 16; text-align: center; background: rgba(0,0,0,0.85); padding: 3rem; border-radius: 1rem; width: 90%; max-width: 600px;">
  <h2 style="color: #f0e6d2; margin-bottom: 1rem; font-size: 1.5rem; letter-spacing: 0.3em;">THE AFTERMATH UNLOCKED</h2>
  <p style="color: #9aa0ad; margin-bottom: 2rem; line-height: 1.8;">A mother's journey through grief. The untold half of the story.</p>
  <button id="enter-aftermath" style="padding: 0.8rem 2rem; background: #c9a227; color: #000; border: none; cursor: pointer; font-size: 1rem; letter-spacing: 0.2em; border-radius: 0.25rem;">ENTER</button>
</div>
```

And in `main.js`, modify the finale sequence:

```javascript
function runFinale() {
  // ... existing finale code ...
  
  const finaleComplete = false;
  setTimeout(() => {
    finaleComplete = true;
    // Show the "Aftermath Unlocked" button
    document.getElementById('aftermath-unlock').style.display = 'block';
  }, 28000); // After all text has cycled

  document.getElementById('enter-aftermath')?.addEventListener('click', () => {
    switchWorld('afterall');
  });
}
```

Also, in the room, add a locked button in `buildRoom()`:

```javascript
const afterallButton = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.6, 0.08),
  new THREE.MeshStandardMaterial({ color: 0xc9a227, emissive: 0x6d5d14, emissiveIntensity: 0.5 })
);
afterallButton.position.set(-2.5, 1, 2);
group.add(afterallButton);

interactables.push({
  mesh: afterallButton,
  label: 'The Aftermath (Unlocked after completing the main story)',
  requiresUnlock: true, // Will only be accessible after completing finale
  onInteract: () => events.emit('enterAfterall'),
});

// In events.on('enterAfterall'), same as enterUniverse but for 'afterall'
```

---

## Section 5: Procedural Audio for "The Aftermath"

Since the song may have copyright restrictions, I've designed a procedural emotional soundscape that mirrors the mother's journey:

**Shot 1 — Warmth:** Soft pad (minor chords, ~220Hz fundamentals), bright metallic tones (bells/chimes representing hope)  
**Shot 2 — Conflict:** Dissonant drones, bass rumble, subtle feedback/distortion  
**Shot 3 — Stillness:** All music stops. Only heartbeat + breathing sounds + distant wind  
**Shot 4 — Collapse:** Chaotic high-frequency sweeps, reverb-heavy, disorienting stereo panning  
**Shot 5 — Redemption:** Warm pads return, layered with choir-like vocal textures, building to a resolved consonant chord  

If you want to use the actual "After All," ensure licensing is cleared for exhibition use.

---

## Section 6: Testing Checklist

- [ ] All 5 stills generated and approved
- [ ] All 5 videos generated at 60fps, 1080p+
- [ ] Audio track (song or procedural) finalized and synced
- [ ] Color grade consistent across all 5 shots
- [ ] UI buttons appear in room + finale
- [ ] Clicking "Enter Aftermath" transitions to the new world
- [ ] Cinematic plays without interruption (41s total)
- [ ] Player can return to room via R key after viewing
- [ ] Text overlays (shot titles) are readable and time correctly

---

## Next Steps

1. **Generate stills** via Higgsfield Seedream using the 5 STILL PROMPTS (this session)
2. **Generate videos** via Kling 3.0 / Sora using the 5 MOTION PROMPTS
3. **Grade & assemble** in your NLE
4. **Integrate into KAWSAY RIPUY** codebase (I'll add the world builder + UI)
5. **Test end-to-end** playthrough from title screen → room → finale → aftermath

**Estimated production time:** 4–6 hours (Higgsfield + video generation, editing, final integration)
