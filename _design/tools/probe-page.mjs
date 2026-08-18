import { chromium } from 'playwright';
const [path, ...rest] = process.argv.slice(2);
const b = await chromium.launch();
for (const [vp, size] of Object.entries({desktop:{width:1440,height:900}, mobile:{width:390,height:844}})) {
  const p = await b.newPage({ viewport: size });
  await p.goto('https://www.mobileaccessgateway.ch' + path, { waitUntil:'networkidle' });
  await p.waitForTimeout(900);
  console.log(`\n===== ${path} @ ${vp} =====`);
  console.log(await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.sqs-block, .user-items-list-item-container > li, .list-item').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 && r.height < 2) return;
      const t = (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,44);
      out.push(`  x=${String(Math.round(r.left)).padStart(4)} y=${String(Math.round(r.top)).padStart(5)}`
        + ` w=${String(Math.round(r.width)).padStart(4)} h=${String(Math.round(r.height)).padStart(4)}`
        + `  ${el.getAttribute('data-definition-name')||el.tagName.toLowerCase()}  "${t}"`);
    });
    return out.join('\n');
  }));
  await p.close();
}
await b.close();
