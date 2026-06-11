// The Mathias avatar — one body, three renderings.
// U1 "The Silence": grey, rigid, clipped movement.
// U2 "The Break":   half-rendered wireframe, flickering.
// U3 "The Return":  warm, textured poncho, alive and swaying.
import * as THREE from 'three';

const SKIN = 0xb07a52;
const HAIR = 0x1c1410;

function texturePattern() {
  // Andean textile pattern as a canvas texture (terracotta / gold / deep red bands with diamonds)
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const x = c.getContext('2d');
  const bands = ['#a3402f', '#c96f4a', '#c9a227', '#5a2a2a', '#c96f4a'];
  bands.forEach((col, i) => {
    x.fillStyle = col;
    x.fillRect(0, i * 26, 128, 26);
  });
  x.fillStyle = '#f0e6d2';
  for (let i = 0; i < 8; i++) {
    const cx = 8 + i * 16, cy = 64;
    x.beginPath();
    x.moveTo(cx, cy - 7); x.lineTo(cx + 7, cy); x.lineTo(cx, cy + 7); x.lineTo(cx - 7, cy);
    x.closePath(); x.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function createAvatar(mode = 'return') {
  const group = new THREE.Group();

  let bodyMat, skinMat, hairMat, ponchoMat;
  if (mode === 'silence') {
    bodyMat = new THREE.MeshStandardMaterial({ color: 0x5a5d63, roughness: 0.95 });
    skinMat = new THREE.MeshStandardMaterial({ color: 0x8a8d92, roughness: 0.95 });
    hairMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 1 });
    ponchoMat = new THREE.MeshStandardMaterial({ color: 0x4a5246, roughness: 1 }); // military green
  } else if (mode === 'break') {
    const wire = { wireframe: true, transparent: true, opacity: 0.7 };
    bodyMat = new THREE.MeshBasicMaterial({ color: 0x66ccff, ...wire });
    skinMat = new THREE.MeshBasicMaterial({ color: 0x99ddff, ...wire });
    hairMat = new THREE.MeshBasicMaterial({ color: 0x4488cc, ...wire });
    ponchoMat = new THREE.MeshBasicMaterial({ color: 0x66ccff, ...wire });
  } else {
    bodyMat = new THREE.MeshStandardMaterial({ color: 0x8a4a3a, roughness: 0.8 });
    skinMat = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.7 });
    hairMat = new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.9 });
    ponchoMat = new THREE.MeshStandardMaterial({ map: texturePattern(), roughness: 0.85 });
  }

  // torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.85, 8), bodyMat);
  torso.position.y = 1.05;
  group.add(torso);

  // poncho — a wide flattened cone over the torso
  const poncho = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.75, 8, 1, true), ponchoMat);
  poncho.position.y = 1.18;
  group.add(poncho);

  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 14), skinMat);
  head.position.y = 1.74;
  group.add(head);

  // hair / chullo hat in U3
  if (mode === 'return') {
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.26, 12), ponchoMat);
    hat.position.y = 1.93;
    group.add(hat);
  } else {
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.215, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), hairMat);
    hair.position.y = 1.77;
    group.add(hair);
  }

  // legs
  const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 6);
  const legL = new THREE.Mesh(legGeo, bodyMat); legL.position.set(-0.13, 0.32, 0);
  const legR = new THREE.Mesh(legGeo, bodyMat); legR.position.set(0.13, 0.32, 0);
  group.add(legL, legR);

  // arms
  const armGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.6, 6);
  const armL = new THREE.Mesh(armGeo, skinMat); armL.position.set(-0.36, 1.1, 0);
  const armR = new THREE.Mesh(armGeo, skinMat); armR.position.set(0.36, 1.1, 0);
  group.add(armL, armR);

  group.traverse(o => { if (o.isMesh) { o.castShadow = true; } });

  const state = { t: Math.random() * 10 };
  group.userData.update = (dt) => {
    state.t += dt;
    if (mode === 'silence') {
      // rigid: barely breathes, clipped micro-twitches
      const clip = Math.floor(state.t * 2) % 2 === 0 ? 0.004 : 0;
      torso.scale.y = 1 + clip;
      group.rotation.y += 0; // stares fixed
    } else if (mode === 'break') {
      // flicker: random visibility dropouts, jitter
      const flick = Math.random();
      group.visible = flick > 0.12;
      group.position.x += (Math.random() - 0.5) * 0.01;
      [bodyMat, skinMat, hairMat, ponchoMat].forEach(m => m.opacity = 0.4 + Math.random() * 0.5);
    } else {
      // alive: gentle sway and breath
      const breathe = Math.sin(state.t * 1.6) * 0.02;
      torso.scale.set(1 + breathe, 1 + breathe * 0.5, 1 + breathe);
      group.rotation.y = Math.sin(state.t * 0.4) * 0.15;
      head.rotation.z = Math.sin(state.t * 0.7) * 0.06;
      armL.rotation.x = Math.sin(state.t * 1.6) * 0.08;
      armR.rotation.x = -Math.sin(state.t * 1.6) * 0.08;
    }
  };

  return group;
}
