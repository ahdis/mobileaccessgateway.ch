import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
await p.waitForTimeout(1200);
console.log(await p.evaluate(() => {
  const out=[];
  const img=[...document.querySelectorAll('img')].find(i=>i.currentSrc.includes('openSource'));
  if(!img) return 'icon not found';
  for(let e=img, n=0; e && n<6; e=e.parentElement, n++){
    const c=getComputedStyle(e);
    const props=['mask-image','-webkit-mask-image','mask-size','mask-repeat','clip-path','border-radius','shape-outside','filter','background-image','overflow'];
    const vals=props.map(k=>`${k}=${c.getPropertyValue(k)}`).filter(s=>!/=(none|0px|visible|no-repeat|auto)$/.test(s));
    out.push(`${e.tagName.toLowerCase()}.${(e.className||'').toString().split(/\s+/).slice(0,3).join('.')}\n     ${vals.join('\n     ')||'(nothing)'}`);
  }
  out.push('\nSVG defs on page: '+document.querySelectorAll('svg clipPath, svg mask').length);
  return out.join('\n');
}));
await b.close();
