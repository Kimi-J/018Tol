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
  await new Promise(r=>setTimeout(r,1600));

  await page.evaluate(()=>{
    const r = document.querySelector('.diary').getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 60);
  });
  await new Promise(r=>setTimeout(r,500));

  // 点到 1895 之前，先看那个坐标上的完整堆叠
  const info = await page.evaluate(()=>{
    const btns=[...document.querySelectorAll('.diary__yr')];
    const b=btns.find(x=>x.dataset.year==='1895');
    const r=b.getBoundingClientRect();
    const cx=r.x+r.width/2, cy=r.y+r.height/2;
    const stack=document.elementsFromPoint(cx,cy).map(t=>{
      const cls=(t.className&&t.className.baseVal!==undefined?t.className.baseVal:(t.className||'')).toString();
      const rr=t.getBoundingClientRect();
      return {tag:t.tagName, cls:cls.split(' ').slice(0,2).join('.'),
        box:[Math.round(rr.x),Math.round(rr.y),Math.round(rr.width),Math.round(rr.height)],
        pe:getComputedStyle(t).pointerEvents, op:getComputedStyle(t).opacity,
        z:getComputedStyle(t).zIndex, pos:getComputedStyle(t).position};
    });
    // 当前 front 页的盒子
    const front=document.querySelector('.diary__page.is-front');
    const fr=front.getBoundingClientRect();
    return {click:[Math.round(cx),Math.round(cy)], btnBox:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
      frontYear:front.dataset.page, frontBox:[Math.round(fr.x),Math.round(fr.y),Math.round(fr.width),Math.round(fr.height)],
      stack: stack.slice(0,7),
      bookW: Math.round(document.getElementById('diaryBook').getBoundingClientRect().width),
      dialRight: Math.round(document.querySelector('.diary__dial').getBoundingClientRect().right)};
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})();
