const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';

// 全站真实鼠标审计：把每个可交互元素滚进视口，用真实坐标点它，看是否命中自己
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1800));

  const targets = await page.evaluate(()=>{
    const sel = 'button, input, [role="slider"], [tabindex="0"]:not(body)';
    return [...document.querySelectorAll(sel)]
      .map((e,i)=>({i, tag:e.tagName,
        cls:(e.className&&e.className.baseVal!==undefined?e.className.baseVal:(e.className||'')).toString().slice(0,34),
        id:e.id||'', disabled:e.disabled===true}))
      .filter(t=>!t.disabled);
  });
  console.log('可交互元素总数:', targets.length);

  const blocked = [];
  for (const t of targets){
    // 滚到该元素可见
    const ok = await page.evaluate(i=>{
      const els=[...document.querySelectorAll('button, input, [role="slider"], [tabindex="0"]:not(body)')];
      const e=els[i]; if(!e) return false;
      const r=e.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - innerHeight*0.45);
      return true;
    }, t.i);
    if(!ok) continue;
    await new Promise(r=>setTimeout(r,420));
    const probe = await page.evaluate(i=>{
      const els=[...document.querySelectorAll('button, input, [role="slider"], [tabindex="0"]:not(body)')];
      const e=els[i]; if(!e) return null;
      const r=e.getBoundingClientRect();
      if (r.width<3||r.height<3) return {skip:true};
      if (r.bottom<0||r.top>innerHeight) return {offscreen:true};
      const cx=r.x+r.width*0.5, cy=Math.min(Math.max(r.y+r.height*0.5,2), innerHeight-2);
      const top=document.elementFromPoint(cx,cy);
      const hit = top && (top===e || e.contains(top) ||
        (top.closest && top.closest('button,input,[role="slider"],[tabindex="0"]')===e) ||
        (e.closest && e.contains(top)) ||
        // .conf 这类元素：其出处行 .cite 是它的子元素，点到子元素也算命中
        (top.closest && top.closest('.conf')===e) ||
        (e.querySelector && e.contains(top)));
      return {hit:!!hit, cx:Math.round(cx), cy:Math.round(cy),
        topEl: top? (top.tagName+'.'+((top.className&&top.className.baseVal!==undefined?top.className.baseVal:(top.className||''))+'').slice(0,38)) : null};
    }, t.i);
    if (probe && probe.hit===false) blocked.push({...t, ...probe});
  }

  console.log(`被遮挡 / 点不到的元素: ${blocked.length}`);
  blocked.slice(0,20).forEach(b=>console.log(`  ${b.tag}${b.id?'#'+b.id:''}.${b.cls} 坐标(${b.cx},${b.cy}) 最上层=${b.topEl}`));
  console.log('页面错误:', errs.length, [...new Set(errs)].slice(0,3));
  await browser.close();
})();
