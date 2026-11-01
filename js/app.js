/* Agri Wangi Berry Report v1.0.0 — router, shell (sidebar/topbar/bottom-nav), boot */
(function () {
  const { $, $$, esc, ik, toast, overlay, kepala, konfirmasi, galat } = UI;
  const H = () => window.Halaman;
  let shellSiap = false, notifBelum = 0, pollT = null, bootT = 0;

  function parseHash() {
    const h = (location.hash || '#/beranda').slice(2); const [jalur, qs] = h.split('?'); const q = {};
    (qs || '').split('&').filter(String).forEach(p => { const [k, v] = p.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { seg: jalur.split('/').filter(String), q };
  }
  function tema(t) { const g = t === 'gelap'; document.documentElement.classList.toggle('dark', g); try { localStorage.setItem('awb_tema', t); } catch (e) { } const b = $('#tb-tema'); if (b) b.innerHTML = ik(g ? 'light_mode' : 'dark_mode'); if (window.Chart) rute(); }
  function setNotif(n) { notifBelum = n || 0; $$('[data-notif-n]').forEach(e => { e.textContent = notifBelum > 99 ? '99+' : notifBelum; e.classList.toggle('hidden', !notifBelum); }); }

  /* ---------- SHELL ---------- */
  function navHtml() {
    const B = window.B, grup = {}; B.menu.forEach(m => (grup[m.grup] = grup[m.grup] || []).push(m));
    const ada = (k) => B.menu.some(m => m.kode === k);
    const ekstra = [];
    if ((B.hak.INPUT || '').includes('W')) ekstra.push({ kode: 'input', judul: 'Input Cepat Lapangan', ikon: 'edit_note' });
    if ((B.hak.IMPOR || '').includes('W')) ekstra.push({ kode: 'impor', judul: 'Impor Excel', ikon: 'upload_file' });
    return Object.keys(grup).map(g => `<p class="px-3 pt-4 pb-1 font-mono text-[10px] tracking-wider text-secondary uppercase">${esc(g)}</p>${grup[g].map(m => `<a href="#/${m.kode}" class="nav-item" data-nav="${m.kode}">${ik(m.ikon)}<span class="truncate">${esc(m.judul)}</span>${m.kode === 'isu' ? '' : ''}</a>`).join('')}`).join('')
      + (ekstra.length ? `<p class="px-3 pt-4 pb-1 font-mono text-[10px] tracking-wider text-secondary uppercase">Alat Data</p>${ekstra.map(m => `<a href="#/${m.kode}" class="nav-item" data-nav="${m.kode}">${ik(m.ikon)}<span>${m.judul}</span></a>`).join('')}` : '')
      + `<p class="px-3 pt-4 pb-1 font-mono text-[10px] tracking-wider text-secondary uppercase">Sistem</p><a href="#/notifikasi" class="nav-item" data-nav="notifikasi">${ik('notifications')}<span>Notifikasi</span><span class="ml-auto font-mono text-[10px] px-1.5 bg-crit-ink text-white hidden" data-notif-n></span></a><a href="#/pengaturan" class="nav-item" data-nav="pengaturan">${ik('settings')}<span>Pengaturan</span></a>`
      + (ada('hrd') ? '' : '');
  }
  function pasangShell() {
    const B = window.B, me = B.me, gelap = document.documentElement.classList.contains('dark');
    const inisial = (me.nama || me.email).split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('app').innerHTML = `
    <div id="banner-offline" class="hidden fixed top-0 inset-x-0 z-[60] bg-warn-bg border-b border-warn-ink text-warn-ink text-center font-mono text-mono-badge py-1">${ik('cloud_off', 'text-[14px]')} OFFLINE — input disimpan di perangkat & dikirim otomatis saat koneksi pulih</div>
    <aside class="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col bg-surface border-r border-hairline z-30" aria-label="Navigasi utama">
      <a href="#/beranda" class="h-12 flex items-center gap-2 px-3 border-b border-hairline shrink-0"><img src="assets/logo-awb.png" alt="" class="h-7"><div class="leading-tight min-w-0"><p class="font-display font-semibold text-[13px] truncate">AGRI WANGI BERRY</p><p class="font-mono text-[9px] text-secondary">REPORT v${esc(window.APP_CONFIG.VERSI)}</p></div></a>
      <nav class="flex-1 overflow-y-auto pb-3">${navHtml()}</nav>
      <div class="border-t border-hairline p-3 font-mono text-[10px] text-secondary">${esc(me.peran)} · ${esc(me.divisi.join(','))}</div></aside>
    <header class="fixed top-0 right-0 left-0 lg:left-60 h-12 bg-surface border-b border-hairline flex items-center gap-2 px-2 sm:px-3 z-30 no-print">
      <a href="#/beranda" class="lg:hidden flex items-center gap-2 min-w-0"><img src="assets/logo-awb.png" alt="Agri Wangi Berry" class="h-7"><span class="font-display font-semibold text-[13px] truncate hidden xs:inline">AWB REPORT</span></a>
      <div class="flex-1 min-w-0 hidden md:block"><p class="font-mono text-mono-badge text-secondary truncate" id="tb-jejak"></p></div><span class="flex-1 md:hidden"></span>
      <span id="tb-status" class="hidden sm:inline-flex items-center gap-1 font-mono text-mono-badge px-2 h-7 border border-ok-ink/40 bg-ok-bg text-ok-ink"><span class="w-1.5 h-1.5 bg-ok-ink"></span>ONLINE</span>
      <button class="tombol-ikon relative" id="tb-sync" title="Sinkronkan" aria-label="Sinkronkan data">${ik('sync')}<span class="absolute -top-0.5 -right-0.5 font-mono text-[9px] px-1 bg-warn-ink text-white hidden" id="tb-antre"></span></button>
      <button class="tombol-ikon" id="tb-tema" title="Ganti tema" aria-label="Ganti tema terang/gelap">${ik(gelap ? 'light_mode' : 'dark_mode')}</button>
      <a href="#/notifikasi" class="tombol-ikon relative" title="Notifikasi" aria-label="Notifikasi">${ik('notifications')}<span class="absolute -top-0.5 -right-0.5 font-mono text-[9px] px-1 bg-crit-ink text-white hidden" data-notif-n></span></a>
      <button class="flex items-center gap-2 h-9 pl-1 pr-2 border border-hairline hover:bg-surface-low" id="tb-user" aria-label="Menu pengguna"><span class="w-7 h-7 bg-primary text-on-primary flex items-center justify-center font-mono text-[11px]">${esc(inisial)}</span><span class="hidden md:block text-left leading-tight"><span class="block text-body-sm font-semibold max-w-[140px] truncate">${esc(me.nama || me.email)}</span><span class="block font-mono text-[10px] text-secondary">${esc(me.peran)}</span></span></button>
    </header>
    <main id="utama" class="lg:ml-60 pt-12 pb-24 lg:pb-8 min-h-screen"><div id="halaman" class="p-3 sm:p-4 lg:p-6 max-w-[1440px] mx-auto"></div></main>
    <nav class="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-surface border-t border-strong grid grid-cols-5 z-40 pb-aman no-print" aria-label="Navigasi bawah">
      ${[['beranda', 'home', 'Beranda'], [B.menu.some(m => m.kode === 'dashboard') ? 'dashboard' : (B.terlihat[0] ? 'div/' + B.terlihat[0] : 'beranda'), 'monitoring', 'Dashboard'], ['input', 'add_box', 'Input'], ['isu', 'assignment_late', 'Isu'], ['lainnya', 'menu', 'Lainnya']].map(x => `<a href="${x[0] === 'lainnya' ? '#' : '#/' + x[0]}" ${x[0] === 'lainnya' ? 'id="bn-lain"' : ''} data-bn="${x[0]}" class="flex flex-col items-center justify-center gap-0.5 text-secondary min-h-[44px] relative">${ik(x[1], x[0] === 'input' ? 'text-[28px]' : '')}<span class="font-mono text-[10px]">${x[2]}</span>${x[0] === 'lainnya' ? '<span class="absolute top-1.5 right-[30%] font-mono text-[9px] px-1 bg-crit-ink text-white hidden" data-notif-n></span>' : ''}</a>`).join('')}
    </nav>`;
    shellSiap = true;
    $('#tb-tema').onclick = () => tema(document.documentElement.classList.contains('dark') ? 'terang' : 'gelap');
    $('#tb-sync').onclick = async () => { const n = await API.Antrean.kirimSemua(); toast(n ? n + ' data antrean terkirim.' : 'Data disinkronkan.', 'info'); bootUlang(); };
    $('#tb-user').onclick = menuPengguna;
    $('#bn-lain').onclick = e => { e.preventDefault(); lainnya(); };
    const status = () => { const on = navigator.onLine; $('#banner-offline').classList.toggle('hidden', on); const s = $('#tb-status'); s.className = 'hidden sm:inline-flex items-center gap-1 font-mono text-mono-badge px-2 h-7 border ' + (on ? 'border-ok-ink/40 bg-ok-bg text-ok-ink' : 'border-warn-ink/40 bg-warn-bg text-warn-ink'); s.innerHTML = `<span class="w-1.5 h-1.5 ${on ? 'bg-ok-ink' : 'bg-warn-ink'}"></span>${on ? 'ONLINE' : 'OFFLINE'}`; };
    addEventListener('online', status); addEventListener('offline', status); status();
    const antre = () => { const n = API.Antrean.ambil().length, b = $('#tb-antre'); if (b) { b.textContent = n; b.classList.toggle('hidden', !n); } };
    addEventListener('awb:antrean', antre); addEventListener('awb:tersinkron', e => toast(e.detail + ' data offline berhasil tersinkron.')); antre();
    setNotif(B.notifBelum);
  }
  function menuPengguna() {
    const me = window.B.me;
    const o = overlay(`${kepala(esc(me.nama || me.email), esc(me.email) + ' · ' + esc(me.peran))}<div class="p-2">${[['#/pengaturan', 'settings', 'Pengaturan & tampilan'], ['#/notifikasi', 'notifications', 'Notifikasi'], ['#/pengaturan?tab=sistem', 'info', 'Info sistem']].map(x => `<a href="${x[0]}" data-tutup class="nav-item">${ik(x[1])}${x[2]}</a>`).join('')}<button class="nav-item w-full text-crit-ink" id="mu-keluar">${ik('logout')}Keluar</button></div>`, { lebar: 'sm:max-w-sm' });
    $('#mu-keluar', o.el).onclick = () => { o.tutup(); keluar(false); };
  }
  function lainnya() {
    const B = window.B;
    const o = overlay(`${kepala('Menu Lainnya')}<div class="p-2 max-h-[70vh] overflow-y-auto">${B.menu.map(m => `<a href="#/${m.kode}" data-tutup class="nav-item">${ik(m.ikon)}${esc(m.judul)}</a>`).join('')}${(B.hak.IMPOR || '').includes('W') ? `<a href="#/impor" data-tutup class="nav-item">${ik('upload_file')}Impor Excel</a>` : ''}<a href="#/notifikasi" data-tutup class="nav-item">${ik('notifications')}Notifikasi <span class="ml-auto font-mono text-[10px] px-1.5 bg-crit-ink text-white ${notifBelum ? '' : 'hidden'}">${notifBelum}</span></a><a href="#/pengaturan" data-tutup class="nav-item">${ik('settings')}Pengaturan</a><button class="nav-item w-full text-crit-ink" id="ln-keluar">${ik('logout')}Keluar</button></div>`, { lebar: 'sm:max-w-sm' });
    o.el.addEventListener('click', e => { if (e.target.closest('a[data-tutup]')) o.tutup(); });
    $('#ln-keluar', o.el).onclick = () => { o.tutup(); keluar(false); };
  }
  async function keluar(semua) {
    try { await API.api('auth.keluar', { semua: !!semua }); } catch (e) { }
    API.Sesi.hapus(); window.B = null; shellSiap = false; clearInterval(pollT);
    try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) { }
    location.hash = '#/masuk'; rute();
  }

  /* ---------- BOOT ---------- */
  async function mulai() {
    if (!API.konfigSiap()) { document.getElementById('app').innerHTML = `<div class="min-h-screen flex items-center justify-center p-4"><div class="kartu p-5 max-w-md"><img src="assets/logo-awb.png" class="h-10" alt=""><h1 class="font-display text-headline-lg mt-3">Konfigurasi belum lengkap</h1><p class="mt-2 text-body-md">Isi <code class="font-mono">GAS_URL</code> di berkas <code class="font-mono">js/config.js</code> dengan URL Web App Apps Script (berakhiran <code>/exec</code>), lalu muat ulang halaman.</p></div></div>`; return; }
    if (!API.Sesi.token) { shellSiap = false; if (!/^#\/masuk/.test(location.hash)) location.hash = '#/masuk'; return rute(); }
    try {
      await API.swr('boot', {}, (d) => { const awal = !window.B; window.B = d; if (awal || !shellSiap) { pasangShell(); rute(); } else { setNotif(d.notifBelum); } }, 0);
      bootT = Date.now(); jalankanPolling();
    } catch (e) {
      if (!API.Sesi.token) return;
      document.getElementById('app').innerHTML = `<div class="min-h-screen flex items-center justify-center p-4"><div class="max-w-md w-full">${galat(e.message, 'boot-ulang')}</div></div>`; $('#boot-ulang').onclick = mulai;
    }
  }
  async function bootUlang() { const r = await API.api('boot', {}); if (r.success) { window.B = r.data; try { localStorage.setItem('awb_swr_boot{}', JSON.stringify({ t: Date.now(), d: r.data })); } catch (e) { } pasangShell(); rute(); } }
  function jalankanPolling() {
    clearInterval(pollT);
    pollT = setInterval(async () => {
      if (!window.B || !API.Aktivitas.due('notif', 60000, 300000)) return;
      try { const r = await API.api('notif.list', { belum: true, batas: 5 }); if (r.success) { if (r.data.belum > notifBelum && r.data.rows[0]) toast(r.data.rows[0].Judul, r.data.rows[0].Tingkat === 'Kritis' ? 'crit' : 'info'); setNotif(r.data.belum); } } catch (e) { }
    }, 15000);
  }

  /* ---------- ROUTER ---------- */
  const JUDUL = { beranda: 'Beranda', dashboard: 'Dashboard Utama', isu: 'Isu & Tiket', gagasan: 'Gagasan & Riset', notifikasi: 'Notifikasi', laporan: 'Rekap & Approval', ekspor: 'Ekspor & GlobalGAP', audit: 'Keamanan & RBAC', pengaturan: 'Pengaturan', input: 'Input Cepat', impor: 'Impor Excel' };
  async function rute() {
    const { seg, q } = parseHash(); const s0 = seg[0] || 'beranda';
    if (s0 === 'masuk') { if (API.Sesi.token && window.B) { location.hash = '#/beranda'; return; } shellSiap = false; return H().halMasuk(document.getElementById('app')); }
    if (!API.Sesi.token) { location.hash = '#/masuk'; return; }
    if (!window.B) return mulai();
    if (!shellSiap) pasangShell();
    $$('[role=dialog]').forEach(d => { if (!/^isu/.test(s0)) d.remove(); }); document.body.classList.remove('overflow-hidden');
    const kode = s0 === 'div' ? 'div/' + seg[1] : s0;
    $$('[data-nav]').forEach(a => a.classList.toggle('aktif', a.dataset.nav === kode));
    $$('[data-bn]').forEach(a => { const ak = a.dataset.bn === kode || (a.dataset.bn === 'dashboard' && /^div\//.test(kode)); a.classList.toggle('text-primary', ak); a.classList.toggle('text-secondary', !ak); a.classList.toggle('border-t-2', ak); a.classList.toggle('border-primary', ak); });
    const jejak = $('#tb-jejak'); if (jejak) jejak.textContent = 'AGRI WANGI BERRY / ' + (s0 === 'div' ? (window.B.divisi.find(d => d.kode === seg[1]) || { nama: seg[1] }).nama : (JUDUL[s0] || s0)).toUpperCase();
    document.title = (s0 === 'div' ? seg[1] : (JUDUL[s0] || 'Agri Wangi Berry')) + ' · AWB Report';
    const main = $('#halaman'); const baru = main.cloneNode(false); main.replaceWith(baru); // buang listener lama
    window.scrollTo(0, 0);
    try {
      switch (s0) {
        case 'beranda': await H().halBeranda(baru); break;
        case 'dashboard': await H().halDashboard(baru); break;
        case 'div': await H().halDivisi(baru, (seg[1] || '').toUpperCase(), q); break;
        case 'input': H().halInputCepat(baru, q); break;
        case 'isu': await H().halIsu(baru, q, seg[1]); break;
        case 'gagasan': await H().halGagasan(baru, q); break;
        case 'notifikasi': await H().halNotif(baru); break;
        case 'laporan': await H().halLaporan(baru, q, seg[1]); break;
        case 'ekspor': H().halEkspor(baru); break;
        case 'audit': await H().halAudit(baru, q); break;
        case 'pengaturan': await H().halPengaturan(baru, q); break;
        case 'impor': if (!(window.B.hak.IMPOR || '').includes('W')) { baru.innerHTML = UI.kosong('Akses terbatas', 'Impor Excel hanya untuk SPV & Manager.'); break; } Alat.halImpor(baru, window.B, q); break;
        case 'hrd': case 'finance': baru.innerHTML = UI.kosong('Modul ditunda', 'Modul ' + s0.toUpperCase() + ' disiapkan untuk tahap berikutnya.'); break;
        default: baru.innerHTML = UI.kosong('Halaman tidak ditemukan', '', '<a href="#/beranda" class="tombol mt-3">Ke Beranda</a>');
      }
    } catch (e) { console.error(e); baru.innerHTML = galat(e.message || String(e), 'r-ulang'); const b = $('#r-ulang'); if (b) b.onclick = rute; }
  }
  addEventListener('hashchange', rute);
  addEventListener('awb:auth', () => { if (window.B) toast('Sesi berakhir — silakan masuk kembali.', 'warn'); window.B = null; shellSiap = false; location.hash = '#/masuk'; rute(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { const d = $$('[role=dialog]').pop(); if (d) { const t = d.querySelector('[data-tutup]'); if (t) t.click(); } } });

  window.App = { mulai, rute, bootUlang, tema, setNotif, keluar };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mulai); else mulai();
})();
