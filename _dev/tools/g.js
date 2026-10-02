const fs=require('fs');
for (const f of ['02-四大作品.md','01-生平档案.md','04-星丛作品.md']){
  const s=fs.readFileSync('D:/008Code/018Tol/research/'+f,'utf8').split('\n');
  s.forEach((L,i)=>{
    if (/Я говорю:|не нашим умом|Божьим судом|косьб|Косьб|Надо косить|мы косим/i.test(L)) console.log(f+':'+(i+1)+': '+L.slice(0,240));
  });
}
