// 无头浏览器诊断：控制台错误 + 关键元素几何 + 分章截图
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
const OUT = 'D:/008Code/018Tol/assets/shots';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars']
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900, deviceScaleFactor: 1});

  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('[console] ' + m.text()); });
  page.on('pageerror', e => errs.push('[pageerror] ' + e.message));

  await page.goto(URL, {waitUntil: 'load'});
  await new Promise(r => setTimeout(r, 2400));

  const diag = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const box = el => { if (!el) return null; const r = el.getBoundingClientRect();
      return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; };
    const cs = (el, p) => el ? getComputedStyle(el).getPropertyValue(p) : null;
    const cls = e => (e.className && e.className.baseVal !== undefined ? e.className.baseVal : (e.className||'')).toString().split(' ')[0];
    return {
      docHeight: document.documentElement.scrollHeight,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      bodyPadLeft: cs(document.body,'padding-left'),
      eyebrowNum: {pad: cs(q('.eyebrow .eyebrow__num'),'padding'), bg: cs(q('.eyebrow .eyebrow__num'),'background-color')},
      h1: box(q('h1')),
      railReasonD: q('#rail-reason').getAttribute('d').slice(0,150),
      railFaithD: q('#rail-faith').getAttribute('d').slice(0,150),
      railLen: [q('#rail-reason').getTotalLength().toFixed(1), q('#rail-faith').getTotalLength().toFixed(1)],
      scenes: document.querySelectorAll('[data-scene]').length,
      canvases: document.querySelectorAll('canvas').length,
      conf: document.querySelectorAll('.conf').length,
      overflow: [...document.querySelectorAll('body *')].filter(e=>{
        const r = e.getBoundingClientRect();
        return r.width > window.innerWidth + 4 && getComputedStyle(e).position !== 'fixed';
      }).slice(0,14).map(e=>`${e.tagName}.${cls(e)} ${Math.round(e.getBoundingClientRect().width)}`)
    };
  });

  console.log('=== DIAG ===');
  console.log(JSON.stringify(diag, null, 2));
  const uniq = [...new Set(errs)];
  console.log('=== ERRORS: ' + errs.length + ' (unique ' + uniq.length + ') ===');
  uniq.slice(0, 25).forEach(e => console.log(e.slice(0, 220)));

  fs.mkdirSync(OUT, {recursive:true});
  const shots = [
    ['00_prologue', 0.000], ['01_dig', 0.020], ['02_breath', 0.045],
    ['03_act1_estate', 0.075], ['04_diary', 0.105], ['05_cezanne', 0.130],
    ['06_act2', 0.160], ['07_sky', 0.190], ['08_pendulum', 0.235],
    ['09_calculus', 0.265], ['10_act3', 0.300], ['11_epigraph', 0.325],
    ['12_ball', 0.355], ['13_chalk', 0.385], ['14_candle', 0.425],
    ['15_horse', 0.455], ['16_abyss', 0.485], ['17_well', 0.510],
    ['18_syllogism', 0.550], ['19_bag', 0.590], ['20_funeral', 0.625],
    ['21_grass', 0.665], ['22_court', 0.690], ['23_swing', 0.715],
    ['24_kiss', 0.740], ['25_act6', 0.765], ['26_map', 0.795],
    ['27_astapovo', 0.830], ['28_papers', 0.860], ['29_grave', 0.900],
    ['30_loop', 0.940], ['31_last', 0.965], ['32_gallery', 0.980], ['33_timeline', 1.000]
  ];
  for (const [name, frac] of shots) {
    await page.evaluate(f => window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * f)), frac);
    await new Promise(r => setTimeout(r, 850));
    await page.screenshot({path:`${OUT}/${name}.png`});
  }
  console.log('shots: ' + shots.length);
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
