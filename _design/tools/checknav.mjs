import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage(); await p.setViewportSize({width:390,height:844});
await p.goto('http://localhost:8080/',{waitUntil:'networkidle'});
await p.waitForTimeout(600); await p.click('.header__burger'); await p.waitForTimeout(600);
console.log(await p.evaluate(()=>[...document.querySelectorAll('.header__nav a')].map(a=>{
  const r=a.getBoundingClientRect(),c=getComputedStyle(a);
  return `  "${a.textContent.trim()}" y=${Math.round(r.y)} x=${Math.round(r.x)} w=${Math.round(r.width)} fs=${c.fontSize} color=${c.color}`;}).join('\n')));
await b.close();
