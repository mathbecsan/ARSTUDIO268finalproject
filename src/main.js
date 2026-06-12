// KAWSAY RIPUY — The Journey of Living
// An interactive 3D environment in three universes.
import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildRoom, buildSilence, buildBreak, buildReturn, buildFinale, buildAfterall } from './worlds.js';
import { Soundscape } from './audio.js';
import { WORDS } from './words.js';
import { startTitleScene } from './titleScene.js';
import { playIntro } from './intro.js';
import { buildFilm } from './film.js';

// Animated Peruvian-sunset backdrop behind the title.
const stopTitleScene = startTitleScene(document.getElementById('title-canvas'));

// ---------------------------------------------------------------------------
// Tiny event bus — worlds emit story beats, main.js turns them into narration.
// ---------------------------------------------------------------------------
const events = {
  handlers: {},
  on(name, fn) { (this.handlers[name] ||= []).push(fn); },
  emit(name, data) { (this.handlers[name] || []).forEach(fn => fn(data)); },
};

// ---------------------------------------------------------------------------
// Renderer / camera
// ---------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 400);
const EYE = 1.65;

const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// ---------------------------------------------------------------------------
// Cinematic post-processing — Style DNA: handcrafted Andean magical realism,
// oil-lamp warmth and starlight, lit like a moving woodcut.
//   RenderPass → Bloom (glow on lamps/words/portals) → Grain+Vignette → Output
// ---------------------------------------------------------------------------
const FilmGrainVignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.055 },
    uVignette: { value: 0.62 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime, uGrain, uVignette;
    varying vec2 vUv;
    float rand(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      // organic film grain (animated)
      float g = (rand(vUv + fract(uTime)) - 0.5) * uGrain;
      color.rgb += g;
      // soft cinematic vignette
      float d = length(vUv - 0.5);
      color.rgb *= 1.0 - smoothstep(0.32, 0.82, d) * uVignette;
      // gentle warm lift in highlights, cool in shadows (teal-orange grade)
      float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb += vec3(0.018, 0.006, -0.012) * (lum - 0.4);
      gl_FragColor = color;
    }
  `,
};

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.55, // strength
  0.6,  // radius
  0.82  // threshold — only bright emissives bloom
);
composer.addPass(bloomPass);
const filmPass = new ShaderPass(FilmGrainVignetteShader);
composer.addPass(filmPass);
composer.addPass(new OutputPass());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
const $ = id => document.getElementById(id);
const subtitleEl = $('subtitle'), hintEl = $('hint'), chapterEl = $('chapter'),
      fadeEl = $('fade'), trackerEl = $('word-tracker'), finaleEl = $('finale-text');

let subtitleTimer = null;
const subtitleQueue = [];
let subtitleBusy = false;

function say(text, seconds = 5) {
  subtitleQueue.push({ text, seconds });
  if (!subtitleBusy) nextSubtitle();
}
function nextSubtitle() {
  const item = subtitleQueue.shift();
  if (!item) { subtitleBusy = false; subtitleEl.classList.remove('visible'); return; }
  subtitleBusy = true;
  subtitleEl.innerHTML = item.text;
  subtitleEl.classList.add('visible');
  clearTimeout(subtitleTimer);
  subtitleTimer = setTimeout(() => {
    subtitleEl.classList.remove('visible');
    subtitleTimer = setTimeout(nextSubtitle, 600);
  }, item.seconds * 1000);
}

function setChapter(text) {
  chapterEl.classList.remove('visible');
  setTimeout(() => { chapterEl.textContent = text; chapterEl.classList.add('visible'); }, 600);
}
function setHint(text) {
  if (!text) { hintEl.classList.remove('visible'); return; }
  hintEl.innerHTML = text;
  hintEl.classList.add('visible');
}

// word tracker UI
trackerEl.innerHTML = WORDS.map((w, i) => `<div class="word" id="w-${i}">${w.q}</div>`).join('');

// ---------------------------------------------------------------------------
// Player controls — drag to look, WASD / arrows to walk.
// ---------------------------------------------------------------------------
const player = {
  pos: new THREE.Vector3(0, 0, 3),
  yaw: 0, pitch: 0,
  keys: {},
  enabled: false,
};

document.addEventListener('keydown', e => { player.keys[e.code] = true; });
document.addEventListener('keyup', e => { player.keys[e.code] = false; });

let dragging = false, lastX = 0, lastY = 0, dragDist = 0;
renderer.domElement.addEventListener('pointerdown', e => {
  dragging = true; dragDist = 0; lastX = e.clientX; lastY = e.clientY;
});
window.addEventListener('pointermove', e => {
  if (!dragging || !player.enabled) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  dragDist += Math.abs(dx) + Math.abs(dy);
  lastX = e.clientX; lastY = e.clientY;
  player.yaw -= dx * 0.004;
  player.pitch = THREE.MathUtils.clamp(player.pitch - dy * 0.003, -1.2, 1.2);
});
window.addEventListener('pointerup', e => {
  const wasClick = dragDist < 8;
  dragging = false;
  if (wasClick && player.enabled) handleClick(e);
});

function movePlayer(dt) {
  if (!player.enabled || !currentWorld) return;
  const speed = 4.2;
  const fwd = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const move = new THREE.Vector3();
  if (player.keys.KeyW || player.keys.ArrowUp) move.add(fwd);
  if (player.keys.KeyS || player.keys.ArrowDown) move.sub(fwd);
  if (player.keys.KeyA || player.keys.ArrowLeft) move.sub(right);
  if (player.keys.KeyD || player.keys.ArrowRight) move.add(right);
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed * dt);
    player.pos.add(move);
    const b = currentWorld.bounds;
    player.pos.x = THREE.MathUtils.clamp(player.pos.x, b.minX, b.maxX);
    player.pos.z = THREE.MathUtils.clamp(player.pos.z, b.minZ, b.maxZ);
  }
  camera.position.set(player.pos.x, EYE, player.pos.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
}

// ---------------------------------------------------------------------------
// Raycast interaction
// ---------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
function handleClick(e) {
  if (!currentWorld) return;
  const ndc = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  raycaster.far = 14;
  for (const item of currentWorld.interactables) {
    if (item.requiresPortals && !portalsOpen) continue;
    const hits = raycaster.intersectObject(item.mesh, true);
    if (hits.length > 0) { item.onInteract(); return; }
  }
}

// ---------------------------------------------------------------------------
// World management
// ---------------------------------------------------------------------------
const sound = new Soundscape();
let currentWorld = null;
let currentName = '';
let portalsOpen = false;
let roomWorld = null; // kept so portal state persists
const collected = new Set();
let finaleStarted = false;
let afterallUnlocked = false;

function fadeTo(black, ms = 1200) {
  return new Promise(res => {
    fadeEl.style.transition = `opacity ${ms}ms ease`;
    fadeEl.classList.toggle('dark', black);
    setTimeout(res, ms);
  });
}

async function switchWorld(name) {
  await fadeTo(true);
  sound.stopAll(1);

  if (currentWorld) scene.remove(currentWorld.group);

  let world;
  if (name === 'room') {
    if (!roomWorld) roomWorld = buildRoom(events);
    world = roomWorld;
    if (portalsOpen) world.showPortals();
  }
  else if (name === 'silence') world = buildSilence(events);
  else if (name === 'break') world = buildBreak(events);
  else if (name === 'return') world = buildReturn(events);
  else if (name === 'finale') world = buildFinale();
  else if (name === 'afterall') world = buildAfterall(events);
  else if (name === 'film') world = buildFilm({
    scene, ambient, camera,
    setCaption: filmCaption,
    cue: filmCue,
    onEnd: () => {
      document.body.classList.remove('film-mode');
      $('film-skip').style.display = 'none';
      setTimeout(() => switchWorld('room'), 600);
    },
  });

  scene.add(world.group);
  scene.fog = world.fog;
  scene.background = world.background;
  ambient.intensity = world.ambient;

  player.pos.copy(world.playerStart);
  player.yaw = 0; player.pitch = 0;
  camera.position.set(player.pos.x, EYE, player.pos.z);

  currentWorld = world;
  currentName = name;

  // per-world cinematic grade — bloom strength & grain shape the mood
  const grade = {
    room:    { bloom: 0.5,  grain: 0.06,  vig: 0.7 },
    silence: { bloom: 0.25, grain: 0.085, vig: 0.78 }, // flat, cold, heavy vignette
    break:   { bloom: 0.9,  grain: 0.11,  vig: 0.6 },  // electric glow, noisy
    return:  { bloom: 0.7,  grain: 0.04,  vig: 0.5 },  // warm, clean, luminous
    finale:  { bloom: 1.0,  grain: 0.05,  vig: 0.55 }, // radiant constellations
    afterall:{ bloom: 0.65, grain: 0.07,  vig: 0.68 },
    film:    { bloom: 0.8,  grain: 0.065, vig: 0.72 }, // full cinematic grade
  }[name] || { bloom: 0.55, grain: 0.055, vig: 0.62 };
  gsap.to(bloomPass, { strength: grade.bloom, duration: 2.5, ease: 'power2.out' });
  gsap.to(filmPass.uniforms.uGrain, { value: grade.grain, duration: 2.5 });
  gsap.to(filmPass.uniforms.uVignette, { value: grade.vig, duration: 2.5 });

  await fadeTo(false);

  // per-world entry narration + sound
  if (name === 'room') {
    setChapter('The Room — One Night in Rural Peru');
    sound.startRoomTension();
    trackerEl.classList.remove('visible');
    if (!portalsOpen) {
      say('His clomp signaled that he would soon enter my room.', 6);
      say('The ironing board I used as a desk felt on the verge of collapsing.', 6);
      setHint('Drag to look &nbsp;·&nbsp; W A S D to walk &nbsp;·&nbsp; Click objects to remember');
    } else {
      setHint('Click a portal to enter a universe');
    }
  } else if (name === 'silence') {
    setChapter('Universe 1 — The Silence (What Was)');
    sound.startColdWind();
    say('The boy who learned to disappear.', 5);
    say('Stoicism. Dominance. The rejection of anything tender.', 6);
    setHint('The doors here do not open &nbsp;·&nbsp; Press R to return to the room');
  } else if (name === 'break') {
    setChapter('Universe 2 — The Break (What Could Have Been)');
    sound.startGlitch();
    say('A world that never let him arrive.', 5);
    say('This universe does not linger. It is a glimpse — a warning, and an act of grief.', 7);
    setHint('Do not stay long &nbsp;·&nbsp; Press R to return to the room');
    // The Break ejects you — it is a glimpse, not a home.
    setTimeout(() => {
      if (currentName === 'break') {
        say('You cannot stay here. No one could.', 5);
        setTimeout(() => { if (currentName === 'break') switchWorld('room'); }, 4000);
      }
    }, 50000);
  } else if (name === 'return') {
    setChapter('Universe 3 — The Return (What Is)');
    sound.startAndeanWarmth();
    trackerEl.classList.add('visible');
    say('The boy who chose the language. The culture. The grandmother baking chuta.', 7);
    say('Six Quechua words float in this valley. Gather them.', 6);
    setHint('Click the floating words to gather them &nbsp;·&nbsp; Press R to return');
  } else if (name === 'finale') {
    setChapter('');
    setHint('');
    trackerEl.classList.remove('visible');
    sound.finaleChord();
    runFinale();
  } else if (name === 'film') {
    setChapter('KAWSAY RIPUY — THE FILM');
    setHint('');
    trackerEl.classList.remove('visible');
    player.enabled = false;
    document.body.classList.add('film-mode');
    const skip = $('film-skip');
    skip.style.display = 'block';
    skip.onclick = () => currentWorld && currentWorld.skip && currentWorld.skip();
  } else if (name === 'afterall') {
    setChapter("THE AFTERMATH — A Mother's Reckoning");
    setHint('');
    trackerEl.classList.remove('visible');
    player.enabled = false;
    say('A mother remembers. A mother grieves. A mother transforms grief into light.', 7);
    sound.startAftermallTheme();
    runAftermall();
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'KeyR' && ['silence', 'break', 'return'].includes(currentName) && !finaleStarted) {
    switchWorld('room');
  }
  // Exhibition docent controls: jump directly between chapters.
  if (finaleStarted || !player.enabled) return;
  if (e.code === 'Digit0') switchWorld('room');
  if (e.code === 'Digit1') { portalsOpen = true; switchWorld('silence'); }
  if (e.code === 'Digit2') { portalsOpen = true; switchWorld('break'); }
  if (e.code === 'Digit3') { portalsOpen = true; switchWorld('return'); }
});

// hooks for installation control software / automated testing
window.__kawsay = { events, switchWorld: name => switchWorld(name) };

// ---------------------------------------------------------------------------
// Story beats
// ---------------------------------------------------------------------------
events.on('desk', () => {
  say('I pressed my hand hard against the paper, planning my Quechua lessons.', 6);
  say('<i>“¡¿Qué estupidez haces?! Those dialects you learn are useless,”</i> my father said — despite being a Quechua speaker himself.', 8);
  sound.footsteps(4, 0.65);
});
events.on('chicote', () => {
  say('The chicote — an Andean leather whip from his Quechuan uncle.', 6);
  say('Anything other than quietness would guarantee dozens of hits. <i>Cobarde. Imbécil. Estúpido.</i>', 8);
});
events.on('lamp', () => {
  say('A kerosene lamp. An adobe house in rural Peru.', 5);
  say('The night of my mother’s miscarriage. My father, paralyzed by grief and fear. Silence where words should have been.', 9);
  say('From that night, three possible Mathias emerge.', 6);
});
events.on('mirror', () => {
  if (portalsOpen) { say('What does it take to break that mirror?', 5); return; }
  portalsOpen = true;
  sound.footsteps(5, 0.55);
  say('He mirrored his own father. I was meant to mirror him.', 7);
  say('This project asks: what does it take to break that mirror?', 7);
  setTimeout(() => {
    roomWorld.showPortals();
    say('Three doors. Three versions of one life. Choose.', 7);
    setHint('Click a portal to enter a universe');
  }, 7000);
});
events.on('enterUniverse', name => switchWorld(name));

events.on('silenceDoor', () => {
  say('Closed. Like every word he never said.', 5);
});
events.on('silenceAvatar', () => {
  say('He never speaks Quechua again.', 5);
  say('He is safe — and completely lost.', 6);
});

events.on('breakAvatar', () => {
  say('The boy who broke under the pressure. Half-rendered. Unfinished.', 7);
  say('A grief for the version of me that almost was.', 6);
});
events.on('breakLetter', () => {
  say('The Stanford acceptance never came. The violence at home continued.', 7);
});

events.on('kitchen', () => {
  say('We baked sweet bread — <i>chuta</i> — while learning new Quechua vocabulary.', 7);
  say('Those words let me escape from harassment, and took me under their wing at my lowest point.', 8);
});
events.on('returnAvatar', () => {
  say('Masculinity here is not absence of feeling — it is presence.', 7);
  say('To become someone your ancestors couldn’t have imagined, without erasing who they were.', 8);
});

events.on('wordCollected', ({ word, index }) => {
  collected.add(index);
  sound.chime(collected.size - 1);
  document.getElementById(`w-${index}`)?.classList.add('found');
  say(`<b style="color:#c9a227">${word.q}</b> — ${word.en}`, 4);
  if (collected.size === WORDS.length && !finaleStarted) {
    finaleStarted = true;
    say('The words are all here now. Look up.', 6);
    setTimeout(() => switchWorld('finale'), 6500);
  }
});

// ---------------------------------------------------------------------------
// Finale sequence
// ---------------------------------------------------------------------------
function runFinale() {
  player.enabled = false;
  // cinematic: slow pull back and tilt up into the sky
  const camState = { y: EYE, z: 6, pitch: 0 };
  camera.position.set(0, camState.y, camState.z);
  camera.rotation.set(0, 0, 0);
  gsap.to(camState, {
    y: 9, z: 16, pitch: 0.55, duration: 26, ease: 'power1.inOut',
    onUpdate: () => {
      camera.position.set(0, camState.y, camState.z);
      camera.rotation.x = camState.pitch;
    },
  });

  const lines = [
    'A woman who loses her husband is called a widow.',
    'A man who loses his wife is called a widower.',
    'A child who loses their parents is called an orphan.',
    'But do you know why there is no word for parents who lose their children?',
    'It is because there is no word that could ever express such sorrow.',
    '— · —',
    'Dad, my dearest Quechua people —',
    '<span class="final-quechua">Musqusqaykimanta astawan karutaraq chayasaqku.</span>',
    'We’ll get farther than you ever dreamed.',
  ];
  finaleEl.innerHTML = '';
  let t = 2500;
  lines.forEach((line, i) => {
    setTimeout(() => {
      finaleEl.innerHTML = `<p class="visible">${line}</p>`;
      if (i === lines.length - 1) {
        setTimeout(() => {
          finaleEl.innerHTML += `<p class="visible" style="margin-top:3rem; font-size:0.85rem; letter-spacing:0.35em; color:#888;">KAWSAY RIPUY — THE JOURNEY OF LIVING</p>`;
          // Act I complete — remember it so the title-screen shortcut appears next time.
          try { localStorage.setItem('kawsay_aftermath_unlocked', '1'); } catch (e) {}
          setTimeout(() => {
            $('aftermath-unlock').classList.remove('hidden');
            document.getElementById('enter-aftermath')?.addEventListener('click', () => {
              afterallUnlocked = true;
              $('aftermath-unlock').classList.add('hidden');
              switchWorld('afterall');
            });
            document.addEventListener('keydown', e => {
              if (e.code === 'Escape') {
                $('aftermath-unlock').classList.add('hidden');
                switchWorld('room');
              }
            }, { once: true });
          }, 5000);
        }, 5000);
      }
    }, t);
    t += i === 5 ? 3000 : 5200;
  });
}

function runAftermall() {
  const totalDuration = 41;
  let timer = 0;
  const updateAftermall = () => {
    timer += 0.016;
    if (timer > totalDuration) {
      say('The story ends where it began. A mother watches the stars.', 6);
      setTimeout(() => setHint('Press R to return to the room'), 500);
      player.enabled = true;
      return;
    }
    requestAnimationFrame(updateAftermall);
  };
  updateAftermall();
}

// ---------------------------------------------------------------------------
// Sound toggle (button + M key)
// ---------------------------------------------------------------------------
const muteBtn = $('mute-btn');
const ICON_ON = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
const ICON_OFF = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;

function applyMuteUI() {
  const muted = sound.muted;
  muteBtn.classList.toggle('muted', muted);
  $('mute-icon').innerHTML = muted ? ICON_OFF : ICON_ON;
  muteBtn.title = muted ? 'Sound off (M)' : 'Sound on (M)';
}
function toggleSound() {
  sound.init();
  sound.toggleMute();
  applyMuteUI();
}
muteBtn.addEventListener('click', e => { e.stopPropagation(); toggleSound(); });
document.addEventListener('keydown', e => {
  if (e.code === 'KeyM') toggleSound();
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Film mode helpers — direct caption control (bypasses the narration queue)
// and a score conductor that maps shot cues onto the procedural soundscape.
// ---------------------------------------------------------------------------
function filmCaption(text) {
  subtitleQueue.length = 0;
  clearTimeout(subtitleTimer);
  if (!text) { subtitleBusy = false; subtitleEl.classList.remove('visible'); return; }
  subtitleBusy = true; // the film owns the subtitle element while playing
  subtitleEl.innerHTML = text;
  subtitleEl.classList.add('visible');
}

function filmCue(name) {
  if (name === 'tension' || name === 'tension_soft') {
    if (!sound.layers.room) sound.startRoomTension();
    sound.stopLayer('wind', 1.5); sound.stopLayer('andean', 1.5);
  } else if (name === 'steps') {
    sound.footsteps(5, 0.7);
  } else if (name === 'scratch') {
    sound.startPencilScratch();
  } else if (name === 'scratch_stop') {
    sound.stopLayer('scratch', 0.25);
  } else if (name === 'clomp') {
    sound.clomp();
  } else if (name === 'knock') {
    sound.footsteps(3, 0.5);
  } else if (name === 'prayer') {
    sound.stopLayer('room', 2.5);
  } else if (name === 'quiet') {
    sound.stopLayer('room', 1.5); sound.stopLayer('wind', 1.5); sound.stopLayer('andean', 1.5);
  } else if (name === 'hope') {
    sound.chime(2);
  } else if (name === 'wind') {
    sound.stopLayer('room', 1.5); sound.stopLayer('andean', 1.5);
    if (!sound.layers.wind) sound.startColdWind();
  } else if (name === 'warmth') {
    sound.stopLayer('room', 1.5); sound.stopLayer('wind', 1.5);
    if (!sound.layers.andean) sound.startAndeanWarmth();
  } else if (name === 'chime') {
    sound.chime(1); setTimeout(() => sound.chime(3), 900); setTimeout(() => sound.chime(5), 1800);
  } else if (name === 'finale') {
    sound.stopAll(2);
    sound.finaleChord();
  }
}

// Audio cues for the opening animatic.
let introTension = false;
function introCue(name) {
  if (name === 'tension' && !introTension) { introTension = true; sound.startRoomTension(); }
  else if (name === 'steps') sound.footsteps(6, 0.5);
  else if (name === 'knock') setTimeout(() => sound.footsteps(3, 1.0), 900);
}

// Persistent Act II shortcut — appears on the title screen once Act I is finished.
const AFTERMATH_KEY = 'kawsay_aftermath_unlocked';
const aftermathShortcut = $('aftermath-shortcut');
if (localStorage.getItem(AFTERMATH_KEY) === '1') aftermathShortcut.classList.add('show');
aftermathShortcut.addEventListener('click', async (e) => {
  e.stopPropagation(); // don't also trigger the full Act I entry
  sound.init();
  applyMuteUI();
  muteBtn.classList.add('ready');
  afterallUnlocked = true;
  $('title-screen').classList.add('hidden');
  setTimeout(() => { stopTitleScene(); $('title-screen')?.remove(); }, 1600);
  await switchWorld('afterall');
});

// "Watch the Film" — the essay performed as an in-engine animated short.
$('film-btn').addEventListener('click', async (e) => {
  e.stopPropagation();
  sound.init();
  applyMuteUI();
  muteBtn.classList.add('ready');
  $('title-screen').classList.add('hidden');
  setTimeout(() => { stopTitleScene(); $('title-screen')?.remove(); }, 1600);
  await switchWorld('film');
});

$('title-screen').addEventListener('click', async () => {
  sound.init(); // user gesture unlocks audio
  applyMuteUI();
  muteBtn.classList.add('ready');
  $('title-screen').classList.add('hidden');
  setTimeout(() => { stopTitleScene(); $('title-screen')?.remove(); }, 1600);

  // Play the cinematic prologue, then enter the room.
  const introEl = $('intro');
  introEl.classList.remove('hidden');
  playIntro({
    canvas: $('intro-canvas'),
    captionEl: $('intro-caption'),
    skipBtn: $('intro-skip'),
    onCue: introCue,
    onDone: async () => {
      player.enabled = true;
      await switchWorld('room');     // builds the room behind the still-opaque intro
      introEl.classList.add('hidden'); // fade the prologue away to reveal it
      sound.footsteps(4, 0.8);
    },
  });
}, { once: true });

const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (currentWorld) currentWorld.update(dt);
  movePlayer(dt);
  filmPass.uniforms.uTime.value = clock.elapsedTime;
  composer.render();
}
loop();
