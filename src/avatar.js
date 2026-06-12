// The Mathias avatar — one humanized figure, three renderings.
// U1 "The Silence": grey, head bowed, rigid, weight pulled inward.
// U2 "The Break":   half-rendered wireframe, flickering, unfinished.
// U3 "The Return":  warm skin, woven poncho + chullo, breathing and gently swaying.
//
// Style DNA: handcrafted Andean magical realism — faceted, matte, flat-shaded,
// like a carved retablo figure that has learned to breathe.
import * as THREE from 'three';

const SKIN = 0xb5805a;
const SKIN_SHADOW = 0x8a5e40;
const HAIR = 0x140d08;

// Andean textile pattern (terracotta / gold / deep-red bands with diamonds & zigzags)
function textileTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  const bands = ['#a3402f', '#c96f4a', '#c9a227', '#3a7a5a', '#5a2a2a', '#c96f4a', '#a3402f'];
  const bh = 256 / bands.length;
  bands.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * bh, 256, bh + 1); });
  // diamonds on the gold band
  x.fillStyle = '#f0e6d2';
  for (let i = 0; i < 12; i++) {
    const cx = 10 + i * 22, cy = 2.5 * bh;
    x.beginPath();
    x.moveTo(cx, cy - 9); x.lineTo(cx + 9, cy); x.lineTo(cx, cy + 9); x.lineTo(cx - 9, cy);
    x.closePath(); x.fill();
  }
  // zigzag on a red band
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

export function createAvatar(mode = 'return') {
  const group = new THREE.Group();

  // --- materials per mode -------------------------------------------------
  let skinMat, skinShadowMat, hairMat, bodyMat, ponchoMat, eyeMat;
  const flat = { flatShading: true };
  if (mode === 'silence') {
    skinMat = new THREE.MeshStandardMaterial({ color: 0x8f9094, roughness: 1, ...flat });
    skinShadowMat = new THREE.MeshStandardMaterial({ color: 0x76777b, roughness: 1, ...flat });
    hairMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 1, ...flat });
    bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a5246, roughness: 1, ...flat }); // muted green
    ponchoMat = bodyMat;
    eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 1 });
  } else if (mode === 'break') {
    const wire = { wireframe: true, transparent: true, opacity: 0.7 };
    skinMat = new THREE.MeshBasicMaterial({ color: 0x99ddff, ...wire });
    skinShadowMat = skinMat;
    hairMat = new THREE.MeshBasicMaterial({ color: 0x4488cc, ...wire });
    bodyMat = new THREE.MeshBasicMaterial({ color: 0x66ccff, ...wire });
    ponchoMat = bodyMat;
    eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  } else {
    skinMat = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.62, ...flat });
    skinShadowMat = new THREE.MeshStandardMaterial({ color: SKIN_SHADOW, roughness: 0.7, ...flat });
    hairMat = new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.85, ...flat });
    bodyMat = new THREE.MeshStandardMaterial({ color: 0x6b4636, roughness: 0.85, ...flat });
    ponchoMat = new THREE.MeshStandardMaterial({ map: textileTexture(), roughness: 0.82, ...flat });
    eyeMat = new THREE.MeshStandardMaterial({ color: 0x16100b, roughness: 0.4 });
  }

  // --- spine: a single pivot at the hips that the upper body hangs from ----
  const hips = new THREE.Group();
  hips.position.y = 0.92;
  group.add(hips);

  // pelvis
  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.18, 10), bodyMat);
  pelvis.castShadow = true;
  hips.add(pelvis);

  // torso (tapered toward shoulders)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.5, 10), bodyMat);
  torso.position.y = 0.34;
  torso.castShadow = true;
  hips.add(torso);

  // shoulders
  const shoulders = new THREE.Group();
  shoulders.position.y = 0.56;
  hips.add(shoulders);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.12, 10), bodyMat);
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

  // face: two eyes (and a faint nose ridge) on +Z
  const eyeGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.045, 0.105, 0.115);
  eyeR.position.set(0.045, 0.105, 0.115);
  headPivot.add(eyeL, eyeR);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 6), skinShadowMat);
  nose.rotation.x = Math.PI / 2.1;
  nose.position.set(0, 0.08, 0.13);
  headPivot.add(nose);

  // hair / chullo
  if (mode === 'return') {
    // chullo (knitted Andean hat) — textile cone with two ear flaps + pompom
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.155, 0.2, 12), ponchoMat);
    hat.position.y = 0.2;
    headPivot.add(hat);
    const flapGeo = new THREE.SphereGeometry(0.04, 8, 6);
    const flapL = new THREE.Mesh(flapGeo, ponchoMat); flapL.position.set(-0.13, 0.07, 0);
    const flapR = new THREE.Mesh(flapGeo, ponchoMat); flapR.position.set(0.13, 0.07, 0);
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.9, flatShading: true }));
    pom.position.y = 0.31;
    headPivot.add(flapL, flapR, pom);
  } else {
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.142, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.9),
      hairMat
    );
    hair.scale.set(0.95, 1.05, 1);
    hair.position.y = 0.11;
    headPivot.add(hair);
  }

  // poncho — drapes over shoulders (return + silence wear an outer layer)
  if (mode !== 'break') {
    const poncho = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.62, 10, 1, true), ponchoMat);
    poncho.position.y = 0.3;
    poncho.castShadow = true;
    hips.add(poncho);
  }

  // --- arms (pivot at shoulder) ------------------------------------------
  function makeArm(side) {
    const upper = segment(skinMat, { topR: 0.055, botR: 0.05, len: 0.32 });
    const fore = segment(skinMat, { topR: 0.05, botR: 0.042, len: 0.3 });
    fore.position.y = -0.32;
    upper.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), skinShadowMat);
    hand.scale.set(1, 1.2, 0.7);
    hand.position.y = -0.3;
    fore.add(hand);
    upper.position.set(side * 0.23, 0.04, 0);
    upper.rotation.z = side * 0.08;
    shoulders.add(upper);
    return { upper, fore };
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  // --- legs (pivot at hip) -----------------------------------------------
  function makeLeg(side) {
    const thigh = segment(bodyMat, { topR: 0.08, botR: 0.07, len: 0.46 });
    const shin = segment(bodyMat, { topR: 0.07, botR: 0.055, len: 0.46 });
    shin.position.y = -0.46;
    thigh.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.2), skinShadowMat);
    foot.position.set(0, -0.45, 0.05);
    foot.castShadow = true;
    shin.add(foot);
    thigh.position.set(side * 0.1, -0.08, 0);
    hips.add(thigh);
    return { thigh, shin };
  }
  const legL = makeLeg(-1);
  const legR = makeLeg(1);

  // rest pose: arms hang slightly forward
  armL.upper.rotation.x = 0.12; armR.upper.rotation.x = 0.12;

  // ------------------------------------------------------------------------
  // Animation
  // ------------------------------------------------------------------------
  const allMats = [skinMat, skinShadowMat, hairMat, bodyMat, ponchoMat, eyeMat];
  const t0 = Math.random() * 10;
  const state = { t: t0, blink: 0 };

  group.userData.update = (dt) => {
    state.t += dt;
    const t = state.t;

    if (mode === 'silence') {
      // closed in: head bowed, shoulders rounded, barely any motion
      headPivot.rotation.x = 0.42 + Math.sin(t * 0.6) * 0.01;
      shoulders.rotation.x = 0.14;
      hips.position.y = 0.9 + Math.sin(t * 1.1) * 0.004; // shallow breath
      armL.upper.rotation.x = 0.35; armR.upper.rotation.x = 0.35; // arms pulled in
      // rare rigid twitch
      const twitch = (Math.floor(t * 1.5) % 7 === 0) ? Math.sin(t * 40) * 0.01 : 0;
      group.rotation.z = twitch;

    } else if (mode === 'break') {
      // unfinished: flicker visibility, jitter, opacity noise
      group.visible = Math.random() > 0.12;
      group.position.x += (Math.random() - 0.5) * 0.012;
      group.position.x *= 0.92; // spring back toward origin
      headPivot.rotation.y = (Math.random() - 0.5) * 0.3;
      allMats.forEach(m => { if (m.opacity !== undefined) m.opacity = 0.35 + Math.random() * 0.5; });

    } else {
      // alive: breath, weight-shift sway, gentle huaynito bounce, arm swing
      const breath = Math.sin(t * 1.5) * 0.018;
      torso.scale.set(1 + breath, 1 + breath * 0.4, 1 + breath);
      const sway = Math.sin(t * 0.9);
      hips.rotation.z = sway * 0.05;
      hips.position.y = 0.92 + Math.abs(Math.sin(t * 1.8)) * 0.015; // soft bounce
      shoulders.rotation.z = -sway * 0.04;
      headPivot.rotation.z = sway * 0.05;
      headPivot.rotation.y = Math.sin(t * 0.5) * 0.18;       // looking around, alive
      headPivot.rotation.x = -0.04 + Math.sin(t * 0.7) * 0.04;
      group.rotation.y = Math.sin(t * 0.35) * 0.12;
      armL.upper.rotation.x = 0.12 + Math.sin(t * 1.5) * 0.16;
      armR.upper.rotation.x = 0.12 - Math.sin(t * 1.5) * 0.16;
      armL.fore.rotation.x = 0.2 + Math.sin(t * 1.5 + 0.6) * 0.1;
      armR.fore.rotation.x = 0.2 - Math.sin(t * 1.5 + 0.6) * 0.1;
      legL.thigh.rotation.x = Math.sin(t * 1.8) * 0.05;
      legR.thigh.rotation.x = -Math.sin(t * 1.8) * 0.05;

      // occasional blink
      state.blink -= dt;
      if (state.blink < 0) { state.blink = 2.5 + Math.random() * 3; }
      const blinking = state.blink < 0.12;
      eyeL.scale.y = eyeR.scale.y = blinking ? 0.15 : 1;
    }
  };

  return group;
}
