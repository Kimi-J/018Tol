const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});
  const errs = [];
  page.on('pageerror', e => errs.push('[pageerror] '+e.message));
  page.on('console', m => { if(m.type()==='error') errs.push('[console] '+m.text()); });
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2200));
  const out = await page.evaluate(()=>{
    const el = document.querySelector('.eyebrow .num');
    const cs = getComputedStyle(el);
    const rules = [];
    for (const sheet of document.styleSheets){
      let rl; try { rl = sheet.cssRules; } catch(e){ continue; }
      for (const r of rl){
        if (r.selectorText && /(^|,|\s)\.num\b/.test(r.selectorText)) rules.push(r.selectorText + ' { ' + r.style.cssText.slice(0,140) + ' }');
      }
    }
    return {
      cls: el.className,
      outer: el.outerHTML.slice(0,200),
      padding: cs.padding, bg: cs.backgroundColor, display: cs.display,
      rules
    };
  });
  console.log(JSON.stringify(out,null,2));
  console.log('ERRORS', errs.length);
  [...new Set(errs)].slice(0,10).forEach(e=>console.log(e));
  await browser.close();
})();
