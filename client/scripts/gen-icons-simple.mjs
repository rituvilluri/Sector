// Generates minimal valid PNG icons without any dependencies.
// Uses raw PNG binary construction with zlib deflate.
import { writeFileSync } from 'fs';
import { deflateSync }   from 'zlib';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

function makePNG(size) {
  // Build RGBA pixel data: dark bg + gold wave
  const data = new Uint8Array(size * size * 4);

  // Fill bg #0E0E0E
  for (let i = 0; i < size * size; i++) {
    data[i * 4]     = 0x0E;
    data[i * 4 + 1] = 0x0E;
    data[i * 4 + 2] = 0x0E;
    data[i * 4 + 3] = 0xFF;
  }

  // Draw gold wave path (sampled)
  const steps = size * 4;
  for (let t = 0; t <= steps; t++) {
    const u  = t / steps;                      // 0 → 1
    const px = u * size;
    // Cubic bezier: same shape as SVG path
    const halfU = u * 2;
    let py;
    if (u < 0.5) {
      const tt = halfU;
      py = size * 0.62 * (1-tt)**3 +
           3 * size * 0.62 * (1-tt)**2 * tt +
           3 * size * 0.38 * (1-tt) * tt**2 +
           size * 0.38 * tt**3;
    } else {
      const tt = halfU - 1;
      py = size * 0.38 * (1-tt)**3 +
           3 * size * 0.38 * (1-tt)**2 * tt +
           3 * size * 0.62 * (1-tt) * tt**2 +
           size * 0.38 * tt**3;
    }

    // Stroke width ~5% of size
    const sw = Math.max(2, Math.round(size * 0.04));
    for (let dy = -sw; dy <= sw; dy++) {
      const x = Math.round(px), y = Math.round(py) + dy;
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (y * size + x) * 4;
        const alpha = 1 - Math.abs(dy) / sw;
        data[idx]     = Math.round(0xD4 * alpha + 0x0E * (1 - alpha));
        data[idx + 1] = Math.round(0xA8 * alpha + 0x0E * (1 - alpha));
        data[idx + 2] = Math.round(0x43 * alpha + 0x0E * (1 - alpha));
        data[idx + 3] = 0xFF;
      }
    }
  }

  // Draw end-point dots
  for (const [cx, cy] of [[size * 0.12, size * 0.62], [size * 0.88, size * 0.38]]) {
    const r = Math.max(3, Math.round(size * 0.05));
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const x = Math.round(cx + dx), y = Math.round(cy + dy);
          if (x >= 0 && x < size && y >= 0 && y < size) {
            const idx = (y * size + x) * 4;
            data[idx] = 0xD4; data[idx+1] = 0xA8; data[idx+2] = 0x43; data[idx+3] = 0xFF;
          }
        }
      }
    }
  }

  // PNG encode
  const rows = [];
  for (let y = 0; y < size; y++) {
    rows.push(0x00); // filter byte: None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      rows.push(data[i], data[i+1], data[i+2], data[i+3]);
    }
  }

  const raw       = deflateSync(Buffer.from(rows));
  const crc32     = buildCRC32();
  const PNG_SIG   = Buffer.from([137,80,78,71,13,10,26,10]);

  const IHDR = makeChunk('IHDR', Buffer.concat([
    u32be(size), u32be(size),
    Buffer.from([8, 6, 0, 0, 0]), // bit depth, RGBA, compress, filter, interlace
  ]), crc32);

  const IDAT = makeChunk('IDAT', raw, crc32);
  const IEND = makeChunk('IEND', Buffer.alloc(0), crc32);

  return Buffer.concat([PNG_SIG, IHDR, IDAT, IEND]);
}

function makeChunk(type, data, crc32) {
  const t    = Buffer.from(type, 'ascii');
  const len  = u32be(data.length);
  const crc  = u32be(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n); return b;
}

function buildCRC32() {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return (buf) => {
    let c = -1;
    for (const b of buf) c = table[(c ^ b) & 0xFF] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../public/icons');
writeFileSync(join(outDir, 'icon-192.png'), makePNG(192));
writeFileSync(join(outDir, 'icon-512.png'), makePNG(512));
console.log('✓  PWA icons written to public/icons/');
