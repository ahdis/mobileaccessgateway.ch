import { chromium } from 'playwright';
const b=await chromium.launch();
for (const [name,base,sel] of [['live','https://www.mobileaccessgateway.ch','section[data-section-theme="bright"] h1'],
                               ['local','http://localhost:8080','.hero__lede']]) {
  const p=await b.newPage(); await p.setViewportSize({width:1440,height:900});
  await p.goto(base+'/',{waitUntil:'networkidle'});
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
  await p.waitForTimeout(900);
  console.log(`\n== ${name} ==`);
  console.log(await p.evaluate(s=>{
    const el=[...document.querySelectorAll(s)].find(e=>e.textContent.includes('open source initiative'));
    if(!el) return 'not found';
    const c=getComputedStyle(el), r=el.getBoundingClientRect();
    const txt=el.textContent;
    return `  width=${r.width.toFixed(1)} height=${r.height.toFixed(1)}\n`
      + `  white-space=${c.whiteSpace} word-spacing=${c.wordSpacing} letter-spacing=${c.letterSpacing}\n`
      + `  padding=${c.padding} font=${c.fontSize}/${c.lineHeight} ${c.fontFamily.split(',')[0]}\n`
      + `  textLength=${txt.length} newlines=${(txt.match(/\n/g)||[]).length}\n`
      + `  text="${txt.replace(/\s+/g,' ').slice(0,80)}..."`;
  }, sel));
  await p.close();
}
await b.close();
