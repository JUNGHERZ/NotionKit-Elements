// Page chrome shared by docs, showcase and landing: head, nav, styles, theme
// script. Deliberately `site-` prefixed – this is the wrapper around the
// library, not part of it. Every value comes from a --nk-* token.
import { readFileSync } from 'node:fs';

export const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
export const NK_VERSION = pkg.devDependencies['@jungherz-de/notionkit'].replace(/^[\^~]/, '');
export const CDN_CSS = `https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@${NK_VERSION}/notionkit.min.css`;
export const CDN_JS = `https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@${pkg.version}/dist/notionkit-elements.min.js`;
export const SITE = 'https://notionkit-elements.jungherz.com';

export const CHROME_CSS = `
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
.site-nav { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 6px; height: 45px; padding: 0 16px; background: var(--nk-bg); border-bottom: 1px solid var(--nk-border); }
.site-nav .site-brand { font-weight: 600; text-decoration: none; color: var(--nk-text); display: flex; align-items: center; gap: 8px; margin-right: 8px; }
.site-nav .site-brand span { color: var(--nk-accent); }
.site-version { font-size: 11px; color: var(--nk-text-tertiary); border: 1px solid var(--nk-border); border-radius: 10px; padding: 1px 7px; }
.site-nav a { color: var(--nk-text-secondary); text-decoration: none; font-size: 13.5px; padding: 4px 8px; border-radius: var(--nk-radius); }
.site-nav a:hover { background: var(--nk-bg-hover); color: var(--nk-text); }
.site-nav a.current { color: var(--nk-text); font-weight: 500; }
.site-nav .site-spacer { flex: 1; }
.site-layout { display: flex; min-height: calc(100vh - 45px); }
.site-toc { width: 250px; flex-shrink: 0; background: var(--nk-bg-sidebar); border-right: 1px solid var(--nk-border); padding: 12px 8px 40px; position: sticky; top: 45px; height: calc(100vh - 45px); overflow-y: auto; font-size: 13.5px; }
.site-toc a { display: block; color: var(--nk-text-secondary); text-decoration: none; padding: 3px 10px; border-radius: var(--nk-radius); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.site-toc a:hover { background: var(--nk-bg-hover); color: var(--nk-text); }
.site-toc a.current { background: var(--nk-bg-active); color: var(--nk-text); font-weight: 500; }
.site-toc .site-group { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; color: var(--nk-text-tertiary); padding: 14px 10px 4px; }
.site-main { flex: 1; min-width: 0; padding: 32px clamp(16px, 4vw, 48px) 120px; }
.site-main > .site-inner { max-width: 860px; margin: 0 auto; }
.site-h1 { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 8px; }
.site-lead { font-size: 15.5px; line-height: 1.6; color: var(--nk-text-secondary); margin: 0 0 28px; max-width: 70ch; }
.site-section { margin-top: 48px; }
.site-section > h2 { font-size: 20px; font-weight: 600; margin: 0 0 6px; padding-bottom: 8px; border-bottom: 1px solid var(--nk-border); }
.site-section > .site-groupnote { font-size: 13px; color: var(--nk-text-tertiary); margin: 0 0 16px; }
.doc-entry { margin: 32px 0 44px; scroll-margin-top: 60px; }
.doc-entry > h3 { font-size: 17px; font-weight: 600; margin: 0 0 4px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.doc-entry > h3 code { font-family: var(--nk-font-mono); font-size: 14px; background: var(--nk-bg-code); padding: 2px 6px; border-radius: 4px; }
.doc-desc { font-size: 14px; line-height: 1.6; color: var(--nk-text-secondary); margin: 0 0 12px; max-width: 75ch; }
.doc-desc code, .doc-table code, .doc-meta code { font-family: var(--nk-font-mono); font-size: 12.5px; background: var(--nk-bg-code); padding: 1px 4px; border-radius: 3px; }
.doc-compare { border: 1px solid var(--nk-border); border-radius: 8px; overflow: hidden; margin: 10px 0 14px; }
.doc-compare-bar { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--nk-bg-sidebar); border-bottom: 1px solid var(--nk-border); font-size: 12px; color: var(--nk-text-tertiary); }
.doc-compare-bar .site-spacer { flex: 1; }
.doc-preview { padding: 18px; background: var(--nk-bg); overflow-x: auto; }
.doc-preview[hidden] { display: none; }
.doc-frame { display: block; width: 100%; min-width: 900px; border: 0; border-radius: 6px; background: var(--nk-bg); }
.doc-preview:has(.doc-frame) { padding: 0; }
.show-item:has(.doc-frame), .show-item.wide { grid-column: 1 / -1; }
.doc-code { margin: 0; padding: 12px 14px; font-family: var(--nk-font-mono); font-size: 12.5px; line-height: 1.55; white-space: pre; overflow-x: auto; background: var(--nk-bg-code); border-top: 1px solid var(--nk-border); color: var(--nk-text); }
.doc-code[hidden] { display: none; }
.doc-code .tag { color: var(--nk-accent); } .doc-code .attr { color: var(--nk-tag-orange-text); }
.doc-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 8px 0 14px; }
.doc-table th { text-align: left; font-weight: 500; color: var(--nk-text-tertiary); font-size: 12px; padding: 6px 8px; border-bottom: 1px solid var(--nk-border); }
.doc-table td { padding: 6px 8px; border-bottom: 1px solid var(--nk-border); vertical-align: top; line-height: 1.45; }
.doc-table td:first-child code { white-space: nowrap; }
.doc-h4 { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; color: var(--nk-text-tertiary); margin: 14px 0 0; }
.doc-meta { font-size: 13px; color: var(--nk-text-secondary); margin: 10px 0 0; display: flex; gap: 8px; flex-wrap: wrap; }
.doc-meta b { font-weight: 500; color: var(--nk-text); }
.doc-classes { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.doc-classes code { font-family: var(--nk-font-mono); font-size: 11.5px; background: var(--nk-bg-callout); padding: 1px 6px; border-radius: 3px; color: var(--nk-text-secondary); }
.show-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr)); gap: 18px; }
.show-item { border: 1px solid var(--nk-border); border-radius: 8px; padding: 14px 16px 16px; background: var(--nk-bg-card); }
.show-item > h4 { margin: 0 0 10px; font-size: 12px; font-weight: 500; color: var(--nk-text-tertiary); font-family: var(--nk-font-mono); }
.show-item > h4 a { color: inherit; text-decoration: none; }
.show-item > h4 a:hover { color: var(--nk-accent); }
.show-body { display: flow-root; overflow-x: auto; }
.site-footer { margin-top: 64px; padding-top: 16px; border-top: 1px solid var(--nk-border); font-size: 12.5px; color: var(--nk-text-tertiary); }
.site-footer a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.site-footer a:hover { color: var(--nk-text); }
.site-brand-on :root, html.site-branded { --nk-accent: #16a34a; }
@media (max-width: 860px) { .site-toc { display: none; } .site-main { padding-top: 20px; } }
`;

export const THEME_JS = `
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  function set(theme) {
    root.setAttribute('data-theme', theme);
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem('nk-theme', theme); } catch (e) {}
    document.querySelectorAll('iframe[data-theme-sync]').forEach(function (f) {
      try { f.contentWindow.postMessage({ nkTheme: theme }, '*'); } catch (e) {}
    });
  }
  var stored = null; try { stored = localStorage.getItem('nk-theme'); } catch (e) {}
  set(stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  if (btn) btn.addEventListener('click', function () { set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });
  window.addEventListener('message', function (e) { if (e.data && e.data.nkTheme) set(e.data.nkTheme); });
  var brand = document.getElementById('brandToggle');
  if (brand) brand.addEventListener('click', function () {
    var on = root.classList.toggle('site-branded');
    brand.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
})();
`;

export function head(t, { title, description, path, extraCss = '' }) {
  const dir = t.dir;
  const canonical = `${SITE}/${t.lang === 'de' ? 'de/' : ''}${path}`;
  const alt = t.lang === 'de' ? `${SITE}/${path}` : `${SITE}/de/${path}`;
  return `<!DOCTYPE html>
<html lang="${t.lang}" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} – NotionKit Elements</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${t.lang}" href="${canonical}">
<link rel="alternate" hreflang="${t.other.lang}" href="${alt}">
<meta property="og:title" content="${title} – NotionKit Elements">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${dir}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${CDN_CSS}">
<script src="${dir}dist/notionkit-elements.min.js"></script>
<style>${CHROME_CSS}${extraCss}</style>
</head>
<body class="nk-body">`;
}

export function nav(t, current) {
  const dir = t.dir;
  // Page links stay inside the language folder; only assets use the ../ prefix.
  const link = (href, label, key) => `<a href="${href}"${current === key ? ' class="current"' : ''}>${label}</a>`;
  return `<nav class="site-nav">
  <a class="site-brand" href="index.html">NotionKit <span>Elements</span> <span class="site-version">v${pkg.version}</span></a>
  ${link('docs.html', t.navDocs, 'docs')}
  ${link('showcase.html', t.navShowcase, 'showcase')}
  ${link('app.html', t.navApp, 'app')}
  <span class="site-spacer"></span>
  <a href="https://notionkit.jungherz.com">${t.navFoundation}</a>
  <a href="https://github.com/JUNGHERZ/NotionKit-Elements">${t.navGitHub}</a>
  <a href="${t.other.href}${current}.html">${t.other.label}</a>
  <button class="nk-topbar-btn nk-share-btn" id="brandToggle" aria-pressed="false" title="${t.brandToggle}">🎨</button>
  <button class="nk-topbar-btn nk-theme-toggle" id="themeToggle" title="${t.themeToggle}">🌙</button>
</nav>`;
}

export const foot = (t) => `<div class="site-footer">NotionKit Elements v${pkg.version} · wrapping NotionKit CSS v${NK_VERSION} · ${t.footer}</div>
<script>${THEME_JS}</script>
</body>
</html>`;
