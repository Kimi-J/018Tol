const fs=require('fs');
const f='D:/008Code/018Tol/.gitignore';
let s=fs.readFileSync(f,'utf8');
const from='# 重建：node <node> <pnpm> add puppeteer-core --dir _dev/tools';
const to  ='# 重建：cd _dev/tools && pnpm install   （依赖清单见 _dev/tools/package.json）';
if(!s.includes(from)){ console.log('目标行未找到，可能已改；当前第22行：'); console.log(s.split('\n')[21]); process.exit(0); }
s=s.replace(from,to);
fs.writeFileSync(f,s,'utf8');
console.log('已更新。BOM='+(fs.readFileSync(f)[0]===0xEF?'有(BAD)':'无(OK)'));
