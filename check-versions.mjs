// ============================================================
// NotionKit Elements – Version Consistency Check
//
// Two versions are in play: this package's own version, and the NotionKit
// CSS release the pages pin and the docs name (from the peer dependency).
// Every reference is anchored on surrounding markup so historical prose
// ("since 1.1.0") is never touched.
//
// Usage:  npm run check:versions
// ============================================================

import { readFileSync, existsSync, readdirSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const VERSION = pkg.version;

// The docs point at the NotionKit release the devDependency was built against
// (the peer range is the *minimum*; the CDN pin is the version dist/ embeds).
const peerRange = pkg.devDependencies?.['@jungherz-de/notionkit'] ?? '';
const peerMatch = peerRange.match(/(\d+\.\d+\.\d+)/);
if (!peerMatch) {
  console.error('::error::cannot read the @jungherz-de/notionkit devDependency from package.json');
  process.exit(1);
}
const PEER = peerMatch[1];
const PEER_PIN = PEER.split('.').slice(0, 2).join('.');   // CDN URLs pin major.minor

const html = f => existsSync(f) ? readdirSync(f).filter(n => n.endsWith('.html')).map(n => `${f}/${n}`) : [];
const FILES = ['README.md', 'SKILL.md', 'llms.txt', ...html('.'), ...html('de')].filter(existsSync);

const LABELS = [
  ['shields badge',        /badge\/(?:version|changelog)-v?(\d+\.\d+\.\d+)/g],
  ['site version label',   /class="site-version">v(\d+\.\d+\.\d+)/g],
  ['SKILL.md description', /library \(v(\d+\.\d+\.\d+)\)/g],
  ['Elements CDN pin',     /@jungherz-de\/notionkit-elements@(\d+\.\d+\.\d+)\//g],
  ['llms.txt version',     /NotionKit Elements v(\d+\.\d+\.\d+)/g],
];

// These name NotionKit CSS, not this package.
const PEER_LABELS = [
  ['NotionKit CDN pin',      /@jungherz-de\/notionkit@(\d+\.\d+\.\d+)\//g, PEER],
  ['NotionKit peer version', /wrapping NotionKit CSS v(\d+\.\d+\.\d+)/g, PEER],
];

const problems = [];
let found = 0;

for (const file of FILES) {
  const lines = readFileSync(file, 'utf-8').split('\n');
  const check = (name, pattern, expected) => {
    for (const [i, line] of lines.entries()) {
      for (const match of line.matchAll(pattern)) {
        found++;
        if (match[1] !== expected) {
          problems.push(`${file}:${i + 1} – ${name} says ${match[1]}, expected ${expected}`);
        }
      }
    }
  };
  for (const [name, pattern] of LABELS) check(name, pattern, VERSION);
  for (const [name, pattern, expected] of PEER_LABELS) check(name, pattern, expected);
}

// A renamed class would make every pattern match nothing and the check would
// pass while saying nothing.
if (found === 0) {
  problems.push('no version label matched at all – the patterns in this script are out of date');
}

if (existsSync('CHANGELOG.md')) {
  const changelog = readFileSync('CHANGELOG.md', 'utf-8');
  const newest = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m);
  if (!newest) {
    problems.push('CHANGELOG.md – no "## [x.y.z]" entry found');
  } else if (newest[1] !== VERSION) {
    problems.push(`CHANGELOG.md – newest entry is ${newest[1]}, expected ${VERSION}`);
  } else if (!new RegExp(`^\\[${VERSION.replace(/\./g, '\\.')}\\]:`, 'm').test(changelog)) {
    problems.push(`CHANGELOG.md – entry ${VERSION} has no "[${VERSION}]: …" link definition`);
  }
}

if (problems.length) {
  for (const problem of problems) console.error(`::error::${problem}`);
  console.error(`\n✗ ${problems.length} version reference(s) out of step (package ${VERSION}, NotionKit ${PEER})`);
  process.exit(1);
}

console.log(`✅ ${found} version references agree (package v${VERSION}, NotionKit v${PEER})`);
