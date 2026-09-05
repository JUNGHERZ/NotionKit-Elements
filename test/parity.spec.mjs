// DoD 2: every element renders visually identical to its class counterpart,
// in both themes. Class markup and element are rendered side by side in the
// same document, screenshotted and pixel-compared.
import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import { CATALOG } from '../tools/catalog.mjs';
import { WORDS } from '../tools/words.mjs';
import { openHarness, setStage, comparePng, saveArtifact } from './helpers.mjs';

// 0.5 % of the pixels. The perceptual threshold in comparePng (0.25) absorbs the
// sub-pixel text anti-aliasing the compositor applies differently to text
// inside a shadow tree (channel delta ≤ 25 on glyph edges, measured); any
// structural difference – a shifted box, a missing border – still fails.
const MAX_DIFF = 0.005;
const entries = CATALOG.filter(e => e.classMarkup);

for (const theme of ['light', 'dark']) {
  test.describe(`parity · ${theme}`, () => {
    for (const entry of entries) {
      test(`<${entry.tag}> matches ${entry.classes[0]} markup`, async ({ page }) => {
        await openHarness(page, { theme });
        if (entry.overlay) {
          // Fixed-position overlays cover the viewport, so the two variants are
          // rendered one after the other and compared as viewport screenshots.
          const shoot = async (html) => {
            await setStage(page, html);
            for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) await page.evaluate(m[1]);
            await page.evaluate(() => new Promise(r => setTimeout(r, 350)));   // open transitions
            await page.evaluate(() => document.activeElement?.blur?.());
            return page.screenshot();
          };
          const pa = await shoot(entry.classMarkup(WORDS.en));
          const pb = await shoot(entry.example(WORDS.en));
          const result = comparePng(pa, pb);
          if (result.diffRatio > MAX_DIFF) {
            saveArtifact(`parity-${entry.tag}-${theme}-class.png`, pa);
            saveArtifact(`parity-${entry.tag}-${theme}-element.png`, pb);
            saveArtifact(`parity-${entry.tag}-${theme}-diff.png`, PNG.sync.write(result.diff));
          }
          expect(result.diffRatio, `${(result.diffRatio * 100).toFixed(2)} % of pixels differ (${result.mismatched} px)`).toBeLessThanOrEqual(MAX_DIFF);
          return;
        }
        // Shell examples need a viewport wider than the 860px breakpoint, so
        // they get 1000px boxes stacked vertically (the harness viewport is 1100px).
        const box = entry.frame ? ` style="width:1000px;height:${entry.frame}px;overflow:hidden"` : '';
        await setStage(page, `<div class="pair"${entry.frame ? ' style="flex-direction:column"' : ''}>
          <div class="box" id="a"${box}>${entry.classMarkup(WORDS.en)}</div>
          <div class="box" id="b"${box}>${entry.example(WORDS.en)}</div>
        </div>`);
        // Example scripts (database data etc.) run in the page; document.currentScript
        // does not exist inside page.evaluate, so the reference is rewritten.
        for (const m of entry.example(WORDS.en).matchAll(/<script>([\s\S]*?)<\/script>/g)) {
          await page.evaluate(m[1].replace(/document\.currentScript\.previousElementSibling/g, "document.querySelector('#b').firstElementChild"));
        }
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const a = page.locator('#a'), b = page.locator('#b');
        const [ba, bb] = await Promise.all([a.boundingBox(), b.boundingBox()]);
        expect(Math.abs(ba.height - bb.height), `box height class ${ba.height} vs element ${bb.height}`).toBeLessThanOrEqual(1);
        const [pa, pb] = await Promise.all([a.screenshot(), b.screenshot()]);
        const result = comparePng(pa, pb);
        if (result.diffRatio > MAX_DIFF) {
          saveArtifact(`parity-${entry.tag}-${theme}-class.png`, pa);
          saveArtifact(`parity-${entry.tag}-${theme}-element.png`, pb);
          saveArtifact(`parity-${entry.tag}-${theme}-diff.png`, PNG.sync.write(result.diff));
        }
        expect(result.diffRatio, `${(result.diffRatio * 100).toFixed(2)} % of pixels differ (${result.mismatched} px)`).toBeLessThanOrEqual(MAX_DIFF);
      });
    }
  });
}
