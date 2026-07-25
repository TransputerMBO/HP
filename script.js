* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
}
body {
  background: #f0f4f8;
  padding: 20px;
  color: #1a2b3c;
}
.container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 35px rgba(0,0,0,0.05);
  padding: 28px 24px;
}
.nav {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  background: #f8fafc;
  padding: 12px 20px;
  border-radius: 18px;
  align-items: center;
  flex-wrap: wrap;
}
.nav a {
  text-decoration: none;
  font-weight: 600;
  color: #1e293b;
  padding: 8px 20px;
  border-radius: 30px;
  background: transparent;
  transition: 0.2s;
}
.nav a.active {
  background: #0f172a;
  color: white;
}
h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.sub {
  color: #475569;
  margin-bottom: 30px;
  font-size: 0.95rem;
}
.card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
}
.card h2 {
  font-size: 1.3rem;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #334155;
}
.form-group input, .form-group select {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.9rem;
  background: white;
  transition: 0.2s;
}
.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
}
.btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.9rem;
}
.btn:hover {
  background: #1e293b;
}
.btn-green {
  background: #059669;
}
.btn-green:hover {
  background: #047857;
}
.btn-outline {
  background: white;
  border: 1px solid #cbd5e1;
  color: #0f172a;
}
.btn-outline:hover {
  background: #f1f5f9;
}
.btn-sm {
  padding: 6px 14px;
  font-size: 0.8rem;
  border-radius: 10px;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}
.filter-bar input, .filter-bar select {
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
}
.table-wrapper {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}
table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
  font-size: 0.85rem;
}
th {
  background: #f1f5f9;
  font-weight: 700;
  padding: 14px 12px;
  text-align: left;
  color: #0f172a;
}
td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}
.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  display: inline-block;
}
.badge-stock {
  background: #d1fae5;
  color: #065f46;
}
.badge-sold {
  background: #fee2e2;
  color: #991b1b;
}
.profit-positif {
  color: #059669;
  font-weight: 700;
}
.modal {
  display: none;
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal.active {
  display: flex;
}
.modal-content {
  background: white;
  padding: 28px;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
}
.flex-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #0f172a;
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 600;
  opacity: 0;
  transition: 0.3s;
  z-index: 2000;
}
.toast.show {
  opacity: 1;
}
@media (max-width: 600px) {
  .container { padding: 16px; }
  .form-grid { grid-template-columns: 1fr; }
}
/* Style untuk baris grup model */
.group-header {
  background: #f8fafc;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
  border-bottom: 2px solid #e2e8f0;
}
.group-header:hover {
  background: #eef2ff;
}

/* Badge untuk nama model */
.group-header a.model-link {
  display: inline-block;
  background: #eef2ff;
  color: #4338ca !important;
  text-decoration: none !important;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid #c7d2fe;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}
.group-header a.model-link:hover {
  background: #4338ca;
  color: #ffffff !important;
  border-color: #4338ca;
}

/* Info varian: badge jumlah + panah */
.variant-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 0.85rem;
}
.variant-badge {
  background: #e2e8f0;
  color: #475569;
  padding: 3px 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8rem;
}
.arrow-icon {
  transition: transform 0.3s ease;
  font-size: 0.7rem;
  color: #94a3b8;
}
.group-header.open .arrow-icon {
  transform: rotate(90deg);
}

/* Baris detail varian */
.detail-row {
  transition: all 0.3s ease;
}
.detail-row td {
  padding: 10px 12px;
  color: #334155;
  font-size: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}
.detail-row:nth-child(even) td {
  background: #fcfcfd;
}
.detail-row:nth-child(odd) td {
  background: #ffffff;
}
.detail-row:hover td {
  background: #f0f4ff;
}
