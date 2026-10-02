const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///D:/008Code/018Tol/index.html';
const NEEDLES = {
  '绿杖闭环·序章(扎卡兹林)': '扎卡兹林',
  '绿杖闭环·终章(那根绿杖还在那里)': '那根绿杖还在那里',
  '心灵辩证法': '心灵辩证法',
  'diaлектика души(俄)': 'диалектика души',
  '车尔尼雪夫斯基': '车尔尼雪夫斯基',
  '奥斯特里茨原文': 'Как же я не видал',
  '井中旅人': '张着大嘴的龙',
  '三段论': 'потому Кай смертен',
  '黑袋·取代死亡的是光': 'Вместо смерти был свет',
  '石缝春草': 'весна была весною',
  '人性摆荡': 'два человека',
  '茨威格·拉丁语': 'nulla crux, nulla corona',
  '粉笔字母串': 'к, в, м, о',
  '娜塔莎月夜': 'Так бы вот села на корточки',
  '牛蒡花': 'Экая энергия',
  '三俄尺更正': '三俄尺',
  '七颗钻石存疑': '归属存疑',
  '穷人=雨果改写': '雨果',
  '道德经/老子': '老子',
  '诺贝尔19次': '诺贝尔',
  '圣务院措辞': '自绝于教会',
  '祖宅更正': '多尔多耶村',
  '背叛说法存疑': '查无一手出处',
  '农民横幅': '亚斯纳亚波利亚纳的农民',
  '第一次呼吸时刻': '他花掉了余下的八十二年'
};
(async () => {
  const browser = await puppeteer.launch({executablePath: CHROME, headless:'new',
    args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({width:1440, height:900});
  await page.goto(URL, {waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1800));
  const res = await page.evaluate((needles)=>{
    const html = document.documentElement.outerHTML;
    const text = document.body.innerText;
    const out = {};
    for (const [k,v] of Object.entries(needles)){
      out[k] = {inHTML: html.includes(v), inText: text.includes(v)};
    }
    return out;
  }, NEEDLES);
  let ok = 0, miss = [];
  for (const [k,v] of Object.entries(res)){
    if (v.inText) ok++; else miss.push(k + ' ' + JSON.stringify(v));
  }
  console.log(`锚点就位: ${ok}/${Object.keys(res).length}`);
  if (miss.length) { console.log('缺失:'); miss.forEach(m=>console.log('  '+m)); }
  // 检查是否还有可见的待补标记
  const leftovers = await page.evaluate(()=>{
    const t = document.body.innerText;
    return ['待补','待调研组','TODO'].filter(s=>t.includes(s));
  });
  console.log('可见残留占位符:', leftovers.length ? leftovers : '无');
  await browser.close();
})();
