// SKILL.md – the AI-facing reference, generated from the same catalog as the
// docs. Prose (concepts, rules, skeletons) lives here; per-element facts come
// from tools/catalog.mjs.
import { writeFileSync } from 'node:fs';
import { CATALOG, GROUPS } from './catalog.mjs';
import { WORDS } from './words.mjs';
import { pkg, NK_VERSION, CDN_CSS, CDN_JS } from './chrome.mjs';
import { SKILL_PROSE } from './skill-prose.mjs';

const W = WORDS.en;
const strip = s => s.replace(/<code>/g, '`').replace(/<\/code>/g, '`').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function entry(e, n) {
  const attrs = e.attrs.length ? `| Attribute | Type | Default | Description |\n|---|---|---|---|\n${e.attrs.map(a => `| \`${a.name}\` | ${a.type} | ${a.default ? `\`${a.default}\`` : '–'} | ${strip(a.desc.en)} |`).join('\n')}` : '_No attributes._';
  const slots = e.slots.length ? `**Slots:** ${e.slots.map(s => `\`${s.name}\` – ${strip(s.desc.en)}`).join(' · ')}` : '';
  const events = e.events.length ? `**Events:** ${e.events.map(ev => `\`${ev.name}\` ${ev.detail ? `\`${ev.detail}\`` : ''} – ${strip(ev.desc.en)}`).join(' · ')}` : '';
  const api = [e.props?.length ? `**Properties:** ${e.props.map(p => `\`${p}\``).join(', ')}` : '', e.methods?.length ? `**Methods:** ${e.methods.map(m => `\`${m}\``).join(', ')}` : ''].filter(Boolean).join(' · ');
  return `### ${n} \`<${e.tag}>\` – ${e.title.en}

${strip(e.desc.en)}

\`\`\`html
${e.example(W)}
\`\`\`

${attrs}

${[slots, events, api].filter(Boolean).join('\n\n')}

**Replaces:** ${e.classes.map(c => `\`.${c}\``).join(', ')}${e.classMarkup ? `

\`\`\`html
<!-- equivalent class markup -->
${e.classMarkup(W)}
\`\`\`` : ''}

**Small screens:** ${strip(e.mobile.en)}
`;
}

let n = 0;
const catalog = GROUPS.map(g => {
  const items = CATALOG.filter(e => e.group === g.id);
  if (!items.length) return '';
  return `## ${g.title.en} (wave ${g.wave})\n\n${items.map(e => entry(e, `3.${++n}`)).join('\n')}`;
}).join('\n');

const quick = `| Tag | Group | Key attributes | Key slots | Key events |\n|---|---|---|---|---|\n${CATALOG.map(e => `| \`<${e.tag}>\` | ${e.group} | ${e.attrs.slice(0, 4).map(a => `\`${a.name}\``).join(', ') || '–'} | ${e.slots.map(s => `\`${s.name}\``).join(', ') || '–'} | ${e.events.map(ev => `\`${ev.name}\``).join(', ') || '–'} |`).join('\n')}`;

const out = `---
name: notionkit-elements
description: NotionKit Elements is a vanilla-JS Web Components library (v${pkg.version}) wrapping NotionKit CSS v${NK_VERSION} – the calm, document-centric design system in the Notion idiom. ${CATALOG.length} custom elements with the \`nk-\` prefix, Shadow DOM, automatic light/dark sync via data-theme on <html>, and form-associated controls. Use this reference whenever generating HTML that uses <nk-*> tags to get attributes, slots, events and composition right.
---

# NotionKit Elements – AI Component Reference

> Machine-readable reference for generating correct \`<nk-*>\` markup. The class-based companion (\`.nk-*\`) is documented in the NotionKit CSS SKILL.md at https://notionkit.jungherz.com/SKILL.md – every element here has the same word stem as its class.

${SKILL_PROSE.setup({ CDN_CSS, CDN_JS, W })}

${SKILL_PROSE.concepts()}

# 3. Element Catalog (${CATALOG.length} elements)

${catalog}

${SKILL_PROSE.skeletons({ CDN_CSS, CDN_JS, W })}

${SKILL_PROSE.events()}

${SKILL_PROSE.rules()}

# 7. Quick Reference

${quick}

${SKILL_PROSE.integration()}

${SKILL_PROSE.architecture()}

---
*NotionKit Elements v${pkg.version} · wrapping NotionKit CSS v${NK_VERSION} · MIT · Jungherz GmbH*
`;
writeFileSync('SKILL.md', out);
console.log(`✅ SKILL.md generated (${(out.length / 1024).toFixed(1)} KB, ${CATALOG.length} elements)`);
