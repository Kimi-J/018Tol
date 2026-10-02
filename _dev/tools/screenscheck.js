const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
const SELS = ['#act1','#act2','#act3','#act4','#act5','#act6','.well','.candle','.bag','.zwei','.loop'];
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2000));
  const rep = await page.evaluate((sels)=>{
    const out = {};
    for (const s of sels){
      const el = document.querySelector(s);
      if (!el) { out[s] = 'MISSING'; continue; }
      const h = el.getBoundingClientRect().height;
      const screens = h / innerHeight;
      // 该区域内可见的视觉锚点数量
      const anchors = el.querySelectorAll('svg, canvas, img, .slot, .estate__svg, .map__svg, .court__svg, .night__svg, .legacy__svg, .diary__book, .pend__svg, .ball__stage, .chalk__table, .mow__field, .horse__svg, .well__svg, .bag__sticky, .grass__svg, .swing__bar, .kiss__stage, .papers__wall, .echo__wall, .tb__grid, .num__grid, .tl__svg').length;
      out[s] = {heightPx: Math.round(h), screens: +screens.toFixed(2), anchors, charsPerScreen: null};
    }
    return out;
  }, SELS);
  console.log(JSON.stringify(rep, null, 2));
  await browser.close();
})();
