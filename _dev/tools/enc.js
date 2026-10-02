const fs=require('fs');
for (const f of ['.gitignore','assets/img/.gitkeep']){
  const b=fs.readFileSync('D:/008Code/018Tol/'+f);
  console.log(f, 'bytes='+b.length, 'BOM='+(b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF?'有(BAD)':'无(OK)'));
}
