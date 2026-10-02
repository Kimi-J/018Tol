const puppeteer=require('puppeteer-core');
(async()=>{
  const b=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const p=await b.newPage(); await p.setCacheEnabled(false);
  await p.setViewport({width:1440,height:900});
  await p.goto('file:///D:/008Code/018Tol/index.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1800));

  // 先滚到日记区块，再点第 0 个（可见的 front 页里的 conf）
  await p.evaluate(()=>document.getElementById('diaryBook').scrollIntoView({block:'center'}));
  await new Promise(r=>setTimeout(r,400));

  const info = await p.evaluate(()=>{
    const front = document.querySelector('.diary__page.is-front');
    const conf = front.querySelector('.conf');
    const r = conf.getBoundingClientRect();
    const idx = [...document.querySelectorAll('.conf')].indexOf(conf);
    return {frontYear:front.dataset.page, confIdx:idx, confTxt:conf.textContent.trim(),
      rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
      inViewport: r.top>=0 && r.bottom<=innerHeight,
      parentPE:getComputedStyle(conf.parentElement).pointerEvents,
      selfPE:getComputedStyle(conf).pointerEvents};
  });
  console.log('可见页里的 conf:', JSON.stringify(info));
  if (info.inViewport){
    const x = info.rect[0]+info.rect[2]/2, y = info.rect[1]+info.rect[3]/2;
    await p.mouse.click(x,y);
    await new Promise(r=>setTimeout(r,400));
    const after = await p.evaluate(()=>{
      const front=document.querySelector('.diary__page.is-front');
      const c=front.querySelector('.conf');
      const next=c.nextElementSibling;
      return {aria:c.getAttribute('aria-expanded'), hasPanel: !!(next&&next.classList.contains('conf-panel'))};
    });
    console.log('点击后:', JSON.stringify(after));
  }
  await b.close();
})();
