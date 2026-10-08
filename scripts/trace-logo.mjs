// Traces the stitch logo into vector SVGs so it stays sharp on every screen (the client's logo is a 1124px JPEG).
//   input : the N-evened raster logo from scripts/make-intro-logo.mjs (alpha = thread)
//   output: public/logo/archivin-stitch-black.svg (intro, ink) and archivin-stitch-navy.svg (header, navy, thread
//           thickened with a matching stroke like the old pre-scaled header PNGs)
// Checked dash by dash against the original (independent reviewers, 4 regions × 2 lenses): every stitch kept as its
// own dash — including the pairs that almost touch (R foot, A apex, i corners) — and the thread stays ≈3.9px.
// One-off tool — potrace isn't a project dependency: `npm i --no-save potrace@2.1.8`, then
//   node scripts/trace-logo.mjs <raster.png>
import fs from 'node:fs';
import sharp from 'sharp';

const potrace = (await import('potrace')).default;
const SRC = process.argv[2];
const UP = 4; // trace at 4× the source
const THRESHOLD = 123; // thread = alpha ≥ 48% after softening (≈3.9px thread, as in the photo)
const BLUR = 0.4; // more softening bridges the 2px gaps between near-touching dashes (A apex, R leg)

const CORE = 210; // a dash's solid core (alpha ≥ 82%); stitches whose cores differ get a seam where they nearly touch
const SEAM = 1; // seam half-width in 4× px (≈0.5 source px in all), like the faint grey gap in the photo

const meta = await sharp(SRC).metadata();
const W = meta.width * UP;
const H = meta.height * UP;
const alpha = await sharp(SRC).ensureAlpha().extractChannel('alpha').resize(W, H, { kernel: 'lanczos3' }).blur(BLUR).raw().toBuffer();
const N = W * H;
const neighbours = (j) => {
  const x = j % W;
  return [x < W - 1 ? j + 1 : -1, x > 0 ? j - 1 : -1, j + W < N ? j + W : -1, j - W];
};

// 1. Cores: connected parts at alpha ≥ CORE (tiny ones ignored).
const label = new Int32Array(N).fill(-1);
let next = 0;
for (let i = 0; i < N; i++) {
  if (label[i] !== -1 || alpha[i] < CORE) continue;
  const px = [i];
  label[i] = next;
  for (let p = 0; p < px.length; p++)
    for (const k of neighbours(px[p])) if (k >= 0 && label[k] === -1 && alpha[k] >= CORE) (label[k] = next), px.push(k);
  if (px.length < 15 * UP) for (const j of px) label[j] = -1;
  else next++;
}
// 2. Grow cores through the thread mask (alpha ≥ THRESHOLD), nearest core first.
let frontier = [];
for (let i = 0; i < N; i++) if (label[i] >= 0) frontier.push(i);
while (frontier.length) {
  const grown = [];
  for (const j of frontier) for (const k of neighbours(j)) if (k >= 0 && label[k] === -1 && alpha[k] >= THRESHOLD) (label[k] = label[j]), grown.push(k);
  frontier = grown;
}
// 3. Thread pixels; cut a seam wherever two different stitches meet.
const mask = Buffer.alloc(N, 255); // white = empty, black = thread (potrace)
for (let i = 0; i < N; i++) {
  if (alpha[i] < THRESHOLD) continue;
  const l = label[i];
  let seam = false;
  if (l >= 0) {
    const x = i % W, y = (i / W) | 0;
    for (let dy = -SEAM; dy <= SEAM && !seam; dy++)
      for (let dx = -SEAM; dx <= SEAM && !seam; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const m = label[ny * W + nx];
        if (m >= 0 && m !== l) seam = true;
      }
  }
  if (!seam) mask[i] = 0;
}
const gray = await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
const traced = await new Promise((resolve, reject) =>
  potrace.trace(gray, { threshold: 128, turdSize: 6 * UP, alphaMax: 1.3, optCurve: true, optTolerance: 0.4 }, (err, svg) =>
    err ? reject(err) : resolve(svg),
  ),
);
const d = traced
  .match(/ d="([^"]+)"/)[1]
  .replace(/-?\d+\.\d+/g, (m) => String(Math.round(Number.parseFloat(m) * 10) / 10))
  .replace(/, /g, ' ')
  .replace(/ ([MLCZ]) /g, '$1')
  .replace(/ Z/g, 'Z');
const svg = (paint) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${meta.width}" height="${meta.height}"><path ${paint} fill-rule="evenodd" d="${d}"/></svg>`;
fs.writeFileSync('public/logo/archivin-stitch-black.svg', svg('fill="#1c1d21"'));
fs.writeFileSync('public/logo/archivin-stitch-navy.svg', svg('fill="#323850" stroke="#323850" stroke-width="16" stroke-linejoin="round"'));
console.log('public/logo/archivin-stitch-{black,navy}.svg written');
