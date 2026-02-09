const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = 'http://localhost:8001/dist/index.html';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  // Find element that contains the target text
  const text = "Here's some red, centered text";
  const result = await page.evaluate((text) => {
    const matches = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (el.textContent && el.textContent.trim().includes(text)) {
        matches.push({ tag: el.tagName, className: el.className, textLen: el.textContent.trim().length, outerHTML: el.outerHTML });
      }
    }
    if (matches.length === 0) return null;
    // return the smallest matching element (most specific)
    matches.sort((a, b) => a.textLen - b.textLen);
    return matches[0];
  }, text);
  console.log('FOUND:', result);
  await browser.close();
})();
