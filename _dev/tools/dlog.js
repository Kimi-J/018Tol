const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});

  // 在文档加载前注入：拦截 setAttribute('d', ...) 并记录调用栈
  await page.evaluateOnNewDocument(() => {
    window.__dLog = [];
    const orig = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value){
      if (name === 'd' && this.id && this.id.indexOf('rail') === 0){
        window.__dLog.push({id:this.id, v:String(value).slice(0,140), stack:(new Error()).stack.split('\n').slice(1,4).join(' | ')});
        if (window.__dLog.length > 4) window.__dLog.shift();
      }
      return orig.call(this, name, value);
    };
  });
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1800));
  const log = await page.evaluate(()=>({log: window.__dLog, final: document.getElementById('rail-reason').getAttribute('d').slice(0,140)}));
  console.log('captured:', JSON.stringify(log.log, null, 2).slice(0,2500));
  console.log('final:', log.final);
  await browser.close();
})();
