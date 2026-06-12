// The Mathias avatar — one humanized figure, several renderings.
// U1 "The Silence": grey, head bowed, rigid, weight pulled inward.
// U2 "The Break":   half-rendered wireframe, flickering, unfinished.
// U3 "The Return":  the boy himself — curly dark hair, open red-and-black
//                   plaid flannel over a dark tee, blue jeans, black sneakers.
// "elder":          the grandmother — woven lliclla shawl, long skirt, grey bun.
//
// Style DNA: handcrafted Andean magical realism — faceted, matte, flat-shaded,
// like a carved retablo figure that has learned to breathe.
//
// The avatar exposes userData.setAction(name) for film direction:
//   idle | still | walk | dance | write | freeze | fear
//   exhausted | clear | kneel | pray | prayOpen   (the prayer arc)
import * as THREE from 'three';

const lerpN = (a, b, k) => a + (b - a) * k;
const easeN = k => k * k * (3 - 2 * k);

const SKIN = 0xc59a6f;
const SKIN_SHADOW = 0x96704c;
const HAIR = 0x16100a;

// Andean textile pattern (terracotta / gold / deep-red bands with diamonds & zigzags)
function textileTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  const bands = ['#a3402f', '#c96f4a', '#c9a227', '#3a7a5a', '#5a2a2a', '#c96f4a', '#a3402f'];
  const bh = 256 / bands.length;
  bands.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * bh, 256, bh + 1); });
  x.fillStyle = '#f0e6d2';
  for (let i = 0; i < 12; i++) {
    const cx = 10 + i * 22, cy = 2.5 * bh;
    x.beginPath();
    x.moveTo(cx, cy - 9); x.lineTo(cx + 9, cy); x.lineTo(cx, cy + 9); x.lineTo(cx - 9, cy);
    x.closePath(); x.fill();
  }
  x.strokeStyle = '#e8c87a'; x.lineWidth = 3; x.beginPath();
  for (let i = 0; i <= 256; i += 16) {
    const y = 0.5 * bh + (i / 16 % 2 === 0 ? -6 : 6);
    i === 0 ? x.moveTo(i, y) : x.lineTo(i, y);
  }
  x.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Buffalo-check plaid (red / black) for the flannel shirt.
function plaidTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#b22a1d';
  x.fillRect(0, 0, 256, 256);
  const cell = 32;
  x.fillStyle = 'rgba(22,16,12,0.55)';
  for (let i = 0; i < 256; i += cell * 2) x.fillRect(i, 0, cell, 256); // vertical bands
  for (let j = 0; j < 256; j += cell * 2) x.fillRect(0, j, 256, cell); // horizontal bands
  // faint weave lines
  x.strokeStyle = 'rgba(0,0,0,0.12)';
  x.lineWidth = 1;
  for (let i = 0; i < 256; i += 8) {
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

// A capsule-ish limb segment built so it pivots from its TOP end.
function segment(mat, { topR, botR, len }) {
  const pivot = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(topR, botR, len, 10), mat);
  mesh.position.y = -len / 2;
  mesh.castShadow = true;
  pivot.add(mesh);
  pivot.userData.mesh = mesh;
  return pivot;
}

// ---------------------------------------------------------------------------
// THE ELDER — the grandmother. Woven shawl, long skirt, silver bun.
// ---------------------------------------------------------------------------
function createElder() {
  const group = new THREE.Group();
  const flat = { flatShading: true };
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xb5805a, roughness: 0.62, ...flat });
  const skinShadowMat = new THREE.MeshStandardMaterial({ color: 0x8a5e40, roughness: 0.7, ...flat });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x9a958c, roughness: 0.9, ...flat });
  const skirtMat = new THREE.MeshStandardMaterial({ color: 0x5a2a30, roughness: 0.9, ...flat });
  const shawlMat = new THREE.MeshStandardMaterial({ map: textileTexture(), roughness: 0.82, ...flat });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x16100b, roughness: 0.4 });

  const hips = new THREE.Group();
  hips.position.y = 0.92;
  group.add(hips);

  // long skirt (pollera)
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 12, 1), skirtMat);
  skirt.position.y = -0.45;
  skirt.castShadow = true;
  hips.add(skirt);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.5, 10), skirtMat);
  torso.position.y = 0.32;
  torso.castShadow = true;
  hips.add(torso);

  // lliclla — the woven shawl over the shoulders
  const shawl = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.5, 10, 1, true), shawlMat);
  shawl.position.y = 0.42;
  shawl.castShadow = true;
  hips.add(shawl);

  const shoulders = new THREE.Group();
  shoulders.position.y = 0.56;
  hips.add(shoulders);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.1, 8), skinMat);
  neck.position.y = 0.08;
  shoulders.add(neck);

  const headPivot = new THREE.Group();
  headPivot.position.y = 0.14;
  shoulders.add(headPivot);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 16), skinMat);
  head.scale.set(0.92, 1.06, 0.95);
  head.position.y = 0.1;
  head.castShadow = true;
  headPivot.add(head);

  // silver hair + bun
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.137, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.9), hairMat);
  hair.scale.set(0.95, 1.05, 1);
  hair.position.y = 0.11;
  headPivot.add(hair);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), hairMat);
  bun.position.set(0, 0.16, -0.12);
  headPivot.add(bun);

  const eyeGeo = new THREE.SphereGeometry(0.016, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.042, 0.1, 0.112);
  eyeR.position.set(0.042, 0.1, 0.112);
  headPivot.add(eyeL, eyeR);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.045, 6), skinShadowMat);
  nose.rotation.x = Math.PI / 2.1;
  nose.position.set(0, 0.075, 0.125);
  headPivot.add(nose);

  // arms — sleeves of the skirt fabric, hands of skin
  function makeArm(side) {
    const upper = segment(skirtMat, { topR: 0.05, botR: 0.045, len: 0.3 });
    const fore = segment(skinMat, { topR: 0.042, botR: 0.038, len: 0.27 });
    fore.position.y = -0.3;
    upper.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), skinShadowMat);
    hand.scale.set(1, 1.2, 0.7);
    hand.position.y = -0.27;
    fore.add(hand);
    upper.position.set(side * 0.21, 0.04, 0);
    upper.rotation.z = side * 0.1;
    shoulders.add(upper);
    return { upper, fore };
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);
  armL.upper.rotation.x = 0.2; armR.upper.rotation.x = 0.2;

  const state = { t: Math.random() * 10, blink: 0 };
  group.userData.setAction = () => {};
  group.userData.joints = { hips, shoulders, headPivot, torso, armL, armR };
  group.userData.update = (dt) => {
    state.t += dt;
    const t = state.t;
    const breath = Math.sin(t * 1.3) * 0.015;
    torso.scale.set(1 + breath, 1 + breath * 0.4, 1 + breath);
    const sway = Math.sin(t * 0.7);
    hips.rotation.z = sway * 0.03;
    headPivot.rotation.y = Math.sin(t * 0.4) * 0.14;
    headPivot.rotation.x = 0.06 + Math.sin(t * 0.6) * 0.03;
    armL.upper.rotation.x = 0.2 + Math.sin(t * 1.1) * 0.06;
    armR.upper.rotation.x = 0.2 - Math.sin(t * 1.1) * 0.06;
    state.blink -= dt;
    if (state.blink < 0) state.blink = 3 + Math.random() * 3;
    const blinking = state.blink < 0.12;
    eyeL.scale.y = eyeR.scale.y = blinking ? 0.15 : 1;
  };
  return group;
}

// ---------------------------------------------------------------------------
// THE BOY — curly hair, open plaid flannel, dark tee, jeans, black sneakers.
// Rendered in full color ('return'), grey ('silence') or wireframe ('break').
// ---------------------------------------------------------------------------
export function createAvatar(mode = 'return', variant = 'boy') {
  if (mode === 'elder') return createElder();

  const group = new THREE.Group();

  // --- materials per mode -------------------------------------------------
  let skinMat, skinShadowMat, hairMat, teeMat, flannelMat, jeansMat, shoeMat, soleMat, eyeMat;
  const flat = { flatShading: true };
  if (mode === 'silence') {
    skinMat = new THREE.MeshStandardMaterial({ color: 0x8f9094, roughness: 1, ...flat });
    skinShadowMat = new THREE.MeshStandardMaterial({ color: 0x76777b, roughness: 1, ...flat });
    hairMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 1, ...flat });
    teeMat = new THREE.MeshStandardMaterial({ color: 0x46484c, roughness: 1, ...flat });
    flannelMat = new THREE.MeshStandardMaterial({ color: 0x55585e, roughness: 1, side: THREE.DoubleSide, ...flat });
    jeansMat = new THREE.MeshStandardMaterial({ color: 0x3c3f45, roughness: 1, ...flat });
    shoeMat = new THREE.MeshStandardMaterial({ color: 0x2c2e32, roughness: 1, ...flat });
    soleMat = new THREE.MeshStandardMaterial({ color: 0x6a6c70, roughness: 1, ...flat });
    eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 1 });
  } else if (mode === 'break') {
    const wire = { wireframe: true, transparent: true, opacity: 0.7 };
    skinMat = new THREE.MeshBasicMaterial({ color: 0x99ddff, ...wire });
    skinShadowMat = skinMat;
    hairMat = new THREE.MeshBasicMaterial({ color: 0x4488cc, ...wire });
    teeMat = new THREE.MeshBasicMaterial({ color: 0x66ccff, ...wire });
    flannelMat = new THREE.MeshBasicMaterial({ color: 0x55aadd, side: THREE.DoubleSide, ...wire });
    jeansMat = new THREE.MeshBasicMaterial({ color: 0x3388cc, ...wire });
    shoeMat = new THREE.MeshBasicMaterial({ color: 0x2266aa, ...wire });
    soleMat = shoeMat;
    eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  } else {
    skinMat = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.62, ...flat });
    skinShadowMat = new THREE.MeshStandardMaterial({ color: SKIN_SHADOW, roughness: 0.7, ...flat });
    hairMat = new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.88, ...flat });
    teeMat = new THREE.MeshStandardMaterial({ color: 0x2b2723, roughness: 0.92, ...flat });
    flannelMat = new THREE.MeshStandardMaterial({ map: plaidTexture(), roughness: 0.85, side: THREE.DoubleSide, ...flat });
    jeansMat = new THREE.MeshStandardMaterial({ color: 0x3d5a7e, roughness: 0.9, ...flat });
    shoeMat = new THREE.MeshStandardMaterial({ color: 0x191a1e, roughness: 0.8, ...flat });
    soleMat = new THREE.MeshStandardMaterial({ color: 0xeeebe0, roughness: 0.85, ...flat });
    eyeMat = new THREE.MeshStandardMaterial({ color: 0x16100b, roughness: 0.4 });
  }

  // --- spine: a single pivot at the hips that the upper body hangs from ----
  const hips = new THREE.Group();
  hips.position.y = 0.92;
  group.add(hips);

  // pelvis (jeans)
  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.2, 10), jeansMat);
  pelvis.castShadow = true;
  hips.add(pelvis);

  // torso — the dark tee (tapered toward shoulders)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.175, 0.52, 10), teeMat);
  torso.position.y = 0.33;
  torso.castShadow = true;
  hips.add(torso);

  // the open flannel — a cylinder with a front gap so the tee shows through
  const FRONT_GAP = 1.0; // radians of opening, centered on +Z
  const flannel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.235, 0.25, 0.62, 14, 1, true, FRONT_GAP / 2, Math.PI * 2 - FRONT_GAP),
    flannelMat
  );
  flannel.position.y = 0.3;
  flannel.castShadow = true;
  hips.add(flannel);

  // collar — two folded tabs at the neckline
  const collarGeo = new THREE.BoxGeometry(0.07, 0.035, 0.015);
  const collarL = new THREE.Mesh(collarGeo, flannelMat);
  const collarR = new THREE.Mesh(collarGeo, flannelMat);
  collarL.position.set(-0.07, 0.63, 0.13); collarL.rotation.set(0.3, 0.45, 0.12);
  collarR.position.set(0.07, 0.63, 0.13); collarR.rotation.set(0.3, -0.45, -0.12);
  hips.add(collarL, collarR);

  // chest pockets on the front panels
  const pocketGeo = new THREE.BoxGeometry(0.075, 0.075, 0.015);
  [-1, 1].forEach(s => {
    const pocket = new THREE.Mesh(pocketGeo, flannelMat);
    pocket.position.set(s * 0.135, 0.44, 0.185);
    pocket.rotation.y = s * 0.55;
    hips.add(pocket);
  });

  // shoulders
  const shoulders = new THREE.Group();
  shoulders.position.y = 0.56;
  hips.add(shoulders);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.22, 0.12, 10), flannelMat);
  shoulders.add(collar);

  // neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), skinMat);
  neck.position.y = 0.1;
  shoulders.add(neck);

  // head (slightly egg-shaped) on its own pivot so it can nod / turn
  const headPivot = new THREE.Group();
  headPivot.position.y = 0.16;
  shoulders.add(headPivot);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 18, 16), skinMat);
  head.scale.set(0.92, 1.08, 0.95);
  head.position.y = 0.1;
  head.castShadow = true;
  headPivot.add(head);

  // face: two eyes, brows, and a faint nose ridge on +Z
  const eyeGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  const EYE_X = 0.045;
  eyeL.position.set(-EYE_X, 0.105, 0.115);
  eyeR.position.set(EYE_X, 0.105, 0.115);
  headPivot.add(eyeL, eyeR);
  const browGeo = new THREE.BoxGeometry(0.05, 0.009, 0.012);
  const browL = new THREE.Mesh(browGeo, hairMat);
  const browR = new THREE.Mesh(browGeo, hairMat);
  browL.position.set(-EYE_X, 0.148, 0.116); browL.rotation.z = -0.12;
  browR.position.set(EYE_X, 0.148, 0.116); browR.rotation.z = 0.12;
  headPivot.add(browL, browR);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 6), skinShadowMat);
  nose.rotation.x = Math.PI / 2.1;
  nose.position.set(0, 0.08, 0.13);
  headPivot.add(nose);

  // HAIR & HEADWEAR — each man of the family carries his own silhouette
  if (variant === 'father') {
    // military buzz cut: a tight cropped cap, and a heavy mustache
    const crop = new THREE.Mesh(
      new THREE.SphereGeometry(0.139, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), hairMat);
    crop.scale.set(0.94, 0.72, 0.97);
    crop.position.y = 0.135;
    headPivot.add(crop);
    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.02, 0.02), hairMat);
    mustache.position.set(0, 0.045, 0.125);
    headPivot.add(mustache);
    // service belt with a square buckle
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.178, 0.178, 0.045, 12),
      new THREE.MeshStandardMaterial({ color: 0x241c14, roughness: 0.6, flatShading: true }));
    belt.position.y = 0.09;
    hips.add(belt);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x8a8068, metalness: 0.6, roughness: 0.4 }));
    buckle.position.set(0, 0.09, 0.175);
    hips.add(buckle);
  } else if (variant === 'grandfather') {
    // balding crown with a side fringe, a full beard, and a wide-brim felt hat
    const fringe = new THREE.Mesh(
      new THREE.SphereGeometry(0.138, 14, 10, 0, Math.PI * 2, Math.PI / 3.2, Math.PI / 4.5), hairMat);
    fringe.scale.set(0.96, 1, 0.98);
    fringe.position.y = 0.105;
    headPivot.add(fringe);
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.04), hairMat);
    beard.position.set(0, 0.005, 0.1);
    headPivot.add(beard);
    const hatMat = new THREE.MeshStandardMaterial({
      color: mode === 'silence' ? 0x35373c : 0x4a3526, roughness: 0.85, flatShading: true });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.215, 0.018, 14), hatMat);
    brim.position.y = 0.205;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.125, 0.1, 12), hatMat);
    crown.position.y = 0.26;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.127, 0.13, 0.025, 12),
      new THREE.MeshStandardMaterial({ color: 0x1c1813, roughness: 0.8 }));
    band.position.y = 0.225;
    headPivot.add(brim, crown, band);
  }

  // CURLY HAIR — a cap of clustered curls over the top and back of the head
  const curls = new THREE.Group();
  const CURL_N = variant === 'boy' ? 60 : 0;
  for (let i = 0; i < CURL_N; i++) {
    // golden-angle distribution over the sphere
    const y = 1 - (i + 0.5) / CURL_N * 1.55;       // 1 .. -0.55
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * 2.39996;
    const px = Math.cos(a) * r, pz = Math.sin(a) * r;
    // keep curls on top, sides and back; leave the face clear
    if (y < 0.3 && pz > 0.25) continue;
    if (y < -0.2) continue;
    const curl = new THREE.Mesh(
      new THREE.SphereGeometry(0.028 + Math.random() * 0.016, 7, 6), hairMat);
    curl.position.set(px * 0.125 * 0.92, 0.1 + y * 0.135 * 1.08 + 0.012, pz * 0.128 * 0.95);
    curl.castShadow = true;
    curls.add(curl);
  }
  // fringe — a few curls dropping onto the forehead
  (variant === 'boy' ? [[-0.07, 0.2, 0.1], [0.0, 0.215, 0.105], [0.07, 0.2, 0.1], [-0.115, 0.13, 0.06], [0.115, 0.13, 0.06]] : []).forEach(p => {
    const curl = new THREE.Mesh(new THREE.SphereGeometry(0.03 + Math.random() * 0.01, 7, 6), hairMat);
    curl.position.set(p[0], p[1], p[2]);
    curls.add(curl);
  });
  headPivot.add(curls);

  // --- arms: plaid sleeve rolled at the elbow, bare forearm ----------------
  function makeArm(side) {
    const upper = segment(flannelMat, { topR: 0.062, botR: 0.056, len: 0.3 });
    // rolled cuff at the elbow
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.058, 0.05, 10), flannelMat);
    cuff.position.y = -0.3;
    upper.add(cuff);
    const fore = segment(skinMat, { topR: 0.046, botR: 0.04, len: 0.28 });
    fore.position.y = -0.31;
    upper.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), skinShadowMat);
    hand.scale.set(1, 1.2, 0.7);
    hand.position.y = -0.28;
    fore.add(hand);
    upper.position.set(side * 0.24, 0.04, 0);
    upper.rotation.z = side * 0.08;
    shoulders.add(upper);
    return { upper, fore, hand };
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  // pencil — held against the right hand, shown while writing
  const pencil = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.15, 6),
    new THREE.MeshStandardMaterial({ color: mode === 'return' ? 0xd9a440 : 0x888888, roughness: 0.7, flatShading: true }));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.03, 6),
    new THREE.MeshStandardMaterial({ color: 0x2a2118, roughness: 0.8, flatShading: true }));
  tip.position.y = -0.09;
  tip.rotation.x = Math.PI;
  pencil.add(shaft, tip);
  pencil.position.set(0, -0.31, 0.04);
  pencil.rotation.x = 0.5;
  pencil.visible = false;
  armR.fore.add(pencil);

  // --- legs: jeans with black low-top sneakers ----------------------------
  function makeLeg(side) {
    const thigh = segment(jeansMat, { topR: 0.085, botR: 0.07, len: 0.46 });
    const shin = segment(jeansMat, { topR: 0.066, botR: 0.054, len: 0.44 });
    shin.position.y = -0.46;
    thigh.add(shin);
    // sneaker: white sole, black upper, white toe cap
    const sneaker = new THREE.Group();
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.03, 0.24), soleMat);
    const upperShoe = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.06, 0.215), shoeMat);
    upperShoe.position.y = 0.045;
    const toe = new THREE.Mesh(new THREE.BoxGeometry(0.107, 0.02, 0.06), soleMat);
    toe.position.set(0, 0.025, 0.085);
    sneaker.add(sole, upperShoe, toe);
    sneaker.position.set(0, -0.45, 0.05);
    sneaker.children.forEach(m => { m.castShadow = true; });
    shin.add(sneaker);
    thigh.position.set(side * 0.1, -0.08, 0);
    hips.add(thigh);
    return { thigh, shin };
  }
  const legL = makeLeg(-1);
  const legR = makeLeg(1);

  // rest pose: arms hang slightly forward
  armL.upper.rotation.x = 0.12; armR.upper.rotation.x = 0.12;

  // ------------------------------------------------------------------------
  // Animation & acting
  // ------------------------------------------------------------------------
  const allMats = [skinMat, skinShadowMat, hairMat, teeMat, flannelMat, jeansMat, shoeMat, eyeMat];
  const t0 = Math.random() * 10;
  const state = { t: t0, blink: 0, action: 'idle', at: 0 };

  group.userData.setAction = (a) => {
    if (state.action !== a) { state.action = a; state.at = 0; }
  };
  group.userData.joints = { hips, shoulders, headPivot, torso, neck, armL, armR, legL, legR, eyeL, eyeR, pencil };

  // base seated-at-the-desk pose shared by write / freeze / fear
  function seatedPose() {
    hips.position.y = 0.56;
    hips.rotation.set(0, 0, 0);
    legL.thigh.rotation.set(-1.42, 0, -0.12);
    legR.thigh.rotation.set(-1.36, 0, 0.12);
    legL.shin.rotation.set(1.32, 0, 0);
    legR.shin.rotation.set(1.28, 0, 0);
    shoulders.rotation.set(0.26, 0, 0);
    // arms reach forward onto the desk (negative x swings the limb toward +Z)
    armL.upper.rotation.set(-1.45, 0.12, 0.2);
    armL.fore.rotation.set(0.3, 0, 0);
    armR.upper.rotation.set(-1.55, -0.08, -0.18);
    armR.fore.rotation.set(0.35, 0, 0);
    headPivot.rotation.set(0.48, 0, 0);
    torso.scale.set(1, 1, 1);
    group.rotation.z = 0;
  }
  // kneeling on the wooden floor — thighs near vertical, feet folded back
  function kneelPose() {
    hips.position.y = 0.5;
    hips.rotation.set(0, 0, 0);
    legL.thigh.rotation.set(-0.25, 0, -0.1);
    legR.thigh.rotation.set(-0.2, 0, 0.1);
    legL.shin.rotation.set(1.5, 0, 0);
    legR.shin.rotation.set(1.5, 0, 0);
    shoulders.rotation.set(0.1, 0, 0);
    armL.upper.rotation.set(-0.2, 0, 0.15);
    armR.upper.rotation.set(-0.2, 0, -0.15);
    armL.fore.rotation.set(0.25, 0, 0);
    armR.fore.rotation.set(0.25, 0, 0);
    armL.hand.scale.set(1, 1.2, 0.7);
    armR.hand.scale.set(1, 1.2, 0.7);
    headPivot.rotation.set(0.25, 0, 0);
    torso.scale.set(1, 1, 1);
    group.rotation.z = 0;
  }
  function standingReset() {
    hips.position.y = 0.92;
    hips.rotation.set(0, 0, 0);
    legL.thigh.rotation.set(0, 0, 0);
    legR.thigh.rotation.set(0, 0, 0);
    legL.shin.rotation.set(0, 0, 0);
    legR.shin.rotation.set(0, 0, 0);
    shoulders.rotation.set(0, 0, 0);
  }
  function resetEyes() {
    eyeL.position.x = -EYE_X; eyeR.position.x = EYE_X;
    neck.scale.set(1, 1, 1);
  }

  group.userData.update = (dt) => {
    state.t += dt;
    state.at += dt;
    const t = state.t, at = state.at;

    if (mode === 'silence') {
      // closed in: head bowed, shoulders rounded, barely any motion
      headPivot.rotation.x = 0.42 + Math.sin(t * 0.6) * 0.01;
      shoulders.rotation.x = 0.14;
      hips.position.y = 0.9 + Math.sin(t * 1.1) * 0.004; // shallow breath
      armL.upper.rotation.x = 0.35; armR.upper.rotation.x = 0.35; // arms pulled in
      const twitch = (Math.floor(t * 1.5) % 7 === 0) ? Math.sin(t * 40) * 0.01 : 0;
      group.rotation.z = twitch;
      return;
    }
    if (mode === 'break') {
      // unfinished: flicker visibility, jitter, opacity noise
      group.visible = Math.random() > 0.12;
      group.position.x += (Math.random() - 0.5) * 0.012;
      group.position.x *= 0.92;
      headPivot.rotation.y = (Math.random() - 0.5) * 0.3;
      allMats.forEach(m => { if (m.opacity !== undefined) m.opacity = 0.35 + Math.random() * 0.5; });
      return;
    }

    // -- the living boy: directed actions ----------------------------------
    const a = state.action;
    pencil.visible = (a === 'write' || a === 'freeze' || a === 'fear');

    if (a === 'write') {
      seatedPose();
      resetEyes();
      // breath + the small life of concentration
      const breath = Math.sin(t * 1.4) * 0.012;
      torso.scale.set(1 + breath, 1 + breath * 0.4, 1 + breath);
      headPivot.rotation.x = 0.48 + Math.sin(t * 1.2) * 0.02;
      headPivot.rotation.z = Math.sin(t * 0.5) * 0.02;
      // the writing hand: quick scratch strokes + a slow drift across the page
      armR.upper.rotation.y = -0.08 + Math.sin(t * 0.6) * 0.08;
      armR.fore.rotation.z = Math.sin(t * 16) * 0.05;
      armR.fore.rotation.x = 0.35 + Math.sin(t * 8) * 0.025;

    } else if (a === 'freeze') {
      seatedPose();
      resetEyes();
      // the pencil stops INSTANTLY: no motion terms at all
      shoulders.rotation.x = 0.33;               // shoulders stiffen
      armR.hand.scale.set(0.92, 1.1, 0.64);      // fingers tighten
      if (at > 1.1) {
        // after the held breath: shallow, fast breathing
        const sh = Math.sin(t * 3.4) * 0.007;
        torso.scale.set(1 + sh, 1 + sh * 0.5, 1 + sh);
      }

    } else if (a === 'fear') {
      seatedPose();
      shoulders.rotation.x = 0.33;
      armR.hand.scale.set(0.92, 1.1, 0.64);
      // eyes slide toward the door, then the head dares to follow — slowly
      const e = Math.min(1, at / 1.8);
      const ee = e * e * (3 - 2 * e);
      eyeL.position.x = -EYE_X + ee * 0.02;
      eyeR.position.x = EYE_X + ee * 0.02;
      headPivot.rotation.y = ee * 0.42;
      headPivot.rotation.x = 0.48 - ee * 0.3;    // eyes lift from the page
      // shallow quick breathing
      const sh = Math.sin(t * 3.2) * 0.009;
      torso.scale.set(1 + sh, 1 + sh * 0.5, 1 + sh);
      // a swallow
      const sw = at % 3.4;
      neck.scale.y = sw > 2.2 && sw < 2.5 ? 1 + Math.sin((sw - 2.2) / 0.3 * Math.PI) * 0.18 : 1;

    } else if (a === 'exhausted') {
      // Beat 1-2: staring down at the lesson plans, processing, a long exhale
      seatedPose();
      resetEyes();
      headPivot.rotation.x = 0.58 + Math.sin(t * 0.7) * 0.012;
      shoulders.rotation.x = 0.32;                            // slumped
      let breath = Math.sin(t * 0.8) * 0.014;
      const cyc = t % 7;
      if (cyc > 5) breath -= Math.sin((cyc - 5) / 2 * Math.PI) * 0.025; // the exhale
      torso.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);

    } else if (a === 'clear') {
      // Beat 3: pushing the papers aside — not carelessly. gently.
      seatedPose();
      resetEyes();
      headPivot.rotation.x = 0.5;
      const s = at < 0.7 ? 0 : easeN(Math.min(1, (at - 0.7) / 2.6));
      armR.upper.rotation.x = -1.45;
      armR.upper.rotation.y = lerpN(-0.08, -0.9, s);          // the slow sweep
      armR.fore.rotation.x = 0.3;
      shoulders.rotation.y = -0.12 * s;
      const breath = Math.sin(t * 1.0) * 0.012;
      torso.scale.set(1 + breath, 1 + breath * 0.4, 1 + breath);

    } else if (a === 'kneel') {
      // Beat 4: sliding off the chair; the knees touch the wooden floor
      kneelPose();
      resetEyes();
      const d = easeN(Math.min(1, at / 1.4));                 // the descent
      hips.position.y = lerpN(0.78, 0.5, d);
      legL.thigh.rotation.x = lerpN(-1.1, -0.25, d);
      legR.thigh.rotation.x = lerpN(-1.05, -0.2, d);
      legL.shin.rotation.x = lerpN(0.7, 1.5, d);
      legR.shin.rotation.x = lerpN(0.7, 1.5, d);
      headPivot.rotation.x = 0.3;
      const breath = Math.sin(t * 1.1) * 0.012;
      torso.scale.set(1 + breath, 1 + breath * 0.4, 1 + breath);

    } else if (a === 'pray') {
      // Beats 5-8: hesitation — fingers interlock — head lowers — eyes close.
      // Later (at > 8) the clasped hands tighten in slow waves.
      kneelPose();
      const c = at < 0.7 ? 0 : easeN(Math.min(1, (at - 0.7) / 2.0));
      armL.upper.rotation.set(lerpN(-0.2, -1.2, c), 0, lerpN(0.15, 0.5, c));
      armR.upper.rotation.set(lerpN(-0.2, -1.25, c), 0, lerpN(-0.15, -0.5, c));
      armL.fore.rotation.x = lerpN(0.25, 0.9, c);
      armR.fore.rotation.x = lerpN(0.25, 0.95, c);
      const h = at < 4.5 ? 0 : easeN(Math.min(1, (at - 4.5) / 2.0));
      headPivot.rotation.x = lerpN(0.25, 0.6, h);
      if (at > 8) {
        const sq = 0.5 + 0.5 * Math.sin((at - 8) * 0.7);
        armL.hand.scale.set(1 - 0.1 * sq, 1.2, 0.7 - 0.05 * sq);
        armR.hand.scale.set(1 - 0.1 * sq, 1.2, 0.7 - 0.05 * sq);
      }
      const breath = Math.sin(t * 0.9) * 0.016;
      torso.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);

    } else if (a === 'prayOpen') {
      // the prayer ends: eyes open, the room is unchanged, doubt — then faith
      kneelPose();
      armL.upper.rotation.set(-1.2, 0, 0.5);
      armR.upper.rotation.set(-1.25, 0, -0.5);
      armL.fore.rotation.x = 0.9;
      armR.fore.rotation.x = 0.95;
      let hx = 0.6, hy = 0;
      if (at < 1.5) hx = lerpN(0.6, 0.34, easeN(at / 1.5));                  // head lifts
      else if (at < 4.5) { hx = 0.34; hy = Math.sin((at - 1.5) * 1.1) * 0.16 * (1 - (at - 1.5) / 3.2); } // searches the room
      else if (at < 6.2) hx = lerpN(0.34, 0.46, easeN((at - 4.5) / 1.7));    // disappointment
      else hx = lerpN(0.46, 0.3, easeN(Math.min(1, (at - 6.2) / 2.2)));      // quiet acceptance
      headPivot.rotation.x = hx;
      headPivot.rotation.y = hy;
      let breath = Math.sin(t * 0.9) * 0.014;
      if (at > 6.2 && at < 8.2) breath += Math.sin((at - 6.2) / 2 * Math.PI) * 0.02; // one deep breath
      torso.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);

    } else if (a === 'resolve') {
      // after the memory: breathing steadies, the back straightens, eyes lift
      kneelPose();
      resetEyes();
      armL.upper.rotation.set(-1.2, 0, 0.5);
      armR.upper.rotation.set(-1.25, 0, -0.5);
      armL.fore.rotation.x = 0.9;
      armR.fore.rotation.x = 0.95;
      const e = easeN(Math.min(1, at / 3));
      shoulders.rotation.x = lerpN(0.1, -0.04, e);
      headPivot.rotation.x = lerpN(0.45, -0.06, e);
      hips.position.y = lerpN(0.5, 0.53, e);
      const breath = Math.sin(t * 1.0) * (0.016 - 0.006 * e);
      torso.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath);

    } else if (a === 'still') {
      standingReset();
      resetEyes();
      const breath = Math.sin(t * 1.2) * 0.012;
      torso.scale.set(1 + breath, 1 + breath * 0.4, 1 + breath);
      headPivot.rotation.set(0.14 + Math.sin(t * 0.6) * 0.02, 0, 0);
      hips.rotation.z = Math.sin(t * 0.8) * 0.015;
      armL.upper.rotation.x = 0.16; armR.upper.rotation.x = 0.16;
      armL.fore.rotation.x = 0.1; armR.fore.rotation.x = 0.1;

    } else if (a === 'walk') {
      standingReset();
      resetEyes();
      const w = t * 5;
      hips.position.y = 0.92 + Math.abs(Math.sin(w)) * 0.035;
      legL.thigh.rotation.x = Math.sin(w) * 0.5;
      legR.thigh.rotation.x = -Math.sin(w) * 0.5;
      legL.shin.rotation.x = Math.max(0, -Math.sin(w)) * 0.6;
      legR.shin.rotation.x = Math.max(0, Math.sin(w)) * 0.6;
      armL.upper.rotation.x = -Math.sin(w) * 0.35 + 0.1;
      armR.upper.rotation.x = Math.sin(w) * 0.35 + 0.1;
      headPivot.rotation.x = -0.02;
      headPivot.rotation.y = Math.sin(t * 0.5) * 0.08;

    } else if (a === 'dance') {
      standingReset();
      resetEyes();
      // huaynito — bounce and joy; the film may spin group.rotation.y freely
      const b = t * 3.4;
      hips.position.y = 0.92 + Math.abs(Math.sin(b)) * 0.06;
      hips.rotation.z = Math.sin(b * 0.5) * 0.08;
      armL.upper.rotation.x = -0.6 + Math.sin(b) * 0.4;
      armR.upper.rotation.x = -0.6 - Math.sin(b) * 0.4;
      armL.upper.rotation.z = -0.5; armR.upper.rotation.z = 0.5;
      armL.fore.rotation.x = -0.5; armR.fore.rotation.x = -0.5;
      legL.thigh.rotation.x = Math.sin(b) * 0.18;
      legR.thigh.rotation.x = -Math.sin(b) * 0.18;
      headPivot.rotation.z = Math.sin(b * 0.5) * 0.1;
      headPivot.rotation.x = -0.06;

    } else {
      // idle — alive: breath, weight-shift sway, gentle bounce, arm swing
      standingReset();
      resetEyes();
      const breath = Math.sin(t * 1.5) * 0.018;
      torso.scale.set(1 + breath, 1 + breath * 0.4, 1 + breath);
      const sway = Math.sin(t * 0.9);
      hips.rotation.z = sway * 0.05;
      hips.position.y = 0.92 + Math.abs(Math.sin(t * 1.8)) * 0.015;
      shoulders.rotation.z = -sway * 0.04;
      headPivot.rotation.z = sway * 0.05;
      headPivot.rotation.y = Math.sin(t * 0.5) * 0.18;
      headPivot.rotation.x = -0.04 + Math.sin(t * 0.7) * 0.04;
      group.rotation.y = Math.sin(t * 0.35) * 0.12;
      armL.upper.rotation.x = 0.12 + Math.sin(t * 1.5) * 0.16;
      armR.upper.rotation.x = 0.12 - Math.sin(t * 1.5) * 0.16;
      armL.fore.rotation.x = 0.2 + Math.sin(t * 1.5 + 0.6) * 0.1;
      armR.fore.rotation.x = 0.2 - Math.sin(t * 1.5 + 0.6) * 0.1;
      legL.thigh.rotation.x = Math.sin(t * 1.8) * 0.05;
      legR.thigh.rotation.x = -Math.sin(t * 1.8) * 0.05;
    }

    // eyes: held shut while praying, a slow reopening, heavy-lidded when
    // exhausted, otherwise the occasional blink
    state.blink -= dt;
    if (state.blink < 0) state.blink = 2.5 + Math.random() * 3;
    let eyeY = 1;
    if (a === 'pray' && state.at > 6.5) {
      eyeY = 0.12;                                            // eyes closed
    } else if (a === 'prayOpen') {
      eyeY = lerpN(0.12, 1, easeN(Math.min(1, state.at / 1.6)));
      if (state.at > 2.5 && state.blink < 0.18) eyeY = 0.15;  // slow blinks after
    } else if (a === 'exhausted') {
      if (state.blink < 0.3) eyeY = 0.18;                     // heavy, tired blinks
    } else if (state.blink < 0.12) {
      eyeY = 0.15;
    }
    eyeL.scale.y = eyeR.scale.y = eyeY;
  };

  return group;
}
