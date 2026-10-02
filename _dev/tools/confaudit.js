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

  const confs = await page.evaluate(()=>[...document.querySelectorAll('.conf')].map((e,i)=>({i, txt:e.textContent.trim().slice(0,16)})));
  console.log('conf 总数:', confs.length);
  for (const c of confs){
    await page.evaluate(i=>{
      const e=document.querySelectorAll('.conf')[i];
      const r=e.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - innerHeight*0.45);
    }, c.i);
    await new Promise(r=>setTimeout(r,380));
    const info = await page.evaluate(i=>{
      const e=document.querySelectorAll('.conf')[i];
      const r=e.getBoundingClientRect();
      const cx=r.x+r.width*0.5, cy=Math.min(Math.max(r.y+r.height*0.5,2), innerHeight-2);
      const stack = document.elementsFromPoint(cx,cy).slice(0,5).map(t=>
        t.tagName+'.'+((t.className&&t.className.baseVal!==undefined?t.className.baseVal:(t.className||''))+'').slice(0,30));
      const hit = stack[0] && stack[0].includes('conf');
      const parent = e.parentElement;
      return {hit, stack, parentCls:(parent.className||'').toString().slice(0,40),
        parentPE: getComputedStyle(parent).pointerEvents,
        selfPE: getComputedStyle(e).pointerEvents,
        rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};
    }, c.i);
    if(!info.hit) console.log(`  [${c.i}]「${c.txt}」 rect=${JSON.stringify(info.rect)} parent=.${info.parentCls} parentPE=${info.parentPE} selfPE=${info.selfPE}`);
    if(!info.hit) console.log(`       stack: ${info.stack.join('  >  ')}`);
  }
  await browser.close();
})();
