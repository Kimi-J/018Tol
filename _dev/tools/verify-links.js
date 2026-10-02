// 互链验证：主页面 ↔ 心灵辩证法专题页
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = 'D:/008Code/018Tol';
const MAIN = 'file:///' + ROOT + '/index.html';
const SUB  = 'file:///' + ROOT + '/%E5%BF%83%E7%81%B5%E8%BE%A9%E8%AF%81%E6%B3%95-%E6%89%98%E5%B0%94%E6%96%AF%E6%B3%B0.html';

let bad = 0;
const ok = m => console.log('  OK   ' + m);
const err = m => { bad++; console.log('  FAIL ' + m); };
const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});

  // ---------- 主页面：确认跳转入口 ----------
  console.log('\n[1] 主页面 index.html');
  {
    const p = await browser.newPage();
    await p.setCacheEnabled(false);
    await p.setViewport({width:1440, height:900});
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
    await p.goto(MAIN,{waitUntil:'load'});
    await sleep(1800);

    const info = await p.evaluate(()=>{
      const a = document.querySelector('.go-deep__btn');
      const sec = document.getElementById('dialectics');
      if(!a) return {found:false};
      a.scrollIntoView({block:'center'});
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      return {found:true, href:a.getAttribute('href'), text:a.innerText.replace(/\s+/g,' ').trim(),
        hasSection: !!sec,
        box:[Math.round(r.width),Math.round(r.height)],
        display:cs.display, cursor:cs.cursor,
        // 命中测试：中心点上最上层是不是这个链接本身
        hitTop: (()=>{ const t=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
          return t ? (t.closest('.go-deep__btn')===a) : false; })(),
        overflowX: document.documentElement.scrollWidth - window.innerWidth};
    });
    if(!info.found) err('主页面找不到 .go-deep__btn');
    else {
      info.href === '心灵辩证法-托尔斯泰.html'
        ? ok('href 正确 → ' + info.href) : err('href 为 ' + info.href);
      info.hasSection ? ok('锚点 #dialectics 存在') : err('缺少 id="dialectics"');
      info.hitTop ? ok('入口可点（真实命中测试通过）') : err('入口被遮挡');
      console.log(`       文字「${info.text}」  尺寸 ${info.box[0]}×${info.box[1]}`);
    }
    info.overflowX <= 0 ? ok('无横向滚动条') : err('横向溢出 ' + info.overflowX + 'px');
    errs.length===0 ? ok('控制台 0 错误') : err(errs.length+' 条错误: '+[...new Set(errs)].slice(0,2).join(' | '));

    // 真实点击跳转
    if (info.found){
      await p.evaluate(()=>document.querySelector('.go-deep__btn').scrollIntoView({block:'center'}));
      await sleep(400);
      const box = await p.evaluate(()=>{ const r=document.querySelector('.go-deep__btn').getBoundingClientRect();
        return {x:r.x+r.width/2, y:r.y+r.height/2}; });
      await Promise.all([
        p.waitForNavigation({waitUntil:'load', timeout:15000}).catch(()=>null),
        p.mouse.click(box.x, box.y)
      ]);
      await sleep(1500);
      const url = p.url();
      const landed = await p.evaluate(()=>({
        title: document.title,
        hasBack: !!document.querySelector('.back-home')
      }));
      /心灵辩证法/.test(decodeURIComponent(url))
        ? ok('点击后确实跳到了专题页') : err('点击后 URL 为 ' + decodeURIComponent(url));
      landed.hasBack ? ok('落地页有返回入口') : err('落地页没有 .back-home');
      console.log('       落地页标题：' + landed.title);
    }
    await p.close();
  }

  // ---------- 专题页：确认返回入口 ----------
  console.log('\n[2] 专题页 心灵辩证法-托尔斯泰.html');
  {
    const p = await browser.newPage();
    await p.setCacheEnabled(false);
    await p.setViewport({width:1440, height:900});
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
    await p.goto(SUB,{waitUntil:'load'});
    await sleep(1800);

    const info = await p.evaluate(()=>{
      const a = document.querySelector('.back-home');
      if(!a) return {found:false};
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      return {found:true, href:a.getAttribute('href'), text:a.innerText.replace(/\s+/g,' ').trim(),
        visible: r.width>10 && r.height>10 && r.top>=0,
        box:[Math.round(r.width),Math.round(r.height)],
        color:cs.color, border:cs.borderTopWidth+' '+cs.borderTopColor,
        hitTop:(()=>{ const t=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
          return t ? (t.closest('.back-home')===a) : false; })(),
        overflowX: document.documentElement.scrollWidth - window.innerWidth};
    });
    if(!info.found) err('专题页找不到 .back-home');
    else {
      info.href === 'index.html' ? ok('href 正确 → index.html') : err('href 为 ' + info.href);
      info.visible ? ok(`可见且尺寸正常 ${info.box[0]}×${info.box[1]}`) : err('不可见或尺寸为 0');
      info.hitTop ? ok('可点（真实命中测试通过）') : err('被遮挡');
      console.log(`       文字「${info.text}」  颜色 ${info.color}  边框 ${info.border}`);
    }
    info.overflowX <= 0 ? ok('无横向滚动条') : err('横向溢出 ' + info.overflowX + 'px');
    errs.length===0 ? ok('控制台 0 错误') : err(errs.length+' 条错误: '+[...new Set(errs)].slice(0,2).join(' | '));

    // 滚动到中部：顶部导航按设计上滑隐藏，此时应由「常驻角标」接管
    await p.evaluate(()=>window.scrollTo(0, document.documentElement.scrollHeight*0.45));
    await sleep(1000);
    const mid = await p.evaluate(()=>{
      const c = document.getElementById('backCorner');
      if (!c) return {found:false};
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return {found:true, on:c.classList.contains('on'), top:Math.round(r.top),
        w:Math.round(r.width), h:Math.round(r.height),
        opacity:cs.opacity, pe:cs.pointerEvents,
        hit:(()=>{ const t=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
          return t ? t.closest('.back-corner')===c : false; })()};
    });
    if (!mid.found) err('缺少常驻返回角标 #backCorner');
    else if (!mid.on) err('滚动到中部后角标未出现');
    else if (!mid.hit) err('中部角标被遮挡');
    else ok(`滚动到中部后角标出现且可点（${mid.w}×${mid.h} @top=${mid.top}）`);

    // 真实点击角标返回
    const box = await p.evaluate(()=>{ const r=document.querySelector('.back-corner').getBoundingClientRect();
      return {x:r.x+r.width/2, y:r.y+r.height/2}; });
    await Promise.all([
      p.waitForNavigation({waitUntil:'load', timeout:15000}).catch(()=>null),
      p.mouse.click(box.x, box.y)
    ]);
    await sleep(1500);
    const url = decodeURIComponent(p.url());
    /index\.html$/.test(url) ? ok('点角标后确实返回主页面') : err('点角标后 URL 为 ' + url);
    await p.close();
  }

  // ---------- 窄屏 ----------
  console.log('\n[3] 窄屏 390px：两页的导航都不溢出');
  for (const [name, url] of [['主页面', MAIN], ['专题页', SUB]]){
    const p = await browser.newPage();
    await p.setCacheEnabled(false);
    await p.setViewport({width:390, height:844, isMobile:true, hasTouch:true, deviceScaleFactor:2});
    await p.goto(url,{waitUntil:'load'});
    await sleep(1600);
    const r = await p.evaluate(()=>{
      const sel = document.querySelector('.go-deep__btn') || document.querySelector('.back-home');
      const box = sel ? sel.getBoundingClientRect() : null;
      return {overflowX: document.documentElement.scrollWidth - window.innerWidth,
        navOverflow: (()=>{ const n=document.getElementById('nav');
          return n ? n.scrollWidth - n.clientWidth : 0; })(),
        linkW: box ? Math.round(box.width) : null,
        linkVisible: box ? box.width>10 : false};
    });
    (r.overflowX<=0) ? ok(`${name} 无横向滚动条`)
      : err(`${name} 横向溢出 ${r.overflowX}px`);
    (r.linkVisible) ? ok(`${name} 入口在窄屏可见（宽 ${r.linkW}px）`)
      : err(`${name} 入口在窄屏不可见`);
    await p.close();
  }

  await browser.close();
  console.log('\n' + '─'.repeat(56));
  console.log(bad===0 ? '全部通过 —— 双向跳转可用。' : `有 ${bad} 项未通过。`);
  process.exit(bad===0?0:1);
})();
