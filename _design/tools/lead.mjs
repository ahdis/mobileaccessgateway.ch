import { chromium } from 'playwright';
const b=await chromium.launch();
for (const vp of [{width:1440,height:900},{width:390,height:844}]) {
  const p=await b.newPage(); await p.setViewportSize(vp);
  await p.goto('https://www.mobileaccessgateway.ch/privacy-policy',{waitUntil:'networkidle'});
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
  await p.waitForTimeout(800);
  console.log(`\n== live @ ${vp.width} ==`);
  console.log(await p.evaluate(()=>{
    const out=[];
    for (const sel of ['p.sqsrte-large','h3','p:not(.sqsrte-large)','ul li']) {
      const el=document.querySelector('.sqs-html-content '+sel);
      if(!el) { out.push(`  ${sel}: none`); continue; }
      const c=getComputedStyle(el);
      out.push(`  ${sel.padEnd(20)} fs=${c.fontSize} lh=${c.lineHeight} weight=${c.fontWeight} mt=${c.marginTop} mb=${c.marginBottom} color=${c.color}`);
    }
    return out.join('\n');
  }));
  await p.close();
}
await b.close();
