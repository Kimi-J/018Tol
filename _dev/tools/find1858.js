const fs=require('fs');
const files=['01-生平档案.md','02-四大作品.md','03-晚年与遗产.md','04-星丛作品.md'];
for(const f of files){
  const s=fs.readFileSync('D:/008Code/018Tol/research/'+f,'utf8').split('\n');
  s.forEach((L,i)=>{
    if(/1858|Крестьян|крестьян.*вопрос|освобожд|Яснополянская школа|школ/i.test(L) && L.length<400){
      console.log(f+':'+(i+1)+'  '+L.trim().slice(0,200));
    }
  });
}
