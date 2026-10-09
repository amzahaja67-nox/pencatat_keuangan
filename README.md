# DompetKu — Pencatat Keuangan Pribadi

Aplikasi web pencatat keuangan pribadi (HTML, CSS, JavaScript murni, tanpa library).

## Struktur Folder
```
keuangan/
├── index.html        # Struktur halaman & modal
├── css/
│   └── style.css     # Seluruh styling (tema gelap bernuansa biru, responsif)
├── js/
│   ├── data.js       # Kategori, palet warna, load/save localStorage
│   ├── utils.js      # Format rupiah/tanggal, hitung saldo, modal, toast
│   ├── charts.js     # Bar chart & donut chart (SVG)
│   └── app.js        # Logika fitur: transaksi, dompet, laporan, budget, cari, hutang piutang
└── README.md
```

## Cara Menjalankan
Buka `index.html` langsung di browser (double-click), atau jalankan server lokal:
```
python3 -m http.server 8080
```
lalu buka http://localhost:8080

## Fitur
- Catat transaksi (pemasukan, pengeluaran, transfer)
- Multi dompet dengan saldo otomatis
- Laporan bulanan + grafik
- Budgeting per kategori
- Cari & filter transaksi lama
- Hutang piutang dengan cicilan & jatuh tempo
- Export / Import data JSON
