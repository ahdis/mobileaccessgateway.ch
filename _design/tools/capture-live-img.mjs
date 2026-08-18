import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage(); await p.setViewportSize({width:1440,height:900});
const seen = [];
p.on('response', async r => {
  const u = r.url();
  if (!/images\.squarespace-cdn|file\.squarespace/.test(u)) return;
  if (!/openSource|moving_gif/.test(u)) return;
  try {
    const buf = await r.body();
    const name = u.includes('openSource') ? 'live-openSource.bin' : 'live-herogif.bin';
    writeFileSync('/tmp/' + name, buf);
    seen.push(`${name}  ${buf.length} bytes  ct=${r.headers()['content-type']}  url=${u.slice(-70)}`);
  } catch (e) {}
});
await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
await p.evaluate(async () => { await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollTo(0,y+=500);if(y>document.body.scrollHeight){clearInterval(t);r();}},40);}); });
await p.waitForTimeout(1500);
console.log(seen.join('\n') || '(no matching responses)');
await b.close();
