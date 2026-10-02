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
  await page.evaluate(()=>{
    const el = document.querySelector('.sky');
    const r = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top + r.height*0.15 - innerHeight*0.5);
  });
  await new Promise(r=>setTimeout(r,700));
  const info = await page.evaluate(()=>{
    const st = document.querySelector('.sky__sticky');
    const cv = document.getElementById('skyCanvas');
    const g = document.querySelector('.grain-layer');
    const rect = e => { const r = e.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; };
    return {
      sticky: rect(st), canvas: rect(cv), canvasCss: {w:cv.style.width,h:cv.style.height,aw:cv.width,ah:cv.height},
      grain: rect(g), grainOpacity: getComputedStyle(g).opacity,
      bodyBg: getComputedStyle(document.body).backgroundColor
    };
  });
  console.log(JSON.stringify(info,null,2));
  await browser.close();
})();
