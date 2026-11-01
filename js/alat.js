/* Agri Wangi Berry Report v1.2.0 — alat: tabel data generik, ekspor (PDF/PPT/Excel/Word/CSV), mode slide, wizard impor Excel */
(function () {
  const { $, $$, esc, ik, num, badge, toast, overlay, kepala, konfirmasi, skeleton, kosong, galat, formulir, detailRekaman, hariIni, tambahHari, tglID } = UI;
  const unduh = (blob, nama) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); };
  const stempel = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') + ' WIB';
  const tunggu = (cek, ms) => new Promise((res, rej) => { const t0 = Date.now(); (function l() { if (cek()) return res(); if (Date.now() - t0 > (ms || 15000)) return rej(new Error('Pustaka belum termuat. Periksa koneksi internet.')); setTimeout(l, 120); })(); });
  /* v1.2: pustaka berat (Excel/PDF/PPT ±1,9 MB) dimuat saat pertama dipakai, bukan saat aplikasi dibuka */
  const PUSTAKA = { xlsx: ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'], pdf: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'], ppt: ['https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js'] };
  const _dimuat = {};
  function skrip(src) { return _dimuat[src] || (_dimuat[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete _dimuat[src]; rej(new Error('Gagal memuat pustaka — periksa koneksi internet.')); }; document.head.appendChild(s); })); }
  async function muat(nama) { for (const src of PUSTAKA[nama]) await skrip(src); }
  async function sha256Teks(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''); }

  /* ======================= EKSPOR ======================= */
  const Ekspor = {
    async xlsx(nama, lembar) { await muat('xlsx'); await tunggu(() => window.XLSX); const wb = XLSX.utils.book_new(); lembar.forEach(l => { const ws = Array.isArray(l.rows[0]) ? XLSX.utils.aoa_to_sheet(l.rows) : XLSX.utils.json_to_sheet(l.rows.length ? l.rows : [{ Info: 'Tidak ada data' }]); XLSX.utils.book_append_sheet(wb, ws, String(l.nama).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)); }); XLSX.writeFile(wb, nama + '.xlsx'); },
    csv(nama, rows) { if (!rows.length) return toast('Tidak ada data untuk diekspor.', 'warn'); const k = Object.keys(rows[0]); const q = v => '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"'; unduh(new Blob(['﻿' + [k.map(q).join(',')].concat(rows.map(r => k.map(x => q(r[x])).join(','))).join('\r\n')], { type: 'text/csv;charset=utf-8' }), nama + '.csv'); },
    async pdf(nama, judul, sub, blok, opt) {
      opt = opt || {}; await muat('pdf'); await tunggu(() => window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable);
      const doc = new jspdf.jsPDF({ orientation: opt.lanskap ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' }); const W = doc.internal.pageSize.getWidth();
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(judul, 14, 16); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90); doc.text(sub || '', 14, 22); doc.text('PT. Agri Wangi Berry · Agri Wangi Berry Report · ' + stempel(), 14, 27); doc.setDrawColor(200); doc.line(14, 30, W - 14, 30); doc.setTextColor(0);
      let y = 36;
      blok.forEach(b => {
        if (y > 260) { doc.addPage(); y = 18; }
        if (b.judul) { doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(String(b.judul).toUpperCase(), 14, y); y += 4; doc.setFont('helvetica', 'normal'); }
        if (b.teks) { doc.setFontSize(9); const l = doc.splitTextToSize(String(b.teks), W - 28); doc.text(l, 14, y + 3); y += l.length * 4.2 + 6; }
        if (b.kolom && b.baris) { doc.autoTable({ startY: y, head: [b.kolom], body: b.baris.length ? b.baris : [b.kolom.map((_, i) => i ? '' : 'Tidak ada data')], styles: { fontSize: 7.5, cellPadding: 1.5, lineColor: 220, lineWidth: 0.1 }, headStyles: { fillColor: [33, 37, 41], textColor: 255 }, theme: 'grid', margin: { left: 14, right: 14 } }); y = doc.lastAutoTable.finalY + 8; }
      });
      if (opt.hash !== false) { const isi = JSON.stringify(blok); const h = await sha256Teks(isi); const n = doc.getNumberOfPages(); for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(120); doc.text('SHA-256 isi dokumen: ' + h + '   ·   Hal ' + i + '/' + n, 14, doc.internal.pageSize.getHeight() - 8); } }
      if (opt.tandaTangan) { doc.setPage(doc.getNumberOfPages()); let yy = Math.min(doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : y + 10, 250); if (yy > 255) { doc.addPage(); yy = 30; } doc.setFontSize(9); doc.setTextColor(0); opt.tandaTangan.forEach((t, i) => { const x = 14 + i * ((W - 28) / opt.tandaTangan.length); doc.text(t, x, yy); doc.line(x, yy + 18, x + 50, yy + 18); }); }
      doc.save(nama + '.pdf');
    },
    word(nama, judul, html) { const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(judul)}</title><style>body{font-family:Calibri,Arial;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:3px 5px;font-size:9pt}th{background:#212529;color:#fff}h1{font-size:16pt}h2{font-size:12pt;border-bottom:1px solid #ccc}</style></head><body><h1>${esc(judul)}</h1><p style="color:#555">PT. Agri Wangi Berry · ${stempel()}</p>${html}</body></html>`; unduh(new Blob(['﻿', doc], { type: 'application/msword' }), nama + '.doc'); },
    async ppt(nama, judul, slides) {
      await muat('ppt'); await tunggu(() => window.PptxGenJS); const p = new PptxGenJS(); p.layout = 'LAYOUT_WIDE'; p.title = judul;
      const s0 = p.addSlide(); s0.background = { color: '0C1014' }; s0.addText(judul, { x: 0.6, y: 2.4, w: 12, h: 1, fontSize: 32, bold: true, color: 'FFFFFF', fontFace: 'Arial' }); s0.addText('PT. Agri Wangi Berry · ' + stempel(), { x: 0.6, y: 3.5, w: 12, h: 0.5, fontSize: 14, color: 'ADB5BD' });
      slides.forEach(sl => {
        const s = p.addSlide(); s.addText(sl.judul, { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 22, bold: true, color: '0C1014' }); s.addShape(p.ShapeType.line, { x: 0.5, y: 0.95, w: 12.3, h: 0, line: { color: 'CED4DA', width: 1 } });
        if (sl.kpi) sl.kpi.slice(0, 8).forEach((k, i) => { const x = 0.5 + (i % 4) * 3.1, y = 1.2 + Math.floor(i / 4) * 1.6; s.addShape(p.ShapeType.rect, { x, y, w: 2.95, h: 1.4, line: { color: 'DEE2E6', width: 1 }, fill: { color: 'FFFFFF' } }); s.addText(String(k.l).toUpperCase(), { x: x + 0.1, y: y + 0.08, w: 2.7, h: 0.3, fontSize: 9, color: '595F65', bold: true }); s.addText(num(k.v) + ' ' + (k.u || ''), { x: x + 0.1, y: y + 0.45, w: 2.7, h: 0.5, fontSize: 20, bold: true, color: '0C1014', fontFace: 'Courier New' }); if (k.target) s.addText('Target ' + num(k.target) + ' · ' + num(k.capaian, 1) + '%', { x: x + 0.1, y: y + 0.95, w: 2.7, h: 0.3, fontSize: 9, color: k.capaian >= 100 ? '2B8A3E' : 'B7791F' }); });
        if (sl.seri && sl.seri.length) s.addChart(p.ChartType.line, sl.seri.map(x => ({ name: x.nama, labels: x.data.map(d => d[0].slice(5)), values: x.data.map(d => d[1]) })), { x: 0.5, y: sl.kpi ? 4.5 : 1.2, w: 12.3, h: sl.kpi ? 2.8 : 5.8, lineSize: 2, showLegend: true, legendPos: 'b', chartColors: ['0C1014', '868E96', '1971C2'], catAxisLabelFontSize: 9, valAxisLabelFontSize: 9 });
        if (sl.tabel && sl.tabel.length) { const k = Object.keys(sl.tabel[0]); s.addTable([k.map(x => ({ text: x, options: { bold: true, color: 'FFFFFF', fill: { color: '212529' } } }))].concat(sl.tabel.slice(0, 14).map(r => k.map(x => String(typeof r[x] === 'number' ? num(r[x]) : (r[x] === undefined ? '' : r[x]))))), { x: 0.5, y: 1.2, w: 12.3, fontSize: 9, border: { type: 'solid', color: 'DEE2E6', pt: 0.5 } }); }
        if (sl.teks) s.addText(sl.teks, { x: 0.5, y: 1.2, w: 12.3, h: 5.5, fontSize: 14, color: '212529', valign: 'top' });
      });
      await p.writeFile({ fileName: nama + '.pptx' });
    }
  };
  function menuEkspor(tombol, fn) {
    tombol.addEventListener('click', e => {
      e.stopPropagation(); $$('.menu-ekspor').forEach(m => m.remove());
      const m = document.createElement('div'); m.className = 'menu-ekspor absolute z-50 mt-1 bg-surface border border-strong min-w-[200px] right-0';
      m.innerHTML = [['xlsx', 'table_view', 'Excel (.xlsx)'], ['pdf', 'picture_as_pdf', 'PDF (.pdf)'], ['ppt', 'slideshow', 'PowerPoint (.pptx)'], ['word', 'description', 'Word (.doc)'], ['csv', 'csv', 'CSV (.csv)']].map(x => `<button class="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-low text-left" data-f="${x[0]}">${ik(x[1])}${x[2]}</button>`).join('');
      tombol.parentElement.style.position = 'relative'; tombol.parentElement.appendChild(m);
      m.onclick = async ev => { const b = ev.target.closest('[data-f]'); if (!b) return; m.remove(); const asal = tombol.innerHTML; tombol.disabled = true; tombol.innerHTML = ik('progress_activity', 'animate-spin') + 'Menyiapkan…'; try { await fn(b.dataset.f); toast('Berkas ' + b.dataset.f.toUpperCase() + ' diunduh.'); } catch (er) { toast(er.message, 'crit'); } tombol.disabled = false; tombol.innerHTML = asal; };
      setTimeout(() => document.addEventListener('click', function f() { m.remove(); document.removeEventListener('click', f); }), 0);
    });
  }

  /* ======================= MODE SLIDE ======================= */
  function modeSlide(judul, slides) {
    let i = 0; const d = document.createElement('div'); d.className = 'slide'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Mode slide ' + judul);
    const gambar = () => { const s = slides[i]; d.innerHTML = `<div class="flex items-center justify-between px-6 h-12 border-b border-hairline bg-surface"><span class="font-mono text-mono-badge text-secondary">${esc(judul)} · SLIDE ${i + 1}/${slides.length}</span><div class="flex gap-2"><button class="tombol-ikon" data-a="-1" aria-label="Sebelumnya">${ik('chevron_left')}</button><button class="tombol-ikon" data-a="1" aria-label="Berikutnya">${ik('chevron_right')}</button><button class="tombol" data-a="x">${ik('close')}Keluar (Esc)</button></div></div><div class="flex-1 overflow-auto p-6 lg:p-12 blueprint"><div class="max-w-6xl mx-auto bg-background/90"><h2 class="font-display text-display-lg mb-6 border-l-4 border-primary pl-4">${esc(s.judul)}</h2>${s.html}</div></div>`; if (s.setelah) setTimeout(s.setelah, 20); };
    const nav = (n) => { i = Math.max(0, Math.min(slides.length - 1, i + n)); gambar(); };
    const key = e => { if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') nav(1); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') nav(-1); else if (e.key === 'Escape') tutup(); };
    const tutup = () => { d.remove(); document.removeEventListener('keydown', key); if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); };
    d.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b) return; b.dataset.a === 'x' ? tutup() : nav(+b.dataset.a); });
    let x0 = null; d.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true }); d.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) nav(dx < 0 ? 1 : -1); x0 = null; });
    document.addEventListener('keydown', key); document.body.appendChild(d); gambar(); if (d.requestFullscreen) d.requestFullscreen().catch(() => { });
  }

  /* ======================= TABEL DATA GENERIK (desain 12) ======================= */
  function TabelData(wadah, o) {
    const { skema, B } = o; const bolehTulis = o.bolehTulis, bolehImpor = o.bolehImpor;
    const st = { hal: 1, per: 25, q: '', dari: o.dari || '', sampai: o.sampai || '', urut: '', arah: 'desc', semuaKolom: false, data: null };
    const kol = () => (st.semuaKolom ? skema.f.filter(f => f.t !== 'foto' && f.t !== 'area').map(f => f.k) : (skema.ringkas || skema.f.slice(0, 6).map(f => f.k)));
    const fdef = (k) => skema.f.find(f => f.k === k) || { k, l: k };
    wadah.innerHTML = `<div class="kartu">
      <div class="flex flex-wrap items-center gap-2 p-3 border-b border-hairline">
        <label class="relative flex-1 min-w-[180px]"><span class="sr-only">Cari</span>${ik('search', 'absolute left-2 top-1/2 -translate-y-1/2 text-secondary')}<input class="input pl-8" placeholder="Cari di ${esc(skema.judul)}…" data-q></label>
        ${skema.f.some(f => f.t === 'date') ? `<label class="flex items-center gap-1"><span class="label">Dari</span><input type="date" class="input font-mono w-[150px]" data-dari value="${st.dari}"></label><label class="flex items-center gap-1"><span class="label">s/d</span><input type="date" class="input font-mono w-[150px]" data-sampai value="${st.sampai}"></label>` : ''}
        <button class="tombol" data-kolom title="Tampilkan semua kolom">${ik('view_column')}<span class="hidden sm:inline">Kolom</span></button>
        <div><button class="tombol" data-ekspor>${ik('download')}<span class="hidden sm:inline">Ekspor</span></button></div>
        ${bolehImpor ? `<a class="tombol" href="#/impor?tabel=${skema.key}">${ik('upload_file')}<span class="hidden sm:inline">Impor Excel</span></a>` : ''}
        <button class="tombol-ikon" data-segar aria-label="Segarkan">${ik('refresh')}</button>
        ${bolehTulis ? `<button class="tombol tombol-utama" data-tambah>${ik('add')}Input</button>` : ''}
      </div><div data-isi class="min-h-[160px]">${skeleton(4, 'h-9 m-2')}</div><div data-halaman class="flex items-center justify-between gap-2 p-3 border-t border-hairline font-mono text-mono-badge text-secondary"></div></div>`;
    const isi = $('[data-isi]', wadah), pg = $('[data-halaman]', wadah);
    const sel = (r, k) => { const f = fdef(k), v = r[k]; if (k === 'Status' || k === 'Jenis' && /Keluar|Masuk/.test(v)) return badge(v || '—'); if (f.t === 'date') return `<span class="font-mono">${esc(v || '—')}</span>`; if (typeof v === 'number') return num(v, 2); return esc(v === '' || v === undefined ? '—' : v); };
    const angka = (k) => { const f = fdef(k); return ['num', 'int', 'calc', 'auto'].includes(f.t) && k !== 'Status' && k !== 'Hari' && k !== 'Delta_Populasi' ? 'angka' : ''; };
    async function muat() {
      isi.innerHTML = skeleton(4, 'h-9 m-2');
      try {
        const r = await API.api('data.list', { tabel: skema.key, hal: st.hal, per: st.per, q: st.q, dari: st.dari, sampai: st.sampai, urut: st.urut, arah: st.arah, filter: o.filter });
        if (!r.success) throw new Error(r.message); st.data = r.data; gambar();
      } catch (e) { isi.innerHTML = `<div class="p-3">${galat(e.message, 'td-ulang-' + skema.key)}</div>`; const u = $('#td-ulang-' + skema.key); if (u) u.onclick = muat; }
    }
    function gambar() {
      const d = st.data, k = kol();
      if (!d.rows.length) { isi.innerHTML = `<div class="p-3">${kosong('Belum ada data ' + skema.judul, st.q || st.dari ? 'Tidak ada data yang cocok dengan filter.' : 'Tambahkan lewat tombol Input atau Impor Excel.', bolehTulis ? `<button class="tombol tombol-utama mt-3" data-tambah>${ik('add')}Input data pertama</button>` : '')}</div>`; }
      else isi.innerHTML = `<div class="hidden md:block scroll-x max-h-[560px] overflow-y-auto"><table class="tabel"><thead><tr>${k.map(c => `<th><button class="flex items-center gap-1 uppercase" data-urut="${c}">${esc(fdef(c).l)}${st.urut === c ? ik(st.arah === 'asc' ? 'arrow_upward' : 'arrow_downward', 'text-[14px]') : ''}</button></th>`).join('')}<th></th></tr></thead><tbody>${d.rows.map(r => `<tr class="cursor-pointer" data-id="${esc(r.ID)}">${k.map(c => `<td class="${angka(c)}">${sel(r, c)}</td>`).join('')}<td class="text-right whitespace-nowrap">${r.Catatan_Impor ? `<span title="${esc(r.Catatan_Impor)}">${ik('warning', 'text-warn-ink')}</span>` : ''}${ik('chevron_right', 'text-secondary')}</td></tr>`).join('')}</tbody></table></div>
        <div class="md:hidden divide-y divide-hairline">${d.rows.map(r => `<button class="w-full text-left p-3 hover:bg-surface-low" data-id="${esc(r.ID)}"><div class="flex items-center justify-between gap-2"><span class="font-mono text-mono-badge text-secondary">${esc(r.ID)}</span>${r.Status ? badge(r.Status) : ''}</div><div class="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">${k.filter(c => c !== 'Status').slice(0, 6).map(c => `<div><div class="label text-[10px]">${esc(fdef(c).l)}</div><div class="${angka(c) ? 'font-mono' : ''}">${sel(r, c)}</div></div>`).join('')}</div></button>`).join('')}</div>`;
      pg.innerHTML = `<span>${num(d.total, 0)} baris · hal ${d.hal}/${d.halaman}</span><div class="flex items-center gap-1"><select class="input w-auto font-mono" data-per>${[25, 50, 100, 200].map(n => `<option ${n === st.per ? 'selected' : ''}>${n}</option>`).join('')}</select><button class="tombol-ikon" data-hal="-1" ${d.hal <= 1 ? 'disabled' : ''} aria-label="Halaman sebelumnya">${ik('chevron_left')}</button><button class="tombol-ikon" data-hal="1" ${d.hal >= d.halaman ? 'disabled' : ''} aria-label="Halaman berikutnya">${ik('chevron_right')}</button></div>`;
    }
    const tambah = (row) => formulir(skema, row || {}, B, { onSimpan: async (d) => { const r = await API.api('data.save', { tabel: skema.key, row: d }); if (r.success) { muat(); if (o.onUbah) o.onUbah(); } return r; }, bawaanLagi: (d) => { const b = { Tanggal: d.Tanggal }; ['Bay', 'GH', 'Lokasi', 'Area', 'Shift', 'Item', 'Material'].forEach(x => { if (d[x] !== undefined) b[x] = d[x]; }); return b; } });
    async function buka(id) {
      const r = await API.api('data.get', { tabel: skema.key, id }); if (!r.success) return toast(r.message, 'crit');
      const row = r.data.row; const dihapus = !!row.Dihapus;
      const aksi = bolehTulis ? (dihapus ? `<button class="tombol" data-pulih>${ik('restore')}Pulihkan</button>` : `<button class="tombol" data-hapus>${ik('delete')}Hapus</button><button class="tombol tombol-utama" data-ubah>${ik('edit')}Ubah</button>`) : '';
      const dlg = detailRekaman(skema, row, r.data.lampiran, aksi);
      dlg.el.addEventListener('click', async e => {
        if (e.target.closest('[data-ubah]')) { dlg.tutup(); tambah(row); }
        if (e.target.closest('[data-hapus]') || e.target.closest('[data-pulih]')) {
          const pulih = !!e.target.closest('[data-pulih]');
          const ok = pulih ? true : await konfirmasi('Hapus data ' + row.ID + '?', 'Data tidak dibuang dari spreadsheet — hanya ditandai terhapus dan tetap tercatat di jejak audit.', { ketik: 'HAPUS', bahaya: true, label: 'Hapus' });
          if (!ok) return; const h = await API.api('data.hapus', { tabel: skema.key, id: row.ID, pulihkan: pulih }); toast(h.message, h.success ? 'ok' : 'crit'); if (h.success) { dlg.tutup(); muat(); if (o.onUbah) o.onUbah(); }
        }
      });
    }
    let tq; wadah.addEventListener('input', e => { if (e.target.matches('[data-q]')) { clearTimeout(tq); tq = setTimeout(() => { st.q = e.target.value.trim(); st.hal = 1; muat(); }, 350); } });
    wadah.addEventListener('change', e => { if (e.target.matches('[data-dari]')) { st.dari = e.target.value; st.hal = 1; muat(); } if (e.target.matches('[data-sampai]')) { st.sampai = e.target.value; st.hal = 1; muat(); } if (e.target.matches('[data-per]')) { st.per = +e.target.value; st.hal = 1; muat(); } });
    wadah.addEventListener('click', e => {
      const u = e.target.closest('[data-urut]'); if (u) { st.arah = st.urut === u.dataset.urut && st.arah === 'desc' ? 'asc' : 'desc'; st.urut = u.dataset.urut; muat(); return; }
      const h = e.target.closest('[data-hal]'); if (h) { st.hal += +h.dataset.hal; muat(); return; }
      if (e.target.closest('[data-tambah]')) return tambah();
      if (e.target.closest('[data-segar]')) return muat();
      if (e.target.closest('[data-kolom]')) { st.semuaKolom = !st.semuaKolom; if (st.data) gambar(); return; }
      const row = e.target.closest('[data-id]'); if (row) buka(row.dataset.id);
    });
    menuEkspor($('[data-ekspor]', wadah), async (f) => {
      const r = await API.api('data.semua', { tabel: skema.key, q: st.q, dari: st.dari, sampai: st.sampai, filter: o.filter }); if (!r.success) throw new Error(r.message);
      const k = skema.f.filter(x => x.t !== 'foto').map(x => x.k); const rows = r.data.rows.map(x => { const z = { ID: x.ID }; k.forEach(c => z[fdef(c).l] = x[c]); return z; });
      const nama = `AWB_${skema.key}_${st.dari || 'awal'}_${st.sampai || hariIni()}`, judul = skema.judul + ' — ' + (skema.div === '*' ? 'Pengaturan' : skema.div);
      if (f === 'xlsx') return Ekspor.xlsx(nama, [{ nama: skema.judul, rows }]);
      if (f === 'csv') return Ekspor.csv(nama, rows);
      const kk = ['ID'].concat((skema.ringkas || []).map(c => fdef(c).l)); const kr = r.data.rows.map(x => [x.ID].concat((skema.ringkas || []).map(c => typeof x[c] === 'number' ? num(x[c]) : (x[c] === undefined ? '' : String(x[c])))));
      if (f === 'pdf') return Ekspor.pdf(nama, judul, 'Periode ' + (st.dari || 'awal') + ' s/d ' + (st.sampai || hariIni()) + ' · ' + rows.length + ' baris', [{ kolom: kk, baris: kr }], { lanskap: true });
      if (f === 'word') return Ekspor.word(nama, judul, `<table><tr>${kk.map(x => `<th>${esc(x)}</th>`).join('')}</tr>${kr.map(rr => `<tr>${rr.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table>`);
      if (f === 'ppt') return Ekspor.ppt(nama, judul, [{ judul: skema.judul + ' (ringkas)', tabel: r.data.rows.slice(0, 14).map(x => { const z = {}; (skema.ringkas || []).forEach(c => z[fdef(c).l] = x[c]); return z; }) }]);
    });
    muat();
    return { muat, tambah };
  }

  /* ======================= WIZARD IMPOR EXCEL (desain 11) ======================= */
  async function halImpor(main, B, q) {
    const bolehTabel = B.tabel.filter(t => (t.master ? B.hak.PENGATURAN.includes('S') && B.me.peran === 'MANAGER' : (B.hak.IMPOR || '').includes('W') && (B.me.divisi.includes('*') || B.me.divisi.includes(t.div) || ['MANAGER'].includes(B.me.peran))));
    const st = { langkah: 1, tabel: q.tabel || (bolehTabel[0] || {}).key, wb: null, namaFile: '', lembar: '', barisHeader: 1, isiBawah: true, unpivot: false, peta: {}, rows: [], hasil: null };
    if (!bolehTabel.length) { main.innerHTML = kosong('Tidak ada hak impor', 'Impor Excel hanya untuk SPV (divisinya) dan Manager.'); return; }
    const skema = () => B.tabel.find(t => t.key === st.tabel);
    const LANGKAH = ['Unggah', 'Lembar & Header', 'Petakan Kolom', 'Validasi & Impor'];
    const n = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    function bacaLembar() {
      const ws = st.wb.Sheets[st.lembar]; const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
      const h = (aoa[st.barisHeader - 1] || []).map(x => String(x).trim()); let last = h.length; while (last > 0 && !h[last - 1]) last--;   // kolom kosong di ujung diabaikan
      let rows = aoa.slice(st.barisHeader).map(r => r.slice(0, last)).filter(r => r.some(x => x !== '' && x !== null));
      if (st.isiBawah) { const kolT = h.map((x, i) => /tanggal|tgl|area|shift|lokasi|^gh$/i.test(x) ? i : -1).filter(i => i >= 0); let prev = null; rows = rows.map(r => { if (prev) kolT.forEach(i => { if (r[i] === '' || r[i] === null) r[i] = prev[i]; }); prev = r; return r; }); }
      let hdr = h.slice(0, last);
      if (st.unpivot) {   // KEMASAN: items_1_name, items_1_std … → satu baris per item
        const grup = {}; hdr.forEach((x, i) => { const m = x.match(/^items_(\d+)_(.+)$/); if (m) { grup[m[1]] = grup[m[1]] || {}; grup[m[1]][m[2]] = i; } });
        const umum = hdr.map((x, i) => /^items_\d+_/.test(x) ? -1 : i).filter(i => i >= 0); const kunci = Array.from(new Set([].concat(...Object.values(grup).map(g => Object.keys(g)))));
        const nh = umum.map(i => hdr[i]).concat(kunci); const nr = [];
        rows.forEach(r => Object.keys(grup).forEach(g => { const v = kunci.map(k => grup[g][k] !== undefined ? r[grup[g][k]] : ''); if (v.some(x => x !== '' && x !== 0)) nr.push(umum.map(i => r[i]).concat(v)); }));
        hdr = nh; rows = nr;
      }
      st.hdr = hdr; st.aoa = rows;
      const alias = { tgl: 'Tanggal', name: 'Item', std: 'Standar', masuk: 'Masuk', bongkardus: 'Bongkar_Dus', aktualpcs: 'Aktual_Pcs', kirim: 'Kirim', tamu: 'Tamu', kettamu: 'Ket_Tamu', rejecttutup: 'Reject_Tutup', rejectalas: 'Reject_Alas', ketreject: 'Ket_Reject', crackingirigasi: 'Reject_Crack', polinasi: 'Reject_Poli', hpt: 'Reject_HPT', ec: 'Ec', jam0600c: 'J06_C', jam0600rh: 'J06_RH', jam0900c: 'J09_C', jam0900rh: 'J09_RH', jam1200c: 'J12_C', jam1200rh: 'J12_RH', jam1500c: 'J15_C', jam1500rh: 'J15_RH', suhuc: 'Suhu', antrakraw: 'Antrak_Raw', namapekerja: 'Nama_Pekerja', kegiatanutamakegiatanlainnya: 'Kegiatan', deskripsikendala: 'Deskripsi_Kendala', temuanhpt: 'Temuan_HPT' };
      st.peta = {}; const sk = skema();
      hdr.forEach((x, i) => { const nn = n(x); let c = sk.f.find(f => f.t !== 'calc' && (n(f.k) === nn || n(f.l) === nn)); if (!c && alias[nn]) c = sk.f.find(f => f.k === alias[nn]); if (!c) { const m = x.match(/^(bay|kotak)\s*(\d+)/i); if (m) c = sk.f.find(f => n(f.k) === n(m[1] + '_' + m[2]) || n(f.k) === n(m[1] + m[2])); } if (c && !Object.values(st.peta).includes(c.k)) st.peta[i] = c.k; else if (/^id$/i.test(x)) st.peta[i] = 'ID'; });
    }
    function bangunBaris() { const sk = skema(); return st.aoa.map(r => { const o = {}; Object.keys(st.peta).forEach(i => { if (!st.peta[i]) return; let v = r[i]; const f = sk.f.find(x => x.k === st.peta[i]); if (f && f.t === 'date' && typeof v === 'number') v = new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 10); if (f && f.t === 'time' && typeof v === 'number' && v < 1) { const m = Math.round(v * 1440); v = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); } o[st.peta[i]] = v; }); return o; }); }
    function cekBaris(o) { const sk = skema(), w = []; sk.f.forEach(f => { if (f.req && f.t !== 'calc' && (o[f.k] === '' || o[f.k] === undefined || o[f.k] === null)) w.push(f.l + ' kosong'); if ((f.t === 'num' || f.t === 'int') && o[f.k] !== '' && o[f.k] !== undefined && isNaN(UI.H.N(o[f.k])) ) w.push(f.l + ' bukan angka'); }); return w; }
    function gambar() {
      const sk = skema();
      main.innerHTML = `<div class="flex flex-wrap items-end justify-between gap-3 mb-4"><div><p class="font-mono text-mono-badge text-secondary">IMPOR DATA // WIZARD 4 LANGKAH</p><h1 class="font-display text-headline-lg">Impor Excel</h1></div><a class="tombol" href="#" id="imp-template">${ik('download')}Unduh template ${esc(sk.judul)}</a></div>
      <ol class="grid grid-cols-4 border border-hairline bg-surface mb-4">${LANGKAH.map((l, i) => `<li class="p-2 sm:p-3 border-r border-hairline last:border-r-0 ${st.langkah === i + 1 ? 'bg-primary text-on-primary' : st.langkah > i + 1 ? 'bg-ok-bg text-ok-ink' : 'text-secondary'}"><span class="font-mono text-[10px] block">LANGKAH ${i + 1}</span><span class="text-body-sm font-semibold hidden sm:block">${l}</span></li>`).join('')}</ol><div id="imp-isi" class="kartu p-4"></div>`;
      const box = $('#imp-isi', main);
      if (st.langkah === 1) box.innerHTML = `<label class="block max-w-md mb-4"><span class="label">Tabel tujuan</span><select class="input mt-1" id="imp-tabel">${bolehTabel.map(t => `<option value="${t.key}" ${t.key === st.tabel ? 'selected' : ''}>${esc((t.master ? 'Master' : t.div) + ' · ' + t.judul)}</option>`).join('')}</select></label>
        <label class="block border-2 border-dashed border-strong p-10 text-center cursor-pointer hover:bg-surface-low" id="imp-drop">${ik('upload_file', 'text-[40px] text-secondary')}<p class="mt-2 font-semibold">Seret berkas Excel ke sini atau klik untuk memilih</p><p class="text-body-sm text-secondary mt-1">.xlsx · .xls · .csv — baris tidak akan pernah dibuang; baris kurang lengkap tetap masuk dengan catatan.</p><input type="file" class="sr-only" accept=".xlsx,.xls,.csv" id="imp-file"></label><p class="mt-3 font-mono text-mono-badge text-secondary" id="imp-status"></p>`;
      if (st.langkah === 2) box.innerHTML = `<div class="grid sm:grid-cols-3 gap-3"><label><span class="label">Lembar (sheet)</span><select class="input mt-1" id="imp-lembar">${st.wb.SheetNames.map(s => `<option ${s === st.lembar ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label><label><span class="label">Baris header</span><input type="number" min="1" class="input mt-1 font-mono" id="imp-hdr" value="${st.barisHeader}"></label><div class="space-y-2 pt-5"><label class="flex items-center gap-2"><input type="checkbox" id="imp-bawah" ${st.isiBawah ? 'checked' : ''}> Isi ke bawah sel kosong (Tanggal/Area/Shift gabungan)</label><label class="flex items-center gap-2"><input type="checkbox" id="imp-unpivot" ${st.unpivot ? 'checked' : ''}> Pecah kolom items_1…3 menjadi baris (format KEMASAN)</label></div></div>
        <h3 class="judul-bagian mt-4">Pratinjau header terbaca (${st.hdr.length} kolom, ${st.aoa.length} baris)</h3><div class="scroll-x"><table class="tabel"><thead><tr>${st.hdr.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${st.aoa.slice(0, 5).map(r => `<tr>${r.map(v => `<td class="font-mono text-body-sm">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${navBtn()}`;
      if (st.langkah === 3) { const ops = (sel) => `<option value="">— abaikan —</option>` + sk.f.filter(f => f.t !== 'calc' && f.t !== 'auto' && f.t !== 'foto').map(f => `<option value="${f.k}" ${sel === f.k ? 'selected' : ''}>${esc(f.l)}${f.req ? ' *' : ''}</option>`).join('') + `<option value="ID" ${sel === 'ID' ? 'selected' : ''}>ID (perbarui jika sama)</option>`;
        const wajibBelum = sk.f.filter(f => f.req && f.t !== 'calc' && !Object.values(st.peta).includes(f.k));
        box.innerHTML = `${wajibBelum.length ? `<div class="border border-warn-ink/40 bg-warn-bg p-2 mb-3 text-body-sm">${ik('warning', 'text-warn-ink')} Kolom wajib belum terpetakan: <b>${wajibBelum.map(f => esc(f.l)).join(', ')}</b> — baris tetap masuk dengan catatan.</div>` : ''}<div class="scroll-x"><table class="tabel"><thead><tr><th>Kolom Excel</th><th>Contoh</th><th>Kolom Aplikasi</th><th>Status</th></tr></thead><tbody>${st.hdr.map((h, i) => `<tr><td class="font-mono">${esc(h)}</td><td class="font-mono text-body-sm text-secondary">${esc((st.aoa[0] || [])[i])}</td><td><select class="input" data-peta="${i}">${ops(st.peta[i])}</select></td><td>${st.peta[i] ? badge('Cocok', 'ok') : badge('Tak terpetakan', 'warn')}</td></tr>`).join('')}</tbody></table></div>${navBtn()}`; }
      if (st.langkah === 4) {
        const rows = bangunBaris(); const cek = rows.map(cekBaris); const bermasalah = cek.filter(x => x.length).length;
        box.innerHTML = st.hasil ? hasilHtml() : `<div class="grid grid-cols-3 gap-3 mb-4">${UI.kartuKPI({ l: 'Total baris', v: rows.length, u: 'baris' })}${UI.kartuKPI({ l: 'Siap tanpa catatan', v: rows.length - bermasalah, u: 'baris' })}${UI.kartuKPI({ l: 'Masuk dengan catatan', v: bermasalah, u: 'baris' })}</div>
          <h3 class="judul-bagian">Pratinjau 5 baris pertama → ${esc(sk.judul)}</h3><div class="scroll-x mb-3"><table class="tabel"><thead><tr><th>#</th>${Object.values(st.peta).filter(Boolean).map(k => `<th>${esc(k)}</th>`).join('')}<th>Catatan</th></tr></thead><tbody>${rows.slice(0, 5).map((r, i) => `<tr><td class="font-mono">${i + 1}</td>${Object.values(st.peta).filter(Boolean).map(k => `<td class="font-mono text-body-sm">${esc(r[k])}</td>`).join('')}<td>${cek[i].length ? badge(cek[i].join('; '), 'warn') : badge('OK', 'ok')}</td></tr>`).join('')}</tbody></table></div>
          <label class="flex items-center gap-2 mb-3"><input type="checkbox" id="imp-upsert"> Perbarui baris yang ID-nya sudah ada (upsert)</label><div id="imp-prog" class="hidden mb-3"><div class="h-2 bg-surface-high"><div class="h-2 bg-primary" id="imp-bar" style="width:0%"></div></div><p class="font-mono text-mono-badge text-secondary mt-1" id="imp-prog-t"></p></div>${navBtn('Konfirmasi & Impor ' + rows.length + ' baris')}`;
      }
      bind();
    }
    const navBtn = (lbl) => `<div class="flex justify-between gap-2 mt-4 pt-3 border-t border-hairline"><button class="tombol" data-mundur>${ik('arrow_back')}Kembali</button><button class="tombol tombol-utama" data-maju>${lbl || 'Lanjut'} ${ik('arrow_forward')}</button></div>`;
    const hasilHtml = () => { const h = st.hasil; return `<div class="grid grid-cols-3 gap-3 mb-4">${UI.kartuKPI({ l: 'Baris masuk', v: h.masuk, u: 'baru' })}${UI.kartuKPI({ l: 'Diperbarui', v: h.diperbarui, u: 'baris' })}${UI.kartuKPI({ l: 'Dengan catatan', v: h.peringatan, u: 'baris' })}</div>${h.detail.length ? `<h3 class="judul-bagian">Catatan per baris</h3><div class="max-h-72 overflow-auto"><table class="tabel"><thead><tr><th>Baris</th><th>Catatan</th></tr></thead><tbody>${h.detail.map(d => `<tr><td class="font-mono">${d.baris}</td><td>${esc(d.catatan)}</td></tr>`).join('')}</tbody></table></div>` : ''}<div class="flex gap-2 mt-4"><a class="tombol tombol-utama" href="#/div/${skema().div === '*' ? '' : skema().div}">${ik('table_view')}Lihat data</a><button class="tombol" data-ulang>${ik('restart_alt')}Impor berkas lain</button></div>`; };
    function bind() {
      const tb = $('#imp-tabel', main); if (tb) tb.onchange = () => { st.tabel = tb.value; gambar(); };
      $('#imp-template', main).onclick = async (e) => { e.preventDefault(); const sk = skema(); await Ekspor.xlsx('Template_' + sk.key, [{ nama: sk.judul, rows: [sk.f.filter(f => f.t !== 'calc' && f.t !== 'auto' && f.t !== 'foto').map(f => f.k)] }]); };
      const fi = $('#imp-file', main), drop = $('#imp-drop', main);
      const muatFile = async (file) => { $('#imp-status', main).textContent = 'Membaca ' + file.name + '…'; try { await muat('xlsx'); await tunggu(() => window.XLSX); const buf = await file.arrayBuffer(); st.wb = XLSX.read(buf, { type: 'array', cellDates: false }); st.namaFile = file.name; st.lembar = st.wb.SheetNames[0]; st.unpivot = false; bacaLembar(); st.unpivot = st.hdr.some(h => /^items_\d+_/.test(h)); if (st.unpivot) bacaLembar(); st.langkah = 2; gambar(); } catch (e) { $('#imp-status', main).textContent = 'Gagal membaca berkas: ' + e.message; } };
      if (fi) fi.onchange = () => fi.files[0] && muatFile(fi.files[0]);
      if (drop) { drop.ondragover = e => { e.preventDefault(); drop.classList.add('bg-surface-low'); }; drop.ondragleave = () => drop.classList.remove('bg-surface-low'); drop.ondrop = e => { e.preventDefault(); if (e.dataTransfer.files[0]) muatFile(e.dataTransfer.files[0]); }; }
      const lb = $('#imp-lembar', main), hd = $('#imp-hdr', main), bw = $('#imp-bawah', main), up = $('#imp-unpivot', main);
      [lb, hd, bw, up].forEach(x => x && (x.onchange = () => { st.lembar = lb.value; st.barisHeader = Math.max(1, +hd.value || 1); st.isiBawah = bw.checked; st.unpivot = up.checked; bacaLembar(); gambar(); }));
      $$('[data-peta]', main).forEach(s => s.onchange = () => { st.peta[s.dataset.peta] = s.value; gambar(); });
      const md = $('[data-mundur]', main); if (md) md.onclick = () => { st.langkah = Math.max(1, st.langkah - 1); gambar(); };
      const ul = $('[data-ulang]', main); if (ul) ul.onclick = () => { st.langkah = 1; st.hasil = null; st.wb = null; gambar(); };
      const mj = $('[data-maju]', main); if (mj) mj.onclick = async () => {
        if (st.langkah < 4) { st.langkah++; return gambar(); }
        const rows = bangunBaris(), PER = 250; mj.disabled = true; $('#imp-prog', main).classList.remove('hidden'); const tot = { masuk: 0, diperbarui: 0, peringatan: 0, detail: [] };
        try {
          for (let i = 0; i < rows.length; i += PER) {
            $('#imp-prog-t', main).textContent = 'Mengirim baris ' + (i + 1) + '–' + Math.min(rows.length, i + PER) + ' dari ' + rows.length + '…';
            const r = await API.api('data.impor', { tabel: st.tabel, rows: rows.slice(i, i + PER), namaFile: st.namaFile + ' / ' + st.lembar, offset: i, mode: $('#imp-upsert', main).checked ? 'upsert' : '' });
            if (!r.success) throw new Error(r.message); tot.masuk += r.data.masuk; tot.diperbarui += r.data.diperbarui; tot.peringatan += r.data.peringatan; tot.detail = tot.detail.concat(r.data.detail);
            $('#imp-bar', main).style.width = Math.round(Math.min(rows.length, i + PER) / rows.length * 100) + '%';
          }
          st.hasil = tot; toast(tot.masuk + ' baris masuk, ' + tot.peringatan + ' dengan catatan. Tidak ada baris yang dibuang.'); gambar();
        } catch (e) { toast('Impor terhenti: ' + e.message + ' — baris yang sudah terkirim tetap tersimpan.', 'crit'); mj.disabled = false; }
      };
    }
    gambar();
  }

  window.Alat = { muat, Ekspor, menuEkspor, modeSlide, TabelData, halImpor, unduh, sha256Teks, tunggu, stempel };
})();
