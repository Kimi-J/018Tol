const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push('[console] '+m.text()); });
  page.on('pageerror', e => errs.push('[pageerror] '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2000));

  // 模拟快速滚动一段，检查是否有累积错误或错位
  for (let i=0;i<=40;i++){
    await page.evaluate(f => window.scrollTo(0, Math.round((document.documentElement.scrollHeight-innerHeight)*f)), i/40);
    await new Promise(r=>setTimeout(r,60));
  }
  // 回到顶部再滚一遍（可逆性测试）
  for (let i=40;i>=0;i--){
    await page.evaluate(f => window.scrollTo(0, Math.round((document.documentElement.scrollHeight-innerHeight)*f)), i/40);
    await new Promise(r=>setTimeout(r,40));
  }
  await new Promise(r=>setTimeout(r,800));

  const u = [...new Set(errs)];
  console.log('total errors:', errs.length, ' unique:', u.length);
  u.slice(0,15).forEach(e=>console.log(e.slice(0,180)));

  // 检查首屏与关键场景状态
  await page.evaluate(()=>window.scrollTo(0,0));
  await new Promise(r=>setTimeout(r,500));
  const s = await page.evaluate(()=>({
    railD: document.getElementById('rail-reason').getAttribute('d').slice(0,80),
    sky: getComputedStyle(document.documentElement).getPropertyValue('--sky'),
    docH: document.documentElement.scrollHeight,
    overflowX: document.documentElement.scrollWidth - innerWidth
  }));
  console.log(JSON.stringify(s));
  await browser.close();
})();
