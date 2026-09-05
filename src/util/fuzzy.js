// Subsequence scoring for the command palette: every query character must
// appear in order; consecutive hits, word starts and an early first hit score
// higher. Returns 0 when the query does not match.
export function fuzzyScore(query, text) {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const t = text.toLowerCase();
  let ti = 0, score = 0, streak = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const idx = t.indexOf(q[qi], ti);
    if (idx < 0) return 0;
    const wordStart = idx === 0 || /[\s\-_/.]/.test(t[idx - 1]);
    streak = idx === ti ? streak + 1 : 0;
    score += 1 + streak * 2 + (wordStart ? 3 : 0) - Math.min(3, (idx - ti) * 0.25);
    ti = idx + 1;
  }
  if (t.startsWith(q)) score += 10;
  return Math.max(0.01, score / (1 + t.length / 40));
}
