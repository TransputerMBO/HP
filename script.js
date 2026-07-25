(function() {
  let items = [];
  let currentEditId = null;

  const brandInput = document.getElementById('brandInput');
  const modelInput = document.getElementById('modelInput');
  const warnaInput = document.getElementById('warnaInput');
  const tokoInput = document.getElementById('toko');
  const imeiInput = document.getElementById('imei');
  const ramInput = document.getElementById('ram');
  const storageInput = document.getElementById('storage');
  const hargaModalInput = document.getElementById('hargaModal');
  const hargaJualInput = document.getElementById('hargaJual');
  const tanggalMasukInput = document.getElementById('tanggalMasuk');
  const btnTambah = document.getElementById('btnTambah');
  const tbody = document.querySelector('#stockTable tbody');
  const searchInput = document.getElementById('searchInput');
  const filterBrand = document.getElementById('filterBrand');
  const filterStatus = document.getElementById('filterStatus');
  const resetFilter = document.getElementById('resetFilter');

  const modalEdit = document.getElementById('modalEdit');
  const editBrand = document.getElementById('editBrand');
  const editModel = document.getElementById('editModel');
  const editWarna = document.getElementById('editWarna');
  const editToko = document.getElementById('editToko');
  const editImei = document.getElementById('editImei');
  const editRam = document.getElementById('editRam');
  const editStorage = document.getElementById('editStorage');
  const editModal = document.getElementById('editModal');
  const editJual = document.getElementById('editJual');
  const editTglMasuk = document.getElementById('editTglMasuk');
  const simpanEdit = document.getElementById('simpanEdit');
  const batalEdit = document.getElementById('batalEdit');
  const toast = document.getElementById('toast');

  const brandList = document.getElementById('brandList');
  const modelList = document.getElementById('modelList');
  const warnaList = document.getElementById('warnaList');

  function formatRupiah(num) { return 'Rp ' + Number(num).toLocaleString('id-ID'); }
  function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }

  async function loadItems() {
    try {
      items = await fetchItems();
      renderTable();
      updateDatalists();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  }

  function getUniqueValues(key) { return [...new Set(items.map(i => i[key]).filter(v => v))].sort((a,b) => a.localeCompare(b)); }

  function updateDatalists() {
    const fill = (dl, arr) => { dl.innerHTML = ''; arr.forEach(v => { const o = document.createElement('option'); o.value = v; dl.appendChild(o); }); };
    fill(brandList, getUniqueValues('brand'));
    fill(modelList, getUniqueValues('model'));
    fill(warnaList, [...new Set([...getUniqueValues('warna'), 'Black','White','Blue','Silver','Gold','Green','Pink','Red','Grey'])].sort());
  }

  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const brandFilterText = filterBrand.value.trim().toLowerCase();
    const statusFilter = filterStatus.value;
    const filtered = items.filter(item => {
      if (brandFilterText && !item.brand.toLowerCase().includes(brandFilterText)) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (searchTerm && !(item.imei + ' ' + item.model + ' ' + item.brand).toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    tbody.innerHTML = '';
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:28px;">Belum ada data.</td></tr>';
      return;
    }

    filtered.forEach(item => {
      const profitValue = item.status === 'Sold' && item.actualHargaJual ? (item.actualHargaJual - item.hargaModal) : (item.hargaJual - item.hargaModal);
      const profitClass = profitValue >= 0 ? 'profit-positif' : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.brand}</td><td>${item.model}</td><td>${item.warna}</td><td>${item.toko}</td>
        <td style="font-family:monospace;">${item.imei}</td><td>${item.ram}GB / ${item.storage}GB</td>
        <td>${formatRupiah(item.hargaModal)}</td><td>${formatRupiah(item.status==='Sold' && item.actualHargaJual ? item.actualHargaJual : item.hargaJual)}</td>
        <td class="${profitClass}">${formatRupiah(profitValue)}</td><td>${item.tanggalMasuk}</td>
        <td><span class="badge ${item.status==='In Stock' ? 'badge-stock' : 'badge-sold'}">${item.status}</span></td><td>${item.tanggalKeluar || '-'}</td>
        <td>
          <button class="btn btn-outline btn-sm edit-btn" data-id="${item.id}">✏️</button>
          <button class="btn btn-outline btn-sm delete-btn" data-id="${item.id}" style="margin-left:4px;color:#b91c1c;">🗑️</button>
        </td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => openEditModal(Number(e.currentTarget.dataset.id))));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', async e => {
      const id = Number(e.currentTarget.dataset.id);
      if (confirm('Hapus barang ini?')) {
        try {
          await deleteItem(id);
          showToast('Barang dihapus');
          loadItems();
        } catch (err) { showToast('Error: ' + err.message); }
      }
    }));
  }

  async function addItem() {
    const brand = brandInput.value.trim(), model = modelInput.value.trim(), warna = warnaInput.value.trim(), toko = tokoInput.value.trim(), imei = imeiInput.value.trim();
    const ram = parseInt(ramInput.value), storage = parseInt(storageInput.value), hargaModal = parseInt(hargaModalInput.value), hargaJual = parseInt(hargaJualInput.value);
    const tanggalMasuk = tanggalMasukInput.value;
    if (!brand || !model || !warna || !toko || !imei || isNaN(ram) || isNaN(storage) || isNaN(hargaModal) || isNaN(hargaJual) || !tanggalMasuk) { alert('Lengkapi semua field.'); return; }
    if (items.some(i => i.imei === imei)) { alert('IMEI sudah terdaftar!'); return; }

    const newItem = {
      id: Date.now(),
      brand, model, warna, toko, imei, ram, storage,
      hargaModal, hargaJual, tanggalMasuk,
      status: 'In Stock', tanggalKeluar: null, actualHargaJual: null, terjualOleh: null
    };

    try {
      await createItem(newItem);
      showToast('Barang masuk ditambahkan ✅');
      brandInput.value = ''; modelInput.value = ''; warnaInput.value = ''; tokoInput.value = '';
      imeiInput.value = ''; ramInput.value = ''; storageInput.value = '';
      hargaModalInput.value = ''; hargaJualInput.value = '';
      loadItems();
    } catch (err) { showToast('Gagal: ' + err.message); }
  }

  function openEditModal(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    currentEditId = id;
    editBrand.value = item.brand; editModel.value = item.model; editWarna.value = item.warna;
    editToko.value = item.toko; editImei.value = item.imei; editRam.value = item.ram;
    editStorage.value = item.storage; editModal.value = item.hargaModal;
    editJual.value = item.status === 'Sold' && item.actualHargaJual ? item.actualHargaJual : item.hargaJual;
    editTglMasuk.value = item.tanggalMasuk;
    modalEdit.classList.add('active');
  }

  simpanEdit.addEventListener('click', async () => {
    if (!currentEditId) return;
    const item = items.find(i => i.id === currentEditId);
    if (!item) return;
    const updatedItem = {
      brand: editBrand.value, model: editModel.value, warna: editWarna.value, toko: editToko.value,
      imei: editImei.value, ram: parseInt(editRam.value), storage: parseInt(editStorage.value),
      hargaModal: parseInt(editModal.value), tanggalMasuk: editTglMasuk.value,
      status: item.status, tanggalKeluar: item.tanggalKeluar, actualHargaJual: item.actualHargaJual,
      terjualOleh: item.terjualOleh,
      hargaJual: item.status === 'Sold' ? item.hargaJual : parseInt(editJual.value)
    };
    try {
      await updateItem(currentEditId, updatedItem);
      showToast('Perubahan disimpan');
      modalEdit.classList.remove('active');
      currentEditId = null;
      loadItems();
    } catch (err) { showToast('Error: ' + err.message); }
  });

  batalEdit.addEventListener('click', () => { modalEdit.classList.remove('active'); currentEditId = null; });

  searchInput.addEventListener('input', renderTable);
  filterBrand.addEventListener('input', renderTable);
  filterStatus.addEventListener('change', renderTable);
  resetFilter.addEventListener('click', () => { searchInput.value = ''; filterBrand.value = ''; filterStatus.value = ''; renderTable(); });
  btnTambah.addEventListener('click', addItem);
  window.addEventListener('click', e => { if (e.target === modalEdit) modalEdit.classList.remove('active'); });

  tanggalMasukInput.value = new Date().toISOString().split('T')[0];
  loadItems();
})();