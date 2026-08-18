/* Checks every link and asset reference on the local build. */
import { chromium } from 'playwright';
const BASE = 'http://localhost:8080';
const PAGES = ['/', '/contributors', '/contact', '/privacy-policy', '/404.html'];
const b = await chromium.launch();
const internal = new Set(), external = new Set(), failed = [];
for (const path of PAGES) {
  const p = await b.newPage();
  p.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}  (on ${path})`); });
  await p.goto(BASE + path, { waitUntil: 'networkidle' });
  const hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
  for (const h of hrefs) {
    if (!h || h.startsWith('#')) continue;
    (h.startsWith('http') || h.startsWith('mailto:') ? external : internal).add(h);
  }
  await p.close();
}
console.log('  internal links:', [...internal].sort().join('  '));
console.log('\n  external/mailto:', external.size, 'distinct');
// resolve internal links
for (const h of internal) {
  if (h.startsWith('mailto:')) continue;
  const r = await fetch(BASE + h, { redirect: 'follow' });
  if (!r.ok) failed.push(`${r.status} ${h}`);
}
console.log('\n  failed requests:', failed.length ? '\n    ' + failed.join('\n    ') : 'none');
await b.close();
