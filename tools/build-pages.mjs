// Generates showcase.html, docs.html and their de/ twins from tools/catalog.mjs.
import { writeFileSync, mkdirSync } from 'node:fs';
import { CATALOG, GROUPS } from './catalog.mjs';
import { WORDS } from './words.mjs';
import { PAGES } from './i18n.mjs';
import { head, nav, foot, pkg, CDN_CSS, CDN_JS } from './chrome.mjs';
import { highlightHtml } from '../src/util/highlight.js';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Shell examples need the viewport (.nk-app is 100vh), so they render inside
// an iframe. srcdoc inherits the parent's origin: relative URLs resolve
// against the page, and the theme is read from the parent document.
function frame(t, html, height) {
  const doc = `<!DOCTYPE html><html lang="${t.lang}"><head><meta charset="UTF-8"><link rel="stylesheet" href="${CDN_CSS}"><script src="${t.dir}dist/notionkit-elements.min.js"></script><style>body{margin:0;height:100vh}</style></head><body class="nk-body">${html}<script>(function(){var r=document.documentElement;function s(t){r.setAttribute('data-theme',t)}s(parent.document.documentElement.getAttribute('data-theme')||'light');addEventListener('message',function(e){if(e.data&&e.data.nkTheme)s(e.data.nkTheme)});})()</script></body></html>`;
  return `<iframe class="doc-frame" data-theme-sync loading="lazy" style="height:${height}px" srcdoc="${doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`;
}
const preview = (t, e, html) => e.frame ? frame(t, html, e.frame) : html;
const code = (src) => `<pre class="doc-code">${highlightHtml(src)}</pre>`;

function table(t, rows, cols) {
  if (!rows.length) return `<p class="doc-meta">${t.none}</p>`;
  return `<table class="doc-table"><tr>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr>
${rows.map(r => `<tr>${cols.map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('\n')}</table>`;
}

function entryDoc(t, W, e) {
  const example = e.example(W), classMarkup = e.classMarkup?.(W);
  const group = GROUPS.find(g => g.id === e.group);
  const toggle = classMarkup ? `<div class="doc-compare-bar">
    <div class="nk-segmented" data-compare="${e.tag}"><button class="active" data-mode="element">${esc(t.after)}</button><button data-mode="class">${esc(t.before)}</button></div>
    <span class="site-spacer"></span><span>${t.wave} ${group.wave}</span></div>` : '';
  return `<article class="doc-entry" id="${e.tag}">
  <h3><code>&lt;${e.tag}&gt;</code> ${e.title[t.lang]}</h3>
  <p class="doc-desc">${e.desc[t.lang]}</p>
  <div class="doc-compare">${toggle}
    <div class="doc-preview" data-mode="element">${preview(t, e, example)}</div>
    ${classMarkup ? `<div class="doc-preview" data-mode="class" hidden>${preview(t, e, classMarkup)}</div>` : ''}
    <pre class="doc-code" data-mode="element">${highlightHtml(example)}</pre>
    ${classMarkup ? `<pre class="doc-code" data-mode="class" hidden>${highlightHtml(classMarkup)}</pre>` : ''}
  </div>
  <p class="doc-h4">${t.attrs}</p>
  ${table(t, e.attrs, [[t.attr, a => `<code>${a.name}</code>`], [t.type, a => `<code>${esc(a.type)}</code>`], [t.default, a => a.default ? `<code>${esc(a.default)}</code>` : '–'], [t.desc, a => a.desc[t.lang]]])}
  <p class="doc-h4">${t.slots}</p>
  ${table(t, e.slots, [[t.slot, s => `<code>${esc(s.name)}</code>`], [t.desc, s => s.desc[t.lang]]])}
  <p class="doc-h4">${t.events}</p>
  ${table(t, e.events, [[t.event, ev => `<code>${ev.name}</code>`], [t.detail, ev => `<code>${esc(ev.detail || '')}</code>`], [t.desc, ev => ev.desc[t.lang]]])}
  ${e.props?.length ? `<p class="doc-meta"><b>${t.props}:</b> ${e.props.map(p => `<code>${p}</code>`).join(' ')}</p>` : ''}
  ${e.methods?.length ? `<p class="doc-meta"><b>${t.methods}:</b> ${e.methods.map(m => `<code>${m}</code>`).join(' ')}</p>` : ''}
  <div class="doc-meta"><b>${t.mobile}</b><span>${e.mobile[t.lang]}</span></div>
  <div class="doc-classes"><span class="doc-meta"><b>${t.classes}</b></span>${e.classes.map(c => `<code>.${c}</code>`).join('')}</div>
</article>`;
}

const COMPARE_JS = `
document.querySelectorAll('[data-compare]').forEach(function (seg) {
  seg.addEventListener('click', function (e) {
    var btn = e.target.closest('button'); if (!btn) return;
    seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn); });
    var box = seg.closest('.doc-compare');
    box.querySelectorAll('[data-mode]').forEach(function (n) { if (n !== seg && !n.closest('.doc-compare-bar')) n.hidden = n.dataset.mode !== btn.dataset.mode; });
  });
});
var links = [].slice.call(document.querySelectorAll('.site-toc a[href^="#"]'));
var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
function spy() {
  var current = null;
  targets.forEach(function (el, i) { if (el && el.getBoundingClientRect().top <= 90) current = i; });
  links.forEach(function (a, i) { a.classList.toggle('current', i === current); });
}
addEventListener('scroll', spy, { passive: true }); spy();
`;

function toc(t, groups, extra = '') {
  return `<aside class="site-toc">${extra}${groups.map(g => {
    const items = CATALOG.filter(e => e.group === g.id);
    if (!items.length) return '';
    return `<div class="site-group">${g.title[t.lang]}</div>${items.map(e => `<a href="#${e.tag}">&lt;${e.tag}&gt;</a>`).join('')}`;
  }).join('')}</aside>`;
}

function docs(lang) {
  const t = PAGES[lang], W = WORDS[lang];
  const basics = `<div class="site-group">${t.basics}</div>
  <a href="#install">${t.install}</a><a href="#prereq">${t.prereq}</a><a href="#hosts">${t.hosts}</a><a href="#theming">${t.theming}</a><a href="#forms">${t.forms}</a><a href="#lightdom">${t.lightdom}</a><a href="#icons">${t.icons}</a><a href="#overlays">${t.overlays}</a><a href="#editor">${t.editor}</a>`;
  const basicsHtml = `
<section class="site-section" id="install"><h2>${t.install}</h2>
  <p class="doc-h4">${t.installCdn}</p>${code(`<link rel="stylesheet" href="${CDN_CSS}">\n<script src="${CDN_JS}"></script>`)}
  <p class="doc-h4">${t.installNpm}</p>${code(`npm install @jungherz-de/notionkit-elements @jungherz-de/notionkit\n\nimport '@jungherz-de/notionkit/notionkit.css';\nimport '@jungherz-de/notionkit-elements';`)}
  <p class="doc-h4">${t.installSingle}</p>${code(`import '@jungherz-de/notionkit-elements/components/nk-btn.js';`)}
</section>
<section class="site-section" id="prereq"><h2>${t.prereq}</h2><p class="doc-desc">${t.prereqBody}</p>${code(`<html lang="en" data-theme="light">\n  <head>\n    <link rel="stylesheet" href="${CDN_CSS}">\n    <script src="${CDN_JS}"></script>\n  </head>\n  <body class="nk-body">\n    <nk-btn variant="primary">${W.save}</nk-btn>\n  </body>\n</html>`)}</section>
<section class="site-section" id="hosts"><h2>${t.hosts}</h2><p class="doc-desc">${t.hostsBody}</p>${code(`<!-- ✓ spacing on a wrapper you own -->\n<div style="margin-top:16px"><nk-btn variant="primary">${W.save}</nk-btn></div>\n\n<!-- ✗ the host has no box; this margin does nothing -->\n<nk-btn style="margin-top:16px" variant="primary">${W.save}</nk-btn>`)}</section>
<section class="site-section" id="theming"><h2>${t.theming}</h2><p class="doc-desc">${t.themingBody}</p>${code(`<style>\n  :root { --nk-accent: #16a34a; }\n  [data-theme="dark"] { --nk-accent: #4ade80; }\n</style>\n<script>document.documentElement.dataset.theme = 'dark';</script>`)}</section>
<section class="site-section" id="forms"><h2>${t.forms}</h2><p class="doc-desc">${t.formsBody}</p>${code(`<form id="f">\n  <nk-field label="${W.displayName}"><nk-input name="name" required></nk-input></nk-field>\n  <nk-field label="${W.notify}"><nk-switch name="notify" checked></nk-switch></nk-field>\n  <nk-btn type="submit" variant="primary">${W.save}</nk-btn>\n</form>\n<script>\n  f.addEventListener('submit', e => { e.preventDefault(); console.log([...new FormData(f)]); });\n</script>`)}</section>
<section class="site-section" id="lightdom"><h2>${t.lightdom}</h2><p class="doc-desc">${t.lightdomBody}</p>${code(`const sel = document.querySelector('nk-select');\nsel.innerHTML = roles.map(r => \`<option value="\${r.id}">\${r.name}</option>\`).join('');\n// the shadow <select> follows; sel.value is preserved when the option still exists`)}</section>
<section class="site-section" id="icons"><h2>${t.icons}</h2><p class="doc-desc">${t.iconsBody}</p>${code(`<!-- ✓ the icon is the slotted node -->\n<nk-callout><span slot="icon">📌</span>…</nk-callout>\n\n<!-- ✗ wrapped: ::slotted() cannot reach the inner node -->\n<nk-callout><span slot="icon"><em>📌</em></span>…</nk-callout>`)}</section>
<section class="site-section" id="overlays"><h2>${t.overlays}</h2><p class="doc-desc">${t.overlaysBody}</p></section>
<section class="site-section" id="editor"><h2>${t.editor}</h2><p class="doc-desc">${t.editorBody}</p>${code(`<!-- the shell: hover wash, focus ring, drag handle -->\n<div class="nk-block-host" id="editor">\n  <p>Server-rendered content becomes the initial document.</p>\n</div>\n\n<!-- the recipe: TipTap + slash menu + bubble menu + block handle (docs-editor.js) -->\n<script type="module" src="${t.dir}docs-editor.js"></script>`)}<p class="doc-meta"><a href="${t.dir}docs-editor.js">docs-editor.js</a> · <a href="app.html#nk-editor-section">live in the demo app</a></p></section>`;

  const groupsHtml = GROUPS.map(g => {
    const items = CATALOG.filter(e => e.group === g.id);
    if (!items.length) return '';
    return `<section class="site-section" id="group-${g.id}"><h2>${g.title[lang]}</h2><p class="site-groupnote">${t.wave} ${g.wave}</p>${items.map(e => entryDoc(t, W, e)).join('\n')}</section>`;
  }).join('\n');

  return `${head(t, { title: t.docsTitle, description: t.docsLead.replace(/<[^>]+>/g, ''), path: 'docs.html' })}
${nav(t, 'docs')}
<div class="site-layout">
${toc(t, GROUPS, basics)}
<main class="site-main"><div class="site-inner">
  <h1 class="site-h1">${t.docsTitle}</h1>
  <p class="site-lead">${t.docsLead}</p>
  ${basicsHtml}
  ${groupsHtml}
  ${foot(t).replace('</body>', `<script>${COMPARE_JS}</script></body>`)}
</div></main>
</div>`;
}

function showcase(lang) {
  const t = PAGES[lang], W = WORDS[lang];
  const groupsHtml = GROUPS.map(g => {
    const items = CATALOG.filter(e => e.group === g.id);
    if (!items.length) return '';
    return `<section class="site-section" id="group-${g.id}"><h2>${g.title[lang]}</h2><p class="site-groupnote">${t.wave} ${g.wave}</p>
<div class="show-grid">${items.map(e => `<div class="show-item${e.wide ? ' wide' : ''}" id="${e.tag}"><h4><a href="docs.html#${e.tag}">&lt;${e.tag}&gt;</a></h4><div class="show-body">${preview(t, e, e.example(W))}</div></div>`).join('\n')}</div></section>`;
  }).join('\n');
  return `${head(t, { title: t.showcaseTitle, description: t.showcaseLead.replace(/<[^>]+>/g, ''), path: 'showcase.html' })}
${nav(t, 'showcase')}
<div class="site-layout">
${toc(t, GROUPS)}
<main class="site-main"><div class="site-inner">
  <h1 class="site-h1">${t.showcaseTitle} <span class="site-version">v${pkg.version}</span></h1>
  <p class="site-lead">${t.showcaseLead}</p>
  ${groupsHtml}
  ${foot(t).replace('</body>', `<script>${COMPARE_JS}</script></body>`)}
</div></main>
</div>`;
}

mkdirSync('de', { recursive: true });
writeFileSync('docs.html', docs('en'));
writeFileSync('showcase.html', showcase('en'));
writeFileSync('de/docs.html', docs('de'));
writeFileSync('de/showcase.html', showcase('de'));
console.log(`✅ docs.html, showcase.html (+ de/) generated · ${CATALOG.length} elements`);
