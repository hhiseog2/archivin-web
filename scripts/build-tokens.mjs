// Generates app/tokens.css (CSS custom properties) from tokens/tokens.json.
// Runs automatically before `npm run dev` / `npm run build`.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));

const lines = [];
const add = (name, value, comment) => {
  lines.push(`  --${name}: ${value};${comment ? ` /* ${comment.replace(/\*\//g, '')} */` : ''}`);
};

for (const t of tokens.color.tokens) add(`color-${t.name}`, t.value);
lines.push('');
for (const [name, value] of Object.entries(tokens.type.families)) add(`font-${name}`, value);
lines.push('');
for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    add(`type-${s.name}-size`, s.fontSize);
    add(`type-${s.name}-line`, String(s.lineHeight));
    add(`type-${s.name}-weight`, String(s.fontWeight));
    if (s.letterSpacing) add(`type-${s.name}-tracking`, s.letterSpacing);
  }
}
lines.push('');
for (const t of tokens.spacing.tokens) add(t.name === 'gutter' ? 'space-gutter' : t.name, t.value);
for (const t of tokens.radius.tokens) add(t.name, t.value);
for (const t of tokens.stroke.tokens) add(t.name, t.value);

const css = `/* AUTO-GENERATED from tokens/tokens.json by scripts/build-tokens.mjs. Do not edit by hand. */\n:root {\n${lines.join('\n')}\n}\n`;
writeFileSync(join(root, 'app/tokens.css'), css);
console.log(`tokens.css written (${lines.filter(Boolean).length} variables)`);
