// KAWSAY RIPUY — THE FILM
// A fully animated, in-engine 3D short film (~2 minutes) that performs the
// entire essay beat-by-beat: animated characters, dynamic cameras, set
// changes, light cues and score — real-time machinima, not a slideshow.
//
// buildFilm(opts) returns a world-compatible object for main.js's switchWorld.
// Its update() drives actors AND the camera every frame.
import * as THREE from 'three';
import { buildRoom, buildReturn, buildFinale } from './worlds.js';
import { createAvatar } from './avatar.js';
import { makeWordSprite } from './words.js';

const ease = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

function camPath(cam, from, to, look, p) {
  const e = ease(p);
  cam.position.set(lerp(from.x, to.x, e), lerp(from.y, to.y, e), lerp(from.z, to.z, e));
  cam.lookAt(look);
}

export function buildFilm(opts) {
  const { scene, ambient, setCaption, cue, onEnd } = opts;
  const group = new THREE.Group();
  const noEvents = { emit() {} };

  // ---------------------------------------------------------------------
  // SETS — built once, toggled per shot
  // ---------------------------------------------------------------------
  const roomSet = buildRoom(noEvents);
  const valleySet = buildReturn(noEvents);
  const finaleSet = buildFinale();

  // grey void for the grandfather flashback
  const greySet = (() => {
    const g = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x4a4d52, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; g.add(floor);
    const cold = new THREE.DirectionalLight(0x8090a8, 1.0);
    cold.position.set(4, 15, 6); g.add(cold);
    return { group: g, fog: new THREE.Fog(0x4a4d52, 5, 30), background: new THREE.Color(0x4a4d52), ambient: 0.3, update() {} };
  })();

  const sets = { room: roomSet, valley: valleySet, finale: finaleSet, grey: greySet };
  Object.values(sets).forEach(s => { s.group.visible = false; group.add(s.group); });
  // the explorable valley has its own ambient avatar — the film casts its own boy
  if (valleySet.residentAvatar) valleySet.residentAvatar.visible = false;

  // the room's own lights, so Scene 1 can pull them down to near-darkness
  const roomPLights = [];
  roomSet.group.traverse(o => { if (o.isPointLight) roomPLights.push(o); });
  function dimRoom() {
    if (roomPLights[0]) roomPLights[0].intensity = 0.35;             // ceiling flicker, almost off
    if (roomPLights[1]) roomPLights[1].intensity = 0.8;              // kerosene lamp, distant ember
  }

  // ---------------------------------------------------------------------
  // SCENE 1 PROPS — stool, desk lamp, shelf with the family photograph,
  // trembling dust, and the hallway light leaking under the door.
  // Visible whenever the room set is.
  // ---------------------------------------------------------------------
  const s1 = new THREE.Group();
  group.add(s1);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2e, roughness: 0.9, flatShading: true });

  // wooden stool beneath the boy
  const stool = new THREE.Group();
  const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.05, 10), woodMat);
  stoolSeat.position.y = 0.47;
  const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.46, 8), woodMat);
  stoolLeg.position.y = 0.23;
  stool.add(stoolSeat, stoolLeg);
  stool.position.set(-1.65, 0, -2.25);
  s1.add(stool);

  // small desk lamp balanced at the end of the ironing board
  const lampGrp = new THREE.Group();
  const lampMetal = new THREE.MeshStandardMaterial({ color: 0x424a52, metalness: 0.5, roughness: 0.5 });
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.025, 10), lampMetal);
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.26, 6), lampMetal);
  lampStem.position.set(-0.05, 0.13, 0.02);
  lampStem.rotation.z = 0.45;
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.1, 10, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x2e4a3a, roughness: 0.6, side: THREE.DoubleSide }));
  lampShade.position.set(-0.12, 0.26, 0.04);
  lampShade.rotation.z = 0.8;
  const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffaa44, emissiveIntensity: 1.2 }));
  lampBulb.position.set(-0.14, 0.24, 0.04);
  lampGrp.add(lampBase, lampStem, lampShade, lampBulb);
  lampGrp.position.set(-1.27, 0.875, -2.96);
  s1.add(lampGrp);
  const deskLight = new THREE.PointLight(0xffb066, 1.9, 5.5, 2);
  deskLight.position.set(-1.45, 1.25, -2.85);
  s1.add(deskLight);
  // dark blue night fill — the rest of the room stays in cold shadow
  const blueFill = new THREE.PointLight(0x2e4a78, 2.2, 14, 1.6);
  blueFill.position.set(0.6, 2.7, 0.8);
  s1.add(blueFill);

  // shelf on the left wall with the framed family photograph and two books
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.85), woodMat);
  shelf.position.set(-3.42, 1.66, -0.6);
  s1.add(shelf);
  // a pale spill of night light so the shelf close-up reads in the dark
  const shelfLight = new THREE.PointLight(0x9db4d8, 1.4, 3.2, 1.8);
  shelfLight.position.set(-2.6, 2.2, -0.4);
  s1.add(shelfLight);
  const photo = new THREE.Group();
  const photoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.21, 0.17),
    new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.7 }));
  const photoPic = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.17),
    new THREE.MeshStandardMaterial({ color: 0xcdb98e, roughness: 0.9 }));
  photoPic.rotation.y = Math.PI / 2;
  photoPic.position.x = 0.012;
  photo.add(photoFrame, photoPic);
  photo.position.set(-3.4, 1.79, -0.5);
  photo.rotation.y = 0.12;
  s1.add(photo);
  [[-0.85, 0.06, 0x7a3a28], [-0.78, 0.05, 0x3a5a4a]].forEach(([dz, h, col]) => {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, h),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }));
    book.position.set(-3.42, 1.76, -0.6 + dz + 0.6);
    s1.add(book);
  });

  // dust beneath the shelf — bursts loose when a footstep lands
  const DUST_N = 50;
  const dustBase = new Float32Array(DUST_N * 3);
  const dustSpeed = new Float32Array(DUST_N);
  for (let i = 0; i < DUST_N; i++) {
    dustBase[i * 3] = -3.42 + Math.random() * 0.14;
    dustBase[i * 3 + 1] = 1.62 + Math.random() * 0.08;
    dustBase[i * 3 + 2] = -1.0 + Math.random() * 0.85;
    dustSpeed[i] = 0.1 + Math.random() * 0.25;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustBase.slice(), 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xe8dcc0, size: 0.024, transparent: true, opacity: 0, depthWrite: false,
  }));
  s1.add(dust);
  let dustT = -1, photoShake = 0;
  function dustBurst() {
    dustT = 0;
    dustGeo.attributes.position.array.set(dustBase);
    dustGeo.attributes.position.needsUpdate = true;
  }

  // warm hallway light leaking under the door, and the shadow that crosses it.
  // The slit is a vertical sliver (reads from the low camera angle); the floor
  // spill and a faint hall light sell the leak, and both dim as the shadow passes.
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.045),
    new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  doorGlow.position.set(1.6, 0.035, 3.895);
  s1.add(doorGlow);
  const floorSpill = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.3),
    new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0.16 }));
  floorSpill.rotation.x = -Math.PI / 2;
  floorSpill.position.set(1.6, 0.012, 3.74);
  s1.add(floorSpill);
  const hallLight = new THREE.PointLight(0xffc070, 0.9, 3, 1.8);
  hallLight.position.set(1.6, 0.2, 3.55);
  s1.add(hallLight);
  const doorShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.06),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.92, side: THREE.DoubleSide }));
  doorShadow.position.set(0.8, 0.035, 3.89);
  doorShadow.visible = false;
  s1.add(doorShadow);

  // per-frame life of the scene-1 props (lamp breathing, dust, photo rattle)
  function s1Anim(dt) {
    if (!s1.visible) return;
    deskLight.intensity = 1.8 + Math.sin(performance.now() * 0.012) * 0.12 + Math.random() * 0.1;
    lampBulb.material.emissiveIntensity = 1.1 + Math.random() * 0.25;
    if (photoShake > 0) {
      photoShake -= dt;
      photo.rotation.z = Math.sin(performance.now() * 0.07) * 0.06 * Math.max(0, photoShake);
      photo.position.y = 1.79 + Math.sin(performance.now() * 0.09) * 0.004 * Math.max(0, photoShake);
    } else {
      photo.rotation.z *= 0.85;
    }
    if (dustT >= 0) {
      dustT += dt;
      const pos = dustGeo.attributes.position;
      for (let i = 0; i < DUST_N; i++) pos.setY(i, pos.getY(i) - dt * dustSpeed[i]);
      pos.needsUpdate = true;
      dust.material.opacity = Math.max(0, 0.85 * (1 - dustT / 1.8));
      if (dustT > 1.8) { dustT = -1; dust.material.opacity = 0; }
    }
  }

  // ---------------------------------------------------------------------
  // ACTORS
  // ---------------------------------------------------------------------
  const boy = createAvatar('return');          // the protagonist
  const father = createAvatar('silence');      // imposing, military-rigid
  father.scale.set(1.3, 1.18, 1.3);
  const grandfather = createAvatar('silence'); // the flashback
  grandfather.scale.set(1.2, 1.1, 1.2);
  const grandma = createAvatar('elder');
  grandma.scale.set(0.92, 0.88, 0.92);
  [boy, father, grandfather, grandma].forEach(a => { a.visible = false; group.add(a); });
  if (import.meta.env.DEV) window.__boy = boy;

  // insult sprites (scene 5)
  const insults = ['COBARDE', 'IMBÉCIL', 'ESTÚPIDO'].map((wrd, i) => {
    const s = makeWordSprite(wrd, { color: '#d04a3a', scale: 1.6 });
    s.visible = false; group.add(s); return s;
  });
  // floating books (scene 12)
  const books = [];
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.05, 0.25),
      new THREE.MeshStandardMaterial({ color: [0xc96f4a, 0xc9a227, 0x3a7a5a, 0xa3402f][i % 4], roughness: 0.8 })
    );
    b.visible = false; group.add(b); books.push(b);
  }

  // ---------------------------------------------------------------------
  // SHOTS — each: { dur, set, caption, cue?, enter(), tick(t, p) }
  // Sets are toggled and atmosphere applied on entry. tick drives actors+camera.
  // ---------------------------------------------------------------------
  const cam = opts.camera;
  const D = 8; // room depth reference (room is 7x8)

  function place(a, x, z, ry = 0, visible = true) {
    a.position.set(x, 0, z); a.rotation.y = ry; a.visible = visible;
  }
  function hideActors() { [boy, father, grandfather, grandma].forEach(a => a.visible = false); insults.forEach(s => s.visible = false); books.forEach(b => b.visible = false); }
  // the boy at his ironing-board desk, seated on the stool, facing the lamp
  function seatBoy(action = 'write') {
    place(boy, -1.65, -2.25, Math.PI + 0.26);
    boy.userData.setAction(action);
  }
  // the boy kneeling on the wooden floor beside the stool, facing the lamp
  function kneelBoy(action = 'kneel') {
    place(boy, -1.45, -2.0, Math.PI + 0.26);
    boy.userData.setAction(action);
  }

  // the lesson plans he gently pushes aside before praying
  const prayPapers = [];
  [[-1.95, -2.72, 0.2], [-1.82, -2.66, -0.35], [-2.04, -2.79, 0.55]].forEach(([px, pz, rz], i) => {
    const pp = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.27),
      new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 1, side: THREE.DoubleSide })
    );
    pp.rotation.x = -Math.PI / 2;
    pp.rotation.z = rz;
    pp.position.set(px, 0.882 + i * 0.002, pz);
    pp.userData = { x0: px, z0: pz, r0: rz };
    s1.add(pp);
    prayPapers.push(pp);
  });

  const S1_LINE = 'His clomp signaled that he would soon enter my room.';
  const SHOTS = [
    // =====================================================================
    // SCENE 1 — five shots. A quiet room, two footsteps, and a shadow.
    // =====================================================================
    { // 1.1 — extreme close-up: the pencil across the paper
      dur: 6, set: 'room', cue: 'scratch',
      caption: S1_LINE,
      enter() { hideActors(); seatBoy('write'); },
      tick(t, p) {
        dimRoom();
        // grazing across the board from its far end, pencil in profile
        camPath(cam, V3(-2.6, 1.08, -2.38), V3(-2.42, 1.0, -2.5), V3(-1.9, 0.87, -2.68), p);
      },
    },
    { // 1.2 — CLOMP. the pencil instantly stops. the camera does not move.
      dur: 5, set: 'room',
      caption: S1_LINE,
      enter() { seatBoy('write'); this.hit = false; },
      tick(t) {
        dimRoom();
        if (!this.hit && t > 1.1) {
          this.hit = true;
          cue('scratch_stop'); cue('clomp'); cue('tension');
          boy.userData.setAction('freeze');
        }
        cam.position.set(-2.42, 1.0, -2.5);
        cam.lookAt(-1.9, 0.87, -2.68);
      },
    },
    { // 1.3 — dust trembles from the shelf; the family photograph vibrates
      dur: 5, set: 'room',
      caption: S1_LINE,
      enter() { this.hit = false; },
      tick(t, p) {
        dimRoom();
        if (!this.hit && t > 1.3) {
          this.hit = true;
          cue('clomp'); dustBurst(); photoShake = 0.9;
        }
        camPath(cam, V3(-2.35, 1.88, 0.3), V3(-2.62, 1.8, -0.02), V3(-3.4, 1.72, -0.56), p);
      },
    },
    { // 1.4 — close-up on the boy's eyes. they move toward the door first.
      dur: 5.5, set: 'room',
      caption: S1_LINE,
      enter() { boy.userData.setAction('fear'); },
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(-1.95, 1.38, -3.18), V3(-1.86, 1.34, -3.0), V3(-1.66, 1.3, -2.28), p);
      },
    },
    { // 1.5 — low-angle floor shot. a shadow slides beneath the door.
      dur: 5.5, set: 'room',
      caption: S1_LINE,
      enter() { this.hit = false; doorShadow.visible = false; },
      tick(t, p) {
        dimRoom();
        if (!this.hit && t > 1.2) { this.hit = true; cue('clomp'); }
        if (t > 1.0) {
          doorShadow.visible = true;
          doorShadow.position.x = lerp(0.75, 2.5, ease(Math.min(1, (t - 1.0) / 3.6)));
        }
        // the hallway light dies as the shadow crosses the centre of the door
        const occ = doorShadow.visible ? Math.max(0, 1 - Math.abs(doorShadow.position.x - 1.6) / 0.5) : 0;
        hallLight.intensity = 0.9 * (1 - occ * 0.85);
        doorGlow.material.opacity = 0.85 * (1 - occ * 0.55);
        camPath(cam, V3(1.3, 0.26, 1.6), V3(1.45, 0.18, 2.3), V3(1.62, 0.1, 3.92), p);
      },
    },
    { // 2 — the ironing-board desk
      dur: 7, set: 'room',
      caption: 'The ironing board I used as a desk felt on the verge of collapsing as I planned my Quechua lessons.',
      enter() { hideActors(); seatBoy('write'); doorShadow.visible = false; },
      tick(t, p) {
        camPath(cam, V3(0.6, 1.3, -0.6), V3(-0.4, 1.15, -1.5), V3(-1.8, 0.95, -2.8), p);
      },
    },
    { // 3 — the father bursts in
      dur: 8, set: 'room', cue: 'knock',
      caption: '“¡¿Qué estupidez haces?! Those dialects you learn are useless,” my father said — a Quechua speaker himself.',
      enter() { hideActors(); seatBoy('freeze'); place(father, 1.6, 2.6, Math.PI); },
      tick(t, p) {
        father.position.z = lerp(2.6, 0.4, ease(Math.min(1, t / 3)));   // advancing
        camPath(cam, V3(-0.8, 0.9, -1.6), V3(-1.2, 0.8, -1.2), V3(1.6, 1.9, 1.4), p); // low angle up at him
      },
    },
    { // 4 — quietness or the chicote
      dur: 8, set: 'room',
      caption: 'I did not respond. Anything but quietness meant dozens of hits with his chicote — or freezing showers, for challenging the masculinity the army imposed on him.',
      enter() { hideActors(); seatBoy('fear'); place(father, 0.6, 0.2, Math.PI * 0.92); },
      tick(t, p) {
        // slow orbit around the small boy, father looming beyond
        const a = lerp(-0.6, 0.9, ease(p)), r = 2.2;
        cam.position.set(-1.65 + Math.sin(a) * r, 1.35, -2.25 + Math.cos(a) * r);
        cam.lookAt(-1.65, 1.0, -2.25);
      },
    },
    { // 5 — the internal scream
      dur: 6, set: 'room',
      caption: 'I held back my tears and internally screamed to ignore his insults.',
      enter() {
        hideActors(); seatBoy('freeze');
        insults.forEach((s, i) => { s.visible = true; s.position.set(-1.65 + (i - 1) * 1.1, 1.6 + (i % 2) * 0.5, -1.2); });
      },
      tick(t, p) {
        insults.forEach((s, i) => {
          s.material.opacity = 0.25 + Math.abs(Math.sin(t * 2.2 + i * 1.4)) * 0.75;
          s.position.y = 1.6 + (i % 2) * 0.5 + Math.sin(t * 1.3 + i) * 0.1;
        });
        camPath(cam, V3(-1.65, 1.5, 0.4), V3(-1.65, 1.45, -0.6), V3(-1.65, 1.5, -2.25), p);
      },
    },
    // =====================================================================
    // SCENES 4-6 — THE PRAYER. Fear → reflection → prayer → forgiveness →
    // doubt → faith. Not routine prayer: the first time he truly has
    // nowhere else to go.
    // =====================================================================
    { // 4.1 — wide: a small child alone in an enormous room
      dur: 6, set: 'room', cue: 'prayer',
      caption: 'Like never before, I prayed to God with sincerity.',
      enter() { hideActors(); seatBoy('exhausted'); doorShadow.visible = false; },
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(2.6, 2.2, 2.9), V3(2.2, 2.0, 2.4), V3(-1.7, 0.9, -2.6), p);
      },
    },
    { // 4.2 — medium: staring down at the lesson plans, processing
      dur: 5, set: 'room',
      caption: 'Like never before, I prayed to God with sincerity.',
      enter() {},
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(-2.5, 1.5, -1.7), V3(-2.35, 1.42, -1.85), V3(-1.6, 1.1, -2.55), p);
      },
    },
    { // 4.3 — close-up: the papers pushed aside. not carelessly. gently.
      dur: 5, set: 'room',
      caption: 'Like never before, I prayed to God with sincerity.',
      enter() { boy.userData.setAction('clear'); },
      tick(t, p) {
        dimRoom();
        // the lesson plans slide along the board with the sweep of his hand
        const s = ease(Math.min(1, Math.max(0, (t - 0.7) / 2.6)));
        prayPapers.forEach((pp, i) => {
          const d = s * (0.2 + i * 0.05);
          pp.position.x = pp.userData.x0 + 0.955 * d;
          pp.position.z = pp.userData.z0 - 0.296 * d;
          pp.rotation.z = pp.userData.r0 + s * (0.3 - i * 0.25);
        });
        camPath(cam, V3(-2.35, 1.06, -2.35), V3(-2.2, 1.0, -2.45), V3(-1.85, 0.88, -2.7), p);
      },
    },
    { // 4.4 — low angle: the knees touch the wooden floor
      dur: 5, set: 'room',
      caption: 'Like never before, I prayed to God with sincerity.',
      enter() { kneelBoy('kneel'); },
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(-2.65, 0.24, -1.3), V3(-2.5, 0.2, -1.42), V3(-1.5, 0.32, -2.08), p);
      },
    },
    { // 4.5 — extreme close-up: the fingers slowly interlock
      dur: 5, set: 'room',
      caption: 'Like never before, I prayed to God with sincerity.',
      enter() { boy.userData.setAction('pray'); },
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(-1.1, 0.85, -2.78), V3(-1.18, 0.8, -2.7), V3(-1.54, 0.7, -2.3), p);
      },
    },
    { // 4.6 — profile: the head lowers. the eyes close.
      dur: 6, set: 'room',
      caption: 'Like never before, I prayed to God with sincerity.',
      enter() {}, // the prayer performance continues uncut
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(-0.45, 1.25, -2.3), V3(-0.66, 1.2, -2.26), V3(-1.5, 1.05, -2.02), p);
      },
    },
    { // 5.1 — the clasped hands tighten
      dur: 5, set: 'room',
      caption: 'I asked for my father to be forgiven.',
      enter() {},
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(-1.2, 0.78, -2.66), V3(-1.25, 0.75, -2.6), V3(-1.54, 0.68, -2.32), p);
      },
    },
    { // 5.2 — the memory: a tired man, working, struggling, burdened
      dur: 6, set: 'grey', cue: 'wind',
      caption: 'I asked for my father to be forgiven.',
      enter() { hideActors(); place(father, 0, -3.2, Math.PI + 0.3); },
      tick(t, p) {
        // walking home, away into the grey
        father.position.z = -3.2 - t * 0.18;
        father.position.y = Math.abs(Math.sin(t * 1.6)) * 0.02;
        camPath(cam, V3(0, 1.5, 0.6), V3(0, 1.45, 0.1), V3(0, 1.4, -3.6), p);
      },
    },
    { // 5.3 — return to the prayer
      dur: 4, set: 'room', cue: 'quiet',
      caption: 'I asked for my father to be forgiven.',
      enter() { hideActors(); kneelBoy('pray'); },
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(-0.7, 1.35, -1.5), V3(-0.85, 1.3, -1.65), V3(-1.5, 1.1, -2.05), p);
      },
    },
    { // 6.1 — extreme close-up: the eyes open
      dur: 5, set: 'room',
      caption: 'Although I still doubted God would hear my unworthy but honest pleas, I had nothing left but faith.',
      enter() { boy.userData.setAction('prayOpen'); },
      tick(t, p) {
        dimRoom();
        camPath(cam, V3(-1.7, 1.3, -2.85), V3(-1.66, 1.28, -2.72), V3(-1.45, 1.24, -2.0), p);
      },
    },
    { // 6.2 — POV: the same room. the same silence. no miracle.
      dur: 5, set: 'room',
      caption: 'Although I still doubted God would hear my unworthy but honest pleas, I had nothing left but faith.',
      enter() { boy.visible = false; },
      tick(t, p) {
        dimRoom();
        cam.position.set(-1.45, 1.32, -2.0);
        const e = ease(Math.min(1, t / 4.2));
        cam.lookAt(lerp(-1.75, 1.6, e), lerp(0.9, 1.1, e), lerp(-2.75, 3.9, e));
      },
    },
    { // 6.3 — slow push-in: the smallest remaining thread of hope
      dur: 7, set: 'room',
      caption: 'Although I still doubted God would hear my unworthy but honest pleas, I had nothing left but faith.',
      enter() { boy.visible = true; this.hit = false; },
      tick(t, p) {
        dimRoom();
        if (!this.hit && t > 5) { this.hit = true; cue('hope'); }
        camPath(cam, V3(-1.78, 1.36, -3.05), V3(-1.64, 1.3, -2.62), V3(-1.45, 1.24, -2.0), p);
      },
    },
    { // 7 — the grandfather (flashback)
      dur: 9, set: 'grey', cue: 'wind',
      caption: 'Courage flared when I recalled my grandfather, who came home drunk and burst into anger. My father mirrored him — men carrying the intergenerational trauma of a racist society.',
      enter() { hideActors(); boy.scale.set(1, 1, 1); place(grandfather, 0, -6, 0); },
      tick(t, p) {
        grandfather.position.z = lerp(-6, -3.4, ease(p));
        grandfather.rotation.z = Math.sin(t * 1.7) * 0.08; // staggering
        camPath(cam, V3(0, 1.6, 2), V3(0, 1.5, 0.8), V3(0, 1.4, -4), p);
      },
    },
    { // 8 — break the cycle
      dur: 5, set: 'grey',
      caption: 'I had to be the one to break the generational cycle.',
      enter() { hideActors(); place(boy, 0, -2, 0); boy.userData.setAction('walk'); },
      tick(t, p) {
        boy.position.z = lerp(-2, 1.2, ease(p)); // walking out of the grey, toward us
        camPath(cam, V3(0, 1.3, 3.4), V3(0, 1.25, 3.0), V3(0, 1.2, boy.position.z), p);
      },
    },
    { // 9 — grandma and the chuta
      dur: 8, set: 'valley', cue: 'warmth',
      caption: 'I looked at my grandma for strength, as I had for years. We baked chuta — sweet bread — while learning new Quechua vocabulary.',
      enter() { hideActors(); place(grandma, -5.5, -7.2, 0.5); place(boy, -4.5, -6.9, -0.7); boy.userData.setAction('still'); },
      tick(t, p) { camPath(cam, V3(-2.4, 1.6, -4.2), V3(-3.2, 1.35, -5.0), V3(-5.2, 1.1, -7.3), p); },
    },
    { // 10 — the words that sheltered him
      dur: 8, set: 'valley', cue: 'chime',
      caption: 'sinchi — bold. sumaq — handsome. umasapa — intelligent, a bit stubborn. Those words took me under their wing at my lowest point.',
      enter() { hideActors(); place(boy, -4.5, -6.9, -0.7); boy.userData.setAction('still'); place(grandma, -5.5, -7.2, 0.5); },
      tick(t, p) { camPath(cam, V3(-4.2, 1.4, -5.2), V3(-4.2, 2.2, -4.6), V3(-4.2, 2.6, -9), p); },
    },
    { // 11 — huaynito
      dur: 8, set: 'valley', cue: 'warmth',
      caption: "Knitting vicuña wool. Dancing Huaycapata's huaynito. I overcame my stage fright — my fear of expressing my true self.",
      enter() { hideActors(); place(boy, 0, -15, 0); boy.userData.setAction('dance'); },
      tick(t, p) {
        boy.rotation.y += 0.025;                                  // spinning dance
        boy.position.y = Math.abs(Math.sin(t * 3.4)) * 0.12;      // bounce
        const a = t * 0.35, r = 4.2;
        cam.position.set(Math.sin(a) * r, 1.7 + Math.sin(t * 0.5) * 0.3, -15 + Math.cos(a) * r);
        cam.lookAt(0, 1.1, -15);
      },
    },
    { // 12 — the scholar
      dur: 8, set: 'valley',
      caption: 'All-nighters over dusty dictionaries, scientific neologisms in Quechua, antique books from the flea market — my devotion to educate grew stronger than ever.',
      enter() {
        hideActors(); place(boy, 3, -8, -0.4); boy.userData.setAction('still');
        books.forEach((b, i) => { b.visible = true; });
      },
      tick(t, p) {
        books.forEach((b, i) => {
          const a = t * 0.6 + (i / books.length) * Math.PI * 2;
          b.position.set(3 + Math.cos(a) * 1.4, 1.2 + Math.sin(t * 0.9 + i) * 0.4, -8 + Math.sin(a) * 1.4);
          b.rotation.y = a; b.rotation.x = Math.sin(t + i) * 0.4;
        });
        camPath(cam, V3(3, 1.5, -5.4), V3(3, 1.3, -6), V3(3, 1.2, -8), p);
      },
    },
    { // 13 — he is slowly changing
      dur: 8, set: 'room', cue: 'tension_soft',
      caption: "I still hear my father's footsteps entering my room. Yet, he is slowly changing.",
      enter() { hideActors(); seatBoy('write'); place(father, 1.6, 2.9, Math.PI); },
      tick(t, p) {
        // the father stays at the threshold this time — present, not violent.
        // and this time, the pencil keeps moving.
        camPath(cam, V3(-1.2, 1.4, -1.2), V3(0.2, 1.45, 0.2), V3(1.6, 1.5, 2.9), p);
      },
    },
    { // 14 — identity in all its forms
      dur: 9, set: 'valley', cue: 'warmth',
      caption: 'My identity feels less hidden, my language less threatened, my people less forgotten. Indigenous, Latino, bisexual — I embrace my authenticity in all its forms, building a globalized, positive masculinity.',
      enter() { hideActors(); place(boy, 0, -14, 0); boy.userData.setAction('walk'); },
      tick(t, p) {
        boy.position.z = lerp(-14, -6, ease(p)); // walking toward camera through the valley
        cam.position.set(0, 1.5, boy.position.z + 4.6);
        cam.lookAt(0, 1.2, boy.position.z);
      },
    },
    { // 15 — kallpacharikuy, sunqulliy, sullullchay
      dur: 9, set: 'finale', cue: 'finale',
      caption: 'I want others who stand where I once did to reclaim their kallpacharikuy, sunqulliy, and sullullchay — resilience, confidence, commitment — and uplift their true selves.',
      enter() { hideActors(); },
      tick(t, p) { camPath(cam, V3(0, 2, 6), V3(0, 4.5, 10), V3(0, 9, -10), p); },
    },
    { // 16 — the dedication
      dur: 10, set: 'finale',
      caption: 'Dad, my dearest Quechua people — Musqusqaykimanta astawan karutaraq chayasaqku. We’ll get farther than you ever dreamed.',
      enter() { hideActors(); },
      tick(t, p) {
        const e = ease(p);
        cam.position.set(0, lerp(4, 11, e), lerp(12, 18, e));
        cam.lookAt(0, lerp(6, 16, e), -10);
      },
    },
  ];

  // ---------------------------------------------------------------------
  // DIRECTOR
  // ---------------------------------------------------------------------
  let shotIdx = -1, shotT = 0, done = false;
  if (import.meta.env.DEV) window.__ff = sec => { shotT += sec; };

  function applySet(name) {
    Object.entries(sets).forEach(([k, s]) => { s.group.visible = k === name; });
    s1.visible = name === 'room';
    const s = sets[name];
    scene.fog = s.fog; scene.background = s.background;
    // slight lift over the explorable grade so faces read on camera
    ambient.intensity = (s.ambient ?? 0.4) + 0.18;
  }

  function nextShot() {
    shotIdx++;
    if (shotIdx >= SHOTS.length) {
      done = true;
      setCaption('');
      onEnd();
      return;
    }
    const sh = SHOTS[shotIdx];
    shotT = 0;
    if (import.meta.env.DEV) window.__shot = shotIdx;
    applySet(sh.set);
    sh.enter();
    setCaption(sh.caption);
    if (sh.cue) cue(sh.cue);
  }

  return {
    group, interactables: [],
    playerStart: V3(0, 0, 3),
    bounds: { minX: -1, maxX: 1, minZ: -1, maxZ: 1 },
    fog: roomSet.fog, background: roomSet.background, ambient: 0.3,
    skip() { if (!done) { done = true; setCaption(''); onEnd(); } },
    update(dt) {
      if (done) return;
      if (shotIdx === -1) { nextShot(); return; }
      shotT += dt;
      const sh = SHOTS[shotIdx];
      // keep underlying set animations alive (lamp flicker, banners, rain…)
      sets[sh.set].update && sets[sh.set].update(dt);
      s1Anim(dt);
      [boy, father, grandfather, grandma].forEach(a => { if (a.visible) a.userData.update(dt); });
      sh.tick(shotT, Math.min(1, shotT / sh.dur));
      if (shotT >= sh.dur) nextShot();
    },
  };
}
