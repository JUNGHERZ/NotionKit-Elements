---
name: notionkit-elements
description: NotionKit Elements is a vanilla-JS Web Components library (v1.18.0) wrapping NotionKit CSS v1.18.0 – the calm, document-centric design system in the Notion idiom. 88 custom elements with the `nk-` prefix, Shadow DOM, automatic light/dark sync via data-theme on <html>, and form-associated controls. Use this reference whenever generating HTML that uses <nk-*> tags to get attributes, slots, events and composition right.
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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
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
// or one element at a time (shared code: base.js):
import '@jungherz-de/notionkit-elements/components/nk-btn.js';
// the sheet the elements adopt, for your own views – never a second copy:
import { componentsSheet } from '@jungherz-de/notionkit-elements';
```

The per-component files import NotionKit's sheet as `@jungherz-de/notionkit/notionkit-styles.js` instead of carrying a copy. A bundler resolves it; a build-free page maps it once:

```html
<script type="importmap">{ "imports": { "@jungherz-de/notionkit/notionkit-styles.js": "/node_modules/@jungherz-de/notionkit/notionkit-styles.js" } }</script>
```

Never mix the full bundle with the per-component files – each brings its own `NkElement`. With the bundle, take `componentsSheet` and `NkElement` from it (`NotionKitElements.componentsSheet` from the `<script>` build).


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
| Language | The texts an element brings along – button labels, placeholders, accessible names – come in English and German after its nearest `lang` (across shadow roots), else `<html lang>`. An attribute on the element wins. `setStrings({ key: '…' }, lang?)` adds or replaces texts, and the elements on the page take them at once; your own `NkElement` reads them with `this.str('key')`. Percentages follow as `Intl` writes them (`45 %` in German). |
| Links | A step of `nk-steps` with `href` and a card of `nk-gallery-view` whose row has an address (`href-key`) are real `<a href>`: a middle click opens a new tab, the context menu copies the link. A plain click or Enter fires the cancelable `nk-select` – cancel it to route yourself; middle and modified clicks fire nothing. |


# 3. Element Catalog (88 elements)

## Forms & controls (wave 1)

### 3.1 `<nk-btn>` – Button

Renders `button.nk-btn`, or `a.nk-btn` when `href` is set. Modifier classes become attributes. A slotted `<svg>` is sized by the stylesheet – pass it directly, never wrapped. Stretched across a column – a full-width button on a sign-in page – it keeps its label centred.

```html
<nk-btn variant="primary">Save</nk-btn>
<nk-btn variant="secondary">Cancel</nk-btn>
<nk-btn variant="danger" small>Delete</nk-btn>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `variant` | primary | secondary | danger | danger-solid | topbar | share | tool | sidebar | – | Visual variant. `topbar` and `share` render `.nk-topbar-btn` for the top bar. `tool` renders `.nk-db-tool`, a tool in the database toolbar (`slot="tools"` of `nk-database`). `sidebar` is the ☰ `.nk-topbar-btn.nk-sidebar-toggle`: shown below 860px only, a click opens the `nk-sidebar` of its app as a drawer and sets `aria-expanded`. |
| `active` | boolean | – | A tool in effect – a set filter – takes the accent (`variant="tool"`). |
| `small` | boolean | – | Compact padding and 12.5px text. |
| `disabled` | boolean | – | Disabled; clicks are swallowed. |
| `type` | button | submit | reset | `button` | For `submit`/`reset` the surrounding `<form>` is submitted or reset. |
| `href` | URL | – | Renders a link instead of a button. |

**Slots:** `(default)` – Label text and an optional `<svg>` icon.

**Events:** `click` `(native, composed)` – The native click bubbles out of the shadow root.

**Replaces:** `.nk-btn`, `.primary`, `.secondary`, `.danger`, `.danger-solid`, `.small`, `.nk-topbar-btn`, `.nk-share-btn`, `.nk-db-tool`, `.active`, `.nk-sidebar-toggle`

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

**Small screens:** Minimum width 210px – inside a panel never wider than the tile; use `wide` to fill the row.

### 3.3 `<nk-copy-field>` – Copy field

A value to take along – a link, an address, a key – as tall as an input, with Copy inside on the right: it writes the clipboard and says “Copied” in green for a moment; where the clipboard is not allowed, the value is shown and selected for ⌘C. `secret` masks it behind Show/Hide, Copy still copies the real value. `value` set as a property is not reflected, so a key never lands in the markup. Each button carries an icon beside its word: on a phone, and with `icons` anywhere, the icon stands in for the word – two overlapping squares, an eye, a check in green for the moment after – and a masked key keeps a dozen characters more. The word stays the button’s name, and while the icons show, its tooltip for `nk-tooltip`.

```html
<div style="max-width:340px"><nk-copy-field value="https://monahilft.notionkit.app" copy-label="Copy"></nk-copy-field></div>
<div style="max-width:340px;margin-top:10px"><nk-copy-field value="ntn_4f2a9c1e8b7d6a5f3e2c" secret mono copy-label="Copy" show-label="Show"></nk-copy-field></div>
<div style="max-width:340px;margin-top:10px"><nk-copy-field value="ntn_4f2a9c1e8b7d6a5f3e2c" secret mono icons copy-label="Copy" show-label="Show"></nk-copy-field></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | The value. |
| `secret` | boolean | – | Masked, with Show/Hide. |
| `icons` | boolean | – | Icons instead of words at every width, not only on a phone. |
| `mono` | boolean | – | Monospace – addresses, keys, code. |
| `wrap` | boolean | – | A long value breaks instead of an ellipsis. |
| `wide` | boolean | – | Fills the row. |
| `copy-label` | string | `Copy · Kopieren` | Button text. |
| `copied-label` | string | `Copied · Kopiert` | Text for the moment after. |
| `show-label` | string | `Show · Zeigen` | Reveal (secret). |
| `hide-label` | string | `Hide · Verbergen` | Mask again. |

**Events:** `nk-action` `{ action: 'copy', value, ok }` – Copy clicked; `ok` is false where the clipboard refused.

**Properties:** `value`, `secret`, `icons` · **Methods:** `copy()`

**Replaces:** `.nk-copy-field`, `.cf-value`, `.cf-btn`, `.copied`, `.mono`, `.wrap`, `.wide`, `.icons`

```html
<!-- equivalent class markup -->
<div style="max-width:340px"><div class="nk-copy-field"><span class="cf-value">https://monahilft.notionkit.app</span><button class="cf-btn" aria-label="Copy"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/><rect x="9" y="9" width="12" height="12" rx="2"/></svg><span>Copy</span></button></div></div>
<div style="max-width:340px;margin-top:10px"><div class="nk-copy-field mono"><span class="cf-value">••••••••••••••••••••••••</span><button class="cf-btn" aria-label="Show"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><span>Show</span></button><button class="cf-btn" aria-label="Copy"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/><rect x="9" y="9" width="12" height="12" rx="2"/></svg><span>Copy</span></button></div></div>
<div style="max-width:340px;margin-top:10px"><div class="nk-copy-field mono icons"><span class="cf-value">••••••••••••••••••••••••</span><button class="cf-btn" aria-label="Show"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><span>Show</span></button><button class="cf-btn" aria-label="Copy"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/><rect x="9" y="9" width="12" height="12" rx="2"/></svg><span>Copy</span></button></div></div>
```

**Small screens:** Keeps to its column – inside a panel even below its 210px: the value is cut, never the actions. The actions are icons, with the words as their names and tooltips.

### 3.4 `<nk-image-picker>` – Image picker

A picture for a person or a workspace, on NotionKit’s profile row: round, or `square` for a workspace icon, with Upload / Change and Remove beside it. From GlassKit Elements: the file is decoded with its EXIF rotation, drawn no larger than `max` and handed over as a data URL in `nk-change` – upload it yourself; an unreadable file fires `nk-error`. JPEG is drawn on white; `type="image/png"` keeps transparency. `src` as a property is not reflected, so megabytes never land in the DOM.

```html
<nk-image-picker initials="AL" choose-label="Upload image"></nk-image-picker>
<nk-image-picker square src="/favicon.svg" change-label="Change image" remove-label="Remove"></nk-image-picker>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `src` | URL / data URL | – | Starting picture. |
| `initials` | string | – | Shown without a picture. |
| `square` | boolean | – | Rounded square – a workspace icon. |
| `max` | px | `512` | Longest edge after scaling. |
| `type` | MIME | `image/jpeg` | Output format. |
| `quality` | 0–1 | `0.82` | JPEG / WebP quality. |
| `accept` | string | `image/*` | File dialog filter. |
| `label` | string | – | Names the group. |
| `choose-label` | string | `Upload image · Bild hochladen` | Without a picture. |
| `change-label` | string | `Change image · Bild ändern` | With a picture. |
| `remove-label` | string | `Remove · Entfernen` | Remove button. |

**Events:** `nk-change` `{ dataUrl, width, height, size }` – A picture chosen – or removed, with an empty dataUrl. · `nk-error` `{ message, name }` – The file cannot be decoded.

**Properties:** `src`, `square` · **Methods:** `choose()`

**Replaces:** `.nk-profile-row`, `.big-avatar`, `.square`, `.pr-actions`, `.pr-remove`

```html
<!-- equivalent class markup -->
<div class="nk-profile-row"><div class="big-avatar">AL</div><div class="pr-actions"><button class="nk-btn secondary small">Upload image</button></div></div>
<div class="nk-profile-row"><div class="big-avatar square"><img src="/favicon.svg" alt=""></div><div class="pr-actions"><button class="nk-btn secondary small">Change image</button><button class="nk-btn secondary small pr-remove">Remove</button></div></div>
```

**Small screens:** Unchanged; the actions stay beside the picture.

### 3.5 `<nk-calendar>` – Date picker

Notion’s date picker as one element (NotionKit 1.9.0): a month with Today and ‹ ›, the keys, bounds and a form value. The value is a day (`YYYY-MM-DD`); with `range` an interval `start/end`, picked in two clicks in either order; with `time` a day and a time (`YYYY-MM-DDTHH:MM`). `weeks` puts the ISO calendar week in front of each row (“KW” in German), `weekend` greys the days not worked, the `days` property adds holidays (`off` with a `label`) and up to three `marks` per day in the nine colours – deadlines, milestones. Days outside `min`/`max` are announced as unavailable and cannot be picked. Arrows move by a day or a week, Home/End to the ends of the week, PageUp/PageDown by a month (with Shift a year), Enter or Space picks; one day is in the tab order. Month names, weekdays and the first day of the week come from the page’s language; `week-start="1"` fixes Monday. With `floating sheet` it is a popover that `show(anchor)` opens under a property or a cell, and a bottom sheet on a phone; a pick closes it. Put a floating one directly under `<body>`: an open `nk-dialog`, `nk-modal` or `nk-sheet` leaves it usable, so it opens from a field in a dialog as well.

```html
<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
<div class="nk-pop"><nk-calendar name="due" value="2026-06-02T09:30" time clearable weeks week-start="1" weekend="6,0" today="2026-06-17" today-label="Today" time-label="Time" clear-label="Clear" days='{"2026-06-04":{"off":true,"label":"Corpus Christi"},"2026-06-02":{"marks":["blue"]},"2026-06-11":{"marks":["orange","red"]},"2026-06-24":{"marks":["green"]}}'></nk-calendar></div>
<div class="nk-pop"><nk-calendar name="sprint" range value="2026-06-08/2026-06-12" weeks week-start="1" weekend="6,0" today="2026-06-17" today-label="Today" days='{"2026-06-04":{"off":true,"label":"Corpus Christi"}}'></nk-calendar></div>
</div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | YYYY-MM-DD | start/end | …THH:MM | – | The day, the range or the day and time; also the reset value. |
| `month` | YYYY-MM | – | The month shown first; default the value’s, else today’s. |
| `min` | YYYY-MM-DD | – | First day that can be picked. |
| `max` | YYYY-MM-DD | – | Last day that can be picked. |
| `range` | boolean | – | Two picks make a range `start/end`. |
| `time` | boolean | – | A time field under the month – single days only. |
| `clearable` | boolean | – | A Clear button under the month. |
| `weeks` | boolean | – | The ISO calendar week in front of each row. |
| `week-start` | 0–6 | `Intl` | First day of the week: 0 Sunday, 1 Monday … |
| `weekend` | list | – | Weekdays not worked, greyed – `6,0`. |
| `days` | JSON | – | Per day `{ off, label, marks }`; also the property. |
| `today` | YYYY-MM-DD | – | Another today – for tests and docs. |
| `locale` | BCP 47 | `lang` | Language of the names and the week. |
| `floating` | boolean | – | A popover over the page: `show(anchor)`, `close()`. |
| `sheet` | boolean | – | Floating: a bottom sheet on a phone. |
| `open` | boolean | – | Floating: shown. |
| `align` | end | start | `end` | Floating: right or left edge on the anchor’s. |
| `label` | string | – | Names the month group for screen readers. |
| `today-label` | string | `Today · Heute` | Today button. |
| `prev-label` | string | `Previous month · Voriger Monat` | Names ‹. |
| `next-label` | string | `Next month · Nächster Monat` | Names ›. |
| `week-label` | string | `W · KW` | Head of the week column. |
| `time-label` | string | `Time · Uhrzeit` | Names the time field. |
| `clear-label` | string | `Clear · Leeren` | Clear button. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `required` | boolean | – | A value is required; validity is set on the host. |

**Events:** `nk-change` `{ value, start, end, time }` – The value changed: a day picked – for a range the second one –, a new time, or Clear. The same day again is no change. · `nk-month` `{ month }` – Another month shown. · `nk-toggle` `{ open }` – Floating: opened or closed.

**Properties:** `value`, `start`, `end`, `month`, `days`, `open`, `form`, `validity` · **Methods:** `show(anchor)`, `close()`, `toggle(anchor)`, `focusDay()`, `checkValidity()`

**Replaces:** `.nk-calendar`, `.weeks`, `.cal-head`, `.cal-title`, `.cal-nav`, `.cal-grid`, `.cal-wd`, `.cal-week`, `.cal-day`, `.out`, `.off`, `.today`, `.selected`, `.start`, `.end`, `.in-range`, `.cal-marks`, `.cal-foot`, `.nk-pop`, `.floating`, `.sheet`, `.open`

```html
<!-- equivalent class markup -->
<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
<div class="nk-pop">
  <div class="nk-calendar weeks">
    <div class="cal-head"><div class="cal-title">June 2026</div><button class="cal-nav">Today</button><button class="cal-nav" aria-label="Previous month"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><button class="cal-nav" aria-label="Next month"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>
    <div class="cal-grid">
      <span class="cal-wd">W</span><span class="cal-wd">Mo</span><span class="cal-wd">Tu</span><span class="cal-wd">We</span><span class="cal-wd">Th</span><span class="cal-wd">Fr</span><span class="cal-wd">Sa</span><span class="cal-wd">Su</span>
      <span class="cal-week">23</span><button class="cal-day">1</button><button class="cal-day selected">2<span class="cal-marks"><i class="blue"></i></span></button><button class="cal-day">3</button><button class="cal-day off" title="Corpus Christi">4</button><button class="cal-day">5</button><button class="cal-day off">6</button><button class="cal-day off">7</button>
      <span class="cal-week">24</span><button class="cal-day">8</button><button class="cal-day">9</button><button class="cal-day">10</button><button class="cal-day">11<span class="cal-marks"><i class="orange"></i><i class="red"></i></span></button><button class="cal-day">12</button><button class="cal-day off">13</button><button class="cal-day off">14</button>
      <span class="cal-week">25</span><button class="cal-day">15</button><button class="cal-day">16</button><button class="cal-day today">17</button><button class="cal-day">18</button><button class="cal-day">19</button><button class="cal-day off">20</button><button class="cal-day off">21</button>
      <span class="cal-week">26</span><button class="cal-day">22</button><button class="cal-day">23</button><button class="cal-day">24<span class="cal-marks"><i class="green"></i></span></button><button class="cal-day">25</button><button class="cal-day">26</button><button class="cal-day off">27</button><button class="cal-day off">28</button>
      <span class="cal-week">27</span><button class="cal-day">29</button><button class="cal-day">30</button><button class="cal-day out">1</button><button class="cal-day out">2</button><button class="cal-day out">3</button><button class="cal-day out off">4</button><button class="cal-day out off">5</button>
      <span class="cal-week">28</span><button class="cal-day out">6</button><button class="cal-day out">7</button><button class="cal-day out">8</button><button class="cal-day out">9</button><button class="cal-day out">10</button><button class="cal-day out off">11</button><button class="cal-day out off">12</button>
    </div>
    <div class="cal-foot"><input class="nk-input" type="time" value="09:30" aria-label="Time"><button class="cal-nav">Clear</button></div>
  </div>
</div>
<div class="nk-pop">
  <div class="nk-calendar weeks">
    <div class="cal-head"><div class="cal-title">June 2026</div><button class="cal-nav">Today</button><button class="cal-nav" aria-label="Previous month"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><button class="cal-nav" aria-label="Next month"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>
    <div class="cal-grid">
      <span class="cal-wd">W</span><span class="cal-wd">Mo</span><span class="cal-wd">Tu</span><span class="cal-wd">We</span><span class="cal-wd">Th</span><span class="cal-wd">Fr</span><span class="cal-wd">Sa</span><span class="cal-wd">Su</span>
      <span class="cal-week">23</span><button class="cal-day">1</button><button class="cal-day">2</button><button class="cal-day">3</button><button class="cal-day off" title="Corpus Christi">4</button><button class="cal-day">5</button><button class="cal-day off">6</button><button class="cal-day off">7</button>
      <span class="cal-week">24</span><button class="cal-day start">8</button><button class="cal-day in-range">9</button><button class="cal-day in-range">10</button><button class="cal-day in-range">11</button><button class="cal-day end">12</button><button class="cal-day off">13</button><button class="cal-day off">14</button>
      <span class="cal-week">25</span><button class="cal-day">15</button><button class="cal-day">16</button><button class="cal-day today">17</button><button class="cal-day">18</button><button class="cal-day">19</button><button class="cal-day off">20</button><button class="cal-day off">21</button>
      <span class="cal-week">26</span><button class="cal-day">22</button><button class="cal-day">23</button><button class="cal-day">24</button><button class="cal-day">25</button><button class="cal-day">26</button><button class="cal-day off">27</button><button class="cal-day off">28</button>
      <span class="cal-week">27</span><button class="cal-day">29</button><button class="cal-day">30</button><button class="cal-day out">1</button><button class="cal-day out">2</button><button class="cal-day out">3</button><button class="cal-day out off">4</button><button class="cal-day out off">5</button>
      <span class="cal-week">28</span><button class="cal-day out">6</button><button class="cal-day out">7</button><button class="cal-day out">8</button><button class="cal-day out">9</button><button class="cal-day out">10</button><button class="cal-day out off">11</button><button class="cal-day out off">12</button>
    </div>
  </div>
</div>
</div>
```

**Small screens:** Floating with `sheet`: a bottom sheet with 44px cells, a thumb’s width; seven days and the week column still fit a 390px screen.

### 3.6 `<nk-textarea>` – Textarea

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

### 3.7 `<nk-select>` – Select

Light-DOM `<option>` and `<optgroup>` children are copied into the shadow `<select>` and kept in step when a framework swaps them. The empty string is a valid value; a `value` naming no option leaves the selection alone. A `value` – attribute or property – whose option is not there yet waits and is applied once the option arrives, over the browser’s preselection of the first option, unless someone has chosen another in the meantime; settling on it fires no `nk-change`.

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
| `wide` | boolean | – | Full width (`.nk-select.wide`). |

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

### 3.8 `<nk-switch>` – Switch

Renders `button.nk-switch[role=switch]`; the stylesheet keys the knob on `aria-checked`, the element does the toggling. Submits `value` (default `on`) when checked, nothing otherwise – like a checkbox.

```html
<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center"><nk-switch name="notify" checked label="Email notifications"></nk-switch>
<nk-switch name="planned" checked>Planned</nk-switch><nk-switch name="progress">In progress</nk-switch><nk-switch name="done" text="Done" checked></nk-switch></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `checked` | boolean | – | On/off state. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |
| `value` | string | `on` | Submitted value when checked. |
| `text` | string | – | Visible text beside the switch (alternative to the default slot). |
| `label` | string | – | Accessible name (`aria-label`) when there is no visible text. |

**Slots:** `(default)` – Visible text beside the switch; part of the hit area. Without it the element renders the bare button.

**Events:** `nk-change` `{ checked, value, name }` – On toggle.

**Methods:** `toggle()`

**Replaces:** `.nk-switch`, `.nk-switch-label`

```html
<!-- equivalent class markup -->
<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center"><button class="nk-switch" role="switch" aria-checked="true" aria-label="Email notifications"></button>
<label class="nk-switch-label"><button class="nk-switch" role="switch" aria-checked="true"></button><span>Planned</span></label><label class="nk-switch-label"><button class="nk-switch" role="switch" aria-checked="false"></button><span>In progress</span></label><label class="nk-switch-label"><button class="nk-switch" role="switch" aria-checked="true"></button><span>Done</span></label></div>
```

**Small screens:** 34×20px – below the 44px touch target. Give it a label row (`nk-field`) to enlarge the hit area.

### 3.9 `<nk-check>` – Checkbox

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
| `text` | string | – | Label text (alternative to the default slot). |

**Slots:** `(default)` – Label text.

**Events:** `nk-change` `{ checked, value, name }` – On toggle.

**Replaces:** `.nk-check`

```html
<!-- equivalent class markup -->
<label class="nk-check"><input type="checkbox" name="digest" value="weekly" checked>Weekly digest</label>
<label class="nk-check"><input type="checkbox" name="digest" value="mentions">Mentions only</label>
```

**Small screens:** Row height ~24px; the whole label is the hit area.

### 3.10 `<nk-radio>` – Radio

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
| `text` | string | – | Label text (alternative to the default slot). |

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

### 3.11 `<nk-slider>` – Slider

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

### 3.12 `<nk-field>` – Field row

The settings row: label and description left, control right. Put any control – `nk-input`, `nk-switch`, `nk-select` – in the default slot. `stacked` puts the label above a full-width control (textareas, long descriptions) and sets `wide` on the control for you; `compact` shrinks the label to 12px tertiary text. Inside `nk-fields` both are on by default.

```html
<nk-field label="Display name" desc="Shown next to your comments.">
  <nk-input value="Ada Lovelace"></nk-input>
</nk-field>
<nk-field label="Email notifications">
  <nk-switch checked></nk-switch>
</nk-field>
<nk-field label="Short bio" stacked>
  <nk-textarea rows="2" placeholder="A sentence about you"></nk-textarea>
</nk-field>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `label` | string | – | Label text. |
| `desc` | string | – | Secondary description. |
| `stacked` | boolean | – | Label above a full-width control. |
| `compact` | boolean | – | Small tertiary label, no row padding. |

**Slots:** `(default)` – The control. · `label` – Rich label content (instead of the attribute). · `desc` – Rich description.

**Replaces:** `.nk-field`, `.f-label`, `.f-desc`, `.f-control`, `.stacked`, `.compact`

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
<div class="nk-field stacked">
  <div><div class="f-label">Short bio</div></div>
  <div class="f-control"><textarea class="nk-textarea wide" rows="2" placeholder="A sentence about you"></textarea></div>
</div>
```

**Small screens:** Stays a row; long descriptions wrap under the label. Use `stacked` where the control needs the whole width.

### 3.13 `<nk-fields>` – Field grid

Several short fields in one row: a grid of `minmax(150px, 1fr)` columns that wraps as the width allows. Every `nk-field` inside renders itself stacked and compact – a 12px label above a full-width control – so nothing collides.

```html
<nk-fields>
  <nk-field label="Display name"><nk-input value="Ada Lovelace"></nk-input></nk-field>
  <nk-field label="Email"><nk-input value="ada@acme.com"></nk-input></nk-field>
  <nk-field label="Role"><nk-select value="editor"><option value="viewer">Viewer</option><option value="editor">Editor</option></nk-select></nk-field>
</nk-fields>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `fit` | boolean | – | The fields share the row instead of keeping 150px columns – two fields in a wide dialog are two halves. |

**Slots:** `(default)` – `nk-field` children.

**Replaces:** `.nk-fields`, `.fit`

```html
<!-- equivalent class markup -->
<div class="nk-fields">
  <div class="nk-field"><div><div class="f-label">Display name</div></div><div class="f-control"><input class="nk-input" value="Ada Lovelace"></div></div>
  <div class="nk-field"><div><div class="f-label">Email</div></div><div class="f-control"><input class="nk-input" value="ada@acme.com"></div></div>
  <div class="nk-field"><div><div class="f-label">Role</div></div><div class="f-control"><select class="nk-select"><option>Viewer</option><option selected>Editor</option></select></div></div>
</div>
```

**Small screens:** Wraps to one or two columns on its own; no breakpoint needed.

## Content elements (wave 1)

### 3.14 `<nk-tag>` – Tag

The select option as Notion draws it, in its nine colours. The colour modifier class becomes the `color` attribute; without one it is the grey tag. Each pair is tuned per theme.

```html
<nk-tag>Not started</nk-tag> <nk-tag color="brown">Archive</nk-tag> <nk-tag color="orange">Planned</nk-tag> <nk-tag color="yellow">Review</nk-tag> <nk-tag color="green">Done</nk-tag> <nk-tag color="blue">In progress</nk-tag> <nk-tag color="purple">Design</nk-tag> <nk-tag color="pink">Idea</nk-tag> <nk-tag color="red">Blocked</nk-tag>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `color` | gray | brown | orange | yellow | green | blue | purple | pink | red | – | Colour pair; grey without it. |

**Slots:** `(default)` – Tag text.

**Replaces:** `.nk-tag`, `.gray`, `.brown`, `.orange`, `.yellow`, `.green`, `.blue`, `.purple`, `.pink`, `.red`

```html
<!-- equivalent class markup -->
<span class="nk-tag">Not started</span> <span class="nk-tag brown">Archive</span> <span class="nk-tag orange">Planned</span> <span class="nk-tag yellow">Review</span> <span class="nk-tag green">Done</span> <span class="nk-tag blue">In progress</span> <span class="nk-tag purple">Design</span> <span class="nk-tag pink">Idea</span> <span class="nk-tag red">Blocked</span>
```

**Small screens:** Unchanged.

### 3.15 `<nk-progress>` – Progress

A 60px bar with an optional label. `value`/`max` set the fill; the bar carries `role="progressbar"`. `wide` fills its row, and in a flex column – a panel – it stays a 6px bar. With a `label` the bar and its label form one `.nk-progress-row`: the label sits beside the bar, on its middle, in a panel too, where the host – `display: contents` – would let them stand one under the other.

```html
<nk-progress value="72" label="72%"></nk-progress>
<div class="nk-panel" style="margin-top:12px"><h3>Progress</h3><nk-progress value="40" label="40%" wide></nk-progress></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | number | `0` | Current value. |
| `max` | number | `100` | Maximum. |
| `label` | string | – | Text after the bar. |
| `wide` | boolean | – | Fills its row – a property value, a panel; in a flex row the label stays beside it. |



**Replaces:** `.nk-progress`, `.nk-progress-label`, `.wide`, `.nk-progress-row`

```html
<!-- equivalent class markup -->
<span class="nk-progress-row"><span class="nk-progress"><i style="width:72%"></i></span><span class="nk-progress-label">72%</span></span>
<div class="nk-panel" style="margin-top:12px"><h3>Progress</h3><span class="nk-progress-row"><span class="nk-progress wide"><i style="width:40%"></i></span><span class="nk-progress-label">40%</span></span></div>
```

**Small screens:** Unchanged.

### 3.16 `<nk-callout>` – Callout

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

### 3.17 `<nk-bookmark>` – Bookmark

Notion’s link block, filled from what you know of the page – `og:title`, `og:description`, `og:image`: title, two lines of description and the address with its icon on the left, the image on the right in a third, 240px at most. `title` is the heading, never a tooltip; without it the host name stands in. `url` shows an address other than `href`. Opens in a new tab unless `target` says otherwise; a part without a value is left out.

```html
<div style="max-width:600px"><nk-bookmark href="https://notionkit.jungherz.com" title="NotionKit – the calm workspace look as CSS" desc="NotionKit is a pure CSS component library in the Notion idiom: sidebar, page tree, document shell, database views, settings and AI surfaces." favicon="/favicon.svg" cover="/covers/notionkit-og.jpg"></nk-bookmark></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `href` | URL | – | The link. |
| `title` | string | – | Title – og:title. |
| `desc` | string | – | Description, two lines – og:description. |
| `favicon` | URL | – | The site’s icon, 16px. |
| `cover` | URL | – | Preview image – og:image. |
| `url` | string | – | The address shown (default: href). |
| `target` | string | `_blank` | Link target. |

**Events:** `click` `(native)` – The link is a plain `<a>`.

**Properties:** `title`, `href`

**Replaces:** `.nk-bookmark`, `.bm-text`, `.bm-title`, `.bm-desc`, `.bm-url`, `.bm-favicon`, `.bm-cover`

```html
<!-- equivalent class markup -->
<div style="max-width:600px"><a class="nk-bookmark" href="https://notionkit.jungherz.com" target="_blank" rel="noopener"><span class="bm-text"><span class="bm-title">NotionKit – the calm workspace look as CSS</span><span class="bm-desc">NotionKit is a pure CSS component library in the Notion idiom: sidebar, page tree, document shell, database views, settings and AI surfaces.</span><span class="bm-url"><img class="bm-favicon" src="/favicon.svg" alt=""><span>https://notionkit.jungherz.com</span></span></span><span class="bm-cover"><img src="/covers/notionkit-og.jpg" alt=""></span></a></div>
```

**Small screens:** The image keeps its third and is cropped at the centre; title and address end in an ellipsis.

### 3.18 `<nk-divider>` – Divider

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

### 3.19 `<nk-heading>` – Heading

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

### 3.20 `<nk-toggle>` – Toggle block

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

### 3.21 `<nk-todo>` – To-do

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

### 3.22 `<nk-kbd>` – Key cap

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

### 3.23 `<nk-code>` – Code block

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

### 3.24 `<nk-quote>` – Quote

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

### 3.25 `<nk-app>` – App shell

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

| Attribute | Type | Default | Description |
|---|---|---|---|
| `peek-inset` | boolean | – | The main column makes room for the side peek – `<nk-peek inset>` sets it while open. |

**Slots:** `sidebar` – An `nk-sidebar`. · `(default)` – Topbar, page – the main column.

**Replaces:** `.nk-app`, `.nk-main`, `.peek-inset`

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

### 3.26 `<nk-sidebar>` – Sidebar

The left rail: workspace slot on top, a scrolling default slot for the tree, a pinned footer slot. Footer tree items automatically get `compact` (26px rows). The host is `display: contents`, so the `aside` is a direct flex child of the app – exactly like the class markup. `collapsible` adds Notion’s « beside the workspace row, shown while the pointer is over the sidebar: on the desktop it collapses the sidebar – it slides out, the main column takes the width, nothing in it takes focus – and `<nk-btn variant="sidebar">` in the topbar shows and brings it back; ⌘\ or Ctrl+\ toggles it. `collapsed` is the state, `nk-collapse` the moment to keep it.

```html
<div style="display:flex;height:100%"><nk-sidebar collapsible collapse-label="Close sidebar">
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
| `collapsible` | boolean | – | Shows the « that collapses it on the desktop, and ⌘\. |
| `collapsed` | boolean | – | Collapsed on the desktop (no effect on a phone). |
| `collapse-label` | string | `Close sidebar · Seitenleiste schließen` | Name and tooltip of the «. |

**Slots:** `workspace` – `nk-workspace-switcher`. · `(default)` – The tree (scrolls). · `footer` – Pinned bottom rows (Settings, Trash).

**Events:** `nk-toggle` `{ open }` – Drawer opened/closed. · `nk-collapse` `{ collapsed }` – Collapsed / expanded on the desktop.

**Properties:** `open`, `collapsed` · **Methods:** `show()`, `close()`, `toggle()`, `collapse()`, `expand()`, `toggleCollapsed()`

**Replaces:** `.nk-sidebar`, `.nk-sidebar-head`, `.nk-sidebar-collapse`, `.nk-sidebar-scroll`, `.nk-sidebar-footer`, `.nk-sidebar-backdrop`, `.open`, `.collapsed`

```html
<!-- equivalent class markup -->
<div style="display:flex;height:100%"><aside class="nk-sidebar">
  <div class="nk-sidebar-head"><div class="nk-workspace"><div class="avatar">M</div><span>MonaHilft</span><span class="chev">⌄</span></div><button class="nk-sidebar-collapse" aria-label="Close sidebar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 17-5-5 5-5M11 17l-5-5 5-5"/></svg></button></div>
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

**Small screens:** Hidden below 860px. `open` shows it as a drawer over the page with a scrim – NotionKit’s own rules since 1.7.0 (`.nk-sidebar.open`, `.nk-sidebar-backdrop`), the same as the class markup’s; `<nk-btn variant="sidebar">` in the topbar is the ☰ that opens it. Escape and the scrim close it. The drawer slides in over 240ms and the scrim fades, closing runs backwards – CSS only (`transition-behavior: allow-discrete` + `@starting-style`; older browsers switch hard, reduced motion snaps). In landscape the drawer grows by the left safe-area inset, so its rows clear the Dynamic Island.

### 3.27 `<nk-workspace-switcher>` – Workspace switcher

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

### 3.28 `<nk-section-label>` – Section label

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

### 3.29 `<nk-tree>` – Tree

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

### 3.30 `<nk-tree-item>` – Tree item

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

### 3.31 `<nk-topbar>` – Top bar

The 44px bar above the page: breadcrumb in the default slot, buttons in the `actions` slot (right-aligned). Use `nk-btn variant="topbar"` / `"share"` and `nk-theme-toggle` there, and `<span class="nk-topbar-meta">` for passive text such as “Edited 2 min ago”.

```html
<div style="border:1px solid var(--nk-border);border-radius:8px;display:flex;flex-direction:column"><nk-topbar>
  <nk-breadcrumb><span>📊 Project overview</span><span>🚀 NotionKit MVP</span></nk-breadcrumb>
  <span slot="actions" class="nk-topbar-meta">Last edited 2 min ago</span>
  <nk-btn slot="actions" variant="share">Share</nk-btn>
  <nk-btn slot="actions" variant="topbar">⭐</nk-btn>
  <nk-theme-toggle slot="actions"></nk-theme-toggle>
</nk-topbar></div>
```

_No attributes._

**Slots:** `(default)` – Breadcrumb / title. · `actions` – Buttons on the right.

**Replaces:** `.nk-topbar`, `.nk-topbar-actions`, `.nk-topbar-btn`, `.nk-topbar-meta`, `.nk-share-btn`

```html
<!-- equivalent class markup -->
<div style="border:1px solid var(--nk-border);border-radius:8px;display:flex;flex-direction:column"><div class="nk-topbar">
  <nav class="nk-breadcrumb"><span class="crumb">📊 Project overview</span><span class="sep">/</span><span class="crumb current">🚀 NotionKit MVP</span></nav>
  <div class="nk-topbar-actions"><span class="nk-topbar-meta">Last edited 2 min ago</span><button class="nk-topbar-btn nk-share-btn">Share</button><button class="nk-topbar-btn">⭐</button><button class="nk-topbar-btn nk-theme-toggle">🌙</button></div>
</div></div>
```

**Small screens:** Below 860px only the last crumb stays and ends in an ellipsis, `nk-topbar-meta` hides, and the actions keep to one line – as in Notion’s mobile app.

### 3.32 `<nk-breadcrumb>` – Breadcrumb

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

### 3.33 `<nk-theme-toggle>` – Theme toggle

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

### 3.34 `<nk-tab-bar>` – Tab bar (mobile)

The thumb-reachable twin of the sidebar for phones and installed PWAs. Put it last inside `nk-app`: it is slotted into the main column below the scrolling page, so it never moves and no bottom padding is needed. Keeps the `nk-tab-bar-item` whose value is `value` active (listening to `nk-select`); a `drawer` item opens the sidebar instead. A value no item has – a page without a tab of its own, opened from the drawer – marks the `drawer` item, as iOS marks “More”; without one no item is active. Needs NotionKit CSS 1.2.0.

```html
<div style="max-width:390px;border:1px solid var(--nk-border);border-radius:12px;overflow:hidden"><nk-tab-bar always value="inbox">
  <nk-tab-bar-item icon="🏠" value="home">Home</nk-tab-bar-item>
  <nk-tab-bar-item icon="📥" value="inbox">Inbox</nk-tab-bar-item>
  <nk-tab-bar-item icon="🔍" value="search">Search</nk-tab-bar-item>
  <nk-tab-bar-item icon="⚙️" value="settings">Settings</nk-tab-bar-item>
  <nk-tab-bar-item icon="☰" drawer>More</nk-tab-bar-item>
</nk-tab-bar></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | Active item value (default: the item with `active`, else the first); a value no item has marks the `drawer` item. |
| `always` | boolean | – | Visible at every width, not only below 860px. |
| `fixed` | boolean | – | Pinned to the viewport bottom instead of sitting in the column – for standalone PWAs; a spacer keeps its height (`--nk-tab-bar-height` + safe area) in the flow. |
| `floating` | boolean | – | A fixed capsule with rounded corners instead of the full-width bar. |
| `label` | string | – | `aria-label` of the `nav`. |

**Slots:** `(default)` – `nk-tab-bar-item` children, up to five.

**Events:** `nk-change` `{ value }` – Active item changed. · `nk-select` `{ value, label, href, item, drawer }` – Bubbles from the tapped item; cancelable.

**Properties:** `value`, `items`

**Replaces:** `.nk-tab-bar`, `.nk-tab-bar-spacer`, `.always`, `.fixed`, `.floating`

```html
<!-- equivalent class markup -->
<div style="max-width:390px;border:1px solid var(--nk-border);border-radius:12px;overflow:hidden"><nav class="nk-tab-bar always">
  <button class="nk-tab-bar-item"><span class="icon">🏠</span><span class="label">Home</span></button>
  <button class="nk-tab-bar-item active"><span class="icon">📥</span><span class="label">Inbox</span></button>
  <button class="nk-tab-bar-item"><span class="icon">🔍</span><span class="label">Search</span></button>
  <button class="nk-tab-bar-item"><span class="icon">⚙️</span><span class="label">Settings</span></button>
  <button class="nk-tab-bar-item"><span class="icon">☰</span><span class="label">More</span></button>
</nav></div>
```

**Small screens:** This is where it lives: hidden above 860px (the sidebar is the navigation there), shown below. `always` shows it at every width – previews, phone frames. The bottom padding is the larger of 6px and `env(safe-area-inset-bottom)`; in landscape the side padding grows to the left/right insets.

### 3.35 `<nk-tab-bar-item>` – Tab bar item

One destination of `nk-tab-bar`: an icon over a short label. A tap emits `nk-select` (cancelable), then moves the bar’s `value`; with `href` it navigates afterwards. `drawer` turns it into the “More” item that opens the nearest `nk-sidebar` as a drawer and never becomes active. Standalone it toggles its own `active`.

```html
<div style="max-width:390px;border:1px solid var(--nk-border);border-radius:12px;overflow:hidden"><nk-tab-bar always><nk-tab-bar-item icon="🏠" value="home" active>Home</nk-tab-bar-item><nk-tab-bar-item icon="📥" value="inbox">Inbox</nk-tab-bar-item></nk-tab-bar></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | – | Emoji or glyph (alternative: `slot="icon"`). |
| `value` | string | – | Value (default: the label). |
| `label` | string | – | Label text (alternative to the default slot). |
| `href` | string | – | Navigates after `nk-select`. |
| `active` | boolean | – | The current destination (`aria-current="page"`). |
| `drawer` | boolean | – | Opens the sidebar drawer instead of becoming active. |
| `disabled` | boolean | – | Not selectable. |

**Slots:** `(default)` – Label. · `icon` – Icon node instead of the attribute.

**Events:** `nk-select` `{ value, label, href, item, drawer }` – Tapped; cancelable.

**Methods:** `select()`, `focus()`

**Replaces:** `.nk-tab-bar-item`, `.icon`, `.label`, `.active`

```html
<!-- equivalent class markup -->
<div style="max-width:390px;border:1px solid var(--nk-border);border-radius:12px;overflow:hidden"><nav class="nk-tab-bar always"><button class="nk-tab-bar-item active"><span class="icon">🏠</span><span class="label">Home</span></button><button class="nk-tab-bar-item"><span class="icon">📥</span><span class="label">Inbox</span></button></nav></div>
```

**Small screens:** Made for the thumb: 20px icon, 10.5px label, the whole column is the hit area.

## Page shell & blocks (wave 3)

### 3.36 `<nk-page>` – Page

The document column: a scrolling wrapper, an optional cover, the 760px page with 64px side padding, and the page icon (rendered here because its slotted twin is keyed on the parent). `narrow` drops the scroll wrapper for pages that are the document itself. With a cover the icon overlaps its bottom edge; a cover without an icon leaves the page its top padding, so the title never touches the picture.

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
| `full` | boolean | – | Page option “Full width”: the column fills the window instead of stopping at 760px. |
| `small` | boolean | – | Page option “Small text”: document text 14px instead of 16px; headings, lead, prose and editor follow. |
| `cover` | boolean | – | Shows the cover strip; the icon then overlaps its bottom edge and the page drops its top padding (the stylesheet’s `covered` state, also set for a slotted `nk-page-cover`). Without it the icon sits in 24px top padding, fully visible. |
| `narrow` | boolean | – | No scroll wrapper (landing / docs page). |

**Slots:** `(default)` – Title, meta, blocks – anything with `class="lead"` on a `<p>` becomes the lead paragraph. · `cover` – An `nk-page-cover` (instead of the `cover` attribute). · `icon` – Custom icon node.

**Events:** `nk-action` `{ action: 'icon', value }` – Icon clicked (open an emoji picker).

**Replaces:** `.nk-page-scroll`, `.nk-page`, `.nk-page-icon`, `.nk-cover`, `.lead`, `.full`, `.small`

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

### 3.37 `<nk-page-cover>` – Page cover

The cover band, as tall as the token `--nk-cover-height` (200px) – on `:root`, or on the element for one cover: `style="--nk-cover-height: clamp(200px, 30vh, 300px)"` comes close to Notion’s 30vh. Without `src` it shows the token gradient; with `src` a picture – an `<img>` inside the band, cropped rather than stretched. `position` moves the crop, as Notion’s “Reposition” does.

```html
<nk-page-cover src="/covers/meadow.svg"></nk-page-cover>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `src` | URL | – | Cover picture. |
| `position` | CSS object-position | `center` | Where the crop sits. |



**Replaces:** `.nk-cover`

```html
<!-- equivalent class markup -->
<div class="nk-cover"><img src="/covers/meadow.svg" alt=""></div>
```

**Small screens:** Unchanged; lower `--nk-cover-height` if the band eats too much of a short screen.

### 3.38 `<nk-page-title>` – Page title

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

### 3.39 `<nk-page-actions>` – Page meta row

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

### 3.40 `<nk-props>` – Page properties

The properties under the title of a database page, the pattern Notion is known for: a list of `nk-prop` rows. The rows are hosts with `display: contents`, so each renders as a row of this list – no markup of their own around them. `flush` drops the outer margin meant for the flow under a title, for a list inside a panel or a flex column.

```html
<nk-props style="max-width:520px">
  <nk-prop label="Status" icon="◉"><nk-tag color="blue">In progress</nk-tag></nk-prop>
  <nk-prop label="Owner" icon="👤"><nk-avatar size="small" color="purple">AL</nk-avatar>Ada Lovelace</nk-prop>
  <nk-prop label="Due" icon="📅">2 June 2026</nk-prop>
  <nk-prop label="Tags" icon="🏷️"><nk-tag color="purple">Design system</nk-tag><nk-tag>CSS</nk-tag></nk-prop>
  <nk-prop label="Progress" icon="▰"><nk-progress value="65" label="65 %" wide></nk-progress></nk-prop>
</nk-props>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `flush` | boolean | – | No outer margin. |

**Slots:** `(default)` – `nk-prop` children.

**Replaces:** `.nk-props`, `.flush`

```html
<!-- equivalent class markup -->
<dl class="nk-props" style="max-width:520px">
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">◉</span>Status</dt><dd class="p-value"><span class="nk-tag blue">In progress</span></dd></div>
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">👤</span>Owner</dt><dd class="p-value"><span class="nk-avatar small purple">AL</span>Ada Lovelace</dd></div>
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">📅</span>Due</dt><dd class="p-value">2 June 2026</dd></div>
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">🏷️</span>Tags</dt><dd class="p-value"><span class="nk-tag purple">Design system</span><span class="nk-tag">CSS</span></dd></div>
  <div class="nk-prop"><dt class="p-name"><span class="p-icon">▰</span>Progress</dt><dd class="p-value"><span class="nk-progress wide"><i style="width:65%"></i></span><span class="nk-progress-label">65 %</span></dd></div>
</dl>
```

**Small screens:** Below 860px each property stacks: the name above its value. In a column narrower than 380px the value moves under its name as well.

### 3.41 `<nk-prop>` – Page property

One property: the name with its type icon in a 160px column, the value beside it, 34px with the hover wash on both halves. The value is the element’s content – tags, an avatar and a name, a date, `<nk-progress wide>`. A click fires `nk-action` with the half that was hit, the moment Notion opens the property’s editor. `text` lets a value that is text – a sentence, an address, a model name with a tag – flow as text instead of setting its parts one under the other. The value keeps at least 220px: in a column narrower than 380px it moves under its name.

```html
<nk-props style="max-width:520px"><nk-prop label="Due" icon="📅">2 June 2026</nk-prop><nk-prop label="Address" icon="✉️" text>support+design@notionkit.example.com · <nk-tag color="green">Verified</nk-tag></nk-prop></nk-props>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `label` | string | – | Property name. |
| `icon` | string | – | Type icon. |
| `text` | boolean | – | The value flows as text. |

**Slots:** `(default)` – The value. · `icon` – Icon node.

**Events:** `nk-action` `{ action: 'name' | 'value', label }` – Name or value clicked.

**Replaces:** `.nk-prop`, `.p-name`, `.p-icon`, `.p-value`, `.text`

```html
<!-- equivalent class markup -->
<dl class="nk-props" style="max-width:520px"><div class="nk-prop"><dt class="p-name"><span class="p-icon">📅</span>Due</dt><dd class="p-value">2 June 2026</dd></div><div class="nk-prop"><dt class="p-name"><span class="p-icon">✉️</span>Address</dt><dd class="p-value text">support+design@notionkit.example.com · <span class="nk-tag green">Verified</span></dd></div></dl>
```

**Small screens:** Stacks below 860px, and in a column narrower than 380px.

### 3.42 `<nk-panels>` – Panels

A grid of `nk-panel`s: columns of at least 200px that share the row. The panels are hosts with `display: contents`, so each is a cell of this grid. `flush` drops the outer margin, for a grid inside a flex column with a gap of its own.

```html
<nk-panels>
  <nk-panel href="#" cover="/covers/aurora.svg" icon="🚀" title="NotionKit MVP"><p>2 min ago</p></nk-panel>
  <nk-panel href="#" cover="/covers/dunes.svg" icon="📚" title="Knowledge base"><p>Yesterday</p></nk-panel>
  <nk-panel title="Weekly review"><p>Three pages changed, one comment is waiting for an answer.</p></nk-panel>
</nk-panels>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `flush` | boolean | – | No outer margin. |

**Slots:** `(default)` – `nk-panel` children.

**Replaces:** `.nk-panels`, `.flush`

```html
<!-- equivalent class markup -->
<div class="nk-panels">
  <a class="nk-panel" href="#"><div class="nk-cover"><img src="/covers/aurora.svg" alt=""></div><div class="nk-page-icon">🚀</div><h3>NotionKit MVP</h3><p>2 min ago</p></a>
  <a class="nk-panel" href="#"><div class="nk-cover"><img src="/covers/dunes.svg" alt=""></div><div class="nk-page-icon">📚</div><h3>Knowledge base</h3><p>Yesterday</p></a>
  <div class="nk-panel"><h3>Weekly review</h3><p>Three pages changed, one comment is waiting for an answer.</p></div>
</div>
```

**Small screens:** Falls to one column as soon as two 200px columns no longer fit.

### 3.43 `<nk-panel>` – Panel

A neutral surface for content that belongs together – the cards on Notion’s Home, the boxes in its settings. `title` is the heading (never a tooltip); the content goes in as `<p>`s and blocks. `cover` without a value draws the gradient band, with a URL a picture; `icon` overlaps the cover as on a page – a page tile. With `href` the panel is a link. `slot="end"` sits at the right edge of the title – a state as a tag, a button – as Notion’s settings boxes show a connection, and moves under the title where both do not fit. The cover is `--nk-panel-cover-height` tall (64px) – set it on `:root` or on one panel. Inputs, selects and copy fields inside never run past the panel’s edge, however narrow the tile.

```html
<div style="max-width:360px;display:grid;gap:12px"><nk-panel href="#" cover icon="🚀" title="NotionKit MVP"><p>2 min ago</p></nk-panel>
<nk-panel title="Weekly review"><nk-tag slot="end" color="blue">In progress</nk-tag><p>Three pages changed, one comment is waiting for an answer.</p></nk-panel></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `title` | string | – | Heading. |
| `icon` | string | – | Page icon. |
| `cover` | URL | empty | – | Cover band: empty for the gradient, a URL for a picture. |
| `href` | URL | – | Makes the panel a link. |
| `target` | string | – | Link target. |

**Slots:** `(default)` – Content: `<p>`, a prose block, a progress bar. · `end` – Beside the title, at its right edge: a tag, a button.

**Replaces:** `.nk-panel`, `.nk-cover`, `.nk-page-icon`, `.p-head`, `.p-end`

```html
<!-- equivalent class markup -->
<div style="max-width:360px;display:grid;gap:12px"><a class="nk-panel" href="#"><div class="nk-cover"></div><div class="nk-page-icon">🚀</div><h3>NotionKit MVP</h3><p>2 min ago</p></a>
<div class="nk-panel"><div class="p-head"><h3>Weekly review</h3><span class="p-end"><span class="nk-tag blue">In progress</span></span></div><p>Three pages changed, one comment is waiting for an answer.</p></div></div>
```

**Small screens:** Takes the width of its grid cell.

### 3.44 `<nk-block-host>` – Block host

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

### 3.45 `<nk-banner>` – Banner

A tinted notice row. The colour modifier becomes `variant`; the action – a `<button>` – goes into `slot="action"` and sits at the right edge.

```html
<nk-banner variant="info">ℹ️ <span>This page is a <b>component preview</b> – every element follows the same design tokens.</span><button slot="action" type="button">Open palette</button></nk-banner>
<nk-banner variant="warning">⚠️ <span>The “Project overview” database has 2 overdue entries.</span><button slot="action" type="button">View</button></nk-banner>
<nk-banner variant="success">✓ <span>All changes have been synced.</span></nk-banner>
<nk-banner variant="danger">⛔ <span>The connection to Notion was lost.</span></nk-banner>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `variant` | info | success | warning | danger | – | Tint. |

**Slots:** `(default)` – Icon and text. · `action` – The action – a `<button>`, shown as underlined text on the right.

**Replaces:** `.nk-banner`, `.info`, `.success`, `.warning`, `.danger`, `.b-action`

```html
<!-- equivalent class markup -->
<div class="nk-banner info">ℹ️ <span>This page is a <b>component preview</b> – every element follows the same design tokens.</span><button class="b-action" type="button">Open palette</button></div>
<div class="nk-banner warning">⚠️ <span>The “Project overview” database has 2 overdue entries.</span><button class="b-action" type="button">View</button></div>
<div class="nk-banner success">✓ <span>All changes have been synced.</span></div>
<div class="nk-banner danger">⛔ <span>The connection to Notion was lost.</span></div>
```

**Small screens:** Below 860px the action moves under the text instead of squeezing it into a narrow column.

### 3.46 `<nk-empty>` – Empty state

Dashed box with icon, title, description and whatever call to action you slot in.

```html
<nk-empty icon="🗂️" title="No entries yet" desc="Create the first entry or import existing data."><nk-btn variant="primary" small>＋ New entry</nk-btn><nk-btn variant="secondary" small>Import</nk-btn></nk-empty>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | – | Emoji. |
| `title` | string | – | Title. Read once and taken off the host, so it never shows as a tooltip. |
| `desc` | string | – | Description. |

**Slots:** `(default)` – Call to action – several buttons sit in a centred row, 8px apart. · `icon` – Rich icon. · `title` – Rich title. · `desc` – Rich description.

**Replaces:** `.nk-empty`, `.e-icon`, `.e-title`, `.e-desc`, `.e-actions`

```html
<!-- equivalent class markup -->
<div class="nk-empty"><div class="e-icon">🗂️</div><div class="e-title">No entries yet</div><div class="e-desc">Create the first entry or import existing data.</div><div class="e-actions"><button class="nk-btn primary small">＋ New entry</button><button class="nk-btn secondary small">Import</button></div></div>
```

**Small screens:** Unchanged.

### 3.47 `<nk-skeleton>` – Skeleton

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

### 3.48 `<nk-synced>` – Synced block

Content that appears in several places, framed with a badge.

```html
<nk-synced badge="⟳ 3 places"><div style="font-size:14px;line-height:1.55"><b>Our mission:</b> Take real weight off the working day – calm, clear, effective.</div></nk-synced>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `badge` | string | `⟳ synced · ⟳ synchronisiert` | Badge text. |

**Slots:** `(default)` – Content.

**Replaces:** `.nk-synced`, `.synced-badge`

```html
<!-- equivalent class markup -->
<div class="nk-synced"><span class="synced-badge">⟳ 3 places</span><div style="font-size:14px;line-height:1.55"><b>Our mission:</b> Take real weight off the working day – calm, clear, effective.</div></div>
```

**Small screens:** Unchanged.

### 3.49 `<nk-tabs>` – Tabs

A tab strip with panels. `nk-tab` children are the tabs; elements with `slot="panel"` and a matching `data-tab` are the panels – the tabs hide every panel but the active one through `hidden`. Arrow keys move between tabs. `scroll` keeps many tabs in one row that scrolls sideways, scrollbar hidden, and holds the active tab in view – after the first layout, on every change and when the row’s width changes.

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
| `scroll` | boolean | – | One row that scrolls sideways and keeps the active tab in view. |

**Slots:** `(default)` – `nk-tab` children. · `panel` – Panels with `data-tab`.

**Events:** `nk-change` `{ value }` – Active tab changed. · `nk-select` `{ value, label }` – From the clicked tab.

**Properties:** `value`, `scroll`

**Replaces:** `.nk-tabs`, `.nk-tab`, `.active`, `.nk-tab-panel`, `.scroll`

```html
<!-- equivalent class markup -->
<div class="nk-tabs">
  <span class="nk-tab active">📝 Notes</span>
  <span class="nk-tab">✅ Tasks</span>
  <span class="nk-tab">📎 Files</span>
</div>
<div class="nk-tab-panel">Free-form notes on the project – meeting minutes, ideas, rough drafts.</div>
```

**Small screens:** The strip stays on one line; one longer than the screen takes `scroll`.

### 3.50 `<nk-tab>` – Tab

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

### 3.51 `<nk-segmented>` – Segmented control

Plain `<button value>` children stay in the light DOM (the stylesheet’s slotted twins shape them); the element moves `.active`, handles arrow keys and submits `value` with the form. With `scroll` the chosen option stays in view: after the first layout, on every change and when the row’s width changes, the row – never the page – scrolls the least distance, right to left as well.

```html
<nk-segmented name="range" value="week"><button value="week">Week</button><button value="month">Month</button><button value="quarter">Quarter</button></nk-segmented>
<div style="max-width:300px;margin-top:12px"><nk-segmented name="filter" value="all" scroll><button value="all">All</button><button value="attention">⚠️ Attention</button><button value="failed">Failed</button><button value="read">Read</button><button value="ignored">Ignored</button></nk-segmented></div>
<div style="max-width:300px;margin-top:12px"><nk-segmented name="filter2" value="all" wrap><button value="all">All</button><button value="attention">⚠️ Attention</button><button value="failed">Failed</button><button value="read">Read</button><button value="ignored">Ignored</button></nk-segmented></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | string | – | Selected value (default: the button with `.active`, else the first). |
| `scroll` | boolean | – | Horizontally scrollable row, scrollbar hidden. |
| `wrap` | boolean | – | Segments wrap onto further rows. |
| `name` | string | – | Form field name (FormData key). |
| `disabled` | boolean | – | Disables the control. |

**Slots:** `(default)` – `<button value="…">` children.

**Events:** `nk-change` `{ value, name }` – Selection changed.

**Replaces:** `.nk-segmented`, `.active`, `.scroll`, `.wrap`

```html
<!-- equivalent class markup -->
<div class="nk-segmented"><button class="active">Week</button><button>Month</button><button>Quarter</button></div>
<div style="max-width:300px;margin-top:12px"><div class="nk-segmented scroll"><button class="active">All</button><button>⚠️ Attention</button><button>Failed</button><button>Read</button><button>Ignored</button></div></div>
<div style="max-width:300px;margin-top:12px"><div class="nk-segmented wrap"><button class="active">All</button><button>⚠️ Attention</button><button>Failed</button><button>Read</button><button>Ignored</button></div></div>
```

**Small screens:** One row by default, which five filter options overflow on a phone: `scroll` keeps one thumb-swipeable row capped at the parent width (scrollbar hidden), `wrap` breaks it onto further rows.

### 3.52 `<nk-steps>` – Steps

A short flow – connecting an account, setting up a model – calm and vertical: a numbered circle per step joined by a hairline, done steps with a check on the green tag, the current one ringed in the accent and marked `aria-current="step"`. `current` counts from 1; one past the last marks every step done, and `next()` moves on. The `steps` attribute is a comma-separated list; the property also takes `{ label, desc }` objects for a line under the label. A `state` in such an object – `done`, `skipped` or `open` – wins over the order, for a wizard that lets a step be skipped while a later one is done; a skipped step shows a dashed ring around a dash. `selectable` makes each label a button: a click or Enter fires `nk-select { index, value, step }` – `index` counts from 1, like `current` – and, unless cancelled, makes that step current. A step with `href` shows its label as a link, with or without `selectable` – to open a chapter in a new tab or copy its address. A plain click, and Enter, fire the same `nk-select`; cancel it and the browser stays, for a router of your own. A middle click or one with Cmd, Ctrl, Shift or Alt fires nothing and does what a link does. `horizontal` sets the steps in one row above a wizard.

```html
<nk-steps label="Connect your own model" current="2"></nk-steps>
<script>{ document.currentScript.previousElementSibling.steps = [{ label: 'Choose a provider', desc: 'Anthropic' }, 'Enter the API key', 'Test the connection']; }</script>
<div style="margin-top:16px"><nk-steps id="stepsWizard" label="Connect your own model" current="3" horizontal selectable></nk-steps></div>
<script>{ document.getElementById('stepsWizard').steps = [{ label: 'Choose a provider', state: 'done', href: '#nk-steps' }, { label: 'Enter the API key', desc: 'skipped', state: 'skipped' }, 'Test the connection']; }</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `steps` | list | – | Comma-separated step labels. |
| `current` | number | `1` | The current step, from 1. |
| `label` | string | – | The list’s accessible name. |
| `selectable` | boolean | – | Labels are buttons that jump to their step. |
| `horizontal` | boolean | – | One row above a wizard. |

**Events:** `nk-select` `{ index, value, step }` – A step clicked (with `selectable`, or its link with a plain click or Enter); cancel it to stay.

**Properties:** `steps`, `current`, `selectable`, `horizontal` · **Methods:** `next()`, `select(index)`

**Replaces:** `.nk-steps`, `.nk-step`, `.st-mark`, `.st-desc`, `.done`, `.current`, `.skipped`, `.st-label`, `.horizontal`

```html
<!-- equivalent class markup -->
<ol class="nk-steps" aria-label="Connect your own model">
  <li class="nk-step done"><span class="st-mark">✓</span><span>Choose a provider<span class="st-desc">Anthropic</span></span></li>
  <li class="nk-step current" aria-current="step"><span class="st-mark">2</span><span>Enter the API key</span></li>
  <li class="nk-step"><span class="st-mark">3</span><span>Test the connection</span></li>
</ol>
<div style="margin-top:16px"><ol class="nk-steps horizontal" aria-label="Connect your own model">
  <li class="nk-step done"><span class="st-mark">✓</span><a class="st-label" href="#nk-steps">Choose a provider</a></li>
  <li class="nk-step skipped"><span class="st-mark">–</span><button type="button" class="st-label">Enter the API key<span class="st-desc">skipped</span></button></li>
  <li class="nk-step current" aria-current="step"><span class="st-mark">3</span><button type="button" class="st-label">Test the connection</button></li>
</ol></div>
```

**Small screens:** Vertical steps stay as they are. `horizontal` keeps its row below 860px, with every mark but only the current step’s label.

### 3.53 `<nk-stats>` – Stat cards

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

### 3.54 `<nk-stat>` – Stat card

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

### 3.55 `<nk-avatar-group>` – Avatar group

Overlapping `.mini-avatar` children (light DOM, styled by the slotted twins) plus a “more” bubble from the attribute. Pass `.mini-avatar`, not `.nk-avatar`: the document rule of `.nk-avatar` sets its own 24px, and for slotted nodes the document wins over the group’s 26px.

```html
<div style="display:flex;align-items:center;gap:12px"><nk-avatar-group more="+2"><span class="mini-avatar" style="background:linear-gradient(135deg,var(--nk-decor-purple),var(--nk-decor-blue))">MK</span><span class="mini-avatar" style="background:var(--nk-color-green)">SL</span><span class="mini-avatar" style="background:var(--nk-color-orange)">TW</span></nk-avatar-group><span style="font-size:12.5px;color:var(--nk-text-tertiary)">5 people have access</span></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `more` | string | – | Text of the trailing bubble, e.g. `+2`. |

**Slots:** `(default)` – `<span class="mini-avatar" style="background:…">` children.

**Replaces:** `.nk-avatar-group`, `.mini-avatar`, `.more`

```html
<!-- equivalent class markup -->
<div style="display:flex;align-items:center;gap:12px"><div class="nk-avatar-group"><span class="nk-avatar">MK</span><span class="nk-avatar green">SL</span><span class="nk-avatar orange">TW</span><span class="mini-avatar more">+2</span></div><span style="font-size:12.5px;color:var(--nk-text-tertiary)">5 people have access</span></div>
```

**Small screens:** Unchanged.

### 3.56 `<nk-avatar>` – Avatar

A person or a workspace: initials, an emoji or a photo in a circle. `size` small (20px), default 24px, large (32px), xlarge (56px); `color` one of Notion’s nine names or any CSS background, without it the avatar gradient; `square` for a workspace icon. Without content the initials come from `name`; with `src` a photo fills the circle and `name` becomes its alt text. Initials from `name` are the first letter or digit of each word: “Planer (Dev)” → PD, “Anna-Lena Groß” → AG.

```html
<div style="display:flex;align-items:center;gap:10px"><nk-avatar size="small" color="blue">TW</nk-avatar><nk-avatar>AL</nk-avatar><nk-avatar color="green">SL</nk-avatar><nk-avatar size="large" color="orange">MK</nk-avatar><nk-avatar size="xlarge" color="purple" name="Ada Lovelace"></nk-avatar><nk-avatar size="large" square>A</nk-avatar></div>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `size` | small | large | xlarge | – | Size; default 24px. |
| `color` | colour name | CSS | – | gray, brown, orange, yellow, green, blue, purple, pink, red – or any CSS background. |
| `square` | boolean | – | Corners instead of a circle. |
| `name` | string | – | Initials when empty; alt text of the photo. |
| `src` | URL | – | Photo. |

**Slots:** `(default)` – Initials or an emoji.

**Replaces:** `.nk-avatar`, `.small`, `.large`, `.xlarge`, `.square`, `.green`, `.blue`, `.orange`, `.purple`

```html
<!-- equivalent class markup -->
<div style="display:flex;align-items:center;gap:10px"><span class="nk-avatar small blue">TW</span><span class="nk-avatar">AL</span><span class="nk-avatar green">SL</span><span class="nk-avatar large orange">MK</span><span class="nk-avatar xlarge purple">AL</span><span class="nk-avatar large square">A</span></div>
```

**Small screens:** Unchanged. A fixed size, so a row of avatars never reflows.

### 3.57 `<nk-mention>` – Mention

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

### 3.58 `<nk-template-btn>` – Template button

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

### 3.59 `<nk-model-card>` – Model card

A radio-like card. Cards with the same `name` form a group; the selected one submits `value` with the form.

```html
<nk-model-card name="model" value="pro" title="Mona Pro" desc="Best for long documents and research." selected></nk-model-card>
<nk-model-card name="model" value="fast" title="Mona Fast" desc="Quick answers, lower cost."></nk-model-card>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `title` | string | – | Name line. Read once and taken off the host, so it never shows as a tooltip. |
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

### 3.60 `<nk-profile-row>` – Profile row

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

### 3.61 `<nk-danger-zone>` – Danger zone

Red-framed box for destructive settings.

```html
<nk-danger-zone title="Danger zone"><nk-field label="Delete workspace" desc="Deleting the workspace removes every page."><nk-btn variant="danger-solid" small>Delete</nk-btn></nk-field></nk-danger-zone>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `title` | string | – | Red heading. Read once and taken off the host, so it never shows as a tooltip. |

**Slots:** `(default)` – Fields and buttons.

**Replaces:** `.nk-danger-zone`, `.dz-title`

```html
<!-- equivalent class markup -->
<div class="nk-danger-zone"><div class="dz-title">Danger zone</div><div class="nk-field"><div><div class="f-label">Delete workspace</div><div class="f-desc">Deleting the workspace removes every page.</div></div><div class="f-control"><button class="nk-btn danger-solid small">Delete</button></div></div></div>
```

**Small screens:** Unchanged.

### 3.62 `<nk-member-list>` – Member list

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

### 3.63 `<nk-member-row>` – Member row

One row; see `nk-member-list`.

```html
<nk-member-row name="Sara Lindt" mail="sara@example.com" color="green" last></nk-member-row>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | Name. |
| `mail` | string | – | Mail. |
| `avatar` | string | – | Initials. |
| `color` | colour name | CSS | – | Avatar colour: one of the nine names (gray … red) or any CSS background; without it the avatar gradient. |
| `last` | boolean | – | No bottom border. |

**Slots:** `role` – Control on the right. · `avatar` – Custom avatar. · `(default)` – Extra content.

**Replaces:** `.nk-member-row`

```html
<!-- equivalent class markup -->
<div class="nk-member-row last"><span class="nk-avatar green">SL</span><div>Sara Lindt<div class="m-mail">sara@example.com</div></div></div>
```

**Small screens:** Unchanged.

## Overlays (wave 4)

### 3.64 `<nk-modal>` – Settings modal

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

### 3.65 `<nk-sheet>` – Sheet

Notion’s mobile surface for menus, properties and more – the phone’s twin of the modal, with its contract: `show()`, `close()`, `toggle()`; Escape and the backdrop close it; focus moves in and back; the page behind is scroll-locked and inert. The panel rises from the bottom edge with a grabber, `title` sits under it and names the dialog. Rows inside are 40px, a thumb’s height. Choosing a row does not close the sheet – `nk-select` bubbles out and the app decides. For a menu that is a popover on the desktop and a sheet on the phone, use `<nk-menu floating sheet>`. Place it directly under `<body>`.

```html
<nk-sheet open title="More">
  <nk-tree manual>
    <nk-section-label>Favourites</nk-section-label>
    <nk-tree-item icon="🚀">NotionKit MVP</nk-tree-item>
    <nk-tree-item icon="🎙️">Voice-Office-Hub</nk-tree-item>
    <nk-section-label>Workspace</nk-section-label>
    <nk-tree-item icon="🧠">Knowledge base</nk-tree-item>
    <nk-tree-item icon="🗑️">Trash</nk-tree-item>
  </nk-tree>
</nk-sheet>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | – | Shown. |
| `title` | string | – | Heading under the grabber and the dialog’s name – never a tooltip. |

**Slots:** `(default)` – The content: an `nk-tree`, menu items, fields.

**Events:** `nk-toggle` `{ open }` – Opened / closed.

**Properties:** `open`, `title` · **Methods:** `show()`, `close()`, `toggle()`

**Replaces:** `.nk-sheet-backdrop`, `.open`, `.nk-sheet`, `.sh-grabber`, `.sh-title`

```html
<!-- equivalent class markup -->
<div class="nk-sheet-backdrop open"><div class="nk-sheet" role="dialog" aria-modal="true" aria-label="More">
  <div class="sh-grabber"></div>
  <div class="sh-title">More</div>
  <div class="nk-section-label">Favourites</div>
  <div class="nk-tree-item"><span class="icon">🚀</span><span class="label">NotionKit MVP</span></div>
  <div class="nk-tree-item"><span class="icon">🎙️</span><span class="label">Voice-Office-Hub</span></div>
  <div class="nk-section-label">Workspace</div>
  <div class="nk-tree-item"><span class="icon">🧠</span><span class="label">Knowledge base</span></div>
  <div class="nk-tree-item"><span class="icon">🗑️</span><span class="label">Trash</span></div>
</div></div>
```

**Small screens:** Made for the phone: full width, above the tab bar, bottom padding from the safe area; the content scrolls inside the sheet. On larger screens at most 640px wide, centred.

### 3.66 `<nk-peek>` – Side peek

Notion’s side peek: a database row opens at the right edge, full height, next to the table, which stays usable – no scrim, nothing inert. The bar carries » to close and your actions (`slot="actions"`); the body is the page – `nk-page-title` (32px here), `nk-props`, a `.nk-prose`, `nk-comments`. `show()` slides it in and moves focus to it; », Escape and a click elsewhere close it, and a click that calls `show()` again – another row – only swaps the content. Clicks inside other overlays leave it open. Place it directly under `<body>`. `resizable` gives it Notion’s drag on the left edge, `inset` moves the page aside instead of covering it.

```html
<nk-peek open resizable resize-label="Resize" label="Database Table-View">
  <nk-btn slot="actions" variant="topbar" aria-label="Open as page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></nk-btn>
  <nk-page-title>🗃️ Database Table-View</nk-page-title>
  <nk-props>
    <nk-prop label="Status" icon="◉"><nk-tag color="blue">In progress</nk-tag></nk-prop>
    <nk-prop label="Due" icon="📅">20.05.2026</nk-prop>
  </nk-props>
  <div class="nk-prose"><p>Table, board and list read the same rows; filters and sort act on all three.</p></div>
</nk-peek>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | – | Shown. |
| `label` | string | – | The dialog’s name – the entry’s title. |
| `close-label` | string | `Close · Schließen` | Name of ». |
| `resizable` | boolean | – | The left edge makes it wider or narrower – pointer and arrow keys; the width is the token `--nk-peek-width` on `:root`. |
| `width` | px | `560` | Sets the width, within min and max. |
| `min` | px | `380` | Narrowest. |
| `max` | px | `window − 320` | Widest. |
| `resize-label` | string | `Resize · Breite ändern` | Name of the edge. |
| `inset` | boolean | – | While open on the desktop, the page’s `nk-app` makes room instead of lying under it – for a chart whose bars must stay visible. |

**Slots:** `(default)` – The page: title, properties, prose, comments. · `actions` – Buttons beside » – open as page, share.

**Events:** `nk-toggle` `{ open }` – Opened / closed. · `nk-resize` `{ width }` – A drag or a key changed the width – the moment to keep it.

**Properties:** `open`, `width` · **Methods:** `show()`, `close()`, `toggle()`

**Replaces:** `.nk-peek-backdrop`, `.open`, `.nk-peek`, `.pk-resize`, `.active`, `.pk-bar`, `.pk-body`

```html
<!-- equivalent class markup -->
<div class="nk-peek-backdrop open"><aside class="nk-peek" role="dialog" aria-label="Database Table-View">
  <div class="pk-resize" role="separator" aria-orientation="vertical" aria-label="Resize" tabindex="0"></div>
  <div class="pk-bar"><button class="nk-topbar-btn" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 17 5-5-5-5M13 17l5-5-5-5"/></svg></button><button class="nk-topbar-btn" aria-label="Open as page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button></div>
  <div class="pk-body">
    <h1 class="nk-page-title">🗃️ Database Table-View</h1>
    <dl class="nk-props">
      <div class="nk-prop"><dt class="p-name"><span class="p-icon">◉</span>Status</dt><dd class="p-value"><span class="nk-tag blue">In progress</span></dd></div>
      <div class="nk-prop"><dt class="p-name"><span class="p-icon">📅</span>Due</dt><dd class="p-value">20.05.2026</dd></div>
    </dl>
    <div class="nk-prose"><p>Table, board and list read the same rows; filters and sort act on all three.</p></div>
  </div>
</aside></div>
```

**Small screens:** Below 860px a bottom sheet over a dimmed page, title in 28px – and modal there: the page is inert and scroll-locked, a tap on the dimmed page closes it.

### 3.67 `<nk-dialog>` – Dialog

A question or a short form – “Move to trash?”, the name of a new view, the link between two tasks – with the contract of `nk-modal` and `nk-sheet`: `show()`, `close()`, `toggle()`, `nk-toggle`; Escape – captured, before a peek, a menu or a modal behind it – and the backdrop close it; focus moves in, to an `[autofocus]` element or the first field or button, and back; the page behind is inert and scroll-locked. It lies above the modal and the sheet. `title` is the heading, the default slot the text or the fields, `slot="actions"` the buttons, the confirming one last. A button in `slot="actions"` with a `value` closes it with that value, one anywhere inside with `data-close` too – another button with a value, an option of `nk-segmented` say, leaves it open – and so does the submit of a `<form method="dialog">` inside; before it closes, `nk-close` fires and can be cancelled – the place to check an input. `alert` for a question, `wide` (560px) for a form. `show(from)` hands focus back to `from` – the ⋯ of a menu that closed. Place it directly under `<body>`. While it is open the page behind is inert, but floating menus and date pickers under `<body>` – and the tooltip and toast – stay usable, so a field in the dialog can open one.

```html
<nk-dialog open alert title="Move “NotionKit MVP” to trash?">
  The page and its sub-pages can be restored from Trash for 30 days.
  <nk-btn slot="actions" variant="secondary" value="">Cancel</nk-btn>
  <nk-btn slot="actions" variant="danger-solid" value="trash">Move to trash</nk-btn>
</nk-dialog>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | – | Shown. |
| `title` | string | – | Heading and the dialog’s name – never a tooltip. |
| `alert` | boolean | – | An alertdialog, described by its text. |
| `wide` | boolean | – | 560px instead of 440px. |

**Slots:** `(default)` – The text or the fields. · `actions` – The buttons, right; a `value` closes with it.

**Events:** `nk-close` `{ value }` – About to close – cancel it to keep it open. · `nk-toggle` `{ open }` – Opened / closed.

**Properties:** `open`, `returnValue`, `title` · **Methods:** `show(from)`, `close(value)`, `toggle()`

**Replaces:** `.nk-dialog-backdrop`, `.open`, `.nk-dialog`, `.wide`, `.dl-title`, `.dl-body`, `.dl-actions`

```html
<!-- equivalent class markup -->
<div class="nk-dialog-backdrop open"><div class="nk-dialog" role="alertdialog" aria-modal="true" aria-label="Move to trash">
  <div class="dl-title">Move “NotionKit MVP” to trash?</div>
  <div class="dl-body">The page and its sub-pages can be restored from Trash for 30 days.</div>
  <div class="dl-actions"><button class="nk-btn secondary">Cancel</button><button class="nk-btn danger-solid">Move to trash</button></div>
</div></div>
```

**Small screens:** Below 860px a bottom sheet with a grabber, the buttons stacked across the width, the confirming one on top.

### 3.68 `<nk-settings-pane>` – Settings pane

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
| `title` | string | – | Pane heading. Read once and taken off the host, so it never shows as a tooltip. |
| `active` | boolean | – | Visible (managed by the modal). |

**Slots:** `(default)` – Fields, headings, anything.

**Replaces:** `.nk-settings-pane`, `.active`

```html
<!-- equivalent class markup -->
<section class="nk-settings-pane active"><h2>Notifications</h2><h3>Email</h3><div class="nk-field"><div><div class="f-label">Email notifications</div></div><div class="f-control"><button class="nk-switch" role="switch" aria-checked="true"></button></div></div></section>
```

**Small screens:** Content padding drops to 24px below 860px.

### 3.69 `<nk-settings-user>` – Settings user

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

### 3.70 `<nk-cmdk>` – Command palette

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

### 3.71 `<nk-menu>` – Menu

A 230px context menu. Items are `nk-menu-item`s (`type="separator"` / `"label"` for the rest); ↑↓ move, Enter selects, `nk-select` bubbles up. Inside `nk-pop` or the workspace switcher it is part of their surface. With `floating` it is a menu over the page of its own, NotionKit’s `.nk-pop.floating`: `menu.show(button)` opens it under the button, right edges aligned (`align="start"`: left edges), and it fades in like the palette. A tap outside closes it and reaches nothing else; Escape and a chosen item close it, a switch row keeps it open. Opened from the keyboard, focus moves to the first item and back when it closes. Put it directly under `<body>`, like the other overlays. Floating, it opens upwards where the window ends below and there is more room above, and a menu longer than the room scrolls inside; in an `nk-modal` or `nk-dialog` it sits right as well, and opened from one of them it stays usable – an open dialog, modal or sheet leaves floating menus alone.

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

| Attribute | Type | Default | Description |
|---|---|---|---|
| `floating` | boolean | – | A menu over the page: fixed, closed until `open`, fades in. |
| `sheet` | boolean | – | Below 860px a bottom sheet (with `floating`). |
| `open` | boolean | – | Shown (with `floating`). |
| `align` | end | start | `end` | Which edges `show(anchor)` aligns. |

**Slots:** `(default)` – `nk-menu-item` children.

**Events:** `nk-select` `{ value, label, item }` – From the chosen item. · `nk-toggle` `{ open }` – A floating menu opened / closed.

**Properties:** `open`, `items` · **Methods:** `show(anchor?)`, `close()`, `toggle(anchor?)`, `focusFirst()`

**Replaces:** `.nk-pop`, `.nk-menu`, `.nk-menu-item`, `.m-icon`, `.m-shortcut`, `.danger`, `.nk-menu-sep`, `.nk-menu-label`, `.floating`, `.sheet`, `.open`

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

**Small screens:** With `sheet` the floating menu is a bottom sheet below 860px – full width, a grabber, 40px rows, the page dimmed – whatever position `show()` wrote: one markup, two presentations, as Notion’s mobile app opens every menu.

### 3.72 `<nk-menu-item>` – Menu item

One row of `nk-menu`: icon, label, shortcut; `danger` for destructive actions. `type` switches to a separator or a group label, or to a row with a switch on the right – “Small text” in Notion’s page menu: a click flips `checked` and fires `nk-change`, so the menu stays open. `type="check"` puts a ✓ where the shortcut stands, as in a filter menu – for a choice of several: a click flips `checked` and fires `nk-change { value, checked }` instead of `nk-select`, and the menu stays open.

```html
<nk-menu><nk-menu-item icon="✏️" shortcut="⌘E" value="rename">Rename</nk-menu-item><nk-menu-item type="switch" icon="🔡" value="small" checked>Small text</nk-menu-item></nk-menu>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `icon` | string | – | Leading icon. |
| `shortcut` | string | – | Trailing shortcut text. |
| `value` | string | – | Reported value (default: text). |
| `danger` | boolean | – | Red text. |
| `type` | item | separator | label | switch | check | `item` | Row kind. |
| `checked` | boolean | – | The switch is on, the check shows (type="switch" / "check"). |
| `disabled` | boolean | – | Not selectable. |

**Slots:** `(default)` – Label. · `icon` – Icon node.

**Events:** `nk-select` `{ value, label, item }` – Clicked / Enter. · `nk-change` `{ value, checked, item }` – A switch or check row flipped.

**Replaces:** `.nk-menu-item`, `.danger`, `.nk-menu-sep`, `.nk-menu-label`

```html
<!-- equivalent class markup -->
<div class="nk-pop nk-menu"><div class="nk-menu-item"><span class="m-icon">✏️</span>Rename<span class="m-shortcut">⌘E</span></div><div class="nk-menu-item" role="menuitemcheckbox" aria-checked="true"><span class="m-icon">🔡</span>Small text<span class="nk-switch" aria-hidden="true" aria-checked="true"></span></div></div>
```

**Small screens:** Unchanged.

### 3.73 `<nk-pop>` – Popover

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

### 3.74 `<nk-emoji-picker>` – Emoji picker

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

### 3.75 `<nk-toast>` – Toast

One inverted pill at the bottom centre, above every overlay; over a tab bar at the bottom of the screen it rises 12px above the bar. `toast.show("Saved")` shows it and hides it after `duration` ms; `open` is the state.

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

### 3.76 `<nk-tooltip>` – Tooltip

Notion’s hover hint in the toast’s colours, a shortcut muted beside it. One `<nk-tooltip>` without `for` serves every element with `data-tooltip` (and `data-tooltip-key`) on the page, inside shadow roots too – a whole toolbar in one element; with `for` it belongs to one element and shows its own content and `shortcut`. It appears after `delay` ms (400) under the pointer and at once on keyboard focus, never on touch; leaving, a press, blur, scrolling and Escape hide it. It sits 6px below its target and centred, above it where the window ends, 8px inside the window – `placeNear` in `util/floating.js`. `show(target, text, shortcut)` takes an element or a rect, for what has no element of its own: the bars of a chart. The target’s `aria-describedby` names it while it shows. Hover the buttons. A tooltip shown with `show(rect, …)` stays until `hide()`, the pointer on another `[data-tooltip]`, a press or Escape; the wheel hides it too, also inside a shadow root. A line break in the text is kept.

```html
<div style="display:flex;gap:16px;align-items:center;padding:4px 0 44px">
  <nk-btn variant="topbar" aria-label="Style, export and more" data-tooltip="Style, export and more">⋯</nk-btn>
  <nk-btn variant="topbar" aria-label="Add to Favourites" data-tooltip="Add to Favourites">⭐</nk-btn>
  <nk-btn variant="topbar" id="ttSidebar" aria-label="Open sidebar">☰</nk-btn>
</div>
<nk-tooltip></nk-tooltip>
<nk-tooltip for="ttSidebar" shortcut="⌘\">Open sidebar</nk-tooltip>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `for` | id | – | The one element it belongs to; without it, every `[data-tooltip]`. |
| `shortcut` | string | – | With `for`: the shortcut beside the text. |
| `delay` | ms | `400` | Wait under the pointer. |
| `placement` | bottom | top | `bottom` | Preferred side. |

**Slots:** `(default)` – With `for`: the text.

**Properties:** `open` · **Methods:** `show(target, text, shortcut)`, `hide()`

**Replaces:** `.nk-tooltip`, `.open`, `.tt-key`

**Small screens:** No hover on a phone: it shows nothing on touch.

## Data & collaboration (wave 5)

### 3.77 `<nk-database>` – Database

The view switcher with Notion’s toolbar: child views (`nk-table-view`, `nk-board-view`, `nk-list-view`) become the tabs on the left, `slot="tools"` holds the view’s tools on the right – `<nk-btn variant="tool">` for Filter, Sort and search, then “New” – and `slot="filters"` the `nk-filter-bar` under them. `columns` and `rows` are pushed into every view. `view` selects the active one; `count` on a view shows the row count as badge. No fetching: give it data, listen to events.

```html
<nk-database view="table" add-view>
  <nk-btn slot="tools" variant="tool" active>Filter</nk-btn>
  <nk-btn slot="tools" variant="tool">Sort</nk-btn>
  <nk-btn slot="tools" variant="primary" small>New</nk-btn>
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
    { key: 'effort', label: 'Effort (h)', type: 'number', icon: '#', locale: 'en', format: { minimumFractionDigits: 1 } },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '08.05.2026', progress: 100, effort: 6, cover: '/covers/aurora.svg' },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '10.05.2026', progress: 100, effort: 4.5, cover: '/covers/dunes.svg' },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '20.05.2026', progress: 65, effort: 12.5, cover: '/covers/meadow.svg' },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0, effort: 8, cover: '/covers/tide.svg' },
  ];
}</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `view` | string | – | Name of the active view. |
| `add-view` | boolean | – | Show a ＋ tab (fires `nk-action`). |

**Slots:** `(default)` – View elements. · `tools` – The tools right of the tabs: `<nk-btn variant="tool">`, a small primary “New”. · `filters` – Under the toolbar: `nk-filter-bar`.

**Events:** `nk-view-change` `{ view }` – Tab switched. · `nk-action` `{ action: 'add-view' }` – ＋ clicked. · `nk-select / nk-change / nk-action` `(from the views)` – Bubble up from the active view.

**Properties:** `columns`, `rows`, `view`, `views` · **Methods:** `refresh()`

**Replaces:** `.nk-database`, `.nk-db-toolbar`, `.nk-db-tabs`, `.nk-db-tab`, `.active`, `.badge`, `.add`, `.tools`

```html
<!-- equivalent class markup -->
<div class="nk-database">
  <div class="nk-db-toolbar">
    <div class="nk-db-tabs"><span class="nk-db-tab active">▦ Table <span class="badge">4</span></span><span class="nk-db-tab">▤ Board</span><span class="nk-db-tab add">＋</span></div>
    <div class="tools"><button class="nk-db-tool active">Filter</button><button class="nk-db-tool">Sort</button><button class="nk-btn primary small">New</button></div>
  </div>
  <div class="nk-table-wrap"><table class="nk-table">
  <thead><tr><th><span class="th-icon">📄</span>Name</th><th><span class="th-icon">◉</span>Status</th><th><span class="th-icon">👤</span>Owner</th><th><span class="th-icon">📅</span>Due</th><th><span class="th-icon">▰</span>Progress</th><th><span class="th-icon">#</span>Effort (h)</th></tr></thead>
  <tbody>
    <tr><td><span class="row-title">🧭 App shell & sidebar</span></td><td><span class="nk-tag green">Done</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">08.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td><td class="num"><span>6.0</span></td></tr>
    <tr><td><span class="row-title">📄 Page shell & typography</span></td><td><span class="nk-tag green">Done</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">10.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td><td class="num"><span>4.5</span></td></tr>
    <tr><td><span class="row-title">🗃️ Database table view</span></td><td><span class="nk-tag blue">In progress</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">20.05.2026</span></td><td><span class="nk-progress"><i style="width:65%"></i></span><span class="nk-progress-label">65%</span></td><td class="num"><span>12.5</span></td></tr>
    <tr><td><span class="row-title">▤ Board view & drag-and-drop</span></td><td><span class="nk-tag orange">Planned</span></td><td><span class="person-cell">—</span></td><td><span class="date-cell">02.06.2026</span></td><td><span class="nk-progress"><i style="width:0%"></i></span><span class="nk-progress-label">0%</span></td><td class="num"><span>8.0</span></td></tr>
  </tbody>
</table><div class="nk-new-row">＋ New page</div></div>
</div>
```

**Small screens:** The tabs scroll sideways when the row gets narrow; the tools keep their place. Tables and boards scroll horizontally; nothing breaks.

### 3.78 `<nk-table-view>` – Table view

Renders `columns` × `rows` as the NotionKit table. Cells are polymorphic (`text`, `select`, `multi-select`, `date`, `person`, `checkbox`, `url`, `number`, `progress`) and rendered as plain markup by the exported `renderPropertyCell()` – every cell rule starts with `.nk-table`, so a cell element of its own would never be styled. Header clicks sort with `sortable`. A `number` column stands right-aligned in figures of equal width, formatted by its `locale` and `format` (Intl.NumberFormat options); a person’s `color` takes one of the nine names. A column of type `actions` (NotionKit 1.12.0) sets buttons in each row from `column.actions` – `[{ action, label, icon, danger, disabled, tooltip }]` –, and a row’s value – a list of action names – picks which of them it shows; a click fires `nk-action { action, row, id, anchor }` instead of selecting the row. A `url` value may be `{ href, label, target }`: a link of your own, to another page of the app, with its own text. A text value may be `{ text, desc, color, tooltip }` (NotionKit 1.15.0): a quiet second line, one of Notion’s nine text colours – `orange` for an error –, the whole text in a tooltip. Sorting goes by the value, not the text shown: dates by their time, selects by the order of their options, empty cells last; `sortKey` on a column sorts by another field of the row, a `sort` in a cell’s object by that value. A `date` column with `format` – `'short'`, `'relative'` or the options of Intl.DateTimeFormat – shows ISO dates and date-times formatted in its `locale`.

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
    { key: 'effort', label: 'Effort (h)', type: 'number', icon: '#', locale: 'en', format: { minimumFractionDigits: 1 } },
    { key: 'actions', type: 'actions', actions: [{ action: 'open', label: 'Open' }, { action: 'archive', label: 'Archive', danger: true }] },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: { text: 'App shell & sidebar', desc: 'Three open questions' }, status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '08.05.2026', progress: 100, effort: 6, cover: '/covers/aurora.svg' },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '10.05.2026', progress: 100, effort: 4.5, cover: '/covers/dunes.svg' },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '20.05.2026', progress: 65, effort: 12.5, cover: '/covers/meadow.svg' },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0, effort: 8, actions: ['open'], cover: '/covers/tide.svg' },
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
| `new-row-label` | string | `＋ New page · ＋ Neue Seite` | Its text. |
| `sortable` | boolean | – | Header click sorts locally. |
| `sort-key` | string | – | Sorted column. |
| `sort-dir` | asc | desc | – | Direction. |
| `wrap` | boolean | – | Cell text may break (Notion's "wrap column"). |

**Events:** `nk-select` `{ row, id, key, cell }` – Row clicked. · `nk-change` `{ row, key, value }` – Checkbox cell toggled (row updated in place). · `nk-action` `{ action: 'sort' | 'new-row' | an actions column's action, key?, value?, row?, id?, anchor? }` – Header, add row or a row’s button clicked.

**Properties:** `columns`, `rows`, `data` · **Methods:** `refresh()`

**Replaces:** `.nk-table-wrap`, `.nk-table`, `.wrap`, `.th-icon`, `.row-title`, `.date-cell`, `.person-cell`, `.nk-avatar`, `.num`, `.row-actions`, `.actions`, `.td-text`, `.td-desc`, `.nk-new-row`

```html
<!-- equivalent class markup -->
<div class="nk-table-wrap"><table class="nk-table">
  <thead><tr><th><span class="th-icon">📄</span>Name</th><th><span class="th-icon">◉</span>Status</th><th><span class="th-icon">👤</span>Owner</th><th><span class="th-icon">📅</span>Due</th><th><span class="th-icon">▰</span>Progress</th><th><span class="th-icon">#</span>Effort (h)</th><th class="actions"></th></tr></thead>
  <tbody>
    <tr><td><span class="row-title">🧭 App shell & sidebar</span><span class="td-desc">Three open questions</span></td><td><span class="nk-tag green">Done</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">08.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td><td class="num"><span>6.0</span></td><td><span class="row-actions"><button class="nk-btn secondary small">Open</button><button class="nk-btn danger small">Archive</button></span></td></tr>
    <tr><td><span class="row-title">📄 Page shell & typography</span></td><td><span class="nk-tag green">Done</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">10.05.2026</span></td><td><span class="nk-progress"><i style="width:100%"></i></span><span class="nk-progress-label">100%</span></td><td class="num"><span>4.5</span></td><td><span class="row-actions"><button class="nk-btn secondary small">Open</button><button class="nk-btn danger small">Archive</button></span></td></tr>
    <tr><td><span class="row-title">🗃️ Database table view</span></td><td><span class="nk-tag blue">In progress</span></td><td><span class="person-cell"><span class="nk-avatar small purple">MK</span> Marcel</span></td><td><span class="date-cell">20.05.2026</span></td><td><span class="nk-progress"><i style="width:65%"></i></span><span class="nk-progress-label">65%</span></td><td class="num"><span>12.5</span></td><td><span class="row-actions"><button class="nk-btn secondary small">Open</button><button class="nk-btn danger small">Archive</button></span></td></tr>
    <tr><td><span class="row-title">▤ Board view & drag-and-drop</span></td><td><span class="nk-tag orange">Planned</span></td><td><span class="person-cell">—</span></td><td><span class="date-cell">02.06.2026</span></td><td><span class="nk-progress"><i style="width:0%"></i></span><span class="nk-progress-label">0%</span></td><td class="num"><span>8.0</span></td><td><span class="row-actions"><button class="nk-btn secondary small">Open</button></span></td></tr>
  </tbody>
</table><div class="nk-new-row">＋ New page</div></div>
```

**Small screens:** Scrolls horizontally inside `.nk-table-wrap`.

### 3.79 `<nk-board-view>` – Board view

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
    { key: 'effort', label: 'Effort (h)', type: 'number', icon: '#', locale: 'en', format: { minimumFractionDigits: 1 } },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '08.05.2026', progress: 100, effort: 6, cover: '/covers/aurora.svg' },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '10.05.2026', progress: 100, effort: 4.5, cover: '/covers/dunes.svg' },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '20.05.2026', progress: 65, effort: 12.5, cover: '/covers/meadow.svg' },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0, effort: 8, cover: '/covers/tide.svg' },
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

### 3.80 `<nk-list-view>` – List view

The third database view: one line per row – icon and title, the `meta-keys` on the right (default: the select and date columns, in column order). Dates and text stand as text, selects as tags, a person as avatar and name. Rows fire `nk-select`; `new-row` adds the add row.

```html
<nk-list-view meta-keys="due,status"></nk-list-view>
<script>{
  const db = document.currentScript.previousElementSibling;
  db.columns = [
    { key: 'name', label: 'Name', type: 'text', icon: '📄', title: true },
    { key: 'status', label: 'Status', type: 'select', icon: '◉', options: [
      { value: 'planned', label: 'Planned', color: 'orange' }, { value: 'progress', label: 'In progress', color: 'blue' }, { value: 'done', label: 'Done', color: 'green' } ] },
    { key: 'owner', label: 'Owner', type: 'person', icon: '👤' },
    { key: 'due', label: 'Due', type: 'date', icon: '📅' },
    { key: 'progress', label: 'Progress', type: 'progress', icon: '▰' },
    { key: 'effort', label: 'Effort (h)', type: 'number', icon: '#', locale: 'en', format: { minimumFractionDigits: 1 } },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '08.05.2026', progress: 100, effort: 6, cover: '/covers/aurora.svg' },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '10.05.2026', progress: 100, effort: 4.5, cover: '/covers/dunes.svg' },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '20.05.2026', progress: 65, effort: 12.5, cover: '/covers/meadow.svg' },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0, effort: 8, cover: '/covers/tide.svg' },
  ];
}</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | View name. |
| `label` | string | – | Tab label. |
| `title-key` | string | – | Title column. |
| `meta-keys` | list | – | Comma-separated columns on the right. |
| `new-row` | boolean | – | Show the add row. |
| `new-row-label` | string | `＋ New page · ＋ Neue Seite` | Its text. |

**Events:** `nk-select` `{ row, id }` – Row clicked or Enter. · `nk-action` `{ action: 'new-row' }` – Add row clicked.

**Properties:** `columns`, `rows`, `data` · **Methods:** `refresh()`

**Replaces:** `.nk-list`, `.nk-list-item`, `.l-icon`, `.l-title`, `.l-meta`

```html
<!-- equivalent class markup -->
<div class="nk-list">
  <div class="nk-list-item"><span class="l-icon">🧭</span><span class="l-title">App shell & sidebar</span><span class="l-meta">08.05.2026<span class="nk-tag green">Done</span></span></div>
  <div class="nk-list-item"><span class="l-icon">📄</span><span class="l-title">Page shell & typography</span><span class="l-meta">10.05.2026<span class="nk-tag green">Done</span></span></div>
  <div class="nk-list-item"><span class="l-icon">🗃️</span><span class="l-title">Database table view</span><span class="l-meta">20.05.2026<span class="nk-tag blue">In progress</span></span></div>
  <div class="nk-list-item"><span class="l-icon">▤</span><span class="l-title">Board view & drag-and-drop</span><span class="l-meta">02.06.2026<span class="nk-tag orange">Planned</span></span></div>
</div>
```

**Small screens:** Stays one line per row: the title ends in an ellipsis, the properties keep their place.

### 3.81 `<nk-calendar-view>` – Calendar view

The fourth database view (NotionKit 1.9.0): a month, the rows as cards on their dates. `date-key` names the date column (default: the first one) – `YYYY-MM-DD` or `D.M.YYYY`, a range on its start. Today sits on a red pill, days of other months are washed; `weeks` puts the calendar week in front, `weekend` washes the days not worked. A card fires `nk-select` like a row of the table; Today and ‹ › change the month (`nk-month`). In `nk-database` it is a tab like the others and shows the same rows.

```html
<nk-calendar-view date-key="due" month="2026-05" today="2026-05-20" weeks week-start="1" today-label="Today"></nk-calendar-view>
<script>{
  const db = document.currentScript.previousElementSibling;
  db.columns = [
    { key: 'name', label: 'Name', type: 'text', icon: '📄', title: true },
    { key: 'status', label: 'Status', type: 'select', icon: '◉', options: [
      { value: 'planned', label: 'Planned', color: 'orange' }, { value: 'progress', label: 'In progress', color: 'blue' }, { value: 'done', label: 'Done', color: 'green' } ] },
    { key: 'owner', label: 'Owner', type: 'person', icon: '👤' },
    { key: 'due', label: 'Due', type: 'date', icon: '📅' },
    { key: 'progress', label: 'Progress', type: 'progress', icon: '▰' },
    { key: 'effort', label: 'Effort (h)', type: 'number', icon: '#', locale: 'en', format: { minimumFractionDigits: 1 } },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '08.05.2026', progress: 100, effort: 6, cover: '/covers/aurora.svg' },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '10.05.2026', progress: 100, effort: 4.5, cover: '/covers/dunes.svg' },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '20.05.2026', progress: 65, effort: 12.5, cover: '/covers/meadow.svg' },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0, effort: 8, cover: '/covers/tide.svg' },
  ];
}</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | `calendar` | View name. |
| `label` | string | – | Tab label. |
| `date-key` | string | – | Date column. |
| `title-key` | string | – | Title column. |
| `month` | YYYY-MM | – | The month shown; default today’s. |
| `weeks` | boolean | – | The ISO calendar week in front of each row. |
| `week-start` | 0–6 | `Intl` | First day of the week: 0 Sunday, 1 Monday … |
| `weekend` | list | – | Weekdays not worked, washed – `6,0`. |
| `today` | YYYY-MM-DD | – | Another today – for tests and docs. |
| `locale` | BCP 47 | `lang` | Language of the names and the week. |
| `today-label` | string | `Today · Heute` | Today button. |
| `prev-label` | string | `Previous month · Voriger Monat` | Names ‹. |
| `next-label` | string | `Next month · Nächster Monat` | Names ›. |
| `week-label` | string | `W · KW` | Head of the week column. |

**Events:** `nk-select` `{ row, id }` – Card clicked or Enter. · `nk-month` `{ month }` – Another month shown.

**Properties:** `columns`, `rows`, `data`, `month` · **Methods:** `refresh()`

**Replaces:** `.nk-calendar-view`, `.weeks`, `.cv-head`, `.cv-title`, `.cal-nav`, `.cv-grid`, `.cv-wd`, `.cv-week`, `.cv-day`, `.out`, `.off`, `.today`, `.cv-num`, `.cv-item`

```html
<!-- equivalent class markup -->
<div class="nk-calendar-view weeks">
  <div class="cv-head"><div class="cv-title">May 2026</div><button class="cal-nav">Today</button><button class="cal-nav" aria-label="Previous month"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><button class="cal-nav" aria-label="Next month"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>
  <div class="cv-grid">
    <div class="cv-wd">W</div><div class="cv-wd">Mon</div><div class="cv-wd">Tue</div><div class="cv-wd">Wed</div><div class="cv-wd">Thu</div><div class="cv-wd">Fri</div><div class="cv-wd">Sat</div><div class="cv-wd">Sun</div>
    <div class="cv-week">18</div><div class="cv-day out"><span class="cv-num">27</span></div><div class="cv-day out"><span class="cv-num">28</span></div><div class="cv-day out"><span class="cv-num">29</span></div><div class="cv-day out"><span class="cv-num">30</span></div><div class="cv-day"><span class="cv-num">1</span></div><div class="cv-day"><span class="cv-num">2</span></div><div class="cv-day"><span class="cv-num">3</span></div>
    <div class="cv-week">19</div><div class="cv-day"><span class="cv-num">4</span></div><div class="cv-day"><span class="cv-num">5</span></div><div class="cv-day"><span class="cv-num">6</span></div><div class="cv-day"><span class="cv-num">7</span></div><div class="cv-day"><span class="cv-num">8</span><button class="cv-item">🧭 App shell & sidebar</button></div><div class="cv-day"><span class="cv-num">9</span></div><div class="cv-day"><span class="cv-num">10</span><button class="cv-item">📄 Page shell & typography</button></div>
    <div class="cv-week">20</div><div class="cv-day"><span class="cv-num">11</span></div><div class="cv-day"><span class="cv-num">12</span></div><div class="cv-day"><span class="cv-num">13</span></div><div class="cv-day"><span class="cv-num">14</span></div><div class="cv-day"><span class="cv-num">15</span></div><div class="cv-day"><span class="cv-num">16</span></div><div class="cv-day"><span class="cv-num">17</span></div>
    <div class="cv-week">21</div><div class="cv-day"><span class="cv-num">18</span></div><div class="cv-day"><span class="cv-num">19</span></div><div class="cv-day today"><span class="cv-num">20</span><button class="cv-item">🗃️ Database table view</button></div><div class="cv-day"><span class="cv-num">21</span></div><div class="cv-day"><span class="cv-num">22</span></div><div class="cv-day"><span class="cv-num">23</span></div><div class="cv-day"><span class="cv-num">24</span></div>
    <div class="cv-week">22</div><div class="cv-day"><span class="cv-num">25</span></div><div class="cv-day"><span class="cv-num">26</span></div><div class="cv-day"><span class="cv-num">27</span></div><div class="cv-day"><span class="cv-num">28</span></div><div class="cv-day"><span class="cv-num">29</span></div><div class="cv-day"><span class="cv-num">30</span></div><div class="cv-day"><span class="cv-num">31</span></div>
  </div>
</div>
```

**Small screens:** Keeps seven columns; the days get lower (64px) and the cards smaller.

### 3.82 `<nk-gallery-view>` – Gallery view

The fifth database view: the rows as cards with a picture on top, in a grid that fills the row – Notion’s gallery, for a course catalog or a reading list. `cover-key` names the row field with the picture’s URL (default: `cover`); a row without one shows the cover gradient, `no-cover` leaves the pictures out. The picture stands in 2:1, cropped to fill; `fit` shows it whole, for logos. `size` small, medium or large sets the card size – columns from 180, 260 or 340px. Cards show the title and the `meta-keys` (default: the select and date columns) and fire `nk-select` on a click, Enter or Space; `new-row` adds the add card. `href-key` names the row field with a card’s address: such a card is a link, `<a class="nk-card" href>` in a `.card-item` that carries the list item’s role – to open a course in a new tab or copy its address. A plain click, and Enter, fire the same `nk-select`; cancel it and the browser stays. A middle click or one with Cmd, Ctrl, Shift or Alt fires nothing and does what a link does.

```html
<nk-gallery-view meta-keys="status,due" new-row></nk-gallery-view>
<script>{
  const db = document.currentScript.previousElementSibling;
  db.columns = [
    { key: 'name', label: 'Name', type: 'text', icon: '📄', title: true },
    { key: 'status', label: 'Status', type: 'select', icon: '◉', options: [
      { value: 'planned', label: 'Planned', color: 'orange' }, { value: 'progress', label: 'In progress', color: 'blue' }, { value: 'done', label: 'Done', color: 'green' } ] },
    { key: 'owner', label: 'Owner', type: 'person', icon: '👤' },
    { key: 'due', label: 'Due', type: 'date', icon: '📅' },
    { key: 'progress', label: 'Progress', type: 'progress', icon: '▰' },
    { key: 'effort', label: 'Effort (h)', type: 'number', icon: '#', locale: 'en', format: { minimumFractionDigits: 1 } },
  ];
  db.rows = [
    { id: 1, icon: '🧭', name: 'App shell & sidebar', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '08.05.2026', progress: 100, effort: 6, cover: '/covers/aurora.svg' },
    { id: 2, icon: '📄', name: 'Page shell & typography', status: 'done', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '10.05.2026', progress: 100, effort: 4.5, cover: '/covers/dunes.svg' },
    { id: 3, icon: '🗃️', name: 'Database table view', status: 'progress', owner: { name: 'Marcel', initials: 'MK', color: 'purple' }, due: '20.05.2026', progress: 65, effort: 12.5, cover: '/covers/meadow.svg' },
    { id: 4, icon: '▤', name: 'Board view & drag-and-drop', status: 'planned', due: '02.06.2026', progress: 0, effort: 8, cover: '/covers/tide.svg' },
  ];
}</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | View name. |
| `label` | string | – | Tab label. |
| `cover-key` | string | `cover` | Row field with the picture’s URL. |
| `no-cover` | boolean | – | Cards without pictures. |
| `size` | small | medium | large | `medium` | Card size. |
| `fit` | boolean | – | Show a picture whole instead of cropped. |
| `title-key` | string | – | Title column. |
| `meta-keys` | list | – | Comma-separated columns under the title. |
| `href-key` | string | – | Row field with the card’s address; such a card is a link. |
| `new-row` | boolean | – | Show the add card. |
| `new-row-label` | string | `＋ New page · ＋ Neue Seite` | Its text. |

**Events:** `nk-select` `{ row, id, value }` – Card clicked, Enter or Space; a link card with a plain click or Enter – cancel it to stay. · `nk-action` `{ action: 'new-row' }` – Add card clicked.

**Properties:** `columns`, `rows`, `data` · **Methods:** `refresh()`

**Replaces:** `.nk-gallery`, `.small`, `.large`, `.fit`, `.nk-card`, `.card-item`, `.nk-cover`, `.card-title`, `.card-meta`, `.nk-new-row`

```html
<!-- equivalent class markup -->
<div class="nk-gallery" role="list">
  <div class="nk-card" role="listitem" tabindex="0"><div class="nk-cover"><img src="/covers/aurora.svg" alt=""></div><div class="card-title">🧭 App shell & sidebar</div><div class="card-meta"><span><span class="nk-tag green">Done</span></span><span>📅 08.05.2026</span></div></div>
  <div class="nk-card" role="listitem" tabindex="0"><div class="nk-cover"><img src="/covers/dunes.svg" alt=""></div><div class="card-title">📄 Page shell & typography</div><div class="card-meta"><span><span class="nk-tag green">Done</span></span><span>📅 10.05.2026</span></div></div>
  <div class="nk-card" role="listitem" tabindex="0"><div class="nk-cover"><img src="/covers/meadow.svg" alt=""></div><div class="card-title">🗃️ Database table view</div><div class="card-meta"><span><span class="nk-tag blue">In progress</span></span><span>📅 20.05.2026</span></div></div>
  <div class="nk-card" role="listitem" tabindex="0"><div class="nk-cover"><img src="/covers/tide.svg" alt=""></div><div class="card-title">▤ Board view & drag-and-drop</div><div class="card-meta"><span><span class="nk-tag orange">Planned</span></span><span>📅 02.06.2026</span></div></div>
  <div class="nk-new-row" role="button" tabindex="0">＋ New page</div>
</div>
```

**Small screens:** The grid drops columns by itself – one card per row on a phone, no breakpoint involved.

### 3.83 `<nk-filter-bar>` – Filter bar

The filters in effect as NotionKit’s filter pills – `.active` with an accent tint, a × to remove each, a quiet `add` pill at the end – with no inline style. In `slot="filters"` of `nk-database` the row sits under the toolbar. A pill’s label fires `nk-action { action: "edit" }`, the add pill `{ action: "add" }`, each with the clicked button as `anchor` for `menu.show(anchor)`. `bar.apply(rows)` keeps rows where every filter matches by strict equality (`row[key] === value`, so use the option value) – or differs with `op: "is-not"` – and the search text appears in any string field (a person’s `name`); the data logic stays yours. Its own Filter and Sort tools and the search field are there for a bar without a database toolbar. It keeps its own copy of `filters`: the array you pass is never changed, a removed pill is reported in `nk-change`.

```html
<nk-filter-bar add no-filter no-sort remove-label="Remove filter"></nk-filter-bar>
<script>{ document.currentScript.previousElementSibling.filters = [{ key: 'status', value: 'done', op: 'is-not', label: 'Status: Open' }]; }</script>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `add` | boolean | – | Show the add pill. |
| `add-label` | string | `＋ Filter` | Its text. |
| `no-filter` | boolean | – | Hide the Filter tool. |
| `no-sort` | boolean | – | Hide the Sort tool. |
| `filter-label` | string | `Filter` | Text of the Filter tool. |
| `sort-label` | string | `Sort · Sortieren` | Text of the Sort tool. |
| `remove-label` | string | `Remove filter · Filter entfernen` | The ×’s name, followed by the pill’s text. |
| `search` | boolean | – | Show the search field. |
| `placeholder` | string | – | Search placeholder. |

**Slots:** `(default)` – Extra pills or controls between the pills and the search.

**Events:** `nk-change` `{ filters, search }` – A filter removed or the search typed. · `nk-action` `{ action: 'edit' | 'add' | 'filter' | 'sort', index?, filter?, anchor }` – A pill or a tool clicked.

**Properties:** `filters`, `value` · **Methods:** `apply(rows)`

**Replaces:** `.nk-filter-row`, `.nk-filter-pill`, `.active`, `.add`, `.fp-remove`, `.nk-db-tool`, `.nk-input`

```html
<!-- equivalent class markup -->
<div class="nk-filter-row"><span class="nk-filter-pill active"><button>Status: Open</button><button class="fp-remove" aria-label="Remove filter">×</button></span><button class="nk-filter-pill add">＋ Filter</button></div>
```

**Small screens:** The pills wrap onto further rows.

### 3.84 `<nk-comments>` – Comment thread

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
| `send-label` | string | `Send · Senden` | Button text. |
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

### 3.85 `<nk-comment>` – Comment

One comment: avatar (initials + `color`), bold author, time, body. `slot="head"` adds content after the name.

```html
<nk-comments no-input><nk-comment author="Sara Lindt" time="1 hr ago" color="green">The board view already feels very close to the original. 👍</nk-comment></nk-comments>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `author` | string | – | Name. |
| `time` | string | – | Relative time. |
| `avatar` | string | – | Initials/emoji (default: from the author). |
| `color` | colour name | CSS | – | Avatar colour: one of the nine names or any CSS background; without it the avatar gradient. |

**Slots:** `(default)` – Body. · `head` – After the name (tag, badge). · `avatar` – Custom avatar.

**Replaces:** `.nk-comment`, `.c-head`, `.c-body`

```html
<!-- equivalent class markup -->
<div class="nk-comments"><div class="nk-comment"><span class="nk-avatar green">SL</span><div><div class="c-head"><b>Sara Lindt</b> · 1 hr ago</div><div class="c-body">The board view already feels very close to the original. 👍</div></div></div></div>
```

**Small screens:** Unchanged.

### 3.86 `<nk-ai-thread>` – AI thread

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

### 3.87 `<nk-ai-msg>` – AI message

One message. `role="user"` flips the avatar to the gradient; `badge` is the grey suffix after the name (“· AI”); plain `<button slot="actions">`s form the action row.

```html
<nk-ai-thread><nk-ai-msg role="user" bubble>What is still open on this page?</nk-ai-msg><nk-ai-msg role="assistant" name="Mona" badge="· AI">Two tasks are open: the <b>table view</b> sits at 65 % (due 20 May), the <b>board with drag and drop</b> is planned.<button slot="actions" value="copy">📋 Copy</button></nk-ai-msg></nk-ai-thread>
```

| Attribute | Type | Default | Description |
|---|---|---|---|
| `role` | user | assistant | `assistant` | Who speaks. |
| `name` | string | – | Name line. |
| `badge` | string | – | Grey suffix. |
| `avatar` | string | – | Initials/emoji. |
| `color` | CSS color | – | Avatar background override. |
| `bubble` | boolean | – | The message as a grey bubble without avatar or name; with `role="user"` on the right, as Notion’s AI chat shows your own question. |

**Slots:** `(default)` – Message body (HTML allowed). · `actions` – `<button value>` children. · `avatar` – Custom avatar.

**Events:** `nk-action` `{ action, value }` – Action button clicked.

**Replaces:** `.nk-ai-msg`, `.user`, `.bubble`, `.a-body`, `.a-name`, `.nk-ai-actions`

```html
<!-- equivalent class markup -->
<div class="nk-ai-thread"><div class="nk-ai-msg user bubble"><div class="a-body">What is still open on this page?</div></div><div class="nk-ai-msg"><span class="mini-avatar">✨</span><div class="a-body"><div class="a-name">Mona <span>· AI</span></div>Two tasks are open: the <b>table view</b> sits at 65 % (due 20 May), the <b>board with drag and drop</b> is planned.<div class="nk-ai-actions"><button>📋 Copy</button></div></div></div></div>
```

**Small screens:** Unchanged.

### 3.88 `<nk-ai-input-row>` – AI input row

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

Eight skeletons, one per app shape, mirroring the NotionKit CSS SKILL.md. Copy one, delete what you do not need.

## 4.1 Workspace app

**When:** the default for Notion-like document apps – pages are the primary object, a tree on the left, one page on the right. A page that is a database row shows its properties under the title and lists its sub-pages.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<nk-app>
  <!-- collapsible: the « collapses it on the desktop, the ☰ and ⌘\ bring it back -->
  <nk-sidebar slot="sidebar" id="sidebar" collapsible>
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
    <nk-btn variant="sidebar" aria-label="Menu" data-tooltip="Open sidebar">☰</nk-btn>
    <nk-breadcrumb><span>📊 Project overview</span><span>🚀 NotionKit MVP</span></nk-breadcrumb>
    <nk-btn slot="actions" variant="share">Share</nk-btn>
    <nk-theme-toggle slot="actions"></nk-theme-toggle>
  </nk-topbar>

  <!-- Page options: add full (full width) or small (14px text) to <nk-page>. -->
  <nk-page icon="🚀" cover>
    <nk-page-title editable>NotionKit MVP</nk-page-title>
    <nk-props>
      <nk-prop label="Status" icon="◉"><nk-tag color="blue">In progress</nk-tag></nk-prop>
      <nk-prop label="Owner" icon="👤"><nk-avatar size="small">AL</nk-avatar>Ada Lovelace</nk-prop>
      <nk-prop label="Due" icon="📅">2 June 2026</nk-prop>
    </nk-props>
    <p class="lead">A calm, document-centric workspace app – built from elements only.</p>
    <nk-heading>Sub-pages</nk-heading>
    <nk-list-view id="subpages" meta-keys="due,status"></nk-list-view>
    <!-- The editor: mount TipTap into a light-DOM .nk-block-host (docs-editor.js).
         Saved HTML shown read-only goes into <div class="nk-prose"> – same look. -->
    <div class="nk-block-host" id="editor"></div>
  </nk-page>

  <nk-tab-bar>
    <nk-tab-bar-item icon="🏠" value="home" active>Home</nk-tab-bar-item>
    <nk-tab-bar-item icon="📥" value="inbox">Inbox</nk-tab-bar-item>
    <nk-tab-bar-item icon="🔍" value="search">Search</nk-tab-bar-item>
    <nk-tab-bar-item icon="☰" drawer>More</nk-tab-bar-item>
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
```

Rules of the shell: `nk-sidebar`, `nk-topbar` and `nk-page` are `display: contents` hosts – their inner boxes are direct flex children of `.nk-app` / `.nk-main`, so do not style the hosts. `<nk-btn variant="sidebar">` is the ☰: shown below 860px only, where the sidebar is hidden, it opens it as a drawer – NotionKit’s own drawer rules, no script. For phones and installed PWAs add `<nk-tab-bar>` as the last child of `<nk-app>`: it lands below the page in the main column, is hidden above 860px (the sidebar is the navigation there) and shown below; a `drawer` item opens the sidebar. For Notion’s “More” – the rest of the sidebar as a list from the bottom edge – put an `<nk-sheet>` under `<body>` and open it from the item’s `nk-select` after `e.preventDefault()`. Never give the bar a `view-transition-name` – it stays put between pages.

## 4.2 Database app

**When:** structured, data-centric apps – a CRM, a tracker, an editorial calendar. Rows are the primary object; the database is the main room.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
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
    <nk-database id="db" view="table" add-view>
      <nk-btn slot="tools" variant="tool" id="filterBtn" aria-haspopup="menu">Filter</nk-btn>
      <nk-btn slot="tools" variant="primary" small id="newBtn">New</nk-btn>
      <nk-filter-bar slot="filters" id="filters" add no-filter no-sort></nk-filter-bar>
      <nk-table-view name="table" label="▦ Table" count new-row sortable></nk-table-view>
      <nk-board-view name="board" label="▤ Board" group-by="status" new-row></nk-board-view>
      <nk-calendar-view name="calendar" label="📅 Calendar" date-key="due" weeks></nk-calendar-view>
    </nk-database>
  </nk-page>
</nk-app>
<!-- a popover on the desktop, a bottom sheet on a phone -->
<nk-menu floating sheet id="filterMenu">
  <nk-menu-item type="label">Filter by</nk-menu-item>
  <nk-menu-item type="check" icon="◉" value="done">Status: Done</nk-menu-item>
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
  const FILTERS = { done: { key: 'status', value: 'done', label: 'Status: Done' } };
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
  db.addEventListener('nk-change', e => toast.show(`${e.detail.row.name} → ${e.detail.value}`));
  db.addEventListener('nk-action', e => { if (e.detail.action === 'new-row') { rows.push({ id: Date.now(), icon: '📄', name: 'New page', status: e.detail.value || 'planned', due: '—', progress: 0 }); render(); } });
</script>
</body>
</html>
```

Data contract: `columns` describe the properties (`type`: text | select | multi-select | date | person | checkbox | url | number | progress; a `select` carries `options: [{ value, label, color }]`; the title column has `title: true`), `rows` are plain objects keyed by `column.key` (a `person` is `{ name, initials, color }` or a string; `icon` on a row prefixes the title). The elements render what they get – filtering, sorting on the server, persistence are yours; `filters.apply(rows)` is the local filter, `op: 'is-not'` on a filter keeps the other rows. Assign a new array (`db.rows = …`) or call `db.refresh()` after mutating rows in place.

## 4.4 AI chat page

**When:** assistant-centred apps where the conversation is the document.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
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

**When:** you have an app already and need the settings overlay – plus the command palette and a toast, since they share the "overlay under body" rule (so do `<nk-sheet>` and a floating `<nk-menu>`).

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
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
    <nk-image-picker id="photo" initials="MK" label="My profile"></nk-image-picker>
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
    <nk-field label="Icon"><nk-image-picker square initials="A" max="256" type="image/png"></nk-image-picker></nk-field>
    <nk-field label="Public address"><nk-copy-field value="https://acme.example.com"></nk-copy-field></nk-field>
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
  photo.addEventListener('nk-change', e => console.log('upload', e.detail.size, 'bytes'));   // a data URL, scaled, EXIF-rotated
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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<div class="nk-page" style="padding-top:48px">
  <h1 class="nk-page-title">Set up your workspace</h1>
  <p class="lead">Three short steps. Everything can be changed later in Settings.</p>
  <nk-steps id="progress" label="Set up your workspace" current="1" steps="Profile, Notifications, Assistant style"></nk-steps>

  <form id="onboarding">
    <nk-heading>1 · Profile</nk-heading>
    <nk-field label="Display name" desc="Shown next to your comments."><nk-input name="name" required></nk-input></nk-field>
    <nk-field label="Email"><nk-input name="email" type="email" required></nk-input></nk-field>
    <nk-field label="Short bio" stacked><nk-textarea name="bio" rows="3" placeholder="A sentence about you"></nk-textarea></nk-field>

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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<nk-page narrow icon="📘" cover>
  <nk-page-title>NotionKit Elements</nk-page-title>
  <nk-page-actions><span>👤 Marcel Karas</span><span>📅 Created 12 May 2026</span><span>🏷️ <nk-tag color="green">Done</nk-tag></span></nk-page-actions>
  <p class="lead">A calm, document-centric workspace app – built from elements only.</p>

  <nk-banner variant="info">ℹ️ <span>This page is a <b>component preview</b> – every element follows the same design tokens.</span><button slot="action" type="button">View</button></nk-banner>
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
## 4.7 Home page

**When:** the first screen after sign-in – a greeting, the pages someone comes back to, what is due next. Notion calls it Home; LearnHub builds it as “My courses”, Auxdesk as “Overview”. Full width and small text, panels with a picture cover, a list for what is next.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
</head>
<body class="nk-body">
<nk-app>
  <nk-sidebar slot="sidebar">
    <nk-workspace-switcher slot="workspace" name="MonaHilft"></nk-workspace-switcher>
    <nk-tree>
      <nk-tree-item icon="🏠" value="home" active>Home</nk-tree-item>
      <nk-tree-item icon="🚀" value="mvp">NotionKit MVP</nk-tree-item>
    </nk-tree>
  </nk-sidebar>
  <nk-topbar><nk-breadcrumb><span>🏠 Home</span></nk-breadcrumb><nk-theme-toggle slot="actions"></nk-theme-toggle></nk-topbar>

  <!-- An app view, not a document: the whole width, 14px text. -->
  <nk-page full small>
    <nk-page-title>Good morning, Ada</nk-page-title>
    <nk-heading>🕘 Recently visited</nk-heading>
    <nk-panels>
      <nk-panel href="/roadmap" cover="covers/roadmap.jpg" icon="🚀" title="Roadmap"><p><nk-avatar size="small">AL</nk-avatar> 2 min ago</p></nk-panel>
      <nk-panel href="/kb" cover icon="📚" title="Knowledge base"><p>Yesterday</p></nk-panel>
      <nk-panel href="/onboarding" icon="🧭" title="Onboarding"><p>Monday</p></nk-panel>
    </nk-panels>
    <nk-heading>📌 Upcoming</nk-heading>
    <nk-list-view id="upcoming" meta-keys="due,status"></nk-list-view>
    <nk-heading>📊 This week</nk-heading>
    <nk-panels>
      <nk-panel title="Weekly review"><p>Three pages changed, one comment is waiting for an answer.</p><nk-progress value="60" label="60 %" wide></nk-progress></nk-panel>
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
```

`nk-panels` falls to one column on a phone; the list keeps one line per row and cuts the title first. A slotted `<p>` in a panel is styled by the panel – inside it, `<nk-avatar>` brings its own size.

## 4.8 Sign-in page

**When:** the page before the app – sign in with a provider or by email. A narrow centred column in a panel, no sidebar. Not an element on purpose: panel, field and buttons already are one.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit@1.18.0/notionkit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/notionkit-elements@1.18.0/dist/notionkit-elements.min.js"></script>
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
```

The form takes part in `FormData` through `nk-input`; `hidden` on the banner works on every element.


# 5. State & Event Overview

| Event | Fired by | `detail` |
|---|---|---|
| `nk-change` | every form control, `nk-segmented`, `nk-tabs`, `nk-tab-bar`, editable `nk-page-title` | `{ value, name }` – checkables add `checked` |
| `nk-input` | `nk-input`, `nk-textarea`, `nk-slider` | `{ value, name }` on every keystroke / drag |
| `nk-toggle` | `nk-toggle`, tree branches, overlays | `{ open }` |
| `nk-select` | tree items, menu items, breadcrumb, tabs, tab bar items, palette rows | `{ value, label, … }` |
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
| Blocks in a flex column with a `gap` that stand too far apart | `--nk-block-space: 0` on the column drops every block's outer margin; `flush` on one element drops its own. Headings keep theirs |
| A `<nk-calendar floating>` or `<nk-menu floating>` moved into a dialog so that it can be clicked | Leave it under `<body>`: an open `nk-dialog`, `nk-modal` or `nk-sheet` keeps floating menus, date pickers, the tooltip and the toast usable |
| A positioned wrapper around `<nk-menu>` to open it under a button | `<nk-menu floating sheet>` and `menu.show(button)`: it measures the button, closes on a tap outside and is a sheet on a phone |
| `<nk-sheet id="more">` opened from `app.html#more` | Give the overlay an id other than the hash: the browser scrolls to the fragment target and takes the focus the overlay just gave |
| `<nk-btn variant="topbar" onclick="sidebar.toggle()">☰</nk-btn>` plus a script that hides it on the desktop | `<nk-btn variant="sidebar">☰</nk-btn>` – shown below 860px only, opens the drawer |
| A `<pre>` with a Copy button that writes `navigator.clipboard` itself | `<nk-copy-field value="…" mono>` – Copy, the green moment after, the ⌘C fallback; `secret` for keys |
| A help or detail panel as a positioned `<aside>` with its own close logic | `<nk-peek>` – beside the page on the desktop, a sheet on a phone, Escape and outside clicks included |
| A file input plus canvas code for an avatar or logo | `<nk-image-picker>` – EXIF rotation, scaling, a data URL in `nk-change` |
| A positioned `<div>` with a scrim and its own Escape and focus logic for “Are you sure?” | `<nk-dialog alert title="…">` with `<nk-btn slot="actions" value="…">` – `nk-close` says which, and can be cancelled to check an input |
| `title="…"` on buttons for hints, or a hand-positioned hint | One `<nk-tooltip>` and `data-tooltip` (and `data-tooltip-key`) on the buttons; `tip.show(rect, text)` for chart bars |
| `hidden` on the sidebar plus an own button to widen the page on the desktop | `<nk-sidebar collapsible>` – the «, the ☰ of `<nk-btn variant="sidebar">`, ⌘\; `nk-collapse` to keep the state |
| A padding on the page while the side peek is open, or a peek wider by CSS | `<nk-peek resizable inset>` – the width is `--nk-peek-width`, `nk-resize` to keep it |
| A hand-built month grid, or `<input type="date">` for a date property | `<nk-calendar floating sheet>` and `picker.show(cell)` – the table's `nk-select` names the `key` and the `cell`; `range` for start and end, `weeks` for calendar weeks, `days` for holidays and marks |
| Rows laid out in a table of weeks to show them by date | `<nk-calendar-view date-key="due">` in `<nk-database>` – a tab like table and board |
| German labels on every instance (`copy-label="Kopieren"`, `today-label="Heute"`, `new-row-label="＋ Neue Seite"` …) | `<html lang="de">` – the elements bring the German texts, the accessible names too; keep an attribute for a label with a meaning of its own, `setStrings()` for another language |
| `<nk-steps selectable>` or a gallery whose `nk-select` sets `location.href` | `href` on the step, `href-key` on the gallery: a real link opens in a new tab and can be copied; cancel `nk-select` to route yourself |
| A `<div style="display:flex">` around `<nk-progress wide label>` in a panel so the label stays beside the bar | Not needed: with a `label` the element sets bar and label in one `.nk-progress-row` – beside each other in a flex column too |
| `copy-label="⧉"` or other glyphs to save room in `<nk-copy-field>` on a phone | Nothing: on a phone the buttons show icons by themselves, the words stay their names; `icons` does it at every width |
| `<nk-tab-bar>` kept on the last tab while a page from the drawer is open | Set `value` to that page's own value: a value no item has marks the `drawer` item ("More"), as on iOS |


# 7. Quick Reference

| Tag | Group | Key attributes | Key slots | Key events |
|---|---|---|---|---|
| `<nk-btn>` | forms | `variant`, `active`, `small`, `disabled` | `(default)` | `click` |
| `<nk-input>` | forms | `value`, `type`, `placeholder`, `name` | – | `nk-change`, `nk-input` |
| `<nk-copy-field>` | forms | `value`, `secret`, `icons`, `mono` | – | `nk-action` |
| `<nk-image-picker>` | forms | `src`, `initials`, `square`, `max` | – | `nk-change`, `nk-error` |
| `<nk-calendar>` | forms | `value`, `month`, `min`, `max` | – | `nk-change`, `nk-month`, `nk-toggle` |
| `<nk-textarea>` | forms | `value`, `placeholder`, `rows`, `name` | `(default)` | `nk-change`, `nk-input` |
| `<nk-select>` | forms | `value`, `name`, `disabled`, `required` | `(default)` | `nk-change` |
| `<nk-switch>` | forms | `checked`, `name`, `disabled`, `value` | `(default)` | `nk-change` |
| `<nk-check>` | forms | `checked`, `indeterminate`, `name`, `disabled` | `(default)` | `nk-change` |
| `<nk-radio>` | forms | `checked`, `name`, `disabled`, `value` | `(default)` | `nk-change` |
| `<nk-slider>` | forms | `value`, `min`, `max`, `step` | – | `nk-change`, `nk-input` |
| `<nk-field>` | forms | `label`, `desc`, `stacked`, `compact` | `(default)`, `label`, `desc` | – |
| `<nk-fields>` | forms | `fit` | `(default)` | – |
| `<nk-tag>` | content | `color` | `(default)` | – |
| `<nk-progress>` | content | `value`, `max`, `label`, `wide` | – | – |
| `<nk-callout>` | content | `icon` | `(default)`, `icon` | – |
| `<nk-bookmark>` | content | `href`, `title`, `desc`, `favicon` | – | `click` |
| `<nk-divider>` | content | – | – | – |
| `<nk-heading>` | content | `level` | `(default)` | – |
| `<nk-toggle>` | content | `label`, `open` | `(default)`, `label` | `nk-toggle` |
| `<nk-todo>` | content | `checked`, `name`, `disabled`, `value` | `(default)` | `nk-change` |
| `<nk-kbd>` | content | – | `(default)` | – |
| `<nk-code>` | content | `lang`, `highlight` | `(default)` | – |
| `<nk-quote>` | content | `cite` | `(default)` | – |
| `<nk-app>` | shell | `peek-inset` | `sidebar`, `(default)` | – |
| `<nk-sidebar>` | shell | `open`, `collapsible`, `collapsed`, `collapse-label` | `workspace`, `(default)`, `footer` | `nk-toggle`, `nk-collapse` |
| `<nk-workspace-switcher>` | shell | `name`, `avatar`, `open` | `avatar`, `menu` | `nk-toggle`, `nk-select` |
| `<nk-section-label>` | shell | `addable`, `label` | `(default)` | `nk-action` |
| `<nk-tree>` | shell | `manual` | `(default)` | `nk-select`, `nk-toggle`, `nk-action` |
| `<nk-tree-item>` | shell | `icon`, `label`, `value`, `href` | `(default)`, `icon`, `end` | `nk-select`, `nk-toggle`, `nk-action` |
| `<nk-topbar>` | shell | – | `(default)`, `actions` | – |
| `<nk-breadcrumb>` | shell | `separator` | `(default)` | `nk-select` |
| `<nk-theme-toggle>` | shell | `storage-key`, `title` | – | `nk-change` |
| `<nk-tab-bar>` | shell | `value`, `always`, `fixed`, `floating` | `(default)` | `nk-change`, `nk-select` |
| `<nk-tab-bar-item>` | shell | `icon`, `value`, `label`, `href` | `(default)`, `icon` | `nk-select` |
| `<nk-page>` | page | `icon`, `full`, `small`, `cover` | `(default)`, `cover`, `icon` | `nk-action` |
| `<nk-page-cover>` | page | `src`, `position` | – | – |
| `<nk-page-title>` | page | `editable`, `placeholder`, `value` | `(default)` | `nk-change` |
| `<nk-page-actions>` | page | – | `(default)` | – |
| `<nk-props>` | page | `flush` | `(default)` | – |
| `<nk-prop>` | page | `label`, `icon`, `text` | `(default)`, `icon` | `nk-action` |
| `<nk-panels>` | page | `flush` | `(default)` | – |
| `<nk-panel>` | page | `title`, `icon`, `cover`, `href` | `(default)`, `end` | – |
| `<nk-block-host>` | page | `handle`, `drop-target` | `(default)` | – |
| `<nk-banner>` | page | `variant` | `(default)`, `action` | – |
| `<nk-empty>` | page | `icon`, `title`, `desc` | `(default)`, `icon`, `title`, `desc` | – |
| `<nk-skeleton>` | page | `lines`, `height`, `width`, `widths` | – | – |
| `<nk-synced>` | page | `badge` | `(default)` | – |
| `<nk-tabs>` | page | `value`, `scroll` | `(default)`, `panel` | `nk-change`, `nk-select` |
| `<nk-tab>` | page | `value`, `active`, `disabled` | `(default)` | `nk-select` |
| `<nk-segmented>` | page | `value`, `scroll`, `wrap`, `name` | `(default)` | `nk-change` |
| `<nk-steps>` | page | `steps`, `current`, `label`, `selectable` | – | `nk-select` |
| `<nk-stats>` | page | `label`, `value`, `delta`, `trend` | `(default)` | – |
| `<nk-stat>` | page | `label`, `value`, `delta`, `trend` | `label`, `value`, `delta` | – |
| `<nk-avatar-group>` | page | `more` | `(default)` | – |
| `<nk-avatar>` | page | `size`, `color`, `square`, `name` | `(default)` | – |
| `<nk-mention>` | page | `type` | `avatar`, `(default)` | – |
| `<nk-template-btn>` | page | `icon`, `value`, `disabled` | `(default)` | `nk-select` |
| `<nk-model-card>` | page | `title`, `desc`, `name`, `disabled` | `title`, `desc` | `nk-change`, `nk-select` |
| `<nk-profile-row>` | page | `avatar` | `avatar`, `(default)` | – |
| `<nk-danger-zone>` | page | `title` | `(default)` | – |
| `<nk-member-list>` | page | `name`, `mail`, `avatar`, `color` | `(default)`, `role`, `avatar` | – |
| `<nk-member-row>` | page | `name`, `mail`, `avatar`, `color` | `role`, `avatar`, `(default)` | – |
| `<nk-modal>` | overlays | `open`, `pane` | `(default)`, `user`, `nav` | `nk-toggle`, `nk-select` |
| `<nk-sheet>` | overlays | `open`, `title` | `(default)` | `nk-toggle` |
| `<nk-peek>` | overlays | `open`, `label`, `close-label`, `resizable` | `(default)`, `actions` | `nk-toggle`, `nk-resize` |
| `<nk-dialog>` | overlays | `open`, `title`, `alert`, `wide` | `(default)`, `actions` | `nk-close`, `nk-toggle` |
| `<nk-settings-pane>` | overlays | `name`, `label`, `icon`, `group` | `(default)` | – |
| `<nk-settings-user>` | overlays | `name`, `mail`, `avatar` | `avatar` | – |
| `<nk-cmdk>` | overlays | `open`, `hotkey`, `placeholder` | `footer` | `nk-command`, `nk-toggle` |
| `<nk-menu>` | overlays | `floating`, `sheet`, `open`, `align` | `(default)` | `nk-select`, `nk-toggle` |
| `<nk-menu-item>` | overlays | `icon`, `shortcut`, `value`, `danger` | `(default)`, `icon` | `nk-select`, `nk-change` |
| `<nk-pop>` | overlays | `open`, `placement`, `bare` | `trigger`, `(default)` | `nk-toggle` |
| `<nk-emoji-picker>` | overlays | `placeholder`, `value` | – | `nk-select` |
| `<nk-toast>` | overlays | `open`, `duration`, `icon` | `(default)` | `nk-toggle` |
| `<nk-tooltip>` | overlays | `for`, `shortcut`, `delay`, `placement` | `(default)` | – |
| `<nk-database>` | data | `view`, `add-view` | `(default)`, `tools`, `filters` | `nk-view-change`, `nk-action`, `nk-select / nk-change / nk-action` |
| `<nk-table-view>` | data | `name`, `label`, `badge`, `count` | – | `nk-select`, `nk-change`, `nk-action` |
| `<nk-board-view>` | data | `name`, `label`, `group-by`, `title-key` | – | `nk-select`, `nk-change`, `nk-action` |
| `<nk-list-view>` | data | `name`, `label`, `title-key`, `meta-keys` | – | `nk-select`, `nk-action` |
| `<nk-calendar-view>` | data | `name`, `label`, `date-key`, `title-key` | – | `nk-select`, `nk-month` |
| `<nk-gallery-view>` | data | `name`, `label`, `cover-key`, `no-cover` | – | `nk-select`, `nk-action` |
| `<nk-filter-bar>` | data | `add`, `add-label`, `no-filter`, `no-sort` | `(default)` | `nk-change`, `nk-action` |
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
| Texts | `src/util/strings.js` – the English and German dictionary and `setStrings()`; `NkElement#str(key)` reads it in the element's language, `onStringsChanged()` runs after `setStrings()` and when `<html lang>` changes |
| Components | `src/components/{forms,content,shell,page,overlays,data}/nk-*.js`, one tag per file, `customElements.define` at the bottom |
| Build | Rollup: IIFE, minified IIFE, ESM, and per-component ESM entries on a stable `dist/components/base.js` that import NotionKit's sheet (`@jungherz-de/notionkit/notionkit-styles.js`) instead of inlining it; the full bundles inline it and export `componentsSheet` |
| Peer | `@jungherz-de/notionkit >= 1.18.0` – from 1.5.0 on the elements and the foundation share one version number; the bundle embeds that release's stylesheet, so keep them in step |

Lifecycle: construct (attach shadow, adopt sheets) → first connect (wrapper + `render()`) → every connect (`setupEvents()`, theme registration, light-DOM observer) → `attributeChangedCallback` → `onAttributeChanged` → disconnect (`teardownEvents()`, unregister).


---
*NotionKit Elements v1.18.0 · wrapping NotionKit CSS v1.18.0 · MIT · Jungherz GmbH*
