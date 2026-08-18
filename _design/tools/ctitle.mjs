import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto('https://www.mobileaccessgateway.ch/contributors',{waitUntil:'networkidle'});
await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}'});
await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{
  const out=[];
  document.querySelectorAll('main *, #page *, .page-section *').forEach(el=>{
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(t!=='Contributors') return;
    if(el.children.length) return;
    const r=el.getBoundingClientRect(), c=getComputedStyle(el);
    out.push(`  ${el.tagName}.${(el.className||'').toString().split(/\s+/)[0]} x=${Math.round(r.x)} y=${Math.round(r.y)} w=${Math.round(r.width)} h=${Math.round(r.height)} fs=${c.fontSize} lh=${c.lineHeight} weight=${c.fontWeight} color=${c.color}`);
  });
  // card title style
  const h2=document.querySelector('.user-items-list-item-container h2, li h2');
  if(h2){const r=h2.getBoundingClientRect(),c=getComputedStyle(h2);
    out.push(`  CARD TITLE ${h2.tagName} fs=${c.fontSize} lh=${c.lineHeight} weight=${c.fontWeight} color=${c.color} align=${c.textAlign}`);}
  const pEl=document.querySelector('.user-items-list-item-container li p');
  if(pEl){const c=getComputedStyle(pEl);out.push(`  CARD BODY fs=${c.fontSize} lh=${c.lineHeight} color=${c.color} align=${c.textAlign}`);}
  return out.join('\n')||'(no "Contributors" text node found)';
}));
await b.close();
