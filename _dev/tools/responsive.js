const puppeteer = require('puppeteer-core');
const fs = require('fs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
const OUT = 'D:/008Code/018Tol/assets/shots';

const CHECKS = [
  ['mobile', {width:390, height:844, isMobile:true, hasTouch:true, deviceScaleFactor:2}, false],
  ['tablet', {width:834, height:1112, isMobile:true, hasTouch:true, deviceScaleFactor:2}, false],
  ['reduced', {width:1280, height:800}, true]
];

(async () => {
  for (const [name, vp, reduceMotion] of CHECKS){
    const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
      args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    if (reduceMotion) await page.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}]);
    await page.setViewport(vp);
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(URL, {waitUntil:'load'});
    await new Promise(r=>setTimeout(r,2000));
    const info = await page.evaluate(()=>{
      const q = s => document.querySelector(s);
      const r = e => { if(!e) return null; const b = e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
      return {
        docH: document.documentElement.scrollHeight,
        overflowX: document.documentElement.scrollWidth - innerWidth,
        h1: r(q('h1')),
        nav: r(q('#dual-lines')),
        h1Size: getComputedStyle(q('h1')).fontSize,
        bodyPad: getComputedStyle(document.body).paddingLeft + ' / ' + getComputedStyle(document.body).paddingBottom,
        slotW: r(q('.slot'))
      };
    });
    console.log(`--- ${name} ${vp.width}x${vp.height} reduceMotion=${reduceMotion}`);
    console.log(JSON.stringify(info));
    console.log('errors:', errs.length, [...new Set(errs)].slice(0,3));
    // 截几张关键图
    for (const [sn, frac] of [['top',0], ['dig',0.03], ['well',0.50], ['loop',0.95]]){
      await page.evaluate(f => window.scrollTo(0, Math.round((document.documentElement.scrollHeight-innerHeight)*f)), frac);
      await new Promise(r=>setTimeout(r,700));
      await page.screenshot({path:`${OUT}/v_${name}_${sn}.png`});
    }
    await browser.close();
  }
})();
