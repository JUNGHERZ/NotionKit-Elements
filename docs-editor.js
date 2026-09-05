// ============================================================
// NotionKit docs – live editor recipe
//
// Real TipTap, loaded from a CDN, mounted into an `.nk-block-host`.
// Everything here is demo-side behaviour: a slash menu, a bubble
// toolbar and a Notion-style block handle (＋ / ⠿) with drag & drop.
// The library ships none of this JavaScript – only the classes the
// pieces below put on their DOM (.nk-slash-menu, .nk-bubble-menu,
// .nk-block-actions, .nk-menu) so they inherit the NotionKit look.
//
// One TipTap version for every import: two copies of @tiptap/core on
// a page break extensions in confusing ways.
// ============================================================
const V = '2.27.3';
const cdn = (pkg, sub = '') => `https://esm.sh/${pkg}@${V}${sub}`;

let mods;
try {
  mods = await Promise.all([
    import(cdn('@tiptap/core')),
    import(cdn('@tiptap/starter-kit')),
    import(cdn('@tiptap/extension-placeholder')),
    import(cdn('@tiptap/suggestion')),
    import(cdn('@tiptap/extension-task-list')),
    import(cdn('@tiptap/extension-task-item')),
    import(cdn('@tiptap/pm', '/state')),
  ]);
} catch (err) {
  // Offline, or the CDN is blocked: say so inside the block host instead of
  // leaving an empty box behind.
  const box = document.getElementById('tiptap-demo');
  if (box) box.innerHTML = '<div style="padding:4px 2px;color:var(--nk-text-tertiary)">' +
    (document.documentElement.lang === 'de'
      ? 'TipTap konnte nicht von esm.sh geladen werden (offline?). Der Block-Host bleibt leer.'
      : 'TipTap could not be loaded from esm.sh (offline?). The block host stays empty.') + '</div>';
  throw err;
}
const [
  { Editor, Extension },
  { default: StarterKit },
  { default: Placeholder },
  { default: Suggestion },
  { default: TaskList },
  { default: TaskItem },
  { Plugin, PluginKey, NodeSelection },
] = mods;

const lang = document.documentElement.lang === 'de' ? 'de' : 'en';
const T = {
  en: {
    placeholder: 'Type “/” for commands …',
    basic: 'Basic blocks', lists: 'Lists', media: 'Other',
    text: ['Text', 'Plain paragraph'], h1: ['Heading 1', 'Big section heading'], h2: ['Heading 2', 'Medium heading'], h3: ['Heading 3', 'Small heading'],
    bullet: ['Bullet list', 'Simple bulleted list'], ordered: ['Numbered list', 'List with numbers'], todo: ['To-do list', 'Track tasks with a checkbox'],
    quote: ['Quote', 'Capture a quote'], code: ['Code block', 'Capture a snippet'], divider: ['Divider', 'Visually separate blocks'],
    noResults: 'No results', duplicate: 'Duplicate', del: 'Delete', turnInto: 'Turn into',
    content: '<h3>Real TipTap</h3><p>This paragraph lives inside an <code>nk-block-host</code>. Hover a block for the ＋ / ⠿ handle, drag it, select text for the bubble toolbar, or type <code>/</code> for the slash menu — every bit of the look comes from the editor adapter in notionkit.css.</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true">Mount TipTap into a block host</li><li data-type="taskItem" data-checked="false">Press / and pick a block</li></ul><blockquote>No editor CSS of its own is loaded.</blockquote>',
  },
  de: {
    placeholder: 'Tippe „/“ für Befehle …',
    basic: 'Basis-Blöcke', lists: 'Listen', media: 'Weitere',
    text: ['Text', 'Einfacher Absatz'], h1: ['Überschrift 1', 'Große Abschnitts-Überschrift'], h2: ['Überschrift 2', 'Mittlere Überschrift'], h3: ['Überschrift 3', 'Kleine Überschrift'],
    bullet: ['Aufzählung', 'Einfache Liste mit Punkten'], ordered: ['Nummerierte Liste', 'Liste mit Zahlen'], todo: ['To-do-Liste', 'Aufgaben mit Checkbox verfolgen'],
    quote: ['Zitat', 'Ein Zitat festhalten'], code: ['Code-Block', 'Ein Snippet festhalten'], divider: ['Trenner', 'Blöcke optisch trennen'],
    noResults: 'Keine Treffer', duplicate: 'Duplizieren', del: 'Löschen', turnInto: 'Umwandeln in',
    content: '<h3>Echtes TipTap</h3><p>Dieser Absatz steht in einem <code>nk-block-host</code>. Fahre über einen Block für das ＋ / ⠿-Handle, zieh ihn, markiere Text für die Bubble-Toolbar oder tippe <code>/</code> für das Slash-Menü — die Optik kommt vollständig aus dem Editor-Adapter von notionkit.css.</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true">TipTap in einen Block-Host hängen</li><li data-type="taskItem" data-checked="false">/ drücken und einen Block wählen</li></ul><blockquote>Kein editor-eigenes CSS geladen.</blockquote>',
  },
}[lang];

// ---- Slash menu items --------------------------------------------------
const ITEMS = [
  { group: 'basic', key: 'text', icon: '¶', run: c => c.setParagraph() },
  { group: 'basic', key: 'h1', icon: 'H1', run: c => c.setNode('heading', { level: 1 }) },
  { group: 'basic', key: 'h2', icon: 'H2', run: c => c.setNode('heading', { level: 2 }) },
  { group: 'basic', key: 'h3', icon: 'H3', run: c => c.setNode('heading', { level: 3 }) },
  { group: 'lists', key: 'bullet', icon: '•', run: c => c.toggleBulletList() },
  { group: 'lists', key: 'ordered', icon: '1.', run: c => c.toggleOrderedList() },
  { group: 'lists', key: 'todo', icon: '☑', run: c => c.toggleTaskList() },
  { group: 'media', key: 'quote', icon: '❝', run: c => c.toggleBlockquote() },
  { group: 'media', key: 'code', icon: '</>', run: c => c.toggleCodeBlock() },
  { group: 'media', key: 'divider', icon: '—', run: c => c.setHorizontalRule() },
];

const place = (el, left, top) => {
  el.style.left = Math.max(8, left + window.scrollX) + 'px';
  el.style.top = (top + window.scrollY) + 'px';
};

// The floating list, styled entirely by .nk-slash-menu / .nk-slash-item.
function slashRenderer() {
  // `dismissed` survives an Escape: the suggestion stays active until the
  // caret leaves the "/query", but the list must not pop back up on the
  // next keystroke. A fresh "/" starts a new session and resets it.
  let menu, items = [], index = 0, props, dismissed = false;
  const draw = () => {
    if (!menu) return;
    menu.innerHTML = '';
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'nk-slash-menu-label';
      empty.textContent = T.noResults;
      menu.appendChild(empty);
      return;
    }
    let lastGroup = null;
    items.forEach((it, i) => {
      if (it.group !== lastGroup) {
        const l = document.createElement('div');
        l.className = 'nk-slash-menu-label';
        l.textContent = T[it.group];
        menu.appendChild(l);
        lastGroup = it.group;
      }
      const row = document.createElement('div');
      row.className = 'nk-slash-item' + (i === index ? ' selected' : '');
      row.innerHTML = `<span class="m-icon">${it.icon}</span><div><div>${T[it.key][0]}</div><div class="m-desc">${T[it.key][1]}</div></div>`;
      row.addEventListener('mousedown', e => { e.preventDefault(); select(i); });
      menu.appendChild(row);
    });
    // Scroll inside the list only. scrollIntoView() would also scroll the
    // window and yank the editor out of view when the menu opens upwards.
    const sel = menu.querySelector('.selected');
    if (sel) {
      if (sel.offsetTop < menu.scrollTop) menu.scrollTop = sel.offsetTop;
      else if (sel.offsetTop + sel.offsetHeight > menu.scrollTop + menu.clientHeight)
        menu.scrollTop = sel.offsetTop + sel.offsetHeight - menu.clientHeight;
    }
  };
  const select = i => {
    const it = items[i];
    if (it) props.command(it);
  };
  const position = () => {
    const r = props.clientRect?.();
    if (!r || !menu) return;
    menu.style.maxHeight = '';
    const h = menu.offsetHeight;
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    if (h <= below) place(menu, r.left, r.bottom + 6);
    else if (h <= above) place(menu, r.left, r.top - h - 6);
    else { menu.style.maxHeight = Math.max(160, below) + 'px'; place(menu, r.left, r.bottom + 6); }
  };
  return {
    onStart(p) {
      props = p; items = p.items; index = 0; dismissed = false;
      menu = document.createElement('div');
      menu.className = 'nk-slash-menu';
      menu.style.position = 'absolute';
      menu.style.zIndex = '120';
      document.body.appendChild(menu);
      draw(); position();
    },
    onUpdate(p) { props = p; items = p.items; index = 0; if (!dismissed) { draw(); position(); } },
    onKeyDown({ event }) {
      if (dismissed) return false;
      if (event.key === 'ArrowDown') { index = (index + 1) % Math.max(items.length, 1); draw(); return true; }
      if (event.key === 'ArrowUp') { index = (index - 1 + items.length) % Math.max(items.length, 1); draw(); return true; }
      if (event.key === 'Enter') { select(index); return true; }
      if (event.key === 'Escape') { menu?.remove(); menu = null; dismissed = true; return true; }
      return false;
    },
    onExit() { menu?.remove(); menu = null; },
  };
}

const SlashCommand = Extension.create({
  name: 'nkSlashCommand',
  addProseMirrorPlugins() {
    return [Suggestion({
      editor: this.editor,
      char: '/',
      allowSpaces: false,
      items: ({ query }) => {
        const q = query.toLowerCase();
        return ITEMS.filter(it => !q || T[it.key][0].toLowerCase().includes(q) || it.key.includes(q));
      },
      command: ({ editor, range, props }) => props.run(editor.chain().focus().deleteRange(range)).run(),
      render: slashRenderer,
    })];
  },
});

// ---- Bubble toolbar ----------------------------------------------------
function mountBubbleMenu(editor) {
  const bar = document.createElement('div');
  bar.className = 'nk-bubble-menu';
  bar.style.cssText = 'position:absolute;z-index:120;display:none';
  const buttons = [
    ['<b>B</b>', 'bold', c => c.toggleBold()],
    ['<i>I</i>', 'italic', c => c.toggleItalic()],
    ['<s>S</s>', 'strike', c => c.toggleStrike()],
    ['&lt;/&gt;', 'code', c => c.toggleCode()],
    ['H2', ['heading', { level: 2 }], c => c.toggleHeading({ level: 2 })],
    ['❝', 'blockquote', c => c.toggleBlockquote()],
  ].map(([label, active, run]) => {
    const b = document.createElement('button');
    b.innerHTML = label;
    b.addEventListener('mousedown', e => { e.preventDefault(); run(editor.chain().focus()).run(); });
    b._active = active;
    bar.appendChild(b);
    return b;
  });
  document.body.appendChild(bar);

  const update = () => {
    const { state, view } = editor;
    const { from, to, empty } = state.selection;
    const show = !empty && view.hasFocus() && !editor.isActive('codeBlock') && state.doc.textBetween(from, to).trim();
    if (!show) { bar.style.display = 'none'; return; }
    buttons.forEach(b => b.classList.toggle('active', Array.isArray(b._active) ? editor.isActive(...b._active) : editor.isActive(b._active)));
    bar.style.display = 'flex';
    const a = view.coordsAtPos(from), b = view.coordsAtPos(to);
    const left = (Math.min(a.left, b.left) + Math.max(a.right, b.right)) / 2 - bar.offsetWidth / 2;
    place(bar, left, Math.min(a.top, b.top) - bar.offsetHeight - 8);
  };
  editor.on('selectionUpdate', update);
  editor.on('transaction', update);
  editor.on('blur', () => setTimeout(() => { if (!editor.view.hasFocus()) bar.style.display = 'none'; }, 120));
}

// ---- Block handle (＋ / ⠿) with drag & drop and a block menu ------------
class BlockHandleView {
  constructor(view, editor) {
    this.view = view; this.editor = editor;
    this.host = view.dom.closest('.nk-block-host') || view.dom.parentElement;
    this.pos = null;

    this.el = document.createElement('div');
    this.el.className = 'nk-block-actions';
    this.el.innerHTML = '<button class="add" type="button" title="＋">＋</button><button class="drag" type="button" draggable="true" title="⠿">⠿</button>';
    this.host.appendChild(this.el);

    this.onMove = this.onMove.bind(this);
    this.onLeave = () => this.hide();
    this.host.addEventListener('mousemove', this.onMove);
    this.host.addEventListener('mouseleave', this.onLeave);

    this.el.querySelector('.add').addEventListener('click', () => this.addBelow());
    const drag = this.el.querySelector('.drag');
    drag.addEventListener('dragstart', e => this.dragStart(e));
    drag.addEventListener('click', e => this.openMenu(e));
  }

  block() {
    if (this.pos == null) return null;
    const node = this.view.state.doc.nodeAt(this.pos);
    return node ? { node, pos: this.pos, end: this.pos + node.nodeSize } : null;
  }

  onMove(e) {
    if (e.target.closest('.nk-block-actions')) return;
    const found = this.view.posAtCoords({ left: e.clientX + 24, top: e.clientY });
    if (!found) return this.hide();
    const $pos = this.view.state.doc.resolve(found.inside >= 0 ? found.inside : found.pos);
    if ($pos.depth === 0 && found.inside < 0) return this.hide();
    const pos = $pos.depth === 0 ? found.inside : $pos.before(1);
    const dom = this.view.nodeDOM(pos);
    if (!(dom instanceof HTMLElement)) return this.hide();
    this.pos = pos;
    const r = dom.getBoundingClientRect(), h = this.host.getBoundingClientRect();
    const lineTop = parseFloat(getComputedStyle(dom).paddingTop) || 0;
    this.el.style.top = (r.top - h.top + lineTop + 1) + 'px';
    this.el.style.left = (r.left - h.left - 46) + 'px';
    this.el.classList.add('show');
  }

  hide() { this.el.classList.remove('show'); }

  addBelow() {
    const b = this.block(); if (!b) return;
    this.editor.chain().focus()
      .insertContentAt(b.end, { type: 'paragraph' })
      .setTextSelection(b.end + 1)
      .insertContent('/')
      .run();
  }

  dragStart(e) {
    const b = this.block(); if (!b) return e.preventDefault();
    const sel = NodeSelection.create(this.view.state.doc, b.pos);
    this.view.dispatch(this.view.state.tr.setSelection(sel));
    this.view.dragging = { slice: sel.content(), move: true };
    const dom = this.view.nodeDOM(b.pos);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', dom.outerHTML);
    e.dataTransfer.setDragImage(dom, 0, 0);
    this.menu?.remove();
  }

  openMenu(e) {
    const b = this.block(); if (!b) return;
    this.menu?.remove();
    const m = document.createElement('div');
    m.className = 'nk-pop nk-menu';
    m.style.cssText = 'position:absolute;z-index:120';
    m.innerHTML = `
      <div class="nk-menu-item" data-act="duplicate"><span class="m-icon">📄</span>${T.duplicate}<span class="m-shortcut">⌘D</span></div>
      <div class="nk-menu-sep"></div>
      <div class="nk-menu-item danger" data-act="delete"><span class="m-icon">🗑</span>${T.del}<span class="m-shortcut">Del</span></div>`;
    m.addEventListener('mousedown', ev => ev.preventDefault());
    m.addEventListener('click', ev => {
      const act = ev.target.closest('[data-act]')?.dataset.act;
      if (act === 'duplicate') this.editor.chain().focus().insertContentAt(b.end, b.node.toJSON()).run();
      if (act === 'delete') this.editor.chain().focus().deleteRange({ from: b.pos, to: b.end }).run();
      close();
    });
    document.body.appendChild(m);
    const r = e.currentTarget.getBoundingClientRect();
    place(m, r.left, r.bottom + 4);
    const close = () => { m.remove(); document.removeEventListener('mousedown', outside, true); document.removeEventListener('keydown', esc); };
    const outside = ev => { if (!m.contains(ev.target)) close(); };
    const esc = ev => { if (ev.key === 'Escape') close(); };
    setTimeout(() => { document.addEventListener('mousedown', outside, true); document.addEventListener('keydown', esc); });
    this.menu = m;
  }

  destroy() {
    this.host.removeEventListener('mousemove', this.onMove);
    this.host.removeEventListener('mouseleave', this.onLeave);
    this.el.remove(); this.menu?.remove();
  }
}

const BlockHandle = Extension.create({
  name: 'nkBlockHandle',
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [new Plugin({ key: new PluginKey('nkBlockHandle'), view: v => new BlockHandleView(v, editor) })];
  },
});

// ---- Mount ----------------------------------------------------------------
const host = document.getElementById('tiptap-demo');
if (host) {
  // Markup already inside the host becomes the initial document, so a page
  // can ship its editor content server-side and still get the live editor.
  const initial = host.innerHTML.trim() || T.content;
  host.innerHTML = '';
  const editor = new Editor({
    element: host,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: T.placeholder }),
      SlashCommand,
      BlockHandle,
    ],
    content: initial,
  });
  mountBubbleMenu(editor);
  window.nkEditor = editor;
}
