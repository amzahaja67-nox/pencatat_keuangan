// Logika utama aplikasi: navigasi, transaksi, dompet, laporan, budget, pencarian, hutang piutang

/* ===== NAV ===== */
function go(p){
  document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
  document.querySelectorAll('.page').forEach(s=>s.classList.toggle('active',s.id==='page-'+p));
  window.scrollTo(0,0);
}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page));

/* ===== TRANSAKSI ===== */
let txType='out';
function fillWalletSelects(){
  const opts=DB.wallets.map(w=>`<option value="${w.id}">${esc(w.name)}</option>`).join('');
  ['txWallet','txTo'].forEach(id=>document.getElementById(id).innerHTML=opts);
  document.getElementById('pWallet').innerHTML='<option value="">— Tidak catat ke dompet —</option>'+opts;
  document.getElementById('fWallet').innerHTML='<option value="">Semua</option>'+opts;
}
function setTxType(t){
  txType=t;
  document.querySelectorAll('#mTx .seg button').forEach(b=>{b.className=b.dataset.t===t?('on '+t):''});
  document.getElementById('txCat').innerHTML=CATS[t].map(c=>`<option>${c[1]}</option>`).join('');
  document.getElementById('txCatWrap').style.display=t==='transfer'?'none':'';
  document.getElementById('txToWrap').style.display=t==='transfer'?'':'none';
  document.getElementById('txWalletLbl').textContent=t==='transfer'?'Dari Dompet':'Dompet';
  updateTxFeeVisibility();
}
function updateTxFeeVisibility(){
  const wallet=DB.wallets.find(w=>w.id===document.getElementById('txWallet').value);
  const show=txType!=='in'&&wallet?.type==='E-Wallet';
  document.getElementById('txFeeWrap').style.display=show?'':'none';
  if(!show) document.getElementById('txFee').value='';
}
function openTx(type,id){
  if(!DB.wallets.length){toast('Buat dompet terlebih dahulu');go('dompet');return}
  fillWalletSelects();
  const t = id ? DB.tx.find(x=>x.id===id) : null;
  document.getElementById('mTxTitle').textContent=t?'Edit Transaksi':'Catat Transaksi';
  setTxType(t?t.type:(type||'out'));
  document.getElementById('txId').value=t?t.id:'';
  document.getElementById('txAmt').value=t?t.amt:'';
  document.getElementById('txDate').value=t?t.date:today();
  if(t&&t.cat) document.getElementById('txCat').value=t.cat;
  document.getElementById('txWallet').value=t?t.wallet:DB.wallets[0].id;
  if(t&&t.to) document.getElementById('txTo').value=t.to; else if(DB.wallets[1]) document.getElementById('txTo').value=DB.wallets[1].id;
  document.getElementById('txFee').value=t?.fee||'';
  updateTxFeeVisibility();
  document.getElementById('txNote').value=t?t.note:'';
  openM('mTx'); setTimeout(()=>document.getElementById('txAmt').focus(),50);
}
function saveTx(){
  const amt=+document.getElementById('txAmt').value, date=document.getElementById('txDate').value;
  const wallet=document.getElementById('txWallet').value, to=document.getElementById('txTo').value, fee=+document.getElementById('txFee').value||0;
  if(!amt||amt<=0) return toast('Jumlah harus lebih dari 0');
  if(!date) return toast('Tanggal wajib diisi');
  if(fee<0) return toast('Biaya admin tidak boleh negatif');
  if(txType==='transfer'&&wallet===to) return toast('Dompet asal dan tujuan harus berbeda');
  const obj={id:document.getElementById('txId').value||uid(),type:txType,amt,date,fee:txType==='out'||txType==='transfer'?fee:0,cat:txType==='transfer'?'Transfer':document.getElementById('txCat').value,wallet,to:txType==='transfer'?to:null,note:document.getElementById('txNote').value.trim()};
  const i=DB.tx.findIndex(x=>x.id===obj.id); if(i>=0) DB.tx[i]=obj; else DB.tx.push(obj);
  closeM('mTx'); save(); toast('Transaksi disimpan');
}
function delTx(id){ if(!confirm('Hapus transaksi ini?')) return; DB.tx=DB.tx.filter(t=>t.id!==id); save(); toast('Transaksi dihapus'); }

function txRow(t){
  const cls=t.type==='in'?'in':t.type==='out'?'out':'tf', sign=t.type==='in'?'+':t.type==='out'?'−':'';
  const wal=t.type==='transfer'?`${esc(wName(t.wallet))} → ${esc(wName(t.to))}`:esc(wName(t.wallet));
  return `<tr><td style="white-space:nowrap">${fmtDate(t.date)}</td><td><div style="display:flex;align-items:center;gap:10px"><div class="cat-ic">${catIcon(t.type,t.cat)}</div><div><b style="font-weight:600">${esc(t.cat)}</b><div class="hide-m" style="font-size:12px;color:var(--muted)"></div></div></div></td><td class="hide-m" style="color:var(--muted)">${esc(t.note)||'—'}</td><td class="hide-m"><span class="chip">${wal}</span></td><td class="amt ${cls}" style="text-align:right">${sign}${fmt(txOutAmount(t))}${t.fee?`<div style="font-size:12px;color:var(--muted)">termasuk admin ${fmt(t.fee)}</div>`:''}</td><td style="white-space:nowrap;text-align:right"><button class="btn icon" onclick="openTx(null,'${t.id}')" title="Edit">✎</button><button class="btn icon del" onclick="delTx('${t.id}')" title="Hapus">🗑</button></td></tr>`;
}
function renderTx(){
  const m=document.getElementById('txMonth').value;
  const list=txMonthly(m).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
  const i=sum(list,'in'),o=list.filter(t=>t.type==='out').reduce((a,t)=>a+txOutAmount(t),0);
  document.getElementById('tIn').textContent=fmt(i); document.getElementById('tOut').textContent=fmt(o);
  const n=document.getElementById('tNet'); n.textContent=(i-o<0?'−':'')+fmt(Math.abs(i-o)); n.style.color=i-o>=0?'var(--green)':'var(--red)';
  document.getElementById('txTable').innerHTML=list.map(txRow).join('');
  document.getElementById('txEmpty').innerHTML=list.length?'':`<div class="empty"><div class="big">🧾</div>Belum ada transaksi di ${monthName(m)}</div>`;
}

/* ===== DOMPET ===== */
let wColor=0;
function openWallet(id){
  const w=id?DB.wallets.find(x=>x.id===id):null;
  document.getElementById('mWalletTitle').textContent=w?'Edit Dompet':'Dompet Baru';
  document.getElementById('wId').value=w?w.id:''; document.getElementById('wName').value=w?w.name:'';
  document.getElementById('wType').value=w?w.type:'Tunai'; document.getElementById('wInit').value=w?w.init:'';
  wColor=w?w.color:0; renderColorPick(); openM('mWallet');
}
function renderColorPick(){
  document.getElementById('wColors').innerHTML=WCOLORS.map((c,i)=>`<div onclick="wColor=${i};renderColorPick()" style="width:32px;height:32px;border-radius:10px;background:${c};cursor:pointer;outline:${i===wColor?'3px solid var(--blue-100)':'none'};border:${i===wColor?'2px solid var(--blue-600)':'2px solid transparent'}"></div>`).join('');
}
function saveWallet(){
  const name=document.getElementById('wName').value.trim(); if(!name) return toast('Nama dompet wajib diisi');
  const obj={id:document.getElementById('wId').value||uid(),name,type:document.getElementById('wType').value,init:+document.getElementById('wInit').value||0,color:wColor};
  const i=DB.wallets.findIndex(x=>x.id===obj.id); if(i>=0) DB.wallets[i]=obj; else DB.wallets.push(obj);
  closeM('mWallet'); save(); toast('Dompet disimpan');
}
function delWallet(id){
  const n=DB.tx.filter(t=>t.wallet===id||t.to===id).length;
  if(!confirm(`Hapus dompet ini?${n?` ${n} transaksi terkait juga akan dihapus.`:''}`)) return;
  DB.wallets=DB.wallets.filter(w=>w.id!==id); DB.tx=DB.tx.filter(t=>t.wallet!==id&&t.to!==id); save(); toast('Dompet dihapus');
}
function walletCard(w,small){
  const b=walletBalance(w.id);
  return `<div class="wallet" style="background:${WCOLORS[w.color||0]};${small?'min-height:100px;padding:16px':''}">
    ${small?'':`<div class="acts"><button class="btn icon" onclick="openWallet('${w.id}')">✎</button><button class="btn icon" onclick="delWallet('${w.id}')">🗑</button></div>`}
    <div class="wn"><span>${esc(w.name)}</span></div>
    <div><div class="wb">${fmt(b)}</div><div class="wt">${esc(w.type)} · Saldo awal ${fmt(w.init)}</div></div></div>`;
}
function renderWallets(){
  const g=document.getElementById('walletGrid');
  g.innerHTML=DB.wallets.map(w=>walletCard(w)).join('')+`<div class="card" style="display:grid;place-items:center;min-height:140px;border:2px dashed var(--blue-100);box-shadow:none;cursor:pointer;color:var(--blue-600);font-weight:600" onclick="openWallet()">+ Tambah Dompet</div>`;
  document.getElementById('dashWallets').innerHTML=DB.wallets.length?`<div class="grid" style="gap:10px">${DB.wallets.map(w=>walletCard(w,true)).join('')}</div>`:'<div class="empty">Belum ada dompet</div>';
}

/* ===== LAPORAN ===== */
function renderReport(){
  const m=document.getElementById('repMonth').value, list=txMonthly(m);
  const i=sum(list,'in'),o=sum(list,'out');
  document.getElementById('rIn').textContent=fmt(i); document.getElementById('rOut').textContent=fmt(o);
  const n=document.getElementById('rNet'); n.textContent=(i-o<0?'−':'')+fmt(Math.abs(i-o)); n.style.color=i-o>=0?'var(--green)':'var(--red)';
  document.getElementById('rRate').textContent=i?`Rasio tabungan ${Math.round((i-o)/i*100)}%`:'';
  renderPie(catBreak(list,'out'),'pieOut','legOut','out');
  renderPie(catBreak(list,'in'),'pieIn','legIn','in');
  const days=new Date(+m.slice(0,4),+m.slice(5,7),0).getDate();
  const daily=Array.from({length:days},(_,d)=>({l:d+1,v:0})); list.filter(t=>t.type==='out').forEach(t=>daily[+t.date.slice(8,10)-1].v+=txOutAmount(t));
  document.getElementById('dailyChart').innerHTML=barChart(daily,{h:160,color:'#2f7bff'});
  const months=lastMonths(12,m).map(mm=>{const l=txMonthly(mm);return {l:new Date(mm+'-01T00:00').toLocaleDateString('id-ID',{month:'short'}),v:sum(l,'in'),v2:sum(l,'out')}});
  document.getElementById('trendChart').innerHTML=barChart(months,{h:160,color:'#16a34a',color2:'#e5484d'})+`<div style="display:flex;gap:16px;font-size:12px;color:var(--muted);margin-top:8px"><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#16a34a;margin-right:6px"></i>Pemasukan</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#e5484d;margin-right:6px"></i>Pengeluaran</span></div>`;
}

/* ===== BUDGET ===== */
function openBudget(id){
  const b=id?DB.budgets.find(x=>x.id===id):null;
  document.getElementById('bCat').innerHTML=CATS.out.map(c=>`<option>${c[1]}</option>`).join('');
  document.getElementById('bId').value=b?b.id:''; if(b) document.getElementById('bCat').value=b.cat;
  document.getElementById('bCat').disabled=!!b;
  document.getElementById('bAmt').value=b?b.amt:''; openM('mBudget');
}
function saveBudget(){
  const cat=document.getElementById('bCat').value, amt=+document.getElementById('bAmt').value;
  if(!amt||amt<=0) return toast('Nominal budget tidak valid');
  const id=document.getElementById('bId').value;
  if(!id && DB.budgets.some(b=>b.cat===cat)) return toast('Budget kategori ini sudah ada');
  const obj={id:id||uid(),cat,amt}; const i=DB.budgets.findIndex(x=>x.id===obj.id); if(i>=0) DB.budgets[i]=obj; else DB.budgets.push(obj);
  closeM('mBudget'); save(); toast('Budget disimpan');
}
function delBudget(id){ if(!confirm('Hapus budget ini?')) return; DB.budgets=DB.budgets.filter(b=>b.id!==id); save(); }
function budgetItems(m){
  const list=txMonthly(m).filter(t=>t.type==='out');
  return DB.budgets.map(b=>{const used=list.filter(t=>t.cat===b.cat).reduce((a,t)=>a+txOutAmount(t),0);return {...b,used,pct:Math.min(100,used/b.amt*100),real:used/b.amt*100}});
}
function progHtml(it){const cls=it.real>=100?'over':it.real>=80?'warn':'';return `<div class="prog"><i class="${cls}" style="width:${it.pct}%"></i></div>`}
function renderBudget(){
  const m=document.getElementById('bdMonth').value, items=budgetItems(m);
  const tot=items.reduce((a,b)=>a+b.amt,0), used=items.reduce((a,b)=>a+b.used,0);
  document.getElementById('bTotal').textContent=fmt(tot); document.getElementById('bUsed').textContent=fmt(used); document.getElementById('bLeft').textContent=fmt(tot-used);
  document.getElementById('budgetGrid').innerHTML=items.length?items.map(it=>`<div class="card"><div style="display:flex;align-items:center;gap:12px"><div class="cat-ic">${catIcon('out',it.cat)}</div><div style="flex:1"><b style="font-weight:600">${esc(it.cat)}</b><div style="font-size:12px;color:var(--muted)">${fmt(it.used)} dari ${fmt(it.amt)}</div></div><span class="chip ${it.real>=100?'r':it.real>=80?'a':'g'}">${Math.round(it.real)}%</span><button class="btn icon" onclick="openBudget('${it.id}')">✎</button><button class="btn icon del" onclick="delBudget('${it.id}')">🗑</button></div>${progHtml(it)}<div style="font-size:12px;color:var(--muted);margin-top:6px">${it.amt-it.used>=0?'Sisa '+fmt(it.amt-it.used):'<span style="color:var(--red)">Melebihi '+fmt(it.used-it.amt)+'</span>'}</div></div>`).join(''):`<div class="card empty" style="grid-column:1/-1"><div class="big">🎯</div>Belum ada budget. Buat batas pengeluaran agar lebih terkontrol.</div>`;
}

/* ===== CARI ===== */
function resetFilter(){['fQ','fFrom','fTo','fMin','fMax'].forEach(i=>document.getElementById(i).value='');['fType','fCat','fWallet'].forEach(i=>document.getElementById(i).value='');document.getElementById('fSort').value='dateDesc';renderSearch()}
function renderSearch(){
  const q=document.getElementById('fQ').value.toLowerCase().trim(), type=document.getElementById('fType').value, cat=document.getElementById('fCat').value, wal=document.getElementById('fWallet').value;
  const from=document.getElementById('fFrom').value, to=document.getElementById('fTo').value, min=+document.getElementById('fMin').value||0, max=+document.getElementById('fMax').value||Infinity, sort=document.getElementById('fSort').value;
  let list=DB.tx.filter(t=>{
    if(type&&t.type!==type) return false; if(cat&&t.cat!==cat) return false; if(wal&&t.wallet!==wal&&t.to!==wal) return false;
    if(from&&t.date<from) return false; if(to&&t.date>to) return false; if(txOutAmount(t)<min||txOutAmount(t)>max) return false;
    if(q){const hay=[t.note,t.cat,wName(t.wallet),t.to?wName(t.to):'',String(txOutAmount(t)),fmtDate(t.date)].join(' ').toLowerCase(); if(!hay.includes(q)) return false}
    return true;
  });
  list.sort((a,b)=>sort==='dateDesc'?b.date.localeCompare(a.date):sort==='dateAsc'?a.date.localeCompare(b.date):sort==='amtDesc'?txOutAmount(b)-txOutAmount(a):txOutAmount(a)-txOutAmount(b));
  const i=sum(list,'in'),o=sum(list,'out');
  document.getElementById('fSummary').innerHTML=`<span><b>${list.length}</b> transaksi</span><span>Pemasukan <b style="color:var(--green)">${fmt(i)}</b></span><span>Pengeluaran <b style="color:var(--red)">${fmt(o)}</b></span>`;
  document.getElementById('fTable').innerHTML=list.slice(0,300).map(txRow).join('');
  document.getElementById('fEmpty').innerHTML=list.length?(list.length>300?'<div class="empty">Menampilkan 300 pertama, persempit filter.</div>':''):'<div class="empty"><div class="big">🔍</div>Tidak ada transaksi yang cocok</div>';
}
function fillCatFilter(){const all=[...CATS.out,...CATS.in,...CATS.transfer].map(c=>c[1]).filter((v,i,a)=>a.indexOf(v)===i);document.getElementById('fCat').innerHTML='<option value="">Semua</option>'+all.map(c=>`<option>${c}</option>`).join('')}

/* ===== HUTANG PIUTANG ===== */
let debtType='hutang', debtTab='all';
function setDebtType(t){debtType=t;document.querySelectorAll('#mDebt .seg button').forEach(b=>b.className=b.dataset.h===t?('on '+(t==='hutang'?'out':'in')):'')}
function setDebtTab(btn){debtTab=btn.dataset.dt;document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b===btn));renderDebts()}
function openDebt(id){
  const d=id?DB.debts.find(x=>x.id===id):null;
  document.getElementById('mDebtTitle').textContent=d?'Edit':'Tambah Hutang/Piutang';
  setDebtType(d?d.type:'hutang');
  document.getElementById('hId').value=d?d.id:''; document.getElementById('hName').value=d?d.name:''; document.getElementById('hAmt').value=d?d.amt:'';
  document.getElementById('hDue').value=d?d.due:''; document.getElementById('hNote').value=d?d.note:''; openM('mDebt');
}
function saveDebt(){
  const name=document.getElementById('hName').value.trim(), amt=+document.getElementById('hAmt').value;
  if(!name) return toast('Nama wajib diisi'); if(!amt||amt<=0) return toast('Jumlah tidak valid');
  const id=document.getElementById('hId').value, old=id?DB.debts.find(x=>x.id===id):null;
  const obj={id:id||uid(),type:debtType,name,amt,due:document.getElementById('hDue').value,note:document.getElementById('hNote').value.trim(),paid:old?old.paid:0,created:old?old.created:today()};
  const i=DB.debts.findIndex(x=>x.id===obj.id); if(i>=0) DB.debts[i]=obj; else DB.debts.push(obj);
  closeM('mDebt'); save(); toast('Tersimpan');
}
function delDebt(id){ if(!confirm('Hapus catatan ini?')) return; DB.debts=DB.debts.filter(d=>d.id!==id); save(); }
function openPay(id){
  const d=DB.debts.find(x=>x.id===id); fillWalletSelects();
  document.getElementById('pId').value=id; document.getElementById('pAmt').value=d.amt-d.paid;
  document.getElementById('pInfo').textContent=`${d.type==='hutang'?'Bayar hutang ke':'Terima pembayaran dari'} ${d.name}. Sisa: ${fmt(d.amt-d.paid)}`;
  openM('mPay');
}
function savePay(){
  const d=DB.debts.find(x=>x.id===document.getElementById('pId').value); const amt=+document.getElementById('pAmt').value, w=document.getElementById('pWallet').value;
  if(!amt||amt<=0) return toast('Jumlah tidak valid'); if(amt>d.amt-d.paid) return toast('Melebihi sisa');
  d.paid+=amt;
  if(w) DB.tx.push({id:uid(),type:d.type==='hutang'?'out':'in',amt,date:today(),cat:d.type==='hutang'?'Cicilan':'Pengembalian',wallet:w,to:null,note:`${d.type==='hutang'?'Bayar hutang ke':'Pembayaran piutang dari'} ${d.name}`});
  closeM('mPay'); save(); toast(d.paid>=d.amt?'Lunas! 🎉':'Pembayaran dicatat');
}
function renderDebts(){
  const open=DB.debts.filter(d=>d.paid<d.amt);
  const owe=open.filter(d=>d.type==='hutang').reduce((a,d)=>a+d.amt-d.paid,0), owed=open.filter(d=>d.type==='piutang').reduce((a,d)=>a+d.amt-d.paid,0);
  document.getElementById('hOwe').textContent=fmt(owe); document.getElementById('hOwed').textContent=fmt(owed);
  const n=document.getElementById('hNet'); n.textContent=(owed-owe<0?'−':'')+fmt(Math.abs(owed-owe)); n.style.color=owed-owe>=0?'var(--green)':'var(--red)';
  const dd=document.getElementById('dDebt'); dd.textContent=(owed-owe<0?'−':'')+fmt(Math.abs(owed-owe)); dd.style.color=owed-owe>=0?'var(--green)':'var(--red)';
  let list=DB.debts.filter(d=>debtTab==='all'?d.paid<d.amt:debtTab==='lunas'?d.paid>=d.amt:(d.type===debtTab&&d.paid<d.amt));
  list.sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
  document.getElementById('debtGrid').innerHTML=list.length?list.map(d=>{
    const left=d.amt-d.paid, done=left<=0, pct=Math.min(100,d.paid/d.amt*100), overdue=!done&&d.due&&d.due<today();
    return `<div class="card"><div style="display:flex;align-items:flex-start;gap:12px"><div class="cat-ic" style="background:${d.type==='hutang'?'var(--red-bg)':'var(--green-bg)'}">${d.type==='hutang'?'📤':'📥'}</div><div style="flex:1;min-width:0"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="font-weight:600">${esc(d.name)}</b><span class="chip ${d.type==='hutang'?'r':'g'}">${d.type==='hutang'?'Hutang':'Piutang'}</span>${done?'<span class="chip">Lunas</span>':overdue?'<span class="chip a">Jatuh tempo!</span>':''}</div><div style="font-size:12px;color:var(--muted)">${d.note?esc(d.note)+' · ':''}${d.due?'Jatuh tempo '+fmtDate(d.due):'Tanpa jatuh tempo'}</div></div><div><button class="btn icon" onclick="openDebt('${d.id}')">✎</button><button class="btn icon del" onclick="delDebt('${d.id}')">🗑</button></div></div>
    <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:13px"><span style="color:var(--muted)">Dibayar ${fmt(d.paid)} / ${fmt(d.amt)}</span><b class="amt ${d.type==='hutang'?'out':'in'}">${done?'Selesai':'Sisa '+fmt(left)}</b></div>
    <div class="prog"><i style="width:${pct}%;background:${done?'var(--green)':'var(--blue-500)'}"></i></div>
    ${done?'':`<button class="btn ghost sm" style="margin-top:12px" onclick="openPay('${d.id}')">${d.type==='hutang'?'Bayar':'Terima pembayaran'}</button>`}</div>`;
  }).join(''):`<div class="card empty" style="grid-column:1/-1"><div class="big">🤝</div>Tidak ada catatan</div>`;
}

/* ===== DASHBOARD ===== */
function renderDash(){
  const m=ym(), list=txMonthly(m);
  document.getElementById('dashDate').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('dTotal').textContent=fmt(DB.wallets.reduce((a,w)=>a+walletBalance(w.id),0));
  document.getElementById('dIn').textContent=fmt(sum(list,'in')); document.getElementById('dOut').textContent=fmt(sum(list,'out'));
  const months=lastMonths(6,m).map(mm=>{const l=txMonthly(mm);return {l:new Date(mm+'-01T00:00').toLocaleDateString('id-ID',{month:'short'}),v:sum(l,'in'),v2:sum(l,'out')}});
  document.getElementById('dashChart').innerHTML=barChart(months,{h:180,color:'#16a34a',color2:'#e5484d'});
  const rec=[...DB.tx].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)).slice(0,6);
  document.getElementById('dashRecent').innerHTML=rec.length?rec.map(t=>{const cls=t.type==='in'?'in':t.type==='out'?'out':'tf';return `<div class="tx-item"><div class="cat-ic">${catIcon(t.type,t.cat)}</div><div class="info"><b>${esc(t.note||t.cat)}</b><span>${esc(t.cat)} · ${fmtDate(t.date)} · ${esc(wName(t.wallet))}</span></div><div class="amt ${cls}">${t.type==='in'?'+':t.type==='out'?'−':''}${fmt(t.amt)}</div></div>`}).join(''):'<div class="empty">Belum ada transaksi</div>';
  const bi=budgetItems(m).slice(0,5);
  document.getElementById('dashBudget').innerHTML=bi.length?bi.map(it=>`<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13px"><span>${catIcon('out',it.cat)} ${esc(it.cat)}</span><span style="color:var(--muted)">${fmtS(it.used)} / ${fmtS(it.amt)}</span></div>${progHtml(it)}</div>`).join(''):'<div class="empty">Belum ada budget</div>';
}

/* ===== EXPORT/IMPORT ===== */
function exportData(){const a=document.createElement('a');a.href='data:application/json,'+encodeURIComponent(JSON.stringify(DB,null,2));a.download=`dompetku-${today()}.json`;a.click()}
function importData(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.wallets||!d.tx)throw 0;if(confirm('Ganti semua data dengan file ini?')){DB=d;DB.budgets=DB.budgets||[];DB.debts=DB.debts||[];save();toast('Data diimpor')}}catch{toast('File tidak valid')}};r.readAsText(f);inp.value=''}

/* ===== INIT ===== */
function renderAll(){fillWalletSelects();renderDash();renderTx();renderWallets();renderReport();renderBudget();renderSearch();renderDebts()}
['txMonth','repMonth','bdMonth'].forEach(id=>{const e=document.getElementById(id);e.value=ym();e.onchange=renderAll});
fillCatFilter(); renderAll();
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open'))});
