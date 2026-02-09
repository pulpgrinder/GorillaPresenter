const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('response', resp => {
    if (resp.status() >= 400) console.log('RESP ERROR', resp.status(), resp.url());
  });

  const url = 'http://localhost:8001/dist/index.html';
  const start = Date.now();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    console.log('goto failed:', e.toString());
  }

  // Gather timing metrics inside the page
  const metrics = await page.evaluate(() => {
    const timing = performance.timing ? {
      navigationStart: performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      loadEvent: performance.timing.loadEventEnd - performance.timing.navigationStart
    } : null;
    const paints = performance.getEntriesByType ? performance.getEntriesByType('paint') : [];
    const fp = paints.find(p => p.name === 'first-paint')?.startTime || null;
    const fcp = paints.find(p => p.name === 'first-contentful-paint')?.startTime || null;
    return { timing, paints, fp, fcp };
  });

  const elapsed = Date.now() - start;
  console.log('HEADLESS TIMINGS:', { elapsed, metrics });

  // Capture console messages (already printed), grab outerHTML size
  const htmlSize = await page.evaluate(() => document.documentElement.outerHTML.length);
  console.log('HTML size:', htmlSize);

  // Save screenshot
  const screenshotPath = 'tools/headless_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Saved screenshot to', screenshotPath);

  await browser.close();
})();
