import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto('https://www.mobileaccessgateway.ch/contact',{waitUntil:'networkidle'});
await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{
  const a=document.querySelector('.sqs-svg-icon--wrapper, .social-icons a, [class*=social] a');
  if(!a) return 'none';
  const c=getComputedStyle(a), r=a.getBoundingClientRect();
  const svg=a.querySelector('svg'); const sc=svg?getComputedStyle(svg):null;
  const shape=a.querySelector('.sqs-use--mask, use');
  return `  wrapper ${Math.round(r.width)}x${Math.round(r.height)} class="${a.className}" bg=${c.backgroundColor} border=${c.border} radius=${c.borderRadius}\n`
   + (svg?`  svg ${Math.round(svg.getBoundingClientRect().width)}x${Math.round(svg.getBoundingClientRect().height)} fill=${sc.fill}\n`:'')
   + `  html: ${a.outerHTML.replace(/\s+/g,' ').slice(0,240)}`;
}));
await b.close();
