/* Agri Wangi Berry Report v1.2.1 — isi landing page untuk mesin multi-model (js/landing.js)   [ MANDIRI ]
 * Dipakai oleh index.html (landing publik) dan oleh pratinjau di Pengaturan → Landing Page.
 * Isi hanya fakta tentang aplikasi + teks yang diisi Manager. Tidak ada angka, testimoni, atau kontak karangan. */
(function () {
  const BAWAAN = {
    app: 'Agri Wangi Berry Report', model: 'terrain', warna: 'Warna Berry', warnaUtama: '#C8102E', warnaKedua: '#1D4B4B', warnaLatar: '#F0E6D0',
    judul: 'Agri Wangi Berry Report', slogan: 'Sistem laporan internal PT. Agri Wangi Berry',
    tagline: 'Laporan harian lintas divisi, rekap otomatis, persetujuan berjenjang.',
    tentang: 'Agri Wangi Berry Report mencatat seluruh kegiatan harian kebun — greenhouse, packing & pengiriman, hama & penyakit, serta fertigasi — lalu merangkumnya menjadi dashboard dan laporan mingguan/bulanan yang disetujui berjenjang sampai Direktur.',
    gambar: [], slide: { durasi: 5, efek: 'pudar', gelap: 0, item: {} }, video: '', kontak: '', alamat: '', telepon: '', email: '', jam: '',
    divisi: [{ kode: 'GH1', nama: 'Greenhouse 1 (GH1)' }, { kode: 'GH2', nama: 'Greenhouse 2 (GH2)' }, { kode: 'PACKING', nama: 'Packing & Pengiriman' }, { kode: 'HPT', nama: 'Hama & Penyakit (HPT)' }, { kode: 'FERTIGASI', nama: 'Fertigasi & Nutrisi' }],
    modul: 0
  };
  const MASUK = 'app.html#/masuk';
  /* v1.2.1 — pengaturan slide: lama ganti, efek, kegelapan lapisan, dan per gambar (tampil di slide, titik fokus) */
  const DURASI = [0, 3, 5, 7, 10, 15], EFEK = ['pudar', 'zoom', 'geser'], FOKUS = { atas: 'center top', tengah: 'center', bawah: 'center bottom' };
  function normSlide(x, gambar) {
    if (typeof x === 'string') { try { x = JSON.parse(x); } catch (e) { x = {}; } }
    x = x && typeof x === 'object' ? x : {};
    const d = +x.durasi, g = Math.round(+x.gelap || 0), item = {};
    (gambar || []).forEach(gb => { const id = gb && gb.id; if (!id) return; const it = (x.item || {})[id] || {}; item[id] = { slide: it.slide !== false, fokus: FOKUS[it.fokus] ? it.fokus : 'tengah' }; });
    return { durasi: DURASI.indexOf(d) >= 0 ? d : 5, efek: EFEK.indexOf(x.efek) >= 0 ? x.efek : 'pudar', gelap: Math.max(0, Math.min(60, g)), item };
  }
  const itemSlide = (c, g) => (g && g.id && c.slide.item[g.id]) || { slide: true, fokus: 'tengah' };
  function gambarSlide(c) { const pilih = c.gambar.filter(g => (g.url || g) && itemSlide(c, g).slide !== false); return (pilih.length ? pilih : c.gambar.slice(0, 1)).slice(0, 12); }
  function gayaSlide(c) {
    const s = c.slide, fok = gambarSlide(c).map(g => FOKUS[itemSlide(c, g).fokus] || 'center');
    const lama = (s.durasi || 6) + 1.5;
    let css = fok.map((f, i) => `.slides>.sl:nth-child(${i + 1}){background-position:${f}}`).join('');
    if (s.efek === 'zoom') css += `.slides>.sl{transform:scale(1.1);transition:opacity 1.2s,transform ${lama}s linear}.slides>.sl.on{transform:scale(1)}`;
    if (s.efek === 'geser') css += `.slides{overflow:hidden}.slides>.sl{transform:translateX(8%);transition:opacity .9s,transform .9s ease}.slides>.sl.on{transform:none}`;
    if (s.gelap) css += `.slides::after{content:"";position:absolute;inset:0;background:#000;opacity:${s.gelap / 100};pointer-events:none}`;
    return css + '@media (prefers-reduced-motion:reduce){.slides>.sl{transform:none!important;transition:opacity .3s!important}}';
  }
  function gabung(cfg) { const c = Object.assign({}, BAWAAN); Object.keys(cfg || {}).forEach(k => { if (cfg[k] !== '' && cfg[k] !== null && cfg[k] !== undefined) c[k] = cfg[k]; }); if (!Array.isArray(c.gambar)) c.gambar = []; c.slide = normSlide(c.slide, c.gambar); if (!Array.isArray(c.divisi) || !c.divisi.length) c.divisi = BAWAAN.divisi; return c; }

  function konten(cfg) {
    const c = gabung(cfg);
    const asli = c.gambar.map(g => g.url || g).filter(Boolean);
    const slideImg = gambarSlide(c).map(g => g.url || g).filter(Boolean);
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
      cta2: { label: 'Masuk ke Aplikasi', link: MASUK }, hero: slideImg.length ? slideImg : img.slice(0, 1), video: c.video || '',
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
    host._slDur = c.slide.durasi * 1000;   // 0 = slide tidak berganti
    const h = window.AWL.pasang(host, c.model, { P, D: {}, foto: (id) => id, mode: 'beranda', konten: konten(c) });
    const sr = host.shadowRoot; if (sr) { const st = document.createElement('style'); st.id = 'awb-slide'; st.textContent = gayaSlide(c); sr.appendChild(st); }
    return h;
  }
  window.AWBLanding = { BAWAAN, gabung, normSlide, FOKUS, konten, pasang, MASUK };
})();
