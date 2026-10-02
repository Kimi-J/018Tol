const puppeteer=require('puppeteer-core');
(async()=>{
  const b=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const p=await b.newPage(); await p.setCacheEnabled(false);
  await p.setViewport({width:1440,height:900});
  await p.goto('file:///D:/008Code/018Tol/index.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1800));
  const res = await p.evaluate(()=>{
    const bad = ['尚未逐字核对','未逐字取得','本轮调研未','待补','待调研组','未能核实'];
    const hits = [];
    document.querySelectorAll('.diary__page').forEach(pg=>{
      const t = pg.innerText;
      bad.forEach(s=>{ if(t.includes(s)) hits.push({year:pg.dataset.page, text:s}); });
    });
    const pages = [...document.querySelectorAll('.diary__page')].map(pg=>({
      year: pg.dataset.page,
      len: pg.innerText.replace(/\s+/g,'').length,
      hasCite: !!pg.querySelector('.cite'),
      preview: pg.innerText.replace(/\s+/g,' ').slice(0,44)
    }));
    return {pages, hits};
  });
  console.log('日记页数:', res.pages.length);
  res.pages.forEach(x=>console.log(`  ${x.year.padEnd(6)} ${String(x.len).padStart(4)}字 cite=${x.hasCite?'有':'无'}  ${x.preview}`));
  console.log('含「未核对」类措辞的页:', res.hits.length ? JSON.stringify(res.hits) : '无');
  await b.close();
})();
