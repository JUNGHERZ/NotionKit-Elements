import { NkElement } from '../../base.js';

// <nk-image-picker initials="MK" label="Profile picture"></nk-image-picker>
// <nk-image-picker square initials="M" max="256" type="image/png"></nk-image-picker>
// → <div class="nk-profile-row"><div class="big-avatar">MK | <img></div>
//     <div class="pr-actions"><button class="nk-btn secondary small">Upload image</button>
//       <button class="nk-btn secondary small pr-remove">Remove</button><input type="file" hidden></div></div>
//
// A picture for a person or a workspace (NotionKit 1.8.0): the profile row
// with its actions, round – or `square`, a workspace icon. Ported from
// GlassKit Elements' glk-image-picker: the file goes through
// createImageBitmap with imageOrientation 'from-image' – the EXIF rotation
// of a phone photo without a library – onto a canvas no larger than `max`
// (default 512), out as `type` (default image/jpeg, on white; image/png
// keeps transparency) at `quality` (0.82). The file input is hidden and
// opened from a real button, and cleared after every pick, so the same file
// can be chosen again. Not form-associated: listen to nk-change and upload
// the data URL. `src` set as a property is not reflected, so megabytes of
// data URL never land in the DOM.
// Events: nk-change { dataUrl, width, height, size } after a pick, and on
//         remove with an empty dataUrl; nk-error { message, name } when the
//         file cannot be decoded (HEIC outside Safari, a broken file).
// Texts:  choose-label, change-label, remove-label; label names the group.

function dataUrlBytes(url) {
  const b64 = url.slice(url.indexOf(',') + 1);
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

class NkImagePicker extends NkElement {
  static get observedAttributes() { return ['src', 'initials', 'square', 'label', 'max', 'type', 'quality', 'accept', 'choose-label', 'change-label', 'remove-label']; }

  render() {
    this._src ??= this.getAttribute('src') || '';
    this._row = this.createElement('div', ['nk-profile-row'], { role: 'group' });
    this._avatar = this.createElement('div', ['big-avatar']);
    const actions = this.createElement('div', ['pr-actions']);
    this._choose = this.createElement('button', ['nk-btn', 'secondary', 'small'], { type: 'button' });
    this._remove = this.createElement('button', ['nk-btn', 'secondary', 'small', 'pr-remove'], { type: 'button' });
    this._input = this.createElement('input', [], { type: 'file', tabindex: '-1' });
    this._input.hidden = true;
    actions.append(this._choose, this._remove, this._input);
    this._row.append(this._avatar, actions);
    this._wrapper.appendChild(this._row);
    this._sync();
  }

  get _max() { return Math.max(1, Math.floor(Number(this.getAttribute('max'))) || 512); }
  get _type() { return this.getAttribute('type') || 'image/jpeg'; }
  get _quality() { const q = Number(this.getAttribute('quality')); return this.hasAttribute('quality') && q >= 0 && q <= 1 ? q : 0.82; }

  _sync() {
    if (!this._row) return;
    this._avatar.classList.toggle('square', this.getBoolAttr('square'));
    if (!this._src) {
      this._img = null;
      this._avatar.textContent = this.getAttribute('initials') || '';
    } else if (!this._img || this._img.getAttribute('src') !== this._src) {
      this._img = this.createElement('img', [], { src: this._src, alt: '' });
      this._avatar.replaceChildren(this._img);
    }
    const label = this.getAttribute('label');
    if (label) this._row.setAttribute('aria-label', label); else this._row.removeAttribute('aria-label');
    this._choose.textContent = this._src ? (this.getAttribute('change-label') || 'Change image') : (this.getAttribute('choose-label') || 'Upload image');
    this._remove.textContent = this.getAttribute('remove-label') || 'Remove';
    this._remove.hidden = !this._src;
    this._input.accept = this.getAttribute('accept') || 'image/*';
  }

  async _pick(file) {
    if (!file) return;
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const scale = Math.min(1, this._max / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      if (this._type === 'image/jpeg') {
        // JPEG has no alpha; without this a transparent PNG comes out on black.
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const dataUrl = canvas.toDataURL(this._type, this._quality);
      this.src = dataUrl;
      this.emit('nk-change', { dataUrl, width: canvas.width, height: canvas.height, size: dataUrlBytes(dataUrl) });
    } catch (error) {
      this.emit('nk-error', { message: error?.message || String(error), name: file.name });
    }
  }

  setupEvents() {
    this._onChoose = () => this._input.click();
    this._onChange = (e) => { const file = e.target.files?.[0]; e.target.value = ''; this._pick(file); };
    this._onRemove = () => {
      this.src = '';
      this._choose.focus();   // the remove button just went away under the focus
      this.emit('nk-change', { dataUrl: '', width: 0, height: 0, size: 0 });
    };
    this._choose.addEventListener('click', this._onChoose);
    this._input.addEventListener('change', this._onChange);
    this._remove.addEventListener('click', this._onRemove);
  }

  teardownEvents() {
    this._choose?.removeEventListener('click', this._onChoose);
    this._input?.removeEventListener('change', this._onChange);
    this._remove?.removeEventListener('click', this._onRemove);
  }

  onAttributeChanged(name, _old, value) {
    if (name === 'src') this._src = value || '';
    this._sync();
  }

  /** Opens the file dialog, as the button does. */
  choose() { this._input?.click(); }
  get src() { return this._src ?? this.getAttribute('src') ?? ''; }
  set src(v) { this._src = v || ''; this._sync(); }
  get square() { return this.getBoolAttr('square'); }
  set square(v) { this.setBoolAttr('square', v); }
}

customElements.define('nk-image-picker', NkImagePicker);
export { NkImagePicker };
