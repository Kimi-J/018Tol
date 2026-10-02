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

  // 用真实鼠标坐标点击（page.mouse.click 走完整命中测试链）
  const n = await page.evaluate(()=>document.querySelectorAll('.diary__yr').length);
  console.log('按钮数:', n);

  for (let round=1; round<=2; round++){
    console.log(`--- 第 ${round} 轮（真实鼠标点击）---`);
    for (let i=0;i<n;i++){
      const box = await page.evaluate(i=>{
        const b = document.querySelectorAll('.diary__yr')[i];
        const r = b.getBoundingClientRect();
        return {x:r.x+r.width/2, y:r.y+r.height/2, year:b.dataset.year,
          w:Math.round(r.width), h:Math.round(r.height)};
      }, i);
      // 先看这个坐标上最上层是谁
      const top = await page.evaluate((x,y)=>{
        const e = document.elementFromPoint(x,y);
        return e ? (e.tagName + '.' + (e.className||'') + (e.dataset&&e.dataset.year?('['+e.dataset.year+']'):'')) : null;
      }, box.x, box.y);
      const clickable = top && top.startsWith('BUTTON.diary__yr');
      if (!clickable){
        console.log(`  [${box.year}] 坐标(${Math.round(box.x)},${Math.round(box.y)}) 被遮挡 → 最上层是 ${top}`);
        continue;
      }
      await page.mouse.click(box.x, box.y);
      await new Promise(r=>setTimeout(r,800));
      const st = await page.evaluate(()=>({
        front: (document.querySelector('.diary__page.is-front')||{dataset:{}}).dataset.page,
        pressed: [...document.querySelectorAll('.diary__yr[aria-pressed="true"]')].map(b=>b.dataset.year)
      }));
      const ok = st.front === box.year;
      if(!ok) console.log(`  [${box.year}] 点击后 front=${st.front} pressed=${st.pressed}  ← 失败`);
    }
    const final = await page.evaluate(()=>({
      front: (document.querySelector('.diary__page.is-front')||{dataset:{}}).dataset.page,
      pressed: [...document.querySelectorAll('.diary__yr[aria-pressed="true"]')].map(b=>b.dataset.year)
    }));
    console.log(`  轮末: front=${final.front} pressed=${final.pressed}`);
  }

  // 诊断：.diary__page 的 is-back / 无类状态是否覆盖了按钮区域
  const diag = await page.evaluate(()=>{
    const yrsBox = document.querySelector('.diary__dial').getBoundingClientRect();
    const out = [];
    document.querySelectorAll('.diary__page').forEach(p=>{
      const r = p.getBoundingClientRect();
      const cs = getComputedStyle(p);
      // 是否与该区域相交
      const overlap = !(r.right < yrsBox.left || r.left > yrsBox.right || r.bottom < yrsBox.top || r.top > yrsBox.bottom);
      if (overlap || cs.opacity !== '0') {
        out.push({year:p.dataset.page, cls:p.className.replace('diary__page','').trim(),
          box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
          opacity:cs.opacity, pe:cs.pointerEvents, transform:cs.transform.slice(0,42),
          overlapsDial: overlap});
      }
    });
    return {dial:[Math.round(yrsBox.x),Math.round(yrsBox.y),Math.round(yrsBox.width),Math.round(yrsBox.height)], pages: out};
  });
  console.log('=== 诊断 ===');
  console.log('dial 区域:', JSON.stringify(diag.dial));
  diag.pages.forEach(p=>console.log('  ', JSON.stringify(p)));
  await browser.close();
})();
