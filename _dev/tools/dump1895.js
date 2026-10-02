const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
const sleep = ms => new Promise(r=>setTimeout(r,ms));
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  await page.goto(URL, {waitUntil:'load'});
  await sleep(1800);
  await page.evaluate(()=>{
    const r=document.querySelector('.diary').getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 60);
  });
  await sleep(600);

  // 复现：先点 1884，再立刻点 1895
  const clickYear = async y => {
    const b = await page.evaluate(y=>{
      const el=[...document.querySelectorAll('.diary__yr')].find(x=>x.dataset.year===y);
      const r=el.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2};
    }, y);
    await page.mouse.click(b.x, b.y);
  };

  await clickYear('1884');
  await sleep(700);
  await clickYear('1895');
  await sleep(700);

  // 现在 dump 1895 按钮坐标上的完整堆叠
  const dump = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('.diary__yr')].find(x=>x.dataset.year==='1895');
    const r=el.getBoundingClientRect();
    const cx=r.x+r.width/2, cy=r.y+r.height/2;
    const front=document.querySelector('.diary__page.is-front');
    const fr=front.getBoundingClientRect();
    const stack=document.elementsFromPoint(cx,cy).map(t=>{
      const cls=(t.className&&t.className.baseVal!==undefined?t.className.baseVal:(t.className||'')).toString();
      const rr=t.getBoundingClientRect();
      return `${t.tagName}.${cls.split(' ')[0]} box=[${Math.round(rr.x)},${Math.round(rr.y)},${Math.round(rr.width)},${Math.round(rr.height)}] pe=${getComputedStyle(t).pointerEvents}`;
    });
    return {click:[Math.round(cx),Math.round(cy)],
      frontYear:front.dataset.page, frontBox:[Math.round(fr.x),Math.round(fr.y),Math.round(fr.width),Math.round(fr.height)],
      frontPE:getComputedStyle(front).pointerEvents,
      stack: stack.slice(0,8)};
  });
  console.log(JSON.stringify(dump, null, 1));
  await browser.close();
})();
