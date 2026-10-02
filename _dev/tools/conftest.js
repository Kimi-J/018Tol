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

  const n = await page.evaluate(()=>document.querySelectorAll('.conf').length);
  console.log('.conf 总数:', n);
  let pass=0; const fails=[];
  for (let i=0;i<n;i++){
    // 精确把该元素滚到视口中央，再取坐标
    const info = await page.evaluate(i=>{
      const e=document.querySelectorAll('.conf')[i];
      e.scrollIntoView({block:'center'});
      return null;
    }, i);
    await new Promise(r=>setTimeout(r,350));
    const box = await page.evaluate(i=>{
      const e=document.querySelectorAll('.conf')[i];
      const r=e.getBoundingClientRect();
      return {x:r.x+r.width/2, y:r.y+r.height/2, w:r.width, h:r.height,
        pe:getComputedStyle(e).pointerEvents, peParent:getComputedStyle(e.parentElement).pointerEvents,
        txt:e.textContent.trim().slice(0,12)};
    }, i);
    if (box.w<2||box.h<2||box.y<2||box.y>898){ fails.push(`${i}「${box.txt}」不可见或过小`); continue; }
    // 先确认坐标上最上层是谁
    const topDesc = await page.evaluate((x,y)=>{
      const t=document.elementFromPoint(x,y);
      if(!t) return null;
      const cls=(t.className&&t.className.baseVal!==undefined?t.className.baseVal:(t.className||'')).toString();
      return {tag:t.tagName, cls:cls.slice(0,30), isConf:t.classList.contains('conf'),
        confIdx:[...document.querySelectorAll('.conf')].indexOf(t.closest('.conf'))};
    }, box.x, box.y);
    // 真实点击
    await page.mouse.click(box.x, box.y);
    await new Promise(r=>setTimeout(r,320));
    const expanded = await page.evaluate(i=>{
      const e=document.querySelectorAll('.conf')[i];
      const next=e.nextElementSibling;
      return {aria:e.getAttribute('aria-expanded'),
        hasPanel: !!(next && next.classList.contains('conf-panel')),
        panelCount: document.querySelectorAll('.conf-panel').length};
    }, i);
    const ok = expanded.hasPanel;
    if(ok) pass++; else fails.push(`${i}「${box.txt}」 pe=${box.pe}/${box.peParent} top=${topDesc?topDesc.tag+'.'+topDesc.cls:'?'} aria=${expanded.aria}`);
    // 收起来，避免面板累积影响后续
    await page.evaluate(i=>{
      const e=document.querySelectorAll('.conf')[i];
      const next=e.nextElementSibling;
      if(next && next.classList.contains('conf-panel')) next.remove();
      e.setAttribute('aria-expanded','false');
    }, i);
    await new Promise(r=>setTimeout(r,120));
  }
  console.log(`可信度标注真实点击: ${pass}/${n} 通过`);
  fails.slice(0,10).forEach(f=>console.log('  FAIL ' + f));
  await browser.close();
})();
