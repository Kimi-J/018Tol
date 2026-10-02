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
  await new Promise(r=>setTimeout(r,1800));

  for (const i of [5, 6, 27, 0]){
    await page.evaluate(i=>document.querySelectorAll('.conf')[i].scrollIntoView({block:'center'}), i);
    await new Promise(r=>setTimeout(r,300));
    const d = await page.evaluate(i=>{
      const e=document.querySelectorAll('.conf')[i];
      const r=e.getBoundingClientRect();
      const cx=r.x+r.width/2, cy=r.y+r.height/2;
      const stack=document.elementsFromPoint(cx,cy).slice(0,6).map(t=>{
        const cls=(t.className&&t.className.baseVal!==undefined?t.className.baseVal:(t.className||'')).toString();
        return t.tagName+'.'+cls.split(' ')[0];
      });
      // 这个 conf 的祖先链上有没有 pointer-events:none
      const chain=[]; let p=e;
      while(p && p!==document.body){
        const cs=getComputedStyle(p);
        chain.push({tag:p.tagName, cls:((p.className&&p.className.baseVal!==undefined?p.className.baseVal:(p.className||''))+'').split(' ')[0],
          pe:cs.pointerEvents, op:cs.opacity});
        p=p.parentElement;
      }
      return {idx:i, txt:e.textContent.trim().slice(0,10), rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
        cx:Math.round(cx), cy:Math.round(cy), stack, chain,
        selfPE:getComputedStyle(e).pointerEvents,
        // 该元素是否被 JS 挂了监听（用 getEventListeners 不可用于页面，改用标记）
        wired: e.hasAttribute('role'), role: e.getAttribute('role'), aria: e.getAttribute('aria-expanded')};
    }, i);
    console.log(JSON.stringify(d, null, 1));
    console.log('---');
  }
  await browser.close();
})();
