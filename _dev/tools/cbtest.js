const puppeteer=require('puppeteer-core');
(async()=>{
  const b=await puppeteer.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--disable-application-cache']});
  const p=await b.newPage();
  await p.setCacheEnabled(false);
  await p.setViewport({width:1440,height:900});
  const cb=Date.now();
  await p.goto('file:///D:/008Code/018Tol/index.html?cb='+cb,{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1500));
  const d=await p.evaluate(()=>document.getElementById('rail-reason').getAttribute('d').slice(0,120));
  console.log('with cb:', d);
  await b.close();
})();
