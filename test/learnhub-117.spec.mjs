// 1.17.0: LearnHub's finding 9 – the texts the elements bring along in
// English and German after the language of the page or the element,
// setStrings() for more, the accessible names from the same dictionary and
// percentages as Intl writes them.
import { test, expect } from '@playwright/test';
import { openHarness, setStage } from './helpers.mjs';

const tick = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const ALL = `
<nk-copy-field id="copy" value="ntn_123" secret></nk-copy-field>
<nk-image-picker id="img"></nk-image-picker>
<nk-peek id="peek" resizable></nk-peek>
<nk-calendar id="cal" time clearable value="2026-06-02T09:30"></nk-calendar>
<nk-calendar-view id="calv"></nk-calendar-view>
<nk-filter-bar id="fb" add search></nk-filter-bar>
<nk-sidebar id="sb" collapsible></nk-sidebar>
<nk-table-view id="tv" new-row></nk-table-view>
<nk-list-view id="lv" new-row></nk-list-view>
<nk-gallery-view id="gv" new-row></nk-gallery-view>
<nk-comments id="cm"></nk-comments>
<nk-ai-input-row id="ai"></nk-ai-input-row>
<nk-cmdk id="ck"></nk-cmdk>
<nk-emoji-picker id="ep"></nk-emoji-picker>
<nk-theme-toggle id="tt"></nk-theme-toggle>
<nk-synced id="sy"></nk-synced>
<nk-modal id="md"></nk-modal>
<nk-page-title id="pt" editable>Chapter 1</nk-page-title>
<nk-page id="pg"></nk-page>
<nk-breadcrumb id="bc"><a href="#">Home</a></nk-breadcrumb>
<nk-tree-item id="ti" icon="🏠">Home</nk-tree-item>`;

// Every built-in text of the elements above, read where a person or a screen reader meets it.
const texts = page => page.evaluate(() => {
  const r = id => document.getElementById(id).shadowRoot;
  const q = (id, sel) => r(id).querySelector(sel);
  const aria = (id, sel) => q(id, sel)?.getAttribute('aria-label');
  document.getElementById('fb').filters = [{ key: 'status', value: 'open', label: 'Status: Open' }];
  return {
    copy: [...r('copy').querySelectorAll('.cf-btn')].map(b => b.textContent),
    img: [...r('img').querySelectorAll('.nk-btn')].map(b => b.textContent),
    peek: [aria('peek', '.pk-resize'), aria('peek', '.nk-topbar-btn')],
    cal: [q('cal', '.cal-head .cal-nav').textContent, ...[...r('cal').querySelectorAll('.cal-head .cal-nav[aria-label]')].map(b => b.getAttribute('aria-label')), aria('cal', '.cal-foot input'), q('cal', '.cal-foot button').textContent],
    calv: [q('calv', '.cv-head .cal-nav').textContent, ...[...r('calv').querySelectorAll('.cv-head .cal-nav[aria-label]')].map(b => b.getAttribute('aria-label'))],
    fb: [...r('fb').querySelectorAll('.nk-db-tool')].map(b => b.textContent).concat(q('fb', '.nk-filter-pill.add').textContent, q('fb', 'input').placeholder, aria('fb', '.fp-remove')),
    sb: aria('sb', '.nk-sidebar-collapse'),
    newRow: [q('tv', '.nk-new-row').textContent, q('lv', '.nk-new-row').textContent, q('gv', '.nk-new-row').textContent],
    cm: [q('cm', 'input').placeholder, aria('cm', 'input'), q('cm', '.nk-btn').textContent],
    ai: [q('ai', 'input').placeholder, aria('ai', 'input'), aria('ai', '.nk-ai-send')],
    ck: [q('ck', 'input').placeholder, aria('ck', '.nk-cmdk')],
    ep: [q('ep', 'input').placeholder, aria('ep', 'input')],
    tt: q('tt', 'button').title,
    sy: q('sy', '.synced-badge').textContent,
    md: aria('md', '.nk-settings-nav'),
    pt: aria('pt', 'h1'),
    pg: q('pg', '.nk-page-icon').title,
    bc: aria('bc', 'nav'),
    ti: [...r('ti').querySelectorAll('.actions [data-action]')].map(b => b.title),
  };
});

const EN = {
  copy: ['Show', 'Copy'], img: ['Upload image', 'Remove'], peek: ['Resize', 'Close'],
  cal: ['Today', 'Previous month', 'Next month', 'Time', 'Clear'], calv: ['Today', 'Previous month', 'Next month'],
  fb: ['Filter', 'Sort', '＋ Filter', 'Search …', 'Remove filter: Status: Open'], sb: 'Close sidebar',
  newRow: ['＋ New page', '＋ New page', '＋ New page'], cm: ['Comment …', 'Comment', 'Send'], ai: ['Ask something …', 'Message', 'Send'],
  ck: ['Search or type a command …', 'Command palette'], ep: ['Search…', 'Search emoji'], tt: 'Toggle light / dark', sy: '⟳ synced',
  md: 'Settings', pt: 'Title', pg: 'Change icon', bc: 'Breadcrumb', ti: ['Add', 'More'],
};
const DE = {
  copy: ['Zeigen', 'Kopieren'], img: ['Bild hochladen', 'Entfernen'], peek: ['Breite ändern', 'Schließen'],
  cal: ['Heute', 'Voriger Monat', 'Nächster Monat', 'Uhrzeit', 'Leeren'], calv: ['Heute', 'Voriger Monat', 'Nächster Monat'],
  fb: ['Filter', 'Sortieren', '＋ Filter', 'Suchen …', 'Filter entfernen: Status: Open'], sb: 'Seitenleiste schließen',
  newRow: ['＋ Neue Seite', '＋ Neue Seite', '＋ Neue Seite'], cm: ['Kommentieren …', 'Kommentar', 'Senden'], ai: ['Frag etwas …', 'Nachricht', 'Senden'],
  ck: ['Suchen oder Befehl eingeben …', 'Befehlspalette'], ep: ['Suchen …', 'Emoji suchen'], tt: 'Hell / Dunkel', sy: '⟳ synchronisiert',
  md: 'Einstellungen', pt: 'Titel', pg: 'Symbol ändern', bc: 'Pfad', ti: ['Hinzufügen', 'Mehr'],
};

test('lang="en" keeps every built-in text as it was; lang="de" – also "de-DE" – gives the German ones, the accessible names too', async ({ page }) => {
  await openHarness(page);
  await setStage(page, ALL);
  expect(await texts(page)).toEqual(EN);
  await page.evaluate(() => { document.documentElement.lang = 'de-DE'; });
  await setStage(page, ALL);
  expect(await texts(page)).toEqual(DE);
});

test('an attribute on the element wins over the dictionary, in German too', async ({ page }) => {
  await openHarness(page);
  await page.evaluate(() => { document.documentElement.lang = 'de'; });
  await setStage(page, '<nk-copy-field id="copy" value="x" copy-label="Link kopieren"></nk-copy-field><nk-image-picker id="img" choose-label="Logo hochladen"></nk-image-picker><nk-peek id="peek" close-label="Hilfe schließen"></nk-peek><nk-table-view id="tv" new-row new-row-label="＋ Neuer Kurs"></nk-table-view>');
  expect(await page.evaluate(() => {
    const q = (id, sel) => document.getElementById(id).shadowRoot.querySelector(sel);
    return [q('copy', '.cf-btn').textContent, q('img', '.nk-btn').textContent, q('peek', '.nk-topbar-btn').getAttribute('aria-label'), q('tv', '.nk-new-row').textContent];
  })).toEqual(['Link kopieren', 'Logo hochladen', 'Hilfe schließen', '＋ Neuer Kurs']);
});

test('the language is the element\'s own: the nearest lang, across shadow roots, else the page\'s', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-copy-field id="a" value="x"></nk-copy-field><section lang="de"><nk-copy-field id="b" value="x"></nk-copy-field><nk-copy-field id="c" value="x" lang="en"></nk-copy-field></section><div id="host" lang="de-AT"></div>');
  const got = await page.evaluate(() => {
    const host = document.getElementById('host').attachShadow({ mode: 'open' });
    host.innerHTML = '<div><nk-copy-field id="d" value="x"></nk-copy-field></div>';
    const label = el => el.shadowRoot.querySelector('.cf-btn').textContent;
    return [...['a', 'b', 'c'].map(id => label(document.getElementById(id))), label(host.getElementById('d'))];
  });
  expect(got).toEqual(['Copy', 'Kopieren', 'Copy', 'Kopieren']);
});

test('setStrings() adds texts for one language or for all; the elements on the page take them at once, and a new <html lang> too', async ({ page }) => {
  await openHarness(page);
  await setStage(page, '<nk-copy-field id="copy" value="x"></nk-copy-field><nk-table-view id="tv" new-row></nk-table-view><nk-peek id="peek"></nk-peek>');
  const read = () => page.evaluate(() => {
    const q = (id, sel) => document.getElementById(id).shadowRoot.querySelector(sel);
    return [q('copy', '.cf-btn').textContent, q('tv', '.nk-new-row').textContent, q('peek', '.nk-topbar-btn').getAttribute('aria-label')];
  });
  expect(await read()).toEqual(['Copy', '＋ New page', 'Close']);
  const keys = await page.evaluate(async () => {
    const { setStrings, builtInStrings } = await import('/dist/notionkit-elements.esm.js');
    setStrings({ newPage: '＋ New course' });                       // every language
    setStrings({ copy: 'Copier', close: 'Fermer' }, 'fr');           // a language of its own
    setStrings({ newPage: '＋ Neuer Kurs' }, 'de-DE');                // German, before the default for all
    const en = builtInStrings('en'), de = builtInStrings('de');
    en.copy = 'changed';                                              // a copy – the dictionary stays
    return [Object.keys(en).sort().join() === Object.keys(de).sort().join(), Object.keys(de).length, builtInStrings('en').copy];
  });
  expect(keys).toEqual([true, 38, 'Copy']);
  expect(await read()).toEqual(['Copy', '＋ New course', 'Close']);
  await page.evaluate(() => { document.documentElement.lang = 'fr'; });
  await tick(page);
  expect(await read()).toEqual(['Copier', '＋ New course', 'Fermer']);
  await page.evaluate(() => { document.documentElement.lang = 'de'; });
  await tick(page);
  expect(await read()).toEqual(['Kopieren', '＋ Neuer Kurs', 'Schließen']);
});

test('percentages as Intl writes them: "45 %" in German with a no-break space, "45%" in English, column.locale first', async ({ page }) => {
  await openHarness(page);
  const setup = () => page.evaluate(() => {
    document.getElementById('stage').innerHTML = '<nk-table-view id="t"></nk-table-view><nk-gallery-view id="g" no-cover meta-keys="done"></nk-gallery-view><nk-board-view id="b" group-key="status"></nk-board-view>';
    const columns = [{ key: 'name', title: true }, { key: 'status', type: 'select', options: [{ value: 'open', label: 'Open' }] }, { key: 'done', type: 'progress' }, { key: 'fr', type: 'progress', locale: 'fr' }];
    const rows = [{ id: 1, name: 'Compliance', status: 'open', done: 45, fr: 45 }];
    for (const id of ['t', 'g', 'b']) document.getElementById(id).setData(columns, rows);
    const r = id => document.getElementById(id).shadowRoot;
    const [plain, french] = [...r('t').querySelectorAll('.nk-progress-label')].map(l => l.textContent);
    // The French column as Intl writes French, whichever space this engine puts in.
    return [plain, french === new Intl.NumberFormat('fr', { style: 'percent' }).format(0.45), r('g').querySelector('.card-meta').textContent, r('b').querySelector('.card-meta span')?.textContent ?? ''];
  });
  expect(await setup()).toEqual(['45%', true, '▰ 45%', '▰ 45%']);
  await page.evaluate(() => { document.documentElement.lang = 'de'; });
  expect(await setup()).toEqual(['45\u00a0%', true, '▰ 45\u00a0%', '▰ 45\u00a0%']);
});

test('a project\'s own element reads the dictionary with this.str(), its own keys too', async ({ page }) => {
  await openHarness(page);
  const got = await page.evaluate(async () => {
    const { NkElement, setStrings } = await import('/dist/notionkit-elements.esm.js');
    setStrings({ enrol: 'Enrol' });
    setStrings({ enrol: 'Einschreiben' }, 'de');
    customElements.define('lh-enrol', class extends NkElement {
      render() { this._b = this.createElement('button', ['nk-btn', 'primary']); this._wrapper.appendChild(this._b); this.onStringsChanged(); }
      onStringsChanged() { this._b.textContent = this.str('enrol'); }
    });
    document.getElementById('stage').innerHTML = '<lh-enrol id="a"></lh-enrol><lh-enrol id="b" lang="de"></lh-enrol>';
    const text = id => document.getElementById(id).shadowRoot.querySelector('button').textContent;
    const before = [text('a'), text('b')];
    document.documentElement.lang = 'de';
    await new Promise(r => setTimeout(r));
    return [...before, text('a'), document.getElementById('a').str('copy')];
  });
  expect(got).toEqual(['Enrol', 'Einschreiben', 'Einschreiben', 'Kopieren']);
});
