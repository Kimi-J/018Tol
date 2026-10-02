const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
// 找出所有「不可见但仍接收指针事件」的元素 —— 这类元素会造成"点不动"的隐形遮挡
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1800));

  const scan = async (label)=>{
    const res = await page.evaluate(()=>{
      const out = [];
      const interesting = /diary__page|paper|echo|tb__|card|slot|bag__hole|syl__|__l$|overlay|panel/i;
      document.querySelectorAll('body *').forEach(e=>{
        const cs = getComputedStyle(e);
        if (cs.pointerEvents === 'none') return;
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const op = parseFloat(cs.opacity);
        if (op > 0.02) return;                       // 可见 → 不算
        if (e.getAttribute('aria-hidden') === 'true') return;
        const r = e.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return;     // 太小不算
        const cls = (e.className && e.className.baseVal !== undefined ? e.className.baseVal : (e.className||'')).toString();
        if (!interesting.test(cls) && !interesting.test(e.tagName)) return;
        out.push({tag:e.tagName, cls:cls.slice(0,52), opacity:cs.opacity, pe:cs.pointerEvents,
          box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]});
      });
      return out;
    });
    console.log(`--- ${label} --- 不可见但可点击的元素: ${res.length}`);
    res.slice(0,12).forEach(r=>console.log('  ', JSON.stringify(r)));
    return res;
  };

  await scan('初始（顶部）');

  // 滚到各关键位置再扫
  const spots = [['日记','.diary'],['课本','#textbook'],['回廊·回声','#echo'],['黑袋','.bag'],['终章','.zwei']];
  for (const [name, sel] of spots){
    await page.evaluate(s=>{
      const el = document.querySelector(s);
      if(!el) return;
      const r = el.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top + Math.min(r.height*0.3, 400) - innerHeight*0.5);
    }, sel);
    await new Promise(r=>setTimeout(r,800));
    await scan(name);
  }
  await browser.close();
})();
