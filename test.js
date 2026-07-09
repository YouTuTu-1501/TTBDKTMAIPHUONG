import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const gradesTab = tabs.find(t => t.textContent.includes('Kết quả'));
    if (gradesTab) gradesTab.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const classes = Array.from(document.querySelectorAll('button'));
    const c10A1 = classes.find(t => t.textContent.includes('10A1'));
    if (c10A1) c10A1.click();
  });

  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
