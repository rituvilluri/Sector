// Generates PWA icons (192x192 and 512x512) as PNG using only Node built-ins
// Run once: node scripts/gen-icons.mjs
import { createCanvas } from 'canvas';
import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

function draw(size) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0E0E0E';
  ctx.fillRect(0, 0, size, size);

  // Gold accent border
  ctx.strokeStyle = '#2A2A2A';
  ctx.lineWidth = size * 0.015;
  ctx.strokeRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92);

  // SECTOR lap wave
  const s = size;
  ctx.beginPath();
  ctx.moveTo(s * 0.12, s * 0.62);
  ctx.bezierCurveTo(s * 0.28, s * 0.62, s * 0.36, s * 0.38, s * 0.5, s * 0.38);
  ctx.bezierCurveTo(s * 0.64, s * 0.38, s * 0.72, s * 0.62, s * 0.88, s * 0.38);
  ctx.strokeStyle = '#D4A843';
  ctx.lineWidth   = size * 0.055;
  ctx.lineCap     = 'round';
  ctx.stroke();

  // Dots at each end
  ctx.fillStyle = '#D4A843';
  ctx.beginPath(); ctx.arc(s * 0.12, s * 0.62, s * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.88, s * 0.38, s * 0.05, 0, Math.PI * 2); ctx.fill();

  return canvas.toBuffer('image/png');
}

const outDir = join(__dir, '../public/icons');

try {
  writeFileSync(join(outDir, 'icon-192.png'), draw(192));
  writeFileSync(join(outDir, 'icon-512.png'), draw(512));
  console.log('✓ Icons generated: public/icons/icon-192.png, icon-512.png');
} catch (e) {
  console.error('canvas package not available — place icons manually in public/icons/');
}
