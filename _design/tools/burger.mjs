import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage(); await p.setViewportSize({width:390,height:844});
await p.goto('https://www.mobileaccessgateway.ch/',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{
  const el=document.querySelector('.header-burger, .burger, [class*=burger]');
  if(!el) return 'no burger';
  const r=el.getBoundingClientRect(); const c=getComputedStyle(el);
  const kids=[...el.querySelectorAll('*')].map(k=>{
    const kr=k.getBoundingClientRect(), kc=getComputedStyle(k);
    return `    ${k.tagName}.${(k.className||'').toString().split(/\s+/).slice(0,2).join('.')} ${Math.round(kr.width)}x${Math.round(kr.height)} at ${Math.round(kr.x)},${Math.round(kr.y)} bg=${kc.backgroundColor} transform=${kc.transform}`;
  });
  return `  burger ${Math.round(r.width)}x${Math.round(r.height)} at ${Math.round(r.x)},${Math.round(r.y)} class="${el.className}"\n`+kids.join('\n');
}));
await b.close();
