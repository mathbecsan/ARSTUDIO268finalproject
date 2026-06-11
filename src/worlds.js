// World builders for KAWSAY RIPUY.
// Each builder returns: { group, interactables, update(dt), playerStart, bounds }
// Interactables carry { mesh, label, onInteract } and are raycast by main.js.
import * as THREE from 'three';
import { createAvatar } from './avatar.js';
import { makeWordSprite, WORDS } from './words.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function adobeMaterial(color = 0x8a6a4f) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
}

function ground(size, color, roughness = 1) {
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size, 32, 32),
    new THREE.MeshStandardMaterial({ color, roughness })
  );
  g.rotation.x = -Math.PI / 2;
  g.receiveShadow = true;
  return g;
}

function particleField({ count, area, color, size, yMin = 0, yMax = 10 }) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * area;
    pos[i * 3 + 1] = yMin + Math.random() * (yMax - yMin);
    pos[i * 3 + 2] = (Math.random() - 0.5) * area;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.7, depthWrite: false });
  return new THREE.Points(geo, mat);
}

function mountainRing(radius, count, color, heightScale = 1) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const h = (8 + Math.random() * 14) * heightScale;
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(6 + Math.random() * 8, h, 5),
      new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true })
    );
    m.position.set(Math.cos(a) * radius, h / 2 - 1, Math.sin(a) * radius);
    m.rotation.y = Math.random() * Math.PI;
    group.add(m);
  }
  return group;
}

// ---------------------------------------------------------------------------
// CHAPTER 0 — THE ROOM (hub). The adobe room, the night everything branches.
// ---------------------------------------------------------------------------

export function buildRoom(events) {
  const group = new THREE.Group();
  const interactables = [];
  const updaters = [];

  const W = 7, D = 8, H = 3.2;

  // floor + walls (adobe)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const wallMat = adobeMaterial(0x6e5640);
  const mkWall = (w, h, x, y, z, ry = 0) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    wall.position.set(x, y, z);
    wall.rotation.y = ry;
    wall.receiveShadow = true;
    group.add(wall);
    return wall;
  };
  mkWall(W, H, 0, H / 2, -D / 2);             // back
  mkWall(D, H, -W / 2, H / 2, 0, Math.PI / 2); // left
  mkWall(D, H, W / 2, H / 2, 0, -Math.PI / 2); // right
  mkWall(W, H, 0, H / 2, D / 2, Math.PI);      // front (door wall)
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), adobeMaterial(0x3a2e22));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = H;
  group.add(ceiling);

  // THE DOOR — front wall, slightly ajar dark wood
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 2.3, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x2e1f14, roughness: 0.8 })
  );
  door.position.set(1.6, 1.15, D / 2 - 0.06);
  group.add(door);

  // THE IRONING-BOARD DESK — fragile, with papers of Quechua notes
  const desk = new THREE.Group();
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x7d7468, roughness: 0.9 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.45), boardMat);
  board.position.y = 0.85;
  desk.add(board);
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6);
  [[-0.6, 0.2], [0.6, -0.2]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, boardMat);
    leg.position.set(x, 0.42, z);
    leg.rotation.z = x > 0 ? 0.12 : -0.12;
    desk.add(leg);
  });
  // papers
  for (let i = 0; i < 4; i++) {
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.21, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 1, side: THREE.DoubleSide })
    );
    paper.rotation.x = -Math.PI / 2;
    paper.rotation.z = Math.random() * 0.8 - 0.4;
    paper.position.set(-0.4 + i * 0.27, 0.88, (Math.random() - 0.5) * 0.1);
    desk.add(paper);
  }
  desk.position.set(-1.8, 0, -2.8);
  desk.rotation.y = 0.3;
  group.add(desk);

  // wobble animation for the fragile desk
  updaters.push(dt => {
    desk.rotation.z = Math.sin(performance.now() * 0.0014) * 0.006;
  });

  interactables.push({
    mesh: desk, label: 'The ironing-board desk',
    onInteract: () => events.emit('desk'),
  });

  // THE CHICOTE — leather whip hanging on the wall
  const chicote = new THREE.Group();
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.025, 8, 24, Math.PI * 1.5),
    new THREE.MeshStandardMaterial({ color: 0x3a2415, roughness: 0.6 })
  );
  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.008, 0.7, 6),
    new THREE.MeshStandardMaterial({ color: 0x3a2415, roughness: 0.6 })
  );
  tail.position.y = -0.45;
  chicote.add(strap, tail);
  chicote.position.set(-W / 2 + 0.08, 1.9, -1.2);
  chicote.rotation.y = Math.PI / 2;
  group.add(chicote);
  interactables.push({
    mesh: chicote, label: 'The chicote',
    onInteract: () => events.emit('chicote'),
  });

  // KEROSENE LAMP — the night of the branching
  const lamp = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.12, 10),
    new THREE.MeshStandardMaterial({ color: 0x6a5a30, metalness: 0.6, roughness: 0.4 }));
  const glassBulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xffcc77, emissive: 0xff9933, emissiveIntensity: 1.4, transparent: true, opacity: 0.85 }));
  glassBulb.position.y = 0.16;
  lamp.add(base, glassBulb);
  lamp.position.set(1.9, 0.9, -3.1);
  group.add(lamp);
  // small table under lamp
  const table = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.6), adobeMaterial(0x4e3a28));
  table.position.set(1.9, 0.45, -3.1);
  group.add(table);
  interactables.push({
    mesh: lamp, label: 'The kerosene lamp',
    onInteract: () => events.emit('lamp'),
  });

  // THE MIRROR — Scene 1, identity instability
  const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.7 }));
  const mirrorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 1.14),
    new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9, roughness: 0.15 }));
  mirrorGlass.position.z = 0.03;
  const mirror = new THREE.Group();
  mirror.add(mirrorFrame, mirrorGlass);
  mirror.position.set(W / 2 - 0.06, 1.6, 1.5);
  mirror.rotation.y = -Math.PI / 2;
  group.add(mirror);
  interactables.push({
    mesh: mirror, label: 'The mirror',
    onInteract: () => events.emit('mirror'),
  });

  // flickering ceiling light
  const flicker = new THREE.PointLight(0xffe0b0, 8, 12, 1.8);
  flicker.position.set(0, H - 0.3, -1);
  flicker.castShadow = true;
  group.add(flicker);
  const lampLight = new THREE.PointLight(0xff9933, 4, 6, 1.6);
  lampLight.position.copy(lamp.position).y += 0.3;
  group.add(lampLight);
  updaters.push(() => {
    flicker.intensity = 5.5 + Math.random() * 3.5 * (Math.random() < 0.08 ? 0.1 : 1);
    lampLight.intensity = 3.4 + Math.sin(performance.now() * 0.004) * 0.7 + Math.random() * 0.4;
  });

  // THREE PORTALS — hidden until the mirror is touched
  const portalDefs = [
    { x: -2.2, color: 0x6a7076, name: 'silence', label: 'Universe 1 — The Silence (What Was)' },
    { x: 0,    color: 0x55bbee, name: 'break',   label: 'Universe 2 — The Break (What Could Have Been)' },
    { x: 2.2,  color: 0xe08040, name: 'return',  label: 'Universe 3 — The Return (What Is)' },
  ];
  const portals = new THREE.Group();
  portals.visible = false;
  portalDefs.forEach(def => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.05, 12, 48),
      new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 2 })
    );
    const fill = new THREE.Mesh(
      new THREE.CircleGeometry(0.76, 32),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    const portal = new THREE.Group();
    portal.add(ring, fill);
    portal.position.set(def.x, 1.5, -D / 2 + 0.2);
    portals.add(portal);
    interactables.push({
      mesh: portal, label: def.label, requiresPortals: true,
      onInteract: () => events.emit('enterUniverse', def.name),
    });
    updaters.push(dt => {
      ring.rotation.z += dt * 0.5;
      fill.material.opacity = 0.18 + Math.sin(performance.now() * 0.002 + def.x) * 0.1;
    });
  });
  group.add(portals);

  return {
    group, interactables,
    update: dt => updaters.forEach(u => u(dt)),
    playerStart: new THREE.Vector3(0, 0, 2.6),
    bounds: { minX: -W / 2 + 0.5, maxX: W / 2 - 0.5, minZ: -D / 2 + 0.6, maxZ: D / 2 - 0.5 },
    showPortals: () => { portals.visible = true; },
    fog: new THREE.Fog(0x0d0f14, 6, 18),
    background: new THREE.Color(0x0d0f14),
    ambient: 0.25,
  };
}

// ---------------------------------------------------------------------------
// UNIVERSE 1 — THE SILENCE. Grey stone, closed doors, cold rain.
// ---------------------------------------------------------------------------

export function buildSilence(events) {
  const group = new THREE.Group();
  const interactables = [];
  const updaters = [];

  group.add(ground(80, 0x55585e));
  group.add(mountainRing(34, 14, 0x44474d));

  // corridor of closed doors — none of them open
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.9 });
  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const doorFrame = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.8, 0.18), doorMat);
    slab.position.y = 1.4;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 0.4), doorMat);
    lintel.position.y = 2.9;
    doorFrame.add(slab, lintel);
    doorFrame.position.set(side * (3 + Math.random() * 1.2), 0, -4 - i * 3.4);
    doorFrame.rotation.y = side * -0.35;
    group.add(doorFrame);
    interactables.push({
      mesh: doorFrame, label: 'A closed door',
      onInteract: () => {
        events.emit('silenceDoor');
        // the door refuses: it shudders but never opens
        const t0 = performance.now();
        const shake = () => {
          const e = (performance.now() - t0) / 1000;
          if (e > 0.6) { doorFrame.position.x = doorFrame.userData.x0; return; }
          if (doorFrame.userData.x0 === undefined) doorFrame.userData.x0 = doorFrame.position.x;
          doorFrame.position.x = doorFrame.userData.x0 + Math.sin(e * 60) * 0.03 * (1 - e / 0.6);
          requestAnimationFrame(shake);
        };
        shake();
      },
    });
  }

  // the rigid grey avatar, standing alone ahead
  const avatar = createAvatar('silence');
  avatar.position.set(0, 0, -14);
  group.add(avatar);
  updaters.push(dt => avatar.userData.update(dt));
  interactables.push({
    mesh: avatar, label: 'The boy who learned to disappear',
    onInteract: () => events.emit('silenceAvatar'),
  });

  // grey rain
  const rain = particleField({ count: 1600, area: 60, color: 0x9aa0a8, size: 0.06, yMin: 0, yMax: 18 });
  group.add(rain);
  updaters.push(dt => {
    const p = rain.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i) - dt * 7;
      if (y < 0) y = 18;
      p.setY(i, y);
    }
    p.needsUpdate = true;
  });

  // cold directional light
  const cold = new THREE.DirectionalLight(0x8090a8, 1.2);
  cold.position.set(5, 20, 5);
  group.add(cold);

  return {
    group, interactables,
    update: dt => updaters.forEach(u => u(dt)),
    playerStart: new THREE.Vector3(0, 0, 4),
    bounds: { minX: -28, maxX: 28, minZ: -30, maxZ: 8 },
    fog: new THREE.Fog(0x55585e, 8, 42),
    background: new THREE.Color(0x55585e),
    ambient: 0.35,
  };
}

// ---------------------------------------------------------------------------
// UNIVERSE 2 — THE BREAK. Glitched, half-rendered, a world that never loaded.
// ---------------------------------------------------------------------------

export function buildBreak(events) {
  const group = new THREE.Group();
  const interactables = [];
  const updaters = [];

  // wireframe terrain that never finished rendering
  const terrainGeo = new THREE.PlaneGeometry(70, 70, 28, 28);
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, Math.random() * 1.4);
  }
  const terrain = new THREE.Mesh(terrainGeo,
    new THREE.MeshBasicMaterial({ color: 0x2266aa, wireframe: true, transparent: true, opacity: 0.5 }));
  terrain.rotation.x = -Math.PI / 2;
  group.add(terrain);
  // solid dark floor under it so the player isn't floating over void
  group.add(ground(70, 0x06080c));

  // a broken bridge: planks that vanish and reappear
  const planks = [];
  for (let i = 0; i < 9; i++) {
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.12, 1.1),
      new THREE.MeshBasicMaterial({ color: 0x55aadd, transparent: true, opacity: 0.8, wireframe: i % 3 === 0 })
    );
    plank.position.set(0, 0.8 + i * 0.12, -4 - i * 1.5);
    group.add(plank);
    planks.push(plank);
  }
  updaters.push(() => {
    planks.forEach((pl, i) => {
      pl.visible = Math.sin(performance.now() * 0.001 + i * 1.7) > -0.55 && Math.random() > 0.04;
    });
  });

  // floating glitch fragments
  const frags = new THREE.Group();
  for (let i = 0; i < 60; i++) {
    const f = new THREE.Mesh(
      new THREE.BoxGeometry(0.3 + Math.random() * 0.8, 0.05 + Math.random() * 0.4, 0.3 + Math.random() * 0.8),
      new THREE.MeshBasicMaterial({ color: 0x66ccff, wireframe: Math.random() < 0.6, transparent: true, opacity: 0.5 })
    );
    f.position.set((Math.random() - 0.5) * 50, Math.random() * 10, (Math.random() - 0.5) * 50);
    frags.add(f);
  }
  group.add(frags);
  updaters.push(dt => {
    frags.children.forEach((f, i) => {
      f.rotation.y += dt * 0.4;
      f.visible = Math.random() > 0.02;
      f.position.y += Math.sin(performance.now() * 0.0008 + i) * 0.004;
    });
  });

  // the half-rendered avatar at the end of the bridge — the warning
  const avatar = createAvatar('break');
  avatar.position.set(0, 1.9, -18);
  group.add(avatar);
  updaters.push(dt => avatar.userData.update(dt));
  interactables.push({
    mesh: avatar, label: 'The version that almost was',
    onInteract: () => events.emit('breakAvatar'),
  });

  // an envelope that never arrived (the Stanford letter), hovering, unreachable-looking
  const letter = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.32),
    new THREE.MeshBasicMaterial({ color: 0xddeeff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  letter.position.set(2.5, 2.2, -9);
  group.add(letter);
  updaters.push(dt => {
    letter.rotation.y += dt * 0.8;
    letter.position.y = 2.2 + Math.sin(performance.now() * 0.0012) * 0.3;
    letter.material.opacity = 0.25 + Math.random() * 0.35;
  });
  interactables.push({
    mesh: letter, label: 'The letter that never came',
    onInteract: () => events.emit('breakLetter'),
  });

  const glow = new THREE.PointLight(0x3399ff, 30, 60, 1.6);
  glow.position.set(0, 12, -12);
  group.add(glow);
  updaters.push(() => { glow.intensity = 18 + Math.random() * 22; });

  return {
    group, interactables,
    update: dt => updaters.forEach(u => u(dt)),
    playerStart: new THREE.Vector3(0, 0, 5),
    bounds: { minX: -25, maxX: 25, minZ: -25, maxZ: 10 },
    fog: new THREE.Fog(0x05070c, 6, 40),
    background: new THREE.Color(0x05070c),
    ambient: 0.18,
  };
}

// ---------------------------------------------------------------------------
// UNIVERSE 3 — THE RETURN. Warm terracotta valley, the grandmother's kitchen,
// Quechua words floating as collectable light.
// ---------------------------------------------------------------------------

export function buildReturn(events) {
  const group = new THREE.Group();
  const interactables = [];
  const updaters = [];

  group.add(ground(90, 0xb5763f, 0.95));
  group.add(mountainRing(40, 16, 0x8a5a3a, 1.3));

  // a few sacred peaks with snow caps (apus)
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i - 1) * 0.6;
    const peak = new THREE.Mesh(new THREE.ConeGeometry(11, 26, 5),
      new THREE.MeshStandardMaterial({ color: 0x7a5038, flatShading: true }));
    peak.position.set(Math.cos(a) * 48, 12, Math.sin(a) * 48);
    const snow = new THREE.Mesh(new THREE.ConeGeometry(4.2, 9, 5),
      new THREE.MeshStandardMaterial({ color: 0xf0ead8, flatShading: true }));
    snow.position.set(peak.position.x, 21.5, peak.position.z);
    group.add(peak, snow);
  }

  // the grandmother's kitchen — small adobe house with warm light spilling out
  const house = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4, 2.6, 4), adobeMaterial(0xa3724a));
  walls.position.y = 1.3;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.8, 4),
    new THREE.MeshStandardMaterial({ color: 0x7a3a28, flatShading: true }));
  roof.position.y = 3.5;
  roof.rotation.y = Math.PI / 4;
  const doorway = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.8),
    new THREE.MeshBasicMaterial({ color: 0xffaa44 }));
  doorway.position.set(0, 0.9, 2.01);
  house.add(walls, roof, doorway);
  house.position.set(-6, 0, -10);
  group.add(house);
  const hearth = new THREE.PointLight(0xff9944, 20, 18, 1.5);
  hearth.position.set(-6, 1.5, -8);
  group.add(hearth);
  updaters.push(() => { hearth.intensity = 16 + Math.sin(performance.now() * 0.006) * 3 + Math.random() * 2; });
  interactables.push({
    mesh: house, label: "The grandmother's kitchen — chuta bread in the oven",
    onInteract: () => events.emit('kitchen'),
  });

  // the living avatar, dancing slightly — huaynito
  const avatar = createAvatar('return');
  avatar.position.set(3, 0, -8);
  group.add(avatar);
  updaters.push(dt => avatar.userData.update(dt));
  interactables.push({
    mesh: avatar, label: 'The boy who chose the language',
    onInteract: () => events.emit('returnAvatar'),
  });

  // textile banners on poles
  for (let i = 0; i < 5; i++) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a4030 }));
    const x = -12 + i * 6, z = -16;
    pole.position.set(x, 1.7, z);
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1),
      new THREE.MeshStandardMaterial({
        color: [0xc96f4a, 0xc9a227, 0xa3402f, 0x3a7a5a, 0xc96f4a][i],
        side: THREE.DoubleSide, roughness: 0.9,
      }));
    cloth.position.set(x + 0.85, 2.8, z);
    group.add(pole, cloth);
    updaters.push(dt => {
      cloth.rotation.y = Math.sin(performance.now() * 0.0011 + i * 2) * 0.3;
    });
  }

  // golden pollen / firefly particles
  const pollen = particleField({ count: 500, area: 50, color: 0xffd877, size: 0.09, yMin: 0.3, yMax: 6 });
  group.add(pollen);
  updaters.push(dt => {
    pollen.rotation.y += dt * 0.02;
    const p = pollen.geometry.attributes.position;
    for (let i = 0; i < p.count; i += 7) {
      p.setY(i, p.getY(i) + Math.sin(performance.now() * 0.001 + i) * 0.002);
    }
    p.needsUpdate = true;
  });

  // THE SIX QUECHUA WORDS — floating light, collectable
  const wordSprites = [];
  const wordPositions = [
    [6, 2.2, -4], [-3, 2.6, -3], [10, 2.4, -12],
    [-11, 2.2, -4], [0, 3.0, -18], [-6, 3.4, -13.5],
  ];
  WORDS.forEach((w, i) => {
    const sprite = makeWordSprite(w.q, { sub: w.en, color: '#f4d98a', scale: 3.2 });
    sprite.position.set(...wordPositions[i]);
    group.add(sprite);
    wordSprites.push(sprite);
    updaters.push(dt => {
      if (!sprite.visible) return;
      sprite.position.y = wordPositions[i][1] + Math.sin(performance.now() * 0.0013 + i * 2) * 0.25;
    });
    interactables.push({
      mesh: sprite, label: `${w.q} — ${w.en}`,
      onInteract: () => {
        if (!sprite.visible) return;
        sprite.visible = false;
        events.emit('wordCollected', { word: w, index: i, position: sprite.position.clone() });
      },
    });
  });

  // warm sun
  const sun = new THREE.DirectionalLight(0xffd9a0, 1.8);
  sun.position.set(-18, 30, 14);
  sun.castShadow = true;
  group.add(sun);

  return {
    group, interactables,
    update: dt => updaters.forEach(u => u(dt)),
    playerStart: new THREE.Vector3(0, 0, 6),
    bounds: { minX: -30, maxX: 30, minZ: -30, maxZ: 12 },
    fog: new THREE.Fog(0xf4c98a, 25, 80),
    background: new THREE.Color(0xf4c98a),
    ambient: 0.7,
  };
}

// ---------------------------------------------------------------------------
// FINALE — words become constellations in an Andean night sky.
// ---------------------------------------------------------------------------

export function buildFinale() {
  const group = new THREE.Group();
  const updaters = [];

  group.add(ground(120, 0x141018));

  // star field
  const stars = particleField({ count: 3000, area: 200, color: 0xffffff, size: 0.22, yMin: 5, yMax: 90 });
  group.add(stars);
  updaters.push(dt => { stars.rotation.y += dt * 0.004; });

  // dark silhouette mountains
  group.add(mountainRing(55, 18, 0x0a0810, 1.6));

  // the six words rising as constellations
  const rising = [];
  WORDS.forEach((w, i) => {
    const sprite = makeWordSprite(w.q, { color: '#ffe9b0', scale: 6 });
    const a = (i / WORDS.length) * Math.PI * 2;
    sprite.position.set(Math.cos(a) * 14, 2, -10 + Math.sin(a) * 8);
    sprite.userData.targetY = 18 + i * 4;
    sprite.userData.speed = 0.9 + i * 0.15;
    group.add(sprite);
    rising.push(sprite);
  });
  updaters.push(dt => {
    rising.forEach(s => {
      if (s.position.y < s.userData.targetY) s.position.y += dt * s.userData.speed;
    });
  });

  // the avatar, centered, still — the version who made it, carrying the others
  const avatar = createAvatar('return');
  avatar.position.set(0, 0, -8);
  group.add(avatar);
  updaters.push(dt => avatar.userData.update(dt));

  const moon = new THREE.DirectionalLight(0x9db4d8, 0.7);
  moon.position.set(10, 30, 10);
  group.add(moon);
  const halo = new THREE.PointLight(0xffd9a0, 10, 14, 1.6);
  halo.position.set(0, 2.5, -8);
  group.add(halo);

  return {
    group, interactables: [],
    update: dt => updaters.forEach(u => u(dt)),
    playerStart: new THREE.Vector3(0, 0, 2),
    bounds: { minX: -40, maxX: 40, minZ: -40, maxZ: 15 },
    fog: new THREE.Fog(0x141018, 30, 120),
    background: new THREE.Color(0x141018),
    ambient: 0.3,
  };
}
