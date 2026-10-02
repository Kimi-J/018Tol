const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  await page.goto(URL, {waitUntil:'domcontentloaded'});
  const r = await page.evaluate(async ()=>{
    const txt = await (await fetch(location.href)).text();
    const lines = txt.split('\n');
    return {
      total: lines.length,
      l1603: lines[1602],
      l1608: lines[1607],
      l1614: lines[1613],
      l1618: lines[1617],
      l1619: lines[1618],
      // 页面内联脚本里同一段
      inlineHasOldPattern: txt.indexOf('c1r.toFixed(2)},${c1y.toFixed(1)}') > -1,
      inlineHasNewPattern: txt.indexOf("(k ? ' ' : ' C')") > -1
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await browser.close();
})();
