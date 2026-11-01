/* Agri Wangi Berry Report v1.0.0 — lapisan API (fetch ke GAS REST)
 * Dedupe baca + epoch tulis · penggabung batch otomatis · SWR lokal ·
 * antrean offline · drain email · warmup · Perf.table() */
(function () {
  const CFG = window.APP_CONFIG || {};
  const BACA = /^(boot|beranda|dashboard|divisi\.ringkas|data\.(list|get|semua)|isu\.(list|get)|gagasan\.list|notif\.list|laporan\.(list|get)|pengaturan\.get|pengguna\.list|audit\.(list|verifikasi)|impor\.log|lampiran\.ambil)$/;
  const Sesi = {
    get token() { try { return localStorage.getItem('awb_token') || ''; } catch (e) { return ''; } },
    set(token, me) { try { localStorage.setItem('awb_token', token); localStorage.setItem('awb_me', JSON.stringify(me || {})); } catch (e) { } },
    me() { try { return JSON.parse(localStorage.getItem('awb_me') || 'null'); } catch (e) { return null; } },
    hapus() { try { localStorage.removeItem('awb_token'); localStorage.removeItem('awb_me'); Object.keys(localStorage).filter(k => k.startsWith('awb_swr_')).forEach(k => localStorage.removeItem(k)); } catch (e) { } }
  };
  const Perf = { log: [], catat(a, total, server, cached) { this.log.push({ aksi: a, total, server, net: total - (server || 0), cache: cached ? '✓' : '' }); if (this.log.length > 300) this.log.shift(); }, table() { console.table(this.log.slice(-40)); }, summary() { const m = {}; this.log.forEach(x => { m[x.aksi] = m[x.aksi] || { n: 0, t: 0 }; m[x.aksi].n++; m[x.aksi].t += x.total; }); console.table(Object.keys(m).map(k => ({ aksi: k, n: m[k].n, rata: Math.round(m[k].t / m[k].n) }))); } };
  const konfigSiap = () => CFG.GAS_URL && !/GANTI|XXXX/.test(CFG.GAS_URL);

  async function kirim(action, data) {
    if (!konfigSiap()) throw new Error('Konfigurasi belum lengkap: isi GAS_URL di js/config.js dengan URL Web App (/exec).');
    const t0 = performance.now();
    const res = await fetch(CFG.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: Sesi.token, data: data || {} }), redirect: 'follow' });
    if (!res.ok) throw new Error('Server merespons ' + res.status);
    const j = await res.json();
    Perf.catat(action, Math.round(performance.now() - t0), j.ms);
    if (j.code === 'AUTH' && action !== 'auth.keluar') { Sesi.hapus(); window.dispatchEvent(new CustomEvent('awb:auth')); }
    if (j.nq > 0) jadwalDrain();
    return j;
  }
  const _inflight = {}; let _epoch = 0;
  async function api(action, data) {
    if (!BACA.test(action)) {
      _epoch++;
      try { return await kirim(action, data); }
      catch (e) { if (action === 'data.save' && (e instanceof TypeError || !navigator.onLine)) return Antrean.tambah(action, data); throw e; }
    }
    const k = _epoch + '|' + action + '|' + JSON.stringify(data || {});
    if (_inflight[k]) return _inflight[k];
    const p = kirim(action, data); _inflight[k] = p;
    p.then(() => delete _inflight[k], () => delete _inflight[k]);
    return p;
  }
  /* Penggabung batch: beberapa baca pada tik yang sama → 1 eksekusi server */
  const Batcher = {
    q: null,
    add(action, data) { return new Promise((res, rej) => { if (!this.q) { this.q = []; setTimeout(() => this.flush(), 0); } this.q.push({ action, data: data || {}, res, rej }); }); },
    async flush() {
      const q = this.q; this.q = null; if (!q || !q.length) return;
      if (q.length === 1) { api(q[0].action, q[0].data).then(q[0].res, q[0].rej); return; }
      for (let i = 0; i < q.length; i += 10) {
        const part = q.slice(i, i + 10);
        try { const r = await api('batch', { calls: part.map(x => ({ action: x.action, data: x.data })) }); if (!r.success) { part.forEach(x => x.res(r)); continue; } part.forEach((x, j) => x.res(r.data[j])); }
        catch (e) { part.forEach(x => x.rej(e)); }
      }
    }
  };
  /* SWR: tampilkan cache lokal dulu, segarkan di latar belakang */
  function swrGet(k) { try { const v = JSON.parse(localStorage.getItem('awb_swr_' + k) || 'null'); return v; } catch (e) { return null; } }
  function swrPut(k, data) { try { localStorage.setItem('awb_swr_' + k, JSON.stringify({ t: Date.now(), d: data })); } catch (e) { } }
  async function swr(action, data, onData, maxUsiaMs) {
    const k = action + JSON.stringify(data || {}); const c = swrGet(k);
    if (c && c.d) onData(c.d, true);
    if (c && maxUsiaMs && Date.now() - c.t < maxUsiaMs) return c.d;
    const r = await Batcher.add(action, data);
    if (r && r.success) { swrPut(k, r.data); onData(r.data, false); return r.data; }
    if (!c) throw new Error((r && r.message) || 'Gagal memuat data');
    return c.d;
  }
  /* Antrean offline untuk input lapangan (blind-spot greenhouse) */
  const Antrean = {
    ambil() { try { return JSON.parse(localStorage.getItem('awb_antrean') || '[]'); } catch (e) { return []; } },
    simpan(q) { try { localStorage.setItem('awb_antrean', JSON.stringify(q)); } catch (e) { } window.dispatchEvent(new CustomEvent('awb:antrean', { detail: q.length })); },
    tambah(action, data) { const q = this.ambil(); const id = 'Q-' + Date.now().toString(36).toUpperCase(); q.push({ id, action, data, t: Date.now() }); this.simpan(q); return { success: true, antre: true, data: { row: Object.assign({ ID: id }, data.row) }, message: 'Mode offline — data disimpan di perangkat dan akan dikirim otomatis saat koneksi pulih (' + id + ').' }; },
    async kirimSemua() {
      const q = this.ambil(); if (!q.length || !navigator.onLine) return 0; let n = 0; const sisa = [];
      for (const it of q) { try { const r = await kirim(it.action, it.data); if (r.success) n++; else sisa.push(Object.assign(it, { galat: r.message })); } catch (e) { sisa.push(it); } }
      this.simpan(sisa); if (n) window.dispatchEvent(new CustomEvent('awb:tersinkron', { detail: n })); return n;
    }
  };
  window.addEventListener('online', () => Antrean.kirimSemua());
  setInterval(() => { if (navigator.onLine && Antrean.ambil().length) Antrean.kirimSemua(); }, 30000);
  let _drainT = null, _drainN = 0;
  function jadwalDrain() { clearTimeout(_drainT); _drainT = setTimeout(async () => { try { const r = await kirim('drain', {}); if (r.data && r.data.left > 0 && ++_drainN < 3) jadwalDrain(); else _drainN = 0; } catch (e) { } }, 400); }
  function warmUp(scope) { if (!konfigSiap()) return; try { const k = 'awb_warm_' + scope; const t = +sessionStorage.getItem(k) || 0; if (Date.now() - t < 240000) return; sessionStorage.setItem(k, Date.now()); } catch (e) { } fetch(CFG.GAS_URL + '?w=' + encodeURIComponent(scope), { mode: 'no-cors' }).catch(() => { }); }
  const Aktivitas = { at: Date.now(), last: {}, init() { ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => this.at = Date.now(), { passive: true })); }, due(k, aktif, idle) { if (document.visibilityState !== 'visible') return false; const jeda = Date.now() - this.at > 120000 ? idle : aktif; if (Date.now() - (this.last[k] || 0) < jeda - 500) return false; this.last[k] = Date.now(); return true; } };
  Aktivitas.init();
  window.API = { api, apiQ: (a, d) => Batcher.add(a, d), swr, Sesi, Antrean, Perf, warmUp, Aktivitas, konfigSiap, kirim };
  window.Perf = Perf;
})();
