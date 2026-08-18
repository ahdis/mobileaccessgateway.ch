import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [vp,size] of Object.entries({desktop:{width:1440,height:900}, mobile:{width:390,height:844}})) {
  const p = await b.newPage(); await p.setViewportSize(size);
  await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
  await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
  await p.waitForTimeout(1200);
  console.log(`\n== live footer text @ ${vp} ==`);
  console.log(await p.evaluate(() => {
    const f=document.querySelector('#footer-sections'); const fb=f.getBoundingClientRect();
    const out=[];
    f.querySelectorAll('p, a').forEach(el=>{
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(!t || t.length>44) return;
      const r=el.getBoundingClientRect(); if(r.width<1) return;
      out.push(`  x=${String(Math.round(r.x)).padStart(4)} y=${String(Math.round(r.y-fb.top)).padStart(4)} w=${String(Math.round(r.width)).padStart(4)}  "${t.slice(0,34)}"`);
    });
    return out.slice(0,14).join('\n');
  }));
  await p.close();
}
await b.close();
