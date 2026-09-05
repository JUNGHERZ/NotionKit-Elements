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
const dbScript = W => `<script>{
  const db = document.currentScript.previousElementSibling;
  db.columns = [
    { key: 'name', label: '${W.dbName}', type: 'text', icon: '📄', title: true },
    { key: 'status', label: '${W.dbStatus}', type: 'select', icon: '◉', options: [
      { value: 'planned', label: '${W.statusPlanned}', color: 'orange' }, { value: 'progress', label: '${W.statusProgress}', color: 'blue' }, { value: 'done', label: '${W.statusDone}', color: 'green' } ] },
    { key: 'owner', label: '${W.dbOwner}', type: 'person', icon: '👤' },
    { key: 'due', label: '${W.dbDue}', type: 'date', icon: '📅' },
    { key: 'progress', label: '${W.dbProgress}', type: 'progress', icon: '▰' },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: '${W.p1}', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '08.05.2026', progress: 100 },
    { id: 2, icon: '📄', name: '${W.p2}', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '10.05.2026', progress: 100 },
    { id: 3, icon: '🗃️', name: '${W.p3}', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '20.05.2026', progress: 65 },
    { id: 4, icon: '▤', name: '${W.p4}', status: 'planned', due: '02.06.2026', progress: 0 },
  ];
}</script>`;
const dbTableClass = W => `<div class="nk-table-wrap"><table class="nk-table">
  <thead><tr><th><span class="th-icon">📄</span>${W.dbName}</th><th><span class="th-icon">◉</span>${W.dbStatus}</th><th><span class="th-icon">👤</span>${W.dbOwner}</th><th><span class="th-icon">📅</span>${W.dbDue}</th><th><span class="th-icon">▰</span>${W.dbProgress}</th></tr></thead>
  <tbody>
    <tr><td><span class="row-title">🧭 ${W.p1}</span></td><td><span class="nk-tag green">${W.statusDone}</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">08.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td></tr>
    <tr><td><span class="row-title">📄 ${W.p2}</span></td><td><span class="nk-tag green">${W.statusDone}</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">10.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td></tr>
    <tr><td><span class="row-title">🗃️ ${W.p3}</span></td><td><span class="nk-tag blue">${W.statusProgress}</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">20.05.2026</span></td><td><span class="nk-progress"><i style="width:65%"></i></span><span class="nk-progress-label">65%</span></td></tr>
    <tr><td><span class="row-title">▤ ${W.p4}</span></td><td><span class="nk-tag orange">${W.statusPlanned}</span></td><td><span class="person-cell">—</span></td><td><span class="date-cell">02.06.2026</span></td><td><span class="nk-progress"><i style="width:0%"></i></span><span class="nk-progress-label">0%</span></td></tr>
  </tbody>
</table><div class="nk-new-row">＋ New page</div></div>`;
const dbBoardClass = W => `<div class="nk-board active">
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag orange">${W.statusPlanned}</span><span class="count">1</span></div><div class="nk-card" draggable="true"><div class="card-title">▤ ${W.p4}</div><div class="card-meta"><span>📅 02.06.2026</span><span>▰ 0%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag blue">${W.statusProgress}</span><span class="count">1</span></div><div class="nk-card" draggable="true"><div class="card-title">🗃️ ${W.p3}</div><div class="card-meta"><span>📅 20.05.2026</span><span>▰ 65%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag green">${W.statusDone}</span><span class="count">2</span></div><div class="nk-card" draggable="true"><div class="card-title">🧭 ${W.p1}</div><div class="card-meta"><span>📅 08.05.2026</span><span>▰ 100%</span></div></div><div class="nk-card" draggable="true"><div class="card-title">📄 ${W.p2}</div><div class="card-meta"><span>📅 10.05.2026</span><span>▰ 100%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
</div>`;

export const CATALOG = [
// ============================================================ WAVE 1 · FORMS
{
  tag: 'nk-btn', group: 'forms', classes: ['nk-btn', 'primary', 'secondary', 'danger', 'danger-solid', 'small', 'nk-topbar-btn', 'nk-share-btn'],
  title: t('Button', 'Button'),
  desc: t('Renders <code>button.nk-btn</code>, or <code>a.nk-btn</code> when <code>href</code> is set. Modifier classes become attributes. A slotted <code>&lt;svg&gt;</code> is sized by the stylesheet – pass it directly, never wrapped.',
          'Rendert <code>button.nk-btn</code>, mit <code>href</code> ein <code>a.nk-btn</code>. Modifikator-Klassen werden Attribute. Ein geslottetes <code>&lt;svg&gt;</code> bekommt seine Größe aus dem Stylesheet – direkt übergeben, nie verpackt.'),
  mobile: t('Unchanged. The button grows with its label; combine with <code>small</code> in dense toolbars.', 'Unverändert. Der Button wächst mit seiner Beschriftung; in dichten Leisten <code>small</code> setzen.'),
  attrs: [
    str('variant', 'primary | secondary | danger | danger-solid | topbar | share', 'Visual variant. <code>topbar</code> and <code>share</code> render <code>.nk-topbar-btn</code> for the top bar.', 'Optische Variante. <code>topbar</code> und <code>share</code> rendern <code>.nk-topbar-btn</code> für die Topbar.'),
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
  mobile: t('Minimum width 210px; use <code>wide</code> to fill the row.', 'Mindestbreite 210px; <code>wide</code> füllt die Zeile.'),
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
  desc: t('Light-DOM <code>&lt;option&gt;</code> and <code>&lt;optgroup&gt;</code> children are copied into the shadow <code>&lt;select&gt;</code> and kept in step when a framework swaps them. The empty string is a valid value; a <code>value</code> naming no option leaves the selection alone.',
          'Light-DOM-<code>&lt;option&gt;</code>- und <code>&lt;optgroup&gt;</code>-Kinder werden in das Shadow-<code>&lt;select&gt;</code> kopiert und bleiben synchron, wenn ein Framework sie austauscht. Der leere String ist ein gültiger Wert; ein <code>value</code> ohne passende Option lässt die Auswahl unangetastet.'),
  mobile: t('Uses the native picker of the platform (<code>color-scheme</code> follows the theme).', 'Nutzt den nativen Picker der Plattform (<code>color-scheme</code> folgt dem Theme).'),
  attrs: [
    str('value', 'string', 'Selected value.', 'Ausgewählter Wert.'),
    ...formAttrs,
    bool('required', 'Required field.', 'Pflichtfeld.'),
    bool('compact', '120px minimum width (<code>.compact</code>), e.g. inside a member row.', '120px Mindestbreite (<code>.compact</code>), z. B. in einer Mitgliederzeile.'),
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
  tag: 'nk-switch', group: 'forms', classes: ['nk-switch'],
  title: t('Switch', 'Schalter'),
  desc: t('Renders <code>button.nk-switch[role=switch]</code>; the stylesheet keys the knob on <code>aria-checked</code>, the element does the toggling. Submits <code>value</code> (default <code>on</code>) when checked, nothing otherwise – like a checkbox.',
          'Rendert <code>button.nk-switch[role=switch]</code>; das Stylesheet steuert den Knopf über <code>aria-checked</code>, das Element übernimmt das Umschalten. Sendet <code>value</code> (Standard <code>on</code>) wenn eingeschaltet, sonst nichts – wie eine Checkbox.'),
  mobile: t('34×20px – below the 44px touch target. Give it a label row (<code>nk-field</code>) to enlarge the hit area.', '34×20px – unter dem 44px-Touch-Ziel. In einer Label-Zeile (<code>nk-field</code>) wächst die Trefferfläche.'),
  attrs: [bool('checked', 'On/off state.', 'Ein/Aus-Zustand.'), ...formAttrs, str('value', 'string', 'Submitted value when checked.', 'Gesendeter Wert, wenn eingeschaltet.', { default: 'on' }), str('label', 'string', 'Accessible name (<code>aria-label</code>).', 'Barrierefreier Name (<code>aria-label</code>).')],
  slots: [],
  events: [{ name: 'nk-change', detail: '{ checked, value, name }', desc: t('On toggle.', 'Beim Umschalten.') }],
  methods: ['toggle()'],
  example: W => `<nk-switch name="notify" checked label="${W.notify}"></nk-switch>`,
  classMarkup: W => `<button class="nk-switch" role="switch" aria-checked="true" aria-label="${W.notify}"></button>`,
},
{
  tag: 'nk-check', group: 'forms', classes: ['nk-check'],
  title: t('Checkbox', 'Checkbox'),
  desc: t('A <code>label.nk-check</code> with a custom-drawn checkbox; the label text is slotted, so clicking it toggles the box.', 'Ein <code>label.nk-check</code> mit selbst gezeichneter Checkbox; der Text wird geslottet, ein Klick darauf schaltet um.'),
  mobile: t('Row height ~24px; the whole label is the hit area.', 'Zeilenhöhe ~24px; die ganze Beschriftung ist Trefferfläche.'),
  attrs: [bool('checked', 'Checked state.', 'Angehakt.'), bool('indeterminate', 'Mixed state (cleared on the next click).', 'Teilzustand (beim nächsten Klick aufgehoben).'), ...formAttrs, str('value', 'string', 'Submitted value.', 'Gesendeter Wert.', { default: 'on' }), bool('required', 'Must be checked to submit.', 'Muss zum Absenden angehakt sein.')],
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
  attrs: [bool('checked', 'Selected; the last checked radio in markup wins.', 'Ausgewählt; das letzte <code>checked</code> im Markup gewinnt.'), ...formAttrs, str('value', 'string', 'Submitted value.', 'Gesendeter Wert.'), bool('required', 'One of the group must be selected.', 'Eines der Gruppe muss gewählt sein.')],
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
  tag: 'nk-field', group: 'forms', classes: ['nk-field', 'f-label', 'f-desc', 'f-control'],
  title: t('Field row', 'Feldzeile'),
  desc: t('The settings row: label and description left, control right. Put any control – <code>nk-input</code>, <code>nk-switch</code>, <code>nk-select</code> – in the default slot.', 'Die Einstellungszeile: Label und Beschreibung links, Control rechts. Ins Default-Slot gehört ein beliebiges Control – <code>nk-input</code>, <code>nk-switch</code>, <code>nk-select</code>.'),
  mobile: t('Stays a row; long descriptions wrap under the label.', 'Bleibt eine Zeile; lange Beschreibungen brechen unter dem Label um.'),
  attrs: [str('label', 'string', 'Label text.', 'Beschriftung.'), str('desc', 'string', 'Secondary description.', 'Erläuterung.')],
  slots: [{ name: '(default)', desc: t('The control.', 'Das Control.') }, { name: 'label', desc: t('Rich label content (instead of the attribute).', 'Formatierte Beschriftung (statt Attribut).') }, { name: 'desc', desc: t('Rich description.', 'Formatierte Erläuterung.') }],
  events: [],
  example: W => `<nk-field label="${W.displayName}" desc="${W.displayNameDesc}">
  <nk-input value="Ada Lovelace"></nk-input>
</nk-field>
<nk-field label="${W.notify}">
  <nk-switch checked></nk-switch>
</nk-field>`,
  classMarkup: W => `<div class="nk-field">
  <div><div class="f-label">${W.displayName}</div><div class="f-desc">${W.displayNameDesc}</div></div>
  <div class="f-control"><input class="nk-input" value="Ada Lovelace"></div>
</div>
<div class="nk-field">
  <div><div class="f-label">${W.notify}</div></div>
  <div class="f-control"><button class="nk-switch" role="switch" aria-checked="true"></button></div>
</div>`,
},
// ============================================================ WAVE 1 · CONTENT
{
  tag: 'nk-tag', group: 'content', classes: ['nk-tag', 'blue', 'green', 'orange', 'purple'],
  title: t('Tag', 'Tag'),
  desc: t('Semantic status tag. The colour modifier class becomes the <code>color</code> attribute; each pair is tuned per theme.', 'Semantischer Status-Tag. Die Farb-Modifikator-Klasse wird zum <code>color</code>-Attribut; jedes Paar ist pro Theme abgestimmt.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('color', 'blue | green | orange | purple', 'Colour pair.', 'Farbpaar.')],
  slots: [{ name: '(default)', desc: t('Tag text.', 'Tag-Text.') }],
  events: [],
  example: W => `<nk-tag color="blue">${W.inProgress}</nk-tag> <nk-tag color="green">${W.done}</nk-tag> <nk-tag color="orange">${W.planned}</nk-tag> <nk-tag color="purple">${W.design}</nk-tag>`,
  classMarkup: W => `<span class="nk-tag blue">${W.inProgress}</span> <span class="nk-tag green">${W.done}</span> <span class="nk-tag orange">${W.planned}</span> <span class="nk-tag purple">${W.design}</span>`,
},
{
  tag: 'nk-progress', group: 'content', classes: ['nk-progress', 'nk-progress-label'],
  title: t('Progress', 'Fortschritt'),
  desc: t('A 60px bar with an optional label. <code>value</code>/<code>max</code> set the fill; the bar carries <code>role="progressbar"</code>.', 'Ein 60px-Balken mit optionalem Label. <code>value</code>/<code>max</code> setzen die Füllung; der Balken trägt <code>role="progressbar"</code>.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('value', 'number', 'Current value.', 'Aktueller Wert.', { default: '0' }), str('max', 'number', 'Maximum.', 'Maximum.', { default: '100' }), str('label', 'string', 'Text after the bar.', 'Text hinter dem Balken.')],
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
  tag: 'nk-app', group: 'shell', classes: ['nk-app', 'nk-main'], frame: 300,
  title: t('App shell', 'App-Shell'),
  desc: t('The outermost element of a workspace app: a full-height flex row with the sidebar slot left and <code>main.nk-main</code> right. Everything in the default slot – <code>nk-topbar</code>, <code>nk-page</code> – becomes a flex child of the main column.',
          'Das äußerste Element einer Workspace-App: eine flex-Zeile über die volle Höhe mit dem Sidebar-Slot links und <code>main.nk-main</code> rechts. Alles im Default-Slot – <code>nk-topbar</code>, <code>nk-page</code> – wird Flex-Kind der Hauptspalte.'),
  mobile: t('Below 860px the sidebar is hidden; open it as a drawer with <code>sidebar.open = true</code>.', 'Unter 860px ist die Sidebar verborgen; als Schublade öffnen mit <code>sidebar.open = true</code>.'),
  attrs: [],
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
  tag: 'nk-sidebar', group: 'shell', classes: ['nk-sidebar', 'nk-sidebar-scroll', 'nk-sidebar-footer'], frame: 260,
  title: t('Sidebar', 'Sidebar'),
  desc: t('The left rail: workspace slot on top, a scrolling default slot for the tree, a pinned footer slot. Footer tree items automatically get <code>compact</code> (26px rows). The host is <code>display: contents</code>, so the <code>aside</code> is a direct flex child of the app – exactly like the class markup.',
          'Die linke Leiste: Workspace-Slot oben, ein scrollender Default-Slot für den Baum, ein fixierter Footer-Slot. Footer-Einträge bekommen automatisch <code>compact</code> (26px-Zeilen). Der Host ist <code>display: contents</code>, das <code>aside</code> also direktes Flex-Kind der App – wie im Klassen-Markup.'),
  mobile: t('Hidden below 860px. <code>open</code> shows it as an off-canvas drawer with a scrim; Escape and the scrim close it.', 'Unter 860px verborgen. <code>open</code> zeigt sie als Off-Canvas-Schublade mit Scrim; Escape und der Scrim schließen sie.'),
  attrs: [bool('open', 'Drawer state on small screens (no effect on desktop).', 'Schubladen-Zustand auf kleinen Schirmen (ohne Wirkung am Desktop).')],
  slots: [{ name: 'workspace', desc: t('<code>nk-workspace-switcher</code>.', '<code>nk-workspace-switcher</code>.') }, { name: '(default)', desc: t('The tree (scrolls).', 'Der Baum (scrollt).') }, { name: 'footer', desc: t('Pinned bottom rows (Settings, Trash).', 'Fixierte Zeilen unten (Einstellungen, Papierkorb).') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Drawer opened/closed.', 'Schublade geöffnet/geschlossen.') }],
  methods: ['show()', 'close()', 'toggle()'],
  example: W => `<div style="display:flex;height:100%"><nk-sidebar>
  <nk-workspace-switcher slot="workspace" name="${W.workspace}"></nk-workspace-switcher>
  <nk-tree>
    <nk-tree-item icon="🏠" active>${W.home}</nk-tree-item>
    <nk-tree-item icon="📥">${W.inbox}</nk-tree-item>
  </nk-tree>
  <nk-tree-item slot="footer" icon="⚙️">${W.settings}</nk-tree-item>
  <nk-tree-item slot="footer" icon="🗑️">${W.trash}</nk-tree-item>
</nk-sidebar></div>`,
  classMarkup: W => `<div style="display:flex;height:100%"><aside class="nk-sidebar">
  <div class="nk-workspace"><div class="avatar">M</div><span>${W.workspace}</span><span class="chev">⌄</span></div>
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
  tag: 'nk-topbar', group: 'shell', classes: ['nk-topbar', 'nk-topbar-actions', 'nk-topbar-btn', 'nk-share-btn'], wide: true,
  title: t('Top bar', 'Topbar'),
  desc: t('The 45px bar above the page: breadcrumb in the default slot, buttons in the <code>actions</code> slot (right-aligned). Use <code>nk-btn variant="topbar"</code> / <code>"share"</code> and <code>nk-theme-toggle</code> there.', 'Die 45px-Leiste über der Seite: Breadcrumb im Default-Slot, Buttons im <code>actions</code>-Slot (rechtsbündig). Dort <code>nk-btn variant="topbar"</code> / <code>"share"</code> und <code>nk-theme-toggle</code> verwenden.'),
  mobile: t('Unchanged; long breadcrumbs truncate.', 'Unverändert; lange Breadcrumbs werden gekürzt.'),
  attrs: [],
  slots: [{ name: '(default)', desc: t('Breadcrumb / title.', 'Breadcrumb / Titel.') }, { name: 'actions', desc: t('Buttons on the right.', 'Buttons rechts.') }],
  events: [],
  example: W => `<div style="border:1px solid var(--nk-border);border-radius:8px;display:flex;flex-direction:column"><nk-topbar>
  <nk-breadcrumb><span>📊 ${W.projectOverview}</span><span>🚀 ${W.mvp}</span></nk-breadcrumb>
  <span slot="actions" class="nk-topbar-btn" style="color:var(--nk-text-tertiary);font-size:12.5px">${W.lastEdited}</span>
  <nk-btn slot="actions" variant="share">${W.share}</nk-btn>
  <nk-btn slot="actions" variant="topbar">⭐</nk-btn>
  <nk-theme-toggle slot="actions"></nk-theme-toggle>
</nk-topbar></div>`,
  classMarkup: W => `<div style="border:1px solid var(--nk-border);border-radius:8px;display:flex;flex-direction:column"><div class="nk-topbar">
  <nav class="nk-breadcrumb"><span class="crumb">📊 ${W.projectOverview}</span><span class="sep">/</span><span class="crumb current">🚀 ${W.mvp}</span></nav>
  <div class="nk-topbar-actions"><span class="nk-topbar-btn" style="color:var(--nk-text-tertiary);font-size:12.5px">${W.lastEdited}</span><button class="nk-topbar-btn nk-share-btn">${W.share}</button><button class="nk-topbar-btn">⭐</button><button class="nk-topbar-btn nk-theme-toggle">🌙</button></div>
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
  tag: 'nk-page', group: 'page', classes: ['nk-page-scroll', 'nk-page', 'nk-page-icon', 'nk-cover', 'lead'], frame: 360,
  title: t('Page', 'Seite'),
  desc: t('The document column: a scrolling wrapper, an optional cover, the 760px page with 64px side padding, and the page icon (rendered here because its slotted twin is keyed on the parent). <code>narrow</code> drops the scroll wrapper for pages that are the document itself.',
          'Die Dokumentspalte: scrollender Wrapper, optionales Cover, die 760px-Seite mit 64px Seitenabstand und das Seiten-Icon (hier gerendert, weil sein Slot-Zwilling am Elternelement hängt). <code>narrow</code> lässt den Scroll-Wrapper weg, wenn die Seite selbst das Dokument ist.'),
  mobile: t('Side padding drops to 24px below 860px.', 'Seitenabstand sinkt unter 860px auf 24px.'),
  attrs: [str('icon', 'string', 'Page emoji; click fires <code>nk-action</code>.', 'Seiten-Emoji; Klick feuert <code>nk-action</code>.'), bool('cover', 'Show the token gradient cover.', 'Token-Gradient-Cover zeigen.'), bool('narrow', 'No scroll wrapper (landing / docs page).', 'Ohne Scroll-Wrapper (Landing-/Doku-Seite).')],
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
  desc: t('The 200px cover band. Without <code>src</code> it shows the token gradient; with <code>src</code> an image, covered and centred.', 'Das 200px-Cover-Band. Ohne <code>src</code> der Token-Gradient, mit <code>src</code> ein Bild, ausgefüllt und zentriert.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('src', 'URL', 'Cover image.', 'Cover-Bild.')],
  slots: [], events: [],
  example: W => `<nk-page-cover></nk-page-cover>`,
  classMarkup: W => `<div class="nk-cover"></div>`,
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
  tag: 'nk-banner', group: 'page', classes: ['nk-banner', 'info', 'success', 'warning', 'b-action'],
  title: t('Banner', 'Banner'),
  desc: t('A tinted notice row. The colour modifier becomes <code>variant</code>; an action link goes into <code>slot="action"</code> and sits at the right edge.', 'Eine getönte Hinweiszeile. Der Farb-Modifikator wird <code>variant</code>; ein Aktions-Link kommt in <code>slot="action"</code> und sitzt am rechten Rand.'),
  mobile: t('Wraps; the action drops below the text when needed.', 'Bricht um; die Aktion rutscht bei Bedarf unter den Text.'),
  attrs: [str('variant', 'info | success | warning', 'Colour pair.', 'Farbpaar.')],
  slots: [{ name: '(default)', desc: t('Icon and text.', 'Icon und Text.') }, { name: 'action', desc: t('Action link (underlined, right).', 'Aktions-Link (unterstrichen, rechts).') }],
  events: [],
  example: W => `<nk-banner variant="info">ℹ️ <span>${W.bannerInfo}</span><span slot="action">${W.openPalette}</span></nk-banner>
<nk-banner variant="warning">⚠️ <span>${W.bannerWarn}</span><span slot="action">${W.view}</span></nk-banner>
<nk-banner variant="success">✓ <span>${W.bannerOk}</span></nk-banner>`,
  classMarkup: W => `<div class="nk-banner info">ℹ️ <span>${W.bannerInfo}</span><span class="b-action">${W.openPalette}</span></div>
<div class="nk-banner warning">⚠️ <span>${W.bannerWarn}</span><span class="b-action">${W.view}</span></div>
<div class="nk-banner success">✓ <span>${W.bannerOk}</span></div>`,
},
{
  tag: 'nk-empty', group: 'page', classes: ['nk-empty', 'e-icon', 'e-title', 'e-desc'],
  title: t('Empty state', 'Leerzustand'),
  desc: t('Dashed box with icon, title, description and whatever call to action you slot in.', 'Gestrichelte Box mit Icon, Titel, Beschreibung und der Aktion, die du hineinslottest.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('icon', 'string', 'Emoji.', 'Emoji.'), str('title', 'string', 'Title.', 'Titel.'), str('desc', 'string', 'Description.', 'Beschreibung.')],
  slots: [{ name: '(default)', desc: t('Call to action.', 'Handlungsaufforderung.') }, { name: 'icon', desc: t('Rich icon.', 'Formatiertes Icon.') }, { name: 'title', desc: t('Rich title.', 'Formatierter Titel.') }, { name: 'desc', desc: t('Rich description.', 'Formatierte Beschreibung.') }],
  events: [],
  example: W => `<nk-empty icon="🗂️" title="${W.emptyTitle}" desc="${W.emptyDesc}"><nk-btn variant="primary" small>${W.newEntry}</nk-btn></nk-empty>`,
  classMarkup: W => `<div class="nk-empty"><div class="e-icon">🗂️</div><div class="e-title">${W.emptyTitle}</div><div class="e-desc">${W.emptyDesc}</div><button class="nk-btn primary small">${W.newEntry}</button></div>`,
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
  tag: 'nk-tabs', group: 'page', classes: ['nk-tabs', 'nk-tab', 'active', 'nk-tab-panel'],
  title: t('Tabs', 'Tabs'),
  desc: t('A tab strip with panels. <code>nk-tab</code> children are the tabs; elements with <code>slot="panel"</code> and a matching <code>data-tab</code> are the panels – the tabs hide every panel but the active one through <code>hidden</code>. Arrow keys move between tabs.',
          'Eine Tab-Leiste mit Panels. <code>nk-tab</code>-Kinder sind die Tabs; Elemente mit <code>slot="panel"</code> und passendem <code>data-tab</code> die Panels – die Tabs verbergen per <code>hidden</code> alle bis auf das aktive. Pfeiltasten wechseln.'),
  mobile: t('Strip stays on one line; keep labels short.', 'Leiste bleibt einzeilig; Labels kurz halten.'),
  attrs: [str('value', 'string', 'Active tab value (default: the tab with <code>active</code>, else the first).', 'Aktiver Tab-Wert (Standard: Tab mit <code>active</code>, sonst der erste).')],
  slots: [{ name: '(default)', desc: t('<code>nk-tab</code> children.', '<code>nk-tab</code>-Kinder.') }, { name: 'panel', desc: t('Panels with <code>data-tab</code>.', 'Panels mit <code>data-tab</code>.') }],
  events: [{ name: 'nk-change', detail: '{ value }', desc: t('Active tab changed.', 'Aktiver Tab gewechselt.') }, { name: 'nk-select', detail: '{ value, label }', desc: t('From the clicked tab.', 'Vom geklickten Tab.') }],
  props: ['value'],
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
  tag: 'nk-segmented', group: 'page', classes: ['nk-segmented', 'active'],
  title: t('Segmented control', 'Segment-Schalter'),
  desc: t('Plain <code>&lt;button value&gt;</code> children stay in the light DOM (the stylesheet’s slotted twins shape them); the element moves <code>.active</code>, handles arrow keys and submits <code>value</code> with the form.', 'Einfache <code>&lt;button value&gt;</code>-Kinder bleiben im Light DOM (die Slot-Zwillinge des Stylesheets formen sie); das Element bewegt <code>.active</code>, behandelt Pfeiltasten und sendet <code>value</code> mit dem Formular.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('value', 'string', 'Selected value (default: the button with <code>.active</code>, else the first).', 'Gewählter Wert (Standard: Button mit <code>.active</code>, sonst der erste).'), ...formAttrs],
  slots: [{ name: '(default)', desc: t('<code>&lt;button value="…"&gt;</code> children.', '<code>&lt;button value="…"&gt;</code>-Kinder.') }],
  events: [changeEvent('Selection changed.', 'Auswahl geändert.')],
  example: W => `<nk-segmented name="range" value="week"><button value="week">${W.week}</button><button value="month">${W.month}</button><button value="quarter">${W.quarter}</button></nk-segmented>`,
  classMarkup: W => `<div class="nk-segmented"><button class="active">${W.week}</button><button>${W.month}</button><button>${W.quarter}</button></div>`,
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
  desc: t('Overlapping <code>.mini-avatar</code> children (light DOM, styled by the slotted twins) plus a “more” bubble from the attribute.', 'Überlappende <code>.mini-avatar</code>-Kinder (Light DOM, gestylt durch die Slot-Zwillinge) plus eine „Mehr“-Blase aus dem Attribut.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('more', 'string', 'Text of the trailing bubble, e.g. <code>+2</code>.', 'Text der letzten Blase, z. B. <code>+2</code>.')],
  slots: [{ name: '(default)', desc: t('<code>&lt;span class="mini-avatar" style="background:…"&gt;</code> children.', '<code>&lt;span class="mini-avatar" style="background:…"&gt;</code>-Kinder.') }],
  events: [],
  example: W => `<div style="display:flex;align-items:center;gap:12px"><nk-avatar-group more="+2"><span class="mini-avatar" style="background:linear-gradient(135deg,#9065b0,#529cca)">MK</span><span class="mini-avatar" style="background:#448361">SL</span><span class="mini-avatar" style="background:#d9730d">TW</span></nk-avatar-group><span style="font-size:12.5px;color:var(--nk-text-tertiary)">${W.people}</span></div>`,
  classMarkup: W => `<div style="display:flex;align-items:center;gap:12px"><div class="nk-avatar-group"><span class="mini-avatar" style="background:linear-gradient(135deg,#9065b0,#529cca)">MK</span><span class="mini-avatar" style="background:#448361">SL</span><span class="mini-avatar" style="background:#d9730d">TW</span><span class="mini-avatar more">+2</span></div><span style="font-size:12.5px;color:var(--nk-text-tertiary)">${W.people}</span></div>`,
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
  attrs: [str('title', 'string', 'Name line.', 'Namenszeile.'), str('desc', 'string', 'Description.', 'Beschreibung.'), ...formAttrs, str('value', 'string', 'Submitted value.', 'Gesendeter Wert.'), bool('selected', 'Selected.', 'Ausgewählt.')],
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
  attrs: [str('title', 'string', 'Red heading.', 'Rote Überschrift.')],
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
  attrs: [str('name', 'string', 'Name.', 'Name.'), str('mail', 'string', 'Mail.', 'Mail.'), str('avatar', 'string', 'Initials.', 'Initialen.'), str('color', 'CSS color', 'Avatar background.', 'Avatar-Hintergrund.'), bool('last', 'No bottom border.', 'Kein unterer Rand.')],
  slots: [{ name: 'role', desc: t('Control on the right.', 'Control rechts.') }, { name: 'avatar', desc: t('Custom avatar.', 'Eigener Avatar.') }, { name: '(default)', desc: t('Extra content.', 'Zusatzinhalt.') }],
  events: [],
  example: W => `<nk-member-row name="Sara Lindt" mail="sara@example.com" color="#448361" last></nk-member-row>`,
  classMarkup: W => `<div class="nk-member-row last"><span class="mini-avatar" style="background:#448361">SL</span><div>Sara Lindt<div class="m-mail">sara@example.com</div></div></div>`,
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
  tag: 'nk-settings-pane', group: 'overlays', classes: ['nk-settings-pane', 'active'],
  title: t('Settings pane', 'Einstellungs-Pane'),
  desc: t('One pane of the settings modal. <code>label</code>, <code>icon</code> and <code>group</code> feed the modal’s nav; <code>title</code> renders the pane heading. Slotted <code>&lt;h2&gt;</code>/<code>&lt;h3&gt;</code> are styled too.', 'Ein Pane des Einstellungs-Modals. <code>label</code>, <code>icon</code> und <code>group</code> speisen die Nav des Modals; <code>title</code> rendert die Pane-Überschrift. Geslottete <code>&lt;h2&gt;</code>/<code>&lt;h3&gt;</code> werden ebenfalls gestylt.'),
  mobile: t('Content padding drops to 24px below 860px.', 'Inhalts-Padding sinkt unter 860px auf 24px.'),
  attrs: [str('name', 'string', 'Identifier used by <code>pane</code>.', 'Kennung für <code>pane</code>.'), str('label', 'string', 'Nav label (a pane without label gets no nav row).', 'Nav-Beschriftung (ohne Label keine Nav-Zeile).'), str('icon', 'string', 'Nav icon.', 'Nav-Icon.'), str('group', 'string', 'Section label above its nav rows.', 'Abschnittsbeschriftung über den Nav-Zeilen.'), str('title', 'string', 'Pane heading.', 'Pane-Überschrift.'), bool('active', 'Visible (managed by the modal).', 'Sichtbar (vom Modal verwaltet).')],
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
  tag: 'nk-menu', group: 'overlays', classes: ['nk-pop', 'nk-menu', 'nk-menu-item', 'm-icon', 'm-shortcut', 'danger', 'nk-menu-sep', 'nk-menu-label'],
  title: t('Menu', 'Menü'),
  desc: t('A 230px context menu. Items are <code>nk-menu-item</code>s (<code>type="separator"</code> / <code>"label"</code> for the rest); ↑↓ move, Enter selects, <code>nk-select</code> bubbles up. Usually lives inside <code>nk-pop</code> or the workspace switcher.', 'Ein 230px-Kontextmenü. Einträge sind <code>nk-menu-item</code>s (<code>type="separator"</code> / <code>"label"</code> für den Rest); ↑↓ bewegen, Enter wählt, <code>nk-select</code> bubbelt hoch. Lebt meist in <code>nk-pop</code> oder im Workspace-Umschalter.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [],
  slots: [{ name: '(default)', desc: t('<code>nk-menu-item</code> children.', '<code>nk-menu-item</code>-Kinder.') }],
  events: [{ name: 'nk-select', detail: '{ value, label, item }', desc: t('From the chosen item.', 'Vom gewählten Eintrag.') }],
  methods: ['focusFirst()'],
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
  desc: t('One row of <code>nk-menu</code>: icon, label, shortcut; <code>danger</code> for destructive actions. <code>type</code> switches to a separator or a group label.', 'Eine Zeile von <code>nk-menu</code>: Icon, Label, Shortcut; <code>danger</code> für Destruktives. <code>type</code> macht daraus Trenner oder Gruppenlabel.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('icon', 'string', 'Leading icon.', 'Icon vorn.'), str('shortcut', 'string', 'Trailing shortcut text.', 'Shortcut-Text hinten.'), str('value', 'string', 'Reported value (default: text).', 'Gemeldeter Wert (Standard: Text).'), bool('danger', 'Red text.', 'Roter Text.'), str('type', 'item | separator | label', 'Row kind.', 'Zeilenart.', { default: 'item' }), bool('disabled', 'Not selectable.', 'Nicht wählbar.')],
  slots: [{ name: '(default)', desc: t('Label.', 'Beschriftung.') }, { name: 'icon', desc: t('Icon node.', 'Icon-Knoten.') }],
  events: [{ name: 'nk-select', detail: '{ value, label, item }', desc: t('Clicked / Enter.', 'Geklickt / Enter.') }],
  example: W => `<nk-menu><nk-menu-item icon="✏️" shortcut="⌘E" value="rename">${W.rename}</nk-menu-item></nk-menu>`,
  classMarkup: W => `<div class="nk-pop nk-menu"><div class="nk-menu-item"><span class="m-icon">✏️</span>${W.rename}<span class="m-shortcut">⌘E</span></div></div>`,
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
  desc: t('One inverted pill at the bottom centre. <code>toast.show("Saved")</code> shows it and hides it after <code>duration</code> ms; <code>open</code> is the state.', 'Eine invertierte Pille unten mittig. <code>toast.show("Gespeichert")</code> zeigt sie und blendet nach <code>duration</code> ms aus; <code>open</code> ist der Zustand.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [bool('open', 'Visible.', 'Sichtbar.'), str('duration', 'ms', 'Auto-hide delay (0 = stay).', 'Ausblend-Verzögerung (0 = bleibt).', { default: '2200' }), str('icon', 'string', 'Leading glyph.', 'Zeichen vorn.', { default: '✓' })],
  slots: [{ name: '(default)', desc: t('Static content (when <code>show()</code> gets no message).', 'Statischer Inhalt (wenn <code>show()</code> keine Nachricht bekommt).') }],
  events: [{ name: 'nk-toggle', detail: '{ open }', desc: t('Shown / hidden.', 'Gezeigt / verborgen.') }],
  methods: ['show(message?, { duration })', 'close()'], props: ['open', 'message'],
  example: W => `<nk-toast open duration="0">${W.toastText}</nk-toast>`,
  classMarkup: W => `<div class="nk-toast show">✓ <span>${W.toastText}</span></div>`,
},

// ============================================================ WAVE 5 · DATA
{
  tag: 'nk-database', group: 'data', classes: ['nk-database', 'nk-db-tabs', 'nk-db-tab', 'active', 'badge'], wide: true, script: true,
  title: t('Database', 'Datenbank'),
  desc: t('The view switcher. Child views (<code>nk-table-view</code>, <code>nk-board-view</code>) become tabs; <code>columns</code> and <code>rows</code> are pushed into every view. <code>view</code> selects the active one; <code>count</code> on a view shows the row count as badge. No fetching: give it data, listen to events.',
          'Der Ansichts-Umschalter. Kind-Views (<code>nk-table-view</code>, <code>nk-board-view</code>) werden Tabs; <code>columns</code> und <code>rows</code> werden in jede View gepusht. <code>view</code> wählt die aktive; <code>count</code> an einer View zeigt die Zeilenzahl als Badge. Kein Fetching: Daten reingeben, Events hören.'),
  mobile: t('Tables and boards scroll horizontally; nothing breaks.', 'Tabellen und Boards scrollen horizontal; nichts bricht.'),
  attrs: [str('view', 'string', 'Name of the active view.', 'Name der aktiven View.'), bool('add-view', 'Show a ＋ tab (fires <code>nk-action</code>).', 'Ein ＋-Tab zeigen (feuert <code>nk-action</code>).')],
  slots: [{ name: '(default)', desc: t('View elements.', 'View-Elemente.') }],
  events: [{ name: 'nk-view-change', detail: '{ view }', desc: t('Tab switched.', 'Tab gewechselt.') }, { name: 'nk-action', detail: "{ action: 'add-view' }", desc: t('＋ clicked.', '＋ geklickt.') }, { name: 'nk-select / nk-change / nk-action', detail: '(from the views)', desc: t('Bubble up from the active view.', 'Bubbeln aus der aktiven View hoch.') }],
  props: ['columns', 'rows', 'view', 'views'], methods: ['refresh()'],
  example: W => `<nk-database view="table" add-view>
  <nk-table-view name="table" label="${W.table}" count new-row sortable></nk-table-view>
  <nk-board-view name="board" label="${W.board}" group-by="status" new-row></nk-board-view>
</nk-database>
${dbScript(W)}`,
  classMarkup: W => `<div class="nk-database">
  <div class="nk-db-tabs"><span class="nk-db-tab active">${W.table} <span class="badge">4</span></span><span class="nk-db-tab">${W.board}</span><span class="nk-db-tab" style="color:var(--nk-text-tertiary)">＋</span></div>
  ${dbTableClass(W)}
</div>`,
},
{
  tag: 'nk-table-view', group: 'data', classes: ['nk-table-wrap', 'nk-table', 'th-icon', 'row-title', 'date-cell', 'person-cell', 'mini-avatar', 'nk-new-row'], wide: true, script: true,
  title: t('Table view', 'Tabellenansicht'),
  desc: t('Renders <code>columns</code> × <code>rows</code> as the NotionKit table. Cells are polymorphic (<code>text</code>, <code>select</code>, <code>multi-select</code>, <code>date</code>, <code>person</code>, <code>checkbox</code>, <code>url</code>, <code>number</code>, <code>progress</code>) and rendered as plain markup by the exported <code>renderPropertyCell()</code> – every cell rule starts with <code>.nk-table</code>, so a cell element of its own would never be styled. Header clicks sort with <code>sortable</code>.',
          'Rendert <code>columns</code> × <code>rows</code> als NotionKit-Tabelle. Zellen sind polymorph (<code>text</code>, <code>select</code>, <code>multi-select</code>, <code>date</code>, <code>person</code>, <code>checkbox</code>, <code>url</code>, <code>number</code>, <code>progress</code>) und werden vom exportierten <code>renderPropertyCell()</code> als Klassen-Markup gerendert – jede Zellregel beginnt mit <code>.nk-table</code>, ein eigenes Zellen-Element würde nie gestylt. Kopfklicks sortieren mit <code>sortable</code>.'),
  mobile: t('Scrolls horizontally inside <code>.nk-table-wrap</code>.', 'Scrollt horizontal in <code>.nk-table-wrap</code>.'),
  attrs: [str('name', 'string', 'View name (tab id).', 'View-Name (Tab-Kennung).'), str('label', 'string', 'Tab label.', 'Tab-Beschriftung.'), str('badge', 'string', 'Tab badge.', 'Tab-Badge.'), bool('count', 'Row count as badge.', 'Zeilenzahl als Badge.'), bool('new-row', 'Show the add row.', 'Hinzufügen-Zeile zeigen.'), str('new-row-label', 'string', 'Its text.', 'Deren Text.', { default: '＋ New page' }), bool('sortable', 'Header click sorts locally.', 'Kopfklick sortiert lokal.'), str('sort-key', 'string', 'Sorted column.', 'Sortierte Spalte.'), str('sort-dir', 'asc | desc', 'Direction.', 'Richtung.')],
  slots: [],
  events: [{ name: 'nk-select', detail: '{ row, id }', desc: t('Row clicked.', 'Zeile geklickt.') }, { name: 'nk-change', detail: '{ row, key, value }', desc: t('Checkbox cell toggled (row updated in place).', 'Checkbox-Zelle umgeschaltet (Zeile direkt aktualisiert).') }, { name: 'nk-action', detail: "{ action: 'sort' | 'new-row', key?, value? }", desc: t('Header or add row clicked.', 'Kopf oder Hinzufügen-Zeile geklickt.') }],
  props: ['columns', 'rows', 'data'], methods: ['refresh()'],
  example: W => `<nk-table-view new-row sortable></nk-table-view>
${dbScript(W)}`,
  classMarkup: dbTableClass,
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
  tag: 'nk-filter-bar', group: 'data', classes: ['nk-btn', 'secondary', 'small', 'nk-tag', 'nk-input'], wide: true,
  title: t('Filter bar', 'Filterleiste'),
  desc: t('A toolbar composed from existing classes: filter and sort buttons (<code>nk-action</code>), active filters as removable chips, an optional search field. <code>bar.apply(rows)</code> keeps rows where every chip matches by strict equality (<code>row[key] === value</code>, so use the option <em>value</em>) and the search text appears in any string field (a person’s <code>name</code>); the data logic stays yours.', 'Eine Werkzeugleiste aus vorhandenen Klassen: Filter- und Sortier-Button (<code>nk-action</code>), aktive Filter als entfernbare Chips, optionales Suchfeld. <code>bar.apply(rows)</code> behält Zeilen, bei denen jeder Chip strikt gleich ist (<code>row[key] === value</code>, also den Options-<em>Wert</em> nutzen) und der Suchtext in einem String-Feld vorkommt (bei Personen der <code>name</code>); die Datenlogik bleibt deine.'),
  mobile: t('Wraps onto two lines.', 'Bricht auf zwei Zeilen um.'),
  attrs: [bool('search', 'Show the search field.', 'Suchfeld zeigen.'), str('placeholder', 'string', 'Search placeholder.', 'Such-Platzhalter.'), bool('no-filter', 'Hide the filter button.', 'Filter-Button ausblenden.'), bool('no-sort', 'Hide the sort button.', 'Sortier-Button ausblenden.')],
  slots: [{ name: '(default)', desc: t('Extra controls between chips and search.', 'Zusätzliche Controls zwischen Chips und Suche.') }],
  events: [{ name: 'nk-change', detail: '{ filters, search }', desc: t('Chip removed or search typed.', 'Chip entfernt oder gesucht.') }, { name: 'nk-action', detail: "{ action: 'filter' | 'sort' }", desc: t('Button clicked.', 'Button geklickt.') }],
  props: ['filters', 'value'], methods: ['apply(rows)'],
  example: W => `<nk-filter-bar search placeholder="${W.searchRows}"></nk-filter-bar>
<script>{ document.currentScript.previousElementSibling.filters = [{ key: 'status', value: 'done', label: '${W.filterDone}', color: 'green' }]; }</script>`,
  classMarkup: W => `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0"><button class="nk-btn secondary small">⚲ Filter</button><button class="nk-btn secondary small">↕ Sort</button><span style="display:inline-flex;gap:4px"><span class="nk-tag green" style="cursor:pointer">${W.filterDone} ×</span></span><input class="nk-input" type="search" placeholder="${W.searchRows}" style="margin-left:auto"></div>`,
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
  attrs: [str('author', 'string', 'Name.', 'Name.'), str('time', 'string', 'Relative time.', 'Relative Zeit.'), str('avatar', 'string', 'Initials/emoji (default: from the author).', 'Initialen/Emoji (Standard: aus dem Autor).'), str('color', 'CSS color', 'Avatar background.', 'Avatar-Hintergrund.')],
  slots: [{ name: '(default)', desc: t('Body.', 'Text.') }, { name: 'head', desc: t('After the name (tag, badge).', 'Hinter dem Namen (Tag, Badge).') }, { name: 'avatar', desc: t('Custom avatar.', 'Eigener Avatar.') }],
  events: [],
  example: W => `<nk-comments no-input><nk-comment author="Sara Lindt" time="1 hr ago" color="#448361">${W.commentText1}</nk-comment></nk-comments>`,
  classMarkup: W => `<div class="nk-comments"><div class="nk-comment"><span class="mini-avatar" style="background:#448361">SL</span><div><div class="c-head"><b>Sara Lindt</b> · 1 hr ago</div><div class="c-body">${W.commentText1}</div></div></div></div>`,
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
  tag: 'nk-ai-msg', group: 'data', classes: ['nk-ai-msg', 'user', 'a-body', 'a-name', 'nk-ai-actions'],
  title: t('AI message', 'KI-Nachricht'),
  desc: t('One message. <code>role="user"</code> flips the avatar to the gradient; <code>badge</code> is the grey suffix after the name (“· AI”); plain <code>&lt;button slot="actions"&gt;</code>s form the action row.', 'Eine Nachricht. <code>role="user"</code> schaltet den Avatar auf den Gradient; <code>badge</code> ist das graue Suffix hinter dem Namen („· KI“); einfache <code>&lt;button slot="actions"&gt;</code>s bilden die Aktionszeile.'),
  mobile: t('Unchanged.', 'Unverändert.'),
  attrs: [str('role', 'user | assistant', 'Who speaks.', 'Wer spricht.', { default: 'assistant' }), str('name', 'string', 'Name line.', 'Namenszeile.'), str('badge', 'string', 'Grey suffix.', 'Graues Suffix.'), str('avatar', 'string', 'Initials/emoji.', 'Initialen/Emoji.'), str('color', 'CSS color', 'Avatar background override.', 'Avatar-Hintergrund.')],
  slots: [{ name: '(default)', desc: t('Message body (HTML allowed).', 'Nachrichtentext (HTML erlaubt).') }, { name: 'actions', desc: t('<code>&lt;button value&gt;</code> children.', '<code>&lt;button value&gt;</code>-Kinder.') }, { name: 'avatar', desc: t('Custom avatar.', 'Eigener Avatar.') }],
  events: [{ name: 'nk-action', detail: '{ action, value }', desc: t('Action button clicked.', 'Action-Button geklickt.') }],
  example: W => `<nk-ai-thread><nk-ai-msg role="assistant" name="${W.aiName}" badge="${W.aiBadge}">${W.aiAnswer}<button slot="actions" value="copy">${W.copy}</button></nk-ai-msg></nk-ai-thread>`,
  classMarkup: W => `<div class="nk-ai-thread"><div class="nk-ai-msg"><span class="mini-avatar">✨</span><div class="a-body"><div class="a-name">${W.aiName} <span>${W.aiBadge}</span></div>${W.aiAnswer}<div class="nk-ai-actions"><button>${W.copy}</button></div></div></div></div>`,
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
