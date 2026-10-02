const puppeteer = require('puppeteer-core');
const fs = require('fs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
const OUT = 'D:/008Code/018Tol/assets/shots';
const VPS = [
  ['desktop', {width:1440, height:900}],
  ['tablet',  {width:834, height:1112}],
  ['mobile',  {width:390, height:844, isMobile:true, hasTouch:true, deviceScaleFactor:2}]
];
(async () => {
  for (const [name, vp] of VPS){
    const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
      args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport(vp);
    const errs=[]; page.on('pageerror', e=>errs.push(e.message));
    await page.goto(URL, {waitUntil:'load'});
    await new Promise(r=>setTimeout(r,1800));

    // 日记：点最长的那一页
    await page.evaluate(()=>{
      const r = document.querySelector('.diary').getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - 40);
    });
    await new Promise(r=>setTimeout(r,400));
    const idx = await page.evaluate(()=>{
      const ys=[...document.querySelectorAll('.diary__yr')];
      return ys.findIndex(b=>b.dataset.year==='1879');
    });
    await page.evaluate(i=>document.querySelectorAll('.diary__yr')[i].click(), idx);
    await new Promise(r=>setTimeout(r,1000));
    const d = await page.evaluate(()=>{
      const f = document.querySelector('.diary__page.is-front');
      const bk = document.getElementById('diaryBook');
      const fr = f.getBoundingClientRect(), br = bk.getBoundingClientRect();
      const inner = bk.closest('.diary__inner').getBoundingClientRect();
      return {front:f.dataset.page, pageH:Math.round(fr.height), bookH:Math.round(br.height),
        overflow: Math.round(fr.height - br.height),
        fits: fr.height <= br.height + 1,
        gridCols: getComputedStyle(bk.closest('.diary__inner')).gridTemplateColumns};
    });
    console.log(`--- ${name} ---`);
    console.log('日记:', JSON.stringify(d));
    await page.screenshot({path:`${OUT}/fix_${name}_diary.png`});

    // 课本卡
    await page.evaluate(()=>{
      const r = document.querySelector('#textbook').getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - 40);
    });
    await new Promise(r=>setTimeout(r,500));
    await page.evaluate(()=>document.querySelectorAll('.tb')[1].click());
    await new Promise(r=>setTimeout(r,900));
    const t = await page.evaluate(()=>{
      const c = document.querySelectorAll('.tb')[1];
      const inner=c.querySelector('.tb__inner').getBoundingClientRect();
      const back=c.querySelector('.tb__b').getBoundingClientRect();
      const body=c.querySelector('.tb__body').getBoundingClientRect();
      return {flip:c.classList.contains('flip'), inner:[Math.round(inner.width),Math.round(inner.height)],
        back:[Math.round(back.width),Math.round(back.height)],
        bodyFits: body.height <= back.height - 20,
        bodyScroll: c.querySelector('.tb__b').scrollHeight <= c.querySelector('.tb__b').clientHeight + 1};
    });
    console.log('课本卡:', JSON.stringify(t));
    await page.screenshot({path:`${OUT}/fix_${name}_tb.png`});

    console.log('errors:', errs.length);
    await browser.close();
  }
})();
