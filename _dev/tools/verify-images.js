// 图像补全验收器：给 plan/06 派单文档第 7 节的 B 项用
// 用法：node verify-images.js   （需在本目录已安装 puppeteer-core）
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const INDEX = path.join(ROOT, 'index.html');
const IMGDIR = path.join(ROOT, 'assets', 'img');
const CHROME = process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const EXPECT = [
  ['SLOT-01', '01-tolstoy-1848.jpg',       3/4 ],
  ['SLOT-02', '02-yasnaya-polyana.jpg',    16/9],
  ['SLOT-03', '03-war-and-peace-ms.jpg',   4/3 ],
  ['SLOT-04', '04-ballroom.jpg',           21/9],
  ['SLOT-05', '05-tolstoy-crisis.jpg',     4/5 ],
  ['SLOT-06', '06-tolstoy-1908-color.jpg', 1/1 ],
  ['SLOT-07', '07-astapovo.jpg',           3/1 ],
  ['SLOT-08', '08-grave.jpg',              16/9],
  ['SLOT-09', '09-ploughing.jpg',          3/2 ],
  ['SLOT-10', '10-copying.jpg',            4/3 ]
];

let bad = 0;
const ok  = m => console.log('  OK   ' + m);
const err = m => { bad++; console.log('  FAIL ' + m); };

(async () => {
  const html = fs.readFileSync(INDEX, 'utf8');

  console.log('\n[1] HTML 静态检查');
  // 只数真正的 <div class="slot" …>，不要数 data-slot="SLOT-—— 那个字符串
  // 也出现在 CSS 选择器 .slot[data-slot="SLOT-01"] 里，会双倍计数。
  const slots  = (html.match(/<div class="slot" data-slot="SLOT-/g) || []).length;
  const imgs   = (html.match(/src="assets\/img\//g) || []).length;
  // 注意：也不要 grep slot__label —— 它同时出现在 CSS 规则与注释里。
  // 占位文字是否清干净，交给 [3] 的 DOM 检查（querySelectorAll('.slot__label')）。
  slots === 10 ? ok('10 个 .slot 外壳均保留（尺寸依赖它）') : err(`.slot 外壳数为 ${slots}，应为 10 —— 外壳不可删`);
  imgs === 10 ? ok('index.html 含 10 处 assets/img/ 引用') : err(`assets/img/ 引用数为 ${imgs}，应为 10`);

  const noAlt = [...html.matchAll(/<img[^>]*assets\/img\/[^>]*>/g)]
    .map(m => m[0]).filter(t => !/alt=/.test(t));
  noAlt.length === 0 ? ok('所有 <img> 均有 alt') : err(`${noAlt.length} 个 <img> 缺 alt`);

  const noLazy = [...html.matchAll(/<img[^>]*assets\/img\/[^>]*>/g)]
    .map(m => m[0]).filter(t => !/loading="lazy"/.test(t));
  noLazy.length === 0 ? ok('所有 <img> 均有 loading="lazy"') : err(`${noLazy.length} 个 <img> 缺 loading="lazy"`);

  console.log('\n[2] 文件与宽高比');
  for (const [slot, file, ratio] of EXPECT){
    const p = path.join(IMGDIR, file);
    if (!fs.existsSync(p)){ err(`${slot} 缺文件 ${file}`); continue; }
    const kb = fs.statSync(p).size / 1024;
    if (kb > 2048) err(`${file} 体积 ${kb.toFixed(0)}KB 偏大（建议 ≤1.5MB）`);
    // 读 PNG/JPEG 头拿尺寸
    const dim = readSize(p);
    if (!dim){ err(`${file} 无法读取尺寸`); continue; }
    const r = dim.w / dim.h;
    const dev = Math.abs(r - ratio) / ratio;
    const tag = dev <= 0.01 ? 'OK  ' : 'FAIL';
    if (dev > 0.01){ bad++; }
    console.log(`  ${tag} ${slot} ${file}  ${dim.w}×${dim.h}  (比例 ${r.toFixed(3)} vs 目标 ${ratio.toFixed(3)}, 偏差 ${(dev*100).toFixed(1)}%)  ${kb.toFixed(0)}KB`);
  }

  console.log('\n[3] 浏览器检查');
  let browser;
  try {
    browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
      args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  } catch(e){
    console.log('  SKIP 无法启动 Chrome：' + e.message);
    console.log('       请改为在浏览器中手动确认：控制台无错误、无横向滚动条、10 张图均显示。');
    return finish();
  }
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  const errs = [];
  const failedReq = [];
  page.on('pageerror', e => errs.push('[pageerror] ' + e.message));
  page.on('console', m => { if (m.type()==='error') errs.push('[console] ' + m.text()); });
  page.on('requestfailed', r => { if (/assets\/img\//.test(r.url())) failedReq.push(r.url().split('/').pop()); });
  page.on('response', r => { if (/assets\/img\//.test(r.url()) && r.status() >= 400) failedReq.push(r.url().split('/').pop() + ' HTTP' + r.status()); });

  await page.goto('file:///' + INDEX.replace(/\\/g,'/'), {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1500));

  // 关键：图片是 loading="lazy"，必须先滚到底把它们全部触发加载，否则视口外的
  // naturalWidth 恒为 0，会误报"加载失败"。
  await page.evaluate(async ()=>{
    const step = Math.round(innerHeight*0.8);
    for (let y=0; y<document.documentElement.scrollHeight; y+=step){
      window.scrollTo(0,y);
      await new Promise(r=>setTimeout(r,120));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise(r=>setTimeout(r,600));
  });
  // 等所有 img 完成（成功或失败）
  await page.evaluate(async ()=>{
    const imgs=[...document.querySelectorAll('img[src^="assets/img/"]')];
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(res=>{
      i.addEventListener('load',res,{once:true});
      i.addEventListener('error',res,{once:true});
    })));
  });
  // 回到顶部再量一次布局（横向溢出与滚动位置无关，但保持一致）
  await page.evaluate(()=>window.scrollTo(0,0));
  await new Promise(r=>setTimeout(r,400));

  const res = await page.evaluate(()=>{
    const imgs = [...document.querySelectorAll('img[src^="assets/img/"]')];
    return {
      count: imgs.length,
      loaded: imgs.filter(i=>i.naturalWidth>0).length,
      broken: imgs.filter(i=>i.naturalWidth===0).map(i=>i.getAttribute('src')),
      lazy: imgs.filter(i=>i.getAttribute('loading')==='lazy').length,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      leftoverLabels: document.querySelectorAll('.slot__label').length,
      slots: document.querySelectorAll('.slot').length
    };
  });
  res.count === 10 ? ok('页面找到 10 张图') : err(`页面找到 ${res.count} 张图，应为 10`);
  res.loaded === 10
    ? ok('10 张图全部加载成功（已滚到底触发 lazy 加载）')
    : err(`${res.loaded}/10 加载成功；失败：${res.broken.join(', ')}`);
  res.lazy === 10 ? ok('10 张均使用 loading="lazy"') : err(`仅 ${res.lazy}/10 使用 lazy`);
  res.overflowX <= 0 ? ok('无横向滚动条') : err(`横向溢出 ${res.overflowX}px`);
  res.leftoverLabels === 0 ? ok('DOM 中无残留占位文字') : err(`DOM 仍有 ${res.leftoverLabels} 处占位文字`);
  res.slots === 10 ? ok('DOM 中 10 个 .slot 外壳完好') : err(`DOM 中 .slot 数为 ${res.slots}，应为 10`);
  failedReq.length === 0 ? ok('无图片请求失败') : err(`请求失败：${[...new Set(failedReq)].join(', ')}`);
  errs.length === 0 ? ok('控制台 0 错误') : err(`${errs.length} 条控制台错误：${[...new Set(errs)].slice(0,3).join(' | ')}`);

  await browser.close();
  finish();
})();

function finish(){
  console.log('\n' + '─'.repeat(56));
  if (bad === 0) console.log('全部通过 —— 图像补全完成。');
  else console.log(`有 ${bad} 项未通过，请修复后重跑。`);
  process.exit(bad === 0 ? 0 : 1);
}

// 极简 PNG / JPEG 尺寸读取（不依赖第三方库）
function readSize(p){
  const b = fs.readFileSync(p);
  if (b.length > 24 && b[0]===0x89 && b[1]===0x50)            // PNG
    return {w: b.readUInt32BE(16), h: b.readUInt32BE(20)};
  if (b.length > 4 && b[0]===0xFF && b[1]===0xD8){            // JPEG
    let i = 2;
    while (i < b.length - 9){
      if (b[i] !== 0xFF){ i++; continue; }
      const m = b[i+1];
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC)
        return {h: b.readUInt16BE(i+5), w: b.readUInt16BE(i+7)};
      const len = b.readUInt16BE(i+2);
      i += 2 + len;
    }
  }
  if (b.length > 30 && b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP'){
    const fmt = b.toString('ascii',12,16);
    if (fmt === 'VP8X') return {w: 1 + b.readUIntLE(24,3), h: 1 + b.readUIntLE(27,3)};
    if (fmt === 'VP8 ') return {w: b.readUInt16LE(26) & 0x3FFF, h: b.readUInt16LE(28) & 0x3FFF};
    if (fmt === 'VP8L'){
      const bits = b.readUInt32LE(21);
      return {w: (bits & 0x3FFF) + 1, h: ((bits >> 14) & 0x3FFF) + 1};
    }
  }
  return null;
}
