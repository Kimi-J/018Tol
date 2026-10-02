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
  const rows = [];
  for (let i=0;i<=12;i++){
    const f = i/12;
    await page.evaluate(f => window.scrollTo(0, Math.round((document.documentElement.scrollHeight-innerHeight)*f)), f);
    await new Promise(r=>setTimeout(r,450));
    const st = await page.evaluate(()=>{
      const r = document.getElementById('rail-reason').getAttribute('d');
      const fa = document.getElementById('rail-faith').getAttribute('d');
      // 取每条线的 x 值序列（跳过 y），比较两线是否分离
      const xs = d => (d.match(/(?:^|[ ,])(-?\d+\.\d+),/g)||[]).map(s=>parseFloat(s.replace(/[ ,]/g,''))).filter((_,i)=>i%2===0);
      const xr = xs(r), xf = xs(fa);
      let maxSep = 0;
      for (let k=0;k<Math.min(xr.length,xf.length);k++) maxSep = Math.max(maxSep, Math.abs(xr[k]-xf[k]));
      return {
        label: document.getElementById('actLabel').textContent,
        sky: getComputedStyle(document.documentElement).getPropertyValue('--sky').trim(),
        maxSep: +maxSep.toFixed(2),
        rTail: r.slice(-24)
      };
    });
    rows.push({pct: Math.round(f*100), ...st});
  }
  console.table(rows);
  const seps = rows.map(r=>r.maxSep);
  console.log('分离度范围:', Math.min(...seps), '→', Math.max(...seps));
  console.log('天空色变化数:', new Set(rows.map(r=>r.sky)).size, '/', rows.length);
  console.log('章节标签序列:', rows.map(r=>r.label).join(' → '));
  await browser.close();
})();
