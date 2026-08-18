import { chromium } from 'playwright';
const b=await chromium.launch();
for (const [name,base] of Object.entries({live:'https://www.mobileaccessgateway.ch', local:'http://localhost:8080'})) {
  const p=await b.newPage(); await p.setViewportSize({width:1440,height:900});
  const fonts=[];
  p.on('response', r => { if(/\.woff2?|\.ttf/.test(r.url())) fonts.push(`${r.status()} ${r.url().split('/').pop().slice(0,44)}`); });
  await p.goto(base+'/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  const info = await p.evaluate(async () => {
    await document.fonts.ready;
    const el = document.querySelector('.hero__lede, section[data-section-theme="bright"] h1');
    const cs = getComputedStyle(el);
    const loaded = [...document.fonts].filter(f=>f.status==='loaded').map(f=>`${f.family}/${f.weight}/${f.style}`);
    // measure a fixed string to compare metrics
    const s = document.createElement('span');
    s.style.cssText='position:absolute;white-space:nowrap;font:400 100px Poppins,serif';
    s.textContent='Mobile Access Gateway';
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width; s.remove();
    return { family: cs.fontFamily, size: cs.fontSize, loaded: loaded.slice(0,8), probeWidth: Math.round(w) };
  });
  console.log(`\n== ${name} ==`);
  console.log('  font-family :', info.family);
  console.log('  loaded faces:', info.loaded.join(', ') || '(none)');
  console.log('  100px "Mobile Access Gateway" width =', info.probeWidth);
  console.log('  font requests:', fonts.length ? fonts.join('\n                ') : '(none)');
  await p.close();
}
await b.close();
