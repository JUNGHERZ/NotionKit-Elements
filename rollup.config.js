import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

// Every element lives at src/components/{group}/nk-{name}.js. The per-component
// entries below flatten that into dist/components/nk-{name}.js so that
// `@jungherz-de/notionkit-elements/components/nk-btn.js` resolves — the import
// form documented in README.md and SKILL.md. Shared code (base.js, the NotionKit
// stylesheet) is split into dist/components/shared/ instead of being copied into
// each file.
//
// The export map in package.json must read "./components/*.js" (with the
// extension): a bare "./components/*" makes `*` swallow the extension and the
// specifier expands to nk-btn.js.js — the GlassKit Elements 1.7.0 bug.
const COMPONENT_ROOT = 'src/components';
const componentEntries = Object.fromEntries(
  readdirSync(COMPONENT_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .flatMap(d => readdirSync(join(COMPONENT_ROOT, d.name))
      .filter(f => f.startsWith('nk-') && f.endsWith('.js'))
      .map(f => [basename(f, '.js'), join(COMPONENT_ROOT, d.name, f)]))
);

const bundles = [
  // Full bundle (IIFE) — for CDN <script> usage
  {
    input: 'src/index.js',
    output: { file: 'dist/notionkit-elements.js', format: 'iife', name: 'NotionKitElements' },
    plugins: [nodeResolve()]
  },
  // Full bundle (IIFE, minified)
  {
    input: 'src/index.js',
    output: { file: 'dist/notionkit-elements.min.js', format: 'iife', name: 'NotionKitElements' },
    plugins: [nodeResolve(), terser()]
  },
  // ES module bundle
  {
    input: 'src/index.js',
    output: { file: 'dist/notionkit-elements.esm.js', format: 'es' },
    plugins: [nodeResolve()]
  }
];

// Per-component ES modules — one entry per element, shared chunks extracted.
// Skipped while there are no components yet (rollup rejects an empty input map).
if (Object.keys(componentEntries).length) {
  bundles.push({
    input: componentEntries,
    output: {
      dir: 'dist/components',
      format: 'es',
      entryFileNames: '[name].js',
      chunkFileNames: 'shared/[name]-[hash].js'
    },
    plugins: [nodeResolve()]
  });
}

export default bundles;
