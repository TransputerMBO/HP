(function() {
  let items = [];
  let selectedItem = null;

  const selectBarang = document.getElementById('selectBarang');
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
    try {
      items = await fetchItems();
      renderSelectBarang();
      renderRiwayat();
    } catch (err) { showToast('Error: ' + err.message); }
  }

  function renderSelectBarang() {
    const inStock = items.filter(item => item.status === 'In Stock');
    selectBarang.innerHTML = '<option value="">-- Pilih barang --</option>';
    inStock.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.brand} ${item.model} - IMEI: ${item.imei}`;
      selectBarang.appendChild(opt);
    });
    selectBarang.value = '';
    clearDetail();
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
    const id = Number(selectBarang.value);
    if (!id) { clearDetail(); return; }
    selectedItem = items.find(i => i.id === id && i.status === 'In Stock');
    if (!selectedItem) { clearDetail(); return; }
    detailBarang.style.display = 'block';
    dBrand.textContent = selectedItem.brand;
    dModel.textContent = selectedItem.model;
    dWarna.textContent = selectedItem.warna;
    dImei.textContent = selectedItem.imei;
    dSpek.textContent = `${selectedItem.ram}GB / ${selectedItem.storage}GB`;
    dModal.textContent = formatRupiah(selectedItem.hargaModal);
    dJual.textContent = formatRupiah(selectedItem.hargaJual);
    hitungProfit();
  }

  function hitungProfit() {
    if (!selectedItem) return;
    const finalPrice = hargaJualFinal.value.trim() === '' ? selectedItem.hargaJual : parseInt(hargaJualFinal.value);
    const profit = finalPrice - selectedItem.hargaModal;
    dProfit.textContent = formatRupiah(profit);
    dProfit.style.color = profit >= 0 ? '#059669' : '#b91c1c';
  }

  async function prosesPenjualan() {
    if (!selectedItem) { alert('Pilih barang!'); return; }
    const tgl = tglKeluar.value;
    if (!tgl) { alert('Tanggal keluar harus diisi.'); return; }
    const finalPrice = hargaJualFinal.value.trim() === '' ? selectedItem.hargaJual : parseInt(hargaJualFinal.value);
    if (isNaN(finalPrice) || finalPrice <= 0) { alert('Harga jual tidak valid.'); return; }

    const updatedItem = {
      ...selectedItem,
      status: 'Sold',
      tanggalKeluar: tgl,
      actualHargaJual: finalPrice,
      terjualOleh: terjualOleh.value.trim() || '-'
    };

    try {
      await updateItem(selectedItem.id, updatedItem);
      showToast('Penjualan berhasil 💰');
      loadItems();
      clearDetail();
    } catch (err) { showToast('Error: ' + err.message); }
  }

  function renderRiwayat() {
    const terjual = items.filter(item => item.status === 'Sold').sort((a,b) => (b.tanggalKeluar||'').localeCompare(a.tanggalKeluar||''));
    tbodyRiwayat.innerHTML = '';
    if (!terjual.length) {
      tbodyRiwayat.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:28px;">Belum ada penjualan.</td></tr>';
      return;
    }
    terjual.forEach(item => {
      const profit = (item.actualHargaJual || item.hargaJual) - item.hargaModal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.brand}</td><td>${item.model}</td><td style="font-family:monospace;">${item.imei}</td>
        <td>${formatRupiah(item.actualHargaJual || item.hargaJual)}</td>
        <td class="${profit >=0 ? 'profit-positif' : ''}">${formatRupiah(profit)}</td>
        <td>${item.tanggalKeluar || '-'}</td><td>${item.terjualOleh || '-'}</td>
      `;
      tbodyRiwayat.appendChild(tr);
    });
  }

  selectBarang.addEventListener('change', updateDetail);
  hargaJualFinal.addEventListener('input', hitungProfit);
  prosesJual.addEventListener('click', prosesPenjualan);
  resetForm.addEventListener('click', () => { selectBarang.value = ''; clearDetail(); tglKeluar.value = new Date().toISOString().split('T')[0]; });

  tglKeluar.value = new Date().toISOString().split('T')[0];
  loadItems();
})();