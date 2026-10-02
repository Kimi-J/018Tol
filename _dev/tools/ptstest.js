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

function pts(dp,localY){
  const {i,t}=stateBlend(dp); const e=smooth(t);
  const A=REASON[i],B=REASON[Math.min(i+1,REASON.length-1)];
  const Fa=FAITH[i],Fb=FAITH[Math.min(i+1,FAITH.length-1)];
  const dR=mix(A.d,B.d,e),dF=mix(Fa.d,Fb.d,e);
  const ampF=mix(Fa.amp,Fb.amp,e),frqF=mix(Fa.f,Fb.f,e),dam=mix(Fa.dam,Fb.dam,e);
  const N=7,out=[];
  for(let k=0;k<N;k++){
    const u=k/(N-1), y=u*1000;
    let w=ampF*Math.sin(u*Math.PI*2*frqF+localY*2.1);
    if(dam>0) w+=dam*1.5*Math.sin(u*Math.PI*2*11+localY*3.7)*(1-Math.abs(u*2-1)*.6);
    out.push({r:38+dR, f:38+dF+w, y});
  }
  return out;
}
const P = pts(0,0);
console.log('pts:', P.map(p=>`r=${p.r.toFixed(2)} f=${p.f.toFixed(2)} y=${p.y}`).join('\n     '));
const p0=P[Math.max(0,0-1)]=P[0], p1=P[0], p2=P[1], p3=P[2];
console.log('k=0: p0.y='+p0.y+' p1.y='+p1.y+' p2.y='+p2.y+' p3.y='+p3.y);
console.log('     c1y =', p1.y + (p2.y-p0.y)/6);
console.log('     c2y =', p2.y - (p3.y-p1.y)/6);
const p0b=P[0], p1b=P[1], p2b=P[2], p3b=P[3];
console.log('k=1: p0.y='+p0b.y+' p1.y='+p1b.y+' p2.y='+p2b.y+' p3.y='+p3b.y);
console.log('     c1y =', p1b.y + (p2b.y-p0b.y)/6);
console.log('     c2y =', p2b.y - (p3b.y-p1b.y)/6);
