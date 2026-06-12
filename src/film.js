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

  // ---------------------------------------------------------------------
  // ACTORS
  // ---------------------------------------------------------------------
  const boy = createAvatar('return');          // the protagonist
  const father = createAvatar('silence');      // imposing, military-rigid
  father.scale.set(1.3, 1.18, 1.3);
  const grandfather = createAvatar('silence'); // the flashback
  grandfather.scale.set(1.2, 1.1, 1.2);
  const grandma = createAvatar('return');
  grandma.scale.set(0.92, 0.88, 0.92);
  [boy, father, grandfather, grandma].forEach(a => { a.visible = false; group.add(a); });

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

  const SHOTS = [
    { // 1 — the clomp
      dur: 7, set: 'room', cue: 'tension',
      caption: 'His clomp signaled that he would soon enter my room.',
      enter() { hideActors(); place(boy, -1.8, -2.0, 0.5); cue('steps'); },
      tick(t, p) { camPath(cam, V3(-0.5, 1.5, 3.4), V3(0.4, 1.4, 2.2), V3(1.6, 1.2, D / 2), p); },
    },
    { // 2 — the ironing-board desk
      dur: 7, set: 'room',
      caption: 'The ironing board I used as a desk felt on the verge of collapsing as I planned my Quechua lessons.',
      enter() { hideActors(); place(boy, -1.5, -2.1, -0.6); },
      tick(t, p) {
        boy.children[0].rotation.x = 0.22; // leaning over the desk
        camPath(cam, V3(0.6, 1.3, -0.6), V3(-0.4, 1.15, -1.5), V3(-1.8, 0.95, -2.8), p);
      },
    },
    { // 3 — the father bursts in
      dur: 8, set: 'room', cue: 'knock',
      caption: '“¡¿Qué estupidez haces?! Those dialects you learn are useless,” my father said — a Quechua speaker himself.',
      enter() { hideActors(); place(boy, -1.5, -2.1, -0.6); place(father, 1.6, 2.6, Math.PI); },
      tick(t, p) {
        father.position.z = lerp(2.6, 0.4, ease(Math.min(1, t / 3)));   // advancing
        camPath(cam, V3(-0.8, 0.9, -1.6), V3(-1.2, 0.8, -1.2), V3(1.6, 1.9, 1.4), p); // low angle up at him
      },
    },
    { // 4 — quietness or the chicote
      dur: 8, set: 'room',
      caption: 'I did not respond. Anything but quietness meant dozens of hits with his chicote — or freezing showers, for challenging the masculinity the army imposed on him.',
      enter() { hideActors(); place(boy, -1.5, -2.1, -0.4); place(father, 0.6, 0.2, Math.PI * 0.92); },
      tick(t, p) {
        // slow orbit around the small boy, father looming beyond
        const a = lerp(-0.6, 0.9, ease(p)), r = 2.2;
        cam.position.set(-1.5 + Math.sin(a) * r, 1.35, -2.1 + Math.cos(a) * r);
        cam.lookAt(-1.5, 1.0, -2.1);
      },
    },
    { // 5 — the internal scream
      dur: 6, set: 'room',
      caption: 'I held back my tears and internally screamed to ignore his insults.',
      enter() {
        hideActors(); place(boy, -1.5, -2.1, 0);
        insults.forEach((s, i) => { s.visible = true; s.position.set(-1.5 + (i - 1) * 1.1, 1.6 + (i % 2) * 0.5, -1.2); });
      },
      tick(t, p) {
        insults.forEach((s, i) => {
          s.material.opacity = 0.25 + Math.abs(Math.sin(t * 2.2 + i * 1.4)) * 0.75;
          s.position.y = 1.6 + (i % 2) * 0.5 + Math.sin(t * 1.3 + i) * 0.1;
        });
        camPath(cam, V3(-1.5, 1.5, 0.4), V3(-1.5, 1.45, -0.6), V3(-1.5, 1.5, -2.1), p);
      },
    },
    { // 6 — the prayer
      dur: 7, set: 'room', cue: 'prayer',
      caption: 'Like never before, I prayed with sincerity — and asked for my father to be forgiven. I had nothing left but faith.',
      enter() { hideActors(); place(boy, 0, -1.5, Math.PI); boy.scale.set(1, 0.82, 1); },
      tick(t, p) {
        camPath(cam, V3(0, 3.0, 0.6), V3(0, 2.2, -0.2), V3(0, 0.9, -1.5), p); // descending overhead — grace
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
      enter() { hideActors(); place(boy, 0, -2, 0); },
      tick(t, p) {
        boy.position.z = lerp(-2, 1.2, ease(p)); // walking out of the grey, toward us
        camPath(cam, V3(0, 1.3, 3.4), V3(0, 1.25, 3.0), V3(0, 1.2, boy.position.z), p);
      },
    },
    { // 9 — grandma and the chuta
      dur: 8, set: 'valley', cue: 'warmth',
      caption: 'I looked at my grandma for strength, as I had for years. We baked chuta — sweet bread — while learning new Quechua vocabulary.',
      enter() { hideActors(); place(grandma, -5.2, -8.2, 0.6); place(boy, -4.2, -7.6, -0.5); },
      tick(t, p) { camPath(cam, V3(-2.2, 1.6, -4.4), V3(-3.4, 1.4, -5.6), V3(-5, 1.2, -8.6), p); },
    },
    { // 10 — the words that sheltered him
      dur: 8, set: 'valley', cue: 'chime',
      caption: 'sinchi — bold. sumaq — handsome. umasapa — intelligent, a bit stubborn. Those words took me under their wing at my lowest point.',
      enter() { hideActors(); place(boy, -4.2, -7.6, -0.5); place(grandma, -5.2, -8.2, 0.6); },
      tick(t, p) { camPath(cam, V3(-4.2, 1.4, -5.2), V3(-4.2, 2.2, -4.6), V3(-4.2, 2.6, -9), p); },
    },
    { // 11 — huaynito
      dur: 8, set: 'valley', cue: 'warmth',
      caption: "Knitting vicuña wool. Dancing Huaycapata's huaynito. I overcame my stage fright — my fear of expressing my true self.",
      enter() { hideActors(); place(boy, 0, -15, 0); },
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
        hideActors(); place(boy, 3, -8, -0.4);
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
      enter() { hideActors(); place(boy, -1.5, -2.1, -0.6); place(father, 1.6, 2.9, Math.PI); },
      tick(t, p) {
        // the father stays at the threshold this time — present, not violent
        camPath(cam, V3(-1.2, 1.4, -1.2), V3(0.2, 1.45, 0.2), V3(1.6, 1.5, 2.9), p);
      },
    },
    { // 14 — identity in all its forms
      dur: 9, set: 'valley', cue: 'warmth',
      caption: 'My identity feels less hidden, my language less threatened, my people less forgotten. Indigenous, Latino, bisexual — I embrace my authenticity in all its forms, building a globalized, positive masculinity.',
      enter() { hideActors(); place(boy, 0, -14, 0); },
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

  function applySet(name) {
    Object.entries(sets).forEach(([k, s]) => { s.group.visible = k === name; });
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
      [boy, father, grandfather, grandma].forEach(a => { if (a.visible) a.userData.update(dt); });
      sh.tick(shotT, Math.min(1, shotT / sh.dur));
      if (shotT >= sh.dur) nextShot();
    },
  };
}
