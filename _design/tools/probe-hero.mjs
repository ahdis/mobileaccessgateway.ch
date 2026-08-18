import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [vp, size] of Object.entries({desktop:{width:1440,height:900}, mobile:{width:390,height:844}})) {
  const p = await b.newPage({ viewport: size });
  await p.goto('https://www.mobileaccessgateway.ch/', { waitUntil:'networkidle' });
  await p.waitForTimeout(900);
  console.log(`\n===== hero @ ${vp} (${size.width}px) =====`);
  console.log(await p.evaluate(() => {
    const hero = document.querySelector('section[data-section-theme="bright"]');
    const rows = [];
    hero.querySelectorAll('.sqs-block').forEach(el => {
      const r = el.getBoundingClientRect();
      const t = (el.innerText || '').replace(/\s+/g,' ').trim().slice(0,52);
      rows.push(`  x=${String(Math.round(r.left)).padStart(4)} y=${String(Math.round(r.top)).padStart(4)}` +
                ` w=${String(Math.round(r.width)).padStart(4)} h=${String(Math.round(r.height)).padStart(4)}` +
                `  ${el.getAttribute('data-definition-name')||el.className.match(/sqs-block-(\w+)/)?.[1]||'?'}` +
                (t ? `  "${t}"` : ''));
    });
    return rows.join('\n');
  }));
  await p.close();
}
await b.close();
