const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Kết quả học tập")');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button:has-text("10A1")');
  await new Promise(r => setTimeout(r, 1000));
  await page.type('input[placeholder="-"]', '4');
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
