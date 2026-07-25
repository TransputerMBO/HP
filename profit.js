(function() {
  let items = [];

  const filterPeriode = document.getElementById('filterPeriode');
  const customRange = document.getElementById('customRange');
  const tglAwal = document.getElementById('tglAwal');
  const tglAkhir = document.getElementById('tglAkhir');
  const terapkanFilter = document.getElementById('terapkanFilter');
  const totalPenjualanEl = document.getElementById('totalPenjualan');
  const totalProfitEl = document.getElementById('totalProfit');
  const jumlahUnitEl = document.getElementById('jumlahUnit');
  const tbodyDetail = document.querySelector('#tableDetail tbody');

  function formatRupiah(num) { return 'Rp ' + Number(num).toLocaleString('id-ID'); }

  async function loadItems() {
    const { data, error } = await supabase.from('stock_items').select('*').order('tanggal_masuk', { ascending: false });
    if (error) { console.error(error); return; }
    items = data;
    updateLaporan();
  }

  function updateLaporan() {
    const periode = filterPeriode.value;
    const now = new Date();
    let startDate, endDate;

    if (periode === 'hari') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (periode === 'bulan') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (periode === 'tahun') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
    } else if (periode === 'custom') {
      startDate = tglAwal.value ? new Date(tglAwal.value) : null;
      endDate = tglAkhir.value ? new Date(tglAkhir.value) : null;
      if (startDate && endDate) endDate.setDate(endDate.getDate() + 1);
    }

    const terjual = items.filter(item => {
      if (item.status !== 'Sold' || !item.tanggal_keluar) return false;
      const tgl = new Date(item.tanggal_keluar);
      if (periode === 'custom') {
        if (!startDate || !endDate) return false;
        return tgl >= startDate && tgl < endDate;
      } else {
        return tgl >= startDate && tgl < endDate;
      }
    });

    let totalPenjualan = 0, totalProfit = 0;
    terjual.forEach(item => {
      const harga = item.actual_harga_jual || item.harga_jual;
      totalPenjualan += harga;
      totalProfit += harga - item.harga_modal;
    });

    totalPenjualanEl.textContent = formatRupiah(totalPenjualan);
    totalProfitEl.textContent = formatRupiah(totalProfit);
    jumlahUnitEl.textContent = terjual.length;

    tbodyDetail.innerHTML = '';
    if (!terjual.length) {
      tbodyDetail.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:28px;">Tidak ada data.</td></tr>';
      return;
    }

    terjual.sort((a,b) => (b.tanggal_keluar||'').localeCompare(a.tanggal_keluar||''));
    terjual.forEach(item => {
      const profit = (item.actual_harga_jual || item.harga_jual) - item.harga_modal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.brand}</td><td>${item.model}</td><td style="font-family:monospace;">${item.imei}</td>
        <td>${formatRupiah(item.actual_harga_jual || item.harga_jual)}</td>
        <td class="${profit >=0 ? 'profit-positif' : ''}">${formatRupiah(profit)}</td>
        <td>${item.tanggal_keluar || '-'}</td><td>${item.terjual_oleh || '-'}</td>
      `;
      tbodyDetail.appendChild(tr);
    });
  }

  filterPeriode.addEventListener('change', () => {
    customRange.style.display = filterPeriode.value === 'custom' ? 'flex' : 'none';
    if (filterPeriode.value !== 'custom') updateLaporan();
  });

  terapkanFilter.addEventListener('click', () => {
    if (filterPeriode.value === 'custom' && (!tglAwal.value || !tglAkhir.value)) {
      alert('Isi kedua tanggal.'); return;
    }
    updateLaporan();
  });

  loadItems();
})();