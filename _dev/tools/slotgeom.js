const puppeteer=require('puppeteer-core');
(async()=>{
  const b=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const p=await b.newPage(); await p.setCacheEnabled(false);
  await p.setViewport({width:1440,height:900});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///D:/008Code/018Tol/index.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1500));
  const r=await p.evaluate(()=>({
    slots:[...document.querySelectorAll('.slot')].map(s=>{
      const b=s.getBoundingClientRect();
      return {slot:s.dataset.slot, w:Math.round(b.width), h:Math.round(b.height), ar:(b.width/b.height).toFixed(3)};
    }),
    overflowX: document.documentElement.scrollWidth-window.innerWidth,
    hasLabel: document.querySelectorAll('.slot__label').length
  }));
  console.log('占位块宽高：');
  r.slots.forEach(s=>console.log(`  ${s.slot}  ${String(s.w).padStart(4)}×${String(s.h).padStart(4)}  比例 ${s.ar}`));
  console.log('横向溢出:', r.overflowX, ' 占位文字块:', r.hasLabel, ' 错误:', errs.length);
  await b.close();
})();
