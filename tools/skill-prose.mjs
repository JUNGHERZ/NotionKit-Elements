// Hand-written sections of SKILL.md. Skeletons grow with the waves.
export const SKILL_PROSE = {
  setup: ({ CDN_CSS, CDN_JS, W }) => `# 1. Setup & Boilerplate

## Prerequisites (always)

1. Load **notionkit.css** on the document (it is the peer dependency) and put \`class="nk-body"\` on \`<body>\`. Shadow roots inherit font, colour and the scoped reset from there; the elements ship no visual CSS of their own.
2. Load the elements bundle **once**. It also injects the design tokens as a cascade layer (\`@layer notionkit-defaults\`), so your own unlayered \`:root { --nk-* }\` always wins.
3. Theme: \`data-theme="light|dark"\` on \`<html>\` only.

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
  <nk-btn variant="primary">${W.save}</nk-btn>
</body>
</html>
\`\`\`

## npm

\`\`\`bash
npm install @jungherz-de/notionkit-elements @jungherz-de/notionkit
\`\`\`

\`\`\`js
import '@jungherz-de/notionkit/notionkit.css';     // via your bundler, or a <link>
import '@jungherz-de/notionkit-elements';           // registers every <nk-*> tag
// or one element at a time (shared code: base.js):
import '@jungherz-de/notionkit-elements/components/nk-btn.js';
// the sheet the elements adopt, for your own views – never a second copy:
import { componentsSheet } from '@jungherz-de/notionkit-elements';
\`\`\`

The per-component files import NotionKit's sheet as \`@jungherz-de/notionkit/notionkit-styles.js\` instead of carrying a copy. A bundler resolves it; a build-free page maps it once:

\`\`\`html
<script type="importmap">{ "imports": { "@jungherz-de/notionkit/notionkit-styles.js": "/node_modules/@jungherz-de/notionkit/notionkit-styles.js" } }</script>
\`\`\`

Never mix the full bundle with the per-component files – each brings its own \`NkElement\`. With the bundle, take \`componentsSheet\` and \`NkElement\` from it (\`NotionKitElements.componentsSheet\` from the \`<script>\` build).
`,

  concepts: () => `# 2. Core Concepts

| Concept | Rule |
|---|---|
| Tag prefix | Every element is \`<nk-*>\`; the word stem equals the CSS class (\`.nk-callout\` ↔ \`<nk-callout>\`). |
| Modifiers | A modifier class becomes an attribute: \`.nk-btn.primary\` → \`<nk-btn variant="primary">\`, \`.nk-tag.green\` → \`<nk-tag color="green">\`. |
| States | A state class becomes a boolean attribute: \`.active\`, \`.open\`, \`.selected\`, \`checked\`. Set the attribute (or property) – never reach into the shadow root. |
| Rendering | Open Shadow DOM. The shadow root adopts the NotionKit *component* sheet only; tokens are inherited from the document. |
| Hosts | Every host is \`display: contents\` – no box of its own, the inner \`.nk-*\` element sits in the parent layout exactly like the class markup. Style the parent or the tokens, never the host; \`hidden\` on the host works. |
| Theme | One MutationObserver watches \`data-theme\` on \`<html>\` and mirrors it into every element. Nothing else switches themes. |
| Branding | Declare \`--nk-*\` tokens on \`:root\` in any plain stylesheet; every element follows in both themes. |
| Data | Static content via attributes and slots; dynamic data via JS properties (\`tree.data\`, \`database.rows\`, \`cmdk.commands\`). No fetching, no two-way binding. |
| Events | Custom events with fixed names (\`nk-select\`, \`nk-change\`, \`nk-view-change\`, \`nk-command\`, \`nk-toggle\`, \`nk-submit\`, \`nk-action\`). All bubble and are composed; payload in \`event.detail\`. |
| Forms | Controls are form-associated: FormData, reset, \`required\`, \`<fieldset disabled>\` work inside a \`<form>\`. |
| Icons | \`::slotted()\` only matches the assigned node. Pass an icon as the slotted node itself – \`<span slot="icon">📁</span>\` – never wrapped. |
| Light-DOM children | Elements that copy children (\`nk-select\` options, breadcrumb crumbs) watch them; \`element.refresh()\` is the escape hatch. The empty string is a valid value. |
| Moving elements | An element moved in the DOM keeps working – listeners and theme registration are re-armed on every connect. |
| Attributes are live | Every documented attribute re-renders when changed after connect (\`stat.setAttribute('value', '129')\`, \`el.open = true\`); properties reflect to attributes where a setter is listed. |
`,

  skeletons: ({ CDN_CSS, CDN_JS, W }) => `# 4. Composition Patterns (app skeletons)

Eight skeletons, one per app shape, mirroring the NotionKit CSS SKILL.md. Copy one, delete what you do not need.

## 4.1 Workspace app

**When:** the default for Notion-like document apps – pages are the primary object, a tree on the left, one page on the right. A page that is a database row shows its properties under the title and lists its sub-pages.

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
<nk-app>
  <!-- collapsible: the « collapses it on the desktop, the ☰ and ⌘\\ bring it back -->
  <nk-sidebar slot="sidebar" id="sidebar" collapsible>
    <nk-workspace-switcher slot="workspace" name="${W.workspace}"></nk-workspace-switcher>
    <nk-tree id="tree">
      <nk-tree-item icon="🔍" value="search" no-actions>${W.search}<span slot="end" class="nk-kbd-hint"><nk-kbd>⌘</nk-kbd><nk-kbd>K</nk-kbd></span></nk-tree-item>
      <nk-tree-item icon="🏠" value="home">${W.home}</nk-tree-item>
      <nk-tree-item icon="📥" value="inbox">${W.inbox}</nk-tree-item>
      <nk-section-label addable>${W.favourites}</nk-section-label>
      <nk-tree-item icon="📊" value="overview" open>${W.projectOverview}
        <nk-tree-item icon="🚀" value="mvp" active>${W.mvp}</nk-tree-item>
        <nk-tree-item icon="🎙️" value="voh">${W.voh}</nk-tree-item>
      </nk-tree-item>
      <nk-section-label addable>${W.workspaceSection}</nk-section-label>
      <nk-tree-item icon="🧠" value="kb">${W.knowledgeBase}
        <nk-tree-item icon="📄" value="onboarding">${W.onboarding}</nk-tree-item>
      </nk-tree-item>
      <nk-tree-item icon="🎨" value="design">${W.designSystem}</nk-tree-item>
    </nk-tree>
    <nk-tree-item slot="footer" icon="⚙️" value="settings" no-actions>${W.settings}</nk-tree-item>
    <nk-tree-item slot="footer" icon="🗑️" value="trash" no-actions>${W.trash}</nk-tree-item>
  </nk-sidebar>

  <nk-topbar>
    <nk-btn variant="sidebar" aria-label="Menu" data-tooltip="${W.openSidebar}">☰</nk-btn>
    <nk-breadcrumb><span>📊 ${W.projectOverview}</span><span>🚀 ${W.mvp}</span></nk-breadcrumb>
    <nk-btn slot="actions" variant="share">${W.share}</nk-btn>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>

  <!-- Page options: add full (full width) or small (14px text) to <nk-page>. -->
  <nk-page icon="🚀" cover>
    <nk-page-title editable>${W.pageTitle}</nk-page-title>
    <nk-props>
      <nk-prop label="${W.propStatus}" icon="◉"><nk-tag color="blue">${W.statusProgress}</nk-tag></nk-prop>
      <nk-prop label="${W.propOwner}" icon="👤"><nk-avatar size="small">AL</nk-avatar>Ada Lovelace</nk-prop>
      <nk-prop label="${W.propDue}" icon="📅">${W.dueDate}</nk-prop>
    </nk-props>
    <p class="lead">${W.lead}</p>
    <nk-heading>Sub-pages</nk-heading>
    <nk-list-view id="subpages" meta-keys="due,status"></nk-list-view>
    <!-- The editor: mount TipTap into a light-DOM .nk-block-host (docs-editor.js).
         Saved HTML shown read-only goes into <div class="nk-prose"> – same look. -->
    <div class="nk-block-host" id="editor"></div>
  </nk-page>

  <nk-tab-bar>
    <nk-tab-bar-item icon="🏠" value="home" active>${W.home}</nk-tab-bar-item>
    <nk-tab-bar-item icon="📥" value="inbox">${W.inbox}</nk-tab-bar-item>
    <nk-tab-bar-item icon="🔍" value="search">${W.search}</nk-tab-bar-item>
    <nk-tab-bar-item icon="☰" drawer>${W.more}</nk-tab-bar-item>
  </nk-tab-bar>
</nk-app>
<script>
  tree.addEventListener('nk-select', e => console.log('open page', e.detail.value));
  tree.addEventListener('nk-action', e => console.log(e.detail.action, 'on', e.detail.value));
  subpages.columns = [
    { key: 'name', label: 'Name', title: true }, { key: 'due', label: 'Due', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'done', label: 'Done', color: 'green' }, { value: 'open', label: 'Open', color: 'gray' }] },
  ];
  subpages.rows = [{ id: 1, icon: '📄', name: 'Hiring plan', due: '12 Aug', status: 'done' }, { id: 2, icon: '📄', name: 'Budget review', due: '2 Sep', status: 'open' }];
  subpages.addEventListener('nk-select', e => console.log('open sub-page', e.detail.id));
</script>
</body>
</html>
\`\`\`

Rules of the shell: \`nk-sidebar\`, \`nk-topbar\` and \`nk-page\` are \`display: contents\` hosts – their inner boxes are direct flex children of \`.nk-app\` / \`.nk-main\`, so do not style the hosts. \`<nk-btn variant="sidebar">\` is the ☰: shown below 860px only, where the sidebar is hidden, it opens it as a drawer – NotionKit’s own drawer rules, no script. For phones and installed PWAs add \`<nk-tab-bar>\` as the last child of \`<nk-app>\`: it lands below the page in the main column, is hidden above 860px (the sidebar is the navigation there) and shown below; a \`drawer\` item opens the sidebar. For Notion’s “More” – the rest of the sidebar as a list from the bottom edge – put an \`<nk-sheet>\` under \`<body>\` and open it from the item’s \`nk-select\` after \`e.preventDefault()\`. Never give the bar a \`view-transition-name\` – it stays put between pages.

## 4.2 Database app

**When:** structured, data-centric apps – a CRM, a tracker, an editorial calendar. Rows are the primary object; the database is the main room.

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
<nk-app>
  <nk-sidebar slot="sidebar">
    <nk-workspace-switcher slot="workspace" name="${W.workspace}"></nk-workspace-switcher>
    <nk-tree>
      <nk-section-label addable>Databases</nk-section-label>
      <nk-tree-item icon="🗃️" value="projects" active>Projects</nk-tree-item>
      <nk-tree-item icon="🤝" value="clients">Clients</nk-tree-item>
      <nk-tree-item icon="🗓️" value="editorial">${W.editorialPlan}</nk-tree-item>
    </nk-tree>
  </nk-sidebar>
  <nk-topbar>
    <nk-breadcrumb><span>🗃️ Projects</span></nk-breadcrumb>
    <nk-btn slot="actions" variant="share">${W.share}</nk-btn>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>
  <nk-page icon="🗃️">
    <nk-page-title>Projects</nk-page-title>
    <nk-database id="db" view="table" add-view>
      <nk-btn slot="tools" variant="tool" id="filterBtn" aria-haspopup="menu">${W.filter}</nk-btn>
      <nk-btn slot="tools" variant="primary" small id="newBtn">${W.newBtn}</nk-btn>
      <nk-filter-bar slot="filters" id="filters" add no-filter no-sort></nk-filter-bar>
      <nk-table-view name="table" label="${W.table}" count new-row sortable></nk-table-view>
      <nk-board-view name="board" label="${W.board}" group-by="status" new-row></nk-board-view>
      <nk-calendar-view name="calendar" label="${W.calendar}" date-key="due" weeks></nk-calendar-view>
    </nk-database>
  </nk-page>
</nk-app>
<!-- a popover on the desktop, a bottom sheet on a phone -->
<nk-menu floating sheet id="filterMenu">
  <nk-menu-item type="label">Filter by</nk-menu-item>
  <nk-menu-item type="check" icon="◉" value="done">${W.dbStatus}: ${W.statusDone}</nk-menu-item>
</nk-menu>
<!-- one date picker for every date: a popover under the cell, a sheet on a phone -->
<nk-calendar floating sheet weeks weekend="6,0" id="picker"></nk-calendar>
<!-- a row beside the table, a sheet on a phone -->
<nk-peek id="peek">
  <nk-page-title id="peekTitle"></nk-page-title>
  <div class="nk-prose"><p>Notes on this row – the page behind it.</p></div>
</nk-peek>
<nk-toast id="toast"></nk-toast>
<script>
  const columns = [
    { key: 'name', label: '${W.dbName}', type: 'text', icon: '📄', title: true },
    { key: 'status', label: '${W.dbStatus}', type: 'select', icon: '◉', options: [
      { value: 'planned', label: '${W.statusPlanned}', color: 'orange' },
      { value: 'progress', label: '${W.statusProgress}', color: 'blue' },
      { value: 'done', label: '${W.statusDone}', color: 'green' } ] },
    { key: 'owner', label: '${W.dbOwner}', type: 'person', icon: '👤' },
    { key: 'due', label: '${W.dbDue}', type: 'date', icon: '📅' },
    { key: 'progress', label: '${W.dbProgress}', type: 'progress', icon: '▰' },
  ];
  const rows = [
    { id: 1, icon: '🧭', name: '${W.p1}', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '08.05.2026', progress: 100 },
    { id: 2, icon: '🗃️', name: '${W.p3}', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '20.05.2026', progress: 65 },
    { id: 3, icon: '▤', name: '${W.p4}', status: 'planned', due: '02.06.2026', progress: 0 },
  ];
  const FILTERS = { done: { key: 'status', value: 'done', label: '${W.dbStatus}: ${W.statusDone}' } };
  function render() {
    db.rows = filters.apply(rows);
    filterBtn.active = filters.filters.length > 0;
    filterMenu.querySelectorAll('nk-menu-item[type="check"]').forEach(i => { i.checked = filters.filters.includes(FILTERS[i.value]); });
  }
  db.columns = columns;
  render();
  filterBtn.addEventListener('click', () => filterMenu.toggle(filterBtn));
  filters.addEventListener('nk-action', e => filterMenu.show(e.detail.anchor));      // a pill or ＋ Filter
  filterMenu.addEventListener('nk-change', e => {
    const f = FILTERS[e.detail.value];
    filters.filters = e.detail.checked ? [...filters.filters, f] : filters.filters.filter(x => x !== f);
    render();
  });
  filters.addEventListener('nk-change', render);                                     // × on a pill
  newBtn.addEventListener('click', () => { rows.push({ id: Date.now(), icon: '📄', name: 'New page', status: 'planned', due: '—', progress: 0 }); render(); });
  let editing = null;
  db.addEventListener('nk-select', e => {                                         // a row, a card, a list item, a calendar card
    if (e.detail.key === 'due') {                                                  // a due date in the table: the picker under its cell
      editing = e.detail.row;
      picker.value = editing.due.split('.').reverse().join('-');
      picker.show(e.detail.cell);
      return;
    }
    peekTitle.textContent = e.detail.row.name;
    peek.setAttribute('label', e.detail.row.name);
    peek.show();                                                                   // another row only swaps it
  });
  picker.addEventListener('nk-change', e => { editing.due = e.detail.value.split('-').reverse().join('.'); render(); });
  db.addEventListener('nk-change', e => toast.show(\`\${e.detail.row.name} → \${e.detail.value}\`));
  db.addEventListener('nk-action', e => { if (e.detail.action === 'new-row') { rows.push({ id: Date.now(), icon: '📄', name: 'New page', status: e.detail.value || 'planned', due: '—', progress: 0 }); render(); } });
</script>
</body>
</html>
\`\`\`

Data contract: \`columns\` describe the properties (\`type\`: text | select | multi-select | date | person | checkbox | url | number | progress; a \`select\` carries \`options: [{ value, label, color }]\`; the title column has \`title: true\`), \`rows\` are plain objects keyed by \`column.key\` (a \`person\` is \`{ name, initials, color }\` or a string; \`icon\` on a row prefixes the title). The elements render what they get – filtering, sorting on the server, persistence are yours; \`filters.apply(rows)\` is the local filter, \`op: 'is-not'\` on a filter keeps the other rows. Assign a new array (\`db.rows = …\`) or call \`db.refresh()\` after mutating rows in place.

## 4.4 AI chat page

**When:** assistant-centred apps where the conversation is the document.

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
<nk-app>
  <nk-sidebar slot="sidebar">
    <nk-workspace-switcher slot="workspace" name="${W.workspace}"></nk-workspace-switcher>
    <nk-tree>
      <nk-tree-item icon="＋" value="new" no-actions>New chat</nk-tree-item>
      <nk-section-label>Threads</nk-section-label>
      <nk-tree-item icon="✨" value="t1" active>Open tasks</nk-tree-item>
      <nk-tree-item icon="✨" value="t2">Release notes draft</nk-tree-item>
    </nk-tree>
  </nk-sidebar>
  <nk-topbar>
    <nk-breadcrumb><span>✨ Open tasks</span></nk-breadcrumb>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>
  <nk-page icon="✨">
    <nk-page-title>Open tasks</nk-page-title>
    <nk-ai-thread id="thread">
      <nk-ai-msg role="user" name="${W.you}" avatar="MK">${W.aiQuestion}</nk-ai-msg>
      <nk-ai-msg role="assistant" name="${W.aiName}" badge="${W.aiBadge}">${W.aiAnswer}
        <button slot="actions" value="copy">${W.copy}</button>
        <button slot="actions" value="rephrase">${W.rephrase}</button>
      </nk-ai-msg>
    </nk-ai-thread>
    <nk-ai-input-row id="prompt" placeholder="${W.askAi}"></nk-ai-input-row>
  </nk-page>
</nk-app>
<script>
  prompt.addEventListener('nk-submit', async e => {
    const user = document.createElement('nk-ai-msg');
    user.setAttribute('role', 'user'); user.setAttribute('name', '${W.you}'); user.setAttribute('avatar', 'MK');
    user.textContent = e.detail.text;
    thread.appendChild(user);
    prompt.disabled = true;
    const reply = document.createElement('nk-ai-msg');
    reply.setAttribute('name', '${W.aiName}'); reply.setAttribute('badge', '${W.aiBadge}');
    reply.textContent = await askYourBackend(e.detail.text);   // your call
    thread.appendChild(reply);
    prompt.disabled = false;
    prompt.focus();
  });
  thread.addEventListener('nk-action', e => console.log(e.detail.action));
  async function askYourBackend(text) { return 'Echo: ' + text; }
</script>
</body>
</html>
\`\`\`

## 4.3 Settings modal integration

**When:** you have an app already and need the settings overlay – plus the command palette and a toast, since they share the "overlay under body" rule (so do \`<nk-sheet>\` and a floating \`<nk-menu>\`).

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
<!-- your app -->
<div class="nk-page" style="padding-top:48px">
  <nk-page-title>${W.pageTitle}</nk-page-title>
  <p><nk-btn variant="secondary" onclick="settings.show()">⚙️ ${W.openSettings}</nk-btn> <nk-btn variant="secondary" onclick="palette.show()">🔍 ${W.openPalette2}</nk-btn></p>
</div>

<!-- overlays: direct children of <body> -->
<nk-modal id="settings">
  <nk-settings-user slot="user" name="${W.userName}" mail="${W.userMail}"></nk-settings-user>

  <nk-settings-pane name="profile" group="${W.account}" icon="👤" label="${W.myProfile}" title="${W.myProfile}" active>
    <nk-image-picker id="photo" initials="MK" label="${W.myProfile}"></nk-image-picker>
    <h3>${W.displayName}</h3>
    <nk-field label="${W.displayName}" desc="${W.displayNameDesc}"><nk-input name="name" value="${W.userName}"></nk-input></nk-field>
    <nk-field label="${W.email}"><nk-input name="email" type="email" value="${W.userMail}"></nk-input></nk-field>
    <p style="margin-top:16px"><nk-btn variant="primary" small onclick="toast.show('${W.toastText}')">${W.save}</nk-btn></p>
  </nk-settings-pane>

  <nk-settings-pane name="appearance" group="${W.account}" icon="🎨" label="${W.appearance}" title="${W.appearance}">
    <nk-field label="${W.theme}"><nk-select id="themeSelect"><option value="light">${W.light}</option><option value="dark">${W.dark}</option></nk-select></nk-field>
    <nk-field label="${W.fontSize}"><nk-slider min="12" max="18" value="14" unit="px" show-value></nk-slider></nk-field>
  </nk-settings-pane>

  <nk-settings-pane name="ai" group="${W.account}" icon="✨" label="${W.aiAssistant}" title="${W.aiAssistant}">
    <nk-model-card name="model" value="pro" title="${W.modelPro}" desc="${W.modelProDesc}" selected></nk-model-card>
    <nk-model-card name="model" value="fast" title="${W.modelFast}" desc="${W.modelFastDesc}"></nk-model-card>
  </nk-settings-pane>

  <nk-settings-pane name="general" group="${W.workspaceSection}" icon="⚙️" label="${W.general}" title="${W.general}">
    <nk-field label="${W.workspace}"><nk-input value="${W.workspace}"></nk-input></nk-field>
    <nk-field label="Icon"><nk-image-picker square initials="A" max="256" type="image/png"></nk-image-picker></nk-field>
    <nk-field label="Public address"><nk-copy-field value="https://acme.example.com"></nk-copy-field></nk-field>
    <nk-danger-zone title="${W.dangerTitle}"><nk-field label="${W.deleteWorkspace}" desc="${W.dangerDesc}"><nk-btn variant="danger-solid" small>${W.delete}</nk-btn></nk-field></nk-danger-zone>
  </nk-settings-pane>

  <nk-settings-pane name="members" group="${W.workspaceSection}" icon="👥" label="${W.members}" title="${W.members}">
    <nk-member-list>
      <nk-member-row name="Sara Lindt" mail="sara@example.com" color="#448361"><nk-select slot="role" compact value="editor"><option value="viewer">${W.viewer}</option><option value="editor">${W.editor}</option><option value="admin">${W.admin}</option></nk-select></nk-member-row>
      <nk-member-row name="Tom Weber" mail="tom@example.com" color="#d9730d"><nk-select slot="role" compact value="viewer"><option value="viewer">${W.viewer}</option><option value="editor">${W.editor}</option><option value="admin">${W.admin}</option></nk-select></nk-member-row>
    </nk-member-list>
  </nk-settings-pane>
</nk-modal>

<nk-cmdk id="palette" placeholder="${W.searchCommand}"></nk-cmdk>
<nk-toast id="toast"></nk-toast>

<script>
  palette.commands = [
    { group: '${W.pages}', items: [{ id: 'mvp', icon: '🚀', label: '${W.mvp}' }, { id: 'kb', icon: '🧠', label: '${W.knowledgeBase}' }] },
    { group: '${W.actions}', items: [
      { id: 'settings', icon: '⚙️', label: '${W.openSettings}', shortcut: '⌘,', action: () => settings.show() },
      { id: 'theme', icon: '🌙', label: '${W.toggleTheme}', shortcut: '⌘⇧L', action: () => document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark' },
    ]},
  ];
  palette.addEventListener('nk-command', e => console.log('command', e.detail.id));
  themeSelect.addEventListener('nk-change', e => document.documentElement.dataset.theme = e.detail.value);
  settings.addEventListener('nk-select', e => console.log('pane', e.detail.value));
  photo.addEventListener('nk-change', e => console.log('upload', e.detail.size, 'bytes'));   // a data URL, scaled, EXIF-rotated
</script>
</body>
</html>
\`\`\`

The open/close contract is one attribute: \`settings.open = true\`, \`settings.show('members')\`, \`settings.close()\`. Never add the class \`open\` yourself.

## 4.5 Form / onboarding page

**When:** an app – or one step of it – made entirely of form elements. No sidebar, no editor.

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
<div class="nk-page" style="padding-top:48px">
  <h1 class="nk-page-title">Set up your workspace</h1>
  <p class="lead">Three short steps. Everything can be changed later in Settings.</p>
  <nk-steps id="progress" label="Set up your workspace" current="1" steps="Profile, Notifications, Assistant style"></nk-steps>

  <form id="onboarding">
    <nk-heading>1 · Profile</nk-heading>
    <nk-field label="${W.displayName}" desc="${W.displayNameDesc}"><nk-input name="name" required></nk-input></nk-field>
    <nk-field label="${W.email}"><nk-input name="email" type="email" required></nk-input></nk-field>
    <nk-field label="${W.bio}" stacked><nk-textarea name="bio" rows="3" placeholder="${W.bioPlaceholder}"></nk-textarea></nk-field>

    <nk-heading>2 · Notifications</nk-heading>
    <nk-field label="${W.notify}"><nk-switch name="notify" checked></nk-switch></nk-field>
    <nk-check name="digest" value="weekly" checked>${W.weekly}</nk-check>
    <nk-check name="digest" value="mentions">${W.mentions}</nk-check>

    <nk-heading>3 · Assistant style</nk-heading>
    <nk-radio name="style" value="concise">${W.concise}</nk-radio>
    <nk-radio name="style" value="balanced" checked>${W.balanced}</nk-radio>
    <nk-radio name="style" value="detailed">${W.detailed}</nk-radio>
    <nk-field label="${W.fontSize}"><nk-slider name="size" min="12" max="18" value="14" unit="px" show-value></nk-slider></nk-field>

    <nk-divider></nk-divider>
    <nk-callout icon="🔒">Nothing leaves your browser in this demo.</nk-callout>
    <p style="margin-top:16px"><nk-btn type="submit" variant="primary">Finish</nk-btn> <nk-btn type="reset" variant="secondary">Reset</nk-btn></p>
  </form>
</div>
<script>
  onboarding.addEventListener('submit', e => { e.preventDefault(); console.log(Object.fromEntries(new FormData(onboarding))); });
</script>
</body>
</html>
\`\`\`

## 4.6 Landing / documentation page

**When:** a public page in the NotionKit look – no sidebar, the page *is* the document. For a complete website use [NotionKit Web](https://notionkit-web.jungherz.com), the Astro template on the same foundation.

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
<nk-page narrow icon="📘" cover>
  <nk-page-title>NotionKit Elements</nk-page-title>
  <nk-page-actions><span>${W.owner}</span><span>${W.created}</span><span>${W.tagged} <nk-tag color="green">${W.done}</nk-tag></span></nk-page-actions>
  <p class="lead">${W.lead}</p>

  <nk-banner variant="info">ℹ️ <span>${W.bannerInfo}</span><span slot="action">${W.view}</span></nk-banner>
  <nk-callout icon="💡"><b>Core idea:</b> ${W.calloutText}</nk-callout>

  <nk-heading>Getting started</nk-heading>
  <nk-code lang="html" highlight>&lt;nk-btn variant="primary"&gt;${W.save}&lt;/nk-btn&gt;</nk-code>

  <nk-heading>Building blocks</nk-heading>
  <nk-tabs value="notes">
    <nk-tab value="notes">${W.notes}</nk-tab><nk-tab value="tasks">${W.tasks}</nk-tab>
    <div slot="panel" data-tab="notes" class="nk-tab-panel">${W.notesText}</div>
    <div slot="panel" data-tab="tasks" class="nk-tab-panel">${W.tasksText}</div>
  </nk-tabs>
  <nk-stats>
    <nk-stat label="${W.activePages}" value="128" delta="${W.deltaPages}" trend="up"></nk-stat>
    <nk-stat label="${W.openTasks}" value="14" delta="${W.deltaTasks}" trend="down"></nk-stat>
  </nk-stats>

  <nk-toggle label="${W.details}" open>${W.toggleBody}</nk-toggle>
  <nk-quote cite="${W.quoteCite}">${W.quote}</nk-quote>
  <nk-divider></nk-divider>
  <nk-empty icon="🗂️" title="${W.emptyTitle}" desc="${W.emptyDesc}"><nk-btn variant="primary" small>${W.newEntry}</nk-btn></nk-empty>
</nk-page>
</body>
</html>
\`\`\`

Note \`narrow\`: the page is the document, so there is no inner scroll wrapper – the browser scrolls. Inside \`<nk-app>\` leave it off.
## 4.7 Home page

**When:** the first screen after sign-in – a greeting, the pages someone comes back to, what is due next. Notion calls it Home; LearnHub builds it as “My courses”, Auxdesk as “Overview”. Full width and small text, panels with a picture cover, a list for what is next.

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
<nk-app>
  <nk-sidebar slot="sidebar">
    <nk-workspace-switcher slot="workspace" name="${W.workspace}"></nk-workspace-switcher>
    <nk-tree>
      <nk-tree-item icon="🏠" value="home" active>${W.home}</nk-tree-item>
      <nk-tree-item icon="🚀" value="mvp">${W.mvp}</nk-tree-item>
    </nk-tree>
  </nk-sidebar>
  <nk-topbar><nk-breadcrumb><span>🏠 ${W.home}</span></nk-breadcrumb><nk-theme-toggle slot="actions"></nk-theme-toggle></nk-topbar>

  <!-- An app view, not a document: the whole width, 14px text. -->
  <nk-page full small>
    <nk-page-title>Good morning, Ada</nk-page-title>
    <nk-heading>🕘 Recently visited</nk-heading>
    <nk-panels>
      <nk-panel href="/roadmap" cover="covers/roadmap.jpg" icon="🚀" title="Roadmap"><p><nk-avatar size="small">AL</nk-avatar> ${W.minAgo}</p></nk-panel>
      <nk-panel href="/kb" cover icon="📚" title="${W.knowledgeBase}"><p>${W.yesterday}</p></nk-panel>
      <nk-panel href="/onboarding" icon="🧭" title="${W.onboarding}"><p>Monday</p></nk-panel>
    </nk-panels>
    <nk-heading>📌 Upcoming</nk-heading>
    <nk-list-view id="upcoming" meta-keys="due,status"></nk-list-view>
    <nk-heading>📊 This week</nk-heading>
    <nk-panels>
      <nk-panel title="${W.weeklyReview}"><p>${W.weeklyReviewText}</p><nk-progress value="60" label="60 %" wide></nk-progress></nk-panel>
      <nk-panel title="Release notes"><div class="nk-prose"><p>Version 2.4 ships the list view. <a href="/changelog">Read more</a></p></div></nk-panel>
    </nk-panels>
  </nk-page>
</nk-app>
<script>
  upcoming.columns = [
    { key: 'name', label: 'Name', title: true }, { key: 'due', label: 'Due', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'progress', label: 'In progress', color: 'blue' }, { value: 'planned', label: 'Planned', color: 'orange' }] },
  ];
  upcoming.rows = [{ id: 1, icon: '🗃️', name: 'Table view', due: '20 May', status: 'progress' }, { id: 2, icon: '▤', name: 'Board with drag and drop', due: '2 June', status: 'planned' }];
  upcoming.addEventListener('nk-select', e => location.assign('/tasks/' + e.detail.id));
</script>
</body>
</html>
\`\`\`

\`nk-panels\` falls to one column on a phone; the list keeps one line per row and cuts the title first. A slotted \`<p>\` in a panel is styled by the panel – inside it, \`<nk-avatar>\` brings its own size.

## 4.8 Sign-in page

**When:** the page before the app – sign in with a provider or by email. A narrow centred column in a panel, no sidebar. Not an element on purpose: panel, field and buttons already are one.

\`\`\`html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${CDN_CSS}">
  <script src="${CDN_JS}"></script>
</head>
<body class="nk-body">
<!-- A narrow column, centred: layout is yours, so it is inline. -->
<nk-page narrow>
  <div style="max-width:420px;margin:12vh auto 0;display:flex;flex-direction:column;gap:14px">
    <div style="text-align:center">
      <nk-avatar size="xlarge" square>A</nk-avatar>
      <nk-page-title>Sign in to Acme</nk-page-title>
      <div style="color:var(--nk-text-secondary)">Use your work account.</div>
    </div>
    <form id="signin">
      <nk-panel>
        <nk-btn variant="secondary" type="button">Continue with Google</nk-btn>
        <nk-btn variant="secondary" type="button">Continue with Microsoft</nk-btn>
        <nk-field label="Email" stacked><nk-input name="email" type="email" placeholder="ada@acme.com" required></nk-input></nk-field>
        <nk-btn variant="primary" type="submit">Continue with email</nk-btn>
      </nk-panel>
    </form>
    <nk-banner variant="success" id="sent" hidden>✉️ Check your inbox – we sent you a sign-in link.</nk-banner>
  </div>
</nk-page>
<script>
  signin.addEventListener('submit', e => { e.preventDefault(); sent.hidden = false; });
</script>
</body>
</html>
\`\`\`

The form takes part in \`FormData\` through \`nk-input\`; \`hidden\` on the banner works on every element.
`,

  events: () => `# 5. State & Event Overview

| Event | Fired by | \`detail\` |
|---|---|---|
| \`nk-change\` | every form control, \`nk-segmented\`, \`nk-tabs\`, \`nk-tab-bar\`, editable \`nk-page-title\` | \`{ value, name }\` – checkables add \`checked\` |
| \`nk-input\` | \`nk-input\`, \`nk-textarea\`, \`nk-slider\` | \`{ value, name }\` on every keystroke / drag |
| \`nk-toggle\` | \`nk-toggle\`, tree branches, overlays | \`{ open }\` |
| \`nk-select\` | tree items, menu items, breadcrumb, tabs, tab bar items, palette rows | \`{ value, label, … }\` |
| \`nk-view-change\` | \`nk-database\` | \`{ view }\` |
| \`nk-command\` | \`nk-cmdk\` | \`{ id, item, query }\` |
| \`nk-submit\` | comment and AI input rows | \`{ text }\` |
| \`nk-action\` | hover actions (tree ＋/⋯, section ＋, new row …) | \`{ action, value? }\` |

Form controls additionally re-dispatch a native, bubbling \`change\` event, so \`form.addEventListener('change', …)\` keeps working.
`,

  rules: () => `# 6. Rules & Common Mistakes

### Always follow

1. \`notionkit.css\` on the document and \`class="nk-body"\` on \`<body>\` – the shadow roots inherit from there.
2. \`data-theme\` on \`<html>\` only – the observer watches nothing else.
3. Form controls inside a \`<form>\` if their value should be submitted; \`FormData\` reads them like native fields.
4. Pass icons as the slotted node itself: \`<span slot="icon">📌</span>\`.
5. Toggle state through attributes or properties (\`el.open = true\`, \`el.setAttribute('active', '')\`), never through classes inside the shadow root.
6. \`<nk-select>\` options are direct \`<option>\`/\`<optgroup>\` children; change them in the light DOM and the element follows.
7. Brand on \`:root\`, not on a subtree – tokens are inherited into every shadow root from the document.
8. Import the bundle once per page. \`customElements.define\` throws on a second definition.

### Common mistakes

| Mistake | Correction |
|---|---|
| \`<span slot="icon"><svg/></span>\` (wrapped icon) | \`<svg slot="icon">\` – \`::slotted()\` matches only the assigned node |
| Declaring \`--nk-*\` tokens inside a shadow root, or adopting the full \`nkSheet\` | Tokens go on the document (\`:root\`); elements adopt \`componentsSheet\` only |
| Injecting your own CSS into \`element.shadowRoot\` | Restyle through tokens on \`:root\`; the elements carry no CSS of their own |
| \`data-theme\` on a \`<nk-*>\` element or a wrapper div | Only \`<html data-theme>\` is observed |
| \`el.shadowRoot.querySelector('.nk-btn').classList.add('primary')\` | \`el.variant = 'primary'\` |
| \`<nk-radio>\`s with different \`name\`s expected to exclude each other | Same \`name\` in the same tree and form makes the group |
| A form control outside \`<form>\` expected in \`FormData\` | Put it inside the form (or read \`el.value\`) |
| \`<button class="nk-btn">\` inside \`<nk-btn>\` | The element renders the button – slot only the label and icon |
| Loading the bundle without \`notionkit.css\` and wondering about the serif font | The token layer only covers colours and metrics; typography comes from \`.nk-body\` |
| \`<nk-btn style="margin-top:16px">\` or \`nk-callout { margin: … }\` | Hosts are \`display: contents\` and have no box – put spacing on a wrapper you own |
| A positioned wrapper around \`<nk-menu>\` to open it under a button | \`<nk-menu floating sheet>\` and \`menu.show(button)\`: it measures the button, closes on a tap outside and is a sheet on a phone |
| \`<nk-sheet id="more">\` opened from \`app.html#more\` | Give the overlay an id other than the hash: the browser scrolls to the fragment target and takes the focus the overlay just gave |
| \`<nk-btn variant="topbar" onclick="sidebar.toggle()">☰</nk-btn>\` plus a script that hides it on the desktop | \`<nk-btn variant="sidebar">☰</nk-btn>\` – shown below 860px only, opens the drawer |
| A \`<pre>\` with a Copy button that writes \`navigator.clipboard\` itself | \`<nk-copy-field value="…" mono>\` – Copy, the green moment after, the ⌘C fallback; \`secret\` for keys |
| A help or detail panel as a positioned \`<aside>\` with its own close logic | \`<nk-peek>\` – beside the page on the desktop, a sheet on a phone, Escape and outside clicks included |
| A file input plus canvas code for an avatar or logo | \`<nk-image-picker>\` – EXIF rotation, scaling, a data URL in \`nk-change\` |
| A positioned \`<div>\` with a scrim and its own Escape and focus logic for “Are you sure?” | \`<nk-dialog alert title="…">\` with \`<nk-btn slot="actions" value="…">\` – \`nk-close\` says which, and can be cancelled to check an input |
| \`title="…"\` on buttons for hints, or a hand-positioned hint | One \`<nk-tooltip>\` and \`data-tooltip\` (and \`data-tooltip-key\`) on the buttons; \`tip.show(rect, text)\` for chart bars |
| \`hidden\` on the sidebar plus an own button to widen the page on the desktop | \`<nk-sidebar collapsible>\` – the «, the ☰ of \`<nk-btn variant="sidebar">\`, ⌘\\; \`nk-collapse\` to keep the state |
| A padding on the page while the side peek is open, or a peek wider by CSS | \`<nk-peek resizable inset>\` – the width is \`--nk-peek-width\`, \`nk-resize\` to keep it |
| A hand-built month grid, or \`<input type="date">\` for a date property | \`<nk-calendar floating sheet>\` and \`picker.show(cell)\` – the table's \`nk-select\` names the \`key\` and the \`cell\`; \`range\` for start and end, \`weeks\` for calendar weeks, \`days\` for holidays and marks |
| Rows laid out in a table of weeks to show them by date | \`<nk-calendar-view date-key="due">\` in \`<nk-database>\` – a tab like table and board |
`,

  integration: () => `# 8. Framework Integration

- **Vanilla:** attributes for static config, properties for data, \`addEventListener('nk-change', …)\`.
- **React:** use \`ref\` for properties and events (\`ref.current.addEventListener('nk-change', …)\`); boolean attributes need \`checked={true ? '' : undefined}\` or property assignment. React 19 sets properties automatically.
- **Vue 3:** \`app.config.compilerOptions.isCustomElement = tag => tag.startsWith('nk-')\`; bind data with \`.prop\` (\`:rows.prop="rows"\`), listen with \`@nk-change\`.
- **Svelte:** works out of the box; \`on:nk-change\`; properties via \`bind:this\` + assignment.
- **SSR:** the elements render client-side. Server-render the page with \`.nk-*\` class markup where first paint matters and let the elements take over the interactive parts.
`,

  architecture: ({ pkg }) => `# 9. Architecture Notes

| Concept | Location |
|---|---|
| Base classes \`NkElement\` / \`NkFormElement\` | \`src/base.js\` – shadow root, adopted \`componentsSheet\`, theme wrapper, \`render/setupEvents/teardownEvents/onAttributeChanged/projectLightDom/refresh\`, ElementInternals |
| Token injection | \`src/base.js\` – once per page, \`@layer notionkit-defaults { tokensCss }\` appended to \`document.adoptedStyleSheets\` |
| Theme sync | one \`MutationObserver\` on \`<html>[data-theme]\`, a \`Set\` of instances, \`.nk-wrapper[data-theme]\` inside each root |
| Components | \`src/components/{forms,content,shell,page,overlays,data}/nk-*.js\`, one tag per file, \`customElements.define\` at the bottom |
| Build | Rollup: IIFE, minified IIFE, ESM, and per-component ESM entries on a stable \`dist/components/base.js\` that import NotionKit's sheet (\`@jungherz-de/notionkit/notionkit-styles.js\`) instead of inlining it; the full bundles inline it and export \`componentsSheet\` |
| Peer | \`@jungherz-de/notionkit >= ${pkg.version}\` – from 1.5.0 on the elements and the foundation share one version number; the bundle embeds that release's stylesheet, so keep them in step |

Lifecycle: construct (attach shadow, adopt sheets) → first connect (wrapper + \`render()\`) → every connect (\`setupEvents()\`, theme registration, light-DOM observer) → \`attributeChangedCallback\` → \`onAttributeChanged\` → disconnect (\`teardownEvents()\`, unregister).
`,
};
