const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1500));
  const out = await page.evaluate(()=>{
    const cls = e => (e.className && e.className.baseVal !== undefined ? e.className.baseVal : (e.className||'')).toString();
    return [...document.querySelectorAll('body *')]
      .map(e=>({e, r:e.getBoundingClientRect()}))
      .filter(o=>o.r.right > innerWidth + 2)
      .slice(0,20)
      .map(o=>({tag:o.e.tagName, cls:cls(o.e).slice(0,42), right:Math.round(o.r.right), w:Math.round(o.r.width)}));
  });
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
