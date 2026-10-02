const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1500));

  // ---------- 日记：逐个点击每一个年份按钮 ----------
  await page.evaluate(()=>{
    const r = document.querySelector('.diary').getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 80);
  });
  await new Promise(r=>setTimeout(r,500));

  const front = ()=>page.evaluate(()=>{
    const f = document.querySelector('.diary__page.is-front');
    const backs = [...document.querySelectorAll('.diary__page.is-back')].map(p=>p.dataset.page);
    const pressed = [...document.querySelectorAll('.diary__yr[aria-pressed="true"]')].map(b=>b.dataset.year);
    return {front: f?f.dataset.page:null, frontCount: document.querySelectorAll('.diary__page.is-front').length,
      backCount: backs.length, pressed};
  });

  const n = await page.evaluate(()=>document.querySelectorAll('.diary__yr').length);
  console.log('年份按钮总数:', n);
  let pass = 0, fail = [];
  for (let i=0;i<n;i++){
    const want = await page.evaluate(i=>document.querySelectorAll('.diary__yr')[i].dataset.year, i);
    await page.evaluate(i=>document.querySelectorAll('.diary__yr')[i].click(), i);
    await new Promise(r=>setTimeout(r,850));
    const st = await front();
    const ok = st.front === want && st.frontCount === 1 && st.backCount <= 1 && st.pressed[0] === want;
    if (ok) pass++; else fail.push(`第${i}个按钮(${want}) → front=${st.front} frontCount=${st.frontCount} back=${st.backCount} pressed=${st.pressed}`);
  }
  console.log(`日记翻页: ${pass}/${n} 通过`);
  fail.forEach(f=>console.log('  FAIL ' + f));

  // 相邻跳转 + 键盘
  await page.evaluate(()=>{ document.querySelectorAll('.diary__yr')[0].click(); });
  await new Promise(r=>setTimeout(r,800));
  await page.evaluate(()=>document.getElementById('diaryBook').focus());
  await page.keyboard.press('ArrowRight');
  await new Promise(r=>setTimeout(r,800));
  await page.keyboard.press('ArrowRight');
  await new Promise(r=>setTimeout(r,800));
  console.log('键盘右箭头两次后:', JSON.stringify(await front()));

  const bookH = await page.evaluate(()=>Math.round(document.getElementById('diaryBook').getBoundingClientRect().height));
  console.log('书页容器高度:', bookH);

  // ---------- 课本翻牌 ----------
  await page.evaluate(()=>{
    const r = document.querySelector('#textbook').getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 60);
  });
  await new Promise(r=>setTimeout(r,500));
  const tbGeom = await page.evaluate(()=>{
    const grid = document.getElementById('tbGrid');
    return [...grid.querySelectorAll('.tb')].map(t=>{
      const inner = t.querySelector('.tb__inner').getBoundingClientRect();
      const front = t.querySelector('.tb__f').getBoundingClientRect();
      const title = t.querySelector('.tb__title').getBoundingClientRect();
      const body  = t.querySelector('.tb__body').getBoundingClientRect();
      const r = t.getBoundingClientRect();
      return {card:[Math.round(r.width),Math.round(r.height)],
        inner:[Math.round(inner.width),Math.round(inner.height)],
        front:[Math.round(front.width),Math.round(front.height)],
        title:[Math.round(title.width),Math.round(title.height)],
        body:[Math.round(body.width),Math.round(body.height)],
        titleText:t.querySelector('.tb__title').textContent};
    });
  });
  console.log('=== 课本卡尺寸 ===');
  tbGeom.forEach(g=>console.log(JSON.stringify(g)));

  // 真实点击翻牌
  const tbN = await page.evaluate(()=>document.querySelectorAll('.tb').length);
  let tbPass=0, tbFail=[];
  for (let i=0;i<tbN;i++){
    await page.evaluate(i=>document.querySelectorAll('.tb')[i].click(), i);
    await new Promise(r=>setTimeout(r,750));
    const flipped = await page.evaluate(i=>{
      const t = document.querySelectorAll('.tb')[i];
      return {flip:t.classList.contains('flip'), pressed:t.getAttribute('aria-pressed')};
    }, i);
    if (flipped.flip && flipped.pressed==='true') tbPass++; else tbFail.push(`第${i}张 flip=${flipped.flip} pressed=${flipped.pressed}`);
  }
  console.log(`课本翻牌: ${tbPass}/${tbN} 通过`);
  tbFail.forEach(f=>console.log('  FAIL ' + f));

  // 再点一次翻回
  await page.evaluate(()=>document.querySelectorAll('.tb')[0].click());
  await new Promise(r=>setTimeout(r,750));
  console.log('再点第一张（应翻回）:', JSON.stringify(await page.evaluate(()=>{
    const t=document.querySelectorAll('.tb')[0];
    return {flip:t.classList.contains('flip'), pressed:t.getAttribute('aria-pressed')};
  })));

  console.log('页面错误:', errs.length, [...new Set(errs)].slice(0,3));
  await browser.close();
})();
