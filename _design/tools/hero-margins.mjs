import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto((process.env.BASE||'https://www.mobileaccessgateway.ch')+'/',{waitUntil:'networkidle'});
await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{
  const sec=document.querySelector('section[data-section-theme="bright"], .hero'); const sb=sec.getBoundingClientRect();
  return [...sec.querySelectorAll('h1, .hero__lede, .hero__cta, a.button, .sqs-block-button-element, .sqs-block')].map(e=>{
    const r=e.getBoundingClientRect(), c=getComputedStyle(e);
    return `  y=${String(Math.round(r.top-sb.top)).padStart(4)} h=${String(Math.round(r.height)).padStart(4)} mt=${c.marginTop} mb=${c.marginBottom} fs=${c.fontSize} lh=${c.lineHeight}  ${e.tagName}`;
  }).join('\n');
}));
await b.close();
