import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
await p.waitForTimeout(1000);
console.log(await p.evaluate(() => {
  const out=[];
  document.querySelectorAll('img').forEach(img=>{
    const r=img.getBoundingClientRect(); if(r.width<40) return;
    const c=getComputedStyle(img);
    const w=img.closest('.sqs-block, .image-block-wrapper');
    const wc=w?getComputedStyle(w):null;
    out.push(`${img.src.split('/').pop().split('?')[0].slice(0,26).padEnd(28)}`
      +` size=${Math.round(r.width)}x${Math.round(r.height)}`
      +` radius=${c.borderRadius} clip=${c.clipPath} objFit=${c.objectFit}`
      +(wc?`  | wrapper radius=${wc.borderRadius} clip=${wc.clipPath} overflow=${wc.overflow}`:''));
  });
  return out.join('\n');
}));
await b.close();
