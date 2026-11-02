/* ===== PENGATURAN: ubah di sini ===== */
const CONFIG = {
  nama: 'Celebrity Tehnic Service',
  wa: '628111817710',            // format 62..., tanpa + atau spasi
  layanan: [
    {ic:'❄️', n:'AC', items:[
      'AC tidak dingin','AC menetes atau bocor air','Isi freon dan cek kebocoran','Cuci AC (cuci rutin & cuci besar)',
      'Bunyi berisik atau bergetar','Kompresor, kapasitor, dan sensor rusak','Remote atau display error','Bongkar pasang AC']},
    {ic:'🧊', n:'Kulkas', items:[
      'Kulkas tidak dingin','Freezer berbunga es berlebihan','Kulkas bocor atau berair','Kompresor dan isi freon',
      'Bunyi kasar atau mesin terus menyala','Karet pintu longgar atau tidak rapat','Mati total atau sering mati sendiri']},
    {ic:'🧺', n:'Mesin cuci', items:[
      'Tidak berputar atau tidak berputar saat spin','Tidak mengeringkan','Air tidak masuk atau tidak terbuang',
      'Bocor','Bunyi keras atau bergetar hebat','Mati total atau muncul kode error','Pintu tidak bisa dibuka atau dikunci']},
    {ic:'📺', n:'TV', items:[
      'TV mati total','Layar bergaris, gelap, atau berbayang','Ada suara tetapi tidak ada gambar','Backlight rusak',
      'Port HDMI atau USB bermasalah','Restart terus atau hang di logo','Remote tidak berfungsi']},
    {ic:'🔧', n:'Elektronik lainnya', items:[
      'Dispenser (tidak panas atau tidak dingin, bocor)','Water heater','Pompa air','Kipas angin','Rice cooker']}
  ]
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ===== Halaman publik ===== */
document.querySelectorAll('.brand').forEach(e => e.textContent = CONFIG.nama);
$('yr').textContent = new Date().getFullYear();

const waLink = (txt) => 'https://wa.me/' + CONFIG.wa + (txt ? '?text=' + encodeURIComponent(txt) : '');
['waQuick', 'waFloat'].forEach(id => {
  const el = $(id);
  if (el) el.href = waLink('Halo, saya ingin servis elektronik.');
});
$('waText').href = waLink('');
$('waText').textContent = '+' + CONFIG.wa;

$('layananGrid').innerHTML = CONFIG.layanan.map(l =>
  `<div class="card"><h3>${l.ic} ${esc(l.n)}</h3><ul>${l.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`
).join('');

/* ===== Form pesanan ===== */
const v = (id) => $(id).value.trim();

function formValid() {
  if (!v('nama') || !v('hp') || !v('alamat') || !v('keluhan')) {
    $('galat').textContent = 'Mohon isi nama, nomor HP, alamat, dan keluhan.';
    $('sukses').hidden = true;
    return false;
  }
  $('galat').textContent = '';
  return true;
}

function teksPesanan() {
  return [
    'Halo, saya ingin memesan servis.',
    '',
    'Nama: ' + v('nama'),
    'No. HP: ' + v('hp'),
    'Perangkat: ' + v('perangkat'),
    'Tanggal diinginkan: ' + (v('tanggal') || '-'),
    'Alamat: ' + v('alamat'),
    'Keluhan: ' + v('keluhan')
  ].join('\n');
}

$('kirim').addEventListener('click', () => {
  if (!formValid()) return;
  $('sukses').textContent = 'Terima kasih, pesanan Anda sudah kami terima. Kami akan menghubungi Anda untuk konfirmasi jadwal.';
  $('sukses').hidden = false;
  // Form dikosongkan sedikit terlambat agar order-sync.js sempat membaca isinya
  setTimeout(() => $('orderForm').reset(), 300);
});

$('kirimWA').addEventListener('click', () => {
  if (!formValid()) return;
  window.open(waLink(teksPesanan()), '_blank', 'noopener');
});

/* ===== BURGER MENU RESPONSIVE ===== */
document.addEventListener("DOMContentLoaded", function () {

  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");

  if (!burger || !menu) return;

  burger.addEventListener("click", function () {

    const isOpen = menu.classList.toggle("open");

    burger.textContent = isOpen ? "✕" : "☰";

    burger.setAttribute("aria-expanded", String(isOpen));

    burger.setAttribute(
      "aria-label",
      isOpen ? "Tutup menu" : "Buka menu"
    );

  });

  // Tutup menu setelah link diklik
  menu.querySelectorAll("a").forEach(function (link) {

    link.addEventListener("click", function () {

      menu.classList.remove("open");

      burger.textContent = "☰";

      burger.setAttribute("aria-expanded", "false");

      burger.setAttribute("aria-label", "Buka menu");

    });

  });

  // Tutup menu ketika kembali ke desktop
  window.addEventListener("resize", function () {

    if (window.innerWidth > 760) {

      menu.classList.remove("open");

      burger.textContent = "☰";

      burger.setAttribute("aria-expanded", "false");

    }

  });

});