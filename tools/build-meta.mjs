// sitemap.xml, robots.txt, llms.txt
import { writeFileSync } from 'node:fs';
import { CATALOG, GROUPS } from './catalog.mjs';
import { pkg, NK_VERSION, SITE } from './chrome.mjs';

const pages = [['index.html', 1.0], ['docs.html', 0.9], ['showcase.html', 0.8], ['app.html', 0.8], ['de/index.html', 0.9], ['de/docs.html', 0.8], ['de/showcase.html', 0.7], ['de/app.html', 0.7]];
const today = new Date().toISOString().slice(0, 10);
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, prio]) => `  <url><loc>${SITE}/${p}</loc><lastmod>${today}</lastmod><priority>${prio}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

const byGroup = GROUPS.map(g => {
  const items = CATALOG.filter(e => e.group === g.id);
  return items.length ? `- ${g.title.en}: ${items.map(e => `<${e.tag}>`).join(', ')}` : '';
}).filter(Boolean).join('\n');
writeFileSync('llms.txt', `# NotionKit Elements v${pkg.version}

> Vanilla-JS Web Components (<nk-*>, Shadow DOM) wrapping NotionKit CSS v${NK_VERSION}, the calm document-centric design system in the Notion idiom. Same word stem as the CSS classes: .nk-callout ↔ <nk-callout>; modifier class → attribute, state class → boolean attribute. No visual CSS of its own, tokens on the document, theme via data-theme on <html>.

## Start here
- [SKILL.md](${SITE}/SKILL.md): AI-ready reference – copy-paste markup for every element, app skeletons, rules and common mistakes.
- [Documentation](${SITE}/docs.html): attributes, slots, events, before/after against the class markup.
- [Showcase](${SITE}/showcase.html): every element live, both themes, brand switch.
- [Demo app](${SITE}/app.html): the NotionKit reference app built from elements only.
- [Foundation](https://notionkit.jungherz.com): NotionKit CSS, the peer dependency.
- [NotionKit Web](https://notionkit-web.jungherz.com): the Astro template for complete websites on the same foundation.

## Elements (${CATALOG.length})
${byGroup}

## Install
- CDN: https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@${NK_VERSION}/notionkit.min.css + https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@${pkg.version}/dist/notionkit-elements.min.js
- npm: @jungherz-de/notionkit-elements (peer: @jungherz-de/notionkit >= 1.0.0)
- MIT · Jungherz GmbH · https://github.com/JUNGHERZ/NotionKit-Elements
`);
console.log(`✅ sitemap.xml (${pages.length} URLs), robots.txt, llms.txt generated`);
