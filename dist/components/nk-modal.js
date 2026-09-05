import { N as NkElement } from './shared/base-6gEcoatG.js';
import { l as lockScroll, i as inertOutside, f as firstFocusable, u as unlockScroll } from './shared/focus-DXrK9oLe.js';

// <nk-modal id="settings">
//   <nk-settings-user slot="user" name="…" mail="…"></nk-settings-user>
//   <nk-settings-pane name="profile" group="Account" icon="👤" label="My profile" title="My profile" active>…</nk-settings-pane>
//   <nk-settings-pane name="members" group="Workspace" icon="👥" label="Members" title="Members">…</nk-settings-pane>
// </nk-modal>
// → <div class="nk-modal-backdrop open"><div class="nk-modal" role="dialog">
//     <nav class="nk-settings-nav">…user… section labels + tree rows…</nav>
//     <div class="nk-settings-content">…panes…</div></div></div>
//
// The modal renders the nav rows itself from the panes' label/icon/group, so
// `.nk-settings-nav .nk-tree-item` and the 860px icon-rail rules match with
// no JS breakpoint. Escape and the backdrop close it; focus moves in and
// back out; the page behind is scroll-locked and inert. Put the element
// directly under <body>: a transformed ancestor would trap the fixed backdrop.
class NkModal extends NkElement {
  static get observedAttributes() { return ['open', 'pane']; }

  render() {
    this._backdrop = this.createElement('div', ['nk-modal-backdrop']);
    this._backdrop.inert = true;
    this._box = this.createElement('div', ['nk-modal'], { role: 'dialog', 'aria-modal': 'true', tabindex: '-1' });
    this._nav = this.createElement('nav', ['nk-settings-nav'], { 'aria-label': 'Settings' });
    this._nav.appendChild(this.createElement('slot', [], { name: 'user' }));
    this._rows = document.createElement('div');
    this._nav.appendChild(this._rows);
    this._nav.appendChild(this.createElement('slot', [], { name: 'nav' }));
    this._content = this.createElement('div', ['nk-settings-content']);
    this._slot = document.createElement('slot');
    this._content.appendChild(this._slot);
    this._box.append(this._nav, this._content);
    this._backdrop.appendChild(this._box);
    this._wrapper.appendChild(this._backdrop);
    this._syncOpen();
    this.requestNav();
  }

  get panes() { return [...this.querySelectorAll(':scope > nk-settings-pane')]; }

  /** Rebuilds the nav from the panes (debounced – panes upgrade after the modal). */
  requestNav() {
    if (this._navQueued) return;
    this._navQueued = true;
    queueMicrotask(() => { this._navQueued = false; this._buildNav(); });
  }

  _buildNav() {
    if (!this._rows) return;
    const panes = this.panes;
    const labelled = panes.filter(p => p.getAttribute('label'));
    this._rows.replaceChildren();
    this._nav.style.display = (labelled.length || this.querySelector(':scope > [slot="nav"], :scope > [slot="user"]')) ? '' : 'none';
    let lastGroup = null;
    for (const pane of labelled) {
      const group = pane.getAttribute('group');
      if (group && group !== lastGroup) {
        const label = this.createElement('div', ['nk-section-label']);
        label.textContent = group;
        this._rows.appendChild(label);
        lastGroup = group;
      }
      const row = this.createElement('div', ['nk-tree-item'], { role: 'tab', tabindex: '0', 'data-pane': pane.name });
      const icon = this.createElement('span', ['icon']);
      icon.textContent = pane.getAttribute('icon') || '';
      const text = this.createElement('span', ['label']);
      text.textContent = pane.getAttribute('label');
      row.append(icon, text);
      this._rows.appendChild(row);
    }
    this._syncActive();
  }

  /** Marks the active pane and its nav row without rebuilding the rows (keeps focus). */
  _syncActive() {
    const panes = this.panes;
    let current = this.getAttribute('pane');
    if (!panes.some(p => p.name === current)) current = (panes.find(p => p.hasAttribute('active')) || panes[0])?.name ?? null;
    for (const row of this._rows.querySelectorAll('[data-pane]')) {
      const on = row.dataset.pane === current;
      row.classList.toggle('active', on);
      row.setAttribute('aria-selected', on ? 'true' : 'false');
    }
    for (const pane of panes) pane.active = pane.name === current;
    this._current = current;
  }

  _syncOpen() {
    const open = this.getBoolAttr('open');
    this._backdrop.classList.toggle('open', open);
    this._backdrop.inert = !open;
    if (open === this._wasOpen) return;
    this._wasOpen = open;
    if (open) {
      this._returnFocus = document.activeElement;
      lockScroll();
      this._undoInert = inertOutside(this);
      requestAnimationFrame(() => {
        const target = this._rows.querySelector('.nk-tree-item.active') || firstFocusable(this) || this._box;
        target.focus({ preventScroll: true });
      });
    } else {
      unlockScroll();
      this._undoInert?.(); this._undoInert = null;
      const back = this._returnFocus;
      if (back && typeof back.focus === 'function' && back.isConnected) back.focus({ preventScroll: true });
      this._returnFocus = null;
    }
  }

  setupEvents() {
    this._onBackdrop = (e) => { if (e.target === this._backdrop) this.close(); };
    this._onKey = (e) => { if (e.key === 'Escape' && this.getBoolAttr('open')) { e.stopPropagation(); this.close(); } };
    this._onNavClick = (e) => { const row = e.target.closest('[data-pane]'); if (row) { row.focus(); this.pane = row.dataset.pane; } };
    this._onNavKey = (e) => {
      const row = e.target.closest?.('[data-pane]');
      if (!row) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.pane = row.dataset.pane; return; }
      const dir = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      const rows = [...this._rows.querySelectorAll('[data-pane]')];
      const next = rows[(rows.indexOf(row) + dir + rows.length) % rows.length];
      e.preventDefault(); next.focus(); this.pane = next.dataset.pane;
    };
    this._onSlot = () => this.requestNav();
    this._backdrop.addEventListener('click', this._onBackdrop);
    document.addEventListener('keydown', this._onKey);
    this._rows.addEventListener('click', this._onNavClick);
    this._rows.addEventListener('keydown', this._onNavKey);
    this._slot.addEventListener('slotchange', this._onSlot);
  }

  teardownEvents() {
    this._backdrop?.removeEventListener('click', this._onBackdrop);
    document.removeEventListener('keydown', this._onKey);
    this._rows?.removeEventListener('click', this._onNavClick);
    this._rows?.removeEventListener('keydown', this._onNavKey);
    this._slot?.removeEventListener('slotchange', this._onSlot);
    if (this._wasOpen) { unlockScroll(); this._undoInert?.(); this._undoInert = null; this._wasOpen = false; }
  }

  onAttributeChanged(name) {
    if (name === 'open') {
      this._syncOpen();
      this.emit('nk-toggle', { open: this.getBoolAttr('open') });
    } else if (name === 'pane') {
      const before = this._current;
      this._syncActive();
      if (this._current !== before) this.emit('nk-select', { value: this._current, label: this.panes.find(p => p.name === this._current)?.getAttribute('label') ?? this._current });
    }
  }

  show(pane) { if (pane) this.setAttribute('pane', pane); this.setBoolAttr('open', true); }
  close() { this.setBoolAttr('open', false); }
  toggle() { this.setBoolAttr('open', !this.getBoolAttr('open')); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
  get pane() { return this._current ?? this.getAttribute('pane'); }
  set pane(v) { this.setAttribute('pane', v); }
}

customElements.define('nk-modal', NkModal);

export { NkModal };
