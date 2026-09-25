// The single source for docs.html, showcase.html, SKILL.md, llms.txt, the
// coverage check and the parity test – in both languages. `example` and
// `classMarkup` receive the phrase dictionary (tools/words.mjs) for the
// language being rendered. `classMarkup` is the equivalent hand-written
// .nk-* markup: it feeds the before/after toggle in the docs and the parity
// test, which renders both side by side and compares pixels.

export const GROUPS = [
  { id: 'forms',    wave: 1, title: { en: 'Forms & controls',        de: 'Formulare & Controls' } },
  { id: 'content',  wave: 1, title: { en: 'Content elements',        de: 'Inhalts-Elemente' } },
  { id: 'shell',    wave: 2, title: { en: 'App shell & navigation',  de: 'App-Gerüst & Navigation' } },
  { id: 'page',     wave: 3, title: { en: 'Page shell & blocks',     de: 'Seiten-Shell & Bausteine' } },
  { id: 'overlays', wave: 4, title: { en: 'Overlays',                de: 'Overlays' } },
  { id: 'data',     wave: 5, title: { en: 'Data & collaboration',    de: 'Daten & Kollaboration' } },
];

const t = (en, de) => ({ en, de });
const bool = (name, en, de, extra = {}) => ({ name, type: 'boolean', desc: t(en, de), ...extra });
const str = (name, type, en, de, extra = {}) => ({ name, type, desc: t(en, de), ...extra });

// Attributes every form control shares.
const formAttrs = [
  str('name', 'string', 'Form field name (FormData key).', 'Name des Formularfelds (FormData-Schlüssel).'),
  bool('disabled', 'Disables the control.', 'Deaktiviert das Control.'),
];
const changeEvent = (en, de) => ({ name: 'nk-change', detail: '{ value, name }', desc: t(en, de) });

// Shared database sample (columns + rows) for the wave-5 examples.
const dbScript = (W, { actions } = {}) => `<script>{
  const db = document.currentScript.previousElementSibling;
  db.columns = [
    { key: 'name', label: '${W.dbName}', type: 'text', icon: '📄', title: true },
    { key: 'status', label: '${W.dbStatus}', type: 'select', icon: '◉', options: [
      { value: 'planned', label: '${W.statusPlanned}', color: 'orange' }, { value: 'progress', label: '${W.statusProgress}', color: 'blue' }, { value: 'done', label: '${W.statusDone}', color: 'green' } ] },
    { key: 'owner', label: '${W.dbOwner}', type: 'person', icon: '👤' },
    { key: 'due', label: '${W.dbDue}', type: 'date', icon: '📅' },
    { key: 'progress', label: '${W.dbProgress}', type: 'progress', icon: '▰' },
    { key: 'effort', label: '${W.effort}', type: 'number', icon: '#', locale: 'en', format: { minimumFractionDigits: 1 } },${actions ? `
    { key: 'actions', type: 'actions', actions: [{ action: 'open', label: '${W.rowOpen}' }, { action: 'archive', label: '${W.rowArchive}', danger: true }] },` : ''}
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: ${actions ? `{ text: '${W.p1}', desc: '${W.tableDesc}' }` : `'${W.p1}'`}, status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '08.05.2026', progress: 100, effort: 6, cover: '/covers/aurora.svg' },
    { id: 2, icon: '📄', name: '${W.p2}', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '10.05.2026', progress: 100, effort: 4.5, cover: '/covers/dunes.svg' },
    { id: 3, icon: '🗃️', name: '${W.p3}', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '20.05.2026', progress: 65, effort: 12.5, cover: '/covers/meadow.svg' },
    { id: 4, icon: '▤', name: '${W.p4}', status: 'planned', due: '02.06.2026', progress: 0, effort: 8${actions ? ", actions: ['open']" : ''}, cover: '/covers/tide.svg' },
  ];
}</script>`;
const dbTableClass = (W, { actions } = {}) => `<div class="nk-table-wrap"><table class="nk-table">
  <thead><tr><th><span class="th-icon">📄</span>${W.dbName}</th><th><span class="th-icon">◉</span>${W.dbStatus}</th><th><span class="th-icon">👤</span>${W.dbOwner}</th><th><span class="th-icon">📅</span>${W.dbDue}</th><th><span class="th-icon">▰</span>${W.dbProgress}</th><th><span class="th-icon">#</span>${W.effort}</th>${actions ? '<th class="actions"></th>' : ''}</tr></thead>
  <tbody>
    <tr><td><span class="row-title">🧭 ${W.p1}</span>${actions ? `<span class="td-desc">${W.tableDesc}</span>` : ''}</td><td><span class="nk-tag green">${W.statusDone}</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">08.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td><td class="num"><span>6.0</span></td>${actions ? `<td><span class="row-actions"><button class="nk-btn secondary small">${W.rowOpen}</button><button class="nk-btn danger small">${W.rowArchive}</button></span></td>` : ''}</tr>
    <tr><td><span class="row-title">📄 ${W.p2}</span></td><td><span class="nk-tag green">${W.statusDone}</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">10.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td><td class="num"><span>4.5</span></td>${actions ? `<td><span class="row-actions"><button class="nk-btn secondary small">${W.rowOpen}</button><button class="nk-btn danger small">${W.rowArchive}</button></span></td>` : ''}</tr>
    <tr><td><span class="row-title">🗃️ ${W.p3}</span></td><td><span class="nk-tag blue">${W.statusProgress}</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">20.05.2026</span></td><td><span class="nk-progress"><i style="width:65%"></i></span><span class="nk-progress-label">65%</span></td><td class="num"><span>12.5</span></td>${actions ? `<td><span class="row-actions"><button class="nk-btn secondary small">${W.rowOpen}</button><button class="nk-btn danger small">${W.rowArchive}</button></span></td>` : ''}</tr>
    <tr><td><span class="row-title">▤ ${W.p4}</span></td><td><span class="nk-tag orange">${W.statusPlanned}</span></td><td><span class="person-cell">—</span></td><td><span class="date-cell">02.06.2026</span></td><td><span class="nk-progress"><i style="width:0%"></i></span><span class="nk-progress-label">0%</span></td><td class="num"><span>8.0</span></td>${actions ? `<td><span class="row-actions"><button class="nk-btn secondary small">${W.rowOpen}</button></span></td>` : ''}</tr>
  </tbody>
</table><div class="nk-new-row">＋ New page</div></div>`;
const dbGalleryClass = W => `<div class="nk-gallery" role="list">
  <div class="nk-card" role="listitem" tabindex="0"><div class="nk-cover"><img src="/covers/aurora.svg" alt=""></div><div class="card-title">🧭 ${W.p1}</div><div class="card-meta"><span><span class="nk-tag green">${W.statusDone}</span></span><span>📅 08.05.2026</span></div></div>
  <div class="nk-card" role="listitem" tabindex="0"><div class="nk-cover"><img src="/covers/dunes.svg" alt=""></div><div class="card-title">📄 ${W.p2}</div><div class="card-meta"><span><span class="nk-tag green">${W.statusDone}</span></span><span>📅 10.05.2026</span></div></div>
  <div class="nk-card" role="listitem" tabindex="0"><div class="nk-cover"><img src="/covers/meadow.svg" alt=""></div><div class="card-title">🗃️ ${W.p3}</div><div class="card-meta"><span><span class="nk-tag blue">${W.statusProgress}</span></span><span>📅 20.05.2026</span></div></div>
  <div class="nk-card" role="listitem" tabindex="0"><div class="nk-cover"><img src="/covers/tide.svg" alt=""></div><div class="card-title">▤ ${W.p4}</div><div class="card-meta"><span><span class="nk-tag orange">${W.statusPlanned}</span></span><span>📅 02.06.2026</span></div></div>
  <div class="nk-new-row" role="button" tabindex="0">＋ New page</div>
</div>`;
const dbListClass = W => `<div class="nk-list">
  <div class="nk-list-item"><span class="l-icon">🧭</span><span class="l-title">${W.p1}</span><span class="l-meta">08.05.2026<span class="nk-tag green">${W.statusDone}</span></span></div>
  <div class="nk-list-item"><span class="l-icon">📄</span><span class="l-title">${W.p2}</span><span class="l-meta">10.05.2026<span class="nk-tag green">${W.statusDone}</span></span></div>
  <div class="nk-list-item"><span class="l-icon">🗃️</span><span class="l-title">${W.p3}</span><span class="l-meta">20.05.2026<span class="nk-tag blue">${W.statusProgress}</span></span></div>
  <div class="nk-list-item"><span class="l-icon">▤</span><span class="l-title">${W.p4}</span><span class="l-meta">02.06.2026<span class="nk-tag orange">${W.statusPlanned}</span></span></div>
</div>`;
const dbBoardClass = W => `<div class="nk-board active">
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag orange">${W.statusPlanned}</span><span class="count">1</span></div><div class="nk-card" draggable="true"><div class="card-title">▤ ${W.p4}</div><div class="card-meta"><span>📅 02.06.2026</span><span>▰ 0%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag blue">${W.statusProgress}</span><span class="count">1</span></div><div class="nk-card" draggable="true"><div class="card-title">🗃️ ${W.p3}</div><div class="card-meta"><span>📅 20.05.2026</span><span>▰ 65%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag green">${W.statusDone}</span><span class="count">2</span></div><div class="nk-card" draggable="true"><div class="card-title">🧭 ${W.p1}</div><div class="card-meta"><span>📅 08.05.2026</span><span>▰ 100%</span></div></div><div class="nk-card" draggable="true"><div class="card-title">📄 ${W.p2}</div><div class="card-meta"><span>📅 10.05.2026</span><span>▰ 100%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
</div>`;

// Month sheets for nk-calendar and nk-calendar-view, written out the way the
// elements draw them – weeks from Monday, `today` fixed so the docs do not
// change from day to day. The same helpers as in NotionKit's catalog.
const pad2 = n => String(n).padStart(2, '0');
const isoDay = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function isoWeekOf(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}
const CHEVRON = { prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>', next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>' };
function monthOf(W, month) {
  const fmt = (o, d) => new Intl.DateTimeFormat(W.locale, o).format(d);
  const [y, m] = month.split('-').map(Number), first = new Date(y, m - 1, 1), offset = (first.getDay() + 6) % 7;
  const weekdays = Array.from({ length: 7 }, (_, i) => fmt({ weekday: 'short' }, new Date(2026, 5, 1 + i)).replace('.', ''));
  return { fmt, m, first, weekdays, day: i => new Date(y, m - 1, 1 - offset + i), rows: Math.ceil((offset + new Date(y, m, 0).getDate()) / 7) };
}
const calHead = (W, title, cls) => `<div class="${cls}-head"><div class="${cls}-title">${title}</div><button class="cal-nav">${W.calToday}</button><button class="cal-nav" aria-label="${W.calPrev}">${CHEVRON.prev}</button><button class="cal-nav" aria-label="${W.calNext}">${CHEVRON.next}</button></div>`;
function calendarClass(W, { month, value, start, end, today, off = {}, marks = {}, foot = '' }) {
  const g = monthOf(W, month);
  const rows = [`<span class="cal-wd">${W.calWeek}</span>` + g.weekdays.map(w => `<span class="cal-wd">${w.slice(0, 2)}</span>`).join('')];
  for (let r = 0; r < 6; r++) {
    let row = `<span class="cal-week">${isoWeekOf(g.day(r * 7))}</span>`;
    for (let c = 0; c < 7; c++) {
      const d = g.day(r * 7 + c), iso = isoDay(d), dots = (marks[iso] || []).map(t => `<i class="${t}"></i>`).join('');
      const cls = ['cal-day', d.getMonth() !== g.m - 1 && 'out', (d.getDay() % 6 === 0 || off[iso]) && 'off', iso === today && 'today',
        iso === value && 'selected', iso === start && 'start', iso === end && 'end', start && end && iso > start && iso < end && 'in-range'].filter(Boolean).join(' ');
      row += `<button class="${cls}"${off[iso] ? ` title="${off[iso]}"` : ''}>${d.getDate()}${dots ? `<span class="cal-marks">${dots}</span>` : ''}</button>`;
    }
    rows.push(row);
  }
  return `<div class="nk-calendar weeks">
    ${calHead(W, g.fmt({ month: 'long', year: 'numeric' }, g.first), 'cal')}
    <div class="cal-grid">
      ${rows.join('\n      ')}
    </div>${foot}
  </div>`;
}
function calendarViewClass(W, { month, today, items = {} }) {
  const g = monthOf(W, month);
  const rows = [`<div class="cv-wd">${W.calWeek}</div>` + g.weekdays.map(w => `<div class="cv-wd">${w}</div>`).join('')];
  for (let r = 0; r < g.rows; r++) {
    let row = `<div class="cv-week">${isoWeekOf(g.day(r * 7))}</div>`;
    for (let c = 0; c < 7; c++) {
      const d = g.day(r * 7 + c), iso = isoDay(d);
      const cls = ['cv-day', d.getMonth() !== g.m - 1 && 'out', iso === today && 'today'].filter(Boolean).join(' ');
      row += `<div class="${cls}"><span class="cv-num">${d.getDate()}</span>${(items[iso] || []).map(t => `<button class="cv-item">${t}</button>`).join('')}</div>`;
    }
    rows.push(row);
  }
  return `<div class="nk-calendar-view weeks">
  ${calHead(W, g.fmt({ month: 'long', year: 'numeric' }, g.first), 'cv')}
  <div class="cv-grid">
    ${rows.join('\n    ')}
  </div>
</div>`;
}
// A holiday and the marks of the picker example, as the `days` of nk-calendar.
const calDays = W => ({ '2026-06-04': { off: true, label: W.holidayCorpus }, '2026-06-02': { marks: ['blue'] }, '2026-06-11': { marks: ['orange', 'red'] }, '2026-06-24': { marks: ['green'] } });

export const CATALOG = [
// ============================================================ WAVE 1 · FORMS
{
  tag: 'nk-btn', group: 'forms', classes: ['nk-btn', 'primary', 'secondary', 'danger', 'danger-solid', 'small', 'nk-topbar-btn', 'nk-share-btn', 'nk-db-tool', 'active', 'nk-sidebar-toggle'],
  title: t('Button', 'Button'),
  desc: t('Renders <code>button.nk-btn</code>, or <code>a.nk-btn</code> when <code>href</code> is set. Modifier classes become attributes. A slotted <code>&lt;svg&gt;</code> is sized by the stylesheet – pass it directly, never wrapped. Stretched across a column – a full-width button on a sign-in page – it keeps its label centred.',
          'Rendert <code>button.nk-btn</code>, mit <code>href</code> ein <code>a.nk-btn</code>. Modifikator-Klassen werden Attribute. Ein geslottetes <code>&lt;svg&gt;</code> bekommt seine Größe aus dem Stylesheet – direkt übergeben, nie verpackt. Über eine Spalte gestreckt – ein Button über die volle Breite auf einer Anmeldeseite – bleibt seine Beschriftung mittig.'),
  mobile: t('Unchanged. The button grows with its label; combine with <code>small</code> in dense toolbars.', 'Unverändert. Der Button wächst mit seiner Beschriftung; in dichten Leisten <code>small</code> setzen.'),
  attrs: [
    str('variant', 'primary | secondary | danger | danger-solid | topbar | share | tool | sidebar', 'Visual variant. <code>topbar</code> and <code>share</code> render <code>.nk-topbar-btn</code> for the top bar. <code>tool</code> renders <code>.nk-db-tool</code>, a tool in the database toolbar (<code>slot="tools"</code> of <code>nk-database</code>). <code>sidebar</code> is the ☰ <code>.nk-topbar-btn.nk-sidebar-toggle</code>: shown below 860px only, a click opens the <code>nk-sidebar</code> of its app as a drawer and sets <code>aria-expanded</code>.', 'Optische Variante. <code>topbar</code> und <code>share</code> rendern <code>.nk-topbar-btn</code> für die Topbar. <code>tool</code> rendert <code>.nk-db-tool</code>, ein Werkzeug der Datenbank-Leiste (<code>slot="tools"</code> von <code>nk-database</code>). <code>sidebar</code> ist das ☰ <code>.nk-topbar-btn.nk-sidebar-toggle</code>: nur unter 860px sichtbar, ein Klick öffnet die <code>nk-sidebar</code> seiner App als Schublade und setzt <code>aria-expanded</code>.'),
    bool('active', 'A tool in effect – a set filter – takes the accent (<code>variant="tool"</code>).', 'Ein wirkendes Werkzeug – ein gesetzter Filter – bekommt den Akzent (<code>variant="tool"</code>).'),
    bool('small', 'Compact padding and 12.5px text.', 'Kompaktes Padding und 12,5px Text.'),
    bool('disabled', 'Disabled; clicks are swallowed.', 'Deaktiviert; Klicks werden verschluckt.'),
    str('type', 'button | submit | reset', 'For <code>submit</code>/<code>reset</code> the surrounding <code>&lt;form&gt;</code> is submitted or reset.', 'Bei <code>submit</code>/<code>reset</code> wird das umgebende <code>&lt;form&gt;</code> abgeschickt bzw. zurückgesetzt.', { default: 'button' }),
    str('href', 'URL', 'Renders a link instead of a button.', 'Rendert einen Link statt eines Buttons.'),
  ],
  slots: [{ name: '(default)', desc: t('Label text and an optional <code>&lt;svg&gt;</code> icon.', 'Beschriftung und optionales <code>&lt;svg&gt;</code>-Icon.') }],
  events: [{ name: 'click', detail: '(native, composed)', desc: t('The native click bubbles out of the shadow root.', 'Der native Klick bubbelt aus dem Shadow Root.') }],
  example: W => `<nk-btn variant="primary">${W.save}</nk-btn>
<nk-btn variant="secondary">${W.cancel}</nk-btn>
<nk-btn variant="danger" small>${W.delete}</nk-btn>`,
  classMarkup: W => `<button class="nk-btn primary">${W.save}</button>
<button class="nk-btn secondary">${W.cancel}</button>
<button class="nk-btn danger small">${W.delete}</button>`,
},
{
  tag: 'nk-input', group: 'forms', classes: ['nk-input', 'wide'],
  title: t('Input', 'Eingabefeld'),
  desc: t('A native <code>&lt;input&gt;</code> inside the shadow root, wired into the surrounding form through ElementInternals: FormData, reset and <code>required</code> validation work as with a plain input.',
          'Ein natives <code>&lt;input&gt;</code> im Shadow Root, per ElementInternals ins umgebende Formular eingebunden: FormData, Reset und <code>required</code>-Validierung funktionieren wie beim nackten Input.'),
  mobile: t('Minimum width 210px – inside a panel never wider than the tile; use <code>wide</code> to fill the row.', 'Mindestbreite 210px – in einem Panel nie breiter als die Kachel; <code>wide</code> füllt die Zeile.'),
  attrs: [
    str('value', 'string', 'Current value; also the reset value.', 'Aktueller Wert; zugleich der Reset-Wert.'),
    str('type', 'text | email | password | number | date | …', 'Forwarded to the native input.', 'Wird an das native Input durchgereicht.', { default: 'text' }),
    str('placeholder', 'string', 'Placeholder text.', 'Platzhaltertext.'),
    ...formAttrs,
    bool('required', 'Marks the field required; validity is mirrored onto the host.', 'Pflichtfeld; die Validität wird auf den Host gespiegelt.'),
    bool('readonly', 'Read-only.', 'Nur lesen.'),
    bool('wide', 'Full width (<code>.wide</code>).', 'Volle Breite (<code>.wide</code>).'),
  ],
  slots: [],
  events: [
    changeEvent('Fired on commit (blur/Enter), like the native change event.', 'Beim Übernehmen (Blur/Enter), wie das native change-Event.'),
    { name: 'nk-input', detail: '{ value, name }', desc: t('Fired on every keystroke.', 'Bei jedem Tastendruck.') },
  ],
  props: ['value', 'name', 'disabled', 'required', 'form', 'validity'],
  methods: ['focus()', 'blur()', 'select()', 'checkValidity()', 'reportValidity()'],
  example: W => `<nk-input name="name" value="Ada Lovelace" placeholder="${W.displayName}"></nk-input>`,
  classMarkup: W => `<input class="nk-input" name="name" value="Ada Lovelace" placeholder="${W.displayName}">`,
},
{
  tag: 'nk-copy-field', group: 'forms', classes: ['nk-copy-field', 'cf-value', 'cf-btn', 'copied', 'mono', 'wrap', 'wide'],
  title: t('Copy field', 'Kopierfeld'),
  desc: t('A value to take along – a link, an address, a key – as tall as an input, with Copy inside on the right: it writes the clipboard and says “Copied” in green for a moment; where the clipboard is not allowed, the value is shown and selected for ⌘C. <code>secret</code> masks it behind Show/Hide, Copy still copies the real value. <code>value</code> set as a property is not reflected, so a key never lands in the markup.',
          'Ein Wert zum Mitnehmen – ein Link, eine Adresse, ein Schlüssel –, so hoch wie ein Eingabefeld, mit Kopieren rechts darin: Es schreibt die Zwischenablage und sagt kurz „Kopiert“ in Grün; wo die Zwischenablage nicht erlaubt ist, wird der Wert gezeigt und für ⌘C markiert. <code>secret</code> verbirgt ihn hinter Zeigen/Verbergen, Kopieren kopiert trotzdem den echten Wert. Als Property gesetzt, wird <code>value</code> nicht gespiegelt, ein Schlüssel landet also nie im Markup.'),
  mobile: t('Keeps to its column – inside a panel even below its 210px: the value is cut, never the actions.', 'Bleibt in seiner Spalte – in einem Panel auch unter seinen 210px: Gekürzt wird der Wert, nie die Aktionen.'),
  attrs: [str('value', 'string', 'The value.', 'Der Wert.'), bool('secret', 'Masked, with Show/Hide.', 'Verborgen, mit Zeigen/Verbergen.'), bool('mono', 'Monospace – addresses, keys, code.', 'Monospace – Adressen, Schlüssel, Code.'), bool('wrap', 'A long value breaks instead of an ellipsis.', 'Ein langer Wert bricht um statt Auslassungspunkten.'), bool('wide', 'Fills the row.', 'Füllt die Zeile.'), str('copy-label', 'string', 'Button text.', 'Button-Text.', { default: 'Copy' }), str('copied-label', 'string', 'Text for the moment after.', 'Text für den Moment danach.', { default: 'Copied' }), str('show-label', 'string', 'Reveal (secret).', 'Zeigen (secret).', { default: 'Show' }), str('hide-label', 'string', 'Mask again.', 'Wieder verbergen.', { default: 'Hide' })],
  slots: [],
  events: [{ name: 'nk-action', detail: "{ action: 'copy', value, ok }", desc: t('Copy clicked; <code>ok</code> is false where the clipboard refused.', 'Kopieren geklickt; <code>ok</code> ist false, wenn die Zwischenablage ablehnte.') }],
  props: ['value', 'secret'], methods: ['copy()'],
  example: W => `<div style="max-width:340px"><nk-copy-field value="https://monahilft.notionkit.app" copy-label="${W.copyBtn}"></nk-copy-field></div>
<div style="max-width:340px;margin-top:10px"><nk-copy-field value="ntn_4f2a9c1e8b7d6a5f3e2c" secret mono copy-label="${W.copyBtn}" show-label="${W.show}"></nk-copy-field></div>`,
  classMarkup: W => `<div style="max-width:340px"><div class="nk-copy-field"><span class="cf-value">https://monahilft.notionkit.app</span><button class="cf-btn">${W.copyBtn}</button></div></div>
<div style="max-width:340px;margin-top:10px"><div class="nk-copy-field mono"><span class="cf-value">••••••••••••••••••••••••</span><button class="cf-btn">${W.show}</button><button class="cf-btn">${W.copyBtn}</button></div></div>`,
},
{
  tag: 'nk-image-picker', group: 'forms', classes: ['nk-profile-row', 'big-avatar', 'square', 'pr-actions', 'pr-remove'],
  title: t('Image picker', 'Bildauswahl'),
  desc: t('A picture for a person or a workspace, on NotionKit’s profile row: round, or <code>square</code> for a workspace icon, with Upload / Change and Remove beside it. From GlassKit Elements: the file is decoded with its EXIF rotation, drawn no larger than <code>max</code> and handed over as a data URL in <code>nk-change</code> – upload it yourself; an unreadable file fires <code>nk-error</code>. JPEG is drawn on white; <code>type="image/png"</code> keeps transparency. <code>src</code> as a property is not reflected, so megabytes never land in the DOM.',
          'Ein Bild für eine Person oder einen Workspace, auf NotionKits Profilzeile: rund, oder <code>square</code> für ein Workspace-Icon, mit Hochladen / Ändern und Entfernen daneben. Aus GlassKit Elements: Die Datei wird mit ihrer EXIF-Drehung dekodiert, nicht größer als <code>max</code> gezeichnet und als Data-URL in <code>nk-change</code> übergeben – hochladen übernimmst du; eine unlesbare Datei feuert <code>nk-error</code>. JPEG wird auf Weiß gezeichnet; <code>type="image/png"</code> behält Transparenz. <code>src</code> als Property wird nicht gespiegelt, Megabytes landen also nie im DOM.'),
  mobile: t('Unchanged; the actions stay beside the picture.', 'Unverändert; die Aktionen bleiben neben dem Bild.'),
  attrs: [str('src', 'URL / data URL', 'Starting picture.', 'Startbild.'), str('initials', 'string', 'Shown without a picture.', 'Ohne Bild angezeigt.'), bool('square', 'Rounded square – a workspace icon.', 'Abgerundetes Quadrat – ein Workspace-Icon.'), str('max', 'px', 'Longest edge after scaling.', 'Längste Kante nach dem Skalieren.', { default: '512' }), str('type', 'MIME', 'Output format.', 'Ausgabeformat.', { default: 'image/jpeg' }), str('quality', '0–1', 'JPEG / WebP quality.', 'JPEG-/WebP-Qualität.', { default: '0.82' }), str('accept', 'string', 'File dialog filter.', 'Filter des Dateidialogs.', { default: 'image/*' }), str('label', 'string', 'Names the group.', 'Benennt die Gruppe.'), str('choose-label', 'string', 'Without a picture.', 'Ohne Bild.', { default: 'Upload image' }), str('change-label', 'string', 'With a picture.', 'Mit Bild.', { default: 'Change image' }), str('remove-label', 'string', 'Remove button.', 'Entfernen-Button.', { default: 'Remove' })],
  slots: [],
  events: [{ name: 'nk-change', detail: '{ dataUrl, width, height, size }', desc: t('A picture chosen – or removed, with an empty dataUrl.', 'Ein Bild gewählt – oder entfernt, mit leerer dataUrl.') }, { name: 'nk-error', detail: '{ message, name }', desc: t('The file cannot be decoded.', 'Die Datei lässt sich nicht dekodieren.') }],
  props: ['src', 'square'], methods: ['choose()'],
  example: W => `<nk-image-picker initials="AL" choose-label="${W.uploadImage}"></nk-image-picker>
<nk-image-picker square src="/favicon.svg" change-label="${W.changeImage}" remove-label="${W.remove}"></nk-image-picker>`,
  classMarkup: W => `<div class="nk-profile-row"><div class="big-avatar">AL</div><div class="pr-actions"><button class="nk-btn secondary small">${W.uploadImage}</button></div></div>
<div class="nk-profile-row"><div class="big-avatar square"><img src="/favicon.svg" alt=""></div><div class="pr-actions"><button class="nk-btn secondary small">${W.changeImage}</button><button class="nk-btn secondary small pr-remove">${W.remove}</button></div></div>`,
},
{
  tag: 'nk-calendar', group: 'forms', classes: ['nk-calendar', 'weeks', 'cal-head', 'cal-title', 'cal-nav', 'cal-grid', 'cal-wd', 'cal-week', 'cal-day', 'out', 'off', 'today', 'selected', 'start', 'end', 'in-range', 'cal-marks', 'cal-foot', 'nk-pop', 'floating', 'sheet', 'open'],
  title: t('Date picker', 'Datumsauswahl'),
  desc: t('Notion’s date picker as one element (NotionKit 1.9.0): a month with Today and ‹ ›, the keys, bounds and a form value. The value is a day (<code>YYYY-MM-DD</code>); with <code>range</code> an interval <code>start/end</code>, picked in two clicks in either order; with <code>time</code> a day and a time (<code>YYYY-MM-DDTHH:MM</code>). <code>weeks</code> puts the ISO calendar week in front of each row (“KW” in German), <code>weekend</code> greys the days not worked, the <code>days</code> property adds holidays (<code>off</code> with a <code>label</code>) and up to three <code>marks</code> per day in the nine colours – deadlines, milestones. Days outside <code>min</code>/<code>max</code> are announced as unavailable and cannot be picked. Arrows move by a day or a week, Home/End to the ends of the week, PageUp/PageDown by a month (with Shift a year), Enter or Space picks; one day is in the tab order. Month names, weekdays and the first day of the week come from the page’s language; <code>week-start="1"</code> fixes Monday. With <code>floating sheet</code> it is a popover that <code>show(anchor)</code> opens under a property or a cell, and a bottom sheet on a phone; a pick closes it. Put a floating one directly under <code>&lt;body&gt;</code>: an open <code>nk-dialog</code>, <code>nk-modal</code> or <code>nk-sheet</code> leaves it usable, so it opens from a field in a dialog as well.',
          'Notions Datumsauswahl als ein Element (NotionKit 1.9.0): ein Monat mit Heute und ‹ ›, Tasten, Grenzen und einem Formularwert. Der Wert ist ein Tag (<code>YYYY-MM-DD</code>); mit <code>range</code> ein Zeitraum <code>start/ende</code>, in zwei Klicks in beliebiger Reihenfolge gewählt; mit <code>time</code> ein Tag mit Uhrzeit (<code>YYYY-MM-DDTHH:MM</code>). <code>weeks</code> stellt jeder Reihe die ISO-Kalenderwoche voran („KW“ auf Deutsch), <code>weekend</code> graut die Tage ohne Arbeit, die Property <code>days</code> ergänzt Feiertage (<code>off</code> mit <code>label</code>) und bis zu drei <code>marks</code> je Tag in den neun Farben – Fristen, Meilensteine. Tage außerhalb von <code>min</code>/<code>max</code> werden als nicht verfügbar angesagt und lassen sich nicht wählen. Pfeile gehen einen Tag oder eine Woche weiter, Pos1/Ende an die Enden der Woche, Bild↑/Bild↓ einen Monat (mit Umschalt ein Jahr), Enter oder Leertaste wählt; ein Tag steht in der Tab-Reihenfolge. Monatsnamen, Wochentage und den ersten Wochentag liefert die Sprache der Seite; <code>week-start="1"</code> legt Montag fest. Mit <code>floating sheet</code> ist es ein Popover, das <code>show(anchor)</code> unter einer Eigenschaft oder Zelle öffnet, und auf dem Telefon ein Bottom Sheet; eine Wahl schließt es. Einen schwebenden direkt unter <code>&lt;body&gt;</code> legen: Ein offener <code>nk-dialog</code>, <code>nk-modal</code> oder <code>nk-sheet</code> lässt ihn bedienbar, er öffnet also auch aus einem Feld im Dialog.'),
  mobile: t('Floating with <code>sheet</code>: a bottom sheet with 44px cells, a thumb’s width; seven days and the week column still fit a 390px screen.', 'Schwebend mit <code>sheet</code>: ein Bottom Sheet mit 44px-Zellen, eine Daumenbreite; sieben Tage und die Wochenspalte passen weiter auf einen 390px-Schirm.'),
  attrs: [
    str('value', 'YYYY-MM-DD | start/end | …THH:MM', 'The day, the range or the day and time; also the reset value.', 'Der Tag, der Zeitraum oder Tag und Uhrzeit; zugleich der Reset-Wert.'),
    str('month', 'YYYY-MM', 'The month shown first; default the value’s, else today’s.', 'Der zuerst gezeigte Monat; Standard der des Werts, sonst der heutige.'),
    str('min', 'YYYY-MM-DD', 'First day that can be picked.', 'Erster wählbarer Tag.'), str('max', 'YYYY-MM-DD', 'Last day that can be picked.', 'Letzter wählbarer Tag.'),
    bool('range', 'Two picks make a range <code>start/end</code>.', 'Zwei Klicks ergeben einen Zeitraum <code>start/ende</code>.'),
    bool('time', 'A time field under the month – single days only.', 'Ein Zeitfeld unter dem Monat – nur für einzelne Tage.'),
    bool('clearable', 'A Clear button under the month.', 'Ein Löschen-Button unter dem Monat.'),
    bool('weeks', 'The ISO calendar week in front of each row.', 'Die ISO-Kalenderwoche vor jeder Reihe.'),
    str('week-start', '0–6', 'First day of the week: 0 Sunday, 1 Monday …', 'Erster Wochentag: 0 Sonntag, 1 Montag …', { default: 'Intl' }),
    str('weekend', 'list', 'Weekdays not worked, greyed – <code>6,0</code>.', 'Wochentage ohne Arbeit, gegraut – <code>6,0</code>.'),
    str('days', 'JSON', 'Per day <code>{ off, label, marks }</code>; also the property.', 'Je Tag <code>{ off, label, marks }</code>; auch als Property.'),
    str('today', 'YYYY-MM-DD', 'Another today – for tests and docs.', 'Ein anderes Heute – für Tests und Doku.'),
    str('locale', 'BCP 47', 'Language of the names and the week.', 'Sprache der Namen und der Woche.', { default: 'lang' }),
    bool('floating', 'A popover over the page: <code>show(anchor)</code>, <code>close()</code>.', 'Ein Popover über der Seite: <code>show(anchor)</code>, <code>close()</code>.'),
    bool('sheet', 'Floating: a bottom sheet on a phone.', 'Schwebend: ein Bottom Sheet auf dem Telefon.'),
    bool('open', 'Floating: shown.', 'Schwebend: gezeigt.'),
    str('align', 'end | start', 'Floating: right or left edge on the anchor’s.', 'Schwebend: rechte oder linke Kante an der des Ankers.', { default: 'end' }),
    str('label', 'string', 'Names the month group for screen readers.', 'Benennt die Monatsgruppe für Screenreader.'),
    str('today-label', 'string', 'Today button.', 'Heute-Button.', { default: 'Today' }),
    str('prev-label', 'string', 'Names ‹.', 'Benennt ‹.', { default: 'Previous month' }), str('next-label', 'string', 'Names ›.', 'Benennt ›.', { default: 'Next month' }),
    str('week-label', 'string', 'Head of the week column.', 'Kopf der Wochenspalte.', { default: 'W · KW' }),
    str('time-label', 'string', 'Names the time field.', 'Benennt das Zeitfeld.', { default: 'Time' }), str('clear-label', 'string', 'Clear button.', 'Löschen-Button.', { default: 'Clear' }),
    ...formAttrs,
    bool('required', 'A value is required; validity is set on the host.', 'Ein Wert ist Pflicht; die Validität steht am Host.'),
  ],
  slots: [],
  events: [
    { name: 'nk-change', detail: '{ value, start, end, time }', desc: t('The value changed: a day picked – for a range the second one –, a new time, or Clear. The same day again is no change.', 'Der Wert hat sich geändert: ein Tag gewählt – beim Zeitraum der zweite –, eine neue Uhrzeit oder Löschen. Derselbe Tag noch einmal ist keine Änderung.') },
    { name: 'nk-month', detail: '{ month }', desc: t('Another month shown.', 'Ein anderer Monat gezeigt.') },
    { name: 'nk-toggle', detail: '{ open }', desc: t('Floating: opened or closed.', 'Schwebend: geöffnet oder geschlossen.') },
  ],
  props: ['value', 'start', 'end', 'month', 'days', 'open', 'form', 'validity'], methods: ['show(anchor)', 'close()', 'toggle(anchor)', 'focusDay()', 'checkValidity()'],
  example: W => `<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
<div class="nk-pop"><nk-calendar name="due" value="2026-06-02T09:30" time clearable weeks week-start="1" weekend="6,0" today="2026-06-17" today-label="${W.calToday}" time-label="${W.calTime}" clear-label="${W.calClear}" days='${JSON.stringify(calDays(W))}'></nk-calendar></div>
<div class="nk-pop"><nk-calendar name="sprint" range value="2026-06-08/2026-06-12" weeks week-start="1" weekend="6,0" today="2026-06-17" today-label="${W.calToday}" days='${JSON.stringify({ '2026-06-04': calDays(W)['2026-06-04'] })}'></nk-calendar></div>
</div>`,
  classMarkup: W => `<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
<div class="nk-pop">
  ${calendarClass(W, { month: '2026-06', value: '2026-06-02', today: '2026-06-17', off: { '2026-06-04': W.holidayCorpus }, marks: { '2026-06-02': ['blue'], '2026-06-11': ['orange', 'red'], '2026-06-24': ['green'] }, foot: `\n    <div class="cal-foot"><input class="nk-input" type="time" value="09:30" aria-label="${W.calTime}"><button class="cal-nav">${W.calClear}</button></div>` })}
</div>
<div class="nk-pop">
  ${calendarClass(W, { month: '2026-06', start: '2026-06-08', end: '2026-06-12', today: '2026-06-17', off: { '2026-06-04': W.holidayCorpus } })}
</div>
</div>`,
},
{
  tag: 'nk-textarea', group: 'forms', classes: ['nk-textarea', 'wide'],
  title: t('Textarea', 'Textbereich'),
  desc: t('Multi-line sibling of <code>nk-input</code>. The initial value is the <code>value</code> attribute or the element’s text content.', 'Mehrzeiliges Geschwister von <code>nk-input</code>. Startwert ist das <code>value</code>-Attribut oder der Textinhalt des Elements.'),
  mobile: t('Resizes vertically only; <code>wide</code> fills the row.', 'Nur vertikal veränderbar; <code>wide</code> füllt die Zeile.'),
  attrs: [
    str('value', 'string', 'Current value.', 'Aktueller Wert.'),
    str('placeholder', 'string', 'Placeholder text.', 'Platzhaltertext.'),
    str('rows', 'number', 'Visible rows.', 'Sichtbare Zeilen.'),
    ...formAttrs,
    bool('required', 'Required field.', 'Pflichtfeld.'),
    bool('wide', 'Full width.', 'Volle Breite.'),
  ],
  slots: [{ name: '(default)', desc: t('Initial text (used when <code>value</code> is absent).', 'Starttext (wenn kein <code>value</code> gesetzt ist).') }],
  events: [changeEvent('On commit.', 'Beim Übernehmen.'), { name: 'nk-input', detail: '{ value, name }', desc: t('On every keystroke.', 'Bei jedem Tastendruck.') }],
  example: W => `<nk-textarea name="bio" rows="3" placeholder="${W.bioPlaceholder}"></nk-textarea>`,
  classMarkup: W => `<textarea class="nk-textarea" name="bio" rows="3" placeholder="${W.bioPlaceholder}"></textarea>`,
},
{
  tag: 'nk-select', group: 'forms', classes: ['nk-select', 'compact'],
  title: t('Select', 'Auswahlfeld'),
  desc: t('Light-DOM <code>&lt;option&gt;</code> and <code>&lt;optgroup&gt;</code> children are copied into the shadow <code>&lt;select&gt;</code> and kept in step when a framework swaps them. The empty string is a valid value; a <code>value</code> naming no option leaves the selection alone. A <code>value</code> – attribute or property – whose option is not there yet waits and is applied once the option arrives, over the browser’s preselection of the first option, unless someone has chosen another in the meantime; settling on it fires no <code>nk-change</code>.',
          'Light-DOM-<code>&lt;option&gt;</code>- und <code>&lt;optgroup&gt;</code>-Kinder werden in das Shadow-<code>&lt;select&gt;</code> kopiert und bleiben synchron, wenn ein Framework sie austauscht. Der leere String ist ein gültiger Wert; ein <code>value</code> ohne passende Option lässt die Auswahl unangetastet. Ein <code>value</code> – Attribut oder Property –, dessen Option noch fehlt, wartet und wird angewendet, sobald die Option da ist, vor der Vorauswahl der ersten Option durch den Browser, es sei denn, jemand hat inzwischen eine andere gewählt; das Einrasten feuert kein <code>nk-change</code>.'),
  mobile: t('Uses the native picker of the platform (<code>color-scheme</code> follows the theme).', 'Nutzt den nativen Picker der Plattform (<code>color-scheme</code> folgt dem Theme).'),
  attrs: [
    str('value', 'string', 'Selected value.', 'Ausgewählter Wert.'),
    ...formAttrs,
    bool('required', 'Required field.', 'Pflichtfeld.'),
    bool('compact', '120px minimum width (<code>.compact</code>), e.g. inside a member row.', '120px Mindestbreite (<code>.compact</code>), z. B. in einer Mitgliederzeile.'), bool('wide', 'Full width (<code>.nk-select.wide</code>).', 'Volle Breite (<code>.nk-select.wide</code>).'),
  ],
  slots: [{ name: '(default)', desc: t('<code>&lt;option&gt;</code> / <code>&lt;optgroup&gt;</code> children – direct children only.', '<code>&lt;option&gt;</code>-/<code>&lt;optgroup&gt;</code>-Kinder – nur direkte Kinder.') }],
  events: [changeEvent('On selection.', 'Bei Auswahl.')],
  props: ['value', 'selectedIndex', 'options'],
  methods: ['refresh()'],
  example: W => `<nk-select name="role" value="editor">
  <option value="viewer">${W.viewer}</option>
  <option value="editor">${W.editor}</option>
  <option value="admin">${W.admin}</option>
</nk-select>`,
  classMarkup: W => `<select class="nk-select" name="role">
  <option value="viewer">${W.viewer}</option>
  <option value="editor" selected>${W.editor}</option>
  <option value="admin">${W.admin}</option>
</select>`,
},
{
  tag: 'nk-switch', group: 'forms', classes: ['nk-switch', 'nk-switch-label'],
  title: t('Switch', 'Schalter'),
  desc: t('Renders <code>button.nk-switch[role=switch]</code>; the stylesheet keys the knob on <code>aria-checked</code>, the element does the toggling. Submits <code>value</code> (default <code>on</code>) when checked, nothing otherwise – like a checkbox.',
          'Rendert <code>button.nk-switch[role=switch]</code>; das Stylesheet steuert den Knopf über <code>aria-checked</code>, das Element übernimmt das Umschalten. Sendet <code>value</code> (Standard <code>on</code>) wenn eingeschaltet, sonst nichts – wie eine Checkbox.'),
  mobile: t('34×20px – below the 44px touch target. Give it a label row (<code>nk-field</code>) to enlarge the hit area.', '34×20px – unter dem 44px-Touch-Ziel. In einer Label-Zeile (<code>nk-field</code>) wächst die Trefferfläche.'),
  attrs: [bool('checked', 'On/off state.', 'Ein/Aus-Zustand.'), ...formAttrs, str('value', 'string', 'Submitted value when checked.', 'Gesendeter Wert, wenn eingeschaltet.', { default: 'on' }), str('text', 'string', 'Visible text beside the switch (alternative to the default slot).', 'Sichtbarer Text neben dem Schalter (alternativ zum Default-Slot).'), str('label', 'string', 'Accessible name (<code>aria-label</code>) when there is no visible text.', 'Barrierefreier Name (<code>aria-label</code>), wenn es keinen sichtbaren Text gibt.')],
  slots: [{ name: '(default)', desc: t('Visible text beside the switch; part of the hit area. Without it the element renders the bare button.', 'Sichtbarer Text neben dem Schalter; gehört zur Trefferfläche. Ohne ihn rendert das Element den nackten Button.') }],
  events: [{ name: 'nk-change', detail: '{ checked, value, name }', desc: t('On toggle.', 'Beim Umschalten.') }],
  methods: ['toggle()'],
  example: W => `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center"><nk-switch name="notify" checked label="${W.notify}"></nk-switch>
<nk-switch name="planned" checked>${W.planned}</nk-switch><nk-switch name="progress">${W.inProgress}</nk-switch><nk-switch name="done" text="${W.done}" checked></nk-switch></div>`,
  classMarkup: W => `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center"><button class="nk-switch" role="switch" aria-checked="true" aria-label="${W.notify}"></button>
<label class="nk-switch-label"><button class="nk-switch" role="switch" aria-checked="true"></button><span>${W.planned}</span></label><label class="nk-switch-label"><button class="nk-switch" role="switch" aria-checked="false"></button><span>${W.inProgress}</span></label><label class="nk-switch-label"><button class="nk-switch" role="switch" aria-checked="true"></button><span>${W.done}</span></label></div>`,
},
{
  tag: 'nk-check', group: 'forms', classes: ['nk-check'],
  title: t('Checkbox', 'Checkbox'),
  desc: t('A <code>label.nk-check</code> with a custom-drawn checkbox; the label text is slotted, so clicking it toggles the box.', 'Ein <code>label.nk-check</code> mit selbst gezeichneter Checkbox; der Text wird geslottet, ein Klick darauf schaltet um.'),
  mobile: t('Row height ~24px; the whole label is the hit area.', 'Zeilenhöhe ~24px; die ganze Beschriftung ist Trefferfläche.'),
  attrs: [bool('checked', 'Checked state.', 'Angehakt.'), bool('indeterminate', 'Mixed state (cleared on the next click).', 'Teilzustand (beim nächsten Klick aufgehoben).'), ...formAttrs, str('value', 'string', 'Submitted value.', 'Gesendeter Wert.', { default: 'on' }), bool('required', 'Must be checked to submit.', 'Muss zum Absenden angehakt sein.'), str('text', 'string', 'Label text (alternative to the default slot).', 'Beschriftung (alternativ zum Default-Slot).')],
  slots: [{ name: '(default)', desc: t('Label text.', 'Beschriftung.') }],
  events: [{ name: 'nk-change', detail: '{ checked, value, name }', desc: t('On toggle.', 'Beim Umschalten.') }],
  example: W => `<nk-check name="digest" value="weekly" checked>${W.weekly}</nk-check>
<nk-check name="digest" value="mentions">${W.mentions}</nk-check>`,
  classMarkup: W => `<label class="nk-check"><input type="checkbox" name="digest" value="weekly" checked>${W.weekly}</label>
<label class="nk-check"><input type="checkbox" name="digest" value="mentions">${W.mentions}</label>`,
},
{
  tag: 'nk-radio', group: 'forms', classes: ['nk-check'],
  title: t('Radio', 'Radio'),
  desc: t('Same optics as <code>nk-check</code> with a round mark. Radios with the same <code>name</code> in the same tree and form form one group – across shadow roots, which native radios cannot do. One tab stop per group; arrow keys move, wrap and skip disabled entries. There is deliberately no <code>nk-radio-group</code>.',
          'Gleiche Optik wie <code>nk-check</code> mit rundem Mark. Radios mit gleichem <code>name</code> im selben Tree und Formular bilden eine Gruppe – auch über Shadow-Grenzen, was native Radios nicht können. Ein Tab-Stop pro Gruppe; Pfeiltasten wandern, springen um und überspringen deaktivierte. Ein <code>nk-radio-group</code> gibt es bewusst nicht.'),
  mobile: t('As <code>nk-check</code>.', 'Wie <code>nk-check</code>.'),
  attrs: [bool('checked', 'Selected; the last checked radio in markup wins.', 'Ausgewählt; das letzte <code>checked</code> im Markup gewinnt.'), ...formAttrs, str('value', 'string', 'Submitted value.', 'Gesendeter Wert.'), bool('required', 'One of the group must be selected.', 'Eines der Gruppe muss gewählt sein.'), str('text', 'string', 'Label text (alternative to the default slot).', 'Beschriftung (alternativ zum Default-Slot).')],
  slots: [{ name: '(default)', desc: t('Label text.', 'Beschriftung.') }],
  events: [{ name: 'nk-change', detail: '{ checked, value, name }', desc: t('On selection, also via arrow keys.', 'Bei Auswahl, auch per Pfeiltaste.') }],
  example: W => `<nk-radio name="style" value="concise">${W.concise}</nk-radio>
<nk-radio name="style" value="balanced" checked>${W.balanced}</nk-radio>
<nk-radio name="style" value="detailed">${W.detailed}</nk-radio>`,
  classMarkup: W => `<label class="nk-check"><input type="radio" name="style" value="concise">${W.concise}</label>
<label class="nk-check"><input type="radio" name="style" value="balanced" checked>${W.balanced}</label>
<label class="nk-check"><input type="radio" name="style" value="detailed">${W.detailed}</label>`,
},
{
  tag: 'nk-slider', group: 'forms', classes: ['nk-slider', 'nk-slider-value'],
  title: t('Slider', 'Schieberegler'),
  desc: t('A range input with <code>accent-color</code> from the tokens, plus an optional value readout below.', 'Ein Range-Input mit <code>accent-color</code> aus den Tokens, optional mit Wertanzeige darunter.'),
  mobile: t('210px wide; the native thumb is touch-sized by the platform.', '210px breit; der native Griff ist plattformseitig touch-tauglich.'),
  attrs: [str('value', 'number', 'Current value.', 'Aktueller Wert.'), str('min', 'number', 'Minimum.', 'Minimum.'), str('max', 'number', 'Maximum.', 'Maximum.'), str('step', 'number', 'Step.', 'Schrittweite.'), ...formAttrs, bool('show-value', 'Shows the value below the slider.', 'Zeigt den Wert unter dem Regler.'), str('unit', 'string', 'Suffix for the readout (e.g. <code>px</code>).', 'Suffix für die Anzeige (z. B. <code>px</code>).')],
  slots: [],
  events: [changeEvent('On release.', 'Beim Loslassen.'), { name: 'nk-input', detail: '{ value, name }', desc: t('While dragging.', 'Während des Ziehens.') }],
  example: W => `<nk-slider name="size" min="12" max="18" value="14" unit="px" show-value></nk-slider>`,
  classMarkup: W => `<input type="range" class="nk-slider" name="size" min="12" max="18" value="14"><div class="nk-slider-value">14px</div>`,
},
{
  tag: 'nk-field', group: 'forms', classes: ['nk-field', 'f-label', 'f-desc', 'f-control', 'stacked', 'compact'],
  title: t('Field row', 'Feldzeile'),
  desc: t('The settings row: label and description left, control right. Put any control – <code>nk-input</code>, <code>nk-switch</code>, <code>nk-select</code> – in the default slot. <code>stacked</code> puts the label above a full-width control (textareas, long descriptions) and sets <code>wide</code> on the control for you; <code>compact</code> shrinks the label to 12px tertiary text. Inside <code>nk-fields</code> both are on by default.', 'Die Einstellungszeile: Label und Beschreibung links, Control rechts. Ins Default-Slot gehört ein beliebiges Control – <code>nk-input</code>, <code>nk-switch</code>, <code>nk-select</code>. <code>stacked</code> setzt das Label über ein vollbreites Control (Textareas, lange Beschreibungen) und setzt <code>wide</code> am Control selbst; <code>compact</code> verkleinert das Label auf 12px tertiären Text. In <code>nk-fields</code> sind beide Standard.'),
  mobile: t('Stays a row; long descriptions wrap under the label. Use <code>stacked</code> where the control needs the whole width.', 'Bleibt eine Zeile; lange Beschreibungen brechen unter dem Label um. <code>stacked</code>, wo das Control die ganze Breite braucht.'),
  attrs: [str('label', 'string', 'Label text.', 'Beschriftung.'), str('desc', 'string', 'Secondary description.', 'Erläuterung.'), bool('stacked', 'Label above a full-width control.', 'Label über einem vollbreiten Control.'), bool('compact', 'Small tertiary label, no row padding.', 'Kleines tertiäres Label, kein Zeilen-Padding.')],
  slots: [{ name: '(default)', desc: t('The control.', 'Das Control.') }, { name: 'label', desc: t('Rich label content (instead of the attribute).', 'Formatierte Beschriftung (statt Attribut).') }, { name: 'desc', desc: t('Rich description.', 'Formatierte Erläuterung.') }],
  events: [],
  example: W => `<nk-field label="${W.displayName}" desc="${W.displayNameDesc}">
  <nk-input value="Ada Lovelace"></nk-input>
</nk-field>
<nk-field label="${W.notify}">
  <nk-switch checked></nk-switch>
</nk-field>
<nk-field label="${W.bio}" stacked>
  <nk-textarea rows="2" placeholder="${W.bioPlaceholder}"></nk-textarea>
</nk-field>`,
  classMarkup: W => `<div class="nk-field">
  <div><div class="f-label">${W.displayName}</div><div class="f-desc">${W.displayNameDesc}</div></div>
  <div class="f-control"><input class="nk-input" value="Ada Lovelace"></div>
</div>
<div class="nk-field">
  <div><div class="f-label">${W.notify}</div></div>
  <div class="f-control"><button class="nk-switch" role="switch" aria-checked="true"></button></div>
</div>
<div class="nk-field stacked">
  <div><div class="f-label">${W.bio}</div></div>
  <div class="f-control"><textarea class="nk-textarea wide" rows="2" placeholder="${W.bioPlaceholder}"></textarea></div>
</div>`,
},
{
  tag: 'nk-fields', group: 'forms', classes: ['nk-fields', 'fit'],
  title: t('Field grid', 'Feldraster'),
  desc: t('Several short fields in one row: a grid of <code>minmax(150px, 1fr)</code> columns that wraps as the width allows. Every <code>nk-field</code> inside renders itself stacked and compact – a 12px label above a full-width control – so nothing collides.', 'Mehrere kurze Felder in einer Zeile: ein Raster aus <code>minmax(150px, 1fr)</code>-Spalten, das umbricht, wie es die Breite erlaubt. Jedes <code>nk-field</code> darin rendert sich gestapelt und kompakt – ein 12px-Label über einem vollbreiten Control –, damit nichts kollidiert.'),
  mobile: t('Wraps to one or two columns on its own; no breakpoint needed.', 'Bricht von selbst auf ein oder zwei Spalten um; kein Breakpoint nötig.'),
  attrs: [bool('fit', 'The fields share the row instead of keeping 150px columns – two fields in a wide dialog are two halves.', 'Die Felder teilen die Zeile, statt 150px-Spalten zu halten – zwei Felder in einem breiten Dialog sind zwei Hälften.')],
  slots: [{ name: '(default)', desc: t('<code>nk-field</code> children.', '<code>nk-field</code>-Kinder.') }],
  events: [],
  example: W => `<nk-fields>
  <nk-field label="${W.displayName}"><nk-input value="Ada Lovelace"></nk-input></nk-field>
  <nk-field label="${W.email}"><nk-input value="ada@acme.com"></nk-input></nk-field>
  <nk-field label="${W.role}"><nk-select value="editor"><option value="viewer">${W.viewer}</option><option value="editor">${W.editor}</option></nk-select></nk-field>
</nk-fields>`,
  classMarkup: W => `<div class="nk-fields">
  <div class="nk-field"><div><div class="f-label">${W.displayName}</div></div><div class="f-control"><input class="nk-input" value="Ada Lovelace"></div></div>
  <div class="nk-field"><div><div class="f-label">${W.email}</div></div><div class="f-control"><input class="nk-input" value="ada@acme.com"></div></div>
  <div class="nk-field"><div><div class="f-label">${W.role}</div></div><div class="f-control"><select class="nk-select"><option>${W.viewer}</option><option selected>${W.editor}</option></select></div></div>
</div>`,
},
// ============================================================ WAVE 1 · CONTENT
{
  tag: 'nk-tag', group: 'content', classes: ['nk-tag', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'],
  title: t('Tag', 'Tag'),
  desc: t('The select option as Notion draws it, in its nine colours. The colour modifier class becomes the <code>color</code> attribute; without one it is the grey tag. Each pair is tuned per theme.', 'Die Select-Option, wie Notion sie zeichnet, in ihren neun Farben. Die Farb-Modifikator-Klasse wird zum <code>color</code>-Attribut; ohne ist es der graue Tag. Jedes Paar ist pro Theme abgestimmt.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('color', 'gray | brown | orange | yellow | green | blue | purple | pink | red', 'Colour pair; grey without it.', 'Farbpaar; ohne grau.')],
  slots: [{ name: '(default)', desc: t('Tag text.', 'Tag-Text.') }],
  events: [],
  example: W => `<nk-tag>${W.tagGray}</nk-tag> <nk-tag color="brown">${W.tagBrown}</nk-tag> <nk-tag color="orange">${W.planned}</nk-tag> <nk-tag color="yellow">${W.tagYellow}</nk-tag> <nk-tag color="green">${W.done}</nk-tag> <nk-tag color="blue">${W.inProgress}</nk-tag> <nk-tag color="purple">${W.design}</nk-tag> <nk-tag color="pink">${W.tagPink}</nk-tag> <nk-tag color="red">${W.tagRed}</nk-tag>`,
  classMarkup: W => `<span class="nk-tag">${W.tagGray}</span> <span class="nk-tag brown">${W.tagBrown}</span> <span class="nk-tag orange">${W.planned}</span> <span class="nk-tag yellow">${W.tagYellow}</span> <span class="nk-tag green">${W.done}</span> <span class="nk-tag blue">${W.inProgress}</span> <span class="nk-tag purple">${W.design}</span> <span class="nk-tag pink">${W.tagPink}</span> <span class="nk-tag red">${W.tagRed}</span>`,
},
{
  tag: 'nk-progress', group: 'content', classes: ['nk-progress', 'nk-progress-label', 'wide'],
  title: t('Progress', 'Fortschritt'),
  desc: t('A 60px bar with an optional label. <code>value</code>/<code>max</code> set the fill; the bar carries <code>role="progressbar"</code>. <code>wide</code> fills its row, and in a flex column – a panel – it stays a 6px bar.', 'Ein 60px-Balken mit optionalem Label. <code>value</code>/<code>max</code> setzen die Füllung; der Balken trägt <code>role="progressbar"</code>. <code>wide</code> füllt seine Zeile und bleibt in einer Flex-Spalte – einem Panel – ein 6px-Balken.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('value', 'number', 'Current value.', 'Aktueller Wert.', { default: '0' }), str('max', 'number', 'Maximum.', 'Maximum.', { default: '100' }), str('label', 'string', 'Text after the bar.', 'Text hinter dem Balken.'), bool('wide', 'Fills its row – a property value, a panel; in a flex row the label stays beside it.', 'Füllt seine Zeile – ein Eigenschaftswert, ein Panel; in einer flex-Zeile bleibt das Label daneben.')],
  slots: [],
  events: [],
  example: W => `<nk-progress value="72" label="72%"></nk-progress>`,
  classMarkup: W => `<span class="nk-progress"><i style="width:72%"></i></span><span class="nk-progress-label">72%</span>`,
},
{
  tag: 'nk-callout', group: 'content', classes: ['nk-callout', 'c-icon'],
  title: t('Callout', 'Callout'),
  desc: t('One thought that must not be missed. The icon comes from the <code>icon</code> attribute or a <code>slot="icon"</code> node – the node itself, never wrapped.', 'Ein Gedanke, der nicht untergehen darf. Das Icon kommt aus dem <code>icon</code>-Attribut oder einem <code>slot="icon"</code>-Knoten – der Knoten selbst, nie verpackt.'),
  mobile: t('Unchanged; wraps with the text.', 'Unverändert; bricht mit dem Text um.'),
  attrs: [str('icon', 'string', 'Emoji or text icon.', 'Emoji- oder Text-Icon.', { default: '💡' })],
  slots: [{ name: '(default)', desc: t('Body.', 'Inhalt.') }, { name: 'icon', desc: t('Icon node (e.g. <code>&lt;span slot="icon"&gt;📌&lt;/span&gt;</code>).', 'Icon-Knoten (z. B. <code>&lt;span slot="icon"&gt;📌&lt;/span&gt;</code>).') }],
  events: [],
  example: W => `<nk-callout icon="💡"><b>Core idea:</b> ${W.calloutText}</nk-callout>`,
  classMarkup: W => `<div class="nk-callout"><span class="c-icon">💡</span><div><b>Core idea:</b> ${W.calloutText}</div></div>`,
},
{
  tag: 'nk-bookmark', group: 'content', classes: ['nk-bookmark', 'bm-text', 'bm-title', 'bm-desc', 'bm-url', 'bm-favicon', 'bm-cover'],
  title: t('Bookmark', 'Bookmark'),
  desc: t('Notion’s link block, filled from what you know of the page – <code>og:title</code>, <code>og:description</code>, <code>og:image</code>: title, two lines of description and the address with its icon on the left, the image on the right in a third, 240px at most. <code>title</code> is the heading, never a tooltip; without it the host name stands in. <code>url</code> shows an address other than <code>href</code>. Opens in a new tab unless <code>target</code> says otherwise; a part without a value is left out.',
          'Notions Link-Block, gefüllt aus dem, was man über die Seite weiß – <code>og:title</code>, <code>og:description</code>, <code>og:image</code>: Titel, zwei Zeilen Beschreibung und die Adresse mit ihrem Icon links, das Bild rechts in einem Drittel, höchstens 240px. <code>title</code> ist die Überschrift, nie ein Tooltip; ohne ihn steht der Hostname. <code>url</code> zeigt eine andere Adresse als <code>href</code>. Öffnet in einem neuen Tab, außer <code>target</code> sagt anderes; ein Teil ohne Wert entfällt.'),
  mobile: t('The image keeps its third and is cropped at the centre; title and address end in an ellipsis.', 'Das Bild behält sein Drittel und wird mittig beschnitten; Titel und Adresse enden mit Auslassungspunkten.'),
  attrs: [str('href', 'URL', 'The link.', 'Der Link.'), str('title', 'string', 'Title – og:title.', 'Titel – og:title.'), str('desc', 'string', 'Description, two lines – og:description.', 'Beschreibung, zwei Zeilen – og:description.'), str('favicon', 'URL', 'The site’s icon, 16px.', 'Das Icon der Seite, 16px.'), str('cover', 'URL', 'Preview image – og:image.', 'Vorschaubild – og:image.'), str('url', 'string', 'The address shown (default: href).', 'Die angezeigte Adresse (Standard: href).'), str('target', 'string', 'Link target.', 'Link-Ziel.', { default: '_blank' })],
  slots: [],
  events: [{ name: 'click', detail: '(native)', desc: t('The link is a plain <code>&lt;a&gt;</code>.', 'Der Link ist ein einfaches <code>&lt;a&gt;</code>.') }],
  props: ['title', 'href'],
  example: W => `<div style="max-width:600px"><nk-bookmark href="https://notionkit.jungherz.com" title="${W.bmTitle}" desc="${W.bmDesc}" favicon="/favicon.svg" cover="/covers/notionkit-og.jpg"></nk-bookmark></div>`,
  classMarkup: W => `<div style="max-width:600px"><a class="nk-bookmark" href="https://notionkit.jungherz.com" target="_blank" rel="noopener"><span class="bm-text"><span class="bm-title">${W.bmTitle}</span><span class="bm-desc">${W.bmDesc}</span><span class="bm-url"><img class="bm-favicon" src="/favicon.svg" alt=""><span>https://notionkit.jungherz.com</span></span></span><span class="bm-cover"><img src="/covers/notionkit-og.jpg" alt=""></span></a></div>`,
},
{
  tag: 'nk-divider', group: 'content', classes: ['nk-divider'],
  title: t('Divider', 'Trennlinie'),
  desc: t('A hairline <code>&lt;hr&gt;</code> with block spacing.', 'Eine Haarlinie als <code>&lt;hr&gt;</code> mit Blockabstand.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [], slots: [], events: [],
  example: W => `<nk-divider></nk-divider>`,
  classMarkup: W => `<hr class="nk-divider">`,
},
{
  tag: 'nk-heading', group: 'content', classes: ['nk-heading'],
  title: t('Heading', 'Überschrift'),
  desc: t('A section heading. <code>level</code> chooses the real heading element (h1–h4), so the document outline stays honest.', 'Eine Abschnittsüberschrift. <code>level</code> wählt das echte Heading-Element (h1–h4), damit die Dokumentstruktur stimmt.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('level', '1 | 2 | 3 | 4', 'Heading level.', 'Überschriften-Ebene.', { default: '2' })],
  slots: [{ name: '(default)', desc: t('Heading text.', 'Text.') }],
  events: [],
  example: W => `<nk-heading>${W.section}</nk-heading>`,
  classMarkup: W => `<h2 class="nk-heading">${W.section}</h2>`,
},
{
  tag: 'nk-toggle', group: 'content', classes: ['nk-toggle', 'toggle-body'],
  title: t('Toggle block', 'Toggle-Block'),
  desc: t('A <code>&lt;details&gt;</code> block. The summary is rendered inside the element (its marker is a pseudo-element and cannot be styled on slotted content); the body is slotted.', 'Ein <code>&lt;details&gt;</code>-Block. Die Summary wird im Element gerendert (ihr Marker ist ein Pseudo-Element und auf geslottetem Inhalt nicht stylbar); der Inhalt wird geslottet.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('label', 'string', 'Summary text.', 'Summary-Text.'), bool('open', 'Expanded state, reflected both ways.', 'Aufgeklappt, in beide Richtungen gespiegelt.')],
  slots: [{ name: '(default)', desc: t('Folded content.', 'Eingeklappter Inhalt.') }, { name: 'label', desc: t('Rich summary content.', 'Formatierte Summary.') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('On open/close.', 'Beim Auf-/Zuklappen.') }],
  example: W => `<nk-toggle label="${W.details}" open>${W.toggleBody}</nk-toggle>`,
  classMarkup: W => `<details class="nk-toggle" open><summary>${W.details}</summary><div class="toggle-body">${W.toggleBody}</div></details>`,
},
{
  tag: 'nk-todo', group: 'content', classes: ['nk-todo'],
  title: t('To-do', 'To-do'),
  desc: t('Checkbox line with strike-through when done. Form-associated like <code>nk-check</code>.', 'Checkbox-Zeile, durchgestrichen wenn erledigt. Formular-fähig wie <code>nk-check</code>.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [bool('checked', 'Done.', 'Erledigt.'), ...formAttrs, str('value', 'string', 'Submitted value.', 'Gesendeter Wert.', { default: 'on' })],
  slots: [{ name: '(default)', desc: t('Task text.', 'Aufgabentext.') }],
  events: [{ name: 'nk-change', detail: '{ checked, value, name }', desc: t('On toggle.', 'Beim Umschalten.') }],
  example: W => `<nk-todo checked>${W.todo1}</nk-todo>
<nk-todo>${W.todo2}</nk-todo>`,
  classMarkup: W => `<label class="nk-todo"><input type="checkbox" checked><span>${W.todo1}</span></label>
<label class="nk-todo"><input type="checkbox"><span>${W.todo2}</span></label>`,
},
{
  tag: 'nk-kbd', group: 'content', classes: ['nk-kbd'],
  title: t('Key cap', 'Tastenkappe'),
  desc: t('A keyboard key, e.g. in shortcut hints.', 'Eine Tastaturtaste, z. B. in Shortcut-Hinweisen.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [], slots: [{ name: '(default)', desc: t('Key label.', 'Tastenbeschriftung.') }], events: [],
  example: W => `<nk-kbd>⌘</nk-kbd> <nk-kbd>K</nk-kbd>`,
  classMarkup: W => `<kbd class="nk-kbd">⌘</kbd> <kbd class="nk-kbd">K</kbd>`,
},
{
  tag: 'nk-code', group: 'content', classes: ['nk-code', 'lang', 'tag', 'attr'],
  title: t('Code block', 'Code-Block'),
  desc: t('Pre-formatted block with a language badge. Whitespace is kept as written; escape <code>&lt;</code> as <code>&amp;lt;</code>. With <code>highlight</code>, HTML tags and attributes are coloured.', 'Vorformatierter Block mit Sprach-Badge. Whitespace bleibt wie geschrieben; <code>&lt;</code> als <code>&amp;lt;</code> maskieren. Mit <code>highlight</code> werden HTML-Tags und -Attribute eingefärbt.'),
  mobile: t('Scrolls horizontally instead of wrapping.', 'Scrollt horizontal statt umzubrechen.'),
  attrs: [str('lang', 'string', 'Language badge, top right.', 'Sprach-Badge oben rechts.'), bool('highlight', 'Colour HTML tags/attributes.', 'HTML-Tags/-Attribute einfärben.')],
  slots: [{ name: '(default)', desc: t('The code, as text.', 'Der Code, als Text.') }],
  events: [],
  example: W => `<nk-code lang="html" highlight>&lt;nk-btn variant="primary"&gt;${W.save}&lt;/nk-btn&gt;</nk-code>`,
  classMarkup: W => `<div class="nk-code"><span class="lang">html</span>&lt;<span class="tag">nk-btn</span> <span class="attr">variant</span>="primary"&gt;${W.save}&lt;/<span class="tag">nk-btn</span>&gt;</div>`,
},
{
  tag: 'nk-quote', group: 'content', classes: ['nk-quote', 'q-cite'],
  title: t('Quote', 'Zitat'),
  desc: t('A block quote with an optional citation line.', 'Ein Blockzitat mit optionaler Quellenzeile.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('cite', 'string', 'Citation text.', 'Quellenangabe.')],
  slots: [{ name: '(default)', desc: t('Quote text.', 'Zitattext.') }],
  events: [],
  example: W => `<nk-quote cite="${W.quoteCite}">${W.quote}</nk-quote>`,
  classMarkup: W => `<blockquote class="nk-quote">${W.quote}<cite class="q-cite">${W.quoteCite}</cite></blockquote>`,
},

// ============================================================ WAVE 2 · SHELL
{
  tag: 'nk-app', group: 'shell', classes: ['nk-app', 'nk-main', 'peek-inset'], frame: 300,
  title: t('App shell', 'App-Shell'),
  desc: t('The outermost element of a workspace app: a full-height flex row with the sidebar slot left and <code>main.nk-main</code> right. Everything in the default slot – <code>nk-topbar</code>, <code>nk-page</code> – becomes a flex child of the main column.',
          'Das äußerste Element einer Workspace-App: eine flex-Zeile über die volle Höhe mit dem Sidebar-Slot links und <code>main.nk-main</code> rechts. Alles im Default-Slot – <code>nk-topbar</code>, <code>nk-page</code> – wird Flex-Kind der Hauptspalte.'),
  mobile: t('Below 860px the sidebar is hidden; open it as a drawer with <code>sidebar.open = true</code>.', 'Unter 860px ist die Sidebar verborgen; als Schublade öffnen mit <code>sidebar.open = true</code>.'),
  attrs: [bool('peek-inset', 'The main column makes room for the side peek – <code>&lt;nk-peek inset&gt;</code> sets it while open.', 'Die Hauptspalte macht dem Side Peek Platz – <code>&lt;nk-peek inset&gt;</code> setzt es, solange er offen ist.')],
  slots: [{ name: 'sidebar', desc: t('An <code>nk-sidebar</code>.', 'Eine <code>nk-sidebar</code>.') }, { name: '(default)', desc: t('Topbar, page – the main column.', 'Topbar, Seite – die Hauptspalte.') }],
  events: [],
  example: W => `<nk-app>
  <nk-sidebar slot="sidebar">
    <nk-workspace-switcher slot="workspace" name="${W.workspace}"></nk-workspace-switcher>
    <nk-tree>
      <nk-tree-item icon="🔍">${W.search}<span slot="end" class="nk-kbd-hint"><nk-kbd>⌘</nk-kbd><nk-kbd>K</nk-kbd></span></nk-tree-item>
      <nk-tree-item icon="🏠" active>${W.home}</nk-tree-item>
      <nk-tree-item icon="📥">${W.inbox}</nk-tree-item>
    </nk-tree>
    <nk-tree-item slot="footer" icon="⚙️">${W.settings}</nk-tree-item>
  </nk-sidebar>
  <nk-topbar>
    <nk-breadcrumb><span>📊 ${W.projectOverview}</span></nk-breadcrumb>
    <nk-btn slot="actions" variant="share">${W.share}</nk-btn>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>
  <div class="nk-page-scroll"><div class="nk-page" style="padding-top:16px">
    <h1 class="nk-page-title" style="font-size:28px">${W.pageTitle}</h1>
    <p class="lead">${W.lead}</p>
  </div></div>
</nk-app>`,
  classMarkup: W => `<div class="nk-app">
  <aside class="nk-sidebar">
    <div class="nk-workspace"><div class="avatar">M</div><span>${W.workspace}</span><span class="chev">⌄</span></div>
    <div class="nk-sidebar-scroll">
      <div class="nk-tree-item"><span class="icon">🔍</span><span class="label">${W.search}</span><span class="nk-kbd-hint"><kbd class="nk-kbd">⌘</kbd><kbd class="nk-kbd">K</kbd></span></div>
      <div class="nk-tree-item active"><span class="icon">🏠</span><span class="label">${W.home}</span></div>
      <div class="nk-tree-item"><span class="icon">📥</span><span class="label">${W.inbox}</span></div>
    </div>
    <div class="nk-sidebar-footer">
      <div class="nk-tree-item"><span class="icon">⚙️</span><span class="label">${W.settings}</span></div>
    </div>
  </aside>
  <main class="nk-main">
    <div class="nk-topbar">
      <nav class="nk-breadcrumb"><span class="crumb current">📊 ${W.projectOverview}</span></nav>
      <div class="nk-topbar-actions"><button class="nk-topbar-btn nk-share-btn">${W.share}</button><button class="nk-topbar-btn nk-theme-toggle">🌙</button></div>
    </div>
    <div class="nk-page-scroll"><div class="nk-page" style="padding-top:16px">
      <h1 class="nk-page-title" style="font-size:28px">${W.pageTitle}</h1>
      <p class="lead">${W.lead}</p>
    </div></div>
  </main>
</div>`,
},
{
  tag: 'nk-sidebar', group: 'shell', classes: ['nk-sidebar', 'nk-sidebar-head', 'nk-sidebar-collapse', 'nk-sidebar-scroll', 'nk-sidebar-footer', 'nk-sidebar-backdrop', 'open', 'collapsed'], frame: 260,
  title: t('Sidebar', 'Sidebar'),
  desc: t('The left rail: workspace slot on top, a scrolling default slot for the tree, a pinned footer slot. Footer tree items automatically get <code>compact</code> (26px rows). The host is <code>display: contents</code>, so the <code>aside</code> is a direct flex child of the app – exactly like the class markup. <code>collapsible</code> adds Notion’s « beside the workspace row, shown while the pointer is over the sidebar: on the desktop it collapses the sidebar – it slides out, the main column takes the width, nothing in it takes focus – and <code>&lt;nk-btn variant="sidebar"&gt;</code> in the topbar shows and brings it back; ⌘\\ or Ctrl+\\ toggles it. <code>collapsed</code> is the state, <code>nk-collapse</code> the moment to keep it.',
          'Die linke Leiste: Workspace-Slot oben, ein scrollender Default-Slot für den Baum, ein fixierter Footer-Slot. Footer-Einträge bekommen automatisch <code>compact</code> (26px-Zeilen). Der Host ist <code>display: contents</code>, das <code>aside</code> also direktes Flex-Kind der App – wie im Klassen-Markup. <code>collapsible</code> ergänzt Notions « neben der Workspace-Zeile, sichtbar, solange der Zeiger über der Sidebar ist: Auf dem Desktop klappt es die Sidebar ein – sie gleitet hinaus, die Hauptspalte nimmt die Breite, nichts darin nimmt Fokus –, und <code>&lt;nk-btn variant="sidebar"&gt;</code> in der Topbar erscheint und holt sie zurück; ⌘\\ oder Strg+\\ schaltet um. <code>collapsed</code> ist der Zustand, <code>nk-collapse</code> der Moment, ihn zu speichern.'),
  mobile: t('Hidden below 860px. <code>open</code> shows it as a drawer over the page with a scrim – NotionKit’s own rules since 1.7.0 (<code>.nk-sidebar.open</code>, <code>.nk-sidebar-backdrop</code>), the same as the class markup’s; <code>&lt;nk-btn variant="sidebar"&gt;</code> in the topbar is the ☰ that opens it. Escape and the scrim close it. The drawer slides in over 240ms and the scrim fades, closing runs backwards – CSS only (<code>transition-behavior: allow-discrete</code> + <code>@starting-style</code>; older browsers switch hard, reduced motion snaps). In landscape the drawer grows by the left safe-area inset, so its rows clear the Dynamic Island.', 'Unter 860px verborgen. <code>open</code> zeigt sie als Schublade über der Seite mit Scrim – NotionKits eigene Regeln seit 1.7.0 (<code>.nk-sidebar.open</code>, <code>.nk-sidebar-backdrop</code>), dieselben wie im Klassen-Markup; <code>&lt;nk-btn variant="sidebar"&gt;</code> in der Topbar ist das ☰, das sie öffnet. Escape und der Scrim schließen sie. Die Schublade gleitet in 240ms herein, der Scrim blendet ein, das Schließen läuft rückwärts – nur CSS (<code>transition-behavior: allow-discrete</code> + <code>@starting-style</code>; ältere Browser schalten hart, reduzierte Bewegung springt). Im Querformat wächst die Schublade um den linken Safe-Area-Inset, ihre Zeilen weichen der Dynamic Island aus.'),
  attrs: [bool('open', 'Drawer state on small screens (no effect on desktop).', 'Schubladen-Zustand auf kleinen Schirmen (ohne Wirkung am Desktop).'), bool('collapsible', 'Shows the « that collapses it on the desktop, and ⌘\\.', 'Zeigt das «, das sie auf dem Desktop einklappt, und ⌘\\.'), bool('collapsed', 'Collapsed on the desktop (no effect on a phone).', 'Auf dem Desktop eingeklappt (ohne Wirkung auf dem Telefon).'), str('collapse-label', 'string', 'Name and tooltip of the «.', 'Name und Tooltip des «.', { default: 'Close sidebar' })],
  slots: [{ name: 'workspace', desc: t('<code>nk-workspace-switcher</code>.', '<code>nk-workspace-switcher</code>.') }, { name: '(default)', desc: t('The tree (scrolls).', 'Der Baum (scrollt).') }, { name: 'footer', desc: t('Pinned bottom rows (Settings, Trash).', 'Fixierte Zeilen unten (Einstellungen, Papierkorb).') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Drawer opened/closed.', 'Schublade geöffnet/geschlossen.') }, { name: 'nk-collapse', detail: '{ collapsed }', desc: t('Collapsed / expanded on the desktop.', 'Auf dem Desktop ein-/ausgeklappt.') }],
  props: ['open', 'collapsed'], methods: ['show()', 'close()', 'toggle()', 'collapse()', 'expand()', 'toggleCollapsed()'],
  example: W => `<div style="display:flex;height:100%"><nk-sidebar collapsible collapse-label="${W.closeSidebar}">
  <nk-workspace-switcher slot="workspace" name="${W.workspace}"></nk-workspace-switcher>
  <nk-tree>
    <nk-tree-item icon="🏠" active>${W.home}</nk-tree-item>
    <nk-tree-item icon="📥">${W.inbox}</nk-tree-item>
  </nk-tree>
  <nk-tree-item slot="footer" icon="⚙️">${W.settings}</nk-tree-item>
  <nk-tree-item slot="footer" icon="🗑️">${W.trash}</nk-tree-item>
</nk-sidebar></div>`,
  classMarkup: W => `<div style="display:flex;height:100%"><aside class="nk-sidebar">
  <div class="nk-sidebar-head"><div class="nk-workspace"><div class="avatar">M</div><span>${W.workspace}</span><span class="chev">⌄</span></div><button class="nk-sidebar-collapse" aria-label="${W.closeSidebar}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 17-5-5 5-5M11 17l-5-5 5-5"/></svg></button></div>
  <div class="nk-sidebar-scroll">
    <div class="nk-tree-item active"><span class="icon">🏠</span><span class="label">${W.home}</span></div>
    <div class="nk-tree-item"><span class="icon">📥</span><span class="label">${W.inbox}</span></div>
  </div>
  <div class="nk-sidebar-footer">
    <div class="nk-tree-item"><span class="icon">⚙️</span><span class="label">${W.settings}</span></div>
    <div class="nk-tree-item"><span class="icon">🗑️</span><span class="label">${W.trash}</span></div>
  </div>
</aside></div>`,
},
{
  tag: 'nk-workspace-switcher', group: 'shell', classes: ['nk-workspace', 'avatar', 'chev'],
  title: t('Workspace switcher', 'Workspace-Umschalter'),
  desc: t('The row at the very top of the sidebar. A click toggles <code>open</code> and shows whatever sits in the <code>menu</code> slot below it (an <code>nk-menu</code>, from wave 4); outside clicks and Escape close it.',
          'Die Zeile ganz oben in der Sidebar. Ein Klick schaltet <code>open</code> und zeigt den Inhalt des <code>menu</code>-Slots darunter (ein <code>nk-menu</code> ab Welle 4); Klick außerhalb und Escape schließen.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('name', 'string', 'Workspace name.', 'Workspace-Name.'), str('avatar', 'string', 'Avatar text (default: first letter of the name).', 'Avatar-Text (Standard: erster Buchstabe des Namens).'), bool('open', 'Menu shown.', 'Menü sichtbar.')],
  slots: [{ name: 'avatar', desc: t('Custom avatar node.', 'Eigener Avatar-Knoten.') }, { name: 'menu', desc: t('The popover content.', 'Der Popover-Inhalt.') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Menu opened/closed.', 'Menü geöffnet/geschlossen.') }, { name: 'nk-select', detail: '(from the menu)', desc: t('Bubbles up from a menu item; the menu closes.', 'Bubbelt aus einem Menüeintrag hoch; das Menü schließt.') }],
  methods: ['show()', 'close()', 'toggle()'],
  example: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:260px"><nk-workspace-switcher name="${W.workspace}"></nk-workspace-switcher></div>`,
  classMarkup: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:260px"><div class="nk-workspace"><div class="avatar">M</div><span>${W.workspace}</span><span class="chev">⌄</span></div></div>`,
},
{
  tag: 'nk-section-label', group: 'shell', classes: ['nk-section-label', 'plus'],
  title: t('Section label', 'Abschnittsbeschriftung'),
  desc: t('Small uppercase-ish heading between tree sections. With <code>addable</code> a ＋ appears on hover and fires <code>nk-action</code>.', 'Kleine Überschrift zwischen Baum-Abschnitten. Mit <code>addable</code> erscheint beim Hovern ein ＋, das <code>nk-action</code> feuert.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [bool('addable', 'Shows the ＋ on hover.', 'Zeigt das ＋ beim Hovern.'), str('label', 'string', 'Text (alternative to the slot).', 'Text (alternativ zum Slot).')],
  slots: [{ name: '(default)', desc: t('Label text.', 'Beschriftung.') }],
  events: [{ name: 'nk-action', detail: "{ action: 'add' }", desc: t('＋ clicked.', '＋ geklickt.') }],
  example: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:0 8px 6px"><nk-section-label addable>${W.favourites}</nk-section-label><nk-tree-item icon="📊">${W.projectOverview}</nk-tree-item></div>`,
  classMarkup: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:0 8px 6px"><div class="nk-section-label">${W.favourites} <span class="plus">＋</span></div><div class="nk-tree-item"><span class="icon">📊</span><span class="label">${W.projectOverview}</span><span class="actions"><span>＋</span><span>⋯</span></span></div></div>`,
},
{
  tag: 'nk-tree', group: 'shell', classes: [],
  title: t('Tree', 'Baum'),
  desc: t('Container for <code>nk-tree-item</code>s: keeps exactly one item <code>active</code> (listening to <code>nk-select</code> at any depth), gives the whole tree a single tab stop with arrow-key navigation (↑↓ move, → expands or enters, ← collapses or leaves, Home/End), and renders items from <code>tree.data</code>. <code>tree.value</code> is read-only – select programmatically with <code>item.select()</code> or the <code>active</code> attribute. Section labels may sit between items; their ＋ fires <code>nk-action { action: \'add\' }</code> without a value.',
          'Container für <code>nk-tree-item</code>s: hält genau einen Eintrag <code>active</code> (hört <code>nk-select</code> in jeder Tiefe), gibt dem Baum einen Tab-Stop mit Pfeiltasten-Navigation (↑↓ bewegen, → klappt auf oder steigt ein, ← klappt zu oder steigt aus, Home/End) und rendert Einträge aus <code>tree.data</code>. <code>tree.value</code> ist nur lesbar – programmatisch wählen mit <code>item.select()</code> oder dem <code>active</code>-Attribut. Abschnittsbeschriftungen dürfen zwischen den Einträgen stehen; ihr ＋ feuert <code>nk-action { action: \'add\' }</code> ohne Wert.'),
  mobile: t('Rows are 28px; raise the hit area in a touch drawer via the sidebar’s <code>open</code> state styling of your own.', 'Zeilen sind 28px; in einer Touch-Schublade die Trefferfläche selbst vergrößern.'),
  attrs: [bool('manual', 'Do not move <code>active</code> automatically.', '<code>active</code> nicht automatisch setzen.')],
  slots: [{ name: '(default)', desc: t('<code>nk-tree-item</code> and <code>nk-section-label</code> children.', '<code>nk-tree-item</code>- und <code>nk-section-label</code>-Kinder.') }],
  events: [{ name: 'nk-select', detail: '{ value, label, href, item }', desc: t('Bubbles from the selected item.', 'Bubbelt vom gewählten Eintrag.') }, { name: 'nk-toggle', detail: '{ open, value }', desc: t('A branch opened/closed.', 'Ein Ast auf-/zugeklappt.') }, { name: 'nk-action', detail: '{ action, value }', desc: t('Hover action of an item.', 'Hover-Aktion eines Eintrags.') }],
  props: ['data', 'activeItem', 'value'],
  example: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:6px 8px"><nk-tree>
  <nk-section-label addable>${W.favourites}</nk-section-label>
  <nk-tree-item icon="📊" open>${W.projectOverview}
    <nk-tree-item icon="🚀" active>${W.mvp}</nk-tree-item>
    <nk-tree-item icon="🎙️">${W.voh}</nk-tree-item>
  </nk-tree-item>
  <nk-tree-item icon="🧠">${W.knowledgeBase}
    <nk-tree-item icon="📄">${W.onboarding}</nk-tree-item>
  </nk-tree-item>
  <nk-tree-item icon="🎨">${W.designSystem}</nk-tree-item>
</nk-tree></div>`,
  classMarkup: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:6px 8px"><div>
  <div class="nk-section-label">${W.favourites} <span class="plus">＋</span></div>
  <div class="nk-tree-item"><span class="nk-toggle-arrow open">▸</span><span class="icon">📊</span><span class="label">${W.projectOverview}</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
  <div class="nk-tree-children">
    <div class="nk-tree-item active"><span class="icon">🚀</span><span class="label">${W.mvp}</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
    <div class="nk-tree-item"><span class="icon">🎙️</span><span class="label">${W.voh}</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
  </div>
  <div class="nk-tree-item"><span class="nk-toggle-arrow">▸</span><span class="icon">🧠</span><span class="label">${W.knowledgeBase}</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
  <div class="nk-tree-children collapsed">
    <div class="nk-tree-item"><span class="icon">📄</span><span class="label">${W.onboarding}</span></div>
  </div>
  <div class="nk-tree-item"><span class="icon">🎨</span><span class="label">${W.designSystem}</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
</div></div>`,
},
{
  tag: 'nk-tree-item', group: 'shell', classes: ['nk-tree-item', 'icon', 'label', 'actions', 'active', 'compact', 'nk-tree-children', 'collapsed', 'nk-toggle-arrow', 'open', 'nk-kbd-hint'],
  title: t('Tree item', 'Baum-Eintrag'),
  desc: t('One row of the page tree – and its children box. Text content is the label, nested <code>nk-tree-item</code>s are the children (the arrow appears only then), <code>slot="icon"</code> and <code>slot="end"</code> go where they say. Hover actions ＋/⋯ report through <code>nk-action</code>; a click fires <code>nk-select</code> (cancelable). Outside an <code>nk-tree</code> (sidebar footer) an item marks itself <code>active</code> on click unless the event is cancelled.',
          'Eine Zeile des Seitenbaums – samt Kinder-Box. Textinhalt ist das Label, verschachtelte <code>nk-tree-item</code>s sind die Kinder (nur dann erscheint der Pfeil), <code>slot="icon"</code> und <code>slot="end"</code> landen dort. Hover-Aktionen ＋/⋯ melden sich über <code>nk-action</code>; ein Klick feuert <code>nk-select</code> (abbrechbar). Außerhalb eines <code>nk-tree</code> (Sidebar-Footer) setzt sich ein Eintrag beim Klick selbst <code>active</code>, sofern das Event nicht abgebrochen wird.'),
  mobile: t('28px rows (26px with <code>compact</code>) – below the 44px touch target; the tree does not force a height.', '28px-Zeilen (26px mit <code>compact</code>) – unter dem 44px-Touch-Ziel; der Baum erzwingt keine Höhe.'),
  attrs: [str('icon', 'string', 'Emoji/text icon (or <code>slot="icon"</code>).', 'Emoji-/Text-Icon (oder <code>slot="icon"</code>).'), str('label', 'string', 'Label (alternative to text content).', 'Label (alternativ zum Textinhalt).'), str('value', 'string', 'Value reported in events (default: label).', 'Wert in Events (Standard: Label).'), str('href', 'URL', 'Navigate on select.', 'Navigiert bei Auswahl.'), bool('active', 'Current item.', 'Aktueller Eintrag.'), bool('open', 'Children expanded.', 'Kinder aufgeklappt.'), bool('compact', '26px row (footer, settings nav).', '26px-Zeile (Footer, Settings-Nav).'), bool('no-actions', 'Hide the ＋/⋯ hover actions.', 'Hover-Aktionen ＋/⋯ ausblenden.')],
  slots: [{ name: '(default)', desc: t('Label text and nested <code>nk-tree-item</code>s.', 'Label-Text und verschachtelte <code>nk-tree-item</code>s.') }, { name: 'icon', desc: t('Icon node.', 'Icon-Knoten.') }, { name: 'end', desc: t('Trailing content, e.g. <code>&lt;span slot="end" class="nk-kbd-hint"&gt;</code> with <code>nk-kbd</code>s (hides the actions).', 'Inhalt am Zeilenende, z. B. <code>&lt;span slot="end" class="nk-kbd-hint"&gt;</code> mit <code>nk-kbd</code>s (blendet die Aktionen aus).') }],
  events: [{ name: 'nk-select', detail: '{ value, label, href, item }', desc: t('Row clicked / Enter. <code>preventDefault()</code> keeps it from becoming active.', 'Zeile geklickt / Enter. <code>preventDefault()</code> verhindert das Aktivieren.') }, { name: 'nk-toggle', detail: '{ open, value }', desc: t('Arrow clicked.', 'Pfeil geklickt.') }, { name: 'nk-action', detail: "{ action: 'add' | 'more', value }", desc: t('Hover action clicked.', 'Hover-Aktion geklickt.') }],
  props: ['label', 'value', 'active', 'open', 'hasChildren'],
  methods: ['select()', 'toggle()', 'focus()'],
  example: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:6px 8px">
  <nk-tree-item icon="🔍" value="search">${W.search}<span slot="end" class="nk-kbd-hint"><nk-kbd>⌘</nk-kbd><nk-kbd>K</nk-kbd></span></nk-tree-item>
  <nk-tree-item icon="📊" active>${W.projectOverview}</nk-tree-item>
  <nk-tree-item icon="🎨">${W.designSystem}</nk-tree-item>
</div>`,
  classMarkup: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:6px 8px">
  <div class="nk-tree-item"><span class="icon">🔍</span><span class="label">${W.search}</span><span class="nk-kbd-hint"><kbd class="nk-kbd">⌘</kbd><kbd class="nk-kbd">K</kbd></span></div>
  <div class="nk-tree-item active"><span class="icon">📊</span><span class="label">${W.projectOverview}</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
  <div class="nk-tree-item"><span class="icon">🎨</span><span class="label">${W.designSystem}</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
</div>`,
},
{
  tag: 'nk-topbar', group: 'shell', classes: ['nk-topbar', 'nk-topbar-actions', 'nk-topbar-btn', 'nk-topbar-meta', 'nk-share-btn'], wide: true,
  title: t('Top bar', 'Topbar'),
  desc: t('The 44px bar above the page: breadcrumb in the default slot, buttons in the <code>actions</code> slot (right-aligned). Use <code>nk-btn variant="topbar"</code> / <code>"share"</code> and <code>nk-theme-toggle</code> there, and <code>&lt;span class="nk-topbar-meta"&gt;</code> for passive text such as “Edited 2 min ago”.', 'Die 44px-Leiste über der Seite: Breadcrumb im Default-Slot, Buttons im <code>actions</code>-Slot (rechtsbündig). Dort <code>nk-btn variant="topbar"</code> / <code>"share"</code> und <code>nk-theme-toggle</code> verwenden, für reinen Text wie „Bearbeitet vor 2 Min.“ <code>&lt;span class="nk-topbar-meta"&gt;</code>.'),
  mobile: t('Below 860px only the last crumb stays and ends in an ellipsis, <code>nk-topbar-meta</code> hides, and the actions keep to one line – as in Notion’s mobile app.', 'Unter 860px bleibt nur der letzte Crumb und endet mit Auslassungspunkten, <code>nk-topbar-meta</code> wird ausgeblendet, die Aktionen bleiben einzeilig – wie in Notions Mobil-App.'),
  attrs: [],
  slots: [{ name: '(default)', desc: t('Breadcrumb / title.', 'Breadcrumb / Titel.') }, { name: 'actions', desc: t('Buttons on the right.', 'Buttons rechts.') }],
  events: [],
  example: W => `<div style="border:1px solid var(--nk-border);border-radius:8px;display:flex;flex-direction:column"><nk-topbar>
  <nk-breadcrumb><span>📊 ${W.projectOverview}</span><span>🚀 ${W.mvp}</span></nk-breadcrumb>
  <span slot="actions" class="nk-topbar-meta">${W.lastEdited}</span>
  <nk-btn slot="actions" variant="share">${W.share}</nk-btn>
  <nk-btn slot="actions" variant="topbar">⭐</nk-btn>
  <nk-theme-toggle slot="actions"></nk-theme-toggle>
</nk-topbar></div>`,
  classMarkup: W => `<div style="border:1px solid var(--nk-border);border-radius:8px;display:flex;flex-direction:column"><div class="nk-topbar">
  <nav class="nk-breadcrumb"><span class="crumb">📊 ${W.projectOverview}</span><span class="sep">/</span><span class="crumb current">🚀 ${W.mvp}</span></nav>
  <div class="nk-topbar-actions"><span class="nk-topbar-meta">${W.lastEdited}</span><button class="nk-topbar-btn nk-share-btn">${W.share}</button><button class="nk-topbar-btn">⭐</button><button class="nk-topbar-btn nk-theme-toggle">🌙</button></div>
</div></div>`,
},
{
  tag: 'nk-breadcrumb', group: 'shell', classes: ['nk-breadcrumb', 'crumb', 'sep', 'current'],
  title: t('Breadcrumb', 'Breadcrumb'),
  desc: t('Give it plain <code>&lt;span&gt;</code> or <code>&lt;a&gt;</code> children; they are cloned into the bar with separators between them and the last one marked current (or the child with a <code>current</code> attribute). Text changes, added or removed children are picked up automatically (<code>refresh()</code> only for what the observer cannot see). Clicking a crumb fires <code>nk-select</code> and forwards the click to the original child, so links navigate exactly once.',
          'Als Kinder einfache <code>&lt;span&gt;</code> oder <code>&lt;a&gt;</code>; sie werden mit Trennern in die Leiste geklont, das letzte (oder das Kind mit <code>current</code>-Attribut) ist das aktuelle. Textänderungen sowie neue oder entfernte Kinder werden automatisch übernommen (<code>refresh()</code> nur für das, was der Observer nicht sieht). Ein Klick feuert <code>nk-select</code> und reicht den Klick an das Original weiter – Links navigieren genau einmal.'),
  mobile: t('Stays on one line; keep crumbs short.', 'Bleibt einzeilig; Einträge kurz halten.'),
  attrs: [str('separator', 'string', 'Separator glyph.', 'Trennzeichen.', { default: '/' })],
  slots: [{ name: '(default)', desc: t('Crumb children (direct children only, no <code>slot</code> attribute).', 'Crumb-Kinder (nur direkte Kinder, ohne <code>slot</code>-Attribut).') }],
  events: [{ name: 'nk-select', detail: '{ index, value, label, href, current }', desc: t('Crumb clicked; <code>preventDefault()</code> stops the forwarded click.', 'Crumb geklickt; <code>preventDefault()</code> unterbindet den weitergereichten Klick.') }],
  methods: ['refresh()'],
  example: W => `<nk-breadcrumb><a href="#">📊 ${W.projectOverview}</a><span>🚀 ${W.mvp}</span></nk-breadcrumb>`,
  classMarkup: W => `<nav class="nk-breadcrumb"><a class="crumb" href="#">📊 ${W.projectOverview}</a><span class="sep">/</span><span class="crumb current">🚀 ${W.mvp}</span></nav>`,
},
{
  tag: 'nk-theme-toggle', group: 'shell', classes: ['nk-theme-toggle'],
  title: t('Theme toggle', 'Theme-Umschalter'),
  desc: t('The ☀️/🌙 button. Flips <code>data-theme</code> on <code>&lt;html&gt;</code>, remembers the choice in <code>localStorage</code>, applies a stored or system preference on first connect when <code>&lt;html&gt;</code> has no theme yet, and accepts <code>postMessage({ nkTheme })</code> from a parent page. <code>apply(theme)</code> does everything a click does: sets, persists and fires <code>nk-change</code>.',
          'Der ☀️/🌙-Button. Schaltet <code>data-theme</code> auf <code>&lt;html&gt;</code>, merkt sich die Wahl in <code>localStorage</code>, wendet beim ersten Connect eine gespeicherte oder die System-Präferenz an, wenn <code>&lt;html&gt;</code> noch kein Theme trägt, und akzeptiert <code>postMessage({ nkTheme })</code> einer Elternseite. <code>apply(theme)</code> tut alles, was ein Klick tut: setzen, merken, <code>nk-change</code> feuern.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('storage-key', 'string', 'localStorage key.', 'localStorage-Schlüssel.', { default: 'nk-theme' }), str('title', 'string', 'Tooltip.', 'Tooltip.')],
  slots: [],
  events: [{ name: 'nk-change', detail: "{ value: 'light' | 'dark' }", desc: t('Theme applied.', 'Theme gesetzt.') }],
  props: ['value'], methods: ['apply(theme)'],
  example: W => `<nk-theme-toggle></nk-theme-toggle>`,
  classMarkup: W => `<button class="nk-topbar-btn nk-theme-toggle">🌙</button>`,
},

// ============================================================ WAVE 3 · PAGE
{
  tag: 'nk-tab-bar', group: 'shell', classes: ['nk-tab-bar', 'nk-tab-bar-spacer', 'always', 'fixed', 'floating'],
  title: t('Tab bar (mobile)', 'Tab-Bar (mobil)'),
  desc: t('The thumb-reachable twin of the sidebar for phones and installed PWAs. Put it last inside <code>nk-app</code>: it is slotted into the main column below the scrolling page, so it never moves and no bottom padding is needed. Keeps exactly one <code>nk-tab-bar-item</code> active (listening to <code>nk-select</code>); a <code>drawer</code> item opens the sidebar instead. Needs NotionKit CSS 1.2.0.',
          'Der daumenfreundliche Zwilling der Sidebar für Telefone und installierte PWAs. Als letztes Kind von <code>nk-app</code> landet sie in der Hauptspalte unter der scrollenden Seite – sie bewegt sich nie, ein unteres Padding ist nirgends nötig. Hält genau ein <code>nk-tab-bar-item</code> aktiv (hört <code>nk-select</code>); ein <code>drawer</code>-Eintrag öffnet stattdessen die Sidebar. Braucht NotionKit CSS 1.2.0.'),
  mobile: t('This is where it lives: hidden above 860px (the sidebar is the navigation there), shown below. <code>always</code> shows it at every width – previews, phone frames. The bottom padding is the larger of 6px and <code>env(safe-area-inset-bottom)</code>; in landscape the side padding grows to the left/right insets.',
            'Hier ist ihr Platz: über 860px verborgen (dort ist die Sidebar die Navigation), darunter sichtbar. <code>always</code> zeigt sie in jeder Breite – Vorschauen, Telefon-Rahmen. Das untere Padding ist das Größere aus 6px und <code>env(safe-area-inset-bottom)</code>; im Querformat wächst das seitliche Padding auf die linken/rechten Insets.'),
  attrs: [str('value', 'string', 'Active item value (default: the item with <code>active</code>, else the first).', 'Aktiver Wert (Standard: Eintrag mit <code>active</code>, sonst der erste).'), bool('always', 'Visible at every width, not only below 860px.', 'In jeder Breite sichtbar, nicht nur unter 860px.'), bool('fixed', 'Pinned to the viewport bottom instead of sitting in the column – for standalone PWAs; a spacer keeps its height (<code>--nk-tab-bar-height</code> + safe area) in the flow.', 'An den unteren Viewport-Rand geheftet statt in der Spalte – für Standalone-PWAs; ein Platzhalter hält ihre Höhe (<code>--nk-tab-bar-height</code> + Safe-Area) im Fluss frei.'), bool('floating', 'A fixed capsule with rounded corners instead of the full-width bar.', 'Eine fixierte Kapsel mit runden Ecken statt der vollbreiten Leiste.'), str('label', 'string', '<code>aria-label</code> of the <code>nav</code>.', '<code>aria-label</code> des <code>nav</code>.')],
  slots: [{ name: '(default)', desc: t('<code>nk-tab-bar-item</code> children, up to five.', '<code>nk-tab-bar-item</code>-Kinder, bis zu fünf.') }],
  events: [{ name: 'nk-change', detail: '{ value }', desc: t('Active item changed.', 'Aktiver Eintrag gewechselt.') }, { name: 'nk-select', detail: '{ value, label, href, item, drawer }', desc: t('Bubbles from the tapped item; cancelable.', 'Bubbelt vom getippten Eintrag; abbrechbar.') }],
  props: ['value', 'items'],
  example: W => `<div style="max-width:390px;border:1px solid var(--nk-border);border-radius:12px;overflow:hidden"><nk-tab-bar always value="inbox">
  <nk-tab-bar-item icon="🏠" value="home">${W.home}</nk-tab-bar-item>
  <nk-tab-bar-item icon="📥" value="inbox">${W.inbox}</nk-tab-bar-item>
  <nk-tab-bar-item icon="🔍" value="search">${W.search}</nk-tab-bar-item>
  <nk-tab-bar-item icon="⚙️" value="settings">${W.settings}</nk-tab-bar-item>
  <nk-tab-bar-item icon="☰" drawer>${W.more}</nk-tab-bar-item>
</nk-tab-bar></div>`,
  classMarkup: W => `<div style="max-width:390px;border:1px solid var(--nk-border);border-radius:12px;overflow:hidden"><nav class="nk-tab-bar always">
  <button class="nk-tab-bar-item"><span class="icon">🏠</span><span class="label">${W.home}</span></button>
  <button class="nk-tab-bar-item active"><span class="icon">📥</span><span class="label">${W.inbox}</span></button>
  <button class="nk-tab-bar-item"><span class="icon">🔍</span><span class="label">${W.search}</span></button>
  <button class="nk-tab-bar-item"><span class="icon">⚙️</span><span class="label">${W.settings}</span></button>
  <button class="nk-tab-bar-item"><span class="icon">☰</span><span class="label">${W.more}</span></button>
</nav></div>`,
},
{
  tag: 'nk-tab-bar-item', group: 'shell', classes: ['nk-tab-bar-item', 'icon', 'label', 'active'],
  title: t('Tab bar item', 'Tab-Bar-Eintrag'),
  desc: t('One destination of <code>nk-tab-bar</code>: an icon over a short label. A tap emits <code>nk-select</code> (cancelable), then moves the bar’s <code>value</code>; with <code>href</code> it navigates afterwards. <code>drawer</code> turns it into the “More” item that opens the nearest <code>nk-sidebar</code> as a drawer and never becomes active. Standalone it toggles its own <code>active</code>.',
          'Ein Ziel von <code>nk-tab-bar</code>: ein Icon über einer kurzen Beschriftung. Ein Tipp feuert <code>nk-select</code> (abbrechbar) und setzt dann den <code>value</code> der Bar; mit <code>href</code> navigiert er danach. <code>drawer</code> macht ihn zum „Mehr“-Eintrag, der die nächste <code>nk-sidebar</code> als Schublade öffnet und nie aktiv wird. Alleinstehend schaltet er sein eigenes <code>active</code>.'),
  mobile: t('Made for the thumb: 20px icon, 10.5px label, the whole column is the hit area.', 'Für den Daumen gemacht: 20px-Icon, 10,5px-Beschriftung, die ganze Spalte ist Trefferfläche.'),
  attrs: [str('icon', 'string', 'Emoji or glyph (alternative: <code>slot="icon"</code>).', 'Emoji oder Glyphe (Alternative: <code>slot="icon"</code>).'), str('value', 'string', 'Value (default: the label).', 'Wert (Standard: die Beschriftung).'), str('label', 'string', 'Label text (alternative to the default slot).', 'Beschriftung (alternativ zum Default-Slot).'), str('href', 'string', 'Navigates after <code>nk-select</code>.', 'Navigiert nach <code>nk-select</code>.'), bool('active', 'The current destination (<code>aria-current="page"</code>).', 'Das aktuelle Ziel (<code>aria-current="page"</code>).'), bool('drawer', 'Opens the sidebar drawer instead of becoming active.', 'Öffnet die Sidebar-Schublade, statt aktiv zu werden.'), bool('disabled', 'Not selectable.', 'Nicht wählbar.')],
  slots: [{ name: '(default)', desc: t('Label.', 'Beschriftung.') }, { name: 'icon', desc: t('Icon node instead of the attribute.', 'Icon-Knoten statt des Attributs.') }],
  events: [{ name: 'nk-select', detail: '{ value, label, href, item, drawer }', desc: t('Tapped; cancelable.', 'Getippt; abbrechbar.') }],
  methods: ['select()', 'focus()'],
  example: W => `<div style="max-width:390px;border:1px solid var(--nk-border);border-radius:12px;overflow:hidden"><nk-tab-bar always><nk-tab-bar-item icon="🏠" value="home" active>${W.home}</nk-tab-bar-item><nk-tab-bar-item icon="📥" value="inbox">${W.inbox}</nk-tab-bar-item></nk-tab-bar></div>`,
  classMarkup: W => `<div style="max-width:390px;border:1px solid var(--nk-border);border-radius:12px;overflow:hidden"><nav class="nk-tab-bar always"><button class="nk-tab-bar-item active"><span class="icon">🏠</span><span class="label">${W.home}</span></button><button class="nk-tab-bar-item"><span class="icon">📥</span><span class="label">${W.inbox}</span></button></nav></div>`,
},
{
  tag: 'nk-page', group: 'page', classes: ['nk-page-scroll', 'nk-page', 'nk-page-icon', 'nk-cover', 'lead', 'full', 'small'], frame: 360,
  title: t('Page', 'Seite'),
  desc: t('The document column: a scrolling wrapper, an optional cover, the 760px page with 64px side padding, and the page icon (rendered here because its slotted twin is keyed on the parent). <code>narrow</code> drops the scroll wrapper for pages that are the document itself. With a cover the icon overlaps its bottom edge; a cover without an icon leaves the page its top padding, so the title never touches the picture.',
          'Die Dokumentspalte: scrollender Wrapper, optionales Cover, die 760px-Seite mit 64px Seitenabstand und das Seiten-Icon (hier gerendert, weil sein Slot-Zwilling am Elternelement hängt). <code>narrow</code> lässt den Scroll-Wrapper weg, wenn die Seite selbst das Dokument ist. Mit Cover überlappt das Icon dessen Unterkante; ein Cover ohne Icon lässt der Seite ihren oberen Abstand, der Titel stößt also nie an das Bild.'),
  mobile: t('Side padding drops to 24px below 860px.', 'Seitenabstand sinkt unter 860px auf 24px.'),
  attrs: [str('icon', 'string', 'Page emoji; click fires <code>nk-action</code>.', 'Seiten-Emoji; Klick feuert <code>nk-action</code>.'), bool('full', 'Page option “Full width”: the column fills the window instead of stopping at 760px.', 'Seitenoption „Volle Breite“: Die Spalte füllt das Fenster, statt bei 760px zu enden.'), bool('small', 'Page option “Small text”: document text 14px instead of 16px; headings, lead, prose and editor follow.', 'Seitenoption „Kleiner Text“: Dokumenttext 14px statt 16px; Überschriften, Lead, Prosa und Editor ziehen mit.'), bool('cover', 'Shows the cover strip; the icon then overlaps its bottom edge and the page drops its top padding (the stylesheet’s <code>covered</code> state, also set for a slotted <code>nk-page-cover</code>). Without it the icon sits in 24px top padding, fully visible.', 'Zeigt den Cover-Streifen; das Icon überlappt dann dessen Unterkante und die Seite verliert ihr oberes Padding (der <code>covered</code>-Zustand des Stylesheets, auch bei geslottetem <code>nk-page-cover</code>). Ohne Cover sitzt das Icon in 24px oberem Padding, ganz sichtbar.'), bool('narrow', 'No scroll wrapper (landing / docs page).', 'Ohne Scroll-Wrapper (Landing-/Doku-Seite).')],
  slots: [{ name: '(default)', desc: t('Title, meta, blocks – anything with <code>class="lead"</code> on a <code>&lt;p&gt;</code> becomes the lead paragraph.', 'Titel, Meta, Blöcke – ein <code>&lt;p class="lead"&gt;</code> wird zum Vorspann.') }, { name: 'cover', desc: t('An <code>nk-page-cover</code> (instead of the <code>cover</code> attribute).', 'Ein <code>nk-page-cover</code> (statt des <code>cover</code>-Attributs).') }, { name: 'icon', desc: t('Custom icon node.', 'Eigener Icon-Knoten.') }],
  events: [{ name: 'nk-action', detail: "{ action: 'icon', value }", desc: t('Icon clicked (open an emoji picker).', 'Icon geklickt (Emoji-Picker öffnen).') }],
  example: W => `<div style="display:flex;flex-direction:column;height:100%"><nk-page icon="🚀" cover>
  <nk-page-title>${W.pageTitle}</nk-page-title>
  <nk-page-actions><span>${W.owner}</span><span>${W.created}</span><span>${W.tagged} <nk-tag color="purple">${W.designSystem}</nk-tag></span></nk-page-actions>
  <p class="lead">${W.lead}</p>
</nk-page></div>`,
  classMarkup: W => `<div style="display:flex;flex-direction:column;height:100%"><div class="nk-page-scroll"><div class="nk-cover"></div><div class="nk-page">
  <div class="nk-page-icon">🚀</div>
  <h1 class="nk-page-title">${W.pageTitle}</h1>
  <div class="nk-page-meta"><span>${W.owner}</span><span>${W.created}</span><span>${W.tagged} <span class="nk-tag purple">${W.designSystem}</span></span></div>
  <p class="lead">${W.lead}</p>
</div></div></div>`,
},
{
  tag: 'nk-page-cover', group: 'page', classes: ['nk-cover'],
  title: t('Page cover', 'Seiten-Cover'),
  desc: t('The cover band, as tall as the token <code>--nk-cover-height</code> (200px) – on <code>:root</code>, or on the element for one cover: <code>style="--nk-cover-height: clamp(200px, 30vh, 300px)"</code> comes close to Notion’s 30vh. Without <code>src</code> it shows the token gradient; with <code>src</code> a picture – an <code>&lt;img&gt;</code> inside the band, cropped rather than stretched. <code>position</code> moves the crop, as Notion’s “Reposition” does.', 'Das Cover-Band, so hoch wie das Token <code>--nk-cover-height</code> (200px) – auf <code>:root</code> oder am Element für ein einzelnes Cover: <code>style="--nk-cover-height: clamp(200px, 30vh, 300px)"</code> kommt Notions 30vh nahe. Ohne <code>src</code> der Token-Gradient, mit <code>src</code> ein Bild – ein <code>&lt;img&gt;</code> im Band, beschnitten statt verzerrt. <code>position</code> verschiebt den Ausschnitt wie Notions „Neu positionieren“.'),
  mobile: t('Unchanged; lower <code>--nk-cover-height</code> if the band eats too much of a short screen.', 'Unverändert; <code>--nk-cover-height</code> senken, wenn das Band zu viel eines kurzen Schirms frisst.'),
  attrs: [str('src', 'URL', 'Cover picture.', 'Cover-Bild.'), str('position', 'CSS object-position', 'Where the crop sits.', 'Wo der Ausschnitt sitzt.', { default: 'center' })],
  slots: [], events: [],
  example: W => `<nk-page-cover src="/covers/meadow.svg"></nk-page-cover>`,
  classMarkup: W => `<div class="nk-cover"><img src="/covers/meadow.svg" alt=""></div>`,
},
{
  tag: 'nk-page-title', group: 'page', classes: ['nk-page-title'],
  title: t('Page title', 'Seitentitel'),
  desc: t('The 40px heading. With <code>editable</code> it becomes a plain-text field: Enter commits, blur fires <code>nk-change</code>.', 'Die 40px-Überschrift. Mit <code>editable</code> ein Klartext-Feld: Enter übernimmt, Blur feuert <code>nk-change</code>.'),
  mobile: t('Unchanged; long titles wrap.', 'Unverändert; lange Titel brechen um.'),
  attrs: [bool('editable', 'Inline editing.', 'Direkt bearbeitbar.'), str('placeholder', 'string', 'Shown when empty (editable).', 'Wird angezeigt, wenn leer (editable).'), str('value', 'string', 'Title text (alternative to content).', 'Titeltext (alternativ zum Inhalt).')],
  slots: [{ name: '(default)', desc: t('Title text.', 'Titeltext.') }],
  events: [{ name: 'nk-change', detail: '{ value }', desc: t('Edited title committed.', 'Bearbeiteter Titel übernommen.') }],
  props: ['value'],
  example: W => `<nk-page-title editable>${W.pageTitle}</nk-page-title>`,
  classMarkup: W => `<h1 class="nk-page-title" contenteditable="plaintext-only" spellcheck="false">${W.pageTitle}</h1>`,
},
{
  tag: 'nk-page-actions', group: 'page', classes: ['nk-page-meta'],
  title: t('Page meta row', 'Seiten-Metazeile'),
  desc: t('The quiet row under the title: owner, date, tags – any inline content, 16px apart.', 'Die ruhige Zeile unter dem Titel: Besitzer, Datum, Tags – beliebiger Inline-Inhalt mit 16px Abstand.'),
  mobile: t('Wraps naturally.', 'Bricht natürlich um.'),
  attrs: [], slots: [{ name: '(default)', desc: t('Meta items.', 'Meta-Einträge.') }], events: [],
  example: W => `<nk-page-actions><span>${W.owner}</span><span>${W.created}</span><span>${W.tagged} <nk-tag color="purple">${W.designSystem}</nk-tag></span></nk-page-actions>`,
  classMarkup: W => `<div class="nk-page-meta"><span>${W.owner}</span><span>${W.created}</span><span>${W.tagged} <span class="nk-tag purple">${W.designSystem}</span></span></div>`,
},
{
  tag: 'nk-props', group: 'page', classes: ['nk-props', 'flush'],
  title: t('Page properties', 'Seiteneigenschaften'),
  desc: t('The properties under the title of a database page, the pattern Notion is known for: a list of <code>nk-prop</code> rows. The rows are hosts with <code>display: contents</code>, so each renders as a row of this list – no markup of their own around them. <code>flush</code> drops the outer margin meant for the flow under a title, for a list inside a panel or a flex column.', 'Die Eigenschaften unter dem Titel einer Datenbankseite, das Muster, für das Notion bekannt ist: eine Liste von <code>nk-prop</code>-Zeilen. Die Zeilen sind Hosts mit <code>display: contents</code> und erscheinen deshalb als Zeilen dieser Liste – ohne eigenes Markup drumherum. <code>flush</code> nimmt den Außenabstand für den Fluss unter einem Titel weg, für eine Liste in einem Panel oder einer Flex-Spalte.'),
  mobile: t('Below 860px each property stacks: the name above its value. In a column narrower than 380px the value moves under its name as well.', 'Unter 860px stapelt sich jede Eigenschaft: der Name über seinem Wert. In einer Spalte unter 380px rutscht der Wert ebenfalls unter seinen Namen.'),
  attrs: [bool('flush', 'No outer margin.', 'Kein Außenabstand.')], slots: [{ name: '(default)', desc: t('<code>nk-prop</code> children.', '<code>nk-prop</code>-Kinder.') }], events: [],
  example: W => `<nk-props style="max-width:520px">
  <nk-prop label="${W.propStatus}" icon="◉"><nk-tag color="blue">${W.statusProgress}</nk-tag></nk-prop>
  <nk-prop label="${W.propOwner}" icon="👤"><nk-avatar size="small" color="purple">AL</nk-avatar>Ada Lovelace</nk-prop>
  <nk-prop label="${W.propDue}" icon="📅">${W.dueDate}</nk-prop>
  <nk-prop label="${W.propTags}" icon="🏷️"><nk-tag color="purple">${W.designSystem}</nk-tag><nk-tag>CSS</nk-tag></nk-prop>
  <nk-prop label="${W.propProgress}" icon="▰"><nk-progress value="65" label="65 %" wide></nk-progress></nk-prop>
</nk-props>`,
  classMarkup: W => `<dl class="nk-props" style="max-width:520px">
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">◉</span>${W.propStatus}</dt><dd class="p-value"><span class="nk-tag blue">${W.statusProgress}</span></dd></div>
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">👤</span>${W.propOwner}</dt><dd class="p-value"><span class="nk-avatar small purple">AL</span>Ada Lovelace</dd></div>
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">📅</span>${W.propDue}</dt><dd class="p-value">${W.dueDate}</dd></div>
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">🏷️</span>${W.propTags}</dt><dd class="p-value"><span class="nk-tag purple">${W.designSystem}</span><span class="nk-tag">CSS</span></dd></div>
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">▰</span>${W.propProgress}</dt><dd class="p-value"><span class="nk-progress wide"><i style="width:65%"></i></span><span class="nk-progress-label">65 %</span></dd></div>
</dl>`,
},
{
  tag: 'nk-prop', group: 'page', classes: ['nk-prop', 'p-name', 'p-icon', 'p-value', 'text'],
  title: t('Page property', 'Seiteneigenschaft'),
  desc: t('One property: the name with its type icon in a 160px column, the value beside it, 34px with the hover wash on both halves. The value is the element’s content – tags, an avatar and a name, a date, <code>&lt;nk-progress wide&gt;</code>. A click fires <code>nk-action</code> with the half that was hit, the moment Notion opens the property’s editor. <code>text</code> lets a value that is text – a sentence, an address, a model name with a tag – flow as text instead of setting its parts one under the other. The value keeps at least 220px: in a column narrower than 380px it moves under its name.', 'Eine Eigenschaft: der Name mit seinem Typ-Icon in einer 160px-Spalte, daneben der Wert, 34px hoch mit Hover-Hauch auf beiden Hälften. Der Wert ist der Inhalt des Elements – Tags, ein Avatar mit Namen, ein Datum, <code>&lt;nk-progress wide&gt;</code>. Ein Klick feuert <code>nk-action</code> mit der getroffenen Hälfte – der Moment, in dem Notion den Editor der Eigenschaft öffnet. <code>text</code> lässt einen Wert, der Text ist – ein Satz, eine Adresse, ein Modellname mit Etikett –, als Text fließen, statt seine Teile untereinander zu setzen. Der Wert behält mindestens 220px: In einer Spalte unter 380px rutscht er unter seinen Namen.'),
  mobile: t('Stacks below 860px, and in a column narrower than 380px.', 'Stapelt sich unter 860px und in einer Spalte unter 380px.'),
  attrs: [str('label', 'string', 'Property name.', 'Name der Eigenschaft.'), str('icon', 'string', 'Type icon.', 'Typ-Icon.'), bool('text', 'The value flows as text.', 'Der Wert fließt als Text.')],
  slots: [{ name: '(default)', desc: t('The value.', 'Der Wert.') }, { name: 'icon', desc: t('Icon node.', 'Icon-Knoten.') }],
  events: [{ name: 'nk-action', detail: "{ action: 'name' | 'value', label }", desc: t('Name or value clicked.', 'Name oder Wert geklickt.') }],
  example: W => `<nk-props style="max-width:520px"><nk-prop label="${W.propDue}" icon="📅">${W.dueDate}</nk-prop><nk-prop label="${W.propAddress}" icon="✉️" text>support+design@notionkit.example.com · <nk-tag color="green">${W.propVerified}</nk-tag></nk-prop></nk-props>`,
  classMarkup: W => `<dl class="nk-props" style="max-width:520px"><div class="nk-prop"><dt class="p-name"><span class="p-icon">📅</span>${W.propDue}</dt><dd class="p-value">${W.dueDate}</dd></div><div class="nk-prop"><dt class="p-name"><span class="p-icon">✉️</span>${W.propAddress}</dt><dd class="p-value text">support+design@notionkit.example.com · <span class="nk-tag green">${W.propVerified}</span></dd></div></dl>`,
},
{
  tag: 'nk-panels', group: 'page', classes: ['nk-panels', 'flush'],
  title: t('Panels', 'Panels'),
  desc: t('A grid of <code>nk-panel</code>s: columns of at least 200px that share the row. The panels are hosts with <code>display: contents</code>, so each is a cell of this grid. <code>flush</code> drops the outer margin, for a grid inside a flex column with a gap of its own.', 'Ein Raster aus <code>nk-panel</code>s: Spalten von mindestens 200px, die sich die Zeile teilen. Die Panels sind Hosts mit <code>display: contents</code> und damit Zellen dieses Rasters. <code>flush</code> nimmt den Außenabstand weg, für ein Raster in einer Flex-Spalte mit eigenem Abstand.'),
  mobile: t('Falls to one column as soon as two 200px columns no longer fit.', 'Fällt auf eine Spalte, sobald zwei 200px-Spalten nicht mehr passen.'),
  attrs: [bool('flush', 'No outer margin.', 'Kein Außenabstand.')], slots: [{ name: '(default)', desc: t('<code>nk-panel</code> children.', '<code>nk-panel</code>-Kinder.') }], events: [],
  example: W => `<nk-panels>
  <nk-panel href="#" cover="/covers/aurora.svg" icon="🚀" title="${W.pageTitle}"><p>${W.minAgo}</p></nk-panel>
  <nk-panel href="#" cover="/covers/dunes.svg" icon="📚" title="${W.knowledgeBase}"><p>${W.yesterday}</p></nk-panel>
  <nk-panel title="${W.weeklyReview}"><p>${W.weeklyReviewText}</p></nk-panel>
</nk-panels>`,
  classMarkup: W => `<div class="nk-panels">
  <a class="nk-panel" href="#"><div class="nk-cover"><img src="/covers/aurora.svg" alt=""></div><div class="nk-page-icon">🚀</div><h3>${W.pageTitle}</h3><p>${W.minAgo}</p></a>
  <a class="nk-panel" href="#"><div class="nk-cover"><img src="/covers/dunes.svg" alt=""></div><div class="nk-page-icon">📚</div><h3>${W.knowledgeBase}</h3><p>${W.yesterday}</p></a>
  <div class="nk-panel"><h3>${W.weeklyReview}</h3><p>${W.weeklyReviewText}</p></div>
</div>`,
},
{
  tag: 'nk-panel', group: 'page', classes: ['nk-panel', 'nk-cover', 'nk-page-icon', 'p-head', 'p-end'],
  title: t('Panel', 'Panel'),
  desc: t('A neutral surface for content that belongs together – the cards on Notion’s Home, the boxes in its settings. <code>title</code> is the heading (never a tooltip); the content goes in as <code>&lt;p&gt;</code>s and blocks. <code>cover</code> without a value draws the gradient band, with a URL a picture; <code>icon</code> overlaps the cover as on a page – a page tile. With <code>href</code> the panel is a link. <code>slot="end"</code> sits at the right edge of the title – a state as a tag, a button – as Notion’s settings boxes show a connection, and moves under the title where both do not fit. The cover is <code>--nk-panel-cover-height</code> tall (64px) – set it on <code>:root</code> or on one panel. Inputs, selects and copy fields inside never run past the panel’s edge, however narrow the tile.', 'Eine neutrale Fläche für Inhalt, der zusammengehört – die Karten auf Notions Startseite, die Kästen in seinen Einstellungen. <code>title</code> ist die Überschrift (nie ein Tooltip); der Inhalt kommt als <code>&lt;p&gt;</code>s und Blöcke hinein. <code>cover</code> ohne Wert zeichnet das Verlaufsband, mit URL ein Bild; <code>icon</code> überlappt das Cover wie auf einer Seite – eine Seitenkachel. Mit <code>href</code> ist das Panel ein Link. <code>slot="end"</code> sitzt am rechten Rand des Titels – ein Zustand als Tag, ein Button –, wie Notions Einstellungskästen eine Verbindung zeigen, und rutscht unter den Titel, wo beides nicht nebeneinander passt. Das Cover ist <code>--nk-panel-cover-height</code> hoch (64px) – auf <code>:root</code> oder an einem Panel setzen. Inputs, Selects und Kopierfelder darin ragen nie über den Rand des Panels, wie schmal die Kachel auch ist.'),
  mobile: t('Takes the width of its grid cell.', 'Nimmt die Breite seiner Rasterzelle.'),
  attrs: [str('title', 'string', 'Heading.', 'Überschrift.'), str('icon', 'string', 'Page icon.', 'Seiten-Icon.'), str('cover', 'URL | empty', 'Cover band: empty for the gradient, a URL for a picture.', 'Cover-Band: leer für den Verlauf, eine URL für ein Bild.'), str('href', 'URL', 'Makes the panel a link.', 'Macht das Panel zum Link.'), str('target', 'string', 'Link target.', 'Link-Ziel.')],
  slots: [{ name: '(default)', desc: t('Content: <code>&lt;p&gt;</code>, a prose block, a progress bar.', 'Inhalt: <code>&lt;p&gt;</code>, ein Prosa-Block, ein Fortschrittsbalken.') }, { name: 'end', desc: t('Beside the title, at its right edge: a tag, a button.', 'Neben dem Titel, an seinem rechten Rand: ein Tag, ein Button.') }],
  events: [],
  example: W => `<div style="max-width:360px;display:grid;gap:12px"><nk-panel href="#" cover icon="🚀" title="${W.pageTitle}"><p>${W.minAgo}</p></nk-panel>
<nk-panel title="${W.weeklyReview}"><nk-tag slot="end" color="blue">${W.statusProgress}</nk-tag><p>${W.weeklyReviewText}</p></nk-panel></div>`,
  classMarkup: W => `<div style="max-width:360px;display:grid;gap:12px"><a class="nk-panel" href="#"><div class="nk-cover"></div><div class="nk-page-icon">🚀</div><h3>${W.pageTitle}</h3><p>${W.minAgo}</p></a>
<div class="nk-panel"><div class="p-head"><h3>${W.weeklyReview}</h3><span class="p-end"><span class="nk-tag blue">${W.statusProgress}</span></span></div><p>${W.weeklyReviewText}</p></div></div>`,
},
{
  tag: 'nk-block-host', group: 'page', classes: ['nk-block-host', 'nk-block-handle', 'nk-drop-target'],
  title: t('Block host', 'Block-Hülle'),
  desc: t('The optical shell for editor content: hover wash, focus ring, drop-target line, an optional drag handle. It stays behaviour-neutral – mount your editor into the light DOM; <code>nk-editor</code> (v1.1) will do that for TipTap.', 'Die optische Hülle für Editor-Inhalt: Hover-Fläche, Fokusring, Drop-Target-Linie, optionaler Drag-Griff. Verhaltensneutral – den Editor ins Light DOM mounten; <code>nk-editor</code> (v1.1) übernimmt das für TipTap.'),
  mobile: t('The handle sits 26px left of the column and is hidden when there is no room.', 'Der Griff sitzt 26px links der Spalte und ist ohne Platz verborgen.'),
  attrs: [bool('handle', 'Render the ⠿ drag handle (shown on hover).', 'Drag-Griff ⠿ rendern (bei Hover sichtbar).'), bool('drop-target', 'Drop indicator line above the block.', 'Drop-Indikator-Linie über dem Block.')],
  slots: [{ name: '(default)', desc: t('Block content / the editor root.', 'Block-Inhalt / Editor-Wurzel.') }],
  events: [],
  example: W => `<nk-block-host handle><p style="margin:0" contenteditable="true">${W.editableHint}</p></nk-block-host>`,
  classMarkup: W => `<div class="nk-block-host"><span class="nk-block-handle">⠿</span><p style="margin:0" contenteditable="true">${W.editableHint}</p></div>`,
},
{
  tag: 'nk-banner', group: 'page', classes: ['nk-banner', 'info', 'success', 'warning', 'danger', 'b-action'],
  title: t('Banner', 'Banner'),
  desc: t('A tinted notice row. The colour modifier becomes <code>variant</code>; the action – a <code>&lt;button&gt;</code> – goes into <code>slot="action"</code> and sits at the right edge.', 'Eine getönte Hinweiszeile. Der Farb-Modifikator wird <code>variant</code>; die Aktion – ein <code>&lt;button&gt;</code> – kommt in <code>slot="action"</code> und sitzt am rechten Rand.'),
  mobile: t('Below 860px the action moves under the text instead of squeezing it into a narrow column.', 'Unter 860px rutscht die Aktion unter den Text, statt ihn in eine schmale Spalte zu drücken.'),
  attrs: [str('variant', 'info | success | warning | danger', 'Tint.', 'Tönung.')],
  slots: [{ name: '(default)', desc: t('Icon and text.', 'Icon und Text.') }, { name: 'action', desc: t('The action – a <code>&lt;button&gt;</code>, shown as underlined text on the right.', 'Die Aktion – ein <code>&lt;button&gt;</code>, als unterstrichener Text rechts.') }],
  events: [],
  example: W => `<nk-banner variant="info">ℹ️ <span>${W.bannerInfo}</span><button slot="action" type="button">${W.openPalette}</button></nk-banner>
<nk-banner variant="warning">⚠️ <span>${W.bannerWarn}</span><button slot="action" type="button">${W.view}</button></nk-banner>
<nk-banner variant="success">✓ <span>${W.bannerOk}</span></nk-banner>
<nk-banner variant="danger">⛔ <span>${W.bannerDanger}</span></nk-banner>`,
  classMarkup: W => `<div class="nk-banner info">ℹ️ <span>${W.bannerInfo}</span><button class="b-action" type="button">${W.openPalette}</button></div>
<div class="nk-banner warning">⚠️ <span>${W.bannerWarn}</span><button class="b-action" type="button">${W.view}</button></div>
<div class="nk-banner success">✓ <span>${W.bannerOk}</span></div>
<div class="nk-banner danger">⛔ <span>${W.bannerDanger}</span></div>`,
},
{
  tag: 'nk-empty', group: 'page', classes: ['nk-empty', 'e-icon', 'e-title', 'e-desc', 'e-actions'],
  title: t('Empty state', 'Leerzustand'),
  desc: t('Dashed box with icon, title, description and whatever call to action you slot in.', 'Gestrichelte Box mit Icon, Titel, Beschreibung und der Aktion, die du hineinslottest.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('icon', 'string', 'Emoji.', 'Emoji.'), str('title', 'string', ...["Title. Read once and taken off the host, so it never shows as a tooltip.","Titel. Wird einmal gelesen und vom Host genommen, erscheint also nie als Tooltip."]), str('desc', 'string', 'Description.', 'Beschreibung.')],
  slots: [{ name: '(default)', desc: t('Call to action – several buttons sit in a centred row, 8px apart.', 'Handlungsaufforderung – mehrere Knöpfe stehen in einer zentrierten Zeile, 8px auseinander.') }, { name: 'icon', desc: t('Rich icon.', 'Formatiertes Icon.') }, { name: 'title', desc: t('Rich title.', 'Formatierter Titel.') }, { name: 'desc', desc: t('Rich description.', 'Formatierte Beschreibung.') }],
  events: [],
  example: W => `<nk-empty icon="🗂️" title="${W.emptyTitle}" desc="${W.emptyDesc}"><nk-btn variant="primary" small>${W.newEntry}</nk-btn><nk-btn variant="secondary" small>${W.importBtn}</nk-btn></nk-empty>`,
  classMarkup: W => `<div class="nk-empty"><div class="e-icon">🗂️</div><div class="e-title">${W.emptyTitle}</div><div class="e-desc">${W.emptyDesc}</div><div class="e-actions"><button class="nk-btn primary small">${W.newEntry}</button><button class="nk-btn secondary small">${W.importBtn}</button></div></div>`,
},
{
  tag: 'nk-skeleton', group: 'page', classes: ['nk-skeleton'],
  title: t('Skeleton', 'Skelett'),
  desc: t('Shimmering placeholder lines. <code>lines</code> renders several; <code>widths</code> gives each its own width.', 'Schimmernde Platzhalterzeilen. <code>lines</code> rendert mehrere; <code>widths</code> gibt jeder ihre Breite.'),
  mobile: t('Unchanged; respects reduced motion.', 'Unverändert; respektiert Reduced Motion.'),
  attrs: [str('lines', 'number', 'Number of lines.', 'Anzahl Zeilen.', { default: '1' }), str('height', 'px | CSS length', 'Line height.', 'Zeilenhöhe.', { default: '13' }), str('width', 'CSS length', 'Width for every line.', 'Breite für jede Zeile.'), str('widths', 'list', 'Comma-separated width per line.', 'Kommagetrennte Breite je Zeile.')],
  slots: [], events: [],
  example: W => `<nk-skeleton height="18" width="60%"></nk-skeleton>
<nk-skeleton lines="3" widths="100%,85%,40%"></nk-skeleton>`,
  classMarkup: W => `<div class="nk-skeleton" style="height:18px;width:60%"></div>
<div class="nk-skeleton" style="height:13px"></div>
<div class="nk-skeleton" style="height:13px;width:85%"></div>
<div class="nk-skeleton" style="height:13px;width:40%"></div>`,
},
{
  tag: 'nk-synced', group: 'page', classes: ['nk-synced', 'synced-badge'],
  title: t('Synced block', 'Synchronisierter Block'),
  desc: t('Content that appears in several places, framed with a badge.', 'Inhalt, der an mehreren Orten erscheint, gerahmt mit Badge.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('badge', 'string', 'Badge text.', 'Badge-Text.', { default: '⟳ synced' })],
  slots: [{ name: '(default)', desc: t('Content.', 'Inhalt.') }], events: [],
  example: W => `<nk-synced badge="${W.syncedBadge}"><div style="font-size:14px;line-height:1.55">${W.syncedText}</div></nk-synced>`,
  classMarkup: W => `<div class="nk-synced"><span class="synced-badge">${W.syncedBadge}</span><div style="font-size:14px;line-height:1.55">${W.syncedText}</div></div>`,
},
{
  tag: 'nk-tabs', group: 'page', classes: ['nk-tabs', 'nk-tab', 'active', 'nk-tab-panel', 'scroll'],
  title: t('Tabs', 'Tabs'),
  desc: t('A tab strip with panels. <code>nk-tab</code> children are the tabs; elements with <code>slot="panel"</code> and a matching <code>data-tab</code> are the panels – the tabs hide every panel but the active one through <code>hidden</code>. Arrow keys move between tabs. <code>scroll</code> keeps many tabs in one row that scrolls sideways, scrollbar hidden, and holds the active tab in view – after the first layout, on every change and when the row’s width changes.',
          'Eine Tab-Leiste mit Panels. <code>nk-tab</code>-Kinder sind die Tabs; Elemente mit <code>slot="panel"</code> und passendem <code>data-tab</code> die Panels – die Tabs verbergen per <code>hidden</code> alle bis auf das aktive. Pfeiltasten wechseln. <code>scroll</code> hält viele Tabs in einer Zeile, die seitlich scrollt, ohne sichtbare Scrollleiste, und behält den aktiven Tab im Blick – nach dem ersten Layout, bei jedem Wechsel und wenn sich die Breite der Zeile ändert.'),
  mobile: t('The strip stays on one line; one longer than the screen takes <code>scroll</code>.', 'Die Leiste bleibt einzeilig; eine, die länger ist als der Bildschirm, bekommt <code>scroll</code>.'),
  attrs: [str('value', 'string', 'Active tab value (default: the tab with <code>active</code>, else the first).', 'Aktiver Tab-Wert (Standard: Tab mit <code>active</code>, sonst der erste).'), bool('scroll', 'One row that scrolls sideways and keeps the active tab in view.', 'Eine Zeile, die seitlich scrollt und den aktiven Tab im Blick hält.')],
  slots: [{ name: '(default)', desc: t('<code>nk-tab</code> children.', '<code>nk-tab</code>-Kinder.') }, { name: 'panel', desc: t('Panels with <code>data-tab</code>.', 'Panels mit <code>data-tab</code>.') }],
  events: [{ name: 'nk-change', detail: '{ value }', desc: t('Active tab changed.', 'Aktiver Tab gewechselt.') }, { name: 'nk-select', detail: '{ value, label }', desc: t('From the clicked tab.', 'Vom geklickten Tab.') }],
  props: ['value', 'scroll'],
  example: W => `<nk-tabs value="notes">
  <nk-tab value="notes">${W.notes}</nk-tab>
  <nk-tab value="tasks">${W.tasks}</nk-tab>
  <nk-tab value="files">${W.files}</nk-tab>
  <div slot="panel" data-tab="notes" class="nk-tab-panel">${W.notesText}</div>
  <div slot="panel" data-tab="tasks" class="nk-tab-panel">${W.tasksText}</div>
  <div slot="panel" data-tab="files" class="nk-tab-panel">${W.filesText}</div>
</nk-tabs>`,
  classMarkup: W => `<div class="nk-tabs">
  <span class="nk-tab active">${W.notes}</span>
  <span class="nk-tab">${W.tasks}</span>
  <span class="nk-tab">${W.files}</span>
</div>
<div class="nk-tab-panel">${W.notesText}</div>`,
},
{
  tag: 'nk-tab', group: 'page', classes: ['nk-tab', 'active'],
  title: t('Tab', 'Tab'),
  desc: t('One tab of <code>nk-tabs</code>. Standalone it toggles its own <code>active</code>.', 'Ein Tab von <code>nk-tabs</code>. Alleinstehend schaltet er sein eigenes <code>active</code>.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('value', 'string', 'Value (default: text).', 'Wert (Standard: Text).'), bool('active', 'Active.', 'Aktiv.'), bool('disabled', 'Not selectable.', 'Nicht wählbar.')],
  slots: [{ name: '(default)', desc: t('Label.', 'Beschriftung.') }],
  events: [{ name: 'nk-select', detail: '{ value, label }', desc: t('Clicked / Enter.', 'Geklickt / Enter.') }],
  example: W => `<nk-tabs><nk-tab value="a" active>${W.notes}</nk-tab><nk-tab value="b">${W.tasks}</nk-tab></nk-tabs>`,
  classMarkup: W => `<div class="nk-tabs"><span class="nk-tab active">${W.notes}</span><span class="nk-tab">${W.tasks}</span></div>`,
},
{
  tag: 'nk-segmented', group: 'page', classes: ['nk-segmented', 'active', 'scroll', 'wrap'],
  title: t('Segmented control', 'Segment-Schalter'),
  desc: t('Plain <code>&lt;button value&gt;</code> children stay in the light DOM (the stylesheet’s slotted twins shape them); the element moves <code>.active</code>, handles arrow keys and submits <code>value</code> with the form. With <code>scroll</code> the chosen option stays in view: after the first layout, on every change and when the row’s width changes, the row – never the page – scrolls the least distance, right to left as well.', 'Einfache <code>&lt;button value&gt;</code>-Kinder bleiben im Light DOM (die Slot-Zwillinge des Stylesheets formen sie); das Element bewegt <code>.active</code>, behandelt Pfeiltasten und sendet <code>value</code> mit dem Formular. Mit <code>scroll</code> bleibt die gewählte Option im Blick: nach dem ersten Layout, bei jeder Änderung und wenn sich die Breite der Zeile ändert, scrollt die Zeile – nie die Seite – den kürzesten Weg, auch von rechts nach links.'),
  mobile: t('One row by default, which five filter options overflow on a phone: <code>scroll</code> keeps one thumb-swipeable row capped at the parent width (scrollbar hidden), <code>wrap</code> breaks it onto further rows.', 'Standard ist eine Zeile, die fünf Filteroptionen auf dem Telefon sprengen: <code>scroll</code> hält eine wischbare Zeile, begrenzt auf die Elternbreite (Scrollleiste versteckt), <code>wrap</code> bricht um.'),
  attrs: [str('value', 'string', 'Selected value (default: the button with <code>.active</code>, else the first).', 'Gewählter Wert (Standard: Button mit <code>.active</code>, sonst der erste).'), bool('scroll', 'Horizontally scrollable row, scrollbar hidden.', 'Horizontal scrollbare Zeile, Scrollleiste versteckt.'), bool('wrap', 'Segments wrap onto further rows.', 'Segmente brechen in weitere Zeilen um.'), ...formAttrs],
  slots: [{ name: '(default)', desc: t('<code>&lt;button value="…"&gt;</code> children.', '<code>&lt;button value="…"&gt;</code>-Kinder.') }],
  events: [changeEvent('Selection changed.', 'Auswahl geändert.')],
  example: W => `<nk-segmented name="range" value="week"><button value="week">${W.week}</button><button value="month">${W.month}</button><button value="quarter">${W.quarter}</button></nk-segmented>
<div style="max-width:300px;margin-top:12px"><nk-segmented name="filter" value="all" scroll><button value="all">${W.all}</button><button value="attention">⚠️ ${W.attention}</button><button value="failed">${W.failed}</button><button value="read">${W.read}</button><button value="ignored">${W.ignored}</button></nk-segmented></div>
<div style="max-width:300px;margin-top:12px"><nk-segmented name="filter2" value="all" wrap><button value="all">${W.all}</button><button value="attention">⚠️ ${W.attention}</button><button value="failed">${W.failed}</button><button value="read">${W.read}</button><button value="ignored">${W.ignored}</button></nk-segmented></div>`,
  classMarkup: W => `<div class="nk-segmented"><button class="active">${W.week}</button><button>${W.month}</button><button>${W.quarter}</button></div>
<div style="max-width:300px;margin-top:12px"><div class="nk-segmented scroll"><button class="active">${W.all}</button><button>⚠️ ${W.attention}</button><button>${W.failed}</button><button>${W.read}</button><button>${W.ignored}</button></div></div>
<div style="max-width:300px;margin-top:12px"><div class="nk-segmented wrap"><button class="active">${W.all}</button><button>⚠️ ${W.attention}</button><button>${W.failed}</button><button>${W.read}</button><button>${W.ignored}</button></div></div>`,
},
{
  tag: 'nk-steps', group: 'page', classes: ['nk-steps', 'nk-step', 'st-mark', 'st-desc', 'done', 'current', 'skipped', 'st-label', 'horizontal'],
  title: t('Steps', 'Schritte'),
  desc: t('A short flow – connecting an account, setting up a model – calm and vertical: a numbered circle per step joined by a hairline, done steps with a check on the green tag, the current one ringed in the accent and marked <code>aria-current="step"</code>. <code>current</code> counts from 1; one past the last marks every step done, and <code>next()</code> moves on. The <code>steps</code> attribute is a comma-separated list; the property also takes <code>{ label, desc }</code> objects for a line under the label. A <code>state</code> in such an object – <code>done</code>, <code>skipped</code> or <code>open</code> – wins over the order, for a wizard that lets a step be skipped while a later one is done; a skipped step shows a dashed ring around a dash. <code>selectable</code> makes each label a button: a click or Enter fires <code>nk-select { index, value, step }</code> – <code>index</code> counts from 1, like <code>current</code> – and, unless cancelled, makes that step current. <code>horizontal</code> sets the steps in one row above a wizard.',
          'Ein kurzer Ablauf – ein Konto verbinden, ein Modell einrichten –, ruhig und vertikal: ein nummerierter Kreis pro Schritt, verbunden durch eine Haarlinie, erledigte Schritte mit Haken auf dem grünen Tag, der aktuelle im Akzent umrandet und mit <code>aria-current="step"</code> markiert. <code>current</code> zählt ab 1; einer hinter dem letzten markiert alle Schritte als erledigt, <code>next()</code> geht weiter. Das Attribut <code>steps</code> ist eine kommagetrennte Liste; die Property nimmt auch <code>{ label, desc }</code>-Objekte für eine Zeile unter dem Label. Ein <code>state</code> in so einem Objekt – <code>done</code>, <code>skipped</code> oder <code>open</code> – geht der Reihenfolge vor, für einen Assistenten, der einen Schritt überspringen lässt, während ein späterer erledigt ist; ein übersprungener Schritt zeigt einen gestrichelten Ring um einen Strich. <code>selectable</code> macht jedes Label zum Button: Ein Klick oder Enter feuert <code>nk-select { index, value, step }</code> – <code>index</code> zählt ab 1 wie <code>current</code> – und macht diesen Schritt aktuell, sofern nicht abgebrochen. <code>horizontal</code> setzt die Schritte in eine Zeile über einem Assistenten.'),
  mobile: t('Vertical steps stay as they are. <code>horizontal</code> keeps its row below 860px, with every mark but only the current step’s label.', 'Vertikale Schritte bleiben, wie sie sind. <code>horizontal</code> behält unter 860px seine Zeile, mit jeder Marke, aber nur dem Label des aktuellen Schritts.'),
  attrs: [str('steps', 'list', 'Comma-separated step labels.', 'Kommagetrennte Schritt-Labels.'), str('current', 'number', 'The current step, from 1.', 'Der aktuelle Schritt, ab 1.', { default: '1' }), str('label', 'string', 'The list’s accessible name.', 'Der zugängliche Name der Liste.'), bool('selectable', 'Labels are buttons that jump to their step.', 'Labels sind Buttons, die zu ihrem Schritt springen.'), bool('horizontal', 'One row above a wizard.', 'Eine Zeile über einem Assistenten.')],
  slots: [],
  events: [{ name: 'nk-select', detail: '{ index, value, step }', desc: t('A step clicked (with <code>selectable</code>); cancel it to stay.', 'Ein Schritt geklickt (mit <code>selectable</code>); abbrechen, um zu bleiben.') }],
  props: ['steps', 'current', 'selectable', 'horizontal'], methods: ['next()', 'select(index)'],
  example: W => `<nk-steps label="${W.stepsLabel}" current="2"></nk-steps>
<script>{ document.currentScript.previousElementSibling.steps = [{ label: '${W.stepProvider}', desc: '${W.stepProviderDesc}' }, '${W.stepKey}', '${W.stepTest}']; }</script>
<div style="margin-top:16px"><nk-steps id="stepsWizard" label="${W.stepsLabel}" current="3" horizontal selectable></nk-steps></div>
<script>{ document.getElementById('stepsWizard').steps = [{ label: '${W.stepProvider}', state: 'done' }, { label: '${W.stepKey}', desc: '${W.stepSkipped}', state: 'skipped' }, '${W.stepTest}']; }</script>`,
  classMarkup: W => `<ol class="nk-steps" aria-label="${W.stepsLabel}">
  <li class="nk-step done"><span class="st-mark">✓</span><span>${W.stepProvider}<span class="st-desc">${W.stepProviderDesc}</span></span></li>
  <li class="nk-step current" aria-current="step"><span class="st-mark">2</span><span>${W.stepKey}</span></li>
  <li class="nk-step"><span class="st-mark">3</span><span>${W.stepTest}</span></li>
</ol>
<div style="margin-top:16px"><ol class="nk-steps horizontal" aria-label="${W.stepsLabel}">
  <li class="nk-step done"><span class="st-mark">✓</span><button type="button" class="st-label">${W.stepProvider}</button></li>
  <li class="nk-step skipped"><span class="st-mark">–</span><button type="button" class="st-label">${W.stepKey}<span class="st-desc">${W.stepSkipped}</span></button></li>
  <li class="nk-step current" aria-current="step"><span class="st-mark">3</span><button type="button" class="st-label">${W.stepTest}</button></li>
</ol></div>`,
},
{
  tag: 'nk-stats', group: 'page', classes: ['nk-stats', 'nk-stat', 's-label', 's-value', 's-delta', 'up', 'down'],
  title: t('Stat cards', 'Kennzahl-Karten'),
  desc: t('<code>nk-stats</code> is the row; each <code>nk-stat</code> shows label, value and a trend line coloured by <code>trend</code>.', '<code>nk-stats</code> ist die Zeile; jede <code>nk-stat</code> zeigt Label, Wert und eine Trendzeile, gefärbt über <code>trend</code>.'),
  mobile: t('The row wraps below 860px.', 'Die Zeile bricht unter 860px um.'),
  attrs: [str('label', 'string', '(nk-stat) Label.', '(nk-stat) Label.'), str('value', 'string', '(nk-stat) Big number.', '(nk-stat) Große Zahl.'), str('delta', 'string', '(nk-stat) Trend text.', '(nk-stat) Trendtext.'), str('trend', 'up | down', '(nk-stat) Colours the delta.', '(nk-stat) Färbt das Delta.')],
  slots: [{ name: '(default)', desc: t('(nk-stats) <code>nk-stat</code> children; (nk-stat) slots <code>label</code>, <code>value</code>, <code>delta</code> for rich content.', '(nk-stats) <code>nk-stat</code>-Kinder; (nk-stat) Slots <code>label</code>, <code>value</code>, <code>delta</code> für formatierten Inhalt.') }],
  events: [],
  example: W => `<nk-stats>
  <nk-stat label="${W.activePages}" value="128" delta="${W.deltaPages}" trend="up"></nk-stat>
  <nk-stat label="${W.aiRequests}" value="847" delta="${W.deltaAi}" trend="up"></nk-stat>
  <nk-stat label="${W.openTasks}" value="14" delta="${W.deltaTasks}" trend="down"></nk-stat>
</nk-stats>`,
  classMarkup: W => `<div class="nk-stats">
  <div class="nk-stat"><div class="s-label">${W.activePages}</div><div class="s-value">128</div><div class="s-delta up">${W.deltaPages}</div></div>
  <div class="nk-stat"><div class="s-label">${W.aiRequests}</div><div class="s-value">847</div><div class="s-delta up">${W.deltaAi}</div></div>
  <div class="nk-stat"><div class="s-label">${W.openTasks}</div><div class="s-value">14</div><div class="s-delta down">${W.deltaTasks}</div></div>
</div>`,
},
{
  tag: 'nk-stat', group: 'page', classes: ['nk-stat'],
  title: t('Stat card', 'Kennzahl-Karte'),
  desc: t('One card; see <code>nk-stats</code> for the row.', 'Eine Karte; siehe <code>nk-stats</code> für die Zeile.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('label', 'string', 'Label.', 'Label.'), str('value', 'string', 'Value.', 'Wert.'), str('delta', 'string', 'Trend text.', 'Trendtext.'), str('trend', 'up | down', 'Delta colour.', 'Delta-Farbe.')],
  slots: [{ name: 'label', desc: t('Rich label.', 'Formatiertes Label.') }, { name: 'value', desc: t('Rich value.', 'Formatierter Wert.') }, { name: 'delta', desc: t('Rich delta (add <code>class="up"</code> / <code>"down"</code>).', 'Formatiertes Delta (mit <code>class="up"</code> / <code>"down"</code>).') }],
  events: [],
  example: W => `<nk-stats><nk-stat label="${W.activePages}" value="128" delta="${W.deltaPages}" trend="up"></nk-stat></nk-stats>`,
  classMarkup: W => `<div class="nk-stats"><div class="nk-stat"><div class="s-label">${W.activePages}</div><div class="s-value">128</div><div class="s-delta up">${W.deltaPages}</div></div></div>`,
},
{
  tag: 'nk-avatar-group', group: 'page', classes: ['nk-avatar-group', 'mini-avatar', 'more'],
  title: t('Avatar group', 'Avatar-Gruppe'),
  desc: t('Overlapping <code>.mini-avatar</code> children (light DOM, styled by the slotted twins) plus a “more” bubble from the attribute. Pass <code>.mini-avatar</code>, not <code>.nk-avatar</code>: the document rule of <code>.nk-avatar</code> sets its own 24px, and for slotted nodes the document wins over the group’s 26px.', 'Überlappende <code>.mini-avatar</code>-Kinder (Light DOM, gestylt durch die Slot-Zwillinge) plus eine „Mehr“-Blase aus dem Attribut. <code>.mini-avatar</code> übergeben, nicht <code>.nk-avatar</code>: Die Dokumentregel von <code>.nk-avatar</code> setzt eigene 24px, und bei geslotteten Knoten gewinnt das Dokument gegen die 26px der Gruppe.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('more', 'string', 'Text of the trailing bubble, e.g. <code>+2</code>.', 'Text der letzten Blase, z. B. <code>+2</code>.')],
  slots: [{ name: '(default)', desc: t('<code>&lt;span class="mini-avatar" style="background:…"&gt;</code> children.', '<code>&lt;span class="mini-avatar" style="background:…"&gt;</code>-Kinder.') }],
  events: [],
  example: W => `<div style="display:flex;align-items:center;gap:12px"><nk-avatar-group more="+2"><span class="mini-avatar" style="background:linear-gradient(135deg,var(--nk-decor-purple),var(--nk-decor-blue))">MK</span><span class="mini-avatar" style="background:var(--nk-color-green)">SL</span><span class="mini-avatar" style="background:var(--nk-color-orange)">TW</span></nk-avatar-group><span style="font-size:12.5px;color:var(--nk-text-tertiary)">${W.people}</span></div>`,
  classMarkup: W => `<div style="display:flex;align-items:center;gap:12px"><div class="nk-avatar-group"><span class="nk-avatar">MK</span><span class="nk-avatar green">SL</span><span class="nk-avatar orange">TW</span><span class="mini-avatar more">+2</span></div><span style="font-size:12.5px;color:var(--nk-text-tertiary)">${W.people}</span></div>`,
},
{
  tag: 'nk-avatar', group: 'page', classes: ['nk-avatar', 'small', 'large', 'xlarge', 'square', 'green', 'blue', 'orange', 'purple'],
  title: t('Avatar', 'Avatar'),
  desc: t('A person or a workspace: initials, an emoji or a photo in a circle. <code>size</code> small (20px), default 24px, large (32px), xlarge (56px); <code>color</code> one of Notion’s nine names or any CSS background, without it the avatar gradient; <code>square</code> for a workspace icon. Without content the initials come from <code>name</code>; with <code>src</code> a photo fills the circle and <code>name</code> becomes its alt text. Initials from <code>name</code> are the first letter or digit of each word: “Planer (Dev)” → PD, “Anna-Lena Groß” → AG.', 'Eine Person oder ein Workspace: Initialen, ein Emoji oder ein Foto im Kreis. <code>size</code> small (20px), Standard 24px, large (32px), xlarge (56px); <code>color</code> einer der neun Notion-Namen oder ein beliebiger CSS-Hintergrund, ohne ihn der Avatar-Verlauf; <code>square</code> für ein Workspace-Icon. Ohne Inhalt kommen die Initialen aus <code>name</code>; mit <code>src</code> füllt ein Foto den Kreis und <code>name</code> wird sein Alt-Text. Initialen aus <code>name</code> sind der erste Buchstabe oder die erste Ziffer jedes Worts: „Planer (Dev)“ → PD, „Anna-Lena Groß“ → AG.'),
  mobile: t('Unchanged. A fixed size, so a row of avatars never reflows.', 'Unverändert. Eine feste Größe, eine Reihe von Avataren fließt also nie um.'),
  attrs: [str('size', 'small | large | xlarge', 'Size; default 24px.', 'Größe; Standard 24px.'), str('color', 'colour name | CSS', 'gray, brown, orange, yellow, green, blue, purple, pink, red – or any CSS background.', 'gray, brown, orange, yellow, green, blue, purple, pink, red – oder ein beliebiger CSS-Hintergrund.'), bool('square', 'Corners instead of a circle.', 'Ecken statt Kreis.'), str('name', 'string', 'Initials when empty; alt text of the photo.', 'Initialen, wenn leer; Alt-Text des Fotos.'), str('src', 'URL', 'Photo.', 'Foto.')],
  slots: [{ name: '(default)', desc: t('Initials or an emoji.', 'Initialen oder ein Emoji.') }],
  events: [],
  example: W => `<div style="display:flex;align-items:center;gap:10px"><nk-avatar size="small" color="blue">TW</nk-avatar><nk-avatar>AL</nk-avatar><nk-avatar color="green">SL</nk-avatar><nk-avatar size="large" color="orange">MK</nk-avatar><nk-avatar size="xlarge" color="purple" name="Ada Lovelace"></nk-avatar><nk-avatar size="large" square>A</nk-avatar></div>`,
  classMarkup: W => `<div style="display:flex;align-items:center;gap:10px"><span class="nk-avatar small blue">TW</span><span class="nk-avatar">AL</span><span class="nk-avatar green">SL</span><span class="nk-avatar large orange">MK</span><span class="nk-avatar xlarge purple">AL</span><span class="nk-avatar large square">A</span></div>`,
},
{
  tag: 'nk-mention', group: 'page', classes: ['nk-mention', 'person', 'page', 'date', 'mini-avatar'],
  title: t('Mention', 'Erwähnung'),
  desc: t('Inline chip for a person (with avatar slot), a page or a date.', 'Inline-Chip für eine Person (mit Avatar-Slot), eine Seite oder ein Datum.'),
  mobile: t('Unchanged; never wraps.', 'Unverändert; bricht nie um.'),
  attrs: [str('type', 'person | page | date', 'Kind of mention.', 'Art der Erwähnung.')],
  slots: [{ name: 'avatar', desc: t('<code>.mini-avatar</code> for persons.', '<code>.mini-avatar</code> für Personen.') }, { name: '(default)', desc: t('Text.', 'Text.') }],
  events: [],
  example: W => `<p style="margin:0;line-height:1.7"><nk-mention type="person"><span slot="avatar" class="mini-avatar" style="background:#448361">SL</span>${W.mentionPerson}</nk-mention> · <nk-mention type="page">${W.mentionPage}</nk-mention> · <nk-mention type="date">${W.mentionDate}</nk-mention></p>`,
  classMarkup: W => `<p style="margin:0;line-height:1.7"><span class="nk-mention person"><span class="mini-avatar" style="background:#448361">SL</span>${W.mentionPerson}</span> · <span class="nk-mention page">${W.mentionPage}</span> · <span class="nk-mention date">${W.mentionDate}</span></p>`,
},
{
  tag: 'nk-template-btn', group: 'page', classes: ['nk-template-btn'],
  title: t('Template button', 'Vorlagen-Button'),
  desc: t('Full-width, left-aligned button on the callout background – “insert a template”. Fires <code>nk-select</code> with <code>value</code>.', 'Button in voller Breite, linksbündig, auf Callout-Hintergrund – „Vorlage einfügen“. Feuert <code>nk-select</code> mit <code>value</code>.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('icon', 'string', 'Leading emoji.', 'Emoji vorn.'), str('value', 'string', 'Reported value (default: text).', 'Gemeldeter Wert (Standard: Text).'), bool('disabled', 'Disabled.', 'Deaktiviert.')],
  slots: [{ name: '(default)', desc: t('Label.', 'Beschriftung.') }],
  events: [{ name: 'nk-select', detail: '{ value, label }', desc: t('Clicked.', 'Geklickt.') }],
  example: W => `<nk-template-btn icon="📅" value="week-plan">${W.weekPlan}</nk-template-btn>
<nk-template-btn icon="🤝" value="minutes">${W.minutes}</nk-template-btn>
<nk-template-btn icon="🔁" value="retro">${W.retro}</nk-template-btn>`,
  classMarkup: W => `<button class="nk-template-btn">📅 ${W.weekPlan}</button>
<button class="nk-template-btn">🤝 ${W.minutes}</button>
<button class="nk-template-btn">🔁 ${W.retro}</button>`,
},
{
  tag: 'nk-model-card', group: 'page', classes: ['nk-model-card', 'selected', 'm-radio', 'm-name', 'm-desc'],
  title: t('Model card', 'Modell-Karte'),
  desc: t('A radio-like card. Cards with the same <code>name</code> form a group; the selected one submits <code>value</code> with the form.', 'Eine Radio-artige Karte. Karten mit gleichem <code>name</code> bilden eine Gruppe; die gewählte sendet <code>value</code> mit dem Formular.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('title', 'string', ...["Name line. Read once and taken off the host, so it never shows as a tooltip.","Namenszeile. Wird einmal gelesen und vom Host genommen, erscheint also nie als Tooltip."]), str('desc', 'string', 'Description.', 'Beschreibung.'), ...formAttrs, str('value', 'string', 'Submitted value.', 'Gesendeter Wert.'), bool('selected', 'Selected.', 'Ausgewählt.')],
  slots: [{ name: 'title', desc: t('Rich name line (e.g. with an <code>nk-tag</code>).', 'Formatierte Namenszeile (z. B. mit <code>nk-tag</code>).') }, { name: 'desc', desc: t('Rich description.', 'Formatierte Beschreibung.') }],
  events: [{ name: 'nk-change', detail: '{ value, name, checked }', desc: t('Selected.', 'Ausgewählt.') }, { name: 'nk-select', detail: '{ value, label }', desc: t('Selected.', 'Ausgewählt.') }],
  example: W => `<nk-model-card name="model" value="pro" title="${W.modelPro}" desc="${W.modelProDesc}" selected></nk-model-card>
<nk-model-card name="model" value="fast" title="${W.modelFast}" desc="${W.modelFastDesc}"></nk-model-card>`,
  classMarkup: W => `<div class="nk-model-card selected"><div class="m-radio"></div><div><div class="m-name">${W.modelPro}</div><div class="m-desc">${W.modelProDesc}</div></div></div>
<div class="nk-model-card"><div class="m-radio"></div><div><div class="m-name">${W.modelFast}</div><div class="m-desc">${W.modelFastDesc}</div></div></div>`,
},
{
  tag: 'nk-profile-row', group: 'page', classes: ['nk-profile-row', 'big-avatar'],
  title: t('Profile row', 'Profilzeile'),
  desc: t('A 56px gradient avatar with whatever you slot beside it – usually two buttons.', 'Ein 56px-Gradient-Avatar mit dem, was du daneben slottest – meist zwei Buttons.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('avatar', 'string', 'Initials.', 'Initialen.')],
  slots: [{ name: 'avatar', desc: t('Custom avatar (e.g. an image).', 'Eigener Avatar (z. B. ein Bild).') }, { name: '(default)', desc: t('Content beside the avatar.', 'Inhalt neben dem Avatar.') }],
  events: [],
  example: W => `<nk-profile-row avatar="MK"><nk-btn variant="secondary" small>${W.changePhoto}</nk-btn> <nk-btn variant="danger" small>${W.remove}</nk-btn></nk-profile-row>`,
  classMarkup: W => `<div class="nk-profile-row"><div class="big-avatar">MK</div><button class="nk-btn secondary small">${W.changePhoto}</button> <button class="nk-btn danger small">${W.remove}</button></div>`,
},
{
  tag: 'nk-danger-zone', group: 'page', classes: ['nk-danger-zone', 'dz-title'],
  title: t('Danger zone', 'Gefahrenzone'),
  desc: t('Red-framed box for destructive settings.', 'Rot gerahmte Box für destruktive Einstellungen.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('title', 'string', ...["Red heading. Read once and taken off the host, so it never shows as a tooltip.","Rote Überschrift. Wird einmal gelesen und vom Host genommen, erscheint also nie als Tooltip."])],
  slots: [{ name: '(default)', desc: t('Fields and buttons.', 'Felder und Buttons.') }],
  events: [],
  example: W => `<nk-danger-zone title="${W.dangerTitle}"><nk-field label="${W.deleteWorkspace}" desc="${W.dangerDesc}"><nk-btn variant="danger-solid" small>${W.delete}</nk-btn></nk-field></nk-danger-zone>`,
  classMarkup: W => `<div class="nk-danger-zone"><div class="dz-title">${W.dangerTitle}</div><div class="nk-field"><div><div class="f-label">${W.deleteWorkspace}</div><div class="f-desc">${W.dangerDesc}</div></div><div class="f-control"><button class="nk-btn danger-solid small">${W.delete}</button></div></div></div>`,
},
{
  tag: 'nk-member-list', group: 'page', classes: ['nk-member-list', 'nk-member-row', 'last', 'm-mail', 'mini-avatar'],
  title: t('Member list', 'Mitgliederliste'),
  desc: t('Rows of <code>nk-member-row</code>; the list marks the last row so it loses its bottom border. Each row shows avatar (initials + <code>color</code>), name, mail and a <code>slot="role"</code> control on the right.', 'Zeilen aus <code>nk-member-row</code>; die Liste markiert die letzte Zeile, damit ihr unterer Rand entfällt. Jede Zeile zeigt Avatar (Initialen + <code>color</code>), Name, Mail und ein <code>slot="role"</code>-Control rechts.'),
  mobile: t('Unchanged; the role select shrinks to 120px.', 'Unverändert; das Rollen-Select schrumpft auf 120px.'),
  attrs: [str('name', 'string', '(row) Name.', '(row) Name.'), str('mail', 'string', '(row) Mail line.', '(row) Mail-Zeile.'), str('avatar', 'string', '(row) Initials (default: from the name).', '(row) Initialen (Standard: aus dem Namen).'), str('color', 'CSS color', '(row) Avatar background.', '(row) Avatar-Hintergrund.'), bool('last', '(row) No bottom border – set by the list.', '(row) Kein unterer Rand – setzt die Liste.')],
  slots: [{ name: '(default)', desc: t('(list) rows; (row) extra content.', '(list) Zeilen; (row) Zusatzinhalt.') }, { name: 'role', desc: t('(row) A control on the right, e.g. <code>nk-select compact</code>.', '(row) Ein Control rechts, z. B. <code>nk-select compact</code>.') }, { name: 'avatar', desc: t('(row) Custom avatar.', '(row) Eigener Avatar.') }],
  events: [],
  example: W => `<nk-member-list>
  <nk-member-row name="Sara Lindt" mail="sara@example.com" color="#448361"><nk-select slot="role" compact value="editor"><option value="viewer">${W.viewer}</option><option value="editor">${W.editor}</option><option value="admin">${W.admin}</option></nk-select></nk-member-row>
  <nk-member-row name="Tom Weber" mail="tom@example.com" color="#d9730d"><nk-select slot="role" compact value="viewer"><option value="viewer">${W.viewer}</option><option value="editor">${W.editor}</option><option value="admin">${W.admin}</option></nk-select></nk-member-row>
</nk-member-list>`,
  classMarkup: W => `<div class="nk-member-list">
  <div class="nk-member-row"><span class="mini-avatar" style="background:#448361">SL</span><div>Sara Lindt<div class="m-mail">sara@example.com</div></div><select class="nk-select"><option>${W.viewer}</option><option selected>${W.editor}</option><option>${W.admin}</option></select></div>
  <div class="nk-member-row"><span class="mini-avatar" style="background:#d9730d">TW</span><div>Tom Weber<div class="m-mail">tom@example.com</div></div><select class="nk-select"><option selected>${W.viewer}</option><option>${W.editor}</option><option>${W.admin}</option></select></div>
</div>`,
},
{
  tag: 'nk-member-row', group: 'page', classes: ['nk-member-row'],
  title: t('Member row', 'Mitgliederzeile'),
  desc: t('One row; see <code>nk-member-list</code>.', 'Eine Zeile; siehe <code>nk-member-list</code>.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('name', 'string', 'Name.', 'Name.'), str('mail', 'string', 'Mail.', 'Mail.'), str('avatar', 'string', 'Initials.', 'Initialen.'), str('color', 'colour name | CSS', 'Avatar colour: one of the nine names (gray … red) or any CSS background; without it the avatar gradient.', 'Avatar-Farbe: einer der neun Namen (gray … red) oder ein beliebiger CSS-Hintergrund; ohne sie der Avatar-Verlauf.'), bool('last', 'No bottom border.', 'Kein unterer Rand.')],
  slots: [{ name: 'role', desc: t('Control on the right.', 'Control rechts.') }, { name: 'avatar', desc: t('Custom avatar.', 'Eigener Avatar.') }, { name: '(default)', desc: t('Extra content.', 'Zusatzinhalt.') }],
  events: [],
  example: W => `<nk-member-row name="Sara Lindt" mail="sara@example.com" color="green" last></nk-member-row>`,
  classMarkup: W => `<div class="nk-member-row last"><span class="nk-avatar green">SL</span><div>Sara Lindt<div class="m-mail">sara@example.com</div></div></div>`,
},

// ============================================================ WAVE 4 · OVERLAYS
{
  tag: 'nk-modal', group: 'overlays', classes: ['nk-modal-backdrop', 'open', 'nk-modal', 'nk-settings-nav', 'nk-settings-content'], frame: 520, overlay: true,
  title: t('Settings modal', 'Einstellungs-Modal'),
  desc: t('The settings overlay: backdrop, a 960×640 dialog with a nav column and a content column. The nav rows are rendered by the modal from the panes’ <code>label</code>/<code>icon</code>/<code>group</code>, so the 27px rows and the 860px icon rail come straight from the stylesheet. Escape and the backdrop close it; focus moves in and back; the page behind is scroll-locked and inert. Place it directly under <code>&lt;body&gt;</code>.',
          'Das Einstellungs-Overlay: Backdrop, ein 960×640-Dialog mit Nav- und Inhaltsspalte. Die Nav-Zeilen rendert das Modal aus <code>label</code>/<code>icon</code>/<code>group</code> der Panes, sodass 27px-Zeilen und die 860px-Icon-Leiste direkt aus dem Stylesheet kommen. Escape und Backdrop schließen; der Fokus wandert hinein und zurück; die Seite dahinter ist scroll-gesperrt und inert. Direkt unter <code>&lt;body&gt;</code> platzieren.'),
  mobile: t('Below 860px the nav collapses to a 60px icon rail; the dialog takes 92vw × 86vh.', 'Unter 860px wird die Nav zur 60px-Icon-Leiste; der Dialog nimmt 92vw × 86vh.'),
  attrs: [bool('open', 'Shown.', 'Sichtbar.'), str('pane', 'string', 'Name of the active pane (default: the pane with <code>active</code>, else the first).', 'Name des aktiven Panes (Standard: Pane mit <code>active</code>, sonst das erste).')],
  slots: [{ name: '(default)', desc: t('<code>nk-settings-pane</code> children.', '<code>nk-settings-pane</code>-Kinder.') }, { name: 'user', desc: t('<code>nk-settings-user</code> at the top of the nav.', '<code>nk-settings-user</code> oben in der Nav.') }, { name: 'nav', desc: t('Extra nav content below the generated rows (860px rules do not reach slotted elements).', 'Zusätzlicher Nav-Inhalt unter den generierten Zeilen (860px-Regeln erreichen geslottete Elemente nicht).') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Opened / closed.', 'Geöffnet / geschlossen.') }, { name: 'nk-select', detail: '{ value, label }', desc: t('Pane switched.', 'Pane gewechselt.') }],
  props: ['open', 'pane', 'panes'], methods: ['show(pane?)', 'close()', 'toggle()'],
  example: W => `<nk-modal open>
  <nk-settings-user slot="user" name="${W.userName}" mail="${W.userMail}"></nk-settings-user>
  <nk-settings-pane name="profile" group="${W.account}" icon="👤" label="${W.myProfile}" title="${W.myProfile}" active>
    <nk-profile-row avatar="MK"><nk-btn variant="secondary" small>${W.changePhoto}</nk-btn></nk-profile-row>
    <nk-field label="${W.displayName}" desc="${W.displayNameDesc}"><nk-input value="${W.userName}"></nk-input></nk-field>
    <nk-field label="${W.email}"><nk-input type="email" value="${W.userMail}"></nk-input></nk-field>
  </nk-settings-pane>
  <nk-settings-pane name="appearance" group="${W.account}" icon="🎨" label="${W.appearance}" title="${W.appearance}">
    <nk-field label="${W.theme}"><nk-select><option>${W.light}</option><option>${W.dark}</option><option>${W.system}</option></nk-select></nk-field>
  </nk-settings-pane>
  <nk-settings-pane name="members" group="${W.workspaceSection}" icon="👥" label="${W.members}" title="${W.members}">
    <nk-member-list><nk-member-row name="Sara Lindt" mail="sara@example.com" color="#448361"></nk-member-row></nk-member-list>
  </nk-settings-pane>
</nk-modal>`,
  classMarkup: W => `<div class="nk-modal-backdrop open"><div class="nk-modal">
  <nav class="nk-settings-nav">
    <div class="nk-settings-user"><div class="avatar">MK</div><div class="u-text"><div class="name">${W.userName}</div><div class="mail">${W.userMail}</div></div></div>
    <div class="nk-section-label">${W.account}</div>
    <div class="nk-tree-item active"><span class="icon">👤</span><span class="label">${W.myProfile}</span></div>
    <div class="nk-tree-item"><span class="icon">🎨</span><span class="label">${W.appearance}</span></div>
    <div class="nk-section-label">${W.workspaceSection}</div>
    <div class="nk-tree-item"><span class="icon">👥</span><span class="label">${W.members}</span></div>
  </nav>
  <div class="nk-settings-content">
    <section class="nk-settings-pane active"><h2>${W.myProfile}</h2>
      <div class="nk-profile-row"><div class="big-avatar">MK</div><button class="nk-btn secondary small">${W.changePhoto}</button></div>
      <div class="nk-field"><div><div class="f-label">${W.displayName}</div><div class="f-desc">${W.displayNameDesc}</div></div><div class="f-control"><input class="nk-input" value="${W.userName}"></div></div>
      <div class="nk-field"><div><div class="f-label">${W.email}</div></div><div class="f-control"><input class="nk-input" type="email" value="${W.userMail}"></div></div>
    </section>
  </div>
</div></div>`,
},
{
  tag: 'nk-sheet', group: 'overlays', classes: ['nk-sheet-backdrop', 'open', 'nk-sheet', 'sh-grabber', 'sh-title'], frame: 360, overlay: true,
  title: t('Sheet', 'Sheet'),
  desc: t('Notion’s mobile surface for menus, properties and more – the phone’s twin of the modal, with its contract: <code>show()</code>, <code>close()</code>, <code>toggle()</code>; Escape and the backdrop close it; focus moves in and back; the page behind is scroll-locked and inert. The panel rises from the bottom edge with a grabber, <code>title</code> sits under it and names the dialog. Rows inside are 40px, a thumb’s height. Choosing a row does not close the sheet – <code>nk-select</code> bubbles out and the app decides. For a menu that is a popover on the desktop and a sheet on the phone, use <code>&lt;nk-menu floating sheet&gt;</code>. Place it directly under <code>&lt;body&gt;</code>.',
          'Notions Mobil-Fläche für Menüs, Eigenschaften und mehr – der Telefon-Zwilling des Modals, mit dessen Vertrag: <code>show()</code>, <code>close()</code>, <code>toggle()</code>; Escape und der Backdrop schließen es; der Fokus wandert hinein und zurück; die Seite dahinter ist scroll-gesperrt und inert. Das Panel steigt mit einem Griff von der Unterkante auf, <code>title</code> steht darunter und benennt den Dialog. Zeilen darin sind 40px hoch, eine Daumenhöhe. Eine gewählte Zeile schließt das Sheet nicht – <code>nk-select</code> bubbelt hinaus, die App entscheidet. Für ein Menü, das auf dem Desktop Popover und auf dem Telefon Sheet ist, <code>&lt;nk-menu floating sheet&gt;</code> nehmen. Direkt unter <code>&lt;body&gt;</code> platzieren.'),
  mobile: t('Made for the phone: full width, above the tab bar, bottom padding from the safe area; the content scrolls inside the sheet. On larger screens at most 640px wide, centred.', 'Fürs Telefon gemacht: volle Breite, über der Tab-Leiste, unteres Padding aus der Safe Area; der Inhalt scrollt im Sheet. Auf größeren Schirmen höchstens 640px breit, zentriert.'),
  attrs: [bool('open', 'Shown.', 'Sichtbar.'), str('title', 'string', 'Heading under the grabber and the dialog’s name – never a tooltip.', 'Überschrift unter dem Griff und Name des Dialogs – nie ein Tooltip.')],
  slots: [{ name: '(default)', desc: t('The content: an <code>nk-tree</code>, menu items, fields.', 'Der Inhalt: ein <code>nk-tree</code>, Menüeinträge, Felder.') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Opened / closed.', 'Geöffnet / geschlossen.') }],
  props: ['open', 'title'], methods: ['show()', 'close()', 'toggle()'],
  example: W => `<nk-sheet open title="${W.more}">
  <nk-tree manual>
    <nk-section-label>${W.favourites}</nk-section-label>
    <nk-tree-item icon="🚀">${W.mvp}</nk-tree-item>
    <nk-tree-item icon="🎙️">${W.voh}</nk-tree-item>
    <nk-section-label>${W.workspaceSection}</nk-section-label>
    <nk-tree-item icon="🧠">${W.knowledgeBase}</nk-tree-item>
    <nk-tree-item icon="🗑️">${W.trash}</nk-tree-item>
  </nk-tree>
</nk-sheet>`,
  classMarkup: W => `<div class="nk-sheet-backdrop open"><div class="nk-sheet" role="dialog" aria-modal="true" aria-label="${W.more}">
  <div class="sh-grabber"></div>
  <div class="sh-title">${W.more}</div>
  <div class="nk-section-label">${W.favourites}</div>
  <div class="nk-tree-item"><span class="icon">🚀</span><span class="label">${W.mvp}</span></div>
  <div class="nk-tree-item"><span class="icon">🎙️</span><span class="label">${W.voh}</span></div>
  <div class="nk-section-label">${W.workspaceSection}</div>
  <div class="nk-tree-item"><span class="icon">🧠</span><span class="label">${W.knowledgeBase}</span></div>
  <div class="nk-tree-item"><span class="icon">🗑️</span><span class="label">${W.trash}</span></div>
</div></div>`,
},
{
  tag: 'nk-peek', group: 'overlays', classes: ['nk-peek-backdrop', 'open', 'nk-peek', 'pk-resize', 'active', 'pk-bar', 'pk-body'], frame: 520, overlay: true,
  title: t('Side peek', 'Side Peek'),
  desc: t('Notion’s side peek: a database row opens at the right edge, full height, next to the table, which stays usable – no scrim, nothing inert. The bar carries » to close and your actions (<code>slot="actions"</code>); the body is the page – <code>nk-page-title</code> (32px here), <code>nk-props</code>, a <code>.nk-prose</code>, <code>nk-comments</code>. <code>show()</code> slides it in and moves focus to it; », Escape and a click elsewhere close it, and a click that calls <code>show()</code> again – another row – only swaps the content. Clicks inside other overlays leave it open. Place it directly under <code>&lt;body&gt;</code>. <code>resizable</code> gives it Notion’s drag on the left edge, <code>inset</code> moves the page aside instead of covering it.',
          'Notions Side Peek: Eine Datenbankzeile öffnet sich am rechten Rand, in voller Höhe, neben der Tabelle, die bedienbar bleibt – keine Abdunklung, nichts inert. Die Leiste trägt » zum Schließen und deine Aktionen (<code>slot="actions"</code>); der Body ist die Seite – <code>nk-page-title</code> (hier 32px), <code>nk-props</code>, eine <code>.nk-prose</code>, <code>nk-comments</code>. <code>show()</code> schiebt es herein und setzt den Fokus hinein; », Escape und ein Klick daneben schließen es, und ein Klick, der <code>show()</code> erneut aufruft – eine andere Zeile –, tauscht nur den Inhalt. Klicks in anderen Overlays lassen es offen. Direkt unter <code>&lt;body&gt;</code> platzieren. <code>resizable</code> gibt ihm Notions Ziehen am linken Rand, <code>inset</code> rückt die Seite zur Seite, statt sie zu überdecken.'),
  mobile: t('Below 860px a bottom sheet over a dimmed page, title in 28px – and modal there: the page is inert and scroll-locked, a tap on the dimmed page closes it.', 'Unter 860px ein Bottom Sheet über abgedunkelter Seite, Titel in 28px – und dort modal: Die Seite ist inert und scroll-gesperrt, ein Tipp auf die abgedunkelte Seite schließt es.'),
  attrs: [bool('open', 'Shown.', 'Sichtbar.'), str('label', 'string', 'The dialog’s name – the entry’s title.', 'Der Name des Dialogs – der Titel des Eintrags.'), str('close-label', 'string', 'Name of ».', 'Name von ».', { default: 'Close' }),
    bool('resizable', 'The left edge makes it wider or narrower – pointer and arrow keys; the width is the token <code>--nk-peek-width</code> on <code>:root</code>.', 'Der linke Rand macht es breiter oder schmaler – Zeiger und Pfeiltasten; die Breite ist das Token <code>--nk-peek-width</code> auf <code>:root</code>.'),
    str('width', 'px', 'Sets the width, within min and max.', 'Setzt die Breite, innerhalb von min und max.', { default: '560' }), str('min', 'px', 'Narrowest.', 'Am schmalsten.', { default: '380' }), str('max', 'px', 'Widest.', 'Am breitesten.', { default: 'window − 320' }),
    str('resize-label', 'string', 'Name of the edge.', 'Name des Randes.', { default: 'Resize' }),
    bool('inset', 'While open on the desktop, the page’s <code>nk-app</code> makes room instead of lying under it – for a chart whose bars must stay visible.', 'Solange offen auf dem Desktop, macht die <code>nk-app</code> der Seite Platz, statt darunter zu liegen – für ein Diagramm, dessen Balken sichtbar bleiben müssen.')],
  slots: [{ name: '(default)', desc: t('The page: title, properties, prose, comments.', 'Die Seite: Titel, Eigenschaften, Prosa, Kommentare.') }, { name: 'actions', desc: t('Buttons beside » – open as page, share.', 'Buttons neben » – als Seite öffnen, teilen.') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Opened / closed.', 'Geöffnet / geschlossen.') }, { name: 'nk-resize', detail: '{ width }', desc: t('A drag or a key changed the width – the moment to keep it.', 'Ziehen oder eine Taste hat die Breite geändert – der Moment, sie zu speichern.') }],
  props: ['open', 'width'], methods: ['show()', 'close()', 'toggle()'],
  example: W => `<nk-peek open resizable resize-label="${W.resize}" label="${W.peekTitle}">
  <nk-btn slot="actions" variant="topbar" aria-label="${W.openPage}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></nk-btn>
  <nk-page-title>🗃️ ${W.peekTitle}</nk-page-title>
  <nk-props>
    <nk-prop label="${W.propStatus}" icon="◉"><nk-tag color="blue">${W.statusProgress}</nk-tag></nk-prop>
    <nk-prop label="${W.propDue}" icon="📅">20.05.2026</nk-prop>
  </nk-props>
  <div class="nk-prose"><p>${W.peekText}</p></div>
</nk-peek>`,
  classMarkup: W => `<div class="nk-peek-backdrop open"><aside class="nk-peek" role="dialog" aria-label="${W.peekTitle}">
  <div class="pk-resize" role="separator" aria-orientation="vertical" aria-label="${W.resize}" tabindex="0"></div>
  <div class="pk-bar"><button class="nk-topbar-btn" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 17 5-5-5-5M13 17l5-5-5-5"/></svg></button><button class="nk-topbar-btn" aria-label="${W.openPage}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button></div>
  <div class="pk-body">
    <h1 class="nk-page-title">🗃️ ${W.peekTitle}</h1>
    <dl class="nk-props">
      <div class="nk-prop"><dt class="p-name"><span class="p-icon">◉</span>${W.propStatus}</dt><dd class="p-value"><span class="nk-tag blue">${W.statusProgress}</span></dd></div>
      <div class="nk-prop"><dt class="p-name"><span class="p-icon">📅</span>${W.propDue}</dt><dd class="p-value">20.05.2026</dd></div>
    </dl>
    <div class="nk-prose"><p>${W.peekText}</p></div>
  </div>
</aside></div>`,
},
{
  tag: 'nk-dialog', group: 'overlays', classes: ['nk-dialog-backdrop', 'open', 'nk-dialog', 'wide', 'dl-title', 'dl-body', 'dl-actions'], frame: 320, overlay: true,
  title: t('Dialog', 'Dialog'),
  desc: t('A question or a short form – “Move to trash?”, the name of a new view, the link between two tasks – with the contract of <code>nk-modal</code> and <code>nk-sheet</code>: <code>show()</code>, <code>close()</code>, <code>toggle()</code>, <code>nk-toggle</code>; Escape – captured, before a peek, a menu or a modal behind it – and the backdrop close it; focus moves in, to an <code>[autofocus]</code> element or the first field or button, and back; the page behind is inert and scroll-locked. It lies above the modal and the sheet. <code>title</code> is the heading, the default slot the text or the fields, <code>slot="actions"</code> the buttons, the confirming one last. A button in <code>slot="actions"</code> with a <code>value</code> closes it with that value, one anywhere inside with <code>data-close</code> too – another button with a value, an option of <code>nk-segmented</code> say, leaves it open – and so does the submit of a <code>&lt;form method="dialog"&gt;</code> inside; before it closes, <code>nk-close</code> fires and can be cancelled – the place to check an input. <code>alert</code> for a question, <code>wide</code> (560px) for a form. <code>show(from)</code> hands focus back to <code>from</code> – the ⋯ of a menu that closed. Place it directly under <code>&lt;body&gt;</code>. While it is open the page behind is inert, but floating menus and date pickers under <code>&lt;body&gt;</code> – and the tooltip and toast – stay usable, so a field in the dialog can open one.',
          'Eine Frage oder ein kurzes Formular – „In den Papierkorb?“, der Name einer neuen Ansicht, die Verknüpfung zweier Vorgänge – mit dem Vertrag von <code>nk-modal</code> und <code>nk-sheet</code>: <code>show()</code>, <code>close()</code>, <code>toggle()</code>, <code>nk-toggle</code>; Escape – in der Capture-Phase, vor einem Peek, Menü oder Modal dahinter – und der Backdrop schließen ihn; der Fokus wandert hinein, zu einem <code>[autofocus]</code>-Element oder dem ersten Feld oder Button, und zurück; die Seite dahinter ist inert und scroll-gesperrt. Er liegt über Modal und Sheet. <code>title</code> ist die Überschrift, der Default-Slot der Text oder die Felder, <code>slot="actions"</code> die Buttons, der bestätigende zuletzt. Ein Button in <code>slot="actions"</code> mit <code>value</code> schließt ihn mit diesem Wert, einer mit <code>data-close</code> an beliebiger Stelle ebenso – ein anderer Button mit Wert, etwa eine Option von <code>nk-segmented</code>, lässt ihn offen –, ebenso das Absenden eines <code>&lt;form method="dialog"&gt;</code> darin; vor dem Schließen feuert <code>nk-close</code> und lässt sich abbrechen – die Stelle, eine Eingabe zu prüfen. <code>alert</code> für eine Frage, <code>wide</code> (560px) für ein Formular. <code>show(from)</code> gibt den Fokus an <code>from</code> zurück – das ⋯ eines Menüs, das sich geschlossen hat. Direkt unter <code>&lt;body&gt;</code> platzieren. Solange er offen ist, ist die Seite dahinter inert, schwebende Menüs und Datumsauswahlen unter <code>&lt;body&gt;</code> – und Tooltip und Toast – bleiben aber bedienbar, ein Feld im Dialog kann also eines öffnen.'),
  mobile: t('Below 860px a bottom sheet with a grabber, the buttons stacked across the width, the confirming one on top.', 'Unter 860px ein Bottom Sheet mit Griff, die Buttons über die Breite gestapelt, der bestätigende oben.'),
  attrs: [bool('open', 'Shown.', 'Sichtbar.'), str('title', 'string', 'Heading and the dialog’s name – never a tooltip.', 'Überschrift und Name des Dialogs – nie ein Tooltip.'), bool('alert', 'An alertdialog, described by its text.', 'Ein Alertdialog, beschrieben durch seinen Text.'), bool('wide', '560px instead of 440px.', '560px statt 440px.')],
  slots: [{ name: '(default)', desc: t('The text or the fields.', 'Der Text oder die Felder.') }, { name: 'actions', desc: t('The buttons, right; a <code>value</code> closes with it.', 'Die Buttons, rechts; ein <code>value</code> schließt damit.') }],
  events: [{ name: 'nk-close', detail: '{ value }', desc: t('About to close – cancel it to keep it open.', 'Schließt gleich – abbrechen hält ihn offen.') }, { name: 'nk-toggle', detail: '{ open }', desc: t('Opened / closed.', 'Geöffnet / geschlossen.') }],
  props: ['open', 'returnValue', 'title'], methods: ['show(from)', 'close(value)', 'toggle()'],
  example: W => `<nk-dialog open alert title="${W.trashTitle}">
  ${W.trashText}
  <nk-btn slot="actions" variant="secondary" value="">${W.cancel}</nk-btn>
  <nk-btn slot="actions" variant="danger-solid" value="trash">${W.moveToTrash}</nk-btn>
</nk-dialog>`,
  classMarkup: W => `<div class="nk-dialog-backdrop open"><div class="nk-dialog" role="alertdialog" aria-modal="true" aria-label="${W.moveToTrash}">
  <div class="dl-title">${W.trashTitle}</div>
  <div class="dl-body">${W.trashText}</div>
  <div class="dl-actions"><button class="nk-btn secondary">${W.cancel}</button><button class="nk-btn danger-solid">${W.moveToTrash}</button></div>
</div></div>`,
},
{
  tag: 'nk-settings-pane', group: 'overlays', classes: ['nk-settings-pane', 'active'],
  title: t('Settings pane', 'Einstellungs-Pane'),
  desc: t('One pane of the settings modal. <code>label</code>, <code>icon</code> and <code>group</code> feed the modal’s nav; <code>title</code> renders the pane heading. Slotted <code>&lt;h2&gt;</code>/<code>&lt;h3&gt;</code> are styled too.', 'Ein Pane des Einstellungs-Modals. <code>label</code>, <code>icon</code> und <code>group</code> speisen die Nav des Modals; <code>title</code> rendert die Pane-Überschrift. Geslottete <code>&lt;h2&gt;</code>/<code>&lt;h3&gt;</code> werden ebenfalls gestylt.'),
  mobile: t('Content padding drops to 24px below 860px.', 'Inhalts-Padding sinkt unter 860px auf 24px.'),
  attrs: [str('name', 'string', 'Identifier used by <code>pane</code>.', 'Kennung für <code>pane</code>.'), str('label', 'string', 'Nav label (a pane without label gets no nav row).', 'Nav-Beschriftung (ohne Label keine Nav-Zeile).'), str('icon', 'string', 'Nav icon.', 'Nav-Icon.'), str('group', 'string', 'Section label above its nav rows.', 'Abschnittsbeschriftung über den Nav-Zeilen.'), str('title', 'string', ...["Pane heading. Read once and taken off the host, so it never shows as a tooltip.","Pane-Überschrift. Wird einmal gelesen und vom Host genommen, erscheint also nie als Tooltip."]), bool('active', 'Visible (managed by the modal).', 'Sichtbar (vom Modal verwaltet).')],
  slots: [{ name: '(default)', desc: t('Fields, headings, anything.', 'Felder, Überschriften, alles.') }],
  events: [],
  example: W => `<nk-settings-pane title="${W.notifications}" active><h3>${W.email}</h3><nk-field label="${W.notify}"><nk-switch checked></nk-switch></nk-field></nk-settings-pane>`,
  classMarkup: W => `<section class="nk-settings-pane active"><h2>${W.notifications}</h2><h3>${W.email}</h3><div class="nk-field"><div><div class="f-label">${W.notify}</div></div><div class="f-control"><button class="nk-switch" role="switch" aria-checked="true"></button></div></div></section>`,
},
{
  tag: 'nk-settings-user', group: 'overlays', classes: ['nk-settings-user', 'avatar', 'u-text', 'name', 'mail'],
  title: t('Settings user', 'Einstellungs-Benutzer'),
  desc: t('The user card at the top of the settings nav.', 'Die Benutzerkarte oben in der Einstellungs-Nav.'),
  mobile: t('Below 860px only the avatar remains.', 'Unter 860px bleibt nur der Avatar.'),
  attrs: [str('name', 'string', 'Name.', 'Name.'), str('mail', 'string', 'Mail.', 'Mail.'), str('avatar', 'string', 'Initials (default: from the name).', 'Initialen (Standard: aus dem Namen).')],
  slots: [{ name: 'avatar', desc: t('Custom avatar.', 'Eigener Avatar.') }],
  events: [],
  example: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:230px;padding:10px 8px"><nk-settings-user name="${W.userName}" mail="${W.userMail}"></nk-settings-user></div>`,
  classMarkup: W => `<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:230px;padding:10px 8px"><div class="nk-settings-user"><div class="avatar">MK</div><div class="u-text"><div class="name">${W.userName}</div><div class="mail">${W.userMail}</div></div></div></div>`,
},
{
  tag: 'nk-cmdk', group: 'overlays', classes: ['nk-cmdk-backdrop', 'open', 'nk-cmdk', 'nk-cmdk-input-row', 'nk-cmdk-list', 'nk-cmdk-group', 'nk-cmdk-item', 'selected', 'm-icon', 'm-shortcut', 'nk-cmdk-empty', 'nk-cmdk-footer'], frame: 420, overlay: true,
  title: t('Command palette', 'Befehlspalette'),
  desc: t('⌘K. Feed it <code>palette.commands = [{ group, items: [{ id, icon, label, shortcut, keywords, action }] }]</code>; it searches fuzzily over label and keywords, keeps group order, moves the selection with ↑↓, picks with Enter or click (<code>nk-command</code> plus the item’s <code>action</code>), and closes on Escape or the backdrop. The hotkey is <code>mod+k</code> unless changed. Place it directly under <code>&lt;body&gt;</code>.',
          '⌘K. Befüllen mit <code>palette.commands = [{ group, items: [{ id, icon, label, shortcut, keywords, action }] }]</code>; es sucht unscharf über Label und Keywords, behält die Gruppenreihenfolge, bewegt die Auswahl mit ↑↓, wählt mit Enter oder Klick (<code>nk-command</code> plus <code>action</code> des Eintrags) und schließt mit Escape oder Backdrop. Der Hotkey ist <code>mod+k</code>, sofern nicht geändert. Direkt unter <code>&lt;body&gt;</code> platzieren.'),
  mobile: t('Full width (96vw) and closer to the top below 860px.', 'Unter 860px volle Breite (96vw) und näher am oberen Rand.'),
  attrs: [bool('open', 'Shown.', 'Sichtbar.'), str('hotkey', 'string', 'Global shortcut, e.g. <code>mod+k</code>, <code>mod+shift+p</code>.', 'Globaler Shortcut, z. B. <code>mod+k</code>, <code>mod+shift+p</code>.', { default: 'mod+k' }), str('placeholder', 'string', 'Input placeholder.', 'Platzhalter des Eingabefelds.')],
  slots: [{ name: 'footer', desc: t('Replaces the default key hints.', 'Ersetzt die Standard-Tastenhinweise.') }],
  events: [{ name: 'nk-command', detail: '{ id, item, query }', desc: t('An item was picked; <code>preventDefault()</code> skips <code>item.action</code>.', 'Ein Eintrag wurde gewählt; <code>preventDefault()</code> überspringt <code>item.action</code>.') }, { name: 'nk-toggle', detail: '{ open }', desc: t('Opened / closed.', 'Geöffnet / geschlossen.') }],
  props: ['commands', 'open', 'query'], methods: ['show()', 'close()', 'toggle()', 'results()', 'pick(index?)'],
  example: W => `<nk-cmdk open placeholder="${W.searchCommand}"></nk-cmdk>
<script>
  document.querySelector('nk-cmdk').commands = [
    { group: '${W.pages}', items: [
      { id: 'mvp', icon: '🚀', label: '${W.mvp}' },
      { id: 'voh', icon: '🎙️', label: '${W.voh}' },
      { id: 'kb', icon: '🧠', label: '${W.knowledgeBase}' },
    ]},
    { group: '${W.actions}', items: [
      { id: 'new', icon: '＋', label: '${W.newPageCmd}', shortcut: '⌘N' },
      { id: 'theme', icon: '🌙', label: '${W.toggleTheme}', shortcut: '⌘⇧L' },
      { id: 'settings', icon: '⚙️', label: '${W.openSettings}', shortcut: '⌘,' },
    ]},
  ];
</script>`,
  classMarkup: W => `<div class="nk-cmdk-backdrop open"><div class="nk-cmdk">
  <div class="nk-cmdk-input-row"><span style="font-size:15px">🔍</span><input placeholder="${W.searchCommand}"><kbd class="nk-kbd">esc</kbd></div>
  <div class="nk-cmdk-list">
    <div class="nk-cmdk-group">${W.pages}</div>
    <div class="nk-cmdk-item selected"><span class="m-icon">🚀</span><span>${W.mvp}</span></div>
    <div class="nk-cmdk-item"><span class="m-icon">🎙️</span><span>${W.voh}</span></div>
    <div class="nk-cmdk-item"><span class="m-icon">🧠</span><span>${W.knowledgeBase}</span></div>
    <div class="nk-cmdk-group">${W.actions}</div>
    <div class="nk-cmdk-item"><span class="m-icon">＋</span><span>${W.newPageCmd}</span><span class="m-shortcut">⌘N</span></div>
    <div class="nk-cmdk-item"><span class="m-icon">🌙</span><span>${W.toggleTheme}</span><span class="m-shortcut">⌘⇧L</span></div>
    <div class="nk-cmdk-item"><span class="m-icon">⚙️</span><span>${W.openSettings}</span><span class="m-shortcut">⌘,</span></div>
  </div>
  <div class="nk-cmdk-footer"><span><kbd class="nk-kbd">↑</kbd><kbd class="nk-kbd">↓</kbd> navigate</span><span><kbd class="nk-kbd">↵</kbd> open</span><span><kbd class="nk-kbd">⌘</kbd><kbd class="nk-kbd">K</kbd> toggle</span></div>
</div></div>`,
},
{
  tag: 'nk-menu', group: 'overlays', classes: ['nk-pop', 'nk-menu', 'nk-menu-item', 'm-icon', 'm-shortcut', 'danger', 'nk-menu-sep', 'nk-menu-label', 'floating', 'sheet', 'open'],
  title: t('Menu', 'Menü'),
  desc: t('A 230px context menu. Items are <code>nk-menu-item</code>s (<code>type="separator"</code> / <code>"label"</code> for the rest); ↑↓ move, Enter selects, <code>nk-select</code> bubbles up. Inside <code>nk-pop</code> or the workspace switcher it is part of their surface. With <code>floating</code> it is a menu over the page of its own, NotionKit’s <code>.nk-pop.floating</code>: <code>menu.show(button)</code> opens it under the button, right edges aligned (<code>align="start"</code>: left edges), and it fades in like the palette. A tap outside closes it and reaches nothing else; Escape and a chosen item close it, a switch row keeps it open. Opened from the keyboard, focus moves to the first item and back when it closes. Put it directly under <code>&lt;body&gt;</code>, like the other overlays. Floating, it opens upwards where the window ends below and there is more room above, and a menu longer than the room scrolls inside; in an <code>nk-modal</code> or <code>nk-dialog</code> it sits right as well, and opened from one of them it stays usable – an open dialog, modal or sheet leaves floating menus alone.',
          'Ein 230px-Kontextmenü. Einträge sind <code>nk-menu-item</code>s (<code>type="separator"</code> / <code>"label"</code> für den Rest); ↑↓ bewegen, Enter wählt, <code>nk-select</code> bubbelt hoch. In <code>nk-pop</code> oder im Workspace-Umschalter ist es Teil ihrer Fläche. Mit <code>floating</code> ist es ein eigenes Menü über der Seite, NotionKits <code>.nk-pop.floating</code>: <code>menu.show(button)</code> öffnet es unter dem Button, rechte Kanten bündig (<code>align="start"</code>: linke Kanten), und es blendet ein wie die Palette. Ein Tipp daneben schließt es und erreicht sonst nichts; Escape und ein gewählter Eintrag schließen es, eine Schalter-Zeile lässt es offen. Per Tastatur geöffnet, wandert der Fokus zum ersten Eintrag und beim Schließen zurück. Direkt unter <code>&lt;body&gt;</code> platzieren, wie die anderen Overlays. Schwebend klappt es nach oben, wo das Fenster unten endet und oben mehr Platz ist, und ein Menü, das länger als der Platz ist, scrollt in sich; in einem <code>nk-modal</code> oder <code>nk-dialog</code> sitzt es ebenfalls richtig und bleibt, daraus geöffnet, bedienbar – ein offener Dialog, ein Modal oder Sheet lässt schwebende Menüs in Ruhe.'),
  mobile: t('With <code>sheet</code> the floating menu is a bottom sheet below 860px – full width, a grabber, 40px rows, the page dimmed – whatever position <code>show()</code> wrote: one markup, two presentations, as Notion’s mobile app opens every menu.', 'Mit <code>sheet</code> ist das schwebende Menü unter 860px ein Bottom Sheet – volle Breite, ein Griff, 40px-Zeilen, die Seite abgedunkelt –, egal welche Position <code>show()</code> geschrieben hat: ein Markup, zwei Darstellungen, wie Notions Mobil-App jedes Menü öffnet.'),
  attrs: [
    bool('floating', 'A menu over the page: fixed, closed until <code>open</code>, fades in.', 'Ein Menü über der Seite: fixiert, geschlossen bis <code>open</code>, blendet ein.'),
    bool('sheet', 'Below 860px a bottom sheet (with <code>floating</code>).', 'Unter 860px ein Bottom Sheet (mit <code>floating</code>).'),
    bool('open', 'Shown (with <code>floating</code>).', 'Sichtbar (mit <code>floating</code>).'),
    str('align', 'end | start', 'Which edges <code>show(anchor)</code> aligns.', 'Welche Kanten <code>show(anchor)</code> bündig setzt.', { default: 'end' }),
  ],
  slots: [{ name: '(default)', desc: t('<code>nk-menu-item</code> children.', '<code>nk-menu-item</code>-Kinder.') }],
  events: [{ name: 'nk-select', detail: '{ value, label, item }', desc: t('From the chosen item.', 'Vom gewählten Eintrag.') }, { name: 'nk-toggle', detail: '{ open }', desc: t('A floating menu opened / closed.', 'Ein schwebendes Menü geöffnet / geschlossen.') }],
  props: ['open', 'items'], methods: ['show(anchor?)', 'close()', 'toggle(anchor?)', 'focusFirst()'],
  example: W => `<nk-menu>
  <nk-menu-item type="label">${W.page}</nk-menu-item>
  <nk-menu-item icon="✏️" shortcut="⌘E" value="rename">${W.rename}</nk-menu-item>
  <nk-menu-item icon="📄" shortcut="⌘D" value="duplicate">${W.duplicate}</nk-menu-item>
  <nk-menu-item icon="📁" value="move">${W.moveTo}</nk-menu-item>
  <nk-menu-item type="separator"></nk-menu-item>
  <nk-menu-item icon="🗑️" danger value="delete">${W.delete}</nk-menu-item>
</nk-menu>`,
  classMarkup: W => `<div class="nk-pop nk-menu">
  <div class="nk-menu-label">${W.page}</div>
  <div class="nk-menu-item"><span class="m-icon">✏️</span>${W.rename}<span class="m-shortcut">⌘E</span></div>
  <div class="nk-menu-item"><span class="m-icon">📄</span>${W.duplicate}<span class="m-shortcut">⌘D</span></div>
  <div class="nk-menu-item"><span class="m-icon">📁</span>${W.moveTo}</div>
  <div class="nk-menu-sep"></div>
  <div class="nk-menu-item danger"><span class="m-icon">🗑️</span>${W.delete}</div>
</div>`,
},
{
  tag: 'nk-menu-item', group: 'overlays', classes: ['nk-menu-item', 'danger', 'nk-menu-sep', 'nk-menu-label'],
  title: t('Menu item', 'Menüeintrag'),
  desc: t('One row of <code>nk-menu</code>: icon, label, shortcut; <code>danger</code> for destructive actions. <code>type</code> switches to a separator or a group label, or to a row with a switch on the right – “Small text” in Notion’s page menu: a click flips <code>checked</code> and fires <code>nk-change</code>, so the menu stays open. <code>type="check"</code> puts a ✓ where the shortcut stands, as in a filter menu – for a choice of several: a click flips <code>checked</code> and fires <code>nk-change { value, checked }</code> instead of <code>nk-select</code>, and the menu stays open.', 'Eine Zeile von <code>nk-menu</code>: Icon, Label, Shortcut; <code>danger</code> für Destruktives. <code>type</code> macht daraus Trenner oder Gruppenlabel oder eine Zeile mit Schalter rechts – „Kleiner Text“ in Notions Seitenmenü: Ein Klick kippt <code>checked</code> und feuert <code>nk-change</code>, das Menü bleibt also offen. <code>type="check"</code> setzt ein ✓, wo der Shortcut steht, wie in einem Filtermenü – für eine Mehrfachauswahl: Ein Klick kippt <code>checked</code> und feuert <code>nk-change { value, checked }</code> statt <code>nk-select</code>, das Menü bleibt offen.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('icon', 'string', 'Leading icon.', 'Icon vorn.'), str('shortcut', 'string', 'Trailing shortcut text.', 'Shortcut-Text hinten.'), str('value', 'string', 'Reported value (default: text).', 'Gemeldeter Wert (Standard: Text).'), bool('danger', 'Red text.', 'Roter Text.'), str('type', 'item | separator | label | switch | check', 'Row kind.', 'Zeilenart.', { default: 'item' }), bool('checked', 'The switch is on, the check shows (type="switch" / "check").', 'Der Schalter ist an, das Häkchen steht (type="switch" / "check").'), bool('disabled', 'Not selectable.', 'Nicht wählbar.')],
  slots: [{ name: '(default)', desc: t('Label.', 'Beschriftung.') }, { name: 'icon', desc: t('Icon node.', 'Icon-Knoten.') }],
  events: [{ name: 'nk-select', detail: '{ value, label, item }', desc: t('Clicked / Enter.', 'Geklickt / Enter.') }, { name: 'nk-change', detail: '{ value, checked, item }', desc: t('A switch or check row flipped.', 'Eine Schalter- oder Häkchen-Zeile gekippt.') }],
  example: W => `<nk-menu><nk-menu-item icon="✏️" shortcut="⌘E" value="rename">${W.rename}</nk-menu-item><nk-menu-item type="switch" icon="🔡" value="small" checked>${W.smallText}</nk-menu-item></nk-menu>`,
  classMarkup: W => `<div class="nk-pop nk-menu"><div class="nk-menu-item"><span class="m-icon">✏️</span>${W.rename}<span class="m-shortcut">⌘E</span></div><div class="nk-menu-item" role="menuitemcheckbox" aria-checked="true"><span class="m-icon">🔡</span>${W.smallText}<span class="nk-switch" aria-hidden="true" aria-checked="true"></span></div></div>`,
},
{
  tag: 'nk-pop', group: 'overlays', classes: ['nk-pop'],
  title: t('Popover', 'Popover'),
  desc: t('Anchors a floating surface to a trigger. The trigger goes in <code>slot="trigger"</code> and toggles <code>open</code>; outside clicks, Escape and an <code>nk-select</code> from inside close it. Content is wrapped in <code>.nk-pop</code> unless it brings its own surface (<code>nk-menu</code>, <code>nk-emoji-picker</code>) or <code>bare</code> is set.', 'Verankert eine schwebende Fläche an einem Auslöser. Der Auslöser kommt in <code>slot="trigger"</code> und schaltet <code>open</code>; Klick außerhalb, Escape und ein <code>nk-select</code> von innen schließen. Inhalt wird in <code>.nk-pop</code> gehüllt, außer er bringt seine eigene Fläche mit (<code>nk-menu</code>, <code>nk-emoji-picker</code>) oder <code>bare</code> ist gesetzt.'),
  mobile: t('Positioned relative to the trigger; keep it near the viewport edge in mind.', 'Relativ zum Auslöser positioniert; Viewport-Rand im Blick behalten.'),
  attrs: [bool('open', 'Shown.', 'Sichtbar.'), str('placement', 'bottom-start | bottom-end | top-start | top-end', 'Where the surface opens.', 'Wo die Fläche aufgeht.', { default: 'bottom-start' }), bool('bare', 'No <code>.nk-pop</code> wrapper.', 'Kein <code>.nk-pop</code>-Wrapper.')],
  slots: [{ name: 'trigger', desc: t('The button.', 'Der Button.') }, { name: '(default)', desc: t('The floating content.', 'Der schwebende Inhalt.') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Opened / closed.', 'Geöffnet / geschlossen.') }],
  methods: ['show()', 'close()', 'toggle()'],
  example: W => `<div style="min-height:220px"><nk-pop open>
  <nk-btn slot="trigger" variant="secondary">${W.options} ▾</nk-btn>
  <nk-menu><nk-menu-item icon="✏️" value="rename">${W.rename}</nk-menu-item><nk-menu-item icon="📄" value="duplicate">${W.duplicate}</nk-menu-item><nk-menu-item type="separator"></nk-menu-item><nk-menu-item icon="🗑️" danger value="delete">${W.delete}</nk-menu-item></nk-menu>
</nk-pop></div>`,
  classMarkup: W => `<div style="min-height:220px"><div style="position:relative;display:inline-block">
  <button class="nk-btn secondary">${W.options} ▾</button>
  <div style="position:absolute;top:100%;left:0;margin-top:4px;z-index:50"><div class="nk-pop nk-menu"><div class="nk-menu-item"><span class="m-icon">✏️</span>${W.rename}</div><div class="nk-menu-item"><span class="m-icon">📄</span>${W.duplicate}</div><div class="nk-menu-sep"></div><div class="nk-menu-item danger"><span class="m-icon">🗑️</span>${W.delete}</div></div></div>
</div></div>`,
},
{
  tag: 'nk-emoji-picker', group: 'overlays', classes: ['nk-pop', 'nk-emoji-search', 'nk-emoji-grid', 'nk-emoji-cats', 'active'],
  title: t('Emoji picker', 'Emoji-Auswahl'),
  desc: t('Search field, 8-column grid, category strip. Ships with a built-in set (names for search); <code>picker.emojis = [{ char, name, cat }]</code> replaces it. A click fires <code>nk-select { emoji }</code>.', 'Suchfeld, 8-spaltiges Raster, Kategorieleiste. Bringt einen eingebauten Satz mit (Namen für die Suche); <code>picker.emojis = [{ char, name, cat }]</code> ersetzt ihn. Ein Klick feuert <code>nk-select { emoji }</code>.'),
  mobile: t('296px wide; fine on any phone.', '296px breit; passt auf jedes Telefon.'),
  attrs: [str('placeholder', 'string', 'Search placeholder.', 'Such-Platzhalter.'), str('value', 'string', 'Last picked emoji.', 'Zuletzt gewähltes Emoji.')],
  slots: [],
  events: [{ name: 'nk-select', detail: '{ emoji, value }', desc: t('Emoji picked.', 'Emoji gewählt.') }],
  props: ['emojis', 'value'],
  example: W => `<nk-emoji-picker placeholder="${W.search}…"></nk-emoji-picker>`,
  classMarkup: W => `<div class="nk-pop"><input class="nk-emoji-search" placeholder="${W.search}…"><div class="nk-emoji-grid"><span>😀</span><span>😊</span><span>😂</span><span>🙂</span><span>😉</span><span>😍</span><span>🤔</span><span>😎</span><span>🥳</span><span>😴</span><span>🤯</span><span>😅</span><span>🙃</span><span>😇</span><span>🤗</span><span>😢</span></div><div class="nk-emoji-cats"><span class="active">😀</span><span>👋</span><span>🌿</span><span>☕</span><span>🎯</span><span>🚀</span><span>💡</span><span>✅</span></div></div>`,
},
{
  tag: 'nk-toast', group: 'overlays', classes: ['nk-toast', 'show'], frame: 120, overlay: true,
  title: t('Toast', 'Toast'),
  desc: t('One inverted pill at the bottom centre, above every overlay; over a tab bar at the bottom of the screen it rises 12px above the bar. <code>toast.show("Saved")</code> shows it and hides it after <code>duration</code> ms; <code>open</code> is the state.', 'Eine invertierte Pille unten mittig, über jedem Overlay; über einer Tab-Leiste am unteren Bildschirmrand steigt sie 12px über die Leiste. <code>toast.show("Gespeichert")</code> zeigt sie und blendet nach <code>duration</code> ms aus; <code>open</code> ist der Zustand.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [bool('open', 'Visible.', 'Sichtbar.'), str('duration', 'ms', 'Auto-hide delay (0 = stay).', 'Ausblend-Verzögerung (0 = bleibt).', { default: '2200' }), str('icon', 'string', 'Leading glyph.', 'Zeichen vorn.', { default: '✓' })],
  slots: [{ name: '(default)', desc: t('Static content (when <code>show()</code> gets no message).', 'Statischer Inhalt (wenn <code>show()</code> keine Nachricht bekommt).') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Shown / hidden.', 'Gezeigt / verborgen.') }],
  methods: ['show(message?, { duration })', 'close()'], props: ['open', 'message'],
  example: W => `<nk-toast open duration="0">${W.toastText}</nk-toast>`,
  classMarkup: W => `<div class="nk-toast show">✓ <span>${W.toastText}</span></div>`,
},
{
  tag: 'nk-tooltip', group: 'overlays', classes: ['nk-tooltip', 'open', 'tt-key'],
  title: t('Tooltip', 'Tooltip'),
  desc: t('Notion’s hover hint in the toast’s colours, a shortcut muted beside it. One <code>&lt;nk-tooltip&gt;</code> without <code>for</code> serves every element with <code>data-tooltip</code> (and <code>data-tooltip-key</code>) on the page, inside shadow roots too – a whole toolbar in one element; with <code>for</code> it belongs to one element and shows its own content and <code>shortcut</code>. It appears after <code>delay</code> ms (400) under the pointer and at once on keyboard focus, never on touch; leaving, a press, blur, scrolling and Escape hide it. It sits 6px below its target and centred, above it where the window ends, 8px inside the window – <code>placeNear</code> in <code>util/floating.js</code>. <code>show(target, text, shortcut)</code> takes an element or a rect, for what has no element of its own: the bars of a chart. The target’s <code>aria-describedby</code> names it while it shows. Hover the buttons. A tooltip shown with <code>show(rect, …)</code> stays until <code>hide()</code>, the pointer on another <code>[data-tooltip]</code>, a press or Escape; the wheel hides it too, also inside a shadow root. A line break in the text is kept.',
          'Notions Hover-Hinweis in den Farben des Toasts, ein Kürzel gedämpft daneben. Ein <code>&lt;nk-tooltip&gt;</code> ohne <code>for</code> bedient jedes Element mit <code>data-tooltip</code> (und <code>data-tooltip-key</code>) auf der Seite, auch in Shadow Roots – eine ganze Werkzeugleiste mit einem Element; mit <code>for</code> gehört er zu einem Element und zeigt seinen eigenen Inhalt und <code>shortcut</code>. Er erscheint nach <code>delay</code> ms (400) unter dem Zeiger und sofort bei Tastaturfokus, nie bei Berührung; Verlassen, ein Druck, Blur, Scrollen und Escape blenden ihn aus. Er sitzt 6px unter seinem Ziel und zentriert, darüber, wo das Fenster endet, 8px innerhalb des Fensters – <code>placeNear</code> in <code>util/floating.js</code>. <code>show(target, text, shortcut)</code> nimmt ein Element oder ein Rechteck, für das, was kein eigenes Element hat: die Balken eines Diagramms. Das <code>aria-describedby</code> des Ziels nennt ihn, solange er sichtbar ist. Die Buttons überfahren. Ein mit <code>show(rect, …)</code> gezeigter Tooltip bleibt bis <code>hide()</code>, bis der Zeiger auf ein anderes <code>[data-tooltip]</code> geht, bis zu einem Druck oder Escape; das Mausrad blendet ihn ebenfalls aus, auch in einem Shadow Root. Ein Zeilenumbruch im Text bleibt erhalten.'),
  mobile: t('No hover on a phone: it shows nothing on touch.', 'Kein Hover auf dem Telefon: Bei Berührung zeigt er nichts.'),
  attrs: [str('for', 'id', 'The one element it belongs to; without it, every <code>[data-tooltip]</code>.', 'Das eine Element, zu dem er gehört; ohne, jedes <code>[data-tooltip]</code>.'), str('shortcut', 'string', 'With <code>for</code>: the shortcut beside the text.', 'Mit <code>for</code>: das Kürzel neben dem Text.'), str('delay', 'ms', 'Wait under the pointer.', 'Warten unter dem Zeiger.', { default: '400' }), str('placement', 'bottom | top', 'Preferred side.', 'Bevorzugte Seite.', { default: 'bottom' })],
  slots: [{ name: '(default)', desc: t('With <code>for</code>: the text.', 'Mit <code>for</code>: der Text.') }],
  events: [],
  props: ['open'], methods: ['show(target, text, shortcut)', 'hide()'],
  example: W => `<div style="display:flex;gap:16px;align-items:center;padding:4px 0 44px">
  <nk-btn variant="topbar" aria-label="${W.moreTip}" data-tooltip="${W.moreTip}">⋯</nk-btn>
  <nk-btn variant="topbar" aria-label="${W.favouriteTip}" data-tooltip="${W.favouriteTip}">⭐</nk-btn>
  <nk-btn variant="topbar" id="ttSidebar" aria-label="${W.openSidebar}">☰</nk-btn>
</div>
<nk-tooltip></nk-tooltip>
<nk-tooltip for="ttSidebar" shortcut="⌘\\">${W.openSidebar}</nk-tooltip>`,
},

// ============================================================ WAVE 5 · DATA
{
  tag: 'nk-database', group: 'data', classes: ['nk-database', 'nk-db-toolbar', 'nk-db-tabs', 'nk-db-tab', 'active', 'badge', 'add', 'tools'], wide: true, script: true,
  title: t('Database', 'Datenbank'),
  desc: t('The view switcher with Notion’s toolbar: child views (<code>nk-table-view</code>, <code>nk-board-view</code>, <code>nk-list-view</code>) become the tabs on the left, <code>slot="tools"</code> holds the view’s tools on the right – <code>&lt;nk-btn variant="tool"&gt;</code> for Filter, Sort and search, then “New” – and <code>slot="filters"</code> the <code>nk-filter-bar</code> under them. <code>columns</code> and <code>rows</code> are pushed into every view. <code>view</code> selects the active one; <code>count</code> on a view shows the row count as badge. No fetching: give it data, listen to events.',
          'Der Ansichts-Umschalter mit Notions Werkzeugleiste: Kind-Views (<code>nk-table-view</code>, <code>nk-board-view</code>, <code>nk-list-view</code>) werden die Reiter links, <code>slot="tools"</code> hält rechts die Werkzeuge der Ansicht – <code>&lt;nk-btn variant="tool"&gt;</code> für Filter, Sortieren und Suche, dann „Neu“ – und <code>slot="filters"</code> die <code>nk-filter-bar</code> darunter. <code>columns</code> und <code>rows</code> werden in jede View gepusht. <code>view</code> wählt die aktive; <code>count</code> an einer View zeigt die Zeilenzahl als Badge. Kein Fetching: Daten reingeben, Events hören.'),
  mobile: t('The tabs scroll sideways when the row gets narrow; the tools keep their place. Tables and boards scroll horizontally; nothing breaks.', 'Wird die Zeile schmal, scrollen die Reiter seitwärts; die Werkzeuge behalten ihren Platz. Tabellen und Boards scrollen horizontal; nichts bricht.'),
  attrs: [str('view', 'string', 'Name of the active view.', 'Name der aktiven View.'), bool('add-view', 'Show a ＋ tab (fires <code>nk-action</code>).', 'Ein ＋-Tab zeigen (feuert <code>nk-action</code>).')],
  slots: [{ name: '(default)', desc: t('View elements.', 'View-Elemente.') }, { name: 'tools', desc: t('The tools right of the tabs: <code>&lt;nk-btn variant="tool"&gt;</code>, a small primary “New”.', 'Die Werkzeuge rechts der Reiter: <code>&lt;nk-btn variant="tool"&gt;</code>, ein kleines primäres „Neu“.') }, { name: 'filters', desc: t('Under the toolbar: <code>nk-filter-bar</code>.', 'Unter der Leiste: <code>nk-filter-bar</code>.') }],
  events: [{ name: 'nk-view-change', detail: '{ view }', desc: t('Tab switched.', 'Tab gewechselt.') }, { name: 'nk-action', detail: "{ action: 'add-view' }", desc: t('＋ clicked.', '＋ geklickt.') }, { name: 'nk-select / nk-change / nk-action', detail: '(from the views)', desc: t('Bubble up from the active view.', 'Bubbeln aus der aktiven View hoch.') }],
  props: ['columns', 'rows', 'view', 'views'], methods: ['refresh()'],
  example: W => `<nk-database view="table" add-view>
  <nk-btn slot="tools" variant="tool" active>${W.filter}</nk-btn>
  <nk-btn slot="tools" variant="tool">${W.sort}</nk-btn>
  <nk-btn slot="tools" variant="primary" small>${W.newBtn}</nk-btn>
  <nk-table-view name="table" label="${W.table}" count new-row sortable></nk-table-view>
  <nk-board-view name="board" label="${W.board}" group-by="status" new-row></nk-board-view>
</nk-database>
${dbScript(W)}`,
  classMarkup: W => `<div class="nk-database">
  <div class="nk-db-toolbar">
    <div class="nk-db-tabs"><span class="nk-db-tab active">${W.table} <span class="badge">4</span></span><span class="nk-db-tab">${W.board}</span><span class="nk-db-tab add">＋</span></div>
    <div class="tools"><button class="nk-db-tool active">${W.filter}</button><button class="nk-db-tool">${W.sort}</button><button class="nk-btn primary small">${W.newBtn}</button></div>
  </div>
  ${dbTableClass(W)}
</div>`,
},
{
  tag: 'nk-table-view', group: 'data', classes: ['nk-table-wrap', 'nk-table', 'wrap', 'th-icon', 'row-title', 'date-cell', 'person-cell', 'nk-avatar', 'num', 'row-actions', 'actions', 'td-text', 'td-desc', 'nk-new-row'], wide: true, script: true,
  title: t('Table view', 'Tabellenansicht'),
  desc: t('Renders <code>columns</code> × <code>rows</code> as the NotionKit table. Cells are polymorphic (<code>text</code>, <code>select</code>, <code>multi-select</code>, <code>date</code>, <code>person</code>, <code>checkbox</code>, <code>url</code>, <code>number</code>, <code>progress</code>) and rendered as plain markup by the exported <code>renderPropertyCell()</code> – every cell rule starts with <code>.nk-table</code>, so a cell element of its own would never be styled. Header clicks sort with <code>sortable</code>. A <code>number</code> column stands right-aligned in figures of equal width, formatted by its <code>locale</code> and <code>format</code> (Intl.NumberFormat options); a person’s <code>color</code> takes one of the nine names. A column of type <code>actions</code> (NotionKit 1.12.0) sets buttons in each row from <code>column.actions</code> – <code>[{ action, label, icon, danger, disabled, tooltip }]</code> –, and a row’s value – a list of action names – picks which of them it shows; a click fires <code>nk-action { action, row, id, anchor }</code> instead of selecting the row. A <code>url</code> value may be <code>{ href, label, target }</code>: a link of your own, to another page of the app, with its own text. A text value may be <code>{ text, desc, color, tooltip }</code> (NotionKit 1.15.0): a quiet second line, one of Notion’s nine text colours – <code>orange</code> for an error –, the whole text in a tooltip. Sorting goes by the value, not the text shown: dates by their time, selects by the order of their options, empty cells last; <code>sortKey</code> on a column sorts by another field of the row, a <code>sort</code> in a cell’s object by that value. A <code>date</code> column with <code>format</code> – <code>\'short\'</code>, <code>\'relative\'</code> or the options of Intl.DateTimeFormat – shows ISO dates and date-times formatted in its <code>locale</code>.',
          'Rendert <code>columns</code> × <code>rows</code> als NotionKit-Tabelle. Zellen sind polymorph (<code>text</code>, <code>select</code>, <code>multi-select</code>, <code>date</code>, <code>person</code>, <code>checkbox</code>, <code>url</code>, <code>number</code>, <code>progress</code>) und werden vom exportierten <code>renderPropertyCell()</code> als Klassen-Markup gerendert – jede Zellregel beginnt mit <code>.nk-table</code>, ein eigenes Zellen-Element würde nie gestylt. Kopfklicks sortieren mit <code>sortable</code>. Eine Spalte vom Typ <code>actions</code> (NotionKit 1.12.0) setzt Knöpfe in jede Zeile aus <code>column.actions</code> – <code>[{ action, label, icon, danger, disabled, tooltip }]</code> –, und der Wert einer Zeile – eine Liste von Aktionsnamen – wählt, welche sie zeigt; ein Klick feuert <code>nk-action { action, row, id, anchor }</code>, statt die Zeile zu wählen. Ein <code>url</code>-Wert darf <code>{ href, label, target }</code> sein: ein eigener Link, zu einer anderen Seite der App, mit eigenem Text. Ein Textwert darf <code>{ text, desc, color, tooltip }</code> sein (NotionKit 1.15.0): eine leise zweite Zeile, eine von Notions neun Textfarben – <code>orange</code> für einen Fehler –, der ganze Text im Tooltip. Sortiert wird nach dem Wert, nicht nach dem angezeigten Text: Daten nach ihrer Zeit, Auswahlen nach der Reihenfolge ihrer Optionen, leere Zellen zuletzt; <code>sortKey</code> an einer Spalte sortiert nach einem anderen Feld der Zeile, ein <code>sort</code> im Objekt einer Zelle nach diesem Wert. Eine <code>date</code>-Spalte mit <code>format</code> – <code>\'short\'</code>, <code>\'relative\'</code> oder den Optionen von Intl.DateTimeFormat – zeigt ISO-Daten und -Zeitpunkte formatiert in ihrer <code>locale</code>.'),
  mobile: t('Scrolls horizontally inside <code>.nk-table-wrap</code>.', 'Scrollt horizontal in <code>.nk-table-wrap</code>.'),
  attrs: [str('name', 'string', 'View name (tab id).', 'View-Name (Tab-Kennung).'), str('label', 'string', 'Tab label.', 'Tab-Beschriftung.'), str('badge', 'string', 'Tab badge.', 'Tab-Badge.'), bool('count', 'Row count as badge.', 'Zeilenzahl als Badge.'), bool('new-row', 'Show the add row.', 'Hinzufügen-Zeile zeigen.'), str('new-row-label', 'string', 'Its text.', 'Deren Text.', { default: '＋ New page' }), bool('sortable', 'Header click sorts locally.', 'Kopfklick sortiert lokal.'), str('sort-key', 'string', 'Sorted column.', 'Sortierte Spalte.'), str('sort-dir', 'asc | desc', 'Direction.', 'Richtung.'), bool('wrap', 'Cell text may break (Notion\'s "wrap column").', 'Zellentext darf umbrechen (Notions „Spalte umbrechen“).')],
  slots: [],
  events: [{ name: 'nk-select', detail: '{ row, id, key, cell }', desc: t('Row clicked.', 'Zeile geklickt.') }, { name: 'nk-change', detail: '{ row, key, value }', desc: t('Checkbox cell toggled (row updated in place).', 'Checkbox-Zelle umgeschaltet (Zeile direkt aktualisiert).') }, { name: 'nk-action', detail: "{ action: 'sort' | 'new-row' | an actions column's action, key?, value?, row?, id?, anchor? }", desc: t('Header, add row or a row’s button clicked.', 'Kopf, Hinzufügen-Zeile oder ein Knopf einer Zeile geklickt.') }],
  props: ['columns', 'rows', 'data'], methods: ['refresh()'],
  example: W => `<nk-table-view new-row sortable></nk-table-view>
${dbScript(W, { actions: true })}`,
  classMarkup: W => dbTableClass(W, { actions: true }),
},
{
  tag: 'nk-board-view', group: 'data', classes: ['nk-board', 'active', 'nk-board-col', 'nk-board-col-header', 'count', 'nk-card', 'card-title', 'card-meta'], wide: true, script: true,
  title: t('Board view', 'Board-Ansicht'),
  desc: t('Groups rows by a select column (<code>group-by</code>, default: the first select column) into one column per option. Cards show the title column and the <code>meta-keys</code> (default: dates and progress). Drag a card onto another column: the row’s value changes and <code>nk-change</code> fires.',
          'Gruppiert Zeilen über eine Select-Spalte (<code>group-by</code>, Standard: die erste Select-Spalte) in eine Spalte je Option. Karten zeigen die Titelspalte und die <code>meta-keys</code> (Standard: Datum und Fortschritt). Karte auf eine andere Spalte ziehen: Der Wert der Zeile ändert sich, <code>nk-change</code> feuert.'),
  mobile: t('Columns scroll horizontally.', 'Spalten scrollen horizontal.'),
  attrs: [str('name', 'string', 'View name.', 'View-Name.'), str('label', 'string', 'Tab label.', 'Tab-Beschriftung.'), str('group-by', 'string', 'Select column key.', 'Schlüssel der Select-Spalte.'), str('title-key', 'string', 'Card title column.', 'Titelspalte der Karte.'), str('meta-keys', 'list', 'Comma-separated meta columns.', 'Kommagetrennte Meta-Spalten.'), bool('new-row', 'Show ＋ per column.', '＋ je Spalte zeigen.')],
  slots: [],
  events: [{ name: 'nk-select', detail: '{ row, id }', desc: t('Card clicked.', 'Karte geklickt.') }, { name: 'nk-change', detail: '{ row, key, value }', desc: t('Card dropped into another column.', 'Karte in andere Spalte gezogen.') }, { name: 'nk-action', detail: "{ action: 'new-row', value }", desc: t('＋ clicked (value = column).', '＋ geklickt (value = Spalte).') }],
  props: ['columns', 'rows', 'data'], methods: ['move(id, value)', 'refresh()'],
  example: W => `<nk-board-view group-by="status" new-row></nk-board-view>
${dbScript(W)}`,
  classMarkup: dbBoardClass,
},
{
  tag: 'nk-list-view', group: 'data', classes: ['nk-list', 'nk-list-item', 'l-icon', 'l-title', 'l-meta'], wide: true, script: true,
  title: t('List view', 'Listenansicht'),
  desc: t('The third database view: one line per row – icon and title, the <code>meta-keys</code> on the right (default: the select and date columns, in column order). Dates and text stand as text, selects as tags, a person as avatar and name. Rows fire <code>nk-select</code>; <code>new-row</code> adds the add row.', 'Die dritte Datenbank-Ansicht: eine Zeile pro Eintrag – Icon und Titel, rechts die <code>meta-keys</code> (Standard: die Select- und Datumsspalten, in Spaltenreihenfolge). Datum und Text stehen als Text, Selects als Tags, eine Person als Avatar mit Namen. Zeilen feuern <code>nk-select</code>; <code>new-row</code> ergänzt die Hinzufügen-Zeile.'),
  mobile: t('Stays one line per row: the title ends in an ellipsis, the properties keep their place.', 'Bleibt eine Zeile pro Eintrag: Der Titel endet mit Auslassungspunkten, die Eigenschaften behalten ihren Platz.'),
  attrs: [str('name', 'string', 'View name.', 'View-Name.'), str('label', 'string', 'Tab label.', 'Tab-Beschriftung.'), str('title-key', 'string', 'Title column.', 'Titelspalte.'), str('meta-keys', 'list', 'Comma-separated columns on the right.', 'Kommagetrennte Spalten rechts.'), bool('new-row', 'Show the add row.', 'Hinzufügen-Zeile zeigen.'), str('new-row-label', 'string', 'Its text.', 'Deren Text.', { default: '＋ New page' })],
  slots: [],
  events: [{ name: 'nk-select', detail: '{ row, id }', desc: t('Row clicked or Enter.', 'Zeile geklickt oder Enter.') }, { name: 'nk-action', detail: "{ action: 'new-row' }", desc: t('Add row clicked.', 'Hinzufügen-Zeile geklickt.') }],
  props: ['columns', 'rows', 'data'], methods: ['refresh()'],
  example: W => `<nk-list-view meta-keys="due,status"></nk-list-view>
${dbScript(W)}`,
  classMarkup: dbListClass,
},
{
  tag: 'nk-calendar-view', group: 'data', classes: ['nk-calendar-view', 'weeks', 'cv-head', 'cv-title', 'cal-nav', 'cv-grid', 'cv-wd', 'cv-week', 'cv-day', 'out', 'off', 'today', 'cv-num', 'cv-item'], wide: true, script: true,
  title: t('Calendar view', 'Kalenderansicht'),
  desc: t('The fourth database view (NotionKit 1.9.0): a month, the rows as cards on their dates. <code>date-key</code> names the date column (default: the first one) – <code>YYYY-MM-DD</code> or <code>D.M.YYYY</code>, a range on its start. Today sits on a red pill, days of other months are washed; <code>weeks</code> puts the calendar week in front, <code>weekend</code> washes the days not worked. A card fires <code>nk-select</code> like a row of the table; Today and ‹ › change the month (<code>nk-month</code>). In <code>nk-database</code> it is a tab like the others and shows the same rows.',
          'Die vierte Datenbank-Ansicht (NotionKit 1.9.0): ein Monat, die Zeilen als Karten an ihren Tagen. <code>date-key</code> nennt die Datumsspalte (Standard: die erste) – <code>YYYY-MM-DD</code> oder <code>D.M.YYYY</code>, ein Zeitraum an seinem Anfang. Heute steht auf einer roten Pille, Tage anderer Monate sind hinterlegt; <code>weeks</code> stellt die Kalenderwoche voran, <code>weekend</code> hinterlegt die Tage ohne Arbeit. Eine Karte feuert <code>nk-select</code> wie eine Tabellenzeile; Heute und ‹ › wechseln den Monat (<code>nk-month</code>). In <code>nk-database</code> ist sie ein Tab wie die anderen und zeigt dieselben Zeilen.'),
  mobile: t('Keeps seven columns; the days get lower (64px) and the cards smaller.', 'Behält sieben Spalten; die Tage werden niedriger (64px), die Karten kleiner.'),
  attrs: [
    str('name', 'string', 'View name.', 'View-Name.', { default: 'calendar' }), str('label', 'string', 'Tab label.', 'Tab-Beschriftung.'),
    str('date-key', 'string', 'Date column.', 'Datumsspalte.'), str('title-key', 'string', 'Title column.', 'Titelspalte.'),
    str('month', 'YYYY-MM', 'The month shown; default today’s.', 'Der gezeigte Monat; Standard der heutige.'),
    bool('weeks', 'The ISO calendar week in front of each row.', 'Die ISO-Kalenderwoche vor jeder Reihe.'),
    str('week-start', '0–6', 'First day of the week: 0 Sunday, 1 Monday …', 'Erster Wochentag: 0 Sonntag, 1 Montag …', { default: 'Intl' }),
    str('weekend', 'list', 'Weekdays not worked, washed – <code>6,0</code>.', 'Wochentage ohne Arbeit, hinterlegt – <code>6,0</code>.'),
    str('today', 'YYYY-MM-DD', 'Another today – for tests and docs.', 'Ein anderes Heute – für Tests und Doku.'),
    str('locale', 'BCP 47', 'Language of the names and the week.', 'Sprache der Namen und der Woche.', { default: 'lang' }),
    str('today-label', 'string', 'Today button.', 'Heute-Button.', { default: 'Today' }),
    str('prev-label', 'string', 'Names ‹.', 'Benennt ‹.', { default: 'Previous month' }), str('next-label', 'string', 'Names ›.', 'Benennt ›.', { default: 'Next month' }),
    str('week-label', 'string', 'Head of the week column.', 'Kopf der Wochenspalte.', { default: 'W · KW' }),
  ],
  slots: [],
  events: [{ name: 'nk-select', detail: '{ row, id }', desc: t('Card clicked or Enter.', 'Karte geklickt oder Enter.') }, { name: 'nk-month', detail: '{ month }', desc: t('Another month shown.', 'Ein anderer Monat gezeigt.') }],
  props: ['columns', 'rows', 'data', 'month'], methods: ['refresh()'],
  example: W => `<nk-calendar-view date-key="due" month="2026-05" today="2026-05-20" weeks week-start="1" today-label="${W.calToday}"></nk-calendar-view>
${dbScript(W)}`,
  classMarkup: W => calendarViewClass(W, { month: '2026-05', today: '2026-05-20', items: { '2026-05-08': [`🧭 ${W.p1}`], '2026-05-10': [`📄 ${W.p2}`], '2026-05-20': [`🗃️ ${W.p3}`] } }),
},
{
  tag: 'nk-gallery-view', group: 'data', classes: ['nk-gallery', 'small', 'large', 'fit', 'nk-card', 'nk-cover', 'card-title', 'card-meta', 'nk-new-row'], wide: true, script: true,
  title: t('Gallery view', 'Galerieansicht'),
  desc: t('The fifth database view: the rows as cards with a picture on top, in a grid that fills the row – Notion’s gallery, for a course catalog or a reading list. <code>cover-key</code> names the row field with the picture’s URL (default: <code>cover</code>); a row without one shows the cover gradient, <code>no-cover</code> leaves the pictures out. The picture stands in 2:1, cropped to fill; <code>fit</code> shows it whole, for logos. <code>size</code> small, medium or large sets the card size – columns from 180, 260 or 340px. Cards show the title and the <code>meta-keys</code> (default: the select and date columns) and fire <code>nk-select</code> on a click, Enter or Space; <code>new-row</code> adds the add card.',
          'Die fünfte Datenbank-Ansicht: die Einträge als Karten mit einem Bild oben, in einem Raster, das die Zeile füllt – Notions Galerie, für einen Kurskatalog oder eine Leseliste. <code>cover-key</code> nennt das Feld mit der URL des Bilds (Standard: <code>cover</code>); ein Eintrag ohne Bild zeigt den Cover-Verlauf, <code>no-cover</code> lässt die Bilder weg. Das Bild steht in 2:1 und wird beschnitten; <code>fit</code> zeigt es ganz, für Logos. <code>size</code> small, medium oder large setzt die Kartengröße – Spalten ab 180, 260 oder 340px. Karten zeigen den Titel und die <code>meta-keys</code> (Standard: die Select- und Datumsspalten) und feuern <code>nk-select</code> bei Klick, Enter oder Leertaste; <code>new-row</code> ergänzt die Hinzufügen-Karte.'),
  mobile: t('The grid drops columns by itself – one card per row on a phone, no breakpoint involved.', 'Das Raster verliert Spalten von selbst – auf dem Telefon eine Karte pro Zeile, ganz ohne Breakpoint.'),
  attrs: [str('name', 'string', 'View name.', 'View-Name.'), str('label', 'string', 'Tab label.', 'Tab-Beschriftung.'), str('cover-key', 'string', 'Row field with the picture’s URL.', 'Feld mit der URL des Bilds.', { default: 'cover' }), bool('no-cover', 'Cards without pictures.', 'Karten ohne Bilder.'), str('size', 'small | medium | large', 'Card size.', 'Kartengröße.', { default: 'medium' }), bool('fit', 'Show a picture whole instead of cropped.', 'Ein Bild ganz zeigen statt beschnitten.'), str('title-key', 'string', 'Title column.', 'Titelspalte.'), str('meta-keys', 'list', 'Comma-separated columns under the title.', 'Kommagetrennte Spalten unter dem Titel.'), bool('new-row', 'Show the add card.', 'Hinzufügen-Karte zeigen.'), str('new-row-label', 'string', 'Its text.', 'Deren Text.', { default: '＋ New page' })],
  slots: [],
  events: [{ name: 'nk-select', detail: '{ row, id, value }', desc: t('Card clicked, Enter or Space.', 'Karte geklickt, Enter oder Leertaste.') }, { name: 'nk-action', detail: "{ action: 'new-row' }", desc: t('Add card clicked.', 'Hinzufügen-Karte geklickt.') }],
  props: ['columns', 'rows', 'data'], methods: ['refresh()'],
  example: W => `<nk-gallery-view meta-keys="status,due" new-row></nk-gallery-view>
${dbScript(W)}`,
  classMarkup: dbGalleryClass,
},
{
  tag: 'nk-filter-bar', group: 'data', classes: ['nk-filter-row', 'nk-filter-pill', 'active', 'add', 'fp-remove', 'nk-db-tool', 'nk-input'], wide: true,
  title: t('Filter bar', 'Filterleiste'),
  desc: t('The filters in effect as NotionKit’s filter pills – <code>.active</code> with an accent tint, a × to remove each, a quiet <code>add</code> pill at the end – with no inline style. In <code>slot="filters"</code> of <code>nk-database</code> the row sits under the toolbar. A pill’s label fires <code>nk-action { action: "edit" }</code>, the add pill <code>{ action: "add" }</code>, each with the clicked button as <code>anchor</code> for <code>menu.show(anchor)</code>. <code>bar.apply(rows)</code> keeps rows where every filter matches by strict equality (<code>row[key] === value</code>, so use the option <em>value</em>) – or differs with <code>op: "is-not"</code> – and the search text appears in any string field (a person’s <code>name</code>); the data logic stays yours. Its own Filter and Sort tools and the search field are there for a bar without a database toolbar. It keeps its own copy of <code>filters</code>: the array you pass is never changed, a removed pill is reported in <code>nk-change</code>.',
          'Die wirkenden Filter als NotionKits Filter-Pills – <code>.active</code> mit Akzent-Tönung, je ein × zum Entfernen, am Ende eine ruhige <code>add</code>-Pill –, ohne Inline-Style. In <code>slot="filters"</code> von <code>nk-database</code> steht die Zeile unter der Werkzeugleiste. Das Label einer Pill feuert <code>nk-action { action: "edit" }</code>, die Add-Pill <code>{ action: "add" }</code>, jeweils mit dem geklickten Button als <code>anchor</code> für <code>menu.show(anchor)</code>. <code>bar.apply(rows)</code> behält Zeilen, bei denen jeder Filter strikt gleich ist (<code>row[key] === value</code>, also den Options-<em>Wert</em> nutzen) – oder mit <code>op: "is-not"</code> verschieden – und der Suchtext in einem String-Feld vorkommt (bei Personen der <code>name</code>); die Datenlogik bleibt deine. Eigene Filter- und Sortier-Werkzeuge und das Suchfeld sind für eine Leiste ohne Datenbank-Werkzeugleiste da. Es hält eine eigene Kopie von <code>filters</code>: Das übergebene Array bleibt unverändert, eine entfernte Pill wird in <code>nk-change</code> gemeldet.'),
  mobile: t('The pills wrap onto further rows.', 'Die Pills brechen in weitere Zeilen um.'),
  attrs: [
    bool('add', 'Show the add pill.', 'Die Add-Pill zeigen.'), str('add-label', 'string', 'Its text.', 'Deren Text.', { default: '＋ Filter' }),
    bool('no-filter', 'Hide the Filter tool.', 'Das Filter-Werkzeug ausblenden.'), bool('no-sort', 'Hide the Sort tool.', 'Das Sortier-Werkzeug ausblenden.'),
    str('filter-label', 'string', 'Text of the Filter tool.', 'Text des Filter-Werkzeugs.', { default: 'Filter' }), str('sort-label', 'string', 'Text of the Sort tool.', 'Text des Sortier-Werkzeugs.', { default: 'Sort' }),
    str('remove-label', 'string', 'The ×’s name, followed by the pill’s text.', 'Name des ×, gefolgt vom Text der Pill.', { default: 'Remove filter' }),
    bool('search', 'Show the search field.', 'Suchfeld zeigen.'), str('placeholder', 'string', 'Search placeholder.', 'Such-Platzhalter.'),
  ],
  slots: [{ name: '(default)', desc: t('Extra pills or controls between the pills and the search.', 'Zusätzliche Pills oder Controls zwischen Pills und Suche.') }],
  events: [{ name: 'nk-change', detail: '{ filters, search }', desc: t('A filter removed or the search typed.', 'Ein Filter entfernt oder gesucht.') }, { name: 'nk-action', detail: "{ action: 'edit' | 'add' | 'filter' | 'sort', index?, filter?, anchor }", desc: t('A pill or a tool clicked.', 'Eine Pill oder ein Werkzeug geklickt.') }],
  props: ['filters', 'value'], methods: ['apply(rows)'],
  example: W => `<nk-filter-bar add no-filter no-sort remove-label="${W.removeFilter}"></nk-filter-bar>
<script>{ document.currentScript.previousElementSibling.filters = [{ key: 'status', value: 'done', op: 'is-not', label: '${W.statusOpen}' }]; }</script>`,
  classMarkup: W => `<div class="nk-filter-row"><span class="nk-filter-pill active"><button>${W.statusOpen}</button><button class="fp-remove" aria-label="${W.removeFilter}">×</button></span><button class="nk-filter-pill add">${W.addFilter}</button></div>`,
},
{
  tag: 'nk-comments', group: 'data', classes: ['nk-comments', 'nk-comment', 'mini-avatar', 'c-head', 'c-body', 'nk-comment-input'],
  title: t('Comment thread', 'Kommentar-Faden'),
  desc: t('A left-ruled thread of <code>nk-comment</code>s with an input row. Enter or the button fires <code>nk-submit { text }</code>; appending the new comment is yours.', 'Ein links gerahmter Faden aus <code>nk-comment</code>s mit Eingabezeile. Enter oder der Button feuert <code>nk-submit { text }</code>; das Anhängen übernimmst du.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('placeholder', 'string', 'Input placeholder.', 'Platzhalter.'), str('send-label', 'string', 'Button text.', 'Button-Text.', { default: 'Send' }), bool('no-input', 'Read-only thread.', 'Nur lesen.'), bool('disabled', 'Input disabled.', 'Eingabe deaktiviert.')],
  slots: [{ name: '(default)', desc: t('<code>nk-comment</code> children.', '<code>nk-comment</code>-Kinder.') }],
  events: [{ name: 'nk-submit', detail: '{ text }', desc: t('New comment typed; <code>preventDefault()</code> keeps the text.', 'Neuer Kommentar; <code>preventDefault()</code> behält den Text.') }],
  methods: ['submit()', 'focus()'], props: ['value'],
  example: W => `<nk-comments placeholder="${W.commentPlaceholder}" send-label="${W.send}">
  <nk-comment author="Sara Lindt" time="1 hr ago" color="#448361">${W.commentText1}</nk-comment>
  <nk-comment author="${W.aiName}" time="20 min ago" avatar="✨" color="var(--nk-text-tertiary)"><span slot="head" class="nk-tag blue" style="font-size:10.5px">AI</span>${W.commentText2}</nk-comment>
</nk-comments>`,
  classMarkup: W => `<div class="nk-comments">
  <div class="nk-comment"><span class="mini-avatar" style="background:#448361">SL</span><div><div class="c-head"><b>Sara Lindt</b> · 1 hr ago</div><div class="c-body">${W.commentText1}</div></div></div>
  <div class="nk-comment"><span class="mini-avatar" style="background:var(--nk-text-tertiary)">✨</span><div><div class="c-head"><b>${W.aiName}</b><span class="nk-tag blue" style="font-size:10.5px">AI</span> · 20 min ago</div><div class="c-body">${W.commentText2}</div></div></div>
  <div class="nk-comment-input"><input class="nk-input" placeholder="${W.commentPlaceholder}"><button class="nk-btn primary small">${W.send}</button></div>
</div>`,
},
{
  tag: 'nk-comment', group: 'data', classes: ['nk-comment', 'c-head', 'c-body'],
  title: t('Comment', 'Kommentar'),
  desc: t('One comment: avatar (initials + <code>color</code>), bold author, time, body. <code>slot="head"</code> adds content after the name.', 'Ein Kommentar: Avatar (Initialen + <code>color</code>), fetter Autor, Zeit, Text. <code>slot="head"</code> ergänzt Inhalt hinter dem Namen.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('author', 'string', 'Name.', 'Name.'), str('time', 'string', 'Relative time.', 'Relative Zeit.'), str('avatar', 'string', 'Initials/emoji (default: from the author).', 'Initialen/Emoji (Standard: aus dem Autor).'), str('color', 'colour name | CSS', 'Avatar colour: one of the nine names or any CSS background; without it the avatar gradient.', 'Avatar-Farbe: einer der neun Namen oder ein beliebiger CSS-Hintergrund; ohne sie der Avatar-Verlauf.')],
  slots: [{ name: '(default)', desc: t('Body.', 'Text.') }, { name: 'head', desc: t('After the name (tag, badge).', 'Hinter dem Namen (Tag, Badge).') }, { name: 'avatar', desc: t('Custom avatar.', 'Eigener Avatar.') }],
  events: [],
  example: W => `<nk-comments no-input><nk-comment author="Sara Lindt" time="1 hr ago" color="green">${W.commentText1}</nk-comment></nk-comments>`,
  classMarkup: W => `<div class="nk-comments"><div class="nk-comment"><span class="nk-avatar green">SL</span><div><div class="c-head"><b>Sara Lindt</b> · 1 hr ago</div><div class="c-body">${W.commentText1}</div></div></div></div>`,
},
{
  tag: 'nk-ai-thread', group: 'data', classes: ['nk-ai-thread', 'nk-ai-msg', 'user', 'a-body', 'a-name', 'nk-ai-actions', 'nk-ai-input-row', 'nk-ai-send'],
  title: t('AI thread', 'KI-Thread'),
  desc: t('The conversation column: <code>nk-ai-msg</code> children (<code>role="user"</code> gets the gradient avatar), followed by an <code>nk-ai-input-row</code>. Action buttons in <code>slot="actions"</code> fire <code>nk-action { action, value }</code> – both carry the button’s <code>value</code> (or its text).', 'Die Konversationsspalte: <code>nk-ai-msg</code>-Kinder (<code>role="user"</code> bekommt den Gradient-Avatar), gefolgt von einer <code>nk-ai-input-row</code>. Action-Buttons in <code>slot="actions"</code> feuern <code>nk-action { action, value }</code> – beide tragen das <code>value</code> des Buttons (oder seinen Text).'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [],
  slots: [{ name: '(default)', desc: t('<code>nk-ai-msg</code> children.', '<code>nk-ai-msg</code>-Kinder.') }],
  events: [{ name: 'nk-action', detail: '{ action }', desc: t('Action button of a message.', 'Action-Button einer Nachricht.') }],
  example: W => `<nk-ai-thread>
  <nk-ai-msg role="user" name="${W.you}" avatar="MK">${W.aiQuestion}</nk-ai-msg>
  <nk-ai-msg role="assistant" name="${W.aiName}" badge="${W.aiBadge}">${W.aiAnswer}
    <button slot="actions" value="copy">${W.copy}</button><button slot="actions" value="rephrase">${W.rephrase}</button><button slot="actions" value="like">👍</button>
  </nk-ai-msg>
</nk-ai-thread>
<nk-ai-input-row placeholder="${W.askAi}"></nk-ai-input-row>`,
  classMarkup: W => `<div class="nk-ai-thread">
  <div class="nk-ai-msg user"><span class="mini-avatar">MK</span><div class="a-body"><div class="a-name">${W.you}</div>${W.aiQuestion}</div></div>
  <div class="nk-ai-msg"><span class="mini-avatar">✨</span><div class="a-body"><div class="a-name">${W.aiName} <span>${W.aiBadge}</span></div>${W.aiAnswer}<div class="nk-ai-actions"><button>${W.copy}</button><button>${W.rephrase}</button><button>👍</button></div></div></div>
</div>
<div class="nk-ai-input-row"><span style="font-size:14px">✨</span><input placeholder="${W.askAi}"><button class="nk-ai-send">↑</button></div>`,
},
{
  tag: 'nk-ai-msg', group: 'data', classes: ['nk-ai-msg', 'user', 'bubble', 'a-body', 'a-name', 'nk-ai-actions'],
  title: t('AI message', 'KI-Nachricht'),
  desc: t('One message. <code>role="user"</code> flips the avatar to the gradient; <code>badge</code> is the grey suffix after the name (“· AI”); plain <code>&lt;button slot="actions"&gt;</code>s form the action row.', 'Eine Nachricht. <code>role="user"</code> schaltet den Avatar auf den Gradient; <code>badge</code> ist das graue Suffix hinter dem Namen („· KI“); einfache <code>&lt;button slot="actions"&gt;</code>s bilden die Aktionszeile.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('role', 'user | assistant', 'Who speaks.', 'Wer spricht.', { default: 'assistant' }), str('name', 'string', 'Name line.', 'Namenszeile.'), str('badge', 'string', 'Grey suffix.', 'Graues Suffix.'), str('avatar', 'string', 'Initials/emoji.', 'Initialen/Emoji.'), str('color', 'CSS color', 'Avatar background override.', 'Avatar-Hintergrund.'), bool('bubble', 'The message as a grey bubble without avatar or name; with <code>role="user"</code> on the right, as Notion’s AI chat shows your own question.', 'Die Nachricht als graue Blase ohne Avatar und Namen; mit <code>role="user"</code> rechts, wie Notions KI-Chat die eigene Frage zeigt.')],
  slots: [{ name: '(default)', desc: t('Message body (HTML allowed).', 'Nachrichtentext (HTML erlaubt).') }, { name: 'actions', desc: t('<code>&lt;button value&gt;</code> children.', '<code>&lt;button value&gt;</code>-Kinder.') }, { name: 'avatar', desc: t('Custom avatar.', 'Eigener Avatar.') }],
  events: [{ name: 'nk-action', detail: '{ action, value }', desc: t('Action button clicked.', 'Action-Button geklickt.') }],
  example: W => `<nk-ai-thread><nk-ai-msg role="user" bubble>${W.bubbleQuestion}</nk-ai-msg><nk-ai-msg role="assistant" name="${W.aiName}" badge="${W.aiBadge}">${W.aiAnswer}<button slot="actions" value="copy">${W.copy}</button></nk-ai-msg></nk-ai-thread>`,
  classMarkup: W => `<div class="nk-ai-thread"><div class="nk-ai-msg user bubble"><div class="a-body">${W.bubbleQuestion}</div></div><div class="nk-ai-msg"><span class="mini-avatar">✨</span><div class="a-body"><div class="a-name">${W.aiName} <span>${W.aiBadge}</span></div>${W.aiAnswer}<div class="nk-ai-actions"><button>${W.copy}</button></div></div></div></div>`,
},
{
  tag: 'nk-ai-input-row', group: 'data', classes: ['nk-ai-input-row', 'nk-ai-send'],
  title: t('AI input row', 'KI-Eingabezeile'),
  desc: t('The prompt field with ✨ and a send button. Enter or the button fires <code>nk-submit { text }</code> and clears the field.', 'Das Prompt-Feld mit ✨ und Sende-Button. Enter oder der Button feuert <code>nk-submit { text }</code> und leert das Feld.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('placeholder', 'string', 'Placeholder.', 'Platzhalter.'), str('value', 'string', 'Preset text.', 'Vorbelegter Text.'), bool('disabled', 'Disabled while the assistant answers.', 'Deaktiviert, während der Assistent antwortet.'), str('icon', 'string', 'Leading glyph.', 'Zeichen vorn.', { default: '✨' })],
  slots: [],
  events: [{ name: 'nk-submit', detail: '{ text }', desc: t('Prompt sent.', 'Prompt gesendet.') }],
  methods: ['submit()', 'focus()'], props: ['value'],
  example: W => `<nk-ai-input-row placeholder="${W.askAi}"></nk-ai-input-row>`,
  classMarkup: W => `<div class="nk-ai-input-row"><span style="font-size:14px">✨</span><input placeholder="${W.askAi}"><button class="nk-ai-send">↑</button></div>`,
},
];
