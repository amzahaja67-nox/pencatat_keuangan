// Grafik SVG: bar chart & donut chart

/* ===== CHARTS (SVG) ===== */
function barChart(data,{h=200,color='#1d63e8',color2}={}){ // data: [{l,v,v2?}]
  const W=600,pad=30,bw=W/data.length;
  const max=Math.max(1,...data.flatMap(d=>[d.v,d.v2||0]));
  let s=`<svg viewBox="0 0 ${W} ${h+pad}" style="width:100%;height:auto;overflow:visible">`;
  [0,.5,1].forEach(p=>{const y=h-h*p;s+=`<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="var(--border)"/><text x="0" y="${y-4}" font-size="10" fill="var(--muted)">${fmtS(max*p)}</text>`});
  data.forEach((d,i)=>{
    const x=i*bw, two=color2!==undefined, w=two?bw*0.3:bw*0.55, gap=two?bw*0.05:0;
    const x1=two?x+bw/2-w-gap/2:x+(bw-w)/2;
    const h1=d.v/max*h; s+=`<rect x="${x1}" y="${h-h1}" width="${w}" height="${h1}" rx="4" fill="${color}"><title>${d.l}: ${fmt(d.v)}</title></rect>`;
    if(two){const h2=(d.v2||0)/max*h; s+=`<rect x="${x+bw/2+gap/2}" y="${h-h2}" width="${w}" height="${h2}" rx="4" fill="${color2}"><title>${d.l}: ${fmt(d.v2)}</title></rect>`}
    if(data.length<=12||i%Math.ceil(data.length/12)===0) s+=`<text x="${x+bw/2}" y="${h+16}" font-size="10" fill="var(--muted)" text-anchor="middle">${d.l}</text>`;
  });
  return s+'</svg>';
}
function donut(items,total){
  const r=52,c=2*Math.PI*r; let off=0;
  let s=`<svg viewBox="0 0 140 140" width="150" height="150"><circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--blue-50)" stroke-width="22"/>`;
  items.forEach((it,i)=>{const len=it.v/total*c; s+=`<circle cx="70" cy="70" r="${r}" fill="none" stroke="${PIE[i%PIE.length]}" stroke-width="22" stroke-dasharray="${len} ${c-len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${it.l}: ${fmt(it.v)}</title></circle>`; off+=len});
  s+=`<text x="70" y="66" text-anchor="middle" font-size="11" fill="var(--muted)">Total</text><text x="70" y="82" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text)">${fmtS(total)}</text></svg>`;
  return s;
}
function catBreak(list,type){
  const map={}; list.filter(t=>t.type===type).forEach(t=>map[t.cat]=(map[t.cat]||0)+(type==='out'?txOutAmount(t):t.amt));
  return Object.entries(map).map(([l,v])=>({l,v})).sort((a,b)=>b.v-a.v);
}
function renderPie(items,pieId,legId,type){
  const total=items.reduce((a,b)=>a+b.v,0);
  if(!total){document.getElementById(pieId).innerHTML='';document.getElementById(legId).innerHTML='<div class="empty">Tidak ada data</div>';return}
  document.getElementById(pieId).innerHTML=donut(items,total);
  document.getElementById(legId).innerHTML=items.map((it,i)=>`<div class="li"><span class="dot" style="background:${PIE[i%PIE.length]}"></span>${catIcon(type,it.l)} ${esc(it.l)} <span style="color:var(--muted);font-size:12px;margin-left:4px">${Math.round(it.v/total*100)}%</span><b>${fmt(it.v)}</b></div>`).join('');
}
function lastMonths(n,end){const a=[];const d=new Date(end+'-01T00:00');for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);a.push(x.toISOString().slice(0,7))}return a}
