// Konstanta kategori, warna, dan penyimpanan data (localStorage)

/* ===== DATA ===== */
const CATS = {
  out: [['🍔','Makanan & Minuman'],['🚗','Transportasi'],['🛒','Belanja'],['🏠','Tagihan & Utilitas'],['🏥','Kesehatan'],['🎬','Hiburan'],['📚','Pendidikan'],['👕','Pakaian'],['🎁','Hadiah & Donasi'],['✈️','Liburan'],['💳','Cicilan'],['📦','Lainnya']],
  in: [['💰','Gaji'],['💼','Bisnis'],['🎯','Bonus'],['📈','Investasi'],['🎁','Hadiah'],['🔄','Pengembalian'],['📦','Lainnya']],
  transfer:[['🔁','Transfer']]
};
const WCOLORS = ['linear-gradient(135deg,#1552c4,#2f7bff)','linear-gradient(135deg,#0b2a5b,#1d63e8)','linear-gradient(135deg,#0e7490,#22d3ee)','linear-gradient(135deg,#047857,#34d399)','linear-gradient(135deg,#6d28d9,#a78bfa)','linear-gradient(135deg,#b45309,#fbbf24)','linear-gradient(135deg,#be123c,#fb7185)','linear-gradient(135deg,#334155,#64748b)'];
const PIE = ['#1d63e8','#2f7bff','#60a5fa','#0ea5e9','#14b8a6','#8b5cf6','#f59e0b','#ef4444','#64748b','#93c5fd','#a78bfa','#34d399'];

let DB = JSON.parse(localStorage.getItem('dompetku') || 'null') || {wallets:[],tx:[],budgets:[],debts:[]};
if(!DB.wallets.length && !DB.tx.length){
  DB.wallets=[{id:uid(),name:'Tunai',type:'Tunai',init:500000,color:0},{id:uid(),name:'Bank BCA',type:'Bank',init:3500000,color:1}];
}
function save(){localStorage.setItem('dompetku',JSON.stringify(DB));renderAll()}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
