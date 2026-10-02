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

  // ---------- 日记翻页器 ----------
  await page.evaluate(()=>{
    const el = document.querySelector('.diary');
    const r = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 100);
  });
  await new Promise(r=>setTimeout(r,600));

  const diaryGeom = () => page.evaluate(()=>{
    const book = document.getElementById('diaryBook');
    const br = book.getBoundingClientRect();
    return {
      bookH: Math.round(br.height),
      pages: [...book.querySelectorAll('.diary__page')].map(p=>{
        const r = p.getBoundingClientRect();
        return {year:p.dataset.page, cls:p.className.replace('diary__page','').trim(),
          x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)};
      })
    };
  });
  console.log('=== 初始 ===');
  console.log(JSON.stringify(await diaryGeom(), null, 1));

  // 真实点击 1855
  const yrs = await page.$$('.diary__yr');
  await yrs[2].click();
  await new Promise(r=>setTimeout(r,1200));
  console.log('=== 点击 1855 之后 ===');
  console.log(JSON.stringify(await diaryGeom(), null, 1));

  // 用 DOM 直接判断谁在最上层（会接收点击）
  const hit = await page.evaluate(()=>{
    const book = document.getElementById('diaryBook');
    const r = book.getBoundingClientRect();
    const x = r.left + r.width*0.5, y = r.top + r.height*0.5;
    const top = document.elementFromPoint(x, y);
    return {x:Math.round(x), y:Math.round(y),
      topEl: top ? (top.tagName + '.' + (top.className||'')) : null,
      topPage: top && top.closest ? (top.closest('.diary__page')||{}).dataset?.page : null};
  });
  console.log('=== 书页中心点上是谁 ===');
  console.log(JSON.stringify(hit));

  // 再点 1879（跨越多个）
  await yrs[5].click();
  await new Promise(r=>setTimeout(r,1200));
  const after = await page.evaluate(()=>{
    const f = document.querySelector('.diary__page.is-front');
    const bk = [...document.querySelectorAll('.diary__page.is-back')].map(p=>p.dataset.page);
    return {front: f ? f.dataset.page : null, back: bk,
      frontH: f ? Math.round(f.getBoundingClientRect().height) : null,
      bookH: Math.round(document.getElementById('diaryBook').getBoundingClientRect().height)};
  });
  console.log('=== 点击 1879 之后 ===');
  console.log(JSON.stringify(after));

  // ---------- 课本翻牌 ----------
  await page.evaluate(()=>{
    const el = document.querySelector('#textbook');
    const r = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 60);
  });
  await new Promise(r=>setTimeout(r,600));
  const tbGeom = await page.evaluate(()=>{
    const grid = document.getElementById('tbGrid');
    const gr = grid.getBoundingClientRect();
    const cards = [...grid.querySelectorAll('.tb')].map(t=>{
      const r = t.getBoundingClientRect();
      const inner = t.querySelector('.tb__inner').getBoundingClientRect();
      const front = t.querySelector('.tb__f').getBoundingClientRect();
      const h4 = t.querySelector('h4');
      const h4r = h4.getBoundingClientRect();
      return {w:Math.round(r.width), h:Math.round(r.height),
        innerW:Math.round(inner.width), innerH:Math.round(inner.height),
        frontW:Math.round(front.width), frontH:Math.round(front.height),
        h4W:Math.round(h4r.width), h4H:Math.round(h4r.height),
        h4Text: h4.textContent.slice(0,10)};
    });
    const firstCard = grid.querySelector('.tb');
    const cr = firstCard.getBoundingClientRect();
    const cx = cr.left+cr.width*0.5, cy = cr.top+cr.height*0.5;
    const top = document.elementFromPoint(cx, cy);
    return {gridW:Math.round(gr.width), gridH:Math.round(gr.height), cards,
      hitAt:{x:Math.round(cx),y:Math.round(cy),
        el: top ? top.tagName+'.'+(top.className||'') : null,
        inCard: top ? !!top.closest('.tb') : false}};
  });
  console.log('=== 课本翻牌 ===');
  console.log(JSON.stringify(tbGeom, null, 1));
  await browser.close();
})();
