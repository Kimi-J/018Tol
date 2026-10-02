const puppeteer = require('puppeteer-core');
const fs = require('fs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
const OUT = 'D:/008Code/018Tol/assets/shots';
// 按"章节内相对进度"截图，便于逐章检查
const SHOTS = process.argv[2] ? JSON.parse(process.argv[2]) : [
  ['dig_a', '#dig', 0.10], ['dig_b', '#dig', 0.40], ['dig_c', '#dig', 0.75], ['dig_d', '#dig', 0.97],
  ['estate_a', '.estate', 0.15], ['estate_b', '.estate', 0.85],
  ['diary', '.diary', 0.5],
  ['sky_a', '.sky', 0.15], ['sky_b', '.sky', 0.60], ['sky_c', '.sky', 0.95],
  ['pend', '#pendulum', 0.5], ['calc_a', '#calculus', 0.25], ['calc_b', '#calculus', 0.60],
  ['epi_a', '.epigraph', 0.30], ['epi_b', '.epigraph', 0.95],
  ['ball', '#ball', 0.8], ['chalk', '#chalk', 0.6], ['mow', '.mow', 0.6],
  ['candle_a', '.candle', 0.30], ['candle_b', '.candle', 0.80], ['candle_c', '.candle', 0.99],
  ['horse', '#horse', 0.5],
  ['well_a', '.well', 0.30], ['well_b', '.well', 0.65], ['well_c', '.well', 0.95],
  ['syl_a', '.syl', 0.30], ['syl_b', '.syl', 0.95],
  ['bag_a', '.bag', 0.35], ['bag_b', '.bag', 0.80], ['bag_c', '.bag', 0.97],
  ['funeral', '#funeral', 0.6],
  ['grass_a', '.grass', 0.35], ['grass_b', '.grass', 0.95], ['court', '#court', 0.7],
  ['swing', '.swing', 0.6], ['kiss', '#kiss', 0.5],
  ['map_a', '.map', 0.30], ['map_b', '.map', 0.95], ['asta', '#astapovo', 0.85], ['papers', '#papers', 0.5],
  ['zwei_a', '.zwei', 0.40], ['zwei_b', '.zwei', 0.92], ['loop', '.loop', 0.55], ['last', '.last', 0.5],
  ['burd', '#burdock', 0.6], ['race', '#race', 0.4], ['night', '#night', 0.5],
  ['echo', '#echo', 0.4], ['legacy', '#legacy', 0.8], ['tb', '#textbook', 0.5],
  ['nums', '#numbers', 0.6], ['tl', '#timeline', 0.7]
];
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900, deviceScaleFactor:1});
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1800));
  fs.mkdirSync(OUT, {recursive:true});

  for (const [name, sel, frac] of SHOTS){
    const ok = await page.evaluate((sel, frac)=>{
      const el = document.querySelector(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const top = window.scrollY + r.top;
      // 让元素内部进度 = frac
      const h = Math.max(r.height, 1);
      const y = top + h*frac - innerHeight*0.5;
      window.scrollTo(0, Math.max(0, y));
      return true;
    }, sel, frac);
    if (!ok){ console.log('MISSING ' + sel); continue; }
    await new Promise(r=>setTimeout(r,700));
    await page.screenshot({path:`${OUT}/s_${name}.png`});
  }
  console.log('shots done. errors:', errs.length, [...new Set(errs)].slice(0,5));
  await browser.close();
})();
