// 用与 index.html 完全相同的算法生成 d 字符串并校验其语法
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const REASON=[{n:'潜伏',d:0},{n:'分离',d:15},{n:'交叠',d:9},{n:'绷紧',d:3},{n:'合一',d:0},{n:'合一',d:0},{n:'合一',d:0}];
const FAITH=[{d:0,amp:0,f:0,dam:0},{d:15,amp:5,f:1.2,dam:0},{d:9,amp:3.2,f:2.4,dam:.15},
  {d:3,amp:1.4,f:3.6,dam:.85},{d:0,amp:0,f:0,dam:0},{d:0,amp:0,f:0,dam:0},{d:0,amp:0,f:0,dam:0}];
const ACT_EDGES=[0,.055,.155,.325,.470,.630,.800,.905,1.0];
function stateBlend(dp){let i=ACT_EDGES.length-2;
  for(let k=0;k<ACT_EDGES.length-1;k++){if(dp>=ACT_EDGES[k]&&dp<=ACT_EDGES[k+1]){i=k;break;}}
  return {i,t:clamp((dp-ACT_EDGES[i])/((ACT_EDGES[i+1]-ACT_EDGES[i])||1))};}
function railPaths(dp,localY){
  const {i,t}=stateBlend(dp); const e=smooth(t);
  const A=REASON[i],B=REASON[Math.min(i+1,REASON.length-1)];
  const Fa=FAITH[i],Fb=FAITH[Math.min(i+1,FAITH.length-1)];
  const dR=mix(A.d,B.d,e),dF=mix(Fa.d,Fb.d,e);
  const ampF=mix(Fa.amp,Fb.amp,e),frqF=mix(Fa.f,Fb.f,e),dam=mix(Fa.dam,Fb.dam,e);
  const N=7,pts=[];
  for(let k=0;k<N;k++){const u=k/(N-1),y=u*1000;const xr=38+dR;
    let w=ampF*Math.sin(u*Math.PI*2*frqF+localY*2.1);
    if(dam>0)w+=dam*1.5*Math.sin(u*Math.PI*2*11+localY*3.7)*(1-Math.abs(u*2-1)*.6);
    pts.push([xr,38+dF+w,y]);}
  let pr='',pf='';
  for(let k=0;k<N-1;k++){
    const p0=pts[Math.max(0,k-1)],p1=pts[k],p2=pts[k+1],p3=pts[Math.min(N-1,k+2)];
    const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[2]+(p2[2]-p0[2])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[2]-(p3[2]-p1[2])/6;
    const o1=p1[1]-p1[0],o2=p2[1]-p2[0];
    pr+=`${k?'':'M'}${p1[0].toFixed(2)},${p1[2].toFixed(1)} C${c1x.toFixed(2)},${c1y.toFixed(1)} ${c2x.toFixed(2)},${c2y.toFixed(1)} ${p2[0].toFixed(2)},${p2[2].toFixed(1)} `;
    pf+=`${k?'':'M'}${p1[1].toFixed(2)},${p1[2].toFixed(1)} C${(c1x+o1).toFixed(2)},${c1y.toFixed(1)} ${(c2x+o2).toFixed(2)},${c2y.toFixed(1)} ${p2[1].toFixed(2)},${p2[2].toFixed(1)} `;
  }
  return {pr:pr.trim(),pf:pf.trim()};
}
// 校验收敛器：模拟 SVG 路径语法
function validate(d){
  const errs=[];
  const m=d.match(/^M(-?[\d.]+),(-?[\d.]+)\s*/);
  if(!m){errs.push('no leading M'); return errs;}
  let rest=d.slice(m[0].length);
  while(rest.length){
    const c=rest.match(/^C(-?[\d.]+),(-?[\d.]+) (-?[\d.]+),(-?[\d.]+) (-?[\d.]+),(-?[\d.]+)\s*/);
    if(!c){errs.push('bad segment: '+JSON.stringify(rest.slice(0,60))); break;}
    rest=rest.slice(c[0].length);
  }
  return errs;
}
let fail=0, checked=0;
for(let i=0;i<=100;i++){
  for(const ly of [0,0.13,0.37,0.5,0.61,0.77,0.99]){
    const dp=i/100;
    const {pr,pf}=railPaths(dp,ly);
    for(const [nm,s] of [['reason',pr],['faith',pf]]){
      checked++;
      const e=validate(s);
      if(e.length){ fail++; if(fail<4) console.log('FAIL dp='+dp+' ly='+ly+' '+nm, e, '\n', s.slice(0,200)); }
    }
  }
}
console.log('checked', checked, 'fail', fail);
const s=railPaths(0,0);
console.log('sample reason:', s.pr.slice(0,150));
console.log('sample faith :', s.pf.slice(0,150));
