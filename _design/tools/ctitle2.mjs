import { chromium } from 'playwright';
const b=await chromium.launch();
for (const [n,base] of Object.entries({live:'https://www.mobileaccessgateway.ch', local:'http://localhost:8080'}))
for (const vp of [{width:1440,height:900},{width:390,height:844}]) {
  const p=await b.newPage(); await p.setViewportSize(vp);
  await p.goto(base+'/contact',{waitUntil:'networkidle'});
  await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}.consent{display:none!important}'});
  await p.waitForTimeout(800);
  console.log(`  ${n.padEnd(6)} @${String(vp.width).padStart(4)}  ` + await p.evaluate(()=>{
    const h=[...document.querySelectorAll('h1,h2')].find(e=>e.textContent.trim().startsWith('Contact us'));
    const s=document.querySelector('.contact__social a, .sqs-svg-icon--wrapper');
    const r=h?h.getBoundingClientRect():null, sr=s?s.getBoundingClientRect():null;
    return `title y=${r?Math.round(r.y):'-'} x=${r?Math.round(r.x):'-'}   icon ${sr?Math.round(sr.width)+'x'+Math.round(sr.height)+' at '+Math.round(sr.x)+','+Math.round(sr.y):'-'}`;
  }));
  await p.close();
}
await b.close();
