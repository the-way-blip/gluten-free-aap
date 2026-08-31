import { chromium } from 'playwright';
const scratch = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width:1080, height:1350 }, deviceScaleFactor: 1 });
await p.goto('file://' + scratch + '/sift-ad.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.screenshot({ path: scratch + '/sift-ad-1.png' });
await b.close();
console.log('rendered');
