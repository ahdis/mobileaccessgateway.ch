import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, base] of Object.entries({live:'https://www.mobileaccessgateway.ch', local:'http://localhost:8080'})) {
  for (const [vp,size] of Object.entries({desktop:{width:1440,height:900}, mobile:{width:390,height:844}})) {
    const p = await b.newPage(); await p.setViewportSize(size);
    await p.goto(base + '/', { waitUntil:'networkidle' });
    await p.addStyleTag({content:'.preFade,[class*="preFade"],.sqs-block{opacity:1!important;transform:none!important}.consent{display:none!important}'});
    await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const f = document.querySelector('footer, #footer-sections');
      const img = f && f.querySelector('img');
      if (!img) return 'no footer img';
      const b = img.getBoundingClientRect(), fb = f.getBoundingClientRect();
      return `${Math.round(b.width)}x${Math.round(b.height)} at x=${Math.round(b.x)} y-in-footer=${Math.round(b.y-fb.top)}  src=${img.currentSrc.split('/').pop().split('?')[0].slice(0,24)}`;
    });
    console.log(`  ${name.padEnd(6)} ${vp.padEnd(8)} ${r}`);
    await p.close();
  }
}
await b.close();
