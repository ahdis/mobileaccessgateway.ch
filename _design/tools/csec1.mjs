import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto('https://www.mobileaccessgateway.ch/contact',{waitUntil:'networkidle'});
await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{
  const secs=[...document.querySelectorAll('section.page-section')];
  return secs.map((s,i)=>{
    const r=s.getBoundingClientRect();
    const blocks=[...s.querySelectorAll('.sqs-block')].filter(e=>e.getBoundingClientRect().width>2).map(e=>{
      const q=e.getBoundingClientRect();
      return `      x=${Math.round(q.x)} y=${Math.round(q.y+scrollY)} ${Math.round(q.width)}x${Math.round(q.height)} ${e.getAttribute('data-definition-name')||'?'} "${(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)}"`;
    });
    return `  [${i}] h=${Math.round(r.height)}\n`+blocks.join('\n');
  }).join('\n');
}));
await b.close();
