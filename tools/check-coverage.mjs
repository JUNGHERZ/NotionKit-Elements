// Every element registered in src/index.js must be documented: a catalog
// entry, a docs.html section, a showcase.html card and a SKILL.md section –
// in both languages. Documentation cannot silently fall behind the code.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { CATALOG } from './catalog.mjs';

const src = readFileSync('src/index.js', 'utf-8');
const registered = new Set([...src.matchAll(/components\/[a-z-]+\/(nk-[a-z-]+)\.js/g)].map(m => m[1]));
// Every component file must define the tag its filename says.
for (const dir of readdirSync('src/components')) {
  for (const f of readdirSync(`src/components/${dir}`)) {
    const tag = f.replace(/\.js$/, '');
    const body = readFileSync(`src/components/${dir}/${f}`, 'utf-8');
    if (!body.includes(`customElements.define('${tag}'`)) { console.log(`❌ ${dir}/${f} does not define <${tag}>`); process.exit(1); }
    if (!registered.has(tag)) { console.log(`❌ <${tag}> is not exported from src/index.js`); process.exit(1); }
  }
}

const catalog = new Set(CATALOG.map(e => e.tag));
let bad = 0;
const missingCatalog = [...registered].filter(t => !catalog.has(t));
if (missingCatalog.length) { bad++; console.log('❌ registered but not in tools/catalog.mjs:', missingCatalog.join(', ')); }
const unknown = [...catalog].filter(t => !registered.has(t));
if (unknown.length) { bad++; console.log('❌ in catalog but not registered:', unknown.join(', ')); }

for (const file of ['docs.html', 'showcase.html', 'de/docs.html', 'de/showcase.html', 'SKILL.md']) {
  if (!existsSync(file)) { bad++; console.log(`❌ ${file} missing – run npm run build:all`); continue; }
  const text = readFileSync(file, 'utf-8');
  const needle = file.endsWith('.md') ? t => `<${t}>` : t => `id="${t}"`;
  const missing = [...registered].filter(t => !text.includes(needle(t)));
  console.log(`${missing.length ? '❌' : '✅'} ${file.padEnd(18)} ${registered.size - missing.length}/${registered.size} elements documented`);
  if (missing.length) { bad++; console.log('   missing:', missing.join(', ')); }
}
if (!bad) console.log(`✅ ${registered.size} elements registered, catalogued and documented`);
process.exit(bad ? 1 : 0);
