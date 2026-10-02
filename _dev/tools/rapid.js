const puppeteer=require('puppeteer-core');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const p=await b.newPage(); await p.setCacheEnabled(false);
  await p.setViewport({width:1440,height:900});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///D:/008Code/018Tol/index.html',{waitUntil:'load'});
  await sleep(1800);
  await p.evaluate(()=>{const r=document.querySelector('.diary').getBoundingClientRect();
    window.scrollTo(0,window.scrollY+r.top-60);});
  await sleep(500);

  // 5 轮连续点击，轮内只等 120ms（模拟用户快速连点）
  let pass=0,total=0; const fails=[];
  for(let round=0; round<5; round++){
    const seq = round%2 ? ['1910','1847','1879','1855','1895','1862b','1908','1859','1884','1862','1862c','1851']
                        : ['1847','1851','1855','1859','1862','1862b','1862c','1879','1884','1895','1908','1910'];
    for(const y of seq){
      total++;
      const pos = await p.evaluate(y=>{
        const el=[...document.querySelectorAll('.diary__yr')].find(x=>x.dataset.year===y);
        const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
      },y);
      await p.mouse.click(pos.x,pos.y);
      await sleep(120);
      const st=await p.evaluate(()=>({f:(document.querySelector('.diary__page.is-front')||{dataset:{}}).dataset.page,
        n:document.querySelectorAll('.diary__page.is-front').length}));
      if(st.f===y && st.n===1) pass++; else fails.push(`轮${round+1} ${y} → ${st.f}(n=${st.n})`);
    }
    await sleep(900);
  }
  console.log(`快速连点（120ms 间隔）: ${pass}/${total} 通过`);
  fails.slice(0,6).forEach(f=>console.log('  FAIL '+f));
  console.log('错误:',errs.length);
  await b.close();
})();
