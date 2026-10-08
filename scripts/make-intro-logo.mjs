// Builds public/logo/archivin-stitch-black.png from the white stitch logo for the white intro (client request).
// Same thread width; colour = ink #1c1d21; faint stitches strengthened (alpha × 1.6 − 0.12), so thinner
// stretches of the photographed thread (e.g. the N) read as dark as the rest.
// Run: node scripts/make-intro-logo.mjs  — TODO: replace with the client's vector logo when it arrives.
import sharp from 'sharp';

const src = 'public/logo/archivin-stitch-white.png';
const out = 'public/logo/archivin-stitch-black.png';
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const [r, g, b] = [0x1c, 0x1d, 0x21];
for (let i = 0; i < data.length; i += 4) {
  const a = data[i + 3] / 255;
  data[i] = r;
  data[i + 1] = g;
  data[i + 2] = b;
  data[i + 3] = Math.round(Math.min(1, Math.max(0, a * 1.6 - 0.12)) * 255);
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(out);
console.log(`${out} written (${info.width}x${info.height})`);
