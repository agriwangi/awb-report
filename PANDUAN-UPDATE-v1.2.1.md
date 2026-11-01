# Panduan Update v1.2.1 — Agri Wangi Berry Report

**Dari v1.2.0 ke v1.2.1 · 1 November 2026**

## Yang berubah

1. **Tanda air "AGRI WANGI BERRY" di Pratinjau A4 (Ekspor & GlobalGAP) tidak lagi menumpuk.**
   - Penyebab: teks terlalu besar untuk lebar pratinjau sehingga terpecah dua baris, dan jarak barisnya lebih kecil dari ukuran huruf. Akibatnya "AGRI WANGI" dan "BERRY" saling menimpa.
   - Perbaikan: tanda air dibuat **satu baris**, ukurannya menyesuaikan lebar pratinjau (komputer maupun HP).
   - Berkas PDF hasil ekspor tidak berubah (tanda air hanya ada di pratinjau layar).
2. **Pengaturan gambar slide landing page** di **Pengaturan → Landing Page → 4. Gambar Slide & Video**:

   | Pengaturan | Pilihan | Bawaan |
   |---|---|---|
   | Lama tiap gambar | 3 / 5 / 7 / 10 / 15 detik, atau Tidak berganti | 5 detik |
   | Efek pergantian | Pudar (fade), Zoom perlahan, Geser | Pudar |
   | Kegelapan lapisan foto | 0–60 % (agar judul terbaca di atas foto terang) | 0 % |
   | Ikut slide (per gambar) | Centang = ikut berganti di bagian atas; tidak dicentang = hanya di galeri | Semua dicentang |
   | Fokus (per gambar) | Atas / Tengah / Bawah — bagian foto yang dipertahankan saat dipotong | Tengah |

   - Label di pojok kiri atas tiap gambar menunjukkan **SLIDE 1, SLIDE 2, …** atau **GALERI**.
   - Urutan slide tetap diatur dengan tombol panah ‹ ›.
   - Semua perubahan langsung terlihat di pratinjau, lalu tampil di situs setelah klik **Simpan Landing**.
   - Pengaturan disimpan di sheet Pengaturan (`LANDING_SLIDE`). Baris ini dibuat otomatis saat pertama kali disimpan.
   - Pengunjung yang mengaktifkan mode "kurangi gerakan" di HP/komputernya otomatis melihat efek pudar biasa.

Fitur lain dan tampilan lain **tidak diubah**.

## Berkas

| Berkas | Untuk | Keterangan |
|---|---|---|
| `Kode_v1.2.1_UNTUK_APPS_SCRIPT.gs` | 🟦 **UNTUK APPS SCRIPT** | Menggantikan seluruh isi `Kode.gs`. `appsscript.json` tidak berubah |
| `AWB-Report-Frontend-v1.2.1_MANDIRI_UPDATE.zip` | 🟩 **MANDIRI** (GitHub Pages) | Tanpa `js/config.js`, jadi URL Anda tetap aman |

Berkas yang berubah di frontend: `app.html`, `index.html`, `js/halaman.js`, `js/landing.js`, `js/landing-awb.js`, `css/tw.css`.

## Langkah update (urutan: backend dulu)

### 1. Apps Script (🟦 UNTUK APPS SCRIPT)

1. Buka proyek Apps Script → `Kode.gs` → pilih semua (Ctrl+A) → hapus.
2. Tempel isi `Kode_v1.2.1_UNTUK_APPS_SCRIPT.gs` → **Simpan** (Ctrl+S).
3. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**
   Jangan pilih "New deployment", karena URL /exec akan berubah.
4. Tidak perlu menjalankan fungsi apa pun. Tidak ada izin baru.

Cek: buka `URL_EXEC?action=landing` di browser. Harus muncul `"versi":"1.2.1"` dan bagian `"slide"`.

### 2. Frontend (🟩 MANDIRI)

1. Ekstrak `AWB-Report-Frontend-v1.2.1_MANDIRI_UPDATE.zip`.
2. Salin semua isinya ke folder repo Anda, timpa berkas lama. **`js/config.js` milik Anda tidak tersentuh.**
3. Opsional: di `js/config.js` ubah `VERSI: '...'` menjadi `VERSI: '1.2.1'`. Ini hanya mengubah nomor versi yang tampil di menu kiri (di tangkapan layar Anda masih tertulis v1.0.0). `GAS_URL` jangan diubah.
4. Di terminal, dari folder repo:

```bash
git add .
git commit -m "Update v1.2.1: tanda air pratinjau ekspor + pengaturan slide landing"
git push
```

5. Tunggu 1–2 menit, lalu buka aplikasi dan tekan **Ctrl+Shift+R**.

## Cek setelah update

1. **Ekspor & GlobalGAP:** tanda air di Pratinjau A4 terbaca satu baris miring "AGRI WANGI BERRY".
2. **Pengaturan → Landing Page → 4:** muncul kotak **Pengaturan slide** serta pilihan **Ikut slide** dan **Fokus** di bawah tiap gambar.
   - Bila muncul kotak kuning "Apps Script masih v…", ulangi langkah 1.3 (Deploy sebagai **New version**).
3. Ubah lama tiap gambar menjadi 7 detik dan efek Zoom perlahan → **Simpan Landing** → buka situs. Slide berganti tiap ±7 detik dengan efek zoom.

## Hasil uji (simulator Apps Script + Chromium)

- Backend 125/125, landing backend 21/21, paket data 15/15, peramban desktop & HP 94/94 lulus.
- Uji baru:
  - pengaturan slide tersimpan dan terpakai di situs (7 detik, zoom, lapisan 30 %, fokus atas, gambar ke-2 hanya galeri);
  - nilai tidak sah dikembalikan ke nilai aman;
  - SPV tidak bisa mengubah pengaturan slide;
  - tanda air satu baris.
- Belum diuji di akun Google asli: kecepatan Apps Script saat "bangun" dan tampilan foto Drive asli.
