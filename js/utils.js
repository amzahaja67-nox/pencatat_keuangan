// Fungsi bantu: format rupiah, tanggal, saldo dompet, modal, toast

/* ===== UTIL ===== */
const fmt = n => 'Rp'+Math.round(n||0).toLocaleString('id-ID');
const fmtS = n => { n=Math.abs(n||0); if(n>=1e9) return (n/1e9).toFixed(1)+'M'; if(n>=1e6) return (n/1e6).toFixed(1)+'jt'; if(n>=1e3) return Math.round(n/1e3)+'rb'; return n };
const today = () => new Date().toISOString().slice(0,10);
const ym = d => (d||today()).slice(0,7);
const fmtDate = d => new Date(d+'T00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
const monthName = m => new Date(m+'-01T00:00').toLocaleDateString('id-ID',{month:'long',year:'numeric'});
const catIcon = (type,name) => (CATS[type]||[]).find(c=>c[1]===name)?.[0] || '📦';
const wName = id => DB.wallets.find(w=>w.id===id)?.name || '—';
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200)}
function closeM(id){document.getElementById(id).classList.remove('open')}
function openM(id){document.getElementById(id).classList.add('open')}
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')}));

function walletBalance(id){
  const w=DB.wallets.find(w=>w.id===id); if(!w) return 0;
  let b=+w.init||0;
  DB.tx.forEach(t=>{
    if(t.type==='in'&&t.wallet===id) b+=t.amt;
    if(t.type==='out'&&t.wallet===id) b-=t.amt;
    if(t.type==='transfer'){ if(t.wallet===id) b-=t.amt; if(t.to===id) b+=t.amt; }
  });
  return b;
}
const txMonthly = m => DB.tx.filter(t=>ym(t.date)===m);
const sum = (arr,type) => arr.filter(t=>t.type===type).reduce((a,t)=>a+t.amt,0);
