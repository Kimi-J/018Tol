const fs=require('fs');
const s=fs.readFileSync('D:/008Code/018Tol/index.html','utf8');
const re=/<canvas\b[^>]*>/g; let m;
while((m=re.exec(s))){
  console.log((m[0].includes('aria-label')?'OK  ':'MISS') + '  ' + m[0].slice(0,120));
}
