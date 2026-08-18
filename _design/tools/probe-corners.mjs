/* For each content image, report the colour actually painted at its own corner
   vs its centre -- the reliable test for whether transparency survives. */
import { chromium } from 'playwright';
const targets = { live: 'https://www.mobileaccessgateway.ch/', local: process.env.LOCAL || 'http://localhost:8080/' };
const b = await chromium.launch();
for (const [name, url] of Object.entries(targets)) {
  const p = await b.newPage(); await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important} .consent{display:none!important}' });
  await p.waitForTimeout(1200);
  const boxes = await p.evaluate(() => [...document.querySelectorAll('img, picture img')]
    .map(i => { const r = i.getBoundingClientRect();
      return { src: i.currentSrc.split('/').pop().split('?')[0].slice(0, 30), x: r.x, y: r.y, w: r.width, h: r.height }; })
    .filter(o => o.w > 80));
  console.log(`\n===== ${name} =====`);
  for (const o of boxes) {
    await p.evaluate(y => window.scrollTo(0, y), Math.max(0, o.y - 200));
    await p.waitForTimeout(250);
    const r2 = await p.evaluate(s => { const i = [...document.querySelectorAll('img')].find(x => x.currentSrc.includes(s));
      const r = i.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, o.src.slice(0, 18));
    const shot = await p.screenshot({ clip: { x: r2.x, y: r2.y, width: Math.min(r2.w, 300), height: Math.min(r2.h, 300) } });
    const px = await p.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const at = (x, y) => Array.from(g.getImageData(x, y, 1, 1).data).slice(0, 3).join(',');
      return { tl: at(2, 2), tr: at(img.width - 3, 2), mid: at(img.width >> 1, img.height >> 1) };
    }, shot.toString('base64'));
    console.log(`  ${o.src.padEnd(32)} ${Math.round(o.w)}x${Math.round(o.h)}  corner=(${px.tl}) (${px.tr})  centre=(${px.mid})`);
  }
  await p.close();
}
await b.close();
