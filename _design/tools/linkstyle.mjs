import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage(); await p.setViewportSize({width:1440,height:900});
await p.goto('http://localhost:8080/privacy-policy/',{waitUntil:'networkidle'});
await p.waitForTimeout(500);
console.log(await p.evaluate(()=>{
  const a=document.querySelector('.js-consent-reopen'); if(!a) return '  link missing';
  const c=getComputedStyle(a); const r=a.getBoundingClientRect();
  return `  consent link: "${a.textContent}" color=${c.color} decoration=${c.textDecorationLine} cursor=${c.cursor} visible=${r.width>0}`;
}));
await b.close();
