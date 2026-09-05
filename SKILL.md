---
name: notionkit-elements
description: NotionKit Elements is a vanilla-JS Web Components library (v1.0.1) wrapping NotionKit CSS v1.1.1 – the calm, document-centric design system in the Notion idiom. 68 custom elements with the `nk-` prefix, Shadow DOM, automatic light/dark sync via data-theme on <html>, and form-associated controls. Use this reference whenever generating HTML that uses <nk-*> tags to get attributes, slots, events and composition right.
---

# NotionKit Elements – AI Component Reference

> Machine-readable reference for generating correct `<nk-*>` markup. The class-based companion (`.nk-*`) is documented in the NotionKit CSS SKILL.md at https://notionkit.jungherz.com/SKILL.md – every element here has the same word stem as its class.

# 1. Setup & Boilerplate

## Prerequisites (always)

1. Load **notionkit.css** on the document (it is the peer dependency) and put `class="nk-body"` on `<body>`. Shadow roots inherit font, colour and the scoped reset from there; the elements ship no visual CSS of their own.
2. Load the elements bundle **once**. It also injects the design tokens as a cascade layer (`@layer notionkit-defaults`), so your own unlayered `:root { --nk-* }` always wins.
3. Theme: `data-theme="light|dark"` on `<html>` only.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.1.1/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.0.1/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
  <nk-btn variant="primary">Save</nk-btn>
</body>
</html>
```

## npm

```bash
npm install @jungherz-de/notionkit-elements @jungherz-de/notionkit
```

```js
import '@jungherz-de/notionkit/notionkit.css';     // via your bundler, or a <link>
import '@jungherz-de/notionkit-elements';           // registers every <nk-*> tag
// or one element at a time (shared code is one extra chunk):
import '@jungherz-de/notionkit-elements/components/nk-btn.js';
```


# 2. Core Concepts

| Concept | Rule |
|---|---|
| Tag prefix | Every element is `<nk-*>`; the word stem equals the CSS class (`.nk-callout` ↔ `<nk-callout>`). |
| Modifiers | A modifier class becomes an attribute: `.nk-btn.primary` → `<nk-btn variant="primary">`, `.nk-tag.green` → `<nk-tag color="green">`. |
| States | A state class becomes a boolean attribute: `.active`, `.open`, `.selected`, `checked`. Set the attribute (or property) – never reach into the shadow root. |
| Rendering | Open Shadow DOM. The shadow root adopts the NotionKit *component* sheet only; tokens are inherited from the document. |
| Hosts | Every host is `display: contents` – no box of its own, the inner `.nk-*` element sits in the parent layout exactly like the class markup. Style the parent or the tokens, never the host; `hidden` on the host works. |
| Theme | One MutationObserver watches `data-theme` on `<html>` and mirrors it into every element. Nothing else switches themes. |
| Branding | Declare `--nk-*` tokens on `:root` in any plain stylesheet; every element follows in both themes. |
| Data | Static content via attributes and slots; dynamic data via JS properties (`tree.data`, `database.rows`, `cmdk.commands`). No fetching, no two-way binding. |
| Events | Custom events with fixed names (`nk-select`, `nk-change`, `nk-view-change`, `nk-command`, `nk-toggle`, `nk-submit`, `nk-action`). All bubble and are composed; payload in `event.detail`. |
| Forms | Controls are form-associated: FormData, reset, `required`, `<fieldset disabled>` work inside a `<form>`. |
| Icons | `::slotted()` only matches the assigned node. Pass an icon as the slotted node itself – `<span slot="icon">📁</span>` – never wrapped. |
| Light-DOM children | Elements that copy children (`nk-select` options, breadcrumb crumbs) watch them; `element.refresh()` is the escape hatch. The empty string is a valid value. |
| Moving elements | An element moved in the DOM keeps working – listeners and theme registration are re-armed on every connect. |
| Attributes are live | Every documented attribute re-renders when changed after connect (`stat.setAttribute('value', '129')`, `el.open = true`); properties reflect to attributes where a setter is listed. |


# 3. Element Catalog (68 elements)

## Forms & controls (wave 1)

### 3.1 `<nk-btn>` – Button

Renders `button.nk-btn`, or `a.nk-btn` when `href` is set. Modifier classes become attributes. A slotted `<svg>` is sized by the stylesheet – pass it directly, never wrapped.

```html
<nk-btn variant="primary">Save</nk-btn>
<nk-btn variant="secondary">Cancel</nk-btn>
<nk-btn variant="danger" small>Delete</nk-btn>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `variant` | primary | secondary | danger | danger-solid | topbar | share | – | Visual variant. `topbar` and `share` render `.nk-topbar-btn` for the top bar. |
| `small` | boolean | – | Compact padding and 12.5px text. |
| `disabled` | boolean | – | Disabled; clicks are swallowed. |
| `type` | button | submit | reset | `button` | For `submit`/`reset` the surrounding `<form>` is submitted or reset. |
| `href` | URL | – | Renders a link instead of a button. |

**Slots:** `(default)` – Label text and an optional `<svg>` icon.

**Events:** `click` `(native, composed)` – The native click bubbles out of the shadow root.

**Replaces:** `.nk-btn`, `.primary`, `.secondary`, `.danger`, `.danger-solid`, `.small`, `.nk-topbar-btn`, `.nk-share-btn`

```html
<!-- equivalent class markup -->
<button class="nk-btn primary">Save</button>
<button class="nk-btn secondary">Cancel</button>
<button class="nk-btn danger small">Delete</button>
```

**Small screens:** Unchanged. The button grows with its label; combine with `small` in dense toolbars.

### 3.2 `<nk-input>` – Input

A native `<input>` inside the shadow root, wired into the surrounding form through ElementInternals: FormData, reset and `required` validation work as with a plain input.

```html
<nk-input name="name" value="Ada Lovelace" placeholder="Display name"></nk-input>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | Current value; also the reset value. |
| `type` | text | email | password | number | date | … | `text` | Forwarded to the native input. |
| `placeholder` | string | – | Placeholder text. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `required` | boolean | – | Marks the field required; validity is mirrored onto the host. |
| `readonly` | boolean | – | Read-only. |
| `wide` | boolean | – | Full width (`.wide`). |

**Events:** `nk-change` `{ value, name }` – Fired on commit (blur/Enter), like the native change event. · `nk-input` `{ value, name }` – Fired on every keystroke.

**Properties:** `value`, `name`, `disabled`, `required`, `form`, `validity` · **Methods:** `focus()`, `blur()`, `select()`, `checkValidity()`, `reportValidity()`

**Replaces:** `.nk-input`, `.wide`

```html
<!-- equivalent class markup -->
<input class="nk-input" name="name" value="Ada Lovelace" placeholder="Display name">
```

**Small screens:** Minimum width 210px; use `wide` to fill the row.

### 3.3 `<nk-textarea>` – Textarea

Multi-line sibling of `nk-input`. The initial value is the `value` attribute or the element’s text content.

```html
<nk-textarea name="bio" rows="3" placeholder="A sentence about you"></nk-textarea>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | Current value. |
| `placeholder` | string | – | Placeholder text. |
| `rows` | number | – | Visible rows. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `required` | boolean | – | Required field. |
| `wide` | boolean | – | Full width. |

**Slots:** `(default)` – Initial text (used when `value` is absent).

**Events:** `nk-change` `{ value, name }` – On commit. · `nk-input` `{ value, name }` – On every keystroke.

**Replaces:** `.nk-textarea`, `.wide`

```html
<!-- equivalent class markup -->
<textarea class="nk-textarea" name="bio" rows="3" placeholder="A sentence about you"></textarea>
```

**Small screens:** Resizes vertically only; `wide` fills the row.

### 3.4 `<nk-select>` – Select

Light-DOM `<option>` and `<optgroup>` children are copied into the shadow `<select>` and kept in step when a framework swaps them. The empty string is a valid value; a `value` naming no option leaves the selection alone.

```html
<nk-select name="role" value="editor">
  <option value="viewer">Viewer</option>
  <option value="editor">Editor</option>
  <option value="admin">Admin</option>
</nk-select>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | Selected value. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `required` | boolean | – | Required field. |
| `compact` | boolean | – | 120px minimum width (`.compact`), e.g. inside a member row. |

**Slots:** `(default)` – `<option>` / `<optgroup>` children – direct children only.

**Events:** `nk-change` `{ value, name }` – On selection.

**Properties:** `value`, `selectedIndex`, `options` · **Methods:** `refresh()`

**Replaces:** `.nk-select`, `.compact`

```html
<!-- equivalent class markup -->
<select class="nk-select" name="role">
  <option value="viewer">Viewer</option>
  <option value="editor" selected>Editor</option>
  <option value="admin">Admin</option>
</select>
```

**Small screens:** Uses the native picker of the platform (`color-scheme` follows the theme).

### 3.5 `<nk-switch>` – Switch

Renders `button.nk-switch[role=switch]`; the stylesheet keys the knob on `aria-checked`, the element does the toggling. Submits `value` (default `on`) when checked, nothing otherwise – like a checkbox.

```html
<nk-switch name="notify" checked label="Email notifications"></nk-switch>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `checked` | boolean | – | On/off state. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `value` | string | `on` | Submitted value when checked. |
| `label` | string | – | Accessible name (`aria-label`). |

**Events:** `nk-change` `{ checked, value, name }` – On toggle.

**Methods:** `toggle()`

**Replaces:** `.nk-switch`

```html
<!-- equivalent class markup -->
<button class="nk-switch" role="switch" aria-checked="true" aria-label="Email notifications"></button>
```

**Small screens:** 34×20px – below the 44px touch target. Give it a label row (`nk-field`) to enlarge the hit area.

### 3.6 `<nk-check>` – Checkbox

A `label.nk-check` with a custom-drawn checkbox; the label text is slotted, so clicking it toggles the box.

```html
<nk-check name="digest" value="weekly" checked>Weekly digest</nk-check>
<nk-check name="digest" value="mentions">Mentions only</nk-check>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `checked` | boolean | – | Checked state. |
| `indeterminate` | boolean | – | Mixed state (cleared on the next click). |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `value` | string | `on` | Submitted value. |
| `required` | boolean | – | Must be checked to submit. |

**Slots:** `(default)` – Label text.

**Events:** `nk-change` `{ checked, value, name }` – On toggle.

**Replaces:** `.nk-check`

```html
<!-- equivalent class markup -->
<label class="nk-check"><input type="checkbox" name="digest" value="weekly" checked>Weekly digest</label>
<label class="nk-check"><input type="checkbox" name="digest" value="mentions">Mentions only</label>
```

**Small screens:** Row height ~24px; the whole label is the hit area.

### 3.7 `<nk-radio>` – Radio

Same optics as `nk-check` with a round mark. Radios with the same `name` in the same tree and form form one group – across shadow roots, which native radios cannot do. One tab stop per group; arrow keys move, wrap and skip disabled entries. There is deliberately no `nk-radio-group`.

```html
<nk-radio name="style" value="concise">Concise</nk-radio>
<nk-radio name="style" value="balanced" checked>Balanced</nk-radio>
<nk-radio name="style" value="detailed">Detailed</nk-radio>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `checked` | boolean | – | Selected; the last checked radio in markup wins. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `value` | string | – | Submitted value. |
| `required` | boolean | – | One of the group must be selected. |

**Slots:** `(default)` – Label text.

**Events:** `nk-change` `{ checked, value, name }` – On selection, also via arrow keys.

**Replaces:** `.nk-check`

```html
<!-- equivalent class markup -->
<label class="nk-check"><input type="radio" name="style" value="concise">Concise</label>
<label class="nk-check"><input type="radio" name="style" value="balanced" checked>Balanced</label>
<label class="nk-check"><input type="radio" name="style" value="detailed">Detailed</label>
```

**Small screens:** As `nk-check`.

### 3.8 `<nk-slider>` – Slider

A range input with `accent-color` from the tokens, plus an optional value readout below.

```html
<nk-slider name="size" min="12" max="18" value="14" unit="px" show-value></nk-slider>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | number | – | Current value. |
| `min` | number | – | Minimum. |
| `max` | number | – | Maximum. |
| `step` | number | – | Step. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `show-value` | boolean | – | Shows the value below the slider. |
| `unit` | string | – | Suffix for the readout (e.g. `px`). |

**Events:** `nk-change` `{ value, name }` – On release. · `nk-input` `{ value, name }` – While dragging.

**Replaces:** `.nk-slider`, `.nk-slider-value`

```html
<!-- equivalent class markup -->
<input type="range" class="nk-slider" name="size" min="12" max="18" value="14"><div class="nk-slider-value">14px</div>
```

**Small screens:** 210px wide; the native thumb is touch-sized by the platform.

### 3.9 `<nk-field>` – Field row

The settings row: label and description left, control right. Put any control – `nk-input`, `nk-switch`, `nk-select` – in the default slot.

```html
<nk-field label="Display name" desc="Shown next to your comments.">
  <nk-input value="Ada Lovelace"></nk-input>
</nk-field>
<nk-field label="Email notifications">
  <nk-switch checked></nk-switch>
</nk-field>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `label` | string | – | Label text. |
| `desc` | string | – | Secondary description. |

**Slots:** `(default)` – The control. · `label` – Rich label content (instead of the attribute). · `desc` – Rich description.

**Replaces:** `.nk-field`, `.f-label`, `.f-desc`, `.f-control`

```html
<!-- equivalent class markup -->
<div class="nk-field">
  <div><div class="f-label">Display name</div><div class="f-desc">Shown next to your comments.</div></div>
  <div class="f-control"><input class="nk-input" value="Ada Lovelace"></div>
</div>
<div class="nk-field">
  <div><div class="f-label">Email notifications</div></div>
  <div class="f-control"><button class="nk-switch" role="switch" aria-checked="true"></button></div>
</div>
```

**Small screens:** Stays a row; long descriptions wrap under the label.

## Content elements (wave 1)

### 3.10 `<nk-tag>` – Tag

Semantic status tag. The colour modifier class becomes the `color` attribute; each pair is tuned per theme.

```html
<nk-tag color="blue">In progress</nk-tag> <nk-tag color="green">Done</nk-tag> <nk-tag color="orange">Planned</nk-tag> <nk-tag color="purple">Design</nk-tag>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `color` | blue | green | orange | purple | – | Colour pair. |

**Slots:** `(default)` – Tag text.

**Replaces:** `.nk-tag`, `.blue`, `.green`, `.orange`, `.purple`

```html
<!-- equivalent class markup -->
<span class="nk-tag blue">In progress</span> <span class="nk-tag green">Done</span> <span class="nk-tag orange">Planned</span> <span class="nk-tag purple">Design</span>
```

**Small screens:** Unchanged.

### 3.11 `<nk-progress>` – Progress

A 60px bar with an optional label. `value`/`max` set the fill; the bar carries `role="progressbar"`.

```html
<nk-progress value="72" label="72%"></nk-progress>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | number | `0` | Current value. |
| `max` | number | `100` | Maximum. |
| `label` | string | – | Text after the bar. |



**Replaces:** `.nk-progress`, `.nk-progress-label`

```html
<!-- equivalent class markup -->
<span class="nk-progress"><i style="width:72%"></i></span><span class="nk-progress-label">72%</span>
```

**Small screens:** Unchanged.

### 3.12 `<nk-callout>` – Callout

One thought that must not be missed. The icon comes from the `icon` attribute or a `slot="icon"` node – the node itself, never wrapped.

```html
<nk-callout icon="💡"><b>Core idea:</b> A callout carries one thought that must not be missed.</nk-callout>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | `💡` | Emoji or text icon. |

**Slots:** `(default)` – Body. · `icon` – Icon node (e.g. `<span slot="icon">📌</span>`).

**Replaces:** `.nk-callout`, `.c-icon`

```html
<!-- equivalent class markup -->
<div class="nk-callout"><span class="c-icon">💡</span><div><b>Core idea:</b> A callout carries one thought that must not be missed.</div></div>
```

**Small screens:** Unchanged; wraps with the text.

### 3.13 `<nk-divider>` – Divider

A hairline `<hr>` with block spacing.

```html
<nk-divider></nk-divider>
```

_No attributes._



**Replaces:** `.nk-divider`

```html
<!-- equivalent class markup -->
<hr class="nk-divider">
```

**Small screens:** Unchanged.

### 3.14 `<nk-heading>` – Heading

A section heading. `level` chooses the real heading element (h1–h4), so the document outline stays honest.

```html
<nk-heading>Section heading</nk-heading>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `level` | 1 | 2 | 3 | 4 | `2` | Heading level. |

**Slots:** `(default)` – Heading text.

**Replaces:** `.nk-heading`

```html
<!-- equivalent class markup -->
<h2 class="nk-heading">Section heading</h2>
```

**Small screens:** Unchanged.

### 3.15 `<nk-toggle>` – Toggle block

A `<details>` block. The summary is rendered inside the element (its marker is a pseudo-element and cannot be styled on slotted content); the body is slotted.

```html
<nk-toggle label="Details" open>Folded content lives here.</nk-toggle>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `label` | string | – | Summary text. |
| `open` | boolean | – | Expanded state, reflected both ways. |

**Slots:** `(default)` – Folded content. · `label` – Rich summary content.

**Events:** `nk-toggle` `{ open }` – On open/close.

**Replaces:** `.nk-toggle`, `.toggle-body`

```html
<!-- equivalent class markup -->
<details class="nk-toggle" open><summary>Details</summary><div class="toggle-body">Folded content lives here.</div></details>
```

**Small screens:** Unchanged.

### 3.16 `<nk-todo>` – To-do

Checkbox line with strike-through when done. Form-associated like `nk-check`.

```html
<nk-todo checked>Write the docs</nk-todo>
<nk-todo>Ship it</nk-todo>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `checked` | boolean | – | Done. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `value` | string | `on` | Submitted value. |

**Slots:** `(default)` – Task text.

**Events:** `nk-change` `{ checked, value, name }` – On toggle.

**Replaces:** `.nk-todo`

```html
<!-- equivalent class markup -->
<label class="nk-todo"><input type="checkbox" checked><span>Write the docs</span></label>
<label class="nk-todo"><input type="checkbox"><span>Ship it</span></label>
```

**Small screens:** Unchanged.

### 3.17 `<nk-kbd>` – Key cap

A keyboard key, e.g. in shortcut hints.

```html
<nk-kbd>⌘</nk-kbd> <nk-kbd>K</nk-kbd>
```

_No attributes._

**Slots:** `(default)` – Key label.

**Replaces:** `.nk-kbd`

```html
<!-- equivalent class markup -->
<kbd class="nk-kbd">⌘</kbd> <kbd class="nk-kbd">K</kbd>
```

**Small screens:** Unchanged.

### 3.18 `<nk-code>` – Code block

Pre-formatted block with a language badge. Whitespace is kept as written; escape `<` as `&lt;`. With `highlight`, HTML tags and attributes are coloured.

```html
<nk-code lang="html" highlight>&lt;nk-btn variant="primary"&gt;Save&lt;/nk-btn&gt;</nk-code>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `lang` | string | – | Language badge, top right. |
| `highlight` | boolean | – | Colour HTML tags/attributes. |

**Slots:** `(default)` – The code, as text.

**Replaces:** `.nk-code`, `.lang`, `.tag`, `.attr`

```html
<!-- equivalent class markup -->
<div class="nk-code"><span class="lang">html</span>&lt;<span class="tag">nk-btn</span> <span class="attr">variant</span>="primary"&gt;Save&lt;/<span class="tag">nk-btn</span>&gt;</div>
```

**Small screens:** Scrolls horizontally instead of wrapping.

### 3.19 `<nk-quote>` – Quote

A block quote with an optional citation line.

```html
<nk-quote cite="Unknown">The best interface is the one that gets out of the way.</nk-quote>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `cite` | string | – | Citation text. |

**Slots:** `(default)` – Quote text.

**Replaces:** `.nk-quote`, `.q-cite`

```html
<!-- equivalent class markup -->
<blockquote class="nk-quote">The best interface is the one that gets out of the way.<cite class="q-cite">Unknown</cite></blockquote>
```

**Small screens:** Unchanged.

## App shell & navigation (wave 2)

### 3.20 `<nk-app>` – App shell

The outermost element of a workspace app: a full-height flex row with the sidebar slot left and `main.nk-main` right. Everything in the default slot – `nk-topbar`, `nk-page` – becomes a flex child of the main column.

```html
<nk-app>
  <nk-sidebar slot="sidebar">
    <nk-workspace-switcher slot="workspace" name="MonaHilft"></nk-workspace-switcher>
    <nk-tree>
      <nk-tree-item icon="🔍">Search<span slot="end" class="nk-kbd-hint"><nk-kbd>⌘</nk-kbd><nk-kbd>K</nk-kbd></span></nk-tree-item>
      <nk-tree-item icon="🏠" active>Home</nk-tree-item>
      <nk-tree-item icon="📥">Inbox</nk-tree-item>
    </nk-tree>
    <nk-tree-item slot="footer" icon="⚙️">Settings</nk-tree-item>
  </nk-sidebar>
  <nk-topbar>
    <nk-breadcrumb><span>📊 Project overview</span></nk-breadcrumb>
    <nk-btn slot="actions" variant="share">Share</nk-btn>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>
  <div class="nk-page-scroll"><div class="nk-page" style="padding-top:16px">
    <h1 class="nk-page-title" style="font-size:28px">NotionKit MVP</h1>
    <p class="lead">A calm, document-centric workspace app – built from elements only.</p>
  </div></div>
</nk-app>
```

_No attributes._

**Slots:** `sidebar` – An `nk-sidebar`. · `(default)` – Topbar, page – the main column.

**Replaces:** `.nk-app`, `.nk-main`

```html
<!-- equivalent class markup -->
<div class="nk-app">
  <aside class="nk-sidebar">
    <div class="nk-workspace"><div class="avatar">M</div><span>MonaHilft</span><span class="chev">⌄</span></div>
    <div class="nk-sidebar-scroll">
      <div class="nk-tree-item"><span class="icon">🔍</span><span class="label">Search</span><span class="nk-kbd-hint"><kbd class="nk-kbd">⌘</kbd><kbd class="nk-kbd">K</kbd></span></div>
      <div class="nk-tree-item active"><span class="icon">🏠</span><span class="label">Home</span></div>
      <div class="nk-tree-item"><span class="icon">📥</span><span class="label">Inbox</span></div>
    </div>
    <div class="nk-sidebar-footer">
      <div class="nk-tree-item"><span class="icon">⚙️</span><span class="label">Settings</span></div>
    </div>
  </aside>
  <main class="nk-main">
    <div class="nk-topbar">
      <nav class="nk-breadcrumb"><span class="crumb current">📊 Project overview</span></nav>
      <div class="nk-topbar-actions"><button class="nk-topbar-btn nk-share-btn">Share</button><button class="nk-topbar-btn nk-theme-toggle">🌙</button></div>
    </div>
    <div class="nk-page-scroll"><div class="nk-page" style="padding-top:16px">
      <h1 class="nk-page-title" style="font-size:28px">NotionKit MVP</h1>
      <p class="lead">A calm, document-centric workspace app – built from elements only.</p>
    </div></div>
  </main>
</div>
```

**Small screens:** Below 860px the sidebar is hidden; open it as a drawer with `sidebar.open = true`.

### 3.21 `<nk-sidebar>` – Sidebar

The left rail: workspace slot on top, a scrolling default slot for the tree, a pinned footer slot. Footer tree items automatically get `compact` (26px rows). The host is `display: contents`, so the `aside` is a direct flex child of the app – exactly like the class markup.

```html
<div style="display:flex;height:100%"><nk-sidebar>
  <nk-workspace-switcher slot="workspace" name="MonaHilft"></nk-workspace-switcher>
  <nk-tree>
    <nk-tree-item icon="🏠" active>Home</nk-tree-item>
    <nk-tree-item icon="📥">Inbox</nk-tree-item>
  </nk-tree>
  <nk-tree-item slot="footer" icon="⚙️">Settings</nk-tree-item>
  <nk-tree-item slot="footer" icon="🗑️">Trash</nk-tree-item>
</nk-sidebar></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | – | Drawer state on small screens (no effect on desktop). |

**Slots:** `workspace` – `nk-workspace-switcher`. · `(default)` – The tree (scrolls). · `footer` – Pinned bottom rows (Settings, Trash).

**Events:** `nk-toggle` `{ open }` – Drawer opened/closed.

**Methods:** `show()`, `close()`, `toggle()`

**Replaces:** `.nk-sidebar`, `.nk-sidebar-scroll`, `.nk-sidebar-footer`

```html
<!-- equivalent class markup -->
<div style="display:flex;height:100%"><aside class="nk-sidebar">
  <div class="nk-workspace"><div class="avatar">M</div><span>MonaHilft</span><span class="chev">⌄</span></div>
  <div class="nk-sidebar-scroll">
    <div class="nk-tree-item active"><span class="icon">🏠</span><span class="label">Home</span></div>
    <div class="nk-tree-item"><span class="icon">📥</span><span class="label">Inbox</span></div>
  </div>
  <div class="nk-sidebar-footer">
    <div class="nk-tree-item"><span class="icon">⚙️</span><span class="label">Settings</span></div>
    <div class="nk-tree-item"><span class="icon">🗑️</span><span class="label">Trash</span></div>
  </div>
</aside></div>
```

**Small screens:** Hidden below 860px. `open` shows it as an off-canvas drawer with a scrim; Escape and the scrim close it.

### 3.22 `<nk-workspace-switcher>` – Workspace switcher

The row at the very top of the sidebar. A click toggles `open` and shows whatever sits in the `menu` slot below it (an `nk-menu`, from wave 4); outside clicks and Escape close it.

```html
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:260px"><nk-workspace-switcher name="MonaHilft"></nk-workspace-switcher></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | Workspace name. |
| `avatar` | string | – | Avatar text (default: first letter of the name). |
| `open` | boolean | – | Menu shown. |

**Slots:** `avatar` – Custom avatar node. · `menu` – The popover content.

**Events:** `nk-toggle` `{ open }` – Menu opened/closed. · `nk-select` `(from the menu)` – Bubbles up from a menu item; the menu closes.

**Methods:** `show()`, `close()`, `toggle()`

**Replaces:** `.nk-workspace`, `.avatar`, `.chev`

```html
<!-- equivalent class markup -->
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:260px"><div class="nk-workspace"><div class="avatar">M</div><span>MonaHilft</span><span class="chev">⌄</span></div></div>
```

**Small screens:** Unchanged.

### 3.23 `<nk-section-label>` – Section label

Small uppercase-ish heading between tree sections. With `addable` a ＋ appears on hover and fires `nk-action`.

```html
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:0 8px 6px"><nk-section-label addable>Favourites</nk-section-label><nk-tree-item icon="📊">Project overview</nk-tree-item></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `addable` | boolean | – | Shows the ＋ on hover. |
| `label` | string | – | Text (alternative to the slot). |

**Slots:** `(default)` – Label text.

**Events:** `nk-action` `{ action: 'add' }` – ＋ clicked.

**Replaces:** `.nk-section-label`, `.plus`

```html
<!-- equivalent class markup -->
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:0 8px 6px"><div class="nk-section-label">Favourites <span class="plus">＋</span></div><div class="nk-tree-item"><span class="icon">📊</span><span class="label">Project overview</span><span class="actions"><span>＋</span><span>⋯</span></span></div></div>
```

**Small screens:** Unchanged.

### 3.24 `<nk-tree>` – Tree

Container for `nk-tree-item`s: keeps exactly one item `active` (listening to `nk-select` at any depth), gives the whole tree a single tab stop with arrow-key navigation (↑↓ move, → expands or enters, ← collapses or leaves, Home/End), and renders items from `tree.data`. `tree.value` is read-only – select programmatically with `item.select()` or the `active` attribute. Section labels may sit between items; their ＋ fires `nk-action { action: 'add' }` without a value.

```html
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:6px 8px"><nk-tree>
  <nk-section-label addable>Favourites</nk-section-label>
  <nk-tree-item icon="📊" open>Project overview
    <nk-tree-item icon="🚀" active>NotionKit MVP</nk-tree-item>
    <nk-tree-item icon="🎙️">Voice-Office-Hub</nk-tree-item>
  </nk-tree-item>
  <nk-tree-item icon="🧠">Knowledge base
    <nk-tree-item icon="📄">Onboarding</nk-tree-item>
  </nk-tree-item>
  <nk-tree-item icon="🎨">Design system</nk-tree-item>
</nk-tree></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `manual` | boolean | – | Do not move `active` automatically. |

**Slots:** `(default)` – `nk-tree-item` and `nk-section-label` children.

**Events:** `nk-select` `{ value, label, href, item }` – Bubbles from the selected item. · `nk-toggle` `{ open, value }` – A branch opened/closed. · `nk-action` `{ action, value }` – Hover action of an item.

**Properties:** `data`, `activeItem`, `value`

**Replaces:** 

```html
<!-- equivalent class markup -->
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:6px 8px"><div>
  <div class="nk-section-label">Favourites <span class="plus">＋</span></div>
  <div class="nk-tree-item"><span class="nk-toggle-arrow open">▸</span><span class="icon">📊</span><span class="label">Project overview</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
  <div class="nk-tree-children">
    <div class="nk-tree-item active"><span class="icon">🚀</span><span class="label">NotionKit MVP</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
    <div class="nk-tree-item"><span class="icon">🎙️</span><span class="label">Voice-Office-Hub</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
  </div>
  <div class="nk-tree-item"><span class="nk-toggle-arrow">▸</span><span class="icon">🧠</span><span class="label">Knowledge base</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
  <div class="nk-tree-children collapsed">
    <div class="nk-tree-item"><span class="icon">📄</span><span class="label">Onboarding</span></div>
  </div>
  <div class="nk-tree-item"><span class="icon">🎨</span><span class="label">Design system</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
</div></div>
```

**Small screens:** Rows are 28px; raise the hit area in a touch drawer via the sidebar’s `open` state styling of your own.

### 3.25 `<nk-tree-item>` – Tree item

One row of the page tree – and its children box. Text content is the label, nested `nk-tree-item`s are the children (the arrow appears only then), `slot="icon"` and `slot="end"` go where they say. Hover actions ＋/⋯ report through `nk-action`; a click fires `nk-select` (cancelable). Outside an `nk-tree` (sidebar footer) an item marks itself `active` on click unless the event is cancelled.

```html
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:6px 8px">
  <nk-tree-item icon="🔍" value="search">Search<span slot="end" class="nk-kbd-hint"><nk-kbd>⌘</nk-kbd><nk-kbd>K</nk-kbd></span></nk-tree-item>
  <nk-tree-item icon="📊" active>Project overview</nk-tree-item>
  <nk-tree-item icon="🎨">Design system</nk-tree-item>
</div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | – | Emoji/text icon (or `slot="icon"`). |
| `label` | string | – | Label (alternative to text content). |
| `value` | string | – | Value reported in events (default: label). |
| `href` | URL | – | Navigate on select. |
| `active` | boolean | – | Current item. |
| `open` | boolean | – | Children expanded. |
| `compact` | boolean | – | 26px row (footer, settings nav). |
| `no-actions` | boolean | – | Hide the ＋/⋯ hover actions. |

**Slots:** `(default)` – Label text and nested `nk-tree-item`s. · `icon` – Icon node. · `end` – Trailing content, e.g. `<span slot="end" class="nk-kbd-hint">` with `nk-kbd`s (hides the actions).

**Events:** `nk-select` `{ value, label, href, item }` – Row clicked / Enter. `preventDefault()` keeps it from becoming active. · `nk-toggle` `{ open, value }` – Arrow clicked. · `nk-action` `{ action: 'add' | 'more', value }` – Hover action clicked.

**Properties:** `label`, `value`, `active`, `open`, `hasChildren` · **Methods:** `select()`, `toggle()`, `focus()`

**Replaces:** `.nk-tree-item`, `.icon`, `.label`, `.actions`, `.active`, `.compact`, `.nk-tree-children`, `.collapsed`, `.nk-toggle-arrow`, `.open`, `.nk-kbd-hint`

```html
<!-- equivalent class markup -->
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:244px;padding:6px 8px">
  <div class="nk-tree-item"><span class="icon">🔍</span><span class="label">Search</span><span class="nk-kbd-hint"><kbd class="nk-kbd">⌘</kbd><kbd class="nk-kbd">K</kbd></span></div>
  <div class="nk-tree-item active"><span class="icon">📊</span><span class="label">Project overview</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
  <div class="nk-tree-item"><span class="icon">🎨</span><span class="label">Design system</span><span class="actions"><span>＋</span><span>⋯</span></span></div>
</div>
```

**Small screens:** 28px rows (26px with `compact`) – below the 44px touch target; the tree does not force a height.

### 3.26 `<nk-topbar>` – Top bar

The 45px bar above the page: breadcrumb in the default slot, buttons in the `actions` slot (right-aligned). Use `nk-btn variant="topbar"` / `"share"` and `nk-theme-toggle` there.

```html
<div style="border:1px solid var(--nk-border);border-radius:8px;display:flex;flex-direction:column"><nk-topbar>
  <nk-breadcrumb><span>📊 Project overview</span><span>🚀 NotionKit MVP</span></nk-breadcrumb>
  <span slot="actions" class="nk-topbar-btn" style="color:var(--nk-text-tertiary);font-size:12.5px">Last edited 2 min ago</span>
  <nk-btn slot="actions" variant="share">Share</nk-btn>
  <nk-btn slot="actions" variant="topbar">⭐</nk-btn>
  <nk-theme-toggle slot="actions"></nk-theme-toggle>
</nk-topbar></div>
```

_No attributes._

**Slots:** `(default)` – Breadcrumb / title. · `actions` – Buttons on the right.

**Replaces:** `.nk-topbar`, `.nk-topbar-actions`, `.nk-topbar-btn`, `.nk-share-btn`

```html
<!-- equivalent class markup -->
<div style="border:1px solid var(--nk-border);border-radius:8px;display:flex;flex-direction:column"><div class="nk-topbar">
  <nav class="nk-breadcrumb"><span class="crumb">📊 Project overview</span><span class="sep">/</span><span class="crumb current">🚀 NotionKit MVP</span></nav>
  <div class="nk-topbar-actions"><span class="nk-topbar-btn" style="color:var(--nk-text-tertiary);font-size:12.5px">Last edited 2 min ago</span><button class="nk-topbar-btn nk-share-btn">Share</button><button class="nk-topbar-btn">⭐</button><button class="nk-topbar-btn nk-theme-toggle">🌙</button></div>
</div></div>
```

**Small screens:** Unchanged; long breadcrumbs truncate.

### 3.27 `<nk-breadcrumb>` – Breadcrumb

Give it plain `<span>` or `<a>` children; they are cloned into the bar with separators between them and the last one marked current (or the child with a `current` attribute). Text changes, added or removed children are picked up automatically (`refresh()` only for what the observer cannot see). Clicking a crumb fires `nk-select` and forwards the click to the original child, so links navigate exactly once.

```html
<nk-breadcrumb><a href="#">📊 Project overview</a><span>🚀 NotionKit MVP</span></nk-breadcrumb>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `separator` | string | `/` | Separator glyph. |

**Slots:** `(default)` – Crumb children (direct children only, no `slot` attribute).

**Events:** `nk-select` `{ index, value, label, href, current }` – Crumb clicked; `preventDefault()` stops the forwarded click.

**Methods:** `refresh()`

**Replaces:** `.nk-breadcrumb`, `.crumb`, `.sep`, `.current`

```html
<!-- equivalent class markup -->
<nav class="nk-breadcrumb"><a class="crumb" href="#">📊 Project overview</a><span class="sep">/</span><span class="crumb current">🚀 NotionKit MVP</span></nav>
```

**Small screens:** Stays on one line; keep crumbs short.

### 3.28 `<nk-theme-toggle>` – Theme toggle

The ☀️/🌙 button. Flips `data-theme` on `<html>`, remembers the choice in `localStorage`, applies a stored or system preference on first connect when `<html>` has no theme yet, and accepts `postMessage({ nkTheme })` from a parent page. `apply(theme)` does everything a click does: sets, persists and fires `nk-change`.

```html
<nk-theme-toggle></nk-theme-toggle>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `storage-key` | string | `nk-theme` | localStorage key. |
| `title` | string | – | Tooltip. |

**Events:** `nk-change` `{ value: 'light' | 'dark' }` – Theme applied.

**Properties:** `value` · **Methods:** `apply(theme)`

**Replaces:** `.nk-theme-toggle`

```html
<!-- equivalent class markup -->
<button class="nk-topbar-btn nk-theme-toggle">🌙</button>
```

**Small screens:** Unchanged.

## Page shell & blocks (wave 3)

### 3.29 `<nk-page>` – Page

The document column: a scrolling wrapper, an optional cover, the 760px page with 64px side padding, and the page icon (rendered here because its slotted twin is keyed on the parent). `narrow` drops the scroll wrapper for pages that are the document itself.

```html
<div style="display:flex;flex-direction:column;height:100%"><nk-page icon="🚀" cover>
  <nk-page-title>NotionKit MVP</nk-page-title>
  <nk-page-actions><span>👤 Marcel Karas</span><span>📅 Created 12 May 2026</span><span>🏷️ <nk-tag color="purple">Design system</nk-tag></span></nk-page-actions>
  <p class="lead">A calm, document-centric workspace app – built from elements only.</p>
</nk-page></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | – | Page emoji; click fires `nk-action`. |
| `cover` | boolean | – | Show the token gradient cover. |
| `narrow` | boolean | – | No scroll wrapper (landing / docs page). |

**Slots:** `(default)` – Title, meta, blocks – anything with `class="lead"` on a `<p>` becomes the lead paragraph. · `cover` – An `nk-page-cover` (instead of the `cover` attribute). · `icon` – Custom icon node.

**Events:** `nk-action` `{ action: 'icon', value }` – Icon clicked (open an emoji picker).

**Replaces:** `.nk-page-scroll`, `.nk-page`, `.nk-page-icon`, `.nk-cover`, `.lead`

```html
<!-- equivalent class markup -->
<div style="display:flex;flex-direction:column;height:100%"><div class="nk-page-scroll"><div class="nk-cover"></div><div class="nk-page">
  <div class="nk-page-icon">🚀</div>
  <h1 class="nk-page-title">NotionKit MVP</h1>
  <div class="nk-page-meta"><span>👤 Marcel Karas</span><span>📅 Created 12 May 2026</span><span>🏷️ <span class="nk-tag purple">Design system</span></span></div>
  <p class="lead">A calm, document-centric workspace app – built from elements only.</p>
</div></div></div>
```

**Small screens:** Side padding drops to 24px below 860px.

### 3.30 `<nk-page-cover>` – Page cover

The 200px cover band. Without `src` it shows the token gradient; with `src` an image, covered and centred.

```html
<nk-page-cover></nk-page-cover>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `src` | URL | – | Cover image. |



**Replaces:** `.nk-cover`

```html
<!-- equivalent class markup -->
<div class="nk-cover"></div>
```

**Small screens:** Unchanged.

### 3.31 `<nk-page-title>` – Page title

The 40px heading. With `editable` it becomes a plain-text field: Enter commits, blur fires `nk-change`.

```html
<nk-page-title editable>NotionKit MVP</nk-page-title>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `editable` | boolean | – | Inline editing. |
| `placeholder` | string | – | Shown when empty (editable). |
| `value` | string | – | Title text (alternative to content). |

**Slots:** `(default)` – Title text.

**Events:** `nk-change` `{ value }` – Edited title committed.

**Properties:** `value`

**Replaces:** `.nk-page-title`

```html
<!-- equivalent class markup -->
<h1 class="nk-page-title" contenteditable="plaintext-only" spellcheck="false">NotionKit MVP</h1>
```

**Small screens:** Unchanged; long titles wrap.

### 3.32 `<nk-page-actions>` – Page meta row

The quiet row under the title: owner, date, tags – any inline content, 16px apart.

```html
<nk-page-actions><span>👤 Marcel Karas</span><span>📅 Created 12 May 2026</span><span>🏷️ <nk-tag color="purple">Design system</nk-tag></span></nk-page-actions>
```

_No attributes._

**Slots:** `(default)` – Meta items.

**Replaces:** `.nk-page-meta`

```html
<!-- equivalent class markup -->
<div class="nk-page-meta"><span>👤 Marcel Karas</span><span>📅 Created 12 May 2026</span><span>🏷️ <span class="nk-tag purple">Design system</span></span></div>
```

**Small screens:** Wraps naturally.

### 3.33 `<nk-block-host>` – Block host

The optical shell for editor content: hover wash, focus ring, drop-target line, an optional drag handle. It stays behaviour-neutral – mount your editor into the light DOM; `nk-editor` (v1.1) will do that for TipTap.

```html
<nk-block-host handle><p style="margin:0" contenteditable="true">Block content lives here – click to focus.</p></nk-block-host>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `handle` | boolean | – | Render the ⠿ drag handle (shown on hover). |
| `drop-target` | boolean | – | Drop indicator line above the block. |

**Slots:** `(default)` – Block content / the editor root.

**Replaces:** `.nk-block-host`, `.nk-block-handle`, `.nk-drop-target`

```html
<!-- equivalent class markup -->
<div class="nk-block-host"><span class="nk-block-handle">⠿</span><p style="margin:0" contenteditable="true">Block content lives here – click to focus.</p></div>
```

**Small screens:** The handle sits 26px left of the column and is hidden when there is no room.

### 3.34 `<nk-banner>` – Banner

A tinted notice row. The colour modifier becomes `variant`; an action link goes into `slot="action"` and sits at the right edge.

```html
<nk-banner variant="info">ℹ️ <span>This page is a <b>component preview</b> – every element follows the same design tokens.</span><span slot="action">Open palette</span></nk-banner>
<nk-banner variant="warning">⚠️ <span>The “Project overview” database has 2 overdue entries.</span><span slot="action">View</span></nk-banner>
<nk-banner variant="success">✓ <span>All changes have been synced.</span></nk-banner>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `variant` | info | success | warning | – | Colour pair. |

**Slots:** `(default)` – Icon and text. · `action` – Action link (underlined, right).

**Replaces:** `.nk-banner`, `.info`, `.success`, `.warning`, `.b-action`

```html
<!-- equivalent class markup -->
<div class="nk-banner info">ℹ️ <span>This page is a <b>component preview</b> – every element follows the same design tokens.</span><span class="b-action">Open palette</span></div>
<div class="nk-banner warning">⚠️ <span>The “Project overview” database has 2 overdue entries.</span><span class="b-action">View</span></div>
<div class="nk-banner success">✓ <span>All changes have been synced.</span></div>
```

**Small screens:** Wraps; the action drops below the text when needed.

### 3.35 `<nk-empty>` – Empty state

Dashed box with icon, title, description and whatever call to action you slot in.

```html
<nk-empty icon="🗂️" title="No entries yet" desc="Create the first entry or import existing data."><nk-btn variant="primary" small>＋ New entry</nk-btn></nk-empty>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | – | Emoji. |
| `title` | string | – | Title. |
| `desc` | string | – | Description. |

**Slots:** `(default)` – Call to action. · `icon` – Rich icon. · `title` – Rich title. · `desc` – Rich description.

**Replaces:** `.nk-empty`, `.e-icon`, `.e-title`, `.e-desc`

```html
<!-- equivalent class markup -->
<div class="nk-empty"><div class="e-icon">🗂️</div><div class="e-title">No entries yet</div><div class="e-desc">Create the first entry or import existing data.</div><button class="nk-btn primary small">＋ New entry</button></div>
```

**Small screens:** Unchanged.

### 3.36 `<nk-skeleton>` – Skeleton

Shimmering placeholder lines. `lines` renders several; `widths` gives each its own width.

```html
<nk-skeleton height="18" width="60%"></nk-skeleton>
<nk-skeleton lines="3" widths="100%,85%,40%"></nk-skeleton>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `lines` | number | `1` | Number of lines. |
| `height` | px | CSS length | `13` | Line height. |
| `width` | CSS length | – | Width for every line. |
| `widths` | list | – | Comma-separated width per line. |



**Replaces:** `.nk-skeleton`

```html
<!-- equivalent class markup -->
<div class="nk-skeleton" style="height:18px;width:60%"></div>
<div class="nk-skeleton" style="height:13px"></div>
<div class="nk-skeleton" style="height:13px;width:85%"></div>
<div class="nk-skeleton" style="height:13px;width:40%"></div>
```

**Small screens:** Unchanged; respects reduced motion.

### 3.37 `<nk-synced>` – Synced block

Content that appears in several places, framed with a badge.

```html
<nk-synced badge="⟳ 3 places"><div style="font-size:14px;line-height:1.55"><b>Our mission:</b> Take real weight off the working day – calm, clear, effective.</div></nk-synced>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `badge` | string | `⟳ synced` | Badge text. |

**Slots:** `(default)` – Content.

**Replaces:** `.nk-synced`, `.synced-badge`

```html
<!-- equivalent class markup -->
<div class="nk-synced"><span class="synced-badge">⟳ 3 places</span><div style="font-size:14px;line-height:1.55"><b>Our mission:</b> Take real weight off the working day – calm, clear, effective.</div></div>
```

**Small screens:** Unchanged.

### 3.38 `<nk-tabs>` – Tabs

A tab strip with panels. `nk-tab` children are the tabs; elements with `slot="panel"` and a matching `data-tab` are the panels – the tabs hide every panel but the active one through `hidden`. Arrow keys move between tabs.

```html
<nk-tabs value="notes">
  <nk-tab value="notes">📝 Notes</nk-tab>
  <nk-tab value="tasks">✅ Tasks</nk-tab>
  <nk-tab value="files">📎 Files</nk-tab>
  <div slot="panel" data-tab="notes" class="nk-tab-panel">Free-form notes on the project – meeting minutes, ideas, rough drafts.</div>
  <div slot="panel" data-tab="tasks" class="nk-tab-panel">Tasks for this project, linked to the database below.</div>
  <div slot="panel" data-tab="files" class="nk-tab-panel">Attached files and exports.</div>
</nk-tabs>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | Active tab value (default: the tab with `active`, else the first). |

**Slots:** `(default)` – `nk-tab` children. · `panel` – Panels with `data-tab`.

**Events:** `nk-change` `{ value }` – Active tab changed. · `nk-select` `{ value, label }` – From the clicked tab.

**Properties:** `value`

**Replaces:** `.nk-tabs`, `.nk-tab`, `.active`, `.nk-tab-panel`

```html
<!-- equivalent class markup -->
<div class="nk-tabs">
  <span class="nk-tab active">📝 Notes</span>
  <span class="nk-tab">✅ Tasks</span>
  <span class="nk-tab">📎 Files</span>
</div>
<div class="nk-tab-panel">Free-form notes on the project – meeting minutes, ideas, rough drafts.</div>
```

**Small screens:** Strip stays on one line; keep labels short.

### 3.39 `<nk-tab>` – Tab

One tab of `nk-tabs`. Standalone it toggles its own `active`.

```html
<nk-tabs><nk-tab value="a" active>📝 Notes</nk-tab><nk-tab value="b">✅ Tasks</nk-tab></nk-tabs>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | Value (default: text). |
| `active` | boolean | – | Active. |
| `disabled` | boolean | – | Not selectable. |

**Slots:** `(default)` – Label.

**Events:** `nk-select` `{ value, label }` – Clicked / Enter.

**Replaces:** `.nk-tab`, `.active`

```html
<!-- equivalent class markup -->
<div class="nk-tabs"><span class="nk-tab active">📝 Notes</span><span class="nk-tab">✅ Tasks</span></div>
```

**Small screens:** Unchanged.

### 3.40 `<nk-segmented>` – Segmented control

Plain `<button value>` children stay in the light DOM (the stylesheet’s slotted twins shape them); the element moves `.active`, handles arrow keys and submits `value` with the form.

```html
<nk-segmented name="range" value="week"><button value="week">Week</button><button value="month">Month</button><button value="quarter">Quarter</button></nk-segmented>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | Selected value (default: the button with `.active`, else the first). |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |

**Slots:** `(default)` – `<button value="…">` children.

**Events:** `nk-change` `{ value, name }` – Selection changed.

**Replaces:** `.nk-segmented`, `.active`

```html
<!-- equivalent class markup -->
<div class="nk-segmented"><button class="active">Week</button><button>Month</button><button>Quarter</button></div>
```

**Small screens:** Unchanged.

### 3.41 `<nk-stats>` – Stat cards

`nk-stats` is the row; each `nk-stat` shows label, value and a trend line coloured by `trend`.

```html
<nk-stats>
  <nk-stat label="Active pages" value="128" delta="▲ 12 this week" trend="up"></nk-stat>
  <nk-stat label="AI requests" value="847" delta="▲ 23 %" trend="up"></nk-stat>
  <nk-stat label="Open tasks" value="14" delta="▼ 5 since yesterday" trend="down"></nk-stat>
</nk-stats>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `label` | string | – | (nk-stat) Label. |
| `value` | string | – | (nk-stat) Big number. |
| `delta` | string | – | (nk-stat) Trend text. |
| `trend` | up | down | – | (nk-stat) Colours the delta. |

**Slots:** `(default)` – (nk-stats) `nk-stat` children; (nk-stat) slots `label`, `value`, `delta` for rich content.

**Replaces:** `.nk-stats`, `.nk-stat`, `.s-label`, `.s-value`, `.s-delta`, `.up`, `.down`

```html
<!-- equivalent class markup -->
<div class="nk-stats">
  <div class="nk-stat"><div class="s-label">Active pages</div><div class="s-value">128</div><div class="s-delta up">▲ 12 this week</div></div>
  <div class="nk-stat"><div class="s-label">AI requests</div><div class="s-value">847</div><div class="s-delta up">▲ 23 %</div></div>
  <div class="nk-stat"><div class="s-label">Open tasks</div><div class="s-value">14</div><div class="s-delta down">▼ 5 since yesterday</div></div>
</div>
```

**Small screens:** The row wraps below 860px.

### 3.42 `<nk-stat>` – Stat card

One card; see `nk-stats` for the row.

```html
<nk-stats><nk-stat label="Active pages" value="128" delta="▲ 12 this week" trend="up"></nk-stat></nk-stats>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `label` | string | – | Label. |
| `value` | string | – | Value. |
| `delta` | string | – | Trend text. |
| `trend` | up | down | – | Delta colour. |

**Slots:** `label` – Rich label. · `value` – Rich value. · `delta` – Rich delta (add `class="up"` / `"down"`).

**Replaces:** `.nk-stat`

```html
<!-- equivalent class markup -->
<div class="nk-stats"><div class="nk-stat"><div class="s-label">Active pages</div><div class="s-value">128</div><div class="s-delta up">▲ 12 this week</div></div></div>
```

**Small screens:** Unchanged.

### 3.43 `<nk-avatar-group>` – Avatar group

Overlapping `.mini-avatar` children (light DOM, styled by the slotted twins) plus a “more” bubble from the attribute.

```html
<div style="display:flex;align-items:center;gap:12px"><nk-avatar-group more="+2"><span class="mini-avatar" style="background:linear-gradient(135deg,#9065b0,#529cca)">MK</span><span class="mini-avatar" style="background:#448361">SL</span><span class="mini-avatar" style="background:#d9730d">TW</span></nk-avatar-group><span style="font-size:12.5px;color:var(--nk-text-tertiary)">5 people have access</span></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `more` | string | – | Text of the trailing bubble, e.g. `+2`. |

**Slots:** `(default)` – `<span class="mini-avatar" style="background:…">` children.

**Replaces:** `.nk-avatar-group`, `.mini-avatar`, `.more`

```html
<!-- equivalent class markup -->
<div style="display:flex;align-items:center;gap:12px"><div class="nk-avatar-group"><span class="mini-avatar" style="background:linear-gradient(135deg,#9065b0,#529cca)">MK</span><span class="mini-avatar" style="background:#448361">SL</span><span class="mini-avatar" style="background:#d9730d">TW</span><span class="mini-avatar more">+2</span></div><span style="font-size:12.5px;color:var(--nk-text-tertiary)">5 people have access</span></div>
```

**Small screens:** Unchanged.

### 3.44 `<nk-mention>` – Mention

Inline chip for a person (with avatar slot), a page or a date.

```html
<p style="margin:0;line-height:1.7"><nk-mention type="person"><span slot="avatar" class="mini-avatar" style="background:#448361">SL</span>Sara Lindt</nk-mention> · <nk-mention type="page">📄 Onboarding</nk-mention> · <nk-mention type="date">📅 20 May</nk-mention></p>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `type` | person | page | date | – | Kind of mention. |

**Slots:** `avatar` – `.mini-avatar` for persons. · `(default)` – Text.

**Replaces:** `.nk-mention`, `.person`, `.page`, `.date`, `.mini-avatar`

```html
<!-- equivalent class markup -->
<p style="margin:0;line-height:1.7"><span class="nk-mention person"><span class="mini-avatar" style="background:#448361">SL</span>Sara Lindt</span> · <span class="nk-mention page">📄 Onboarding</span> · <span class="nk-mention date">📅 20 May</span></p>
```

**Small screens:** Unchanged; never wraps.

### 3.45 `<nk-template-btn>` – Template button

Full-width, left-aligned button on the callout background – “insert a template”. Fires `nk-select` with `value`.

```html
<nk-template-btn icon="📅" value="week-plan">Insert week plan</nk-template-btn>
<nk-template-btn icon="🤝" value="minutes">Insert meeting minutes</nk-template-btn>
<nk-template-btn icon="🔁" value="retro">Insert retro board</nk-template-btn>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | – | Leading emoji. |
| `value` | string | – | Reported value (default: text). |
| `disabled` | boolean | – | Disabled. |

**Slots:** `(default)` – Label.

**Events:** `nk-select` `{ value, label }` – Clicked.

**Replaces:** `.nk-template-btn`

```html
<!-- equivalent class markup -->
<button class="nk-template-btn">📅 Insert week plan</button>
<button class="nk-template-btn">🤝 Insert meeting minutes</button>
<button class="nk-template-btn">🔁 Insert retro board</button>
```

**Small screens:** Unchanged.

### 3.46 `<nk-model-card>` – Model card

A radio-like card. Cards with the same `name` form a group; the selected one submits `value` with the form.

```html
<nk-model-card name="model" value="pro" title="Mona Pro" desc="Best for long documents and research." selected></nk-model-card>
<nk-model-card name="model" value="fast" title="Mona Fast" desc="Quick answers, lower cost."></nk-model-card>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `title` | string | – | Name line. |
| `desc` | string | – | Description. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `value` | string | – | Submitted value. |
| `selected` | boolean | – | Selected. |

**Slots:** `title` – Rich name line (e.g. with an `nk-tag`). · `desc` – Rich description.

**Events:** `nk-change` `{ value, name, checked }` – Selected. · `nk-select` `{ value, label }` – Selected.

**Replaces:** `.nk-model-card`, `.selected`, `.m-radio`, `.m-name`, `.m-desc`

```html
<!-- equivalent class markup -->
<div class="nk-model-card selected"><div class="m-radio"></div><div><div class="m-name">Mona Pro</div><div class="m-desc">Best for long documents and research.</div></div></div>
<div class="nk-model-card"><div class="m-radio"></div><div><div class="m-name">Mona Fast</div><div class="m-desc">Quick answers, lower cost.</div></div></div>
```

**Small screens:** Unchanged.

### 3.47 `<nk-profile-row>` – Profile row

A 56px gradient avatar with whatever you slot beside it – usually two buttons.

```html
<nk-profile-row avatar="MK"><nk-btn variant="secondary" small>Change photo</nk-btn> <nk-btn variant="danger" small>Remove</nk-btn></nk-profile-row>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `avatar` | string | – | Initials. |

**Slots:** `avatar` – Custom avatar (e.g. an image). · `(default)` – Content beside the avatar.

**Replaces:** `.nk-profile-row`, `.big-avatar`

```html
<!-- equivalent class markup -->
<div class="nk-profile-row"><div class="big-avatar">MK</div><button class="nk-btn secondary small">Change photo</button> <button class="nk-btn danger small">Remove</button></div>
```

**Small screens:** Unchanged.

### 3.48 `<nk-danger-zone>` – Danger zone

Red-framed box for destructive settings.

```html
<nk-danger-zone title="Danger zone"><nk-field label="Delete workspace" desc="Deleting the workspace removes every page."><nk-btn variant="danger-solid" small>Delete</nk-btn></nk-field></nk-danger-zone>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `title` | string | – | Red heading. |

**Slots:** `(default)` – Fields and buttons.

**Replaces:** `.nk-danger-zone`, `.dz-title`

```html
<!-- equivalent class markup -->
<div class="nk-danger-zone"><div class="dz-title">Danger zone</div><div class="nk-field"><div><div class="f-label">Delete workspace</div><div class="f-desc">Deleting the workspace removes every page.</div></div><div class="f-control"><button class="nk-btn danger-solid small">Delete</button></div></div></div>
```

**Small screens:** Unchanged.

### 3.49 `<nk-member-list>` – Member list

Rows of `nk-member-row`; the list marks the last row so it loses its bottom border. Each row shows avatar (initials + `color`), name, mail and a `slot="role"` control on the right.

```html
<nk-member-list>
  <nk-member-row name="Sara Lindt" mail="sara@example.com" color="#448361"><nk-select slot="role" compact value="editor"><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></nk-select></nk-member-row>
  <nk-member-row name="Tom Weber" mail="tom@example.com" color="#d9730d"><nk-select slot="role" compact value="viewer"><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></nk-select></nk-member-row>
</nk-member-list>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | (row) Name. |
| `mail` | string | – | (row) Mail line. |
| `avatar` | string | – | (row) Initials (default: from the name). |
| `color` | CSS color | – | (row) Avatar background. |
| `last` | boolean | – | (row) No bottom border – set by the list. |

**Slots:** `(default)` – (list) rows; (row) extra content. · `role` – (row) A control on the right, e.g. `nk-select compact`. · `avatar` – (row) Custom avatar.

**Replaces:** `.nk-member-list`, `.nk-member-row`, `.last`, `.m-mail`, `.mini-avatar`

```html
<!-- equivalent class markup -->
<div class="nk-member-list">
  <div class="nk-member-row"><span class="mini-avatar" style="background:#448361">SL</span><div>Sara Lindt<div class="m-mail">sara@example.com</div></div><select class="nk-select"><option>Viewer</option><option selected>Editor</option><option>Admin</option></select></div>
  <div class="nk-member-row"><span class="mini-avatar" style="background:#d9730d">TW</span><div>Tom Weber<div class="m-mail">tom@example.com</div></div><select class="nk-select"><option selected>Viewer</option><option>Editor</option><option>Admin</option></select></div>
</div>
```

**Small screens:** Unchanged; the role select shrinks to 120px.

### 3.50 `<nk-member-row>` – Member row

One row; see `nk-member-list`.

```html
<nk-member-row name="Sara Lindt" mail="sara@example.com" color="#448361" last></nk-member-row>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | Name. |
| `mail` | string | – | Mail. |
| `avatar` | string | – | Initials. |
| `color` | CSS color | – | Avatar background. |
| `last` | boolean | – | No bottom border. |

**Slots:** `role` – Control on the right. · `avatar` – Custom avatar. · `(default)` – Extra content.

**Replaces:** `.nk-member-row`

```html
<!-- equivalent class markup -->
<div class="nk-member-row last"><span class="mini-avatar" style="background:#448361">SL</span><div>Sara Lindt<div class="m-mail">sara@example.com</div></div></div>
```

**Small screens:** Unchanged.

## Overlays (wave 4)

### 3.51 `<nk-modal>` – Settings modal

The settings overlay: backdrop, a 960×640 dialog with a nav column and a content column. The nav rows are rendered by the modal from the panes’ `label`/`icon`/`group`, so the 27px rows and the 860px icon rail come straight from the stylesheet. Escape and the backdrop close it; focus moves in and back; the page behind is scroll-locked and inert. Place it directly under `<body>`.

```html
<nk-modal open>
  <nk-settings-user slot="user" name="Marcel Karas" mail="marcel@monahilft.de"></nk-settings-user>
  <nk-settings-pane name="profile" group="Account" icon="👤" label="My profile" title="My profile" active>
    <nk-profile-row avatar="MK"><nk-btn variant="secondary" small>Change photo</nk-btn></nk-profile-row>
    <nk-field label="Display name" desc="Shown next to your comments."><nk-input value="Marcel Karas"></nk-input></nk-field>
    <nk-field label="Email"><nk-input type="email" value="marcel@monahilft.de"></nk-input></nk-field>
  </nk-settings-pane>
  <nk-settings-pane name="appearance" group="Account" icon="🎨" label="Appearance" title="Appearance">
    <nk-field label="Theme"><nk-select><option>Light</option><option>Dark</option><option>System</option></nk-select></nk-field>
  </nk-settings-pane>
  <nk-settings-pane name="members" group="Workspace" icon="👥" label="Members" title="Members">
    <nk-member-list><nk-member-row name="Sara Lindt" mail="sara@example.com" color="#448361"></nk-member-row></nk-member-list>
  </nk-settings-pane>
</nk-modal>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | – | Shown. |
| `pane` | string | – | Name of the active pane (default: the pane with `active`, else the first). |

**Slots:** `(default)` – `nk-settings-pane` children. · `user` – `nk-settings-user` at the top of the nav. · `nav` – Extra nav content below the generated rows (860px rules do not reach slotted elements).

**Events:** `nk-toggle` `{ open }` – Opened / closed. · `nk-select` `{ value, label }` – Pane switched.

**Properties:** `open`, `pane`, `panes` · **Methods:** `show(pane?)`, `close()`, `toggle()`

**Replaces:** `.nk-modal-backdrop`, `.open`, `.nk-modal`, `.nk-settings-nav`, `.nk-settings-content`

```html
<!-- equivalent class markup -->
<div class="nk-modal-backdrop open"><div class="nk-modal">
  <nav class="nk-settings-nav">
    <div class="nk-settings-user"><div class="avatar">MK</div><div class="u-text"><div class="name">Marcel Karas</div><div class="mail">marcel@monahilft.de</div></div></div>
    <div class="nk-section-label">Account</div>
    <div class="nk-tree-item active"><span class="icon">👤</span><span class="label">My profile</span></div>
    <div class="nk-tree-item"><span class="icon">🎨</span><span class="label">Appearance</span></div>
    <div class="nk-section-label">Workspace</div>
    <div class="nk-tree-item"><span class="icon">👥</span><span class="label">Members</span></div>
  </nav>
  <div class="nk-settings-content">
    <section class="nk-settings-pane active"><h2>My profile</h2>
      <div class="nk-profile-row"><div class="big-avatar">MK</div><button class="nk-btn secondary small">Change photo</button></div>
      <div class="nk-field"><div><div class="f-label">Display name</div><div class="f-desc">Shown next to your comments.</div></div><div class="f-control"><input class="nk-input" value="Marcel Karas"></div></div>
      <div class="nk-field"><div><div class="f-label">Email</div></div><div class="f-control"><input class="nk-input" type="email" value="marcel@monahilft.de"></div></div>
    </section>
  </div>
</div></div>
```

**Small screens:** Below 860px the nav collapses to a 60px icon rail; the dialog takes 92vw × 86vh.

### 3.52 `<nk-settings-pane>` – Settings pane

One pane of the settings modal. `label`, `icon` and `group` feed the modal’s nav; `title` renders the pane heading. Slotted `<h2>`/`<h3>` are styled too.

```html
<nk-settings-pane title="Notifications" active><h3>Email</h3><nk-field label="Email notifications"><nk-switch checked></nk-switch></nk-field></nk-settings-pane>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | Identifier used by `pane`. |
| `label` | string | – | Nav label (a pane without label gets no nav row). |
| `icon` | string | – | Nav icon. |
| `group` | string | – | Section label above its nav rows. |
| `title` | string | – | Pane heading. |
| `active` | boolean | – | Visible (managed by the modal). |

**Slots:** `(default)` – Fields, headings, anything.

**Replaces:** `.nk-settings-pane`, `.active`

```html
<!-- equivalent class markup -->
<section class="nk-settings-pane active"><h2>Notifications</h2><h3>Email</h3><div class="nk-field"><div><div class="f-label">Email notifications</div></div><div class="f-control"><button class="nk-switch" role="switch" aria-checked="true"></button></div></div></section>
```

**Small screens:** Content padding drops to 24px below 860px.

### 3.53 `<nk-settings-user>` – Settings user

The user card at the top of the settings nav.

```html
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:230px;padding:10px 8px"><nk-settings-user name="Marcel Karas" mail="marcel@monahilft.de"></nk-settings-user></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | Name. |
| `mail` | string | – | Mail. |
| `avatar` | string | – | Initials (default: from the name). |

**Slots:** `avatar` – Custom avatar.

**Replaces:** `.nk-settings-user`, `.avatar`, `.u-text`, `.name`, `.mail`

```html
<!-- equivalent class markup -->
<div style="background:var(--nk-bg-sidebar);border-radius:8px;max-width:230px;padding:10px 8px"><div class="nk-settings-user"><div class="avatar">MK</div><div class="u-text"><div class="name">Marcel Karas</div><div class="mail">marcel@monahilft.de</div></div></div></div>
```

**Small screens:** Below 860px only the avatar remains.

### 3.54 `<nk-cmdk>` – Command palette

⌘K. Feed it `palette.commands = [{ group, items: [{ id, icon, label, shortcut, keywords, action }] }]`; it searches fuzzily over label and keywords, keeps group order, moves the selection with ↑↓, picks with Enter or click (`nk-command` plus the item’s `action`), and closes on Escape or the backdrop. The hotkey is `mod+k` unless changed. Place it directly under `<body>`.

```html
<nk-cmdk open placeholder="Search or type a command …"></nk-cmdk>
<script>
  document.querySelector('nk-cmdk').commands = [
    { group: 'Pages', items: [
      { id: 'mvp', icon: '🚀', label: 'NotionKit MVP' },
      { id: 'voh', icon: '🎙️', label: 'Voice-Office-Hub' },
      { id: 'kb', icon: '🧠', label: 'Knowledge base' },
    ]},
    { group: 'Actions', items: [
      { id: 'new', icon: '＋', label: 'Create new page', shortcut: '⌘N' },
      { id: 'theme', icon: '🌙', label: 'Toggle theme', shortcut: '⌘⇧L' },
      { id: 'settings', icon: '⚙️', label: 'Open settings', shortcut: '⌘,' },
    ]},
  ];
</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | – | Shown. |
| `hotkey` | string | `mod+k` | Global shortcut, e.g. `mod+k`, `mod+shift+p`. |
| `placeholder` | string | – | Input placeholder. |

**Slots:** `footer` – Replaces the default key hints.

**Events:** `nk-command` `{ id, item, query }` – An item was picked; `preventDefault()` skips `item.action`. · `nk-toggle` `{ open }` – Opened / closed.

**Properties:** `commands`, `open`, `query` · **Methods:** `show()`, `close()`, `toggle()`, `results()`, `pick(index?)`

**Replaces:** `.nk-cmdk-backdrop`, `.open`, `.nk-cmdk`, `.nk-cmdk-input-row`, `.nk-cmdk-list`, `.nk-cmdk-group`, `.nk-cmdk-item`, `.selected`, `.m-icon`, `.m-shortcut`, `.nk-cmdk-empty`, `.nk-cmdk-footer`

```html
<!-- equivalent class markup -->
<div class="nk-cmdk-backdrop open"><div class="nk-cmdk">
  <div class="nk-cmdk-input-row"><span style="font-size:15px">🔍</span><input placeholder="Search or type a command …"><kbd class="nk-kbd">esc</kbd></div>
  <div class="nk-cmdk-list">
    <div class="nk-cmdk-group">Pages</div>
    <div class="nk-cmdk-item selected"><span class="m-icon">🚀</span><span>NotionKit MVP</span></div>
    <div class="nk-cmdk-item"><span class="m-icon">🎙️</span><span>Voice-Office-Hub</span></div>
    <div class="nk-cmdk-item"><span class="m-icon">🧠</span><span>Knowledge base</span></div>
    <div class="nk-cmdk-group">Actions</div>
    <div class="nk-cmdk-item"><span class="m-icon">＋</span><span>Create new page</span><span class="m-shortcut">⌘N</span></div>
    <div class="nk-cmdk-item"><span class="m-icon">🌙</span><span>Toggle theme</span><span class="m-shortcut">⌘⇧L</span></div>
    <div class="nk-cmdk-item"><span class="m-icon">⚙️</span><span>Open settings</span><span class="m-shortcut">⌘,</span></div>
  </div>
  <div class="nk-cmdk-footer"><span><kbd class="nk-kbd">↑</kbd><kbd class="nk-kbd">↓</kbd> navigate</span><span><kbd class="nk-kbd">↵</kbd> open</span><span><kbd class="nk-kbd">⌘</kbd><kbd class="nk-kbd">K</kbd> toggle</span></div>
</div></div>
```

**Small screens:** Full width (96vw) and closer to the top below 860px.

### 3.55 `<nk-menu>` – Menu

A 230px context menu. Items are `nk-menu-item`s (`type="separator"` / `"label"` for the rest); ↑↓ move, Enter selects, `nk-select` bubbles up. Usually lives inside `nk-pop` or the workspace switcher.

```html
<nk-menu>
  <nk-menu-item type="label">Page</nk-menu-item>
  <nk-menu-item icon="✏️" shortcut="⌘E" value="rename">Rename</nk-menu-item>
  <nk-menu-item icon="📄" shortcut="⌘D" value="duplicate">Duplicate</nk-menu-item>
  <nk-menu-item icon="📁" value="move">Move to …</nk-menu-item>
  <nk-menu-item type="separator"></nk-menu-item>
  <nk-menu-item icon="🗑️" danger value="delete">Delete</nk-menu-item>
</nk-menu>
```

_No attributes._

**Slots:** `(default)` – `nk-menu-item` children.

**Events:** `nk-select` `{ value, label, item }` – From the chosen item.

**Methods:** `focusFirst()`

**Replaces:** `.nk-pop`, `.nk-menu`, `.nk-menu-item`, `.m-icon`, `.m-shortcut`, `.danger`, `.nk-menu-sep`, `.nk-menu-label`

```html
<!-- equivalent class markup -->
<div class="nk-pop nk-menu">
  <div class="nk-menu-label">Page</div>
  <div class="nk-menu-item"><span class="m-icon">✏️</span>Rename<span class="m-shortcut">⌘E</span></div>
  <div class="nk-menu-item"><span class="m-icon">📄</span>Duplicate<span class="m-shortcut">⌘D</span></div>
  <div class="nk-menu-item"><span class="m-icon">📁</span>Move to …</div>
  <div class="nk-menu-sep"></div>
  <div class="nk-menu-item danger"><span class="m-icon">🗑️</span>Delete</div>
</div>
```

**Small screens:** Unchanged.

### 3.56 `<nk-menu-item>` – Menu item

One row of `nk-menu`: icon, label, shortcut; `danger` for destructive actions. `type` switches to a separator or a group label.

```html
<nk-menu><nk-menu-item icon="✏️" shortcut="⌘E" value="rename">Rename</nk-menu-item></nk-menu>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | – | Leading icon. |
| `shortcut` | string | – | Trailing shortcut text. |
| `value` | string | – | Reported value (default: text). |
| `danger` | boolean | – | Red text. |
| `type` | item | separator | label | `item` | Row kind. |
| `disabled` | boolean | – | Not selectable. |

**Slots:** `(default)` – Label. · `icon` – Icon node.

**Events:** `nk-select` `{ value, label, item }` – Clicked / Enter.

**Replaces:** `.nk-menu-item`, `.danger`, `.nk-menu-sep`, `.nk-menu-label`

```html
<!-- equivalent class markup -->
<div class="nk-pop nk-menu"><div class="nk-menu-item"><span class="m-icon">✏️</span>Rename<span class="m-shortcut">⌘E</span></div></div>
```

**Small screens:** Unchanged.

### 3.57 `<nk-pop>` – Popover

Anchors a floating surface to a trigger. The trigger goes in `slot="trigger"` and toggles `open`; outside clicks, Escape and an `nk-select` from inside close it. Content is wrapped in `.nk-pop` unless it brings its own surface (`nk-menu`, `nk-emoji-picker`) or `bare` is set.

```html
<div style="min-height:220px"><nk-pop open>
  <nk-btn slot="trigger" variant="secondary">Options ▾</nk-btn>
  <nk-menu><nk-menu-item icon="✏️" value="rename">Rename</nk-menu-item><nk-menu-item icon="📄" value="duplicate">Duplicate</nk-menu-item><nk-menu-item type="separator"></nk-menu-item><nk-menu-item icon="🗑️" danger value="delete">Delete</nk-menu-item></nk-menu>
</nk-pop></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | – | Shown. |
| `placement` | bottom-start | bottom-end | top-start | top-end | `bottom-start` | Where the surface opens. |
| `bare` | boolean | – | No `.nk-pop` wrapper. |

**Slots:** `trigger` – The button. · `(default)` – The floating content.

**Events:** `nk-toggle` `{ open }` – Opened / closed.

**Methods:** `show()`, `close()`, `toggle()`

**Replaces:** `.nk-pop`

```html
<!-- equivalent class markup -->
<div style="min-height:220px"><div style="position:relative;display:inline-block">
  <button class="nk-btn secondary">Options ▾</button>
  <div style="position:absolute;top:100%;left:0;margin-top:4px;z-index:50"><div class="nk-pop nk-menu"><div class="nk-menu-item"><span class="m-icon">✏️</span>Rename</div><div class="nk-menu-item"><span class="m-icon">📄</span>Duplicate</div><div class="nk-menu-sep"></div><div class="nk-menu-item danger"><span class="m-icon">🗑️</span>Delete</div></div></div>
</div></div>
```

**Small screens:** Positioned relative to the trigger; keep it near the viewport edge in mind.

### 3.58 `<nk-emoji-picker>` – Emoji picker

Search field, 8-column grid, category strip. Ships with a built-in set (names for search); `picker.emojis = [{ char, name, cat }]` replaces it. A click fires `nk-select { emoji }`.

```html
<nk-emoji-picker placeholder="Search…"></nk-emoji-picker>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `placeholder` | string | – | Search placeholder. |
| `value` | string | – | Last picked emoji. |

**Events:** `nk-select` `{ emoji, value }` – Emoji picked.

**Properties:** `emojis`, `value`

**Replaces:** `.nk-pop`, `.nk-emoji-search`, `.nk-emoji-grid`, `.nk-emoji-cats`, `.active`

```html
<!-- equivalent class markup -->
<div class="nk-pop"><input class="nk-emoji-search" placeholder="Search…"><div class="nk-emoji-grid"><span>😀</span><span>😊</span><span>😂</span><span>🙂</span><span>😉</span><span>😍</span><span>🤔</span><span>😎</span><span>🥳</span><span>😴</span><span>🤯</span><span>😅</span><span>🙃</span><span>😇</span><span>🤗</span><span>😢</span></div><div class="nk-emoji-cats"><span class="active">😀</span><span>👋</span><span>🌿</span><span>☕</span><span>🎯</span><span>🚀</span><span>💡</span><span>✅</span></div></div>
```

**Small screens:** 296px wide; fine on any phone.

### 3.59 `<nk-toast>` – Toast

One inverted pill at the bottom centre. `toast.show("Saved")` shows it and hides it after `duration` ms; `open` is the state.

```html
<nk-toast open duration="0">Settings saved</nk-toast>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | – | Visible. |
| `duration` | ms | `2200` | Auto-hide delay (0 = stay). |
| `icon` | string | `✓` | Leading glyph. |

**Slots:** `(default)` – Static content (when `show()` gets no message).

**Events:** `nk-toggle` `{ open }` – Shown / hidden.

**Properties:** `open`, `message` · **Methods:** `show(message?, { duration })`, `close()`

**Replaces:** `.nk-toast`, `.show`

```html
<!-- equivalent class markup -->
<div class="nk-toast show">✓ <span>Settings saved</span></div>
```

**Small screens:** Unchanged.

## Data & collaboration (wave 5)

### 3.60 `<nk-database>` – Database

The view switcher. Child views (`nk-table-view`, `nk-board-view`) become tabs; `columns` and `rows` are pushed into every view. `view` selects the active one; `count` on a view shows the row count as badge. No fetching: give it data, listen to events.

```html
<nk-database view="table" add-view>
  <nk-table-view name="table" label="▦ Table" count new-row sortable></nk-table-view>
  <nk-board-view name="board" label="▤ Board" group-by="status" new-row></nk-board-view>
</nk-database>
<script>{
  const db = document.currentScript.previousElementSibling;
  db.columns = [
    { key: 'name', label: 'Name', type: 'text', icon: '📄', title: true },
    { key: 'status', label: 'Status', type: 'select', icon: '◉', options: [
      { value: 'planned', label: 'Planned', color: 'orange' }, { value: 'progress', label: 'In progress', color: 'blue' }, { value: 'done', label: 'Done', color: 'green' } ] },
    { key: 'owner', label: 'Owner', type: 'person', icon: '👤' },
    { key: 'due', label: 'Due', type: 'date', icon: '📅' },
    { key: 'progress', label: 'Progress', type: 'progress', icon: '▰' },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '08.05.2026', progress: 100 },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '10.05.2026', progress: 100 },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '20.05.2026', progress: 65 },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0 },
  ];
}</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `view` | string | – | Name of the active view. |
| `add-view` | boolean | – | Show a ＋ tab (fires `nk-action`). |

**Slots:** `(default)` – View elements.

**Events:** `nk-view-change` `{ view }` – Tab switched. · `nk-action` `{ action: 'add-view' }` – ＋ clicked. · `nk-select / nk-change / nk-action` `(from the views)` – Bubble up from the active view.

**Properties:** `columns`, `rows`, `view`, `views` · **Methods:** `refresh()`

**Replaces:** `.nk-database`, `.nk-db-tabs`, `.nk-db-tab`, `.active`, `.badge`

```html
<!-- equivalent class markup -->
<div class="nk-database">
  <div class="nk-db-tabs"><span class="nk-db-tab active">▦ Table <span class="badge">4</span></span><span class="nk-db-tab">▤ Board</span><span class="nk-db-tab" style="color:var(--nk-text-tertiary)">＋</span></div>
  <div class="nk-table-wrap"><table class="nk-table">
  <thead><tr><th><span class="th-icon">📄</span>Name</th><th><span class="th-icon">◉</span>Status</th><th><span class="th-icon">👤</span>Owner</th><th><span class="th-icon">📅</span>Due</th><th><span class="th-icon">▰</span>Progress</th></tr></thead>
  <tbody>
    <tr><td><span class="row-title">🧭 App shell & sidebar</span></td><td><span class="nk-tag green">Done</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">08.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td></tr>
    <tr><td><span class="row-title">📄 Page shell & typography</span></td><td><span class="nk-tag green">Done</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">10.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td></tr>
    <tr><td><span class="row-title">🗃️ Database table view</span></td><td><span class="nk-tag blue">In progress</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">20.05.2026</span></td><td><span class="nk-progress"><i style="width:65%"></i></span><span class="nk-progress-label">65%</span></td></tr>
    <tr><td><span class="row-title">▤ Board view & drag-and-drop</span></td><td><span class="nk-tag orange">Planned</span></td><td><span class="person-cell">—</span></td><td><span class="date-cell">02.06.2026</span></td><td><span class="nk-progress"><i style="width:0%"></i></span><span class="nk-progress-label">0%</span></td></tr>
  </tbody>
</table><div class="nk-new-row">＋ New page</div></div>
</div>
```

**Small screens:** Tables and boards scroll horizontally; nothing breaks.

### 3.61 `<nk-table-view>` – Table view

Renders `columns` × `rows` as the NotionKit table. Cells are polymorphic (`text`, `select`, `multi-select`, `date`, `person`, `checkbox`, `url`, `number`, `progress`) and rendered as plain markup by the exported `renderPropertyCell()` – every cell rule starts with `.nk-table`, so a cell element of its own would never be styled. Header clicks sort with `sortable`.

```html
<nk-table-view new-row sortable></nk-table-view>
<script>{
  const db = document.currentScript.previousElementSibling;
  db.columns = [
    { key: 'name', label: 'Name', type: 'text', icon: '📄', title: true },
    { key: 'status', label: 'Status', type: 'select', icon: '◉', options: [
      { value: 'planned', label: 'Planned', color: 'orange' }, { value: 'progress', label: 'In progress', color: 'blue' }, { value: 'done', label: 'Done', color: 'green' } ] },
    { key: 'owner', label: 'Owner', type: 'person', icon: '👤' },
    { key: 'due', label: 'Due', type: 'date', icon: '📅' },
    { key: 'progress', label: 'Progress', type: 'progress', icon: '▰' },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '08.05.2026', progress: 100 },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '10.05.2026', progress: 100 },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '20.05.2026', progress: 65 },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0 },
  ];
}</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | View name (tab id). |
| `label` | string | – | Tab label. |
| `badge` | string | – | Tab badge. |
| `count` | boolean | – | Row count as badge. |
| `new-row` | boolean | – | Show the add row. |
| `new-row-label` | string | `＋ New page` | Its text. |
| `sortable` | boolean | – | Header click sorts locally. |
| `sort-key` | string | – | Sorted column. |
| `sort-dir` | asc | desc | – | Direction. |

**Events:** `nk-select` `{ row, id }` – Row clicked. · `nk-change` `{ row, key, value }` – Checkbox cell toggled (row updated in place). · `nk-action` `{ action: 'sort' | 'new-row', key?, value? }` – Header or add row clicked.

**Properties:** `columns`, `rows`, `data` · **Methods:** `refresh()`

**Replaces:** `.nk-table-wrap`, `.nk-table`, `.th-icon`, `.row-title`, `.date-cell`, `.person-cell`, `.mini-avatar`, `.nk-new-row`

```html
<!-- equivalent class markup -->
<div class="nk-table-wrap"><table class="nk-table">
  <thead><tr><th><span class="th-icon">📄</span>Name</th><th><span class="th-icon">◉</span>Status</th><th><span class="th-icon">👤</span>Owner</th><th><span class="th-icon">📅</span>Due</th><th><span class="th-icon">▰</span>Progress</th></tr></thead>
  <tbody>
    <tr><td><span class="row-title">🧭 App shell & sidebar</span></td><td><span class="nk-tag green">Done</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">08.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td></tr>
    <tr><td><span class="row-title">📄 Page shell & typography</span></td><td><span class="nk-tag green">Done</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">10.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td></tr>
    <tr><td><span class="row-title">🗃️ Database table view</span></td><td><span class="nk-tag blue">In progress</span></td><td><span class="person-cell"><span class="mini-avatar" style="background:#9065b0">MK</span> Marcel</span></td><td><span class="date-cell">20.05.2026</span></td><td><span class="nk-progress"><i style="width:65%"></i></span><span class="nk-progress-label">65%</span></td></tr>
    <tr><td><span class="row-title">▤ Board view & drag-and-drop</span></td><td><span class="nk-tag orange">Planned</span></td><td><span class="person-cell">—</span></td><td><span class="date-cell">02.06.2026</span></td><td><span class="nk-progress"><i style="width:0%"></i></span><span class="nk-progress-label">0%</span></td></tr>
  </tbody>
</table><div class="nk-new-row">＋ New page</div></div>
```

**Small screens:** Scrolls horizontally inside `.nk-table-wrap`.

### 3.62 `<nk-board-view>` – Board view

Groups rows by a select column (`group-by`, default: the first select column) into one column per option. Cards show the title column and the `meta-keys` (default: dates and progress). Drag a card onto another column: the row’s value changes and `nk-change` fires.

```html
<nk-board-view group-by="status" new-row></nk-board-view>
<script>{
  const db = document.currentScript.previousElementSibling;
  db.columns = [
    { key: 'name', label: 'Name', type: 'text', icon: '📄', title: true },
    { key: 'status', label: 'Status', type: 'select', icon: '◉', options: [
      { value: 'planned', label: 'Planned', color: 'orange' }, { value: 'progress', label: 'In progress', color: 'blue' }, { value: 'done', label: 'Done', color: 'green' } ] },
    { key: 'owner', label: 'Owner', type: 'person', icon: '👤' },
    { key: 'due', label: 'Due', type: 'date', icon: '📅' },
    { key: 'progress', label: 'Progress', type: 'progress', icon: '▰' },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '08.05.2026', progress: 100 },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '10.05.2026', progress: 100 },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '20.05.2026', progress: 65 },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0 },
  ];
}</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | View name. |
| `label` | string | – | Tab label. |
| `group-by` | string | – | Select column key. |
| `title-key` | string | – | Card title column. |
| `meta-keys` | list | – | Comma-separated meta columns. |
| `new-row` | boolean | – | Show ＋ per column. |

**Events:** `nk-select` `{ row, id }` – Card clicked. · `nk-change` `{ row, key, value }` – Card dropped into another column. · `nk-action` `{ action: 'new-row', value }` – ＋ clicked (value = column).

**Properties:** `columns`, `rows`, `data` · **Methods:** `move(id, value)`, `refresh()`

**Replaces:** `.nk-board`, `.active`, `.nk-board-col`, `.nk-board-col-header`, `.count`, `.nk-card`, `.card-title`, `.card-meta`

```html
<!-- equivalent class markup -->
<div class="nk-board active">
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag orange">Planned</span><span class="count">1</span></div><div class="nk-card" draggable="true"><div class="card-title">▤ Board view & drag-and-drop</div><div class="card-meta"><span>📅 02.06.2026</span><span>▰ 0%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag blue">In progress</span><span class="count">1</span></div><div class="nk-card" draggable="true"><div class="card-title">🗃️ Database table view</div><div class="card-meta"><span>📅 20.05.2026</span><span>▰ 65%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
  <div class="nk-board-col"><div class="nk-board-col-header"><span class="nk-tag green">Done</span><span class="count">2</span></div><div class="nk-card" draggable="true"><div class="card-title">🧭 App shell & sidebar</div><div class="card-meta"><span>📅 08.05.2026</span><span>▰ 100%</span></div></div><div class="nk-card" draggable="true"><div class="card-title">📄 Page shell & typography</div><div class="card-meta"><span>📅 10.05.2026</span><span>▰ 100%</span></div></div><div class="nk-new-row" style="padding:6px 10px">＋</div></div>
</div>
```

**Small screens:** Columns scroll horizontally.

### 3.63 `<nk-filter-bar>` – Filter bar

A toolbar composed from existing classes: filter and sort buttons (`nk-action`), active filters as removable chips, an optional search field. `bar.apply(rows)` keeps rows where every chip matches by strict equality (`row[key] === value`, so use the option value) and the search text appears in any string field (a person’s `name`); the data logic stays yours.

```html
<nk-filter-bar search placeholder="Search rows …"></nk-filter-bar>
<script>{ document.currentScript.previousElementSibling.filters = [{ key: 'status', value: 'done', label: 'Status: Done', color: 'green' }]; }</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `search` | boolean | – | Show the search field. |
| `placeholder` | string | – | Search placeholder. |
| `no-filter` | boolean | – | Hide the filter button. |
| `no-sort` | boolean | – | Hide the sort button. |

**Slots:** `(default)` – Extra controls between chips and search.

**Events:** `nk-change` `{ filters, search }` – Chip removed or search typed. · `nk-action` `{ action: 'filter' | 'sort' }` – Button clicked.

**Properties:** `filters`, `value` · **Methods:** `apply(rows)`

**Replaces:** `.nk-btn`, `.secondary`, `.small`, `.nk-tag`, `.nk-input`

```html
<!-- equivalent class markup -->
<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0"><button class="nk-btn secondary small">⚲ Filter</button><button class="nk-btn secondary small">↕ Sort</button><span style="display:inline-flex;gap:4px"><span class="nk-tag green" style="cursor:pointer">Status: Done ×</span></span><input class="nk-input" type="search" placeholder="Search rows …" style="margin-left:auto"></div>
```

**Small screens:** Wraps onto two lines.

### 3.64 `<nk-comments>` – Comment thread

A left-ruled thread of `nk-comment`s with an input row. Enter or the button fires `nk-submit { text }`; appending the new comment is yours.

```html
<nk-comments placeholder="Comment …" send-label="Send">
  <nk-comment author="Sara Lindt" time="1 hr ago" color="#448361">The board view already feels very close to the original. 👍</nk-comment>
  <nk-comment author="Mona" time="20 min ago" avatar="✨" color="var(--nk-text-tertiary)"><span slot="head" class="nk-tag blue" style="font-size:10.5px">AI</span>I have flagged the overdue entries and prepared a summary.</nk-comment>
</nk-comments>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `placeholder` | string | – | Input placeholder. |
| `send-label` | string | `Send` | Button text. |
| `no-input` | boolean | – | Read-only thread. |
| `disabled` | boolean | – | Input disabled. |

**Slots:** `(default)` – `nk-comment` children.

**Events:** `nk-submit` `{ text }` – New comment typed; `preventDefault()` keeps the text.

**Properties:** `value` · **Methods:** `submit()`, `focus()`

**Replaces:** `.nk-comments`, `.nk-comment`, `.mini-avatar`, `.c-head`, `.c-body`, `.nk-comment-input`

```html
<!-- equivalent class markup -->
<div class="nk-comments">
  <div class="nk-comment"><span class="mini-avatar" style="background:#448361">SL</span><div><div class="c-head"><b>Sara Lindt</b> · 1 hr ago</div><div class="c-body">The board view already feels very close to the original. 👍</div></div></div>
  <div class="nk-comment"><span class="mini-avatar" style="background:var(--nk-text-tertiary)">✨</span><div><div class="c-head"><b>Mona</b><span class="nk-tag blue" style="font-size:10.5px">AI</span> · 20 min ago</div><div class="c-body">I have flagged the overdue entries and prepared a summary.</div></div></div>
  <div class="nk-comment-input"><input class="nk-input" placeholder="Comment …"><button class="nk-btn primary small">Send</button></div>
</div>
```

**Small screens:** Unchanged.

### 3.65 `<nk-comment>` – Comment

One comment: avatar (initials + `color`), bold author, time, body. `slot="head"` adds content after the name.

```html
<nk-comments no-input><nk-comment author="Sara Lindt" time="1 hr ago" color="#448361">The board view already feels very close to the original. 👍</nk-comment></nk-comments>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `author` | string | – | Name. |
| `time` | string | – | Relative time. |
| `avatar` | string | – | Initials/emoji (default: from the author). |
| `color` | CSS color | – | Avatar background. |

**Slots:** `(default)` – Body. · `head` – After the name (tag, badge). · `avatar` – Custom avatar.

**Replaces:** `.nk-comment`, `.c-head`, `.c-body`

```html
<!-- equivalent class markup -->
<div class="nk-comments"><div class="nk-comment"><span class="mini-avatar" style="background:#448361">SL</span><div><div class="c-head"><b>Sara Lindt</b> · 1 hr ago</div><div class="c-body">The board view already feels very close to the original. 👍</div></div></div></div>
```

**Small screens:** Unchanged.

### 3.66 `<nk-ai-thread>` – AI thread

The conversation column: `nk-ai-msg` children (`role="user"` gets the gradient avatar), followed by an `nk-ai-input-row`. Action buttons in `slot="actions"` fire `nk-action { action, value }` – both carry the button’s `value` (or its text).

```html
<nk-ai-thread>
  <nk-ai-msg role="user" name="You" avatar="MK">Summarise the open tasks for this project.</nk-ai-msg>
  <nk-ai-msg role="assistant" name="Mona" badge="· AI">Two tasks are open: the <b>table view</b> sits at 65 % (due 20 May), the <b>board with drag and drop</b> is planned.
    <button slot="actions" value="copy">📋 Copy</button><button slot="actions" value="rephrase">↻ Rephrase</button><button slot="actions" value="like">👍</button>
  </nk-ai-msg>
</nk-ai-thread>
<nk-ai-input-row placeholder="Ask Mona something …"></nk-ai-input-row>
```

_No attributes._

**Slots:** `(default)` – `nk-ai-msg` children.

**Events:** `nk-action` `{ action }` – Action button of a message.

**Replaces:** `.nk-ai-thread`, `.nk-ai-msg`, `.user`, `.a-body`, `.a-name`, `.nk-ai-actions`, `.nk-ai-input-row`, `.nk-ai-send`

```html
<!-- equivalent class markup -->
<div class="nk-ai-thread">
  <div class="nk-ai-msg user"><span class="mini-avatar">MK</span><div class="a-body"><div class="a-name">You</div>Summarise the open tasks for this project.</div></div>
  <div class="nk-ai-msg"><span class="mini-avatar">✨</span><div class="a-body"><div class="a-name">Mona <span>· AI</span></div>Two tasks are open: the <b>table view</b> sits at 65 % (due 20 May), the <b>board with drag and drop</b> is planned.<div class="nk-ai-actions"><button>📋 Copy</button><button>↻ Rephrase</button><button>👍</button></div></div></div>
</div>
<div class="nk-ai-input-row"><span style="font-size:14px">✨</span><input placeholder="Ask Mona something …"><button class="nk-ai-send">↑</button></div>
```

**Small screens:** Unchanged.

### 3.67 `<nk-ai-msg>` – AI message

One message. `role="user"` flips the avatar to the gradient; `badge` is the grey suffix after the name (“· AI”); plain `<button slot="actions">`s form the action row.

```html
<nk-ai-thread><nk-ai-msg role="assistant" name="Mona" badge="· AI">Two tasks are open: the <b>table view</b> sits at 65 % (due 20 May), the <b>board with drag and drop</b> is planned.<button slot="actions" value="copy">📋 Copy</button></nk-ai-msg></nk-ai-thread>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `role` | user | assistant | `assistant` | Who speaks. |
| `name` | string | – | Name line. |
| `badge` | string | – | Grey suffix. |
| `avatar` | string | – | Initials/emoji. |
| `color` | CSS color | – | Avatar background override. |

**Slots:** `(default)` – Message body (HTML allowed). · `actions` – `<button value>` children. · `avatar` – Custom avatar.

**Events:** `nk-action` `{ action, value }` – Action button clicked.

**Replaces:** `.nk-ai-msg`, `.user`, `.a-body`, `.a-name`, `.nk-ai-actions`

```html
<!-- equivalent class markup -->
<div class="nk-ai-thread"><div class="nk-ai-msg"><span class="mini-avatar">✨</span><div class="a-body"><div class="a-name">Mona <span>· AI</span></div>Two tasks are open: the <b>table view</b> sits at 65 % (due 20 May), the <b>board with drag and drop</b> is planned.<div class="nk-ai-actions"><button>📋 Copy</button></div></div></div></div>
```

**Small screens:** Unchanged.

### 3.68 `<nk-ai-input-row>` – AI input row

The prompt field with ✨ and a send button. Enter or the button fires `nk-submit { text }` and clears the field.

```html
<nk-ai-input-row placeholder="Ask Mona something …"></nk-ai-input-row>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `placeholder` | string | – | Placeholder. |
| `value` | string | – | Preset text. |
| `disabled` | boolean | – | Disabled while the assistant answers. |
| `icon` | string | `✨` | Leading glyph. |

**Events:** `nk-submit` `{ text }` – Prompt sent.

**Properties:** `value` · **Methods:** `submit()`, `focus()`

**Replaces:** `.nk-ai-input-row`, `.nk-ai-send`

```html
<!-- equivalent class markup -->
<div class="nk-ai-input-row"><span style="font-size:14px">✨</span><input placeholder="Ask Mona something …"><button class="nk-ai-send">↑</button></div>
```

**Small screens:** Unchanged.


# 4. Composition Patterns (app skeletons)

Six skeletons, one per app shape, mirroring the NotionKit CSS SKILL.md. Copy one, delete what you do not need.

## 4.1 Workspace app

**When:** the default for Notion-like document apps – pages are the primary object, a tree on the left, one page on the right.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.1.1/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.0.1/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<nk-app>
  <nk-sidebar slot="sidebar" id="sidebar">
    <nk-workspace-switcher slot="workspace" name="MonaHilft"></nk-workspace-switcher>
    <nk-tree id="tree">
      <nk-tree-item icon="🔍" value="search" no-actions>Search<span slot="end" class="nk-kbd-hint"><nk-kbd>⌘</nk-kbd><nk-kbd>K</nk-kbd></span></nk-tree-item>
      <nk-tree-item icon="🏠" value="home">Home</nk-tree-item>
      <nk-tree-item icon="📥" value="inbox">Inbox</nk-tree-item>
      <nk-section-label addable>Favourites</nk-section-label>
      <nk-tree-item icon="📊" value="overview" open>Project overview
        <nk-tree-item icon="🚀" value="mvp" active>NotionKit MVP</nk-tree-item>
        <nk-tree-item icon="🎙️" value="voh">Voice-Office-Hub</nk-tree-item>
      </nk-tree-item>
      <nk-section-label addable>Workspace</nk-section-label>
      <nk-tree-item icon="🧠" value="kb">Knowledge base
        <nk-tree-item icon="📄" value="onboarding">Onboarding</nk-tree-item>
      </nk-tree-item>
      <nk-tree-item icon="🎨" value="design">Design system</nk-tree-item>
    </nk-tree>
    <nk-tree-item slot="footer" icon="⚙️" value="settings" no-actions>Settings</nk-tree-item>
    <nk-tree-item slot="footer" icon="🗑️" value="trash" no-actions>Trash</nk-tree-item>
  </nk-sidebar>

  <nk-topbar>
    <nk-btn variant="topbar" onclick="sidebar.toggle()" aria-label="Menu">☰</nk-btn>
    <nk-breadcrumb><span>📊 Project overview</span><span>🚀 NotionKit MVP</span></nk-breadcrumb>
    <nk-btn slot="actions" variant="share">Share</nk-btn>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>

  <!-- wave 3 replaces this with <nk-page> / <nk-page-title> / <nk-block-host> -->
  <div class="nk-page-scroll"><div class="nk-cover"></div><div class="nk-page">
    <div class="nk-page-icon">🚀</div>
    <h1 class="nk-page-title">NotionKit MVP</h1>
    <p class="lead">A calm, document-centric workspace app – built from elements only.</p>
    <nk-callout icon="💡">The tree, topbar and sidebar are elements; the page body is still class markup until wave 3.</nk-callout>
  </div></div>
</nk-app>
<script>
  tree.addEventListener('nk-select', e => console.log('open page', e.detail.value));
  tree.addEventListener('nk-action', e => console.log(e.detail.action, 'on', e.detail.value));
</script>
</body>
</html>
```

Rules of the shell: `nk-sidebar`, `nk-topbar` and (from wave 3) `nk-page` are `display: contents` hosts – their inner boxes are direct flex children of `.nk-app` / `.nk-main`, so do not style the hosts. The ☰ button only matters below 860px, where the sidebar is hidden and `sidebar.toggle()` opens it as a drawer.

## 4.2 Database app

**When:** structured, data-centric apps – a CRM, a tracker, an editorial calendar. Rows are the primary object; the database is the main room.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.1.1/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.0.1/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<nk-app>
  <nk-sidebar slot="sidebar">
    <nk-workspace-switcher slot="workspace" name="MonaHilft"></nk-workspace-switcher>
    <nk-tree>
      <nk-section-label addable>Databases</nk-section-label>
      <nk-tree-item icon="🗃️" value="projects" active>Projects</nk-tree-item>
      <nk-tree-item icon="🤝" value="clients">Clients</nk-tree-item>
      <nk-tree-item icon="🗓️" value="editorial">Editorial plan</nk-tree-item>
    </nk-tree>
  </nk-sidebar>
  <nk-topbar>
    <nk-breadcrumb><span>🗃️ Projects</span></nk-breadcrumb>
    <nk-btn slot="actions" variant="share">Share</nk-btn>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>
  <nk-page icon="🗃️">
    <nk-page-title>Projects</nk-page-title>
    <nk-filter-bar id="filters" search placeholder="Search rows …"></nk-filter-bar>
    <nk-database id="db" view="table" add-view>
      <nk-table-view name="table" label="▦ Table" count new-row sortable></nk-table-view>
      <nk-board-view name="board" label="▤ Board" group-by="status" new-row></nk-board-view>
    </nk-database>
  </nk-page>
</nk-app>
<nk-toast id="toast"></nk-toast>
<script>
  const columns = [
    { key: 'name', label: 'Name', type: 'text', icon: '📄', title: true },
    { key: 'status', label: 'Status', type: 'select', icon: '◉', options: [
      { value: 'planned', label: 'Planned', color: 'orange' },
      { value: 'progress', label: 'In progress', color: 'blue' },
      { value: 'done', label: 'Done', color: 'green' } ] },
    { key: 'owner', label: 'Owner', type: 'person', icon: '👤' },
    { key: 'due', label: 'Due', type: 'date', icon: '📅' },
    { key: 'progress', label: 'Progress', type: 'progress', icon: '▰' },
  ];
  const rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '08.05.2026', progress: 100 },
    { id: 2, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: '#9065b0' }, due: '20.05.2026', progress: 65 },
    { id: 3, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0 },
  ];
  db.columns = columns;
  db.rows = rows;
  filters.addEventListener('nk-change', () => { db.rows = filters.apply(rows); });
  db.addEventListener('nk-select', e => console.log('open row', e.detail.row));
  db.addEventListener('nk-change', e => toast.show(`${e.detail.row.name} → ${e.detail.value}`));
  db.addEventListener('nk-action', e => { if (e.detail.action === 'new-row') { rows.push({ id: Date.now(), icon: '📄', name: 'New page', status: e.detail.value || 'planned', due: '—', progress: 0 }); db.rows = filters.apply(rows); } });
</script>
</body>
</html>
```

Data contract: `columns` describe the properties (`type`: text | select | multi-select | date | person | checkbox | url | number | progress; a `select` carries `options: [{ value, label, color }]`; the title column has `title: true`), `rows` are plain objects keyed by `column.key` (a `person` is `{ name, initials, color }` or a string; `icon` on a row prefixes the title). The elements render what they get – filtering, sorting on the server, persistence are yours. Assign a new array (`db.rows = …`) or call `db.refresh()` after mutating rows in place.

## 4.4 AI chat page

**When:** assistant-centred apps where the conversation is the document.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.1.1/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.0.1/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<nk-app>
  <nk-sidebar slot="sidebar">
    <nk-workspace-switcher slot="workspace" name="MonaHilft"></nk-workspace-switcher>
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
      <nk-ai-msg role="user" name="You" avatar="MK">Summarise the open tasks for this project.</nk-ai-msg>
      <nk-ai-msg role="assistant" name="Mona" badge="· AI">Two tasks are open: the <b>table view</b> sits at 65 % (due 20 May), the <b>board with drag and drop</b> is planned.
        <button slot="actions" value="copy">📋 Copy</button>
        <button slot="actions" value="rephrase">↻ Rephrase</button>
      </nk-ai-msg>
    </nk-ai-thread>
    <nk-ai-input-row id="prompt" placeholder="Ask Mona something …"></nk-ai-input-row>
  </nk-page>
</nk-app>
<script>
  prompt.addEventListener('nk-submit', async e => {
    const user = document.createElement('nk-ai-msg');
    user.setAttribute('role', 'user'); user.setAttribute('name', 'You'); user.setAttribute('avatar', 'MK');
    user.textContent = e.detail.text;
    thread.appendChild(user);
    prompt.disabled = true;
    const reply = document.createElement('nk-ai-msg');
    reply.setAttribute('name', 'Mona'); reply.setAttribute('badge', '· AI');
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
```

## 4.3 Settings modal integration

**When:** you have an app already and need the settings overlay – plus the command palette and a toast, since they share the "overlay under body" rule.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.1.1/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.0.1/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<!-- your app -->
<div class="nk-page" style="padding-top:48px">
  <nk-page-title>NotionKit MVP</nk-page-title>
  <p><nk-btn variant="secondary" onclick="settings.show()">⚙️ Open settings</nk-btn> <nk-btn variant="secondary" onclick="palette.show()">🔍 Open palette (⌘K)</nk-btn></p>
</div>

<!-- overlays: direct children of <body> -->
<nk-modal id="settings">
  <nk-settings-user slot="user" name="Marcel Karas" mail="marcel@monahilft.de"></nk-settings-user>

  <nk-settings-pane name="profile" group="Account" icon="👤" label="My profile" title="My profile" active>
    <nk-profile-row avatar="MK"><nk-btn variant="secondary" small>Change photo</nk-btn> <nk-btn variant="danger" small>Remove</nk-btn></nk-profile-row>
    <h3>Display name</h3>
    <nk-field label="Display name" desc="Shown next to your comments."><nk-input name="name" value="Marcel Karas"></nk-input></nk-field>
    <nk-field label="Email"><nk-input name="email" type="email" value="marcel@monahilft.de"></nk-input></nk-field>
    <p style="margin-top:16px"><nk-btn variant="primary" small onclick="toast.show('Settings saved')">Save</nk-btn></p>
  </nk-settings-pane>

  <nk-settings-pane name="appearance" group="Account" icon="🎨" label="Appearance" title="Appearance">
    <nk-field label="Theme"><nk-select id="themeSelect"><option value="light">Light</option><option value="dark">Dark</option></nk-select></nk-field>
    <nk-field label="Font size"><nk-slider min="12" max="18" value="14" unit="px" show-value></nk-slider></nk-field>
  </nk-settings-pane>

  <nk-settings-pane name="ai" group="Account" icon="✨" label="AI assistant" title="AI assistant">
    <nk-model-card name="model" value="pro" title="Mona Pro" desc="Best for long documents and research." selected></nk-model-card>
    <nk-model-card name="model" value="fast" title="Mona Fast" desc="Quick answers, lower cost."></nk-model-card>
  </nk-settings-pane>

  <nk-settings-pane name="general" group="Workspace" icon="⚙️" label="General" title="General">
    <nk-field label="MonaHilft"><nk-input value="MonaHilft"></nk-input></nk-field>
    <nk-danger-zone title="Danger zone"><nk-field label="Delete workspace" desc="Deleting the workspace removes every page."><nk-btn variant="danger-solid" small>Delete</nk-btn></nk-field></nk-danger-zone>
  </nk-settings-pane>

  <nk-settings-pane name="members" group="Workspace" icon="👥" label="Members" title="Members">
    <nk-member-list>
      <nk-member-row name="Sara Lindt" mail="sara@example.com" color="#448361"><nk-select slot="role" compact value="editor"><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></nk-select></nk-member-row>
      <nk-member-row name="Tom Weber" mail="tom@example.com" color="#d9730d"><nk-select slot="role" compact value="viewer"><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></nk-select></nk-member-row>
    </nk-member-list>
  </nk-settings-pane>
</nk-modal>

<nk-cmdk id="palette" placeholder="Search or type a command …"></nk-cmdk>
<nk-toast id="toast"></nk-toast>

<script>
  palette.commands = [
    { group: 'Pages', items: [{ id: 'mvp', icon: '🚀', label: 'NotionKit MVP' }, { id: 'kb', icon: '🧠', label: 'Knowledge base' }] },
    { group: 'Actions', items: [
      { id: 'settings', icon: '⚙️', label: 'Open settings', shortcut: '⌘,', action: () => settings.show() },
      { id: 'theme', icon: '🌙', label: 'Toggle theme', shortcut: '⌘⇧L', action: () => document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark' },
    ]},
  ];
  palette.addEventListener('nk-command', e => console.log('command', e.detail.id));
  themeSelect.addEventListener('nk-change', e => document.documentElement.dataset.theme = e.detail.value);
  settings.addEventListener('nk-select', e => console.log('pane', e.detail.value));
</script>
</body>
</html>
```

The open/close contract is one attribute: `settings.open = true`, `settings.show('members')`, `settings.close()`. Never add the class `open` yourself.

## 4.5 Form / onboarding page

**When:** an app – or one step of it – made entirely of form elements. No sidebar, no editor.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.1.1/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.0.1/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<div class="nk-page" style="padding-top:48px">
  <h1 class="nk-page-title">Set up your workspace</h1>
  <p class="lead">Three short steps. Everything can be changed later in Settings.</p>

  <form id="onboarding">
    <nk-heading>1 · Profile</nk-heading>
    <nk-field label="Display name" desc="Shown next to your comments."><nk-input name="name" required></nk-input></nk-field>
    <nk-field label="Email"><nk-input name="email" type="email" required></nk-input></nk-field>
    <nk-field label="Short bio"><nk-textarea name="bio" rows="3" placeholder="A sentence about you"></nk-textarea></nk-field>

    <nk-heading>2 · Notifications</nk-heading>
    <nk-field label="Email notifications"><nk-switch name="notify" checked></nk-switch></nk-field>
    <nk-check name="digest" value="weekly" checked>Weekly digest</nk-check>
    <nk-check name="digest" value="mentions">Mentions only</nk-check>

    <nk-heading>3 · Assistant style</nk-heading>
    <nk-radio name="style" value="concise">Concise</nk-radio>
    <nk-radio name="style" value="balanced" checked>Balanced</nk-radio>
    <nk-radio name="style" value="detailed">Detailed</nk-radio>
    <nk-field label="Font size"><nk-slider name="size" min="12" max="18" value="14" unit="px" show-value></nk-slider></nk-field>

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
```

## 4.6 Landing / documentation page

**When:** a public page in the NotionKit look – no sidebar, the page *is* the document. For a complete website use [NotionKit Web](https://notionkit-web.jungherz.com), the Astro template on the same foundation.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.1.1/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.0.1/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<nk-page narrow icon="📘" cover>
  <nk-page-title>NotionKit Elements</nk-page-title>
  <nk-page-actions><span>👤 Marcel Karas</span><span>📅 Created 12 May 2026</span><span>🏷️ <nk-tag color="green">Done</nk-tag></span></nk-page-actions>
  <p class="lead">A calm, document-centric workspace app – built from elements only.</p>

  <nk-banner variant="info">ℹ️ <span>This page is a <b>component preview</b> – every element follows the same design tokens.</span><span slot="action">View</span></nk-banner>
  <nk-callout icon="💡"><b>Core idea:</b> A callout carries one thought that must not be missed.</nk-callout>

  <nk-heading>Getting started</nk-heading>
  <nk-code lang="html" highlight>&lt;nk-btn variant="primary"&gt;Save&lt;/nk-btn&gt;</nk-code>

  <nk-heading>Building blocks</nk-heading>
  <nk-tabs value="notes">
    <nk-tab value="notes">📝 Notes</nk-tab><nk-tab value="tasks">✅ Tasks</nk-tab>
    <div slot="panel" data-tab="notes" class="nk-tab-panel">Free-form notes on the project – meeting minutes, ideas, rough drafts.</div>
    <div slot="panel" data-tab="tasks" class="nk-tab-panel">Tasks for this project, linked to the database below.</div>
  </nk-tabs>
  <nk-stats>
    <nk-stat label="Active pages" value="128" delta="▲ 12 this week" trend="up"></nk-stat>
    <nk-stat label="Open tasks" value="14" delta="▼ 5 since yesterday" trend="down"></nk-stat>
  </nk-stats>

  <nk-toggle label="Details" open>Folded content lives here.</nk-toggle>
  <nk-quote cite="Unknown">The best interface is the one that gets out of the way.</nk-quote>
  <nk-divider></nk-divider>
  <nk-empty icon="🗂️" title="No entries yet" desc="Create the first entry or import existing data."><nk-btn variant="primary" small>＋ New entry</nk-btn></nk-empty>
</nk-page>
</body>
</html>
```

Note `narrow`: the page is the document, so there is no inner scroll wrapper – the browser scrolls. Inside `<nk-app>` leave it off.


# 5. State & Event Overview

| Event | Fired by | `detail` |
|---|---|---|
| `nk-change` | every form control, `nk-segmented`, `nk-tabs`, editable `nk-page-title` | `{ value, name }` – checkables add `checked` |
| `nk-input` | `nk-input`, `nk-textarea`, `nk-slider` | `{ value, name }` on every keystroke / drag |
| `nk-toggle` | `nk-toggle`, tree branches, overlays | `{ open }` |
| `nk-select` | tree items, menu items, breadcrumb, tabs, palette rows | `{ value, label, … }` |
| `nk-view-change` | `nk-database` | `{ view }` |
| `nk-command` | `nk-cmdk` | `{ id, item, query }` |
| `nk-submit` | comment and AI input rows | `{ text }` |
| `nk-action` | hover actions (tree ＋/⋯, section ＋, new row …) | `{ action, value? }` |

Form controls additionally re-dispatch a native, bubbling `change` event, so `form.addEventListener('change', …)` keeps working.


# 6. Rules & Common Mistakes

### Always follow

1. `notionkit.css` on the document and `class="nk-body"` on `<body>` – the shadow roots inherit from there.
2. `data-theme` on `<html>` only – the observer watches nothing else.
3. Form controls inside a `<form>` if their value should be submitted; `FormData` reads them like native fields.
4. Pass icons as the slotted node itself: `<span slot="icon">📌</span>`.
5. Toggle state through attributes or properties (`el.open = true`, `el.setAttribute('active', '')`), never through classes inside the shadow root.
6. `<nk-select>` options are direct `<option>`/`<optgroup>` children; change them in the light DOM and the element follows.
7. Brand on `:root`, not on a subtree – tokens are inherited into every shadow root from the document.
8. Import the bundle once per page. `customElements.define` throws on a second definition.

### Common mistakes

| Mistake | Correction |
|---|---|
| `<span slot="icon"><svg/></span>` (wrapped icon) | `<svg slot="icon">` – `::slotted()` matches only the assigned node |
| Declaring `--nk-*` tokens inside a shadow root, or adopting the full `nkSheet` | Tokens go on the document (`:root`); elements adopt `componentsSheet` only |
| Injecting your own CSS into `element.shadowRoot` | Restyle through tokens on `:root`; the elements carry no CSS of their own |
| `data-theme` on a `<nk-*>` element or a wrapper div | Only `<html data-theme>` is observed |
| `el.shadowRoot.querySelector('.nk-btn').classList.add('primary')` | `el.variant = 'primary'` |
| `<nk-radio>`s with different `name`s expected to exclude each other | Same `name` in the same tree and form makes the group |
| A form control outside `<form>` expected in `FormData` | Put it inside the form (or read `el.value`) |
| `<button class="nk-btn">` inside `<nk-btn>` | The element renders the button – slot only the label and icon |
| Loading the bundle without `notionkit.css` and wondering about the serif font | The token layer only covers colours and metrics; typography comes from `.nk-body` |
| `<nk-btn style="margin-top:16px">` or `nk-callout { margin: … }` | Hosts are `display: contents` and have no box – put spacing on a wrapper you own |


# 7. Quick Reference

| Tag | Group | Key attributes | Key slots | Key events |
|---|---|---|---|---|
| `<nk-btn>` | forms | `variant`, `small`, `disabled`, `type` | `(default)` | `click` |
| `<nk-input>` | forms | `value`, `type`, `placeholder`, `name` | – | `nk-change`, `nk-input` |
| `<nk-textarea>` | forms | `value`, `placeholder`, `rows`, `name` | `(default)` | `nk-change`, `nk-input` |
| `<nk-select>` | forms | `value`, `name`, `disabled`, `required` | `(default)` | `nk-change` |
| `<nk-switch>` | forms | `checked`, `name`, `disabled`, `value` | – | `nk-change` |
| `<nk-check>` | forms | `checked`, `indeterminate`, `name`, `disabled` | `(default)` | `nk-change` |
| `<nk-radio>` | forms | `checked`, `name`, `disabled`, `value` | `(default)` | `nk-change` |
| `<nk-slider>` | forms | `value`, `min`, `max`, `step` | – | `nk-change`, `nk-input` |
| `<nk-field>` | forms | `label`, `desc` | `(default)`, `label`, `desc` | – |
| `<nk-tag>` | content | `color` | `(default)` | – |
| `<nk-progress>` | content | `value`, `max`, `label` | – | – |
| `<nk-callout>` | content | `icon` | `(default)`, `icon` | – |
| `<nk-divider>` | content | – | – | – |
| `<nk-heading>` | content | `level` | `(default)` | – |
| `<nk-toggle>` | content | `label`, `open` | `(default)`, `label` | `nk-toggle` |
| `<nk-todo>` | content | `checked`, `name`, `disabled`, `value` | `(default)` | `nk-change` |
| `<nk-kbd>` | content | – | `(default)` | – |
| `<nk-code>` | content | `lang`, `highlight` | `(default)` | – |
| `<nk-quote>` | content | `cite` | `(default)` | – |
| `<nk-app>` | shell | – | `sidebar`, `(default)` | – |
| `<nk-sidebar>` | shell | `open` | `workspace`, `(default)`, `footer` | `nk-toggle` |
| `<nk-workspace-switcher>` | shell | `name`, `avatar`, `open` | `avatar`, `menu` | `nk-toggle`, `nk-select` |
| `<nk-section-label>` | shell | `addable`, `label` | `(default)` | `nk-action` |
| `<nk-tree>` | shell | `manual` | `(default)` | `nk-select`, `nk-toggle`, `nk-action` |
| `<nk-tree-item>` | shell | `icon`, `label`, `value`, `href` | `(default)`, `icon`, `end` | `nk-select`, `nk-toggle`, `nk-action` |
| `<nk-topbar>` | shell | – | `(default)`, `actions` | – |
| `<nk-breadcrumb>` | shell | `separator` | `(default)` | `nk-select` |
| `<nk-theme-toggle>` | shell | `storage-key`, `title` | – | `nk-change` |
| `<nk-page>` | page | `icon`, `cover`, `narrow` | `(default)`, `cover`, `icon` | `nk-action` |
| `<nk-page-cover>` | page | `src` | – | – |
| `<nk-page-title>` | page | `editable`, `placeholder`, `value` | `(default)` | `nk-change` |
| `<nk-page-actions>` | page | – | `(default)` | – |
| `<nk-block-host>` | page | `handle`, `drop-target` | `(default)` | – |
| `<nk-banner>` | page | `variant` | `(default)`, `action` | – |
| `<nk-empty>` | page | `icon`, `title`, `desc` | `(default)`, `icon`, `title`, `desc` | – |
| `<nk-skeleton>` | page | `lines`, `height`, `width`, `widths` | – | – |
| `<nk-synced>` | page | `badge` | `(default)` | – |
| `<nk-tabs>` | page | `value` | `(default)`, `panel` | `nk-change`, `nk-select` |
| `<nk-tab>` | page | `value`, `active`, `disabled` | `(default)` | `nk-select` |
| `<nk-segmented>` | page | `value`, `name`, `disabled` | `(default)` | `nk-change` |
| `<nk-stats>` | page | `label`, `value`, `delta`, `trend` | `(default)` | – |
| `<nk-stat>` | page | `label`, `value`, `delta`, `trend` | `label`, `value`, `delta` | – |
| `<nk-avatar-group>` | page | `more` | `(default)` | – |
| `<nk-mention>` | page | `type` | `avatar`, `(default)` | – |
| `<nk-template-btn>` | page | `icon`, `value`, `disabled` | `(default)` | `nk-select` |
| `<nk-model-card>` | page | `title`, `desc`, `name`, `disabled` | `title`, `desc` | `nk-change`, `nk-select` |
| `<nk-profile-row>` | page | `avatar` | `avatar`, `(default)` | – |
| `<nk-danger-zone>` | page | `title` | `(default)` | – |
| `<nk-member-list>` | page | `name`, `mail`, `avatar`, `color` | `(default)`, `role`, `avatar` | – |
| `<nk-member-row>` | page | `name`, `mail`, `avatar`, `color` | `role`, `avatar`, `(default)` | – |
| `<nk-modal>` | overlays | `open`, `pane` | `(default)`, `user`, `nav` | `nk-toggle`, `nk-select` |
| `<nk-settings-pane>` | overlays | `name`, `label`, `icon`, `group` | `(default)` | – |
| `<nk-settings-user>` | overlays | `name`, `mail`, `avatar` | `avatar` | – |
| `<nk-cmdk>` | overlays | `open`, `hotkey`, `placeholder` | `footer` | `nk-command`, `nk-toggle` |
| `<nk-menu>` | overlays | – | `(default)` | `nk-select` |
| `<nk-menu-item>` | overlays | `icon`, `shortcut`, `value`, `danger` | `(default)`, `icon` | `nk-select` |
| `<nk-pop>` | overlays | `open`, `placement`, `bare` | `trigger`, `(default)` | `nk-toggle` |
| `<nk-emoji-picker>` | overlays | `placeholder`, `value` | – | `nk-select` |
| `<nk-toast>` | overlays | `open`, `duration`, `icon` | `(default)` | `nk-toggle` |
| `<nk-database>` | data | `view`, `add-view` | `(default)` | `nk-view-change`, `nk-action`, `nk-select / nk-change / nk-action` |
| `<nk-table-view>` | data | `name`, `label`, `badge`, `count` | – | `nk-select`, `nk-change`, `nk-action` |
| `<nk-board-view>` | data | `name`, `label`, `group-by`, `title-key` | – | `nk-select`, `nk-change`, `nk-action` |
| `<nk-filter-bar>` | data | `search`, `placeholder`, `no-filter`, `no-sort` | `(default)` | `nk-change`, `nk-action` |
| `<nk-comments>` | data | `placeholder`, `send-label`, `no-input`, `disabled` | `(default)` | `nk-submit` |
| `<nk-comment>` | data | `author`, `time`, `avatar`, `color` | `(default)`, `head`, `avatar` | – |
| `<nk-ai-thread>` | data | – | `(default)` | `nk-action` |
| `<nk-ai-msg>` | data | `role`, `name`, `badge`, `avatar` | `(default)`, `actions`, `avatar` | `nk-action` |
| `<nk-ai-input-row>` | data | `placeholder`, `value`, `disabled`, `icon` | – | `nk-submit` |

# 8. Framework Integration

- **Vanilla:** attributes for static config, properties for data, `addEventListener('nk-change', …)`.
- **React:** use `ref` for properties and events (`ref.current.addEventListener('nk-change', …)`); boolean attributes need `checked={true ? '' : undefined}` or property assignment. React 19 sets properties automatically.
- **Vue 3:** `app.config.compilerOptions.isCustomElement = tag => tag.startsWith('nk-')`; bind data with `.prop` (`:rows.prop="rows"`), listen with `@nk-change`.
- **Svelte:** works out of the box; `on:nk-change`; properties via `bind:this` + assignment.
- **SSR:** the elements render client-side. Server-render the page with `.nk-*` class markup where first paint matters and let the elements take over the interactive parts.


# 9. Architecture Notes

| Concept | Location |
|---|---|
| Base classes `NkElement` / `NkFormElement` | `src/base.js` – shadow root, adopted `componentsSheet`, theme wrapper, `render/setupEvents/teardownEvents/onAttributeChanged/projectLightDom/refresh`, ElementInternals |
| Token injection | `src/base.js` – once per page, `@layer notionkit-defaults { tokensCss }` appended to `document.adoptedStyleSheets` |
| Theme sync | one `MutationObserver` on `<html>[data-theme]`, a `Set` of instances, `.nk-wrapper[data-theme]` inside each root |
| Components | `src/components/{forms,content,shell,page,overlays,data}/nk-*.js`, one tag per file, `customElements.define` at the bottom |
| Build | Rollup: IIFE, minified IIFE, ESM, and per-component ESM entries with a shared chunk (`dist/components/`) |
| Peer | `@jungherz-de/notionkit >= 1.0.0`; 1.1.0 recommended (slot-name twins, disabled optics) |

Lifecycle: construct (attach shadow, adopt sheets) → first connect (wrapper + `render()`) → every connect (`setupEvents()`, theme registration, light-DOM observer) → `attributeChangedCallback` → `onAttributeChanged` → disconnect (`teardownEvents()`, unregister).


---
*NotionKit Elements v1.0.1 · wrapping NotionKit CSS v1.1.1 · MIT · Jungherz GmbH*
