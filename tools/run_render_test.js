const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = 'http://localhost:8001/dist/index.html';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  const sample = `{{{red}}}{{{center}}}Here's some red, centered text\n{{{clear}}}\nThis text is back to normal.`;
  const out = await page.evaluate((s) => {
    // Render using GorillaMarkdown
    const rendered = GorillaMarkdown.render(s);
    return rendered;
  }, sample);
  console.log('RENDERED OUTPUT:\n', out);
  await browser.close();
})();
