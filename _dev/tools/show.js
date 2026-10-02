const fs=require('fs');
const s=fs.readFileSync('D:/008Code/018Tol/index.html','utf8');
const lines=s.split('\n');
for(let i=1600;i<=1630;i++) console.log(i+': '+lines[i-1]);
console.log('--- count of "pts.push" ---');
console.log((s.match(/pts\.push/g)||[]).length);
console.log('--- count of railPaths defs ---');
console.log((s.match(/function railPaths/g)||[]).length);
console.log('--- bytes ---', Buffer.byteLength(s,'utf8'));
