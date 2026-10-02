const {execSync}=require('child_process');
const fs=require('fs'), path=require('path');
const R='D:/008Code/018Tol';
// 关掉 git 的路径转义，直接拿 UTF-8 路径
const files=execSync('git -c core.quotePath=false ls-files',{cwd:R,encoding:'utf8'}).trim().split('\n');
let total=0; const groups={};
for(const f of files){
  const p=path.join(R,f);
  const s=fs.existsSync(p)?fs.statSync(p).size:0;
  total+=s;
  const g=f.includes('/')?f.split('/').slice(0,2).join('/'):'(根)';
  groups[g]=groups[g]||{n:0,b:0}; groups[g].n++; groups[g].b+=s;
}
console.log('入库文件按目录汇总：');
for(const [g,v] of Object.entries(groups).sort())
  console.log('  '+g.padEnd(18)+String(v.n).padStart(4)+' 个   '+(v.b/1024).toFixed(1).padStart(8)+' KB');
console.log('─'.repeat(48));
console.log(`  合计 ${files.length} 个文件，${(total/1024).toFixed(1)} KB`);
console.log('\nplan / research 文档：');
for(const f of files.filter(x=>/^(plan|research|assets)\//.test(x))) {
  const s=fs.existsSync(path.join(R,f))?fs.statSync(path.join(R,f)).size/1024:0;
  console.log('  '+(s.toFixed(1)+' KB').padStart(9)+'  '+f);
}
