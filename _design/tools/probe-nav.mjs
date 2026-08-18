import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, base, btn] of [['live','https://www.mobileaccessgateway.ch','.header-burger-btn'],
                                 ['local','http://localhost:8080','.header__burger']]) {
  const p = await b.newPage(); await p.setViewportSize({width:390,height:844});
  await p.goto(base + '/', { waitUntil:'networkidle' });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `_design/screens/nav-closed-${name}.png` });
  try {
    // the original renders duplicate headers; click the visible burger
    const target = await p.evaluateHandle((sel) => {
      const els = [...document.querySelectorAll(sel)];
      return els.find(e => e.getBoundingClientRect().width > 0) || els[0];
    }, btn);
    const box = await target.asElement().boundingBox();
    if (box) await p.mouse.click(box.x + box.width/2, box.y + box.height/2);
    else await p.click(btn, { force: true, timeout: 5000 });
    await p.waitForTimeout(700);
    await p.screenshot({ path: `_design/screens/nav-open-${name}.png` });
    console.log(`  ${name}: opened`);
  } catch (e) { console.log(`  ${name}: could not click (${e.message.split('\n')[0]})`); }
  await p.close();
}
await b.close();
