/* Agri Wangi Berry Report v1.2.0 — isi landing page untuk mesin multi-model (js/landing.js)   [ MANDIRI ]
 * Dipakai oleh index.html (landing publik) dan oleh pratinjau di Pengaturan → Landing Page.
 * Isi hanya fakta tentang aplikasi + teks yang diisi Manager. Tidak ada angka, testimoni, atau kontak karangan. */
(function () {
  const BAWAAN = {
    app: 'Agri Wangi Berry Report', model: 'terrain', warna: 'Warna Berry', warnaUtama: '#C8102E', warnaKedua: '#1D4B4B', warnaLatar: '#F0E6D0',
    judul: 'Agri Wangi Berry Report', slogan: 'Sistem laporan internal PT. Agri Wangi Berry',
    tagline: 'Laporan harian lintas divisi, rekap otomatis, persetujuan berjenjang.',
    tentang: 'Agri Wangi Berry Report mencatat seluruh kegiatan harian kebun — greenhouse, packing & pengiriman, hama & penyakit, serta fertigasi — lalu merangkumnya menjadi dashboard dan laporan mingguan/bulanan yang disetujui berjenjang sampai Direktur.',
    gambar: [], video: '', kontak: '', alamat: '', telepon: '', email: '', jam: '',
    divisi: [{ kode: 'GH1', nama: 'Greenhouse 1 (GH1)' }, { kode: 'GH2', nama: 'Greenhouse 2 (GH2)' }, { kode: 'PACKING', nama: 'Packing & Pengiriman' }, { kode: 'HPT', nama: 'Hama & Penyakit (HPT)' }, { kode: 'FERTIGASI', nama: 'Fertigasi & Nutrisi' }],
    modul: 0
  };
  const MASUK = 'app.html#/masuk';
  function gabung(cfg) { const c = Object.assign({}, BAWAAN); Object.keys(cfg || {}).forEach(k => { if (cfg[k] !== '' && cfg[k] !== null && cfg[k] !== undefined) c[k] = cfg[k]; }); if (!Array.isArray(c.gambar)) c.gambar = []; if (!Array.isArray(c.divisi) || !c.divisi.length) c.divisi = BAWAAN.divisi; return c; }

  function konten(cfg) {
    const c = gabung(cfg);
    const asli = c.gambar.map(g => g.url || g).filter(Boolean);
    const img = asli.length ? asli : ['assets/masuk-default.jpg'];   // v1.2: tanpa unggahan → foto kebun bawaan, bukan gradasi
    const gb = (i) => img[i] || ('art:' + i);           // tanpa gambar → gradasi warna merek (bukan foto karangan)
    const fitur = [
      { icon: 'leaf', title: 'Input harian dari HP', text: 'Formulir sama dengan format Excel tiap divisi, rumus terhitung otomatis, lengkap dengan foto bukti.', image: gb(0) },
      { icon: 'award', title: 'Dashboard per divisi', text: 'Target vs capaian, tren, tabel yang bisa dicari, dan mode slide untuk rapat.', image: gb(1) },
      { icon: 'shield', title: 'Isu lintas divisi otomatis', text: 'Angka yang melewati ambang langsung menjadi tiket dengan notifikasi dan eskalasi.', image: gb(2) },
      { icon: 'check', title: 'Persetujuan berjenjang', text: 'SPV mengajukan, Manager menyetujui, Direktur mengesahkan dengan segel digital.', image: gb(3) }
    ];
    const faq = [
      { q: 'Siapa yang bisa masuk?', a: 'Hanya karyawan yang sudah didaftarkan Manager, memakai akun Google perusahaan atau kode yang dikirim ke email terdaftar.' },
      { q: 'Bagaimana bila sinyal di greenhouse hilang?', a: 'Input tetap bisa diisi. Data disimpan di perangkat dan dikirim otomatis saat koneksi pulih.' },
      { q: 'Format laporan apa saja yang bisa diunduh?', a: 'PDF, Excel, Word, PowerPoint, dan CSV — termasuk bundel catatan budidaya untuk kebutuhan GlobalGAP.' },
      { q: 'Apakah data Excel lama bisa dipindahkan?', a: 'Bisa. Fitur Impor Excel menampilkan pratinjau dan peringatan, dan tidak ada baris yang dibuang.' }
    ];
    const kontakTeks = [c.telepon && ('Telepon: ' + c.telepon), c.email && ('Email: ' + c.email), c.jam && ('Jam layanan: ' + c.jam), c.alamat && ('Alamat: ' + c.alamat), c.kontak].filter(Boolean).join(' · ');
    if (kontakTeks) faq.push({ q: 'Bagaimana menghubungi pengelola aplikasi?', a: kontakTeks });
    const stats = [[c.divisi.length, 'Divisi terhubung'], [c.modul, 'Modul data harian'], [3, 'Tingkat persetujuan'], [5, 'Format ekspor']].map(s => ({ num: s[0] > 0 ? String(s[0]) : '', label: s[1] }));
    return {
      eyebrow: c.slogan, title: c.judul, subtitle: c.tagline,
      cta2: { label: 'Masuk ke Aplikasi', link: MASUK }, hero: img.length ? img.slice(0, 6) : ['art:hero'], video: c.video || '',
      about: { eyebrow: 'Tentang Aplikasi', title: 'Satu tempat untuk data kebun', text: c.tentang, text2: '', image: gb(0), image2: gb(1), bullets: ['Lima divisi dalam satu aplikasi: ' + c.divisi.map(d => d.kode).join(', '), 'Rumus Excel tiap divisi terhitung otomatis', 'Tetap bisa diisi saat sinyal hilang', 'Ekspor PDF, Excel, Word, dan PowerPoint', 'Jejak audit yang bisa diverifikasi'], badge: {} },
      featuresTitle: { eyebrow: 'Fitur Utama', title: 'Yang bisa dilakukan', text: c.tagline },
      features: fitur, stats,
      productsTitle: { eyebrow: '', title: '', text: '' }, products: [],
      steps: { eyebrow: 'Cara Kerja', title: 'Dari lapangan sampai meja Direktur', items: [
        { title: 'Staf & SPV input', text: 'Data harian dicatat langsung di aplikasi atau diimpor dari Excel.' },
        { title: 'Sistem merangkum', text: 'Dashboard, persen, grafik, dan isu terbentuk otomatis.' },
        { title: 'Manager meninjau', text: 'Laporan SPV disetujui atau dikembalikan, lalu diteruskan ke Direktur.' },
        { title: 'Direktur mengesahkan', text: 'Catatan arahan dan segel digital pada laporan final.' }] },
      gallery: { eyebrow: 'Galeri', title: 'Kegiatan Kebun', images: asli.slice(0, 6) },
      testi: { title: '', items: [] },
      faq: { eyebrow: 'FAQ', title: 'Pertanyaan Umum', items: faq },
      cta: { title: 'Siap mulai bekerja?', text: 'Masuk dengan akun yang sudah didaftarkan Manager.', label: 'Masuk', link: MASUK },
      show: { about: true, features: true, stats: true, products: false, steps: true, gallery: asli.length > 0, testi: false, faq: true, cta: true }
    };
  }

  function pasang(host, cfg) {
    const c = gabung(cfg);
    const P = { identitas_nama: 'PT. AGRI WANGI BERRY', identitas_slogan: c.slogan, warna_utama: c.warnaUtama, warna_kedua: c.warnaKedua, warna_latar: c.warnaLatar, landing_warna: c.warna, kontak_telepon: c.telepon, kontak_email: c.email, kontak_alamat: c.alamat, kontak_jam: c.jam };
    return window.AWL.pasang(host, c.model, { P, D: {}, foto: (id) => id, mode: 'beranda', konten: konten(c) });
  }
  window.AWBLanding = { BAWAAN, gabung, konten, pasang, MASUK };
})();
