// index.html and de/index.html – the landing page with the embedded demo app.
import { writeFileSync, mkdirSync } from 'node:fs';
import { PAGES } from './i18n.mjs';
import { WORDS } from './words.mjs';
import { head, nav, foot, pkg, NK_VERSION, CDN_CSS, CDN_JS } from './chrome.mjs';
import { highlightHtml } from '../src/util/highlight.js';
import { CATALOG } from './catalog.mjs';

const LANDING_CSS = `
.land-hero { padding: 56px 0 28px; max-width: 760px; }
.land-hero h1 { font-size: clamp(32px, 5vw, 48px); font-weight: 700; letter-spacing: -0.02em; margin: 0 0 14px; line-height: 1.08; }
.land-hero h1 span { color: var(--nk-accent); }
.land-hero p { font-size: 17px; line-height: 1.6; color: var(--nk-text-secondary); margin: 0 0 22px; }
.land-ctas { display: flex; gap: 8px; flex-wrap: wrap; }
.land-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
.land-badges span { font-size: 11.5px; padding: 2px 9px; border-radius: 10px; background: var(--nk-bg-callout); color: var(--nk-text-secondary); }
.land-section { margin-top: 56px; }
.land-section > h2 { font-size: 22px; font-weight: 600; margin: 0 0 6px; }
.land-section > p { color: var(--nk-text-secondary); margin: 0 0 18px; max-width: 70ch; line-height: 1.55; }
.land-compare { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: 16px; }
.land-compare h4 { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; color: var(--nk-text-tertiary); margin: 0 0 6px; }
.land-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: 14px; }
.land-feature { border: 1px solid var(--nk-border); border-radius: 8px; padding: 14px 16px; background: var(--nk-bg-card); }
.land-feature .i { font-size: 22px; margin-bottom: 6px; }
.land-feature b { display: block; font-weight: 600; margin-bottom: 4px; }
.land-feature p { margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--nk-text-secondary); }
.land-feature code { font-family: var(--nk-font-mono); font-size: 12px; background: var(--nk-bg-code); padding: 1px 4px; border-radius: 3px; }
.land-steps { counter-reset: s; display: grid; gap: 10px; }
.land-step { display: flex; gap: 12px; align-items: flex-start; }
.land-step::before { counter-increment: s; content: counter(s); width: 24px; height: 24px; border-radius: 50%; background: var(--nk-accent); color: var(--nk-on-accent); font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.land-step code { font-family: var(--nk-font-mono); font-size: 12.5px; background: var(--nk-bg-code); padding: 1px 4px; border-radius: 3px; }
.land-preview { border: 1px solid var(--nk-border); border-radius: 10px; overflow: hidden; box-shadow: var(--nk-shadow-card); }
.land-preview iframe { display: block; width: 100%; height: 640px; border: 0; }
.land-family { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: 14px; }
.land-family a, .land-family div { border: 1px solid var(--nk-border); border-radius: 8px; padding: 14px 16px; text-decoration: none; color: var(--nk-text); background: var(--nk-bg-card); display: block; }
.land-family .here { border-color: var(--nk-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--nk-accent) 20%, transparent); }
.land-family b { display: block; margin-bottom: 4px; }
.land-family small { color: var(--nk-text-tertiary); font-size: 12.5px; }
.land-family em { font-style: normal; font-size: 11px; color: var(--nk-accent); margin-left: 6px; }
`;

function landing(lang) {
  const t = PAGES[lang], W = WORDS[lang];
  const before = `<div class="nk-field">
  <div><div class="f-label">${W.notify}</div><div class="f-desc">${W.displayNameDesc}</div></div>
  <div class="f-control"><button class="nk-switch" role="switch" aria-checked="true"></button></div>
</div>
<div class="nk-callout"><span class="c-icon">💡</span><div>${W.calloutText}</div></div>
<div class="nk-tree-item active"><span class="icon">🚀</span><span class="label">${W.mvp}</span><span class="actions"><span>＋</span><span>⋯</span></span></div>`;
  const after = `<nk-field label="${W.notify}" desc="${W.displayNameDesc}"><nk-switch checked></nk-switch></nk-field>
<nk-callout icon="💡">${W.calloutText}</nk-callout>
<nk-tree-item icon="🚀" active>${W.mvp}</nk-tree-item>`;
  const quick = `<link rel="stylesheet" href="${CDN_CSS}">\n<script src="${CDN_JS}"></script>\n\n<body class="nk-body">\n  <nk-callout icon="💡">${W.calloutText}</nk-callout>\n</body>`;
  return `${head(t, { title: 'NotionKit Elements', description: t.heroLead.replace(/<[^>]+>/g, ''), path: 'index.html', extraCss: LANDING_CSS })}
${nav(t, 'index')}
<main class="site-main" style="padding-top:0"><div class="site-inner" style="max-width:960px">
  <section class="land-hero">
    <div class="land-badges"><span>v${pkg.version}</span><span>${CATALOG.length} elements</span><span>Shadow DOM</span><span>Vanilla JS</span><span>NotionKit CSS ${NK_VERSION}</span><span>MIT</span></div>
    <h1>${t.heroTitle.replace(/(Elemente|elements)\./, '<span>$1</span>.')}</h1>
    <p>${t.heroLead}</p>
    <div class="land-ctas"><nk-btn variant="primary" href="docs.html">${t.ctaDocs}</nk-btn> <nk-btn variant="secondary" href="app.html">${t.ctaApp}</nk-btn> <nk-btn variant="secondary" href="showcase.html">${t.ctaShowcase}</nk-btn></div>
  </section>

  <section class="land-section" id="preview">
    <h2>${t.previewTitle}</h2><p>${t.previewLead}</p>
    <div class="land-preview"><iframe src="app.html" title="NotionKit Elements demo app" loading="lazy" data-theme-sync></iframe></div>
  </section>

  <section class="land-section" id="compare">
    <h2>${t.compareTitle}</h2>
    <div class="land-compare">
      <div><h4>${t.before}</h4><div class="doc-compare"><div class="doc-preview">${before}</div><pre class="doc-code">${highlightHtml(before)}</pre></div></div>
      <div><h4>${t.after}</h4><div class="doc-compare"><div class="doc-preview">${after}</div><pre class="doc-code">${highlightHtml(after)}</pre></div></div>
    </div>
  </section>

  <section class="land-section" id="features">
    <div class="land-features">${t.features.map(([i, b, p]) => `<div class="land-feature"><div class="i">${i}</div><b>${b}</b><p>${p}</p></div>`).join('')}</div>
  </section>

  <section class="land-section" id="quickstart">
    <h2>${t.quickTitle}</h2>
    <div class="land-steps">${t.quickSteps.map(s => `<div class="land-step"><div>${s}</div></div>`).join('')}</div>
    <div class="doc-compare" style="margin-top:14px"><pre class="doc-code" style="border-top:0">${highlightHtml(quick)}</pre></div>
  </section>

  <section class="land-section" id="family">
    <h2>${t.familyTitle}</h2>
    <div class="land-family">${t.family.map(([name, desc, href, here]) => href ? `<a href="${href}" class="${here ? 'here' : ''}"><b>${name}${here ? `<em>${t.here}</em>` : ''}</b><small>${desc}</small></a>` : `<div><b>${name}<em>${t.planned}</em></b><small>${desc}</small></div>`).join('')}</div>
  </section>
  ${foot(t)}
</div></main>`;
}

mkdirSync('de', { recursive: true });
writeFileSync('index.html', landing('en'));
writeFileSync('de/index.html', landing('de'));
console.log('✅ index.html + de/index.html generated');
