// Generates app/tokens.css (CSS custom properties) from tokens/tokens.json (handoff v4).
// Runs automatically before `npm run dev` / `npm run build`.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));

const lines = [];
const add = (name, value) => lines.push(`  --${name}: ${value};`);
// Only plain CSS lengths make it into variables; descriptive values ("2열 · …", "12px–13px") are notes.
const isLength = (v) => /^-?\d+(\.\d+)?(px|%)?$/.test(String(v).trim());

for (const t of tokens.color.tokens) {
  if (t.name.startsWith('shadow-')) add(t.name, t.value);
  else add(`color-${t.name}`, t.value);
}
lines.push('');
// Adobe Fonts serves Neue Haas Grotesk Text as `neue-haas-grotesk-text`; put that first so the web kit wins once linked.
const ADOBE_KIT_FAMILY = 'neue-haas-grotesk-text';
for (const [name, value] of Object.entries(tokens.type.families)) {
  add(`font-${name}`, name === 'text' && !value.includes(ADOBE_KIT_FAMILY) ? `${ADOBE_KIT_FAMILY}, ${value}` : value);
}
lines.push('');
for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    if (isLength(s.fontSize)) add(`type-${s.name}-size`, s.fontSize);
    if (s.lineHeight != null && isLength(s.lineHeight)) add(`type-${s.name}-line`, String(s.lineHeight));
  }
}
lines.push('');
for (const t of tokens.spacing.tokens) if (isLength(t.value)) add(`space-${t.name}`, t.value);
for (const t of tokens.radius.tokens) if (isLength(t.value)) add(t.name, t.value);

const css = `/* AUTO-GENERATED from tokens/tokens.json by scripts/build-tokens.mjs. Do not edit by hand. */\n:root {\n${lines.join('\n')}\n}\n`;
writeFileSync(join(root, 'app/tokens.css'), css);
console.log(`tokens.css written (${lines.filter(Boolean).length} variables)`);
