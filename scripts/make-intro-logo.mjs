// Intro logo from the handoff's navy stitch logo (archivin-stitch-navy-intro.png, v5), recoloured black
// (client request: the whole intro in black, ink #1c1d21) and evened out.
// The N's thread is ~17% thinner in the photographed logo (≈3.3px vs ≈3.9px elsewhere), so the N is thickened
// by a fraction of a pixel, fading in from the left so there's no seam.
// Run: node scripts/make-intro-logo.mjs <handoff navy-intro.png> [out.png]  — TODO(client): replace with a vector logo when it arrives.
import sharp from 'sharp';

const SRC = process.argv[2];
const OUT = process.argv[3] ?? 'public/logo/archivin-stitch-black-intro.png';
const COLOR = (process.env.COLOR ?? '#1c1d21').match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16));
const UP = 4; // work at 4× so the thickening can be a fraction of a source pixel
const GROW = Number(process.env.GROW ?? 2); // extra thread on each side, in 4× pixels
const STRENGTH = Number(process.env.STRENGTH ?? 0.75); // how much of the grown thread to blend in (tuned to ≈3.9px)
const N_FROM = 870; // source x where the N thickening starts fading in…
const N_FULL = 900; // …and where it is at full strength (the N runs to the right edge)

const src = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = src.info.width;
const H = src.info.height;

const up = await sharp(SRC).ensureAlpha().resize(W * UP, H * UP, { kernel: 'lanczos3' }).extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
const UW = up.info.width;
const UH = up.info.height;
let a = up.data;
for (let pass = 0; pass < GROW; pass++) {
  const next = Buffer.alloc(a.length);
  for (let y = 0; y < UH; y++) {
    for (let x = 0; x < UW; x++) {
      let m = a[y * UW + x];
      if (x > 0) m = Math.max(m, a[y * UW + x - 1]);
      if (x < UW - 1) m = Math.max(m, a[y * UW + x + 1]);
      if (y > 0) m = Math.max(m, a[(y - 1) * UW + x]);
      if (y < UH - 1) m = Math.max(m, a[(y + 1) * UW + x]);
      next[y * UW + x] = m;
    }
  }
  a = next;
}
const thick = await sharp(a, { raw: { width: UW, height: UH, channels: 1 } }).resize(W, H, { kernel: 'lanczos3' }).extractChannel(0).raw().toBuffer();

const out = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const t = Math.min(1, Math.max(0, (x - N_FROM) / (N_FULL - N_FROM)));
    const w = STRENGTH * t * t * (3 - 2 * t); // smoothstep
    const base = src.data[i * 4 + 3] / 255;
    const grown = Math.max(base, thick[i] / 255);
    out[i * 4] = COLOR[0];
    out[i * 4 + 1] = COLOR[1];
    out[i * 4 + 2] = COLOR[2];
    out[i * 4 + 3] = Math.round((base + w * (grown - base)) * 255);
  }
}
await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(OUT);
console.log(`${OUT} written (${W}x${H}, N grow ${GROW}/${UP}px)`);
