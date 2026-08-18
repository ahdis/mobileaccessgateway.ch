import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
await p.waitForTimeout(1000);
console.log(await p.evaluate(() => {
  const hits = [];
  document.querySelectorAll('*').forEach(e => {
    const c = getComputedStyle(e), r = e.getBoundingClientRect();
    if (r.top < 200 && r.height > 20 && r.width > 400) {
      const bg = c.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)') {
        hits.push(`${e.tagName.toLowerCase()}${e.id?'#'+e.id:''}.${(e.className||'').toString().split(/\s+/).slice(0,2).join('.')}`
          + `  bg=${bg}  rect=${Math.round(r.top)},${Math.round(r.height)}  pos=${c.position} z=${c.zIndex}`);
      }
      for (const pe of ['::before','::after']) {
        const pc = getComputedStyle(e, pe);
        if (pc.content !== 'none' && pc.backgroundColor && pc.backgroundColor !== 'rgba(0, 0, 0, 0)')
          hits.push(`${e.tagName.toLowerCase()}${e.id?'#'+e.id:''}.${(e.className||'').toString().split(/\s+/)[0]}${pe}  bg=${pc.backgroundColor}`);
      }
    }
  });
  return hits.join('\n') || '(nothing found)';
}));
await b.close();
