import { chromium } from 'playwright';
const b=await chromium.launch();
for (const path of ['/contact','/privacy-policy']) {
  for (const vp of [{width:1440,height:900},{width:390,height:844}]) {
    const p=await b.newPage(); await p.setViewportSize(vp);
    await p.goto('https://www.mobileaccessgateway.ch'+path,{waitUntil:'networkidle'});
    await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
    await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollTo(0,y+=500);if(y>document.body.scrollHeight){clearInterval(t);r();}},25);});window.scrollTo(0,0);});
    await p.waitForTimeout(800);
    console.log(`\n== ${path} @ ${vp.width} ==`);
    console.log(await p.evaluate(()=>{
      const out=[];
      document.querySelectorAll('section.page-section').forEach((s,i)=>{
        const r=s.getBoundingClientRect(); const bg=s.querySelector('.section-background');
        out.push(`  [${i}] theme=${s.getAttribute('data-section-theme')} y=${Math.round(r.top+scrollY)} h=${Math.round(r.height)} bg=${bg?getComputedStyle(bg).backgroundColor:'?'}`);
      });
      const h=document.querySelector('.sqs-html-content h1,.sqs-html-content h2,.sqs-html-content p');
      if(h){const r=h.getBoundingClientRect(),c=getComputedStyle(h);
        out.push(`  first text ${h.tagName} x=${Math.round(r.x)} y=${Math.round(r.y+scrollY)} w=${Math.round(r.width)} fs=${c.fontSize} lh=${c.lineHeight} color=${c.color}`);}
      return out.join('\n');
    }));
    await p.close();
  }
}
await b.close();
