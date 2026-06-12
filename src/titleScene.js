// Animated title background — a Peruvian sunset where the Andes meet the
// Pacific. Warm Latin-American palette: indigo dusk bleeding into magenta,
// terracotta and gold, a setting sun mirrored on the sea, drifting clouds,
// a flock of birds, twinkling stars, and rising embers.
// Pure Canvas 2D for reliability and performance.

export function startTitleScene(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, horizon = 0, dpr = 1, raf = 0, running = true;
  let t = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  // --- procedural content (normalized 0..1 coords so resize is free) -------
  const stars = Array.from({ length: 90 }, () => ({
    x: Math.random(), y: Math.random() * 0.5,
    r: rand(0.4, 1.4), tw: rand(0, Math.PI * 2), sp: rand(0.8, 2.2),
  }));

  const clouds = Array.from({ length: 7 }, () => ({
    x: Math.random(), y: rand(0.12, 0.42), s: rand(0.5, 1.3),
    sp: rand(0.004, 0.012) * (Math.random() < 0.5 ? 1 : -1), a: rand(0.12, 0.32),
  }));

  const birds = Array.from({ length: 6 }, () => ({
    x: Math.random(), y: rand(0.2, 0.4), s: rand(0.7, 1.3),
    sp: rand(0.02, 0.045), ph: rand(0, 6),
  }));

  const embers = Array.from({ length: 40 }, () => ({
    x: Math.random(), y: rand(0.6, 1), r: rand(0.6, 2),
    sp: rand(0.01, 0.035), drift: rand(-0.3, 0.3), a: rand(0.2, 0.7), tw: rand(0, 6),
  }));

  // Layered mountain ridges (Andes). Each is a jagged silhouette.
  function makeRidge(peakCount, baseline, amp) {
    const pts = [{ x: -0.02, y: baseline + 0.05 }];
    for (let i = 0; i <= peakCount; i++) {
      const x = i / peakCount;
      const peak = baseline - Math.abs(Math.sin(x * Math.PI * rand(1.4, 2.2) + rand(0, 3))) * amp - rand(0, amp * 0.4);
      pts.push({ x: x + rand(-0.03, 0.03), y: peak });
    }
    pts.push({ x: 1.02, y: baseline + 0.05 });
    return pts;
  }
  // built after we know horizon; baselines are fractions of full height
  const ridgeFar = makeRidge(7, 0.58, 0.22);
  const ridgeMid = makeRidge(9, 0.6, 0.3);
  const ridgeNear = makeRidge(6, 0.625, 0.18);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    horizon = h * 0.6;
  }

  // --- drawing helpers -----------------------------------------------------
  function skyGradient() {
    const g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0.0, '#160f30');   // deep indigo dusk
    g.addColorStop(0.4, '#43215a');   // violet
    g.addColorStop(0.66, '#9c3a5e');  // magenta-rose
    g.addColorStop(0.85, '#d96b3c');  // terracotta
    g.addColorStop(1.0, '#f4a64e');   // gold at the horizon
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, horizon + 1);
  }

  function seaGradient() {
    const g = ctx.createLinearGradient(0, horizon, 0, h);
    g.addColorStop(0.0, '#e89a4c');   // gold reflection band
    g.addColorStop(0.12, '#b75a55');  // rose
    g.addColorStop(0.4, '#5e4068');   // purple
    g.addColorStop(0.7, '#274a5c');   // teal Pacific
    g.addColorStop(1.0, '#141430');   // deep night water
    ctx.fillStyle = g;
    ctx.fillRect(0, horizon, w, h - horizon);
  }

  function drawSun(sx, sy) {
    // outer halo
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.42);
    halo.addColorStop(0, 'rgba(255,196,110,0.55)');
    halo.addColorStop(0.25, 'rgba(255,150,80,0.22)');
    halo.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
    // disc (clipped to sky so it sets into the sea)
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, horizon); ctx.clip();
    const disc = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.085);
    disc.addColorStop(0, '#fff6da');
    disc.addColorStop(0.6, '#ffd17a');
    disc.addColorStop(1, '#ff9e4d');
    ctx.fillStyle = disc;
    ctx.beginPath(); ctx.arc(sx, sy, h * 0.085, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawSunReflection(sx) {
    // shimmering golden sun-glitter on the water beneath the sun
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const colW = w * 0.13;
    for (let y = horizon; y < h; y += 3) {
      const d = (y - horizon) / (h - horizon);
      // gentle organic wander of the glitter path
      const wob = Math.sin(y * 0.025 + t * 1.6) * (4 + d * 16);
      const ww = colW * (0.3 + d) * (0.75 + Math.sin(y * 0.12 + t * 1.7) * 0.25);
      // broken into sparkles rather than a solid band
      const sparkle = 0.5 + Math.sin(y * 0.5 + t * 5 + Math.sin(y)) * 0.5;
      const a = (1 - d) * 0.28 * sparkle;
      if (a <= 0.01) continue;
      const cx = sx + wob + Math.sin(y * 1.3 + t * 3) * ww * 0.15;
      const grad = ctx.createLinearGradient(cx - ww / 2, 0, cx + ww / 2, 0);
      grad.addColorStop(0, 'rgba(255,200,110,0)');
      grad.addColorStop(0.5, `rgba(255,212,140,${a})`);
      grad.addColorStop(1, 'rgba(255,200,110,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - ww / 2, y, ww, 2);
    }
    ctx.restore();
  }

  function drawSeaShimmer() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 22; i++) {
      const d = i / 22;
      const y = horizon + d * d * (h - horizon);
      const off = Math.sin(t * (0.6 + d) + i) * w * 0.04;
      const a = (1 - d) * 0.10;
      ctx.fillStyle = `rgba(255,210,150,${a})`;
      ctx.fillRect(-w * 0.1 + off, y, w * 1.2, 1.4 + d * 2);
    }
    ctx.restore();
  }

  function drawRidge(pts, color, parallax) {
    const off = Math.sin(t * 0.05) * parallax * w;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(pts[0].x * w + off, pts[0].y * h);
    for (const p of pts) ctx.lineTo(p.x * w + off, p.y * h);
    ctx.lineTo(w + Math.abs(off) + 10, h * 0.66);
    ctx.lineTo(-Math.abs(off) - 10, h * 0.66);
    ctx.closePath();
    ctx.fill();
  }

  function drawCloud(c) {
    const x = c.x * w, y = c.y * h, s = c.s;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 120 * s);
    g.addColorStop(0, `rgba(255,170,120,${c.a})`);
    g.addColorStop(0.5, `rgba(220,120,110,${c.a * 0.5})`);
    g.addColorStop(1, 'rgba(180,90,110,0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(x, y); ctx.scale(1, 0.45);
    ctx.beginPath(); ctx.arc(0, 0, 120 * s, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawBird(b) {
    const x = b.x * w, y = b.y * h, s = 7 * b.s;
    const flap = Math.sin(t * 6 + b.ph) * 0.5 + 0.4;
    ctx.strokeStyle = 'rgba(30,18,30,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * flap, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * flap, x + s, y);
    ctx.stroke();
  }

  // --- loop ----------------------------------------------------------------
  function frame() {
    if (!running) return;
    t += 0.016;
    const sx = w * 0.5;
    const sy = horizon + Math.sin(t * 0.25) * 4; // sun gently bobbing on the horizon

    skyGradient();

    // stars (twinkle), fading toward the bright horizon
    for (const s of stars) {
      const a = (0.35 + Math.sin(t * s.sp + s.tw) * 0.35) * (1 - s.y / 0.55);
      if (a <= 0) continue;
      ctx.fillStyle = `rgba(255,245,220,${a})`;
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
    }

    drawSun(sx, sy);

    // clouds drift
    for (const c of clouds) {
      c.x += c.sp * 0.016 * 4;
      if (c.x > 1.2) c.x = -0.2; if (c.x < -0.2) c.x = 1.2;
      drawCloud(c);
    }

    // mountains, back to front, atmospheric layering
    drawRidge(ridgeFar, '#5a3d63', 0.012);
    drawRidge(ridgeMid, '#3c2647', 0.02);
    drawRidge(ridgeNear, '#241531', 0.0);

    seaGradient();
    drawSunReflection(sx);
    drawSeaShimmer();

    // birds cross the sky
    for (const b of birds) {
      b.x += b.sp * 0.016;
      if (b.x > 1.15) { b.x = -0.15; b.y = rand(0.2, 0.4); }
      drawBird(b);
    }

    // embers rise from the sea/foreground
    for (const e of embers) {
      e.y -= e.sp * 0.016 * 4;
      e.x += Math.sin(t + e.tw) * 0.0006 + e.drift * 0.0004;
      if (e.y < 0.45) { e.y = rand(0.9, 1.05); e.x = Math.random(); }
      const a = e.a * (0.5 + Math.sin(t * 2 + e.tw) * 0.5);
      ctx.fillStyle = `rgba(255,190,110,${a})`;
      ctx.beginPath(); ctx.arc(e.x * w, e.y * h, e.r, 0, Math.PI * 2); ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  resize();
  frame();

  return function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
  };
}
