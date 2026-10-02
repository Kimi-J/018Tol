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
  await new Promise(r=>setTimeout(r,1200));
  const out = await page.evaluate(()=>{
    // 在页面里重建同样的插值，逐段打印
    const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
    const mix=(a,b,t)=>a+(b-a)*t;
    const smooth=t=>t*t*(3-2*t);
    const pts=[];
    for(let k=0;k<7;k++){ pts.push({r:38+0,f:38+0,y:k/6*1000}); }
    const segs=[];
    for(let k=0;k<6;k++){
      const p0=pts[Math.max(0,k-1)],p1=pts[k],p2=pts[k+1],p3=pts[Math.min(6,k+2)];
      const c1y=p1.y+(p2.y-p0.y)/6, c2y=p2.y-(p3.y-p1.y)/6;
      const c1r=p1.r+(p2.r-p0.r)/6, c2r=p2.r-(p3.r-p1.r)/6;
      segs.push(`k=${k} p1y=${p1.y.toFixed(1)} c1r=${c1r.toFixed(2)} c1y=${c1y.toFixed(1)} c2r=${c2r.toFixed(2)} c2y=${c2y.toFixed(1)} p2y=${p2.y.toFixed(1)}`);
    }
    return {segs, hasFn: typeof window.__TLT};
  });
  console.log(out.segs.join('\n'));
  console.log('__TLT keys:', JSON.stringify(out.hasFn));
  await browser.close();
})();
