import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, base, sel] of [['live','https://www.mobileaccessgateway.ch','section[data-section-theme="bright"]'],
                                 ['local','http://localhost:8080','.hero']]) {
  const p = await b.newPage(); await p.setViewportSize({width:390,height:844});
  await p.goto(base + '/', { waitUntil:'networkidle' });
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}.consent{display:none!important}'});
  await p.waitForTimeout(1000);
  console.log(`\n== ${name} ==`);
  console.log(await p.evaluate(s => {
    const sec = document.querySelector(s); const sb = sec.getBoundingClientRect();
    const out = [`section h=${Math.round(sb.height)}`];
    sec.querySelectorAll('p, a.button, .sqs-block-button-element, img').forEach(el => {
      const r = el.getBoundingClientRect(); if (r.width < 20) return;
      const t = (el.textContent||'').replace(/\s+/g,' ').trim().slice(0,30);
      const c = getComputedStyle(el);
      out.push(`  y=${String(Math.round(r.top - sb.top)).padStart(4)} h=${String(Math.round(r.height)).padStart(4)}`
        + ` fs=${c.fontSize} lh=${c.lineHeight} mb=${c.marginBottom}  ${el.tagName}  "${t}"`);
    });
    return out.join('\n');
  }, sel));
  await p.close();
}
await b.close();
