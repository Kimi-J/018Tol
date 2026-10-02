const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setViewport({width:1440, height:900});
  const msgs = [];
  page.on('console', m => { if (m.type()==='error') msgs.push(m.text()); });
  page.on('pageerror', e => msgs.push('PAGEERROR ' + e.message));
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2500));

  const info = await page.evaluate(()=>{
    const r = document.getElementById('rail-reason').getAttribute('d');
    const bad = [];
    // 找出所有 d 属性里不以命令字母开头的可疑段
    document.querySelectorAll('path[d]').forEach(p=>{
      const d = p.getAttribute('d')||'';
      if (!/^[Mm]/.test(d.trim())) bad.push({id:p.id||p.getAttribute('class'), d:d.slice(0,60)});
      // 检查命令与参数个数
      const segs = d.match(/[A-Za-z][^A-Za-z]*/g)||[];
      segs.forEach(s=>{
        const cmd = s[0], nums = (s.slice(1).match(/-?\d*\.?\d+/g)||[]).length;
        const need = {M:2,L:2,C:6,Z:0,H:1,V:1,A:7}[cmd.toUpperCase()];
        if (need!==undefined && nums % need !== 0) bad.push({id:(p.id||p.getAttribute('class')||'path'), cmd, nums, seg:s.slice(0,70)});
      });
    });
    return {railR: r.slice(-160), railLen: r.length, bad: bad.slice(0,10)};
  });
  console.log('rail tail:', info.railR);
  console.log('rail len:', info.railLen);
  console.log('malformed d:', JSON.stringify(info.bad, null, 2));
  console.log('unique console errors:', [...new Set(msgs)].length);
  [...new Set(msgs)].slice(0,6).forEach(m=>console.log('MSG:', m));
  await browser.close();
})();
