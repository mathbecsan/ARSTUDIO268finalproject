// Opening animatic for KAWSAY RIPUY — a short-film prologue that recreates
// the author's remembered tension before the interactive world begins.
// Seven letterboxed, film-grained vignettes drawn in Canvas 2D:
//   1. The author (portrait, moody green)        — "a true story"
//   2. Bowed head, clasped hands                  — making himself small
//   3. The hand reaching for the door handle      — the clomp approaching
//   4. The knock on the door                      — three knocks, held breath
//   5. The bracing child, palms raised            — fear of the chicote
//   6. Open hands cradling small selves           — what he was also carrying
//   7. The mirror & the idealized reflection      — "break that mirror"
//
// onCue(name) lets main.js trigger procedural audio at the right beats.

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Photoreal stills generated via Higgsfield (Nano Banana), preloaded.
// Scenes fall back to the procedural drawings below if an image isn't ready.
const IMG = {};
['01_author', '02_bowed', '03_reach', '04_knock'].forEach(n => {
  const im = new Image(); im.src = `/prologue/${n}.png`; IMG[n] = im;
});

// Cover-fit a still over the frame with a slow cinematic Ken Burns push-in/pan.
function drawPhoto(ctx, img, w, h, p) {
  if (!img || !img.complete || !img.naturalWidth) return false;
  const ir = img.naturalWidth / img.naturalHeight, cr = w / h;
  let dw, dh;
  if (ir > cr) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
  const s = 1.05 + p * 0.08; dw *= s; dh *= s;
  const panX = (p - 0.5) * (dw - w) * 0.22;
  ctx.drawImage(img, (w - dw) / 2 - panX, (h - dh) / 2, dw, dh);
  return true;
}

// ---------------------------------------------------------------------------
// Scene painters. Each gets (ctx, w, h, t, p) — t seconds in, p = 0..1.
// ---------------------------------------------------------------------------

function sceneAuthor(ctx, w, h, t, p) {
  if (drawPhoto(ctx, IMG['01_author'], w, h, p)) return;
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, h * 0.75);
  g.addColorStop(0, '#22382a'); g.addColorStop(1, '#080f0a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  ctx.save();
  const s = 1.0 + p * 0.09; // slow push-in
  ctx.translate(w * 0.5, h * 0.5); ctx.scale(s, s); ctx.translate(-w * 0.5, -h * 0.5);

  const cx = w * 0.5, cy = h * 0.46, fw = h * 0.15, fh = h * 0.2;
  // shoulders
  ctx.fillStyle = '#1b211b';
  ctx.beginPath(); ctx.ellipse(cx, cy + fh * 1.7, fw * 1.9, fh * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  // neck
  ctx.fillStyle = '#8a5e3e'; ctx.fillRect(cx - fw * 0.32, cy + fh * 0.55, fw * 0.64, fh * 0.7);
  // head with side light (cool green key from left)
  const hg = ctx.createLinearGradient(cx - fw, cy, cx + fw, cy);
  hg.addColorStop(0, '#d6a06d'); hg.addColorStop(0.55, '#a9764c'); hg.addColorStop(1, '#5c3e28');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.ellipse(cx, cy, fw, fh, 0, 0, Math.PI * 2); ctx.fill();
  // hair
  ctx.fillStyle = '#150f0a';
  ctx.beginPath(); ctx.ellipse(cx, cy - fh * 0.52, fw * 1.04, fh * 0.7, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(cx - fw * 1.04, cy - fh * 0.55, fw * 0.18, fh * 0.7);
  ctx.fillRect(cx + fw * 0.86, cy - fh * 0.55, fw * 0.18, fh * 0.7);
  // stubble
  ctx.fillStyle = 'rgba(30,20,12,0.32)';
  ctx.beginPath(); ctx.ellipse(cx, cy + fh * 0.42, fw * 0.82, fh * 0.52, 0, 0, Math.PI); ctx.fill();
  // glasses
  ctx.strokeStyle = '#120e0a'; ctx.lineWidth = fw * 0.07;
  const ey = cy - fh * 0.04, ew = fw * 0.62, eh = fh * 0.3, gap = fw * 0.12;
  roundRect(ctx, cx - gap - ew, ey - eh / 2, ew, eh, 7); ctx.stroke();
  roundRect(ctx, cx + gap, ey - eh / 2, ew, eh, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - gap, ey); ctx.lineTo(cx + gap, ey); ctx.stroke();
  // lens glint
  ctx.fillStyle = 'rgba(150,210,170,0.16)';
  roundRect(ctx, cx - gap - ew + 4, ey - eh / 2 + 3, ew * 0.45, eh * 0.4, 4); ctx.fill();
  // eyes
  ctx.fillStyle = '#241910';
  ctx.beginPath(); ctx.arc(cx - gap - ew * 0.5, ey, fw * 0.07, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + gap + ew * 0.5, ey, fw * 0.07, 0, 7); ctx.fill();
  // cool rim light on the right edge
  ctx.strokeStyle = 'rgba(110,200,150,0.45)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(cx, cy, fw, fh, 0, -Math.PI * 0.35, Math.PI * 0.45); ctx.stroke();
  ctx.restore();
}

function sceneBowed(ctx, w, h, t, p) {
  if (drawPhoto(ctx, IMG['02_bowed'], w, h, p)) return;
  ctx.fillStyle = '#0b0a0d'; ctx.fillRect(0, 0, w, h);
  // warm low practical from upper-left
  const g = ctx.createRadialGradient(w * 0.32, h * 0.2, 0, w * 0.4, h * 0.4, h * 0.8);
  g.addColorStop(0, 'rgba(120,80,45,0.5)'); g.addColorStop(1, 'rgba(20,14,10,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5, cy = h * 0.42, u = h * 0.16;
  ctx.save();
  ctx.translate(0, Math.sin(t * 1.1) * h * 0.004); // faint breathing
  // bowed head (we see the crown, tilted toward us)
  const skin = ctx.createLinearGradient(cx - u, cy, cx + u, cy);
  skin.addColorStop(0, '#caa074'); skin.addColorStop(1, '#6e4c32');
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(cx, cy, u * 0.92, u, 0, 0, Math.PI * 2); ctx.fill();
  // hair over the crown
  ctx.fillStyle = '#140e09';
  ctx.beginPath(); ctx.ellipse(cx, cy - u * 0.18, u * 0.96, u * 0.82, 0, Math.PI * 0.92, Math.PI * 0.08, true); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy - u * 0.35, u * 0.98, u * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  // shoulders hunched
  ctx.fillStyle = '#241d16';
  ctx.beginPath(); ctx.moveTo(cx - u * 2.1, h * 0.78);
  ctx.quadraticCurveTo(cx - u * 1.2, cy + u * 1.0, cx, cy + u * 1.2);
  ctx.quadraticCurveTo(cx + u * 1.2, cy + u * 1.0, cx + u * 2.1, h * 0.78);
  ctx.lineTo(cx + u * 2.1, h); ctx.lineTo(cx - u * 2.1, h); ctx.closePath(); ctx.fill();
  // clasped hands just beneath the bowed head
  const hy = cy + u * 0.95;
  ctx.fillStyle = '#bb8a5e';
  ctx.beginPath(); ctx.ellipse(cx, hy, u * 0.62, u * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  // interlocked finger lines
  ctx.strokeStyle = 'rgba(60,38,24,0.7)'; ctx.lineWidth = u * 0.07;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * u * 0.18, hy - u * 0.36);
    ctx.lineTo(cx + i * u * 0.18 + u * 0.08, hy + u * 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

function sceneReach(ctx, w, h, t, p) {
  if (drawPhoto(ctx, IMG['03_reach'], w, h, p)) return;
  ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, w, h);
  // doorway with a sliver of cold light leaking around it
  const dx = w * 0.5, dw = w * 0.36, dh = h * 0.82, dy = h * 0.08;
  ctx.fillStyle = 'rgba(150,170,210,0.5)';
  ctx.fillRect(dx - dw / 2 - 6, dy, dw + 12, dh); // light halo
  ctx.fillStyle = '#1a1410'; // door
  ctx.fillRect(dx - dw / 2, dy, dw, dh);
  // panels
  ctx.strokeStyle = '#0d0a07'; ctx.lineWidth = 4;
  roundRect(ctx, dx - dw / 2 + 18, dy + 30, dw - 36, dh * 0.4, 4); ctx.stroke();
  roundRect(ctx, dx - dw / 2 + 18, dy + dh * 0.5, dw - 36, dh * 0.42, 4); ctx.stroke();
  // round handle
  const handX = dx + dw / 2 - 34, handY = dy + dh * 0.52;
  ctx.fillStyle = '#caa84e';
  ctx.beginPath(); ctx.arc(handX, handY, 13, 0, 7); ctx.fill();

  // a hand + forearm reaching up toward the handle from below
  const reach = smooth(0, 0.7, p); // approaches then hovers
  const hx = handX + 4, hy = h * 1.05 - reach * (h * 1.05 - handY - 26);
  ctx.save();
  ctx.fillStyle = '#9c6c45';
  // forearm (sleeve)
  ctx.fillStyle = '#2a2018';
  ctx.fillRect(hx - 26, hy + 30, 52, h);
  // hand
  ctx.fillStyle = '#b9855a';
  roundRect(ctx, hx - 26, hy - 4, 52, 46, 16); ctx.fill();
  // fingers reaching
  ctx.fillStyle = '#a9744c';
  for (let i = 0; i < 4; i++) {
    roundRect(ctx, hx - 24 + i * 13, hy - 26, 10, 30, 5); ctx.fill();
  }
  ctx.restore();
  // handle glint intensifies as the hand nears
  ctx.fillStyle = `rgba(255,240,180,${0.2 + reach * 0.5})`;
  ctx.beginPath(); ctx.arc(handX - 3, handY - 3, 4, 0, 7); ctx.fill();
}

function sceneKnock(ctx, w, h, t, p) {
  if (drawPhoto(ctx, IMG['04_knock'], w, h, p)) return;
  ctx.fillStyle = '#0a0c12'; ctx.fillRect(0, 0, w, h);
  // a deep blue paneled door (matching the reference)
  const dx = w * 0.5, dw = w * 0.5, dh = h * 0.92, dy = h * 0.04;
  const dg = ctx.createLinearGradient(dx - dw / 2, 0, dx + dw / 2, 0);
  dg.addColorStop(0, '#243349'); dg.addColorStop(0.5, '#33486690'.slice(0, 7)); dg.addColorStop(0.5, '#33486a'); dg.addColorStop(1, '#1d2a3d');
  ctx.fillStyle = '#2e425e'; ctx.fillRect(dx - dw / 2, dy, dw, dh);
  // panels
  ctx.strokeStyle = '#1b2942'; ctx.lineWidth = 6;
  const pad = 26;
  [0, 1].forEach(col => [0, 1].forEach(row => {
    const pw = (dw - pad * 3) / 2, ph = (dh - pad * 3) / 2;
    roundRect(ctx, dx - dw / 2 + pad + col * (pw + pad), dy + pad + row * (ph + pad), pw, ph, 6);
    ctx.stroke();
  }));
  // handle
  ctx.fillStyle = '#c9a84e';
  ctx.beginPath(); ctx.arc(dx + dw / 2 - 40, dy + dh * 0.5, 12, 0, 7); ctx.fill();

  // knocking fist — three knocks at t≈1,2,3s
  const knockT = [1.0, 2.0, 3.0];
  let near = 0; // 0 = away from door, 1 = striking
  for (const kt of knockT) {
    const d = t - kt;
    if (d > -0.18 && d < 0.18) near = Math.max(near, 1 - Math.abs(d) / 0.18);
  }
  const fx = dx - dw * 0.12, fy = dy + dh * 0.42;
  const push = near * 18;
  ctx.save();
  // sleeve
  ctx.fillStyle = '#20304a';
  ctx.fillRect(fx - 34, fy - 6 + push, 70, h);
  // fist
  ctx.fillStyle = '#b9855a';
  roundRect(ctx, fx - 34, fy - 34 + push, 70, 56, 18); ctx.fill();
  ctx.fillStyle = '#a9744c';
  for (let i = 0; i < 4; i++) { roundRect(ctx, fx - 30 + i * 16, fy - 30 + push, 13, 22, 6); ctx.fill(); }
  ctx.restore();
  // impact lines flash on contact
  if (near > 0.4) {
    ctx.strokeStyle = `rgba(255,235,190,${near})`; ctx.lineWidth = 4;
    const ix = fx + 40, iy = fy - 4 + push;
    for (let a = 0; a < 6; a++) {
      const ang = -Math.PI / 2 + (a - 2.5) * 0.4;
      ctx.beginPath();
      ctx.moveTo(ix + Math.cos(ang) * 16, iy + Math.sin(ang) * 16);
      ctx.lineTo(ix + Math.cos(ang) * (30 + near * 14), iy + Math.sin(ang) * (30 + near * 14));
      ctx.stroke();
    }
  }
}

function sceneChild(ctx, w, h, t, p) {
  // pale, desaturated (matching the reference illustration)
  ctx.fillStyle = '#cfd3cf'; ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, h * 0.7);
  g.addColorStop(0, '#e7e9e4'); g.addColorStop(1, '#aab0ad');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5, cy = h * 0.4, u = h * 0.14;
  const tremble = Math.sin(t * 22) * (1.2 + Math.sin(t * 3) * 1.2);
  ctx.save();
  ctx.translate(tremble, 0);
  // head
  ctx.fillStyle = '#e9e9ec';
  ctx.beginPath(); ctx.ellipse(cx, cy, u * 0.92, u * 1.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5a5f63'; ctx.lineWidth = 3; ctx.stroke();
  // hair
  ctx.fillStyle = '#3c4347';
  ctx.beginPath(); ctx.ellipse(cx, cy - u * 0.55, u * 0.96, u * 0.6, 0, Math.PI, 0); ctx.fill();
  // worried brows (angled up toward center)
  ctx.strokeStyle = '#3c4347'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - u * 0.5, cy - u * 0.1); ctx.lineTo(cx - u * 0.15, cy - u * 0.28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + u * 0.5, cy - u * 0.1); ctx.lineTo(cx + u * 0.15, cy - u * 0.28); ctx.stroke();
  // wide worried eyes
  ctx.fillStyle = '#2b3033';
  ctx.beginPath(); ctx.arc(cx - u * 0.34, cy + u * 0.05, u * 0.13, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + u * 0.34, cy + u * 0.05, u * 0.13, 0, 7); ctx.fill();
  // small downturned mouth
  ctx.strokeStyle = '#5a5f63'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy + u * 0.62, u * 0.22, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  // raised palms, bracing toward the viewer
  const py = cy + u * 1.5;
  [-1, 1].forEach(side => {
    const px = cx + side * u * 0.95;
    ctx.fillStyle = '#e9e2da';
    roundRect(ctx, px - u * 0.42, py - u * 0.5, u * 0.84, u * 0.9, u * 0.3); ctx.fill();
    ctx.strokeStyle = '#9aa09c'; ctx.lineWidth = 2; ctx.stroke();
    // fingers
    for (let i = 0; i < 4; i++) {
      roundRect(ctx, px - u * 0.4 + i * u * 0.21, py - u * 0.86, u * 0.16, u * 0.42, u * 0.08);
      ctx.fillStyle = '#e9e2da'; ctx.fill(); ctx.stroke();
    }
  });
  ctx.restore();
}

function sceneHands(ctx, w, h, t, p) {
  ctx.fillStyle = '#0c0a12'; ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, h * 0.6);
  g.addColorStop(0, 'rgba(60,40,70,0.6)'); g.addColorStop(1, 'rgba(8,6,14,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5, cy = h * 0.62, u = h * 0.2;
  // two cupped open palms, side by side
  [-1, 1].forEach(side => {
    const px = cx + side * u * 0.7;
    ctx.fillStyle = '#caa074';
    ctx.beginPath();
    ctx.ellipse(px, cy, u * 0.7, u * 0.5, side * 0.2, 0, Math.PI * 2); ctx.fill();
    // fingers fanning upward
    ctx.fillStyle = '#b98a5e';
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 + (i - 1.5) * 0.26 + side * 0.1;
      ctx.save(); ctx.translate(px + Math.cos(a) * u * 0.55, cy + Math.sin(a) * u * 0.45);
      ctx.rotate(a + Math.PI / 2);
      roundRect(ctx, -u * 0.07, -u * 0.5, u * 0.14, u * 0.5, u * 0.06); ctx.fill();
      ctx.restore();
    }
  });
  // small glowing selves resting in the palms (the futures he carried)
  const rise = smooth(0.2, 1, p);
  [-1, 1].forEach((side, k) => {
    const px = cx + side * u * 0.7, py = cy - u * 0.15 - rise * u * 0.15;
    const glow = ctx.createRadialGradient(px, py, 0, px, py, u * 0.4);
    glow.addColorStop(0, `rgba(255,210,130,${0.7 * rise})`);
    glow.addColorStop(1, 'rgba(255,180,90,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(px, py, u * 0.4, 0, 7); ctx.fill();
    // tiny figure
    ctx.fillStyle = `rgba(255,240,210,${rise})`;
    ctx.beginPath(); ctx.arc(px, py - u * 0.16, u * 0.07, 0, 7); ctx.fill();
    roundRect(ctx, px - u * 0.06, py - u * 0.09, u * 0.12, u * 0.22, u * 0.05); ctx.fill();
  });
}

function sceneMirror(ctx, w, h, t, p) {
  ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, w, h);
  // wall wash
  const wall = ctx.createLinearGradient(0, 0, 0, h);
  wall.addColorStop(0, '#15131c'); wall.addColorStop(1, '#0a0a0f');
  ctx.fillStyle = wall; ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5, my = h * 0.4, mr = h * 0.26;
  // mirror frame
  ctx.strokeStyle = '#3a2c1c'; ctx.lineWidth = 16;
  ctx.beginPath(); ctx.ellipse(cx, my, mr * 0.8, mr, 0, 0, Math.PI * 2); ctx.stroke();
  // reflection: an idealized, brighter self
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx, my, mr * 0.8 - 8, mr - 8, 0, 0, Math.PI * 2); ctx.clip();
  const glow = ctx.createRadialGradient(cx, my, 0, cx, my, mr);
  glow.addColorStop(0, '#5b6f9c'); glow.addColorStop(1, '#1c2336');
  ctx.fillStyle = glow; ctx.fillRect(cx - mr, my - mr, mr * 2, mr * 2);
  // luminous figure in the mirror
  const lift = smooth(0.3, 1, p);
  ctx.fillStyle = `rgba(220,232,255,${0.6 + lift * 0.4})`;
  ctx.beginPath(); ctx.arc(cx, my - mr * 0.18, mr * 0.22, 0, 7); ctx.fill();      // head
  ctx.beginPath();
  ctx.moveTo(cx - mr * 0.4, my + mr * 0.7);
  ctx.quadraticCurveTo(cx, my + mr * 0.05, cx + mr * 0.4, my + mr * 0.7);
  ctx.lineTo(cx + mr * 0.4, my + mr); ctx.lineTo(cx - mr * 0.4, my + mr); ctx.closePath(); ctx.fill();
  // halo
  ctx.strokeStyle = `rgba(255,225,160,${lift * 0.5})`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, my - mr * 0.18, mr * 0.3, 0, 7); ctx.stroke();
  ctx.restore();

  // the boy (real, in shadow) seen from behind, looking up at the mirror
  ctx.fillStyle = '#0c0b10';
  ctx.beginPath(); ctx.arc(cx, h * 0.86, h * 0.1, 0, 7); ctx.fill();            // back of head
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.2, h); ctx.quadraticCurveTo(cx, h * 0.78, cx + h * 0.2, h);
  ctx.closePath(); ctx.fill();                                                  // shoulders
}

// ---------------------------------------------------------------------------
// Sequence
// ---------------------------------------------------------------------------
const SCENES = [
  { dur: 7, draw: sceneAuthor, cap: 'Kawsay Ripuy is a true story.', cue: 'tension' },
  { dur: 6, draw: sceneBowed,  cap: 'There were nights I learned to make myself small.' },
  { dur: 7, draw: sceneReach,  cap: 'His clomp signaled that he would soon enter my room.', cue: 'steps' },
  { dur: 6, draw: sceneKnock,  cap: 'The whole house would hold its breath.', cue: 'knock' },
  { dur: 6, draw: sceneChild,  cap: 'Anything other than quietness guaranteed dozens of hits.' },
  { dur: 6.5, draw: sceneHands, cap: 'But I was carrying more than fear — I was carrying who I could still become.' },
  { dur: 8, draw: sceneMirror, cap: 'He mirrored his own father. I was meant to mirror him.', cue: 'tension' },
];

export function playIntro({ canvas, captionEl, skipBtn, onCue, onDone }) {
  const ctx = canvas.getContext('2d');
  let w, h, dpr, raf, running = true, t0 = performance.now() / 1000, lastScene = -1, lastCueScene = -1;
  let captionShown = '';

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  resize();

  const total = SCENES.reduce((s, x) => s + x.dur, 0);

  function grain(amount) {
    // cheap film grain via sparse dots
    ctx.save();
    ctx.globalAlpha = amount;
    for (let i = 0; i < 700; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const v = Math.random() * 255 | 0;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    ctx.restore();
  }

  function letterbox() {
    const barH = Math.max(0, (h - w / 2.39) / 2); // 2.39:1 scope
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillRect(0, h - barH, w, barH);
  }

  function vignette() {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  function frame() {
    if (!running) return;
    const now = performance.now() / 1000;
    let elapsed = now - t0;

    if (elapsed >= total) { finish(); return; }

    // find current scene + local time
    let acc = 0, idx = 0, localT = 0;
    for (let i = 0; i < SCENES.length; i++) {
      if (elapsed < acc + SCENES[i].dur) { idx = i; localT = elapsed - acc; break; }
      acc += SCENES[i].dur;
    }
    const sc = SCENES[idx];
    const p = localT / sc.dur;
    const alpha = smooth(0, 0.9, localT) * (1 - smooth(sc.dur - 0.9, sc.dur, localT));

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = alpha;
    sc.draw(ctx, w, h, localT, p);
    ctx.restore();

    vignette();
    grain(0.05 + Math.random() * 0.02);
    letterbox();

    // caption + audio cue on scene change
    if (idx !== lastScene) {
      lastScene = idx;
      if (captionShown !== sc.cap) {
        captionShown = sc.cap;
        captionEl.classList.remove('show');
        setTimeout(() => { captionEl.textContent = sc.cap; captionEl.classList.add('show'); }, 350);
      }
    }
    if (idx !== lastCueScene && sc.cue) { lastCueScene = idx; onCue && onCue(sc.cue); }
    // hide caption near the end of each scene
    if (p > 0.85) captionEl.classList.remove('show');

    raf = requestAnimationFrame(frame);
  }

  function finish() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    captionEl.classList.remove('show');
    if (skipBtn) skipBtn.onclick = null;
    onDone && onDone();
  }

  if (skipBtn) skipBtn.onclick = finish;
  requestAnimationFrame(() => { resize(); });
  frame();

  return { skip: finish };
}
