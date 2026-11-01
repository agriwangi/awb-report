# Panduan Instalasi — Agri Wangi Berry Report v1.1

Untuk Kang Must. Ikuti urutan bagian ini dari atas ke bawah. Perkiraan waktu: 30–45 menit.

---

## 0. Daftar berkas (dua jenis, jangan tertukar)

| Berkas | Untuk | Cara pakai |
|---|---|---|
| `Kode_v1.1_UNTUK_APPS_SCRIPT.gs` | 🟦 **UNTUK APPS SCRIPT** | Isinya disalin-tempel ke berkas `Kode.gs` di editor script.google.com |
| `appsscript_v1.1_UNTUK_APPS_SCRIPT.json` | 🟦 **UNTUK APPS SCRIPT** | Isinya disalin-tempel ke `appsscript.json` di editor |
| `AWB-Report-Frontend-v1.1_MANDIRI.zip` | 🟩 **MANDIRI (GitHub Pages)** | Diekstrak, lalu di-*push* ke GitHub |
| `PANDUAN-INSTALASI-v1.1.md` | Panduan | Yang sedang Anda baca |

Di dalam ZIP ada **`index.html` (huruf kecil)**. Itu landing page publik multi-model, **bukan** `Index.html` gaya Apps Script. Aplikasinya ada di `app.html`. Mesin landing ada di `js/landing.js` dan `js/landing-awb.js`. Tidak ada berkas `.gs` di dalam ZIP.

---

## 1. Backend — Google Apps Script

1. Buka **https://script.google.com**, lalu klik **Proyek baru**. Pakai akun Google kebun, karena semua data akan tersimpan di Drive akun ini.
2. Ganti nama proyek menjadi `Agri Wangi Berry Report v1.0`.
3. Hapus isi `Kode.gs` bawaan, lalu tempel seluruh isi **`Kode_v1.1_UNTUK_APPS_SCRIPT.gs`** (± 1.550 baris).
4. Tampilkan manifest: buka ⚙️ **Setelan proyek** dan centang **"Tampilkan file manifes appsscript.json di editor"**. Buka `appsscript.json`, lalu ganti isinya dengan berkas **`appsscript_v1.1_UNTUK_APPS_SCRIPT.json`**.
5. Klik 💾 **Simpan**.
6. Pilih fungsi **`setupAppEnvironment`**, lalu klik ▶ **Jalankan**. Berikan semua izin yang diminta: Spreadsheet, Drive, Email, dan Trigger. Jika muncul peringatan "Google belum memverifikasi aplikasi ini", pilih **Lanjutan → Buka (tidak aman)**. Ini normal untuk script milik sendiri.
7. Buka **Log eksekusi** dan catat dua hal:
   - Baris `🔐 AKSES DARURAT … darurat / XXXXXXXXXXXXXXXX`. **Kata sandi ini hanya tampil sekali.** Simpan di tempat aman.
   - Tautan folder Drive `📁 Agri Wangi Berry Report` beserta 5 spreadsheet (INTI, GH, PACKING, HPT, FERTIGASI).

   Fungsi ini aman dijalankan ulang. Rahasia yang sudah ada tidak akan ditimpa dan data tidak akan dobel.
8. Deploy aplikasi:
   - Buka **Deploy → New deployment → ⚙️ Web app**.
   - **Execute as:** `Me`.
   - **Who has access:** `Anyone`. Ini wajib agar frontend di GitHub Pages bisa memanggil API. Keamanannya dijaga oleh token sesi dan hak akses di server.
   - Klik **Deploy**, lalu salin **URL Web app** yang berakhiran `/exec`.
9. Uji URL tersebut dengan membuka `URL/exec?action=ping` di browser. Hasilnya harus berupa JSON `{"success":true,...}`.

### Script Properties (otomatis, jangan diketik manual)

`setupAppEnvironment()` mengisi kunci-kunci berikut di **Setelan proyek → Script Properties**:

- **ID database:** `SS_INTI`, `SS_GH`, `SS_PACKING`, `SS_HPT`, `SS_FERTIGASI`, `FOLDER_ROOT`
- **Rahasia sesi:** `SESSION_SECRET`
- **Akses darurat:** `EMERGENCY_USER`, `EMERGENCY_SALT`, `EMERGENCY_PASS_HASH`

Tidak ada satu pun rahasia yang tersimpan di kode, di Sheets, atau di GitHub. **Jangan hapus `SESSION_SECRET`.** Jika terhapus, semua orang akan logout dan segel laporan lama tidak bisa diverifikasi lagi.

### Setiap kali kode backend diperbarui

Buka **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. Jangan memilih *New deployment*, karena URL `/exec` akan berganti.

---

## 2. Frontend — GitHub Pages (lewat terminal, bukan upload web)

1. Ekstrak `AWB-Report-Frontend-v1.1_MANDIRI.zip`. Folder hasil ekstraksi **adalah** folder repository.
2. Buka `js/config.js` dengan Notepad, lalu ganti `GANTI_DENGAN_ID_DEPLOYMENT` dengan URL `/exec` dari langkah 1.8:
   ```js
   window.APP_CONFIG = { GAS_URL: 'https://script.google.com/macros/s/AKfy.../exec', VERSI: '1.1.0' };
   ```
3. Buat repository **Public** baru di github.com, misalnya `awb-report`. **Jangan** centang README.
4. Buka PowerShell di folder hasil ekstraksi. Caranya: klik address bar File Explorer, ketik `powershell`, lalu tekan Enter. Ketik `dir` dan pastikan baris teratas memuat **`index.html`, `app.html`, `css`, `js`, dan `assets`**.
5. Jalankan perintah berikut satu per satu:
   ```powershell
   git init
   git add .
   git commit -m "AWB Report v1.0"
   git branch -M main
   git remote add origin https://github.com/USERNAME/awb-report.git
   git push -u origin main
   ```
   Saat diminta *Password*, tempel **Personal Access Token** (`ghp_…`, buat di github.com/settings/tokens dengan scope `repo`). Saat token ditempel, layar memang tampak kosong. Itu normal.
6. Di repository, buka **Settings → Pages → Deploy from a branch → `main` / root → Save**, lalu centang **Enforce HTTPS**.
7. Tunggu 1–2 menit, lalu buka `https://USERNAME.github.io/awb-report/`. Halaman pertama adalah landing page. Tombol **Masuk** membuka aplikasi.

Untuk memperbarui frontend nanti, jalankan `git add .`, lalu `git commit -m "..."`, lalu `git push`. Setelah itu tekan **Ctrl+Shift+R** di browser.

---

## 3. Login pertama & pengguna

1. Buka `https://USERNAME.github.io/awb-report/app.html#/masuk/darurat`. Halaman ini sengaja tidak ditautkan dari mana pun.
2. Masuk dengan `darurat` dan kata sandi dari log setup.
3. Buka **Keamanan & RBAC → Matriks Pengguna → Tambah Pengguna**, lalu daftarkan pengguna. Contoh:

   | Peran | Divisi | Contoh |
   |---|---|---|
   | MANAGER | `*` (Semua) | Mengelola user & akses |
   | DIREKTUR | `*` | Melihat semua, sign-off |
   | SPV | `GH1` / `GH2` / `PACKING,HPT` / `FERTIGASI` | Girindra / Wahyu / Shafan / Prasetyo |
   | STAF | divisinya | Input harian |

4. Setelah Manager terdaftar, gunakan akun Manager untuk pekerjaan sehari-hari. Akses darurat hanya untuk keadaan darurat.

### Login (dua cara, keduanya aktif)

- **Kode email (OTP):** langsung berfungsi. Pengguna mengetik email terdaftar, lalu kode 6 digit dikirim lewat email dan berlaku 10 menit.
- **Tombol "Login dengan Google":** perlu Client ID, dan ini sekali saja:
  1. Buka https://console.cloud.google.com, buat proyek, lalu buka **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
  2. Di **Authorized JavaScript origins**, isi `https://USERNAME.github.io`.
  3. Salin Client ID (`…apps.googleusercontent.com`).
  4. Di aplikasi, buka **Pengaturan → Keamanan & Login**, tempel Client ID, lalu klik **Simpan**. Client ID disimpan di Script Properties.

---

## 4. Pengaturan awal yang disarankan

- **Pengaturan → Target Produksi:** isi target per divisi agar kartu "Target vs Capaian" terisi.
- **Pengaturan → Parameter & Ambang:** faktor 8,854, konstanta 0,018, pengali 3 / 2,5 / 4,5, pembagi Aphid 5, ambang hama, ambang EC/pH, dan batas reject. Semua bisa diubah tanpa menyentuh kode.
- **Pengaturan → Daftar Master:** bay, grower, lokasi scouting, pestisida, kemasan, dan material. Data contoh sudah terisi dan bisa disesuaikan.
- **Pengaturan → Landing Page** (khusus Manager), lihat bagian 4a.

### 4a. Mengelola landing page (11 model)

Landing page di `https://agriwangi.github.io/awb-report/` memakai mesin multi landing 11 model milik Kang Must (sama dengan situs Berry). Semua pengaturan dilakukan dari **Pengaturan → Landing Page** dengan pratinjau langsung untuk Desktop dan HP:

1. **Model Tampilan:** klik salah satu dari 11 kartu (Donal, Josie, Terrain, Chaya, Oolong, Garten, Lawn, Kabut, Kedai, Rempah, Chun). Bawaannya Terrain.
2. **Warna:** Warna Berry (hijau tua), Merah Stroberi, atau Warna model. Tiga warna dasar bisa diganti dengan pemilih warna.
3. **Teks:** slogan, judul, kalimat pembuka, dan teks Tentang.
4. **Gambar Slide & Video:** unggah JPG/PNG/WEBP (otomatis diperkecil, maksimal 12 gambar dan 5 MB per gambar). Gambar berganti otomatis di bagian atas dan tampil di galeri. Urutan bisa digeser dengan tombol ‹ ›. Video berupa tautan YouTube atau `.mp4`, diputar otomatis tanpa suara (aturan peramban).
5. **Kontak:** telepon, email, jam layanan, dan alamat. Kosongkan bila tidak ingin ditampilkan. Sistem tidak mengarang kontak.
6. Klik **Simpan Landing**. Perubahan langsung tampil di situs. Pengunjung yang pernah membuka situs akan melihat versi baru setelah muat ulang.

Gambar disimpan di folder Drive **Landing Media** dan dibagikan "siapa pun dengan tautan (lihat saja)" agar bisa tampil untuk pengunjung. Jika akun Google Workspace melarang berbagi ke luar organisasi, aplikasi akan memberi peringatan dan gambar tidak tampil bagi pengunjung. Hapus gambar dari editor untuk memindahkannya ke Sampah Drive.

---

## 5. Memindahkan data Excel lama

- **Impor Excel** (menu Alat Data): unggah `.xlsx`, periksa pratinjau, perhatikan peringatan, lalu klik **Impor**. Tidak ada baris yang dibuang. Data uji (mis. nama "Agus") dan duplikat **ditandai**, bukan dihapus. Hasilnya tercatat di **Keamanan → Log Impor**.
- **Pengaturan → Migrasi Data Lama** (khusus Manager): tempel URL Google Sheet lama, pilih sheet dan tabel tujuan, jalankan **Pindai (dry-run)**, lalu **Jalankan Migrasi**. Sheet lama hanya dibaca, tidak diubah. Proses ini aman diulang (*upsert*).

---

## 6. Kuota & trigger

`setupAppEnvironment()` memasang dua trigger:

- **`keepWarm`** setiap 1 menit, untuk menjaga cache tetap hangat dan mengirim antrean email.
- **`tugasHarian`** setiap pagi, untuk eskalasi isu yang lewat tenggat dan isu selisih forecast.

`keepWarm` memakai sekitar 10–20 menit dari kuota trigger harian. Batas kuotanya sekitar 90 menit/hari untuk akun @gmail dan sekitar 6 jam untuk Workspace. Jika kuota terasa sempit, jalankan `matikanKeepWarm()`. Untuk menyalakan kembali, jalankan `nyalakanKeepWarm()`. Untuk memeriksa status cache, antrean, dan trigger, jalankan `cekPerforma()`.

Email notifikasi memakai kuota MailApp: sekitar 100/hari untuk @gmail dan sekitar 1.500/hari untuk Workspace.

---

## 7. Fungsi darurat di editor Apps Script

| Fungsi | Kegunaan |
|---|---|
| `resetAksesDarurat()` | Kata sandi darurat lupa atau terkunci. Sandi baru muncul di log. |
| `rotasiSecretSesi()` | Mengeluarkan semua orang dari semua perangkat. Segel laporan lama tidak bisa diverifikasi ulang. |
| `matikanKeepWarm()` / `nyalakanKeepWarm()` | Hemat kuota trigger. |
| `cekPerforma()` | Diagnosa cache, antrean, dan trigger. |

---

## 8. Rollback

1. Jalankan `matikanKeepWarm()`.
2. Tempel kode versi lama, lalu buka **Deploy → Manage deployments → Edit → New version**.
3. Untuk frontend, jalankan `git revert HEAD`, lalu `git push`.

Data di Sheets tidak berubah oleh rollback. Kolom yang sudah ditambahkan tetap ada, karena sistem hanya menambah kolom dan tidak pernah menghapusnya.

---

## 9. Kendala umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| "Konfigurasi belum lengkap" | `GAS_URL` belum diisi | Edit `js/config.js`, lalu push ulang |
| Situs GitHub 404 | `git init` dijalankan di folder yang salah | Pastikan `dir` menampilkan `index.html` di baris teratas |
| Tampilan tanpa gaya | Upload lewat web GitHub | Ulangi lewat terminal |
| "Server merespons 401/403" | Deploy bukan *Anyone* | Edit deployment, pilih Who has access = Anyone |
| Tombol Google tidak muncul | Client ID belum diisi | Pengaturan → Keamanan & Login |
| Kode OTP tidak masuk | Email belum terdaftar atau masuk folder spam | Cek Keamanan → Matriks Pengguna dan folder spam |
| Data lama masih tampil | Cache browser | Ctrl+Shift+R, atau Pengaturan → Info Sistem → Bersihkan cache lokal |

---

## 10. Hasil uji sebelum diserahkan

- **Backend (simulator GAS di Node):** 125 lulus, 0 gagal, ditambah uji landing 16 lulus, 0 gagal. Cakupannya meliputi setup idempoten, login darurat/OTP/token palsu, RBAC, rumus scouting dari 152 baris Excel, quick count (45.155 ≈ 45.154), forecast vs aktual 852,9 kg, rata suhu/RH, stok material, alur laporan SPV → Manager → Direktur → segel, lampiran Drive, isu otomatis, dan rantai audit.
- **Browser (Playwright + Chromium):** 75 lulus, 0 gagal, termasuk 11 model landing di desktop dan HP 390 px, editor landing, unggah gambar, simpan, dan tampilan publik setelah muat ulang. Diuji pada desktop 1366 px dan HP 360/390 px. Cakupannya meliputi landing, login, semua halaman Manager, segel Direktur di HP, input cepat Staf dari HP, pembatasan akses per divisi, mode offline, tema gelap, mode slide, dan ekspor PDF.

Pengujian ini dilakukan di simulator. Uji ulang sekali di akun Google asli setelah deploy, terutama login Google, kiriman email, dan unggah foto ke Drive.
