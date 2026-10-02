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
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.goto(URL, {waitUntil:'load'});
  await sleep(1800);

  await page.evaluate(()=>{
    const r = document.querySelector('.diary').getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 60);
  });
  await sleep(600);

  const years = await page.evaluate(()=>[...document.querySelectorAll('.diary__yr')].map(b=>b.dataset.year));
  console.log('年份:', years.join(' '));

  let pass=0; const fails=[];
  // 两轮，含乱序
  const orders = [years, [...years].reverse()];
  for (let round=0; round<orders.length; round++){
    for (const y of orders[round]){
      // 等上一步过渡完全结束（transition 760ms）
      await sleep(700);
      const box = await page.evaluate(y=>{
        const b=[...document.querySelectorAll('.diary__yr')].find(x=>x.dataset.year===y);
        const r=b.getBoundingClientRect();
        return {x:r.x+r.width/2, y:r.y+r.height/2,
          top: (()=>{const t=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
            return t?t.tagName+'.'+((t.className&&t.className.baseVal!==undefined?t.className.baseVal:(t.className||''))+'').split(' ')[0]:null;})()};
      }, y);
      const okTop = box.top && box.top.startsWith('BUTTON');
      if (!okTop){ fails.push(`轮${round+1} ${y}: 坐标被 ${box.top} 占据`); continue; }
      await page.mouse.click(box.x, box.y);
      await sleep(700);
      const st = await page.evaluate(()=>({
        front:(document.querySelector('.diary__page.is-front')||{dataset:{}}).dataset.page,
        frontCount:document.querySelectorAll('.diary__page.is-front').length,
        pressed:[...document.querySelectorAll('.diary__yr[aria-pressed="true"]')].map(b=>b.dataset.year).join(',')
      }));
      if (st.front===y && st.frontCount===1 && st.pressed===y) pass++;
      else fails.push(`轮${round+1} ${y}: front=${st.front} count=${st.frontCount} pressed=${st.pressed}`);
    }
  }
  console.log(`真实鼠标点击日记年份: ${pass}/${years.length*2} 通过`);
  fails.slice(0,8).forEach(f=>console.log('  FAIL ' + f));
  console.log('页面错误:', errs.length);
  await browser.close();
})();
