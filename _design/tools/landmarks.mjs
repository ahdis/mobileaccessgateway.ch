/* Generic landmark dump for any page, live vs local, at one viewport. */
import { chromium } from 'playwright';
const path = process.argv[2] || '/';
const vp = process.env.VP === 'mobile' ? {width:390,height:844} : {width:1440,height:900};
const b = await chromium.launch();
for (const [name, base] of Object.entries({live:'https://www.mobileaccessgateway.ch', local:'http://localhost:8080'})) {
  const p = await b.newPage(); await p.setViewportSize(vp);
  await p.goto(base + path, { waitUntil:'networkidle' });
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important;visibility:visible!important}.consent{display:none!important}'});
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollTo(0,y+=400);if(y>document.body.scrollHeight){clearInterval(t);r();}},25);});window.scrollTo(0,0);});
  await p.waitForTimeout(900);
  console.log(`\n== ${name} ${path} @ ${vp.width} ==`);
  console.log(await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('h1,h2,h3,img,a.button,.sqs-block-button-element,li.contributor,.user-items-list-item-container>li').forEach(el => {
      const r = el.getBoundingClientRect(); if (r.width < 30) return;
      const t = (el.textContent||'').replace(/\s+/g,' ').trim().slice(0,24) || (el.tagName==='IMG' ? el.currentSrc.split('/').pop().split('?')[0].slice(0,20) : '');
      out.push(`  ${el.tagName.padEnd(4)} x=${String(Math.round(r.x)).padStart(4)} y=${String(Math.round(r.y+window.scrollY)).padStart(5)}`
        + ` w=${String(Math.round(r.width)).padStart(4)} h=${String(Math.round(r.height)).padStart(4)}  "${t}"`);
    });
    return out.join('\n');
  }));
  await p.close();
}
await b.close();
