const puppeteer = require('puppeteer-core');
const fs = require('fs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'D:/008Code/018Tol/assets/shots';
const MAIN = 'file:///D:/008Code/018Tol/index.html';
const SUB  = 'file:///D:/008Code/018Tol/%E5%BF%83%E7%81%B5%E8%BE%A9%E8%AF%81%E6%B3%95-%E6%89%98%E5%B0%94%E6%96%AF%E6%B3%B0.html';
const sleep = ms => new Promise(r=>setTimeout(r,ms));
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  fs.mkdirSync(OUT,{recursive:true});

  // 主页面：心灵辩证法屏（桌面 + 窄屏）
  for (const [tag, vp] of [['desktop',{width:1440,height:900}], ['mobile',{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2}]]){
    const p = await browser.newPage();
    await p.setCacheEnabled(false);
    await p.setViewport(vp);
    await p.goto(MAIN,{waitUntil:'load'});
    await sleep(1600);
    await p.evaluate(()=>document.getElementById('dialectics').scrollIntoView({block:'center'}));
    await sleep(700);
    await p.screenshot({path:`${OUT}/nav_main_${tag}.png`});
    await p.close();
  }

  // 专题页：顶部导航（含返回）+ 中部角标
  {
    const p = await browser.newPage();
    await p.setCacheEnabled(false);
    await p.setViewport({width:1440,height:900});
    await p.goto(SUB,{waitUntil:'load'});
    await sleep(1800);
    await p.screenshot({path:`${OUT}/nav_sub_top.png`});
    await p.evaluate(()=>window.scrollTo(0, document.documentElement.scrollHeight*0.42));
    await sleep(1200);
    await p.screenshot({path:`${OUT}/nav_sub_mid.png`});
    await p.close();
  }
  // 专题页窄屏
  {
    const p = await browser.newPage();
    await p.setCacheEnabled(false);
    await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
    await p.goto(SUB,{waitUntil:'load'});
    await sleep(1800);
    await p.screenshot({path:`${OUT}/nav_sub_mobile.png`});
    await p.close();
  }
  console.log('shots done');
  await browser.close();
})();
