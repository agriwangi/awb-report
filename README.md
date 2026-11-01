# Agri Wangi Berry Report — Frontend v1.0.0  🟩 MANDIRI (GitHub Pages)

Frontend statis untuk aplikasi laporan harian lintas divisi PT. Agri Wangi Berry (GH1, GH2, Packing & Pengiriman, HPT, Fertigasi). Backend berupa Google Apps Script REST API (`Kode.gs`, terpisah, **tidak** disertakan di repository ini).

## Struktur

```
index.html        Landing page publik → tombol Masuk
app.html          Aplikasi (SPA, router hash #/...)
css/app.css       Token warna terang/gelap + komponen
js/config.js      SATU-SATUNYA yang perlu diubah: GAS_URL (/exec)
js/api.js         fetch ke GAS: batch, dedupe, SWR, antrean offline, Perf.table()
js/ui.js          Komponen UI: kartu KPI, grafik, formulir, modal, toast
js/alat.js        Ekspor PDF/Excel/Word/PPT/CSV, mode slide, tabel data, wizard impor
js/halaman.js     Semua halaman
js/app.js         Shell (sidebar, topbar, bottom-nav), boot, router
assets/           Logo & favicon
```

## Konfigurasi

Edit `js/config.js`:

```js
window.APP_CONFIG = { GAS_URL: 'https://script.google.com/macros/s/ID_DEPLOYMENT/exec', VERSI: '1.0.0' };
```

Tidak ada rahasia di frontend. Client ID Google diambil dari server (`auth.config`), dan token sesi dikirim di body POST.

## Rute

`#/masuk` · `#/masuk/darurat` · `#/beranda` · `#/dashboard` · `#/div/GH1|GH2|PACKING|HPT|FERTIGASI[?tab=TABEL]` · `#/input` · `#/isu[/ID]` · `#/gagasan` · `#/notifikasi` · `#/laporan[/ID]` · `#/ekspor` · `#/audit` · `#/pengaturan?tab=...` · `#/impor`

Panduan lengkap ada di `PANDUAN-INSTALASI-v1.0.md`.
