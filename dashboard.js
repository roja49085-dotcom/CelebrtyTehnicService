/* ===== PENGATURAN DASHBOARD ===== */
const DASH = {
  pin: '081290',               // samakan dengan PIN di script.js, lalu ganti!
  wa: '628111817710'         // nomor WA admin (format 62..., tanpa + atau spasi)
};
const STATUS = ['Baru', 'Dijadwalkan', 'Dikerjakan', 'Selesai', 'Dibatalkan'];
const ORDERS_KEY = 'cts_orders_v1';
const SESSION_KEY = 'cts_admin_ok';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rupiah = (n) => 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
const tglPendek = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return isNaN(d) ? '-' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};
const jam = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

/* ===== Penyimpanan ===== */
let mem = [];
function load() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch (e) { return mem; } }
function save(list) { mem = list; try { localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); } catch (e) {} }

/* ===== Login ===== */
function sudahMasuk() { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } }
function tampil(masuk) {
  $('loginView').hidden = masuk;
  $('appView').hidden = !masuk;
  $('logout').hidden = !masuk;
  if (masuk) render();
}
$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if ($('pin').value === DASH.pin) {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (err) {}
    $('pin').value = ''; $('loginErr').textContent = '';
    tampil(true);
  } else {
    $('loginErr').textContent = 'PIN salah. Coba lagi.';
  }
});
$('logout').addEventListener('click', () => {
  try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  tampil(false);
});

/* ===== Filter ===== */
$('fStatus').innerHTML = '<option value="">Semua status</option>' + STATUS.map(s => `<option>${s}</option>`).join('');
$('fPerangkat').innerHTML = '<option value="">Semua perangkat</option>' +
  ['AC', 'Kulkas', 'Mesin Cuci', 'TV', 'Dispenser', 'Lainnya'].map(s => `<option>${s}</option>`).join('');
['cari', 'fStatus', 'fPerangkat'].forEach(id => $(id).addEventListener('input', render));

function terfilter() {
  const q = $('cari').value.trim().toLowerCase();
  const st = $('fStatus').value, pf = $('fPerangkat').value;
  return load().filter(o =>
    (!st || o.status === st) &&
    (!pf || o.perangkat === pf) &&
    (!q || [o.nama, o.hp, o.alamat, o.keluhan, o.id].join(' ').toLowerCase().includes(q))
  );
}

/* ===== Tampilan ===== */
function renderStats() {
  const all = load();
  const hitung = (s) => all.filter(o => o.status === s).length;
  const pendapatan = all.filter(o => o.status === 'Selesai').reduce((a, o) => a + (Number(o.biaya) || 0), 0);
  $('stats').innerHTML = `
    <div class="stat"><b>${all.length}</b><span>Total pesanan</span></div>
    <div class="stat s-baru"><b>${hitung('Baru')}</b><span>Baru masuk</span></div>
    <div class="stat s-jadwal"><b>${hitung('Dijadwalkan')}</b><span>Dijadwalkan</span></div>
    <div class="stat s-kerja"><b>${hitung('Dikerjakan')}</b><span>Dikerjakan</span></div>
    <div class="stat s-selesai"><b>${hitung('Selesai')}</b><span>Selesai</span></div>
    <div class="stat s-uang"><b>${rupiah(pendapatan)}</b><span>Pendapatan (selesai)</span></div>`;
}

function waPelanggan(o) {
  let n = String(o.hp || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  const teks = `Halo ${o.nama}, kami dari Celebrity Tehnic Service. Terkait pesanan servis ${o.perangkat} Anda (${o.id}), `;
  return 'https://wa.me/' + n + '?text=' + encodeURIComponent(teks);
}

function render() {
  renderStats();
  const list = terfilter();
  const total = load().length;
  $('rows').innerHTML = list.map(o => `
    <tr>
      <td>${tglPendek(o.dibuat)}<div class="sub">${jam(o.dibuat)}</div></td>
      <td><div class="nm">${esc(o.nama)}</div><div class="sub">${esc(o.hp)}</div><div class="sub">${esc(o.alamat)}</div></td>
      <td><b>${esc(o.perangkat)}</b><div class="kel">${esc(o.keluhan)}</div></td>
      <td>${o.tanggal ? tglPendek(o.tanggal) : '<span class="sub">Belum dipilih</span>'}</td>
      <td><span class="badge b-${esc(o.status)}">${esc(o.status)}</span></td>
      <td>${Number(o.biaya) ? rupiah(o.biaya) : '<span class="sub">-</span>'}</td>
      <td><div class="rowacts">
        <button class="btn sm" data-edit="${esc(o.id)}" type="button">Kelola</button>
        <a class="btn sm wa" href="${waPelanggan(o)}" target="_blank" rel="noopener">WA</a>
      </div></td>
    </tr>`).join('');

  const kosong = $('empty');
  kosong.hidden = list.length > 0;
  if (!list.length) {
    kosong.innerHTML = total
      ? '<b>Tidak ada pesanan yang cocok</b>Ubah kata kunci atau filter.'
      : '<b>Belum ada pesanan</b>Pesanan dari form di website akan muncul di sini.';
  }
}

$('rows').addEventListener('click', (e) => {
  const b = e.target.closest('[data-edit]');
  if (b) bukaModal(b.dataset.edit);
});

/* ===== Modal kelola pesanan ===== */
let aktif = null;
$('mStatus').innerHTML = STATUS.map(s => `<option>${s}</option>`).join('');

function bukaModal(id) {
  const o = load().find(x => x.id === id);
  if (!o) return;
  aktif = id;
  $('mTitle').textContent = o.nama;
  $('mMeta').textContent = `${o.id} · masuk ${tglPendek(o.dibuat)} ${jam(o.dibuat)} · via ${o.via || '-'}`;
  $('mInfo').innerHTML =
    `<b>${esc(o.perangkat)}</b>: ${esc(o.keluhan)}<br>` +
    `HP: ${esc(o.hp)}<br>Alamat: ${esc(o.alamat)}<br>` +
    `Kunjungan diinginkan: ${o.tanggal ? tglPendek(o.tanggal) : 'belum dipilih'}`;
  $('mStatus').value = o.status;
  $('mBiaya').value = o.biaya || '';
  $('mCatatan').value = o.catatan || '';
  $('overlay').hidden = false;
  $('mStatus').focus();
}
function tutupModal() { $('overlay').hidden = true; aktif = null; }

$('mTutup').addEventListener('click', tutupModal);
$('overlay').addEventListener('click', (e) => { if (e.target === $('overlay')) tutupModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('overlay').hidden) tutupModal(); });

$('mSimpan').addEventListener('click', () => {
  const list = load();
  const o = list.find(x => x.id === aktif);
  if (!o) return;
  o.status = $('mStatus').value;
  o.biaya = Number($('mBiaya').value) || 0;
  o.catatan = $('mCatatan').value.trim();
  save(list);
  tutupModal();
  render();
});
$('mHapus').addEventListener('click', () => {
  if (!confirm('Hapus pesanan ini? Tindakan ini tidak bisa dibatalkan.')) return;
  save(load().filter(x => x.id !== aktif));
  tutupModal();
  render();
});

/* ===== Unduh CSV ===== */
$('exportCsv').addEventListener('click', () => {
  const list = terfilter();
  if (!list.length) { alert('Tidak ada data untuk diunduh.'); return; }
  const kol = ['id', 'dibuat', 'nama', 'hp', 'perangkat', 'alamat', 'keluhan', 'tanggal', 'status', 'biaya', 'catatan', 'via'];
  const cell = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const csv = [kol.join(',')].concat(list.map(o => kol.map(k => cell(o[k])).join(','))).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'pesanan-servis.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

/* Update otomatis jika form diisi di tab lain di browser yang sama */
window.addEventListener('storage', (e) => { if (e.key === ORDERS_KEY && !$('appView').hidden) render(); });

tampil(sudahMasuk());