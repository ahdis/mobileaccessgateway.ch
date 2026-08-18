import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
await p.waitForTimeout(1000);
console.log(await p.evaluate(() => {
  const out = [];
  for (const y of [10, 60, 114, 120, 200, 400]) {
    const el = document.elementFromPoint(720, y);
    const chain = [];
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const c = getComputedStyle(e);
      chain.push(`${e.tagName.toLowerCase()}${e.id?'#'+e.id:''}.${(e.className||'').toString().split(/\s+/)[0]}`
                 + ` bg=${c.backgroundColor}`);
      if (chain.length > 3) break;
    }
    out.push(`y=${String(y).padStart(4)}  ${chain.join('  <  ')}`);
  }
  const hero = document.querySelector('section[data-section-theme="bright"]');
  const bgEl = hero.querySelector('.section-background');
  out.push('\nhero rect      : ' + JSON.stringify(hero.getBoundingClientRect().toJSON()));
  out.push('hero .section-background rect: ' + JSON.stringify(bgEl.getBoundingClientRect().toJSON()));
  out.push('body bg        : ' + getComputedStyle(document.body).backgroundColor);
  out.push('html bg        : ' + getComputedStyle(document.documentElement).backgroundColor);
  const hdr = document.querySelector('#header');
  out.push('header rect    : ' + JSON.stringify(hdr.getBoundingClientRect().toJSON()));
  return out.join('\n');
}));
await b.close();
