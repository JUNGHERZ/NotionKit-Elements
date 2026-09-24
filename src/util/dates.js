// Calendar days for nk-calendar and nk-calendar-view: local days as
// 'YYYY-MM-DD', no library. Weeks are ISO weeks (Monday-based, the week with
// the year's first Thursday); the first weekday comes from the locale.
const pad = n => String(n).padStart(2, '0');

export const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** 'YYYY-MM-DD[THH:MM]', 'D.M.YYYY', a Date or { start } → a local Date at midnight, or null. */
export function parseDay(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate());
  if (v && typeof v === 'object') return v.start ? parseDay(v.start) : null;
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
}

export function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}

/** The page's language unless the element names one. */
export const resolveLocale = attr => attr || document.documentElement.lang || navigator.language || 'en';

/** 0 = Sunday … 6 = Saturday, from Intl.Locale's week info; Monday where the browser cannot say. */
export function firstWeekday(locale) {
  try {
    const l = new Intl.Locale(locale), info = l.getWeekInfo?.() ?? l.weekInfo;
    if (info?.firstDay) return info.firstDay % 7;
  } catch { /* an unknown tag */ }
  return 1;
}

/** Short weekday names from `weekStart` on; `length` cuts them (2 → "Mo"). */
export function weekdayNames(locale, weekStart, length = 0) {
  const f = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 7 June 2026 is a Sunday, so 7 + n is weekday n.
  return Array.from({ length: 7 }, (_, i) => {
    const name = f.format(new Date(2026, 5, 7 + ((weekStart + i) % 7))).replace('.', '');
    return length ? name.slice(0, length) : name;
  });
}

/** A month from its week start: `first`, `day(i)` for the i-th cell, the `rows` it needs. */
export function monthGrid(month, weekStart) {
  const [y, m] = month.split('-').map(Number), first = new Date(y, m - 1, 1), offset = (first.getDay() - weekStart + 7) % 7;
  return { m, first, day: i => new Date(y, m - 1, 1 - offset + i), rows: Math.ceil((offset + new Date(y, m, 0).getDate()) / 7) };
}

export function stepMonth(month, n) {
  const [y, m] = month.split('-').map(Number);
  return isoOf(new Date(y, m - 1 + n, 1)).slice(0, 7);
}

/** "KW" for German, "W" elsewhere – the head of the week column. */
export const weekLabel = locale => (/^de\b/i.test(locale) ? 'KW' : 'W');

export const CHEVRONS = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
};
