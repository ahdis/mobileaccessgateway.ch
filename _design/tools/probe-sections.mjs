import { chromium } from 'playwright';
const b = await chromium.launch();
const vpName = process.env.VP === 'mobile' ? 'mobile' : 'desktop';
const size = vpName === 'mobile' ? {width:390,height:844} : {width:1440,height:900};
for (const [name, base, sel] of [['live','https://www.mobileaccessgateway.ch','section.page-section'],
                                 ['local','http://localhost:8080','main > section, footer']]) {
  const p = await b.newPage(); await p.setViewportSize(size);
  await p.goto(base + '/', { waitUntil:'networkidle' });
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}.consent{display:none!important}'});
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollTo(0,y+=400);if(y>document.body.scrollHeight){clearInterval(t);r();}},30);});window.scrollTo(0,0);});
  await p.waitForTimeout(900);
  console.log(`\n== ${name} @ ${vpName} ==`);
  console.log(await p.evaluate(s => [...document.querySelectorAll(s)].map((e,i)=>{
    const r=e.getBoundingClientRect(); const c=getComputedStyle(e);
    return `  [${i}] y=${String(Math.round(r.top+window.scrollY)).padStart(5)} h=${String(Math.round(r.height)).padStart(5)}`
      + ` pad=${c.paddingTop}/${c.paddingBottom}  ${e.getAttribute('data-section-theme')||e.className.split(/\s+/).slice(0,2).join('.')}`;
  }).join('\n'), sel));
  await p.close();
}
await b.close();
