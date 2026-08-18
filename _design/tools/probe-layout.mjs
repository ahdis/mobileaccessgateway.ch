import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [vp, size] of Object.entries({desktop:{width:1440,height:900}, mobile:{width:390,height:844}})) {
  const p = await b.newPage({ viewport: size });
  await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const g = (sel) => { const e=document.querySelector(sel); if(!e) return null;
      const c=getComputedStyle(e), b=e.getBoundingClientRect();
      return {pos:c.position, w:Math.round(b.width), h:Math.round(b.height), top:Math.round(b.top),
              bg:c.backgroundColor, pad:`${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`, z:c.zIndex}; };
    const hero = document.querySelector('section[data-section-theme="bright"]');
    const heroImgs=[...hero.querySelectorAll('img')].map(i=>({src:i.src.split('/').pop().split('?')[0].slice(0,28),
      w:Math.round(i.getBoundingClientRect().width), h:Math.round(i.getBoundingClientRect().height),
      x:Math.round(i.getBoundingClientRect().left), y:Math.round(i.getBoundingClientRect().top)}));
    const btn = hero.querySelector('a.sqs-block-button-element');
    const bc = btn && getComputedStyle(btn);
    return { header:g('#header'), headerInner:g('.header-announcement-bar-wrapper'),
      logo:g('.header-title-logo img'), nav:g('.header-nav'), burger:g('.header-burger'),
      hero:g('section[data-section-theme="bright"]'),
      heroContent:g('section[data-section-theme="bright"] .content-wrapper'),
      heroImgs,
      button: bc && {bg:bc.backgroundColor, color:bc.color, pad:`${bc.paddingTop} ${bc.paddingRight}`,
                     radius:bc.borderRadius, fs:bc.fontSize, fw:bc.fontWeight, ls:bc.letterSpacing, tt:bc.textTransform},
      footer:g('#footer-sections'),
    };
  });
  console.log(`\n===== ${vp} =====`);
  for (const [k,v] of Object.entries(r)) console.log(` ${k}:`, JSON.stringify(v));
  await p.close();
}
await b.close();
