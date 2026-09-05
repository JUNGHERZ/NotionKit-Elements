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
// or one element at a time (shared code is one extra chunk):
import '@jungherz-de/notionkit-elements/components/nk-btn.js';
\`\`\`
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

Six skeletons, one per app shape, mirroring the NotionKit CSS SKILL.md. Copy one, delete what you do not need.

## 4.1 Workspace app

**When:** the default for Notion-like document apps – pages are the primary object, a tree on the left, one page on the right.

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
  <nk-sidebar slot="sidebar" id="sidebar">
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
    <nk-btn variant="topbar" onclick="sidebar.toggle()" aria-label="Menu">☰</nk-btn>
    <nk-breadcrumb><span>📊 ${W.projectOverview}</span><span>🚀 ${W.mvp}</span></nk-breadcrumb>
    <nk-btn slot="actions" variant="share">${W.share}</nk-btn>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>

  <!-- wave 3 replaces this with <nk-page> / <nk-page-title> / <nk-block-host> -->
  <div class="nk-page-scroll"><div class="nk-cover"></div><div class="nk-page">
    <div class="nk-page-icon">🚀</div>
    <h1 class="nk-page-title">${W.pageTitle}</h1>
    <p class="lead">${W.lead}</p>
    <nk-callout icon="💡">The tree, topbar and sidebar are elements; the page body is still class markup until wave 3.</nk-callout>
  </div></div>
</nk-app>
<script>
  tree.addEventListener('nk-select', e => console.log('open page', e.detail.value));
  tree.addEventListener('nk-action', e => console.log(e.detail.action, 'on', e.detail.value));
</script>
</body>
</html>
\`\`\`

Rules of the shell: \`nk-sidebar\`, \`nk-topbar\` and (from wave 3) \`nk-page\` are \`display: contents\` hosts – their inner boxes are direct flex children of \`.nk-app\` / \`.nk-main\`, so do not style the hosts. The ☰ button only matters below 860px, where the sidebar is hidden and \`sidebar.toggle()\` opens it as a drawer.

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
    <nk-filter-bar id="filters" search placeholder="${W.searchRows}"></nk-filter-bar>
    <nk-database id="db" view="table" add-view>
      <nk-table-view name="table" label="${W.table}" count new-row sortable></nk-table-view>
      <nk-board-view name="board" label="${W.board}" group-by="status" new-row></nk-board-view>
    </nk-database>
  </nk-page>
</nk-app>
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
  db.columns = columns;
  db.rows = rows;
  filters.addEventListener('nk-change', () => { db.rows = filters.apply(rows); });
  db.addEventListener('nk-select', e => console.log('open row', e.detail.row));
  db.addEventListener('nk-change', e => toast.show(\`\${e.detail.row.name} → \${e.detail.value}\`));
  db.addEventListener('nk-action', e => { if (e.detail.action === 'new-row') { rows.push({ id: Date.now(), icon: '📄', name: 'New page', status: e.detail.value || 'planned', due: '—', progress: 0 }); db.rows = filters.apply(rows); } });
</script>
</body>
</html>
\`\`\`

Data contract: \`columns\` describe the properties (\`type\`: text | select | multi-select | date | person | checkbox | url | number | progress; a \`select\` carries \`options: [{ value, label, color }]\`; the title column has \`title: true\`), \`rows\` are plain objects keyed by \`column.key\` (a \`person\` is \`{ name, initials, color }\` or a string; \`icon\` on a row prefixes the title). The elements render what they get – filtering, sorting on the server, persistence are yours. Assign a new array (\`db.rows = …\`) or call \`db.refresh()\` after mutating rows in place.

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

**When:** you have an app already and need the settings overlay – plus the command palette and a toast, since they share the "overlay under body" rule.

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
    <nk-profile-row avatar="MK"><nk-btn variant="secondary" small>${W.changePhoto}</nk-btn> <nk-btn variant="danger" small>${W.remove}</nk-btn></nk-profile-row>
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

  <form id="onboarding">
    <nk-heading>1 · Profile</nk-heading>
    <nk-field label="${W.displayName}" desc="${W.displayNameDesc}"><nk-input name="name" required></nk-input></nk-field>
    <nk-field label="${W.email}"><nk-input name="email" type="email" required></nk-input></nk-field>
    <nk-field label="${W.bio}"><nk-textarea name="bio" rows="3" placeholder="${W.bioPlaceholder}"></nk-textarea></nk-field>

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
`,

  events: () => `# 5. State & Event Overview

| Event | Fired by | \`detail\` |
|---|---|---|
| \`nk-change\` | every form control, \`nk-segmented\`, \`nk-tabs\`, editable \`nk-page-title\` | \`{ value, name }\` – checkables add \`checked\` |
| \`nk-input\` | \`nk-input\`, \`nk-textarea\`, \`nk-slider\` | \`{ value, name }\` on every keystroke / drag |
| \`nk-toggle\` | \`nk-toggle\`, tree branches, overlays | \`{ open }\` |
| \`nk-select\` | tree items, menu items, breadcrumb, tabs, palette rows | \`{ value, label, … }\` |
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
`,

  integration: () => `# 8. Framework Integration

- **Vanilla:** attributes for static config, properties for data, \`addEventListener('nk-change', …)\`.
- **React:** use \`ref\` for properties and events (\`ref.current.addEventListener('nk-change', …)\`); boolean attributes need \`checked={true ? '' : undefined}\` or property assignment. React 19 sets properties automatically.
- **Vue 3:** \`app.config.compilerOptions.isCustomElement = tag => tag.startsWith('nk-')\`; bind data with \`.prop\` (\`:rows.prop="rows"\`), listen with \`@nk-change\`.
- **Svelte:** works out of the box; \`on:nk-change\`; properties via \`bind:this\` + assignment.
- **SSR:** the elements render client-side. Server-render the page with \`.nk-*\` class markup where first paint matters and let the elements take over the interactive parts.
`,

  architecture: () => `# 9. Architecture Notes

| Concept | Location |
|---|---|
| Base classes \`NkElement\` / \`NkFormElement\` | \`src/base.js\` – shadow root, adopted \`componentsSheet\`, theme wrapper, \`render/setupEvents/teardownEvents/onAttributeChanged/projectLightDom/refresh\`, ElementInternals |
| Token injection | \`src/base.js\` – once per page, \`@layer notionkit-defaults { tokensCss }\` appended to \`document.adoptedStyleSheets\` |
| Theme sync | one \`MutationObserver\` on \`<html>[data-theme]\`, a \`Set\` of instances, \`.nk-wrapper[data-theme]\` inside each root |
| Components | \`src/components/{forms,content,shell,page,overlays,data}/nk-*.js\`, one tag per file, \`customElements.define\` at the bottom |
| Build | Rollup: IIFE, minified IIFE, ESM, and per-component ESM entries with a shared chunk (\`dist/components/\`) |
| Peer | \`@jungherz-de/notionkit >= 1.0.0\`; 1.1.0 recommended (slot-name twins, disabled optics) |

Lifecycle: construct (attach shadow, adopt sheets) → first connect (wrapper + \`render()\`) → every connect (\`setupEvents()\`, theme registration, light-DOM observer) → \`attributeChangedCallback\` → \`onAttributeChanged\` → disconnect (\`teardownEvents()\`, unregister).
`,
};
