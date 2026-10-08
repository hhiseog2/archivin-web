// Builds public/logo/archivin-stitch-black.png from the white stitch logo for the white intro (client request).
// - colour = ink #1c1d21
// - faint stitches strengthened (alpha × 1.6 − 0.12)
// - the N's thread is ~11% thinner in the photographed logo (3.2px vs ~3.6px elsewhere), so it is thickened
//   by a fraction of a pixel there, fading in from the left so there's no seam.
// Run: node scripts/make-intro-logo.mjs  — TODO: replace with the client's vector logo when it arrives.
import sharp from 'sharp';

const SRC = 'public/logo/archivin-stitch-white.png';
const OUT = 'public/logo/archivin-stitch-black.png';
const UP = 4; // work at 4× so the thickening can be a fraction of a source pixel
const GROW = Number(process.env.GROW ?? 2); // extra thread on each side, in 4× pixels (2 → 0.5 source px)
const N_FROM = 940; // source x where the N thickening starts fading in…
const N_FULL = 985; // …and where it is at full strength (the N runs to the right edge)

const boost = (a) => Math.min(1, Math.max(0, a * 1.6 - 0.12));

const src = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = src.info.width;
const H = src.info.height;

// Thickened alpha: upscale, grow the thread by GROW px (max filter), scale back down.
const up = await sharp(SRC)
  .ensureAlpha()
  .resize(W * UP, H * UP, { kernel: 'lanczos3' })
  .extractChannel('alpha')
  .raw()
  .toBuffer({ resolveWithObject: true });
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
    const w = t * t * (3 - 2 * t); // smoothstep
    const base = src.data[i * 4 + 3] / 255;
    const grown = Math.max(base, thick[i] / 255);
    out[i * 4] = 0x1c;
    out[i * 4 + 1] = 0x1d;
    out[i * 4 + 2] = 0x21;
    out[i * 4 + 3] = Math.round(boost(base + w * (grown - base)) * 255);
  }
}
await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(OUT);
console.log(`${OUT} written (${W}x${H}, N grow ${GROW}/${UP}px)`);
