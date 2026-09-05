import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, writeFileSync } from 'node:fs';

export const ARTIFACTS = 'test/.artifacts';

/** Opens the harness and waits until every nk-* tag in `tags` is defined. */
export async function openHarness(page, { bare = false, theme = 'light' } = {}) {
  await page.goto(bare ? '/test/fixtures/harness-bare.html' : '/test/fixtures/harness.html');
  await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
  await page.waitForFunction(() => customElements.get('nk-btn') && customElements.get('nk-select'));
}

export async function setStage(page, html) {
  await page.evaluate(h => { document.getElementById('stage').innerHTML = h; }, html);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** Pixel-compares two PNG buffers; returns { diffRatio, width, height, diff }. */
export function comparePng(a, b, { threshold = 0.25 } = {}) {
  const pa = PNG.sync.read(a), pb = PNG.sync.read(b);
  const width = Math.max(pa.width, pb.width), height = Math.max(pa.height, pb.height);
  const pad = (p) => {
    if (p.width === width && p.height === height) return p;
    const out = new PNG({ width, height });
    PNG.bitblt(p, out, 0, 0, p.width, p.height, 0, 0);
    return out;
  };
  const A = pad(pa), B = pad(pb);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(A.data, B.data, diff.data, width, height, { threshold });
  return { diffRatio: mismatched / (width * height), mismatched, width, height, diff, sizeMatch: pa.width === pb.width && pa.height === pb.height };
}

export function saveArtifact(name, buffer) {
  mkdirSync(ARTIFACTS, { recursive: true });
  writeFileSync(`${ARTIFACTS}/${name}`, buffer);
}
