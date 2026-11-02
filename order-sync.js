/* order-sync.js
   Menyimpan pesanan dari form di index.html ke penyimpanan yang dibaca dashboard.html.
   Dimuat SETELAH script.js. Tidak mengubah tampilan atau logika script.js. */
(function () {
  var ORDERS_KEY = 'cts_orders_v1';
  var mem = [];

  function loadOrders() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
    catch (e) { return mem; }
  }
  function saveOrders(list) {
    mem = list;
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function simpanPesanan(via) {
    var data = {
      id: 'ORD-' + Date.now().toString(36).toUpperCase(),
      dibuat: new Date().toISOString(),
      nama: val('nama'),
      hp: val('hp'),
      perangkat: val('perangkat'),
      tanggal: val('tanggal'),
      alamat: val('alamat'),
      keluhan: val('keluhan'),
      via: via,
      status: 'Baru',
      biaya: 0,
      catatan: ''
    };
    // Wajib diisi: nama, HP, alamat, keluhan
    if (!data.nama || !data.hp || !data.alamat || !data.keluhan) return null;

    var list = loadOrders();
    list.unshift(data);
    saveOrders(list);
    return data;
  }

  function tampilkanSukses(data) {
    // Hanya tampil jika script.js tidak menampilkan pesan sendiri
    setTimeout(function () {
      var box = document.getElementById('sukses');
      var err = document.getElementById('galat');
      if (box && box.hidden) {
        box.textContent = 'Pesanan ' + data.id + ' sudah kami terima. Kami hubungi Anda untuk konfirmasi jadwal.';
        box.hidden = false;
        if (err) err.textContent = '';
      }
    }, 80);
  }

  function pasang(id, via, tampilPesan) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var data = simpanPesanan(via);
      if (data && tampilPesan) tampilkanSukses(data);
    });
  }

  pasang('kirim', 'Form website', true);
  pasang('kirimWA', 'WhatsApp', false);
})();