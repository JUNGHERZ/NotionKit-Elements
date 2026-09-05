// Minimal HTML highlighter emitting the .tag / .attr hooks .nk-code styles.
// Mirrors tools/highlight.mjs in the NotionKit foundation – no third-party
// highlighter, no other languages. Anything that is not HTML is escaped only.
export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightHtml(source) {
  return escapeHtml(source).replace(/&lt;(\/?)([a-zA-Z][\w-]*)([^&]*?)(\/?)&gt;/g, (m, close, tag, attrs, self) => {
    const attrHtml = attrs.replace(/([\w-]+)(=)("[^"]*"|'[^']*')?/g,
      (a, name, eq, val) => `<span class="attr">${name}</span>${eq}${val ?? ''}`);
    return `&lt;${close}<span class="tag">${tag}</span>${attrHtml}${self}&gt;`;
  });
}
