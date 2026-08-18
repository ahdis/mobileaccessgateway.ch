import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, base, sel] of [['live','https://www.mobileaccessgateway.ch','section[data-section-theme="white-bold"]'],
                                 ['local','http://localhost:8080','.nutshell']]) {
  const p = await b.newPage(); await p.setViewportSize(process.env.VP==='desktop'?{width:1440,height:900}:{width:390,height:844});
  await p.goto(base + '/', { waitUntil:'networkidle' });
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}.consent{display:none!important}'});
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollTo(0,y+=400);if(y>document.body.scrollHeight){clearInterval(t);r();}},30);});window.scrollTo(0,0);});
  await p.waitForTimeout(900);
  console.log(`\n== ${name} nutshell (${process.env.VP||'mobile'}) ==`);
  console.log(await p.evaluate(s => {
    const sec = document.querySelector(s); const sb = sec.getBoundingClientRect();
    const out = [`section h=${Math.round(sb.height)}`]; let prev = null;
    const els = sel => [...sec.querySelectorAll(sel)];
    els('h2, h3, img, p, hr, a.button, .sqs-block-button-element, .sqs-block-horizontalrule')
      .filter(e => e.getBoundingClientRect().width > 20)
      .forEach(el => {
        const r = el.getBoundingClientRect();
        const top = Math.round(r.top - sb.top + window.scrollY - (sb.top < 0 ? 0 : 0));
        const t = (el.textContent||'').replace(/\s+/g,' ').trim().slice(0,26);
        const gap = prev === null ? '' : `gap=${String(Math.round(r.top - prev)).padStart(4)}`;
        prev = r.bottom;
        out.push(`  h=${String(Math.round(r.height)).padStart(4)} ${gap.padEnd(9)} ${el.tagName.padEnd(4)} "${t}"`);
      });
    return out.join('\n');
  }, sel));
  await p.close();
}
await b.close();
