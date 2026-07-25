(function() {
  const SUPABASE_URL = 'https://ydmvywtdnhuwwxassajb.supabase.co';   // GANTI
  const SUPABASE_ANON_KEY = 'sb_publishable_64_nQNMzcnEJ_yF_w72R3g_pGkOYml-';                 // GANTI
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let items = [];
  let selectedItem = null;

  // --- DOM Elements ---
  const searchBarang = document.getElementById('searchBarang');
  const barangList = document.getElementById('barangList');
  const tglKeluar = document.getElementById('tglKeluar');
  const hargaJualFinal = document.getElementById('hargaJualFinal');
  const terjualOleh = document.getElementById('terjualOleh');
  const detailBarang = document.getElementById('detailBarang');
  const dBrand = document.getElementById('dBrand');
  const dModel = document.getElementById('dModel');
  const dWarna = document.getElementById('dWarna');
  const dImei = document.getElementById('dImei');
  const dSpek = document.getElementById('dSpek');
  const dModal = document.getElementById('dModal');
  const dJual = document.getElementById('dJual');
  const dProfit = document.getElementById('dProfit');
  const prosesJual = document.getElementById('prosesJual');
  const resetForm = document.getElementById('resetForm');
  const tbodyRiwayat = document.querySelector('#tableRiwayat tbody');
  const toast = document.getElementById('toast');

  function formatRupiah(num) { return 'Rp ' + Number(num).toLocaleString('id-ID'); }
  function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }

  async function loadItems() {
    const { data, error } = await supabase.from('stock_items').select('*').order('tanggal_masuk', { ascending: false });
    if (error) { showToast('Error: ' + error.message); return; }
    items = data;
    renderDatalist();
    renderRiwayat();
  }

  function renderDatalist() {
    const inStock = items.filter(item => item.status === 'In Stock');
    barangList.innerHTML = '';
    inStock.forEach(item => {
      const option = document.createElement('option');
      option.value = `${item.brand} ${item.model} - ${item.warna} - IMEI: ${item.imei}`;
      option.setAttribute('data-id', item.id);
      barangList.appendChild(option);
    });
  }

  function clearDetail() {
    selectedItem = null;
    detailBarang.style.display = 'none';
    dBrand.textContent = '-'; dModel.textContent = '-'; dWarna.textContent = '-';
    dImei.textContent = '-'; dSpek.textContent = '-'; dModal.textContent = '-';
    dJual.textContent = '-'; dProfit.textContent = '-';
    hargaJualFinal.value = '';
    terjualOleh.value = '';
  }

  function updateDetail() {
    if (!selectedItem) { clearDetail(); return; }
    detailBarang.style.display = 'block';
    dBrand.textContent = selectedItem.brand;
    dModel.textContent = selectedItem.model;
    dWarna.textContent = selectedItem.warna;
    dImei.textContent = selectedItem.imei;
    dSpek.textContent = `${selectedItem.ram}GB / ${selectedItem.storage}GB`;
    dModal.textContent = formatRupiah(selectedItem.harga_modal);
    dJual.textContent = formatRupiah(selectedItem.harga_jual);
    hitungProfit();
  }

  function hitungProfit() {
    if (!selectedItem) return;
    const finalPrice = hargaJualFinal.value.trim() === '' ? selectedItem.harga_jual : parseInt(hargaJualFinal.value);
    const profit = finalPrice - selectedItem.harga_modal;
    dProfit.textContent = formatRupiah(profit);
    dProfit.style.color = profit >= 0 ? '#059669' : '#b91c1c';
  }

  searchBarang.addEventListener('input', function() {
    const val = this.value.trim();
    if (!val) { clearDetail(); return; }
    const found = items.find(item => 
      item.status === 'In Stock' && 
      `${item.brand} ${item.model} - ${item.warna} - IMEI: ${item.imei}`.toLowerCase().includes(val.toLowerCase())
    );
    if (found) { selectedItem = found; updateDetail(); }
    else { clearDetail(); }
  });

  prosesJual.addEventListener('click', async () => {
    if (!selectedItem) { alert('Pilih barang terlebih dahulu!'); return; }
    const tgl = tglKeluar.value;
    if (!tgl) { alert('Tanggal keluar harus diisi.'); return; }
    const finalPrice = hargaJualFinal.value.trim() === '' ? selectedItem.harga_jual : parseInt(hargaJualFinal.value);
    if (isNaN(finalPrice) || finalPrice <= 0) { alert('Harga jual tidak valid.'); return; }

    const { error } = await supabase.from('stock_items').update({
      status: 'Sold',
      tanggal_keluar: tgl,
      actual_harga_jual: finalPrice,
      terjual_oleh: terjualOleh.value.trim() || '-'
    }).eq('id', selectedItem.id);

    if (error) { showToast('Error: ' + error.message); return; }
    showToast('Penjualan berhasil 💰');
    loadItems();
    clearDetail();
    searchBarang.value = '';
  });

  function renderRiwayat() {
    const terjual = items.filter(item => item.status === 'Sold').sort((a,b) => (b.tanggal_keluar||'').localeCompare(a.tanggal_keluar||''));
    tbodyRiwayat.innerHTML = '';
    if (!terjual.length) {
      tbodyRiwayat.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:28px;">Belum ada penjualan.</td></tr>';
      return;
    }
    terjual.forEach(item => {
      const profit = (item.actual_harga_jual || item.harga_jual) - item.harga_modal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.brand}</td><td>${item.model}</td><td style="font-family:monospace;">${item.imei}</td>
        <td>${formatRupiah(item.actual_harga_jual || item.harga_jual)}</td>
        <td class="${profit >=0 ? 'profit-positif' : ''}">${formatRupiah(profit)}</td>
        <td>${item.tanggal_keluar || '-'}</td><td>${item.terjual_oleh || '-'}</td>
      `;
      tbodyRiwayat.appendChild(tr);
    });
  }

  hargaJualFinal.addEventListener('input', hitungProfit);
  resetForm.addEventListener('click', () => { searchBarang.value = ''; clearDetail(); tglKeluar.value = new Date().toISOString().split('T')[0]; });
  tglKeluar.value = new Date().toISOString().split('T')[0];
  loadItems();
})();
