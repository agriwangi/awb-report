/* Agri Wangi Berry Report v1.0.0 — UI kit (desain "Blueprint Precision": 0px radius, garis 1px, tanpa bayangan) */
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (v) => String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ik = (n, cls) => `<span class="material-symbols-outlined ${cls || ''}" aria-hidden="true">${n}</span>`;
  const num = (v, d) => { const n = Number(v); if (v === '' || v === null || v === undefined || isNaN(n)) return '—'; return n.toLocaleString('id-ID', { maximumFractionDigits: d === undefined ? 2 : d, minimumFractionDigits: 0 }); };
  const hariIni = () => { const d = new Date(Date.now() + 7 * 3600e3); return d.toISOString().slice(0, 10); };
  const tambahHari = (t, n) => { const d = new Date(t + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const tglID = (t) => { if (!t) return '—'; const s = String(t).slice(0, 10); const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return esc(t); const B = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']; return +m[3] + ' ' + B[+m[2] - 1] + ' ' + m[1]; };
  const waktuRelatif = (iso) => { const t = Date.parse(String(iso).length > 10 ? iso + (/[zZ+]/.test(iso.slice(19)) ? '' : '+07:00') : iso); if (isNaN(t)) return esc(iso); const s = (Date.now() - t) / 1000; if (s < 60) return 'baru saja'; if (s < 3600) return Math.floor(s / 60) + ' mnt lalu'; if (s < 86400) return Math.floor(s / 3600) + ' jam lalu'; return Math.floor(s / 86400) + ' hari lalu'; };

  /* Badge status — warna + teks (tidak pernah warna saja) */
  const NADA = { ok: 'bg-ok-bg text-ok-ink border-ok-ink/30', warn: 'bg-warn-bg text-warn-ink border-warn-ink/30', crit: 'bg-crit-bg text-crit-ink border-crit-ink/30', info: 'bg-info-bg text-info-ink border-info-ink/30', netral: 'bg-surface-low text-secondary border-subtle' };
  function nadaDari(t) { t = String(t || '').toUpperCase(); if (/KRITIS|P1|DITOLAK|MINIM|DI LUAR|GAGAL|OFFLINE/.test(t)) return 'crit'; if (/WASPADA|P2|DIAJUKAN|MENUNGGU|DITANGANI|PERHATIAN|DIPERTIMBANGKAN|DRAF/.test(t)) return 'warn'; if (/AMAN|NORMAL|SELESAI|DISETUJUI|DIKONFIRMASI|OK|ONLINE|LOLOS|TERSINKRON/.test(t)) return 'ok'; if (/INFO|P3|BARU|DITERUSKAN/.test(t)) return 'info'; return 'netral'; }
  const badge = (txt, nada) => `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 border font-mono text-mono-badge uppercase whitespace-nowrap ${NADA[nada || nadaDari(txt)]}">${esc(txt)}</span>`;

  /* Toast 4 varian */
  function toast(pesan, jenis) {
    jenis = jenis || 'ok'; let wrap = $('#toast-wrap'); if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toast-wrap'; wrap.className = 'fixed z-[90] right-3 left-3 sm:left-auto bottom-20 lg:bottom-4 flex flex-col gap-2 sm:w-96'; wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap); }
    const ikon = { ok: 'check_circle', crit: 'error', warn: 'warning', info: 'info' }[jenis] || 'info';
    const d = document.createElement('div'); d.className = `border bg-surface flex items-start gap-2 p-3 ${NADA[jenis]} toast-masuk`; d.setAttribute('role', jenis === 'crit' ? 'alert' : 'status');
    d.innerHTML = `${ik(ikon)}<div class="flex-1 text-body-md text-primary">${esc(pesan)}</div><button class="text-secondary hover:text-primary" aria-label="Tutup">${ik('close')}</button>`;
    d.querySelector('button').onclick = () => d.remove(); wrap.appendChild(d); setTimeout(() => d.remove(), jenis === 'crit' ? 9000 : 5000);
  }
  /* Overlay umum */
  function overlay(html, opt) {
    opt = opt || {}; const o = document.createElement('div'); o.className = 'fixed inset-0 z-[70] flex ' + (opt.drawer ? 'justify-end' : 'items-end sm:items-center justify-center sm:p-4'); o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML = `<div class="absolute inset-0 bg-black/50" data-tutup></div><div class="relative bg-surface border border-strong flex flex-col max-h-full ${opt.drawer ? 'h-full w-full ' + (opt.lebar || 'sm:w-[580px]') + ' border-y-0 border-r-0 drawer-masuk' : 'w-full ' + (opt.lebar || 'sm:max-w-lg') + ' max-h-[92vh] modal-masuk'}">${html}</div>`;
    document.body.appendChild(o); document.body.classList.add('overflow-hidden');
    const tutup = () => { o.remove(); if (!$$('[role=dialog]').length) document.body.classList.remove('overflow-hidden'); if (opt.onTutup) opt.onTutup(); };
    o.addEventListener('click', e => { if (e.target.closest('[data-tutup]')) tutup(); });
    const esck = e => { if (e.key === 'Escape' && document.body.contains(o) && $$('[role=dialog]').pop() === o) { tutup(); document.removeEventListener('keydown', esck); } };
    document.addEventListener('keydown', esck);
    setTimeout(() => { const f = o.querySelector('[autofocus], input:not([type=hidden]):not([readonly]), select, textarea, button:not([data-tutup])'); if (f && !opt.noFocus) f.focus(); }, 30);
    return { el: o, tutup };
  }
  const kepala = (judul, sub, kanan) => `<div class="flex items-start justify-between gap-3 px-4 py-3 border-b border-hairline shrink-0"><div class="min-w-0"><h2 class="font-display text-headline-sm text-primary truncate">${judul}</h2>${sub ? `<p class="font-mono text-mono-badge text-secondary mt-0.5">${sub}</p>` : ''}</div><div class="flex items-center gap-2">${kanan || ''}<button class="tombol-ikon" data-tutup aria-label="Tutup">${ik('close')}</button></div></div>`;
  function konfirmasi(judul, pesan, opt) {
    opt = opt || {};
    return new Promise(res => {
      const ketik = opt.ketik; const o = overlay(`${kepala(esc(judul))}<div class="p-4 space-y-3"><p class="text-body-md text-primary">${esc(pesan)}</p>${ketik ? `<label class="block"><span class="label">Ketik <b class="font-mono">${ketik}</b> untuk melanjutkan</span><input class="input mt-1" id="kf-ketik" autocomplete="off"></label>` : ''}${opt.alasan ? `<label class="block"><span class="label">${esc(opt.alasan)} <span class="text-crit-ink">*</span></span><textarea class="input mt-1" rows="3" id="kf-alasan"></textarea></label>` : ''}</div><div class="flex justify-end gap-2 p-3 border-t border-hairline"><button class="tombol" data-tutup>Batal</button><button class="tombol ${opt.bahaya ? 'tombol-bahaya' : 'tombol-utama'}" id="kf-ok">${esc(opt.label || 'Lanjutkan')}</button></div>`, { onTutup: () => res(false) });
      const okb = $('#kf-ok', o.el);
      const cekOk = () => { okb.disabled = (ketik && ($('#kf-ketik', o.el).value.trim() !== ketik)) || (opt.alasan && !$('#kf-alasan', o.el).value.trim()); };
      if (ketik || opt.alasan) { cekOk(); o.el.addEventListener('input', cekOk); }
      okb.onclick = () => { const v = opt.alasan ? $('#kf-alasan', o.el).value.trim() : true; o.el.remove(); document.body.classList.remove('overflow-hidden'); res(v); };
    });
  }
  /* Kerangka & state */
  const skeleton = (n, tinggi) => Array.from({ length: n || 3 }).map(() => `<div class="skeleton ${tinggi || 'h-24'}"></div>`).join('');
  const kosong = (judul, pesan, cta) => `<div class="border border-dashed border-strong p-8 text-center bg-surface"><svg viewBox="0 0 64 64" class="w-14 h-14 mx-auto text-strong" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="10" y="14" width="44" height="36"/><path d="M10 24h44M22 34h20M22 40h12"/></svg><p class="mt-3 font-semibold text-primary">${esc(judul)}</p><p class="text-body-sm text-secondary mt-1">${esc(pesan || '')}</p>${cta || ''}</div>`;
  const galat = (pesan, idUlang) => `<div class="border border-crit-ink/40 bg-crit-bg p-4 flex items-start gap-3" role="alert">${ik('error', 'text-crit-ink')}<div class="flex-1"><p class="font-semibold text-crit-ink">Gagal memuat data</p><p class="text-body-sm text-primary mt-0.5">${esc(pesan)}</p></div>${idUlang ? `<button class="tombol" id="${idUlang}">${ik('refresh')}Coba Lagi</button>` : ''}</div>`;

  /* Kartu KPI dengan target vs capaian */
  function kartuKPI(k, opt) {
    opt = opt || {}; const cap = k.capaian; const naikBaik = k.naikBaik !== false;
    const nada = cap === null || cap === undefined ? null : (naikBaik ? (cap >= 100 ? 'ok' : cap >= 85 ? 'warn' : 'crit') : (cap <= 100 ? 'ok' : 'crit'));
    return `<div class="kartu p-3 flex flex-col justify-between min-h-[104px]"><div class="flex items-start justify-between gap-2"><span class="label">${esc(k.l)}</span>${cap !== null && cap !== undefined ? badge(num(cap, 1) + '% target', nada) : (opt.badge || '')}</div>
      <div class="mt-1"><span class="font-mono text-mono-lg text-primary">${num(k.v)}</span> <span class="font-mono text-mono-badge text-secondary">${esc(k.u || '')}</span></div>
      ${k.target ? `<div class="mt-2"><div class="h-1 bg-surface-high"><div class="h-1 ${nada === 'ok' ? 'bg-ok-ink' : nada === 'warn' ? 'bg-warn-ink' : 'bg-crit-ink'}" style="width:${Math.min(100, cap || 0)}%"></div></div><div class="flex justify-between font-mono text-[10px] text-secondary mt-1"><span>Target ${num(k.target)}</span><span>Selisih ${num(k.selisih)}</span></div></div>` : ''}</div>`;
  }

  /* Grafik (Chart.js) — warna mengikuti tema */
  const _charts = {};
  function warnaTema() { const s = getComputedStyle(document.documentElement); const v = (n) => 'rgb(' + s.getPropertyValue(n).trim().split(' ').join(',') + ')'; return { ink: v('--c-primary'), sek: v('--c-secondary'), garis: v('--c-hairline'), ok: v('--c-ok-ink'), warn: v('--c-warn-ink'), crit: v('--c-crit-ink'), info: v('--c-info-ink'), strong: v('--c-strong') }; }
  function grafik(id, cfg) {
    const c = document.getElementById(id); if (!c || !window.Chart) return; if (_charts[id]) _charts[id].destroy();
    const w = warnaTema(); Chart.defaults.font.family = "'JetBrains Mono', monospace"; Chart.defaults.font.size = 11; Chart.defaults.color = w.sek;
    const pal = [w.ink, w.sek, w.info, w.ok, w.warn, w.crit, w.strong];
    (cfg.data.datasets || []).forEach((d, i) => { const col = d.warna ? w[d.warna] : pal[i % pal.length]; if (cfg.type === 'line') Object.assign(d, { borderColor: col, backgroundColor: col, borderWidth: 1.5, pointRadius: 0, tension: 0, borderDash: i === 1 ? [4, 3] : [] }); else d.backgroundColor = d.backgroundColor || (Array.isArray(d.warnaList) ? d.warnaList.map(x => w[x]) : col); });
    cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: (cfg.data.datasets || []).length > 1, labels: { boxWidth: 10, boxHeight: 10 } }, tooltip: { cornerRadius: 0 } }, scales: cfg.type === 'doughnut' ? undefined : { x: { grid: { color: w.garis }, ticks: { maxRotation: 0, autoSkipPadding: 12 } }, y: { grid: { color: w.garis }, beginAtZero: true } } }, cfg.options || {});
    _charts[id] = new Chart(c, cfg);
  }

  /* Ekspresi rumus (sama dengan server) */
  const H = {
    N: (x) => { if (x === null || x === undefined || x === '') return 0; const n = parseFloat(String(x).replace(',', '.')); return isFinite(n) ? n : 0; },
    DIV: (a, b) => { a = H.N(a); b = H.N(b); return b === 0 ? 0 : a / b; }, R2: (x) => Math.round(H.N(x) * 100) / 100,
    AVG: (a) => { const v = a.filter(x => x !== '' && x !== null && x !== undefined && !isNaN(H.N(x))).map(H.N); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0; },
    HARI: (t) => { const d = new Date(String(t) + 'T00:00:00'); return isNaN(d) ? '' : ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()]; }
  };
  const HAMA = [['Spidermite_P', 'SPIDER'], ['Aphid_P', 'APHID'], ['Thrips_P', 'THRIPS'], ['Ulat_P', 'ULAT'], ['Tikus_P', 'TIKUS'], ['Siput_P', 'SIPUT'], ['Kutu_P', 'KUTU'], ['Mildew_P', 'MILDEW'], ['Botrytis_P', 'BOTRYTIS'], ['Antrak_P', 'ANTRAK'], ['Layu_P', 'LAYU']];
  H.STATUS_HPT = (r, P) => { let s = 'AMAN'; HAMA.forEach(h => { const v = H.N(r[h[0]]); if (v >= H.N(P[h[1] + '_KRITIS'])) s = 'KRITIS'; else if (s !== 'KRITIS' && v >= H.N(P[h[1] + '_WASPADA'])) s = 'WASPADA'; }); return s; };
  const _fn = {};
  function hitung(skema, r, P) {
    skema.f.forEach(f => { if (f.t !== 'calc') return; try { if (!_fn[f.f]) _fn[f.f] = new Function('r', 'P', 'N', 'DIV', 'R2', 'AVG', 'HARI', 'STATUS_HPT', 'return (' + f.f + ');'); let v = _fn[f.f](r, P, H.N, H.DIV, H.R2, H.AVG, H.HARI, H.STATUS_HPT); if (typeof v === 'number') v = Math.round(v * 10000) / 10000; r[f.k] = v; } catch (e) { r[f.k] = ''; } });
    return r;
  }

  /* Kompres foto di perangkat sebelum unggah (maks 1600px, JPEG 0.8) */
  function kompres(file) {
    return new Promise((res, rej) => {
      if (file.type === 'application/pdf') { const fr = new FileReader(); fr.onload = () => res({ data: fr.result, mime: file.type, nama: file.name }); fr.onerror = rej; fr.readAsDataURL(file); return; }
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const s = Math.min(1, 1600 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res({ data: c.toDataURL('image/jpeg', 0.8), mime: 'image/jpeg', nama: file.name.replace(/\.\w+$/, '') + '.jpg' }); };
      img.onerror = () => rej(new Error('Berkas bukan gambar yang valid')); img.src = url;
    });
  }
  /* Lightbox pratinjau lampiran (Unduh & Tutup) */
  async function lihatLampiran(id, nama) {
    const o = overlay(`${kepala(esc(nama || 'Lampiran'), id, `<a class="tombol" id="lb-unduh" href="#" download>${ik('download')}Unduh</a>`)}<div class="p-3 flex-1 overflow-auto flex items-center justify-center bg-surface-low min-h-[300px]" id="lb-isi">${skeleton(1, 'h-64 w-full')}</div>`, { lebar: 'sm:max-w-3xl' });
    try { const r = await API.api('lampiran.ambil', { id }); if (!r.success) throw new Error(r.message); const src = 'data:' + r.data.mime + ';base64,' + r.data.data; $('#lb-isi', o.el).innerHTML = /^image/.test(r.data.mime) ? `<img src="${src}" alt="${esc(r.data.nama)}" class="max-w-full max-h-[75vh]">` : `<iframe src="${src}" class="w-full h-[75vh]" title="PDF"></iframe>`; const a = $('#lb-unduh', o.el); a.href = src; a.download = r.data.nama; }
    catch (e) { $('#lb-isi', o.el).innerHTML = galat(e.message); }
  }

  /* ---------------- FORMULIR dinamis dari skema server ---------------- */
  function opsi(f, B, nilai) {
    let list = f.opt ? f.opt.map(v => ({ v, l: v })) : (B.master[f.src] || []);
    if (f.src === 'bay' || f.src === 'grower' || f.src === 'lokasi') { const gh = (B._ctxDiv || '').match(/^GH\d/); if (gh) list = list.filter(o => !o.gh || o.gh === gh[0]); }
    if (f.src === 'divisi') list = B.divisi.map(d => ({ v: d.kode, l: d.nama }));
    const ada = list.some(o => String(o.v) === String(nilai));
    return `<option value="">— pilih —</option>` + list.map(o => `<option value="${esc(o.v)}" ${String(o.v) === String(nilai) ? 'selected' : ''}>${esc(o.l)}</option>`).join('') + (nilai && !ada ? `<option value="${esc(nilai)}" selected>${esc(nilai)}</option>` : '');
  }
  function medan(f, nilai, B, mode) {
    const id = 'f_' + f.k, req = f.req ? ' <span class="text-crit-ink" aria-hidden="true">*</span>' : '';
    const tag = f.tambahan ? ' <span class="font-mono text-[10px] px-1 border border-info-ink/40 text-info-ink bg-info-bg">TAMBAHAN</span>' : f.perbaikan ? ` <span class="font-mono text-[10px] px-1 border border-warn-ink/40 text-warn-ink bg-warn-bg" title="${esc(f.perbaikan)}">PERBAIKAN</span>` : '';
    const lbl = `<label for="${id}" class="label block mb-1">${esc(f.l)}${req}${tag}</label>`;
    const v = nilai === undefined || nilai === null ? (f.def !== undefined ? f.def : '') : nilai;
    if (f.t === 'calc' || f.t === 'auto') return `<div class="kolom-calc" data-calc="${f.k}">${lbl}<div class="input bg-surface-low font-mono text-primary flex items-center justify-between" aria-live="polite"><span data-calc-v="${f.k}">${esc(v === '' ? '—' : (typeof v === 'number' ? num(v, 2) : v))}</span><span class="text-secondary text-[10px]">${f.t === 'auto' ? 'OTOMATIS' : 'HITUNG'}${f.u ? ' · ' + esc(f.u) : ''}</span></div></div>`;
    if (f.t === 'foto') return `<div class="sm:col-span-2" data-foto="${f.k}">${lbl}<div class="grid grid-cols-3 sm:grid-cols-4 gap-2" data-foto-grid></div><input type="hidden" name="${f.k}" value="${esc(v)}"></div>`;
    if (f.t === 'area') return `<div class="sm:col-span-2">${lbl}<textarea id="${id}" name="${f.k}" rows="3" class="input" ${f.req ? 'required' : ''}>${esc(v)}</textarea></div>`;
    if (f.t === 'sel') return `<div>${lbl}<select id="${id}" name="${f.k}" class="input" ${f.req ? 'required' : ''}>${opsi(f, B, v)}</select></div>`;
    if (f.t === 'num' || f.t === 'int') {
      if (mode === 'cepat') return `<div>${lbl}<div class="flex items-stretch"><button type="button" class="tombol-stepper" data-step="-1" data-for="${id}" aria-label="Kurangi">−</button><input id="${id}" name="${f.k}" type="number" inputmode="decimal" step="${f.t === 'int' ? 1 : 'any'}" class="input text-center font-mono text-mono-lg h-12 border-x-0" value="${esc(v)}" ${f.req ? 'required' : ''}><button type="button" class="tombol-stepper" data-step="1" data-for="${id}" aria-label="Tambah">+</button></div></div>`;
      return `<div>${lbl}<input id="${id}" name="${f.k}" type="number" inputmode="decimal" step="${f.t === 'int' ? 1 : 'any'}" class="input font-mono" value="${esc(v)}" ${f.req ? 'required' : ''}></div>`;
    }
    const tipe = f.t === 'date' ? 'date' : f.t === 'time' ? 'time' : 'text';
    return `<div>${lbl}<input id="${id}" name="${f.k}" type="${tipe}" class="input ${tipe !== 'text' ? 'font-mono' : ''}" value="${esc(v)}" ${f.req ? 'required' : ''} maxlength="500"></div>`;
  }
  /** Drawer formulir input + foto (desain 9). onSimpan(row, tambahLagi) */
  function formulir(skema, row, B, opt) {
    opt = opt || {}; row = Object.assign({}, row || {}); const baru = !row.ID; const mode = opt.mode || '';
    if (baru) skema.f.forEach(f => { if (f.t === 'date' && f.k === 'Tanggal' && !row[f.k]) row[f.k] = hariIni(); });
    B._ctxDiv = skema.div;
    const bagian = { utama: [], hitung: [], foto: [] };
    skema.f.forEach(f => (f.t === 'calc' || f.t === 'auto' ? bagian.hitung : f.t === 'foto' ? bagian.foto : bagian.utama).push(f));
    const html = `${kepala((baru ? 'Input ' : 'Ubah ') + esc(skema.judul), esc((skema.div === '*' ? 'Pengaturan' : skema.div) + (baru ? ' · data baru' : ' · ' + row.ID)), `<span id="fm-sinkron"></span>`)}
      <form class="flex-1 overflow-y-auto p-4 space-y-5" novalidate id="fm">
        <section><h3 class="judul-bagian">Data ${esc(skema.judul)}</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${bagian.utama.map(f => medan(f, row[f.k], B, mode)).join('')}</div></section>
        ${bagian.hitung.length ? `<section><h3 class="judul-bagian">Hasil Hitung Otomatis <span class="font-mono text-[10px] text-secondary normal-case">(rumus mengikuti Excel & parameter Pengaturan)</span></h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${bagian.hitung.map(f => medan(f, row[f.k], B)).join('')}</div></section>` : ''}
        ${bagian.foto.length ? `<section><h3 class="judul-bagian">Lampiran Foto / Dokumen</h3><div class="grid grid-cols-1 gap-3">${bagian.foto.map(f => medan(f, row[f.k], B)).join('')}</div></section>` : ''}
        <p class="text-body-sm text-secondary" id="fm-galat" role="alert"></p>
      </form>
      <div class="flex flex-wrap items-center justify-end gap-2 p-3 border-t border-hairline bg-surface sticky bottom-0">
        <button type="button" class="tombol" data-tutup>Batal</button>
        ${baru ? '<button type="button" class="tombol" id="fm-lagi">Simpan &amp; Tambah Baru</button>' : ''}
        <button type="button" class="tombol tombol-utama" id="fm-simpan">${ik('save')}Simpan <span class="hidden sm:inline font-mono text-[10px] opacity-70">Ctrl+Enter</span></button></div>`;
    const o = overlay(html, { drawer: true, lebar: 'sm:w-[600px]' });
    const form = $('#fm', o.el), lamp = {};
    const baca = () => { const d = Object.assign({}, row); new FormData(form).forEach((v, k) => d[k] = v); return d; };
    const segar = () => { const d = hitung(skema, baca(), B.set); bagian.hitung.forEach(f => { const el = $(`[data-calc-v="${f.k}"]`, o.el); if (el && f.t === 'calc') el.textContent = d[f.k] === '' ? '—' : (typeof d[f.k] === 'number' ? num(d[f.k], 2) : d[f.k]); }); };
    form.addEventListener('input', segar); form.addEventListener('change', segar); segar();
    o.el.addEventListener('click', e => { const b = e.target.closest('[data-step]'); if (!b) return; const inp = $('#' + b.dataset.for, o.el); const st = inp.step === '1' ? 1 : (inp.dataset.inc ? +inp.dataset.inc : 0.5); inp.value = Math.max(0, H.N(inp.value) + (+b.dataset.step) * st); inp.dispatchEvent(new Event('input', { bubbles: true })); });
    // Foto
    bagian.foto.forEach(f => {
      const box = $(`[data-foto="${f.k}"]`, o.el), hid = $(`input[name="${f.k}"]`, box), grid = $('[data-foto-grid]', box);
      const ids = () => hid.value ? hid.value.split(',').filter(String) : [];
      const gambar = () => { grid.innerHTML = ids().map(id => `<div class="relative aspect-square border border-hairline bg-surface-low flex items-center justify-center"><button type="button" class="text-secondary hover:text-primary flex flex-col items-center" data-lihat="${id}">${ik('image', 'text-[28px]')}<span class="font-mono text-[10px] mt-1">${esc((lamp[id] || id).slice(0, 14))}</span></button><button type="button" class="absolute top-1 right-1 w-6 h-6 bg-surface border border-subtle flex items-center justify-center" data-hapus-foto="${id}" aria-label="Hapus foto">${ik('close', 'text-[14px]')}</button></div>`).join('') + `<label class="aspect-square border border-dashed border-strong flex flex-col items-center justify-center cursor-pointer hover:bg-surface-low text-secondary"><input type="file" accept="image/*,application/pdf" capture="environment" class="sr-only" multiple>${ik('add_a_photo', 'text-[24px]')}<span class="text-body-sm mt-1">Tambah foto</span></label>`; };
      gambar();
      box.addEventListener('click', e => { const h = e.target.closest('[data-hapus-foto]'); if (h) { hid.value = ids().filter(x => x !== h.dataset.hapusFoto).join(','); gambar(); } const l = e.target.closest('[data-lihat]'); if (l) lihatLampiran(l.dataset.lihat, lamp[l.dataset.lihat]); });
      box.addEventListener('change', async e => {
        if (!e.target.files) return; const files = Array.from(e.target.files).slice(0, 4);
        for (const file of files) {
          const ph = document.createElement('div'); ph.className = 'aspect-square skeleton'; grid.insertBefore(ph, grid.lastElementChild);
          try { const k = await kompres(file); const r = await API.api('lampiran.unggah', { data: k.data, mime: k.mime, nama: k.nama, divisi: skema.div === '*' ? 'UMUM' : skema.div, tabel: skema.key, ref: row.ID || '' }); if (!r.success) throw new Error(r.message); lamp[r.data.id] = r.data.nama; hid.value = ids().concat(r.data.id).join(','); }
          catch (er) { toast('Foto gagal diunggah: ' + er.message, 'crit'); }
          gambar();
        }
      });
    });
    const simpan = async (lagi) => {
      const d = baca(); const kurang = skema.f.filter(f => f.req && f.t !== 'calc' && (d[f.k] === '' || d[f.k] === undefined));
      $$('.input-galat', form).forEach(x => x.classList.remove('input-galat')); $$('.pesan-galat', form).forEach(x => x.remove());
      if (kurang.length) { kurang.forEach(f => { const el = $('#f_' + f.k, form); if (el) { el.classList.add('input-galat'); el.setAttribute('aria-invalid', 'true'); el.closest('div').insertAdjacentHTML('beforeend', `<p class="pesan-galat text-body-sm text-crit-ink mt-1">${esc(f.l)} wajib diisi.</p>`); } }); const p = $('#f_' + kurang[0].k, form); if (p) p.focus(); return; }
      const btns = $$('#fm-simpan, #fm-lagi', o.el); btns.forEach(b => b.disabled = true); $('#fm-simpan', o.el).innerHTML = ik('progress_activity', 'animate-spin') + 'Menyimpan…';
      try {
        const r = await opt.onSimpan(d);
        if (!r.success) throw new Error(r.message);
        toast(r.message || 'Tersimpan.', r.antre ? 'warn' : (r.data && r.data.peringatan && r.data.peringatan.length ? 'warn' : 'ok'));
        if (lagi) { o.tutup(); formulir(skema, Object.assign({}, opt.bawaanLagi ? opt.bawaanLagi(d) : { Tanggal: d.Tanggal }), B, opt); } else o.tutup();
      } catch (e) { $('#fm-galat', o.el).innerHTML = `<span class="text-crit-ink">${esc(e.message)}</span>`; btns.forEach(b => b.disabled = false); $('#fm-simpan', o.el).innerHTML = ik('save') + 'Simpan'; }
    };
    $('#fm-simpan', o.el).onclick = () => simpan(false); const lg = $('#fm-lagi', o.el); if (lg) lg.onclick = () => simpan(true);
    o.el.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); simpan(false); } });
    return o;
  }

  /* Detail rekaman (desain 12): label/nilai + foto + aksi */
  function detailRekaman(skema, row, lampiran, aksi) {
    const isi = skema.f.filter(f => f.t !== 'foto').map(f => `<div class="py-2 border-b border-hairline grid grid-cols-5 gap-2"><dt class="col-span-2 label">${esc(f.l)}</dt><dd class="col-span-3 ${['num', 'int', 'calc', 'date', 'time', 'auto'].includes(f.t) ? 'font-mono' : ''} text-body-md text-primary break-words">${f.k === 'Status' ? badge(row[f.k] || '—') : (typeof row[f.k] === 'number' ? num(row[f.k], 2) : esc(row[f.k] === '' || row[f.k] === undefined ? '—' : row[f.k]))}${f.u ? ' <span class="text-secondary text-body-sm">' + esc(f.u) + '</span>' : ''}</dd></div>`).join('');
    const meta = ['Dibuat_Oleh', 'Dibuat_Pada', 'Diubah_Pada', 'Sumber', 'Catatan_Impor', 'Dihapus'].filter(k => row[k]).map(k => `<div class="flex justify-between gap-2 font-mono text-[11px] py-1"><span class="text-secondary">${k}</span><span class="text-primary text-right break-all">${esc(row[k])}</span></div>`).join('');
    const foto = (lampiran || []).map(l => `<button class="border border-hairline p-2 text-left hover:bg-surface-low flex items-center gap-2" data-lihat="${l.id}" data-nama="${esc(l.nama)}">${ik(/pdf/.test(l.mime) ? 'picture_as_pdf' : 'image')}<span class="font-mono text-[11px] truncate">${esc(l.nama)}</span></button>`).join('');
    const o = overlay(`${kepala(esc(skema.judul) + ' · Detail Rekaman', esc(row.ID))}<div class="flex-1 overflow-y-auto p-4"><dl>${isi}</dl>${foto ? `<h3 class="judul-bagian mt-4">Lampiran</h3><div class="grid grid-cols-2 gap-2">${foto}</div>` : ''}${meta ? `<div class="mt-4 p-2 bg-surface-low border border-hairline">${meta}</div>` : ''}</div><div class="flex justify-end gap-2 p-3 border-t border-hairline">${aksi || ''}<button class="tombol" onclick="window.print()">${ik('print')}Cetak</button><button class="tombol" data-tutup>Tutup</button></div>`, { lebar: 'sm:max-w-2xl' });
    o.el.addEventListener('click', e => { const l = e.target.closest('[data-lihat]'); if (l) lihatLampiran(l.dataset.lihat, l.dataset.nama); });
    return o;
  }

  window.UI = { $, $$, esc, ik, num, badge, nadaDari, toast, overlay, kepala, konfirmasi, skeleton, kosong, galat, kartuKPI, grafik, warnaTema, hitung, formulir, detailRekaman, lihatLampiran, kompres, hariIni, tambahHari, tglID, waktuRelatif, H };
})();
