import { chromium } from 'playwright';
const b=await chromium.launch();
for (const vp of [{width:1440,height:900},{width:390,height:844}]) {
  const p=await b.newPage(); await p.setViewportSize(vp);
  await p.goto('https://www.mobileaccessgateway.ch/contributors',{waitUntil:'networkidle'});
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollTo(0,y+=400);if(y>document.body.scrollHeight){clearInterval(t);r();}},25);});window.scrollTo(0,0);});
  await p.waitForTimeout(900);
  console.log(`\n== live /contributors @ ${vp.width} ==`);
  console.log(await p.evaluate(()=>{
    const out=[];
    document.querySelectorAll('section.page-section').forEach((s,i)=>{
      const r=s.getBoundingClientRect(); const bg=s.querySelector('.section-background');
      out.push(`  [${i}] theme=${s.getAttribute('data-section-theme')} y=${Math.round(r.top+scrollY)} h=${Math.round(r.height)} bg=${bg?getComputedStyle(bg).backgroundColor:'?'}`);
    });
    const li=document.querySelector('.user-items-list-item-container>li');
    if(li){const r=li.getBoundingClientRect();
      const img=li.querySelector('img'), h2=li.querySelector('h2'), pp=li.querySelector('p'), a=li.querySelector('a.sqs-block-button-element, a');
      const rel=e=>{const q=e.getBoundingClientRect();return `${Math.round(q.x-r.x)},${Math.round(q.y-r.y)} ${Math.round(q.width)}x${Math.round(q.height)}`;};
      out.push(`  card ${Math.round(r.width)}x${Math.round(r.height)}  img=${img?rel(img):'-'}  h2=${h2?rel(h2):'-'}  p=${pp?rel(pp):'-'}`);
      const btn=[...li.querySelectorAll('a')].pop(); if(btn) out.push(`  card btn=${rel(btn)} text="${btn.textContent.trim()}"`);
    }
    const ul=document.querySelector('.user-items-list-item-container');
    if(ul){const c=getComputedStyle(ul); out.push(`  list gap=${c.gap} cols=${c.gridTemplateColumns}`);}
    return out.join('\n');
  }));
  await p.close();
}
await b.close();
