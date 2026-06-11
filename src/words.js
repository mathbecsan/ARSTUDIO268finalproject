// Quechua words as floating light in the 3D world — language as landscape.
import * as THREE from 'three';

export const WORDS = [
  { q: 'sinchi',        en: 'bold' },
  { q: 'sumaq',         en: 'handsome / beautiful' },
  { q: 'umasapa',       en: 'intelligent, a bit stubborn' },
  { q: 'kallpacharikuy', en: 'resilience' },
  { q: 'sunqulliy',     en: 'confidence' },
  { q: 'sullullchay',   en: 'commitment' },
];

export function makeWordSprite(word, { color = '#f4e3b2', sub = '', scale = 3 } = {}) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 192;
  const x = c.getContext('2d');
  x.clearRect(0, 0, 512, 192);

  // soft glow
  x.shadowColor = color;
  x.shadowBlur = 28;
  x.fillStyle = color;
  x.font = 'italic 64px Georgia, serif';
  x.textAlign = 'center';
  x.fillText(word, 256, 92);

  if (sub) {
    x.shadowBlur = 8;
    x.fillStyle = 'rgba(255,255,255,0.65)';
    x.font = '26px Georgia, serif';
    x.fillText(sub, 256, 142);
  }

  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scale, scale * 0.375, 1);
  return sprite;
}
