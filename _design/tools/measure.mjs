/* Reports x/width of matching landmarks on live vs local so layout drift is
   measured, not eyeballed. Matches elements by their text/role, not selector. */
import { chromium } from 'playwright';
const LOCAL = process.env.LOCAL || 'http://localhost:8080';
const vp = process.env.VP === 'mobile' ? {width:390,height:844} : {width:1440,height:900};
const path = process.argv[2] || '/';

const probe = () => {
  const out = [];
  const push = (label, el) => { if(!el) return; const r = el.getBoundingClientRect();
    if (r.width < 1) return;
    out.push({label, x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height)}); };
  const byText = (tag, txt) => [...document.querySelectorAll(tag)]
    .find(e => (e.textContent||'').replace(/\s+/g,' ').trim().startsWith(txt));
  push('header',      document.querySelector('header'));
  push('logo',        document.querySelector('header img'));
  push('hero-img',    document.querySelector('section img, .hero__media img'));
  push('h-nutshell',  byText('h2', 'In A Nutshell'));
  push('h-opensrc',   byText('h3', 'Why open-source'));
  push('h-epr',       byText('h3', 'What is the Swiss EPR'));
  push('h-mhealth',   byText('h3', 'How does mobile health'));
  push('btn-contrib', byText('a', 'See contributors'));
  push('btn-findout', byText('a', 'Find out more'));
  push('h-fhir',      byText('h2', 'Your FHIR-based'));
  push('footer',      document.querySelector('footer, #footer-sections'));
  const imgs = [...document.querySelectorAll('img')].filter(i => i.getBoundingClientRect().width > 100);
  imgs.forEach((i, n) => push('img' + n, i));
  return out;
};

const b = await chromium.launch();
const res = {};
for (const [name, base] of Object.entries({live:'https://www.mobileaccessgateway.ch', local:LOCAL})) {
  const p = await b.newPage(); await p.setViewportSize(vp);
  await p.goto(base + path, { waitUntil:'networkidle' });
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important;visibility:visible!important}.consent{display:none!important}'});
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollTo(0,y+=500);if(y>document.body.scrollHeight){clearInterval(t);r();}},30);});window.scrollTo(0,0);});
  await p.waitForTimeout(900);
  res[name] = await p.evaluate(probe);
  await p.close();
}
await b.close();
const map = o => Object.fromEntries(o.map(r => [r.label, r]));
const L = map(res.live), R = map(res.local);
console.log(`${path} @ ${vp.width}px`);
const AXIS = process.env.AXIS || 'x';
if (AXIS === 'y') {
  console.log('  label          live y,h        local y,h       dy    dh');
  for (const k of Object.keys(L)) {
    if (!R[k]) { console.log(`  ${k.padEnd(14)} ${String(L[k].y+','+L[k].h).padEnd(15)} (missing locally)`); continue; }
    const dy = R[k].y - L[k].y, dh = R[k].h - L[k].h;
    const flag = (Math.abs(dy) > 12 || Math.abs(dh) > 14) ? '  <<' : '';
    console.log(`  ${k.padEnd(14)} ${String(L[k].y+','+L[k].h).padEnd(15)} ${String(R[k].y+','+R[k].h).padEnd(15)} ${String(dy).padStart(5)} ${String(dh).padStart(5)}${flag}`);
  }
} else {
  console.log('  label          live x,w        local x,w       dx    dw');
  for (const k of Object.keys(L)) {
    if (!R[k]) { console.log(`  ${k.padEnd(14)} ${String(L[k].x+','+L[k].w).padEnd(15)} (missing locally)`); continue; }
    const dx = R[k].x - L[k].x, dw = R[k].w - L[k].w;
    const flag = (Math.abs(dx) > 8 || Math.abs(dw) > 12) ? '  <<' : '';
    console.log(`  ${k.padEnd(14)} ${String(L[k].x+','+L[k].w).padEnd(15)} ${String(R[k].x+','+R[k].w).padEnd(15)} ${String(dx).padStart(5)} ${String(dw).padStart(5)}${flag}`);
  }
}
