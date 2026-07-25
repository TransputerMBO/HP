(function() {
  const SUPABASE_URL = 'https://ydmvywtdnhuwwxassajb.supabase.co';   // GANTI
  const SUPABASE_ANON_KEY = 'sb_publishable_64_nQNMzcnEJ_yF_w72R3g_pGkOYml-';                 // GANTI
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const { data, error } = await supabase.from('stock_items').select('*').order('tanggal_masuk', { ascending: false });
    if (error) { showToast('Error: ' + error.message); return; }
    items = data;
    renderTable();
    updateDatalists();
  }

  function getUniqueValues(key) { return [...new Set(items.map(i => i[key]).filter(v => v))].sort((a,b) => a.localeCompare(b)); }

  function updateDatalists() {
    const fill = (dl, arr) => { dl.innerHTML = ''; arr.forEach(v => { const o = document.createElement('option'); o.value = v; dl.appendChild(o); }); };
    fill(brandList, getUniqueValues('brand'));
    fill(modelList, getUniqueValues('model'));
    fill(warnaList, [...new Set([...getUniqueValues('warna'), 'Black','White','Blue','Silver','Gold','Green','Pink','Red','Grey'])].sort());
  }

  function excelDateToISO(serial) {
    if (typeof serial === 'number') {
      const utcDate = new Date((serial - 25569) * 86400 * 1000);
      return `${utcDate.getFullYear()}-${String(utcDate.getMonth()+1).padStart(2,'0')}-${String(utcDate.getDate()).padStart(2,'0')}`;
    } else if (typeof serial === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(serial)) return serial;
      const parsed = new Date(serial);
      if (!isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
      }
    }
    throw new Error('Format tanggal tidak dikenali: ' + serial);
  }

  // *** RENDER TABLE DENGAN PENGELOMPOKAN MODEL ***
  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const brandFilterText = filterBrand.value.trim().toLowerCase();
    const statusFilter = filterStatus.value;

    let filtered = items.filter(item => {
      if (brandFilterText && !item.brand.toLowerCase().includes(brandFilterText)) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (searchTerm && !(item.imei + ' ' + item.model + ' ' + item.brand).toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    const grouped = {};
    filtered.forEach(item => {
      if (!grouped[item.model]) grouped[item.model] = [];
      grouped[item.model].push(item);
    });

    tbody.innerHTML = '';
    if (Object.keys(grouped).length === 0) {
      tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:28px;">Belum ada data.</td></tr>';
      return;
    }

    for (const [model, itemsGroup] of Object.entries(grouped)) {
      const inStockCount = itemsGroup.filter(i => i.status === 'In Stock').length;

      const mainRow = document.createElement('tr');
      mainRow.className = 'group-header';
      mainRow.innerHTML = `
        <td>${itemsGroup[0].brand}</td>
        <td><a href="#" class="model-link" data-model="${model}">${model}</a></td>
        <td colspan="11">
          <span class="variant-info">
            🟢 ${inStockCount} Tersedia
            <span class="arrow-icon">▶</span>
          </span>
        </td>
      `;
      mainRow.style.cursor = 'pointer';
      tbody.appendChild(mainRow);

      itemsGroup.forEach(item => {
        const detailRow = document.createElement('tr');
        detailRow.className = 'detail-row';
        detailRow.style.display = 'none';
        detailRow.innerHTML = `
          <td></td>
          <td></td>
          <td>${item.warna}</td>
          <td>${item.toko}</td>
          <td style="font-family:monospace; font-size:0.8rem;">${item.imei}</td>
          <td>${item.ram}GB / ${item.storage}GB</td>
          <td>${formatRupiah(item.harga_modal)}</td>
          <td>${formatRupiah(item.harga_jual)}</td>
          <td class="${(item.harga_jual - item.harga_modal) >= 0 ? 'profit-positif' : ''}">${formatRupiah(item.harga_jual - item.harga_modal)}</td>
          <td>${item.tanggal_masuk}</td>
          <td><span class="badge ${item.status==='In Stock' ? 'badge-stock' : 'badge-sold'}">${item.status}</span></td>
          <td>${item.tanggal_keluar || '-'}</td>
          <td>
            <button class="btn btn-outline btn-sm edit-btn" data-id="${item.id}">✏️</button>
            <button class="btn btn-outline btn-sm delete-btn" data-id="${item.id}" style="margin-left:4px;color:#b91c1c;">🗑️</button>
          </td>
        `;
        tbody.appendChild(detailRow);
      });

      mainRow.addEventListener('click', function() {
        this.classList.toggle('open');
        let nextRow = this.nextElementSibling;
        while (nextRow && nextRow.classList.contains('detail-row')) {
          nextRow.style.display = nextRow.style.display === 'none' ? '' : 'none';
          nextRow = nextRow.nextElementSibling;
        }
      });
    }

    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openEditModal(Number(e.currentTarget.dataset.id)); }));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', async e => { e.stopPropagation(); const id = Number(e.currentTarget.dataset.id); if (confirm('Hapus?')) { const { error } = await supabase.from('stock_items').delete().eq('id', id); if (error) showToast('Error: ' + error.message); else { showToast('Dihapus'); loadItems(); } } }));
  }

  async function addItem() {
    const brand = brandInput.value.trim(), model = modelInput.value.trim(), warna = warnaInput.value.trim(), toko = tokoInput.value.trim(), imei = imeiInput.value.trim();
    const ram = parseInt(ramInput.value), storage = parseInt(storageInput.value), hargaModal = parseInt(hargaModalInput.value), hargaJual = parseInt(hargaJualInput.value);
    const tanggalMasuk = tanggalMasukInput.value;
    if (!brand || !model || !warna || !toko || !imei || isNaN(ram) || isNaN(storage) || isNaN(hargaModal) || isNaN(hargaJual) || !tanggalMasuk) { alert('Lengkapi semua field.'); return; }

    const newItem = { id: Date.now(), brand, model, warna, toko, imei, ram, storage, harga_modal: hargaModal, harga_jual: hargaJual, tanggal_masuk: tanggalMasuk, status: 'In Stock', tanggal_keluar: null, actual_harga_jual: null, terjual_oleh: null };
    const { error } = await supabase.from('stock_items').insert([newItem]);
    if (error) { showToast('Gagal: ' + error.message); return; }
    showToast('Barang masuk ditambahkan ✅');
    brandInput.value = ''; modelInput.value = ''; warnaInput.value = ''; tokoInput.value = ''; imeiInput.value = ''; ramInput.value = ''; storageInput.value = ''; hargaModalInput.value = ''; hargaJualInput.value = '';
    loadItems();
  }

  function openEditModal(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    currentEditId = id;
    editBrand.value = item.brand; editModel.value = item.model; editWarna.value = item.warna; editToko.value = item.toko; editImei.value = item.imei; editRam.value = item.ram; editStorage.value = item.storage; editModal.value = item.harga_modal; editJual.value = item.status === 'Sold' && item.actual_harga_jual ? item.actual_harga_jual : item.harga_jual; editTglMasuk.value = item.tanggal_masuk;
    modalEdit.classList.add('active');
  }

  simpanEdit.addEventListener('click', async () => {
    if (!currentEditId) return;
    const item = items.find(i => i.id === currentEditId);
    if (!item) return;
    const updatedItem = { brand: editBrand.value, model: editModel.value, warna: editWarna.value, toko: editToko.value, imei: editImei.value, ram: parseInt(editRam.value), storage: parseInt(editStorage.value), harga_modal: parseInt(editModal.value), tanggal_masuk: editTglMasuk.value, status: item.status, tanggal_keluar: item.tanggal_keluar, actual_harga_jual: item.actual_harga_jual, terjual_oleh: item.terjual_oleh, harga_jual: item.status === 'Sold' ? item.harga_jual : parseInt(editJual.value) };
    const { error } = await supabase.from('stock_items').update(updatedItem).eq('id', currentEditId);
    if (error) { showToast('Error: ' + error.message); return; }
    showToast('Perubahan disimpan');
    modalEdit.classList.remove('active'); currentEditId = null;
    loadItems();
  });

  batalEdit.addEventListener('click', () => { modalEdit.classList.remove('active'); currentEditId = null; });

  searchInput.addEventListener('input', renderTable);
  filterBrand.addEventListener('input', renderTable);
  filterStatus.addEventListener('change', renderTable);
  resetFilter.addEventListener('click', () => { searchInput.value = ''; filterBrand.value = ''; filterStatus.value = ''; renderTable(); });
  btnTambah.addEventListener('click', addItem);
  window.addEventListener('click', e => { if (e.target === modalEdit) modalEdit.classList.remove('active'); });

  const fileInput = document.getElementById('fileExcel');
  const btnUpload = document.getElementById('btnUpload');
  btnUpload.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) { alert('Pilih file Excel dulu!'); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rows.length < 2) { alert('File kosong'); return; }
        const headers = rows[0].map(h => String(h).toLowerCase().trim());
        const required = ['brand','model','warna','toko','imei','ram','storage','harga_modal','harga_jual','tanggal_masuk'];
        const missing = required.filter(f => !headers.includes(f));
        if (missing.length) { alert('Kolom kurang: ' + missing.join(', ')); return; }

        const itemsToInsert = []; let skipped = 0;
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.every(cell => cell === undefined || cell === null || String(cell).trim() === '')) continue;
          const obj = {};
          headers.forEach((h, idx) => obj[h] = row[idx] !== undefined ? row[idx] : '');
          if (!obj.imei || !obj.brand || !obj.model) { skipped++; continue; }
          try {
            itemsToInsert.push({ id: Date.now() + i, brand: String(obj.brand).trim(), model: String(obj.model).trim(), warna: String(obj.warna || '').trim(), toko: String(obj.toko || '').trim(), imei: String(obj.imei).trim(), ram: parseInt(obj.ram) || 0, storage: parseInt(obj.storage) || 0, harga_modal: parseInt(obj.harga_modal) || 0, harga_jual: parseInt(obj.harga_jual) || 0, tanggal_masuk: excelDateToISO(obj.tanggal_masuk), status: 'In Stock', tanggal_keluar: null, actual_harga_jual: null, terjual_oleh: null });
          } catch (err) { skipped++; }
        }
        if (!itemsToInsert.length) { alert('Tidak ada data valid. Dilewati: ' + skipped); return; }
        const { error } = await supabase.from('stock_items').insert(itemsToInsert);
        if (error) alert('Gagal: ' + error.message);
        else { alert('Berhasil: ' + itemsToInsert.length + ' barang.' + (skipped ? ' Dilewati: ' + skipped : '')); fileInput.value = ''; loadItems(); }
      } catch (err) { alert('Error: ' + err.message); }
    };
    reader.readAsArrayBuffer(file);
  });

  tanggalMasukInput.value = new Date().toISOString().split('T')[0];
  loadItems();
})();
