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
  await new Promise(r=>setTimeout(r,2000));

  const rep = await page.evaluate(()=>{
    const txt = e => (e.innerText||'').trim();
    const all = [...document.querySelectorAll('blockquote, .quote, .cite, .conf, [class*="quote"]')];
    // 统计各类元素
    const confs = [...document.querySelectorAll('.conf')];
    const byType = {};
    confs.forEach(c=>{ const t = (c.textContent||'').trim(); byType[t] = (byType[t]||0)+1; });
    // 每个 scene 的正文长度（排除引文/档案件）
    const scenes = [...document.querySelectorAll('section, .gal__block')].map(s=>{
      const clone = s.cloneNode(true);
      clone.querySelectorAll('blockquote, .quote, .cite, .conf-panel, .slot, svg, canvas').forEach(e=>e.remove());
      const n = (clone.innerText||'').replace(/\s+/g,'').length;
      return {id: s.id || s.className.split(' ')[0], chars: n};
    }).filter(s=>s.chars>0);
    const longScenes = scenes.filter(s=>s.chars>400).sort((a,b)=>b.chars-a.chars).slice(0,8);
    // 签名互动计数（按可交互元素）
    const interactive = {
      buttons: document.querySelectorAll('button').length,
      ranges: document.querySelectorAll('input[type=range]').length,
      canvases: document.querySelectorAll('canvas').length,
      sliders: document.querySelectorAll('[role=slider]').length,
      canvasesWithLabel: [...document.querySelectorAll('canvas')].filter(c=>c.getAttribute('aria-label')).length
    };
    // 序列图/引文计数
    const quotes = document.querySelectorAll('blockquote, .quote, .candle__l, .sky__l, .zwei__l, .bag__text p').length;
    const slots = document.querySelectorAll('.slot').length;
    const numcards = document.querySelectorAll('.numcard').length;
    const echoes = document.querySelectorAll('.echo').length;
    const papers = document.querySelectorAll('.paper').length;
    const tbl = document.querySelectorAll('.tb').length;
    const tlItems = document.querySelectorAll('.tl__item').length;
    return {
      conf: confs.length, confTypes: byType,
      quotes, slots, numcards, echoes, papers, tbl, tlItems,
      interactive,
      longScenes,
      totalTextChars: document.body.innerText.replace(/\s+/g,'').length,
      pTags: document.querySelectorAll('p').length
    };
  });
  console.log(JSON.stringify(rep, null, 2));
  await browser.close();
})();
