const puppeteer = require('puppeteer-core');
const fs = require('fs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
const OUT = 'D:/008Code/018Tol/assets/shots';
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1800));
  const fracs = [0.10, 0.35, 0.60, 0.85];
  for (const f of fracs){
    await page.evaluate((f)=>{
      const el = document.querySelector('.loop');
      const r = el.getBoundingClientRect();
      // 让 --lp 接近目标值：--lp = (vh - top)/(h+vh)，元素高 240vh
      const vh = innerHeight, h = r.height, top0 = scrollY + r.top;
      // 解 p = (vh - (top0 - scrollY))/(h+vh)  =>  scrollY = top0 - vh + p*(h+vh)
      window.scrollTo(0, Math.round(top0 - vh + f*(h+vh)));
    }, f);
    await new Promise(r=>setTimeout(r,900));
    const st = await page.evaluate(()=>{
      const host = document.querySelector('.loop');
      const p = parseFloat(getComputedStyle(host).getPropertyValue('--lp'))||0;
      const ui = host.querySelector('.loop__ui');
      const r = ui.getBoundingClientRect();
      return {p:p.toFixed(3), uiTop:Math.round(r.top), uiBottom:Math.round(r.bottom), uiShift:getComputedStyle(ui).getPropertyValue('--loopui')};
    });
    console.log(JSON.stringify(st));
    await page.screenshot({path:`${OUT}/loop_${String(Math.round(f*100)).padStart(3,'0')}.png`});
  }
  await browser.close();
})();
