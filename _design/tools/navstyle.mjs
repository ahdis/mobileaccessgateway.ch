import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage(); await p.setViewportSize({width:390,height:844});
await p.goto('https://www.mobileaccessgateway.ch/',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
const t=await p.evaluateHandle(()=>[...document.querySelectorAll('.header-burger-btn')].find(e=>e.getBoundingClientRect().width>0));
const box=await t.asElement().boundingBox(); await p.mouse.click(box.x+box.width/2, box.y+box.height/2);
await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{
  const links=[...document.querySelectorAll('.header-menu-nav-item a, .header-menu a')].filter(a=>a.getBoundingClientRect().width>0);
  const out=links.slice(0,5).map(a=>{const r=a.getBoundingClientRect(),c=getComputedStyle(a);
    return `  "${a.textContent.trim()}" y=${Math.round(r.y)} x=${Math.round(r.x)} w=${Math.round(r.width)} fs=${c.fontSize} lh=${c.lineHeight} color=${c.color} weight=${c.fontWeight}`;});
  const logo=document.querySelector('.header-title-logo img, .header-menu img');
  const lr=logo?logo.getBoundingClientRect():null;
  out.push(`  logo visible: ${lr? Math.round(lr.width)+'x'+Math.round(lr.height)+' at '+Math.round(lr.x)+','+Math.round(lr.y) : 'none'}`);
  const menu=document.querySelector('.header-menu');
  if(menu){const mr=menu.getBoundingClientRect(),mc=getComputedStyle(menu);
    out.push(`  menu: y=${Math.round(mr.y)} h=${Math.round(mr.height)} bg=${mc.backgroundColor} padTop=${mc.paddingTop}`);}
  return out.join('\n');
}));
await b.close();
