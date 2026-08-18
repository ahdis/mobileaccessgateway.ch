import { chromium } from 'playwright';
const b=await chromium.launch();
for (const vp of [{width:1440,height:900},{width:390,height:844}]) {
  const p=await b.newPage(); await p.setViewportSize(vp);
  await p.goto('http://localhost:8080/privacy-policy',{waitUntil:'networkidle'});
  await p.waitForTimeout(600);
  console.log(`== local @ ${vp.width} ==`);
  console.log(await p.evaluate(()=>['p.lead','h3','p:not(.lead)'].map(sel=>{
    const el=document.querySelector('.prose '+sel); if(!el) return `  ${sel}: none`;
    const c=getComputedStyle(el);
    return `  ${sel.padEnd(20)} fs=${c.fontSize} lh=${c.lineHeight} weight=${c.fontWeight} mt=${c.marginTop} mb=${c.marginBottom}`;
  }).join('\n')));
  await p.close();
}
await b.close();
