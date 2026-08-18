import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [vp,size] of Object.entries({desktop:{width:1440,height:900}, mobile:{width:390,height:844}})) {
  const p = await b.newPage(); await p.setViewportSize(size);
  await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
  await p.evaluate(async()=>{window.scrollTo(0,document.body.scrollHeight);});
  await p.waitForTimeout(1200);
  console.log(`\n===== footer @ ${vp} =====`);
  console.log(await p.evaluate(() => {
    const f=document.querySelector('#footer-sections'); const fr=f.getBoundingClientRect();
    const out=[`footer rect y=${Math.round(fr.top)} h=${Math.round(fr.height)}`];
    f.querySelectorAll('.sqs-block').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.width<2) return;
      const t=(el.innerText||'').replace(/\s+/g,' ').trim().slice(0,40);
      out.push(`  x=${String(Math.round(r.left)).padStart(4)} y=${String(Math.round(r.top-fr.top)).padStart(4)}`
        +` w=${String(Math.round(r.width)).padStart(4)} h=${String(Math.round(r.height)).padStart(4)}`
        +`  ${el.getAttribute('data-definition-name')||'?'}  "${t}"`);
    });
    const bg=f.querySelector('.section-background');
    out.push('  section bg: '+(bg?getComputedStyle(bg).backgroundColor:'?'));
    return out.join('\n');
  }));
  await p.close();
}
await b.close();
