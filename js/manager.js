/* ═══════════════════════════════════════════════════════════════
   STACJA BENZYNOWA ORZEŁ — Manager Panel JavaScript
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Chart.js Global Defaults ─────────────────────────────────
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.scale = Chart.defaults.scale || {};

  const gridColor = '#1a1a2e';
  const fontColor = '#94a3b8';

  // ── Chart Instance Registry ──────────────────────────────────
  const charts = {};

  // ── Navigation ───────────────────────────────────────────────
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sectionPages = document.querySelectorAll('.section-page');

  function showSection(sectionId) {
    sectionPages.forEach(p => p.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.add('active');

    const navBtn = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (navBtn) navBtn.classList.add('active');

    // Lazy-load section data
    switch (sectionId) {
      case 'dashboard': loadDashboard(); break;
      case 'tanks': loadFuelTanks(); break;
      case 'orders': loadOrders(); break;
      case 'assortment': loadMenu(); break;
      case 'schedule': loadSchedule(); break;
      case 'assistance': loadAssistance(); break;
      case 'reports': loadReports(); break;
      case 'payments': loadPayments(); break;
      case 'emissions': loadEmissions(); break;
      case 'promotions': loadPromotions(); break;
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      showSection(item.dataset.section);
    });
  });

  // ── Logout ───────────────────────────────────────────────────
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
  });

  // ── Toast Notifications ──────────────────────────────────────
  window.showToast = function (message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  };

  // ── Modal Management ─────────────────────────────────────────
  window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  };

  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  };

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  let dashboardLoaded = false;

  function loadDashboard() {
    if (dashboardLoaded) return;
    dashboardLoaded = true;

    fetch('/api/sales')
      .then(r => r.json())
      .then(data => {
        renderSalesChart(data.daily);
        renderCustomerChart(data.daily);
      })
      .catch(() => showToast('Błąd ładowania danych sprzedaży', 'error'));
  }

  function renderSalesChart(data) {
    if (charts.sales) charts.sales.destroy();
    const ctx = document.getElementById('salesChart').getContext('2d');
    charts.sales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Paliwo',
            data: data.fuel,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Sklep',
            data: data.shop,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Cafe',
            data: data.cafe,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('pl-PL')} PLN`,
            },
          },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: fontColor } },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: fontColor,
              callback: v => v.toLocaleString('pl-PL') + ' zł',
            },
          },
        },
      },
    });
  }

  function renderCustomerChart(data) {
    if (charts.customers) charts.customers.destroy();
    const ctx = document.getElementById('customerChart').getContext('2d');
    charts.customers = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Klienci',
          data: data.customers,
          backgroundColor: 'rgba(168, 85, 247, 0.6)',
          borderColor: '#a855f7',
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(168, 85, 247, 0.85)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: fontColor } },
          y: { grid: { color: gridColor }, ticks: { color: fontColor } },
        },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  FUEL TANKS
  // ═══════════════════════════════════════════════════════════════
  function loadFuelTanks() {
    fetch('/api/fuel-tanks')
      .then(r => r.json())
      .then(tanks => renderTanks(tanks))
      .catch(() => showToast('Błąd ładowania zbiorników', 'error'));
  }

  function renderTanks(tanks) {
    const container = document.getElementById('tankVisual');
    container.innerHTML = tanks.map(tank => {
      const pct = Math.round((tank.current / tank.capacity) * 100);
      let levelClass = 'high';
      let badgeClass = 'badge-success';
      let badgeText = `${pct}%`;
      if (pct < 15) {
        levelClass = 'low';
        badgeClass = 'badge-danger';
        badgeText = `⚠️ ${pct}%`;
      } else if (pct < 40) {
        levelClass = 'medium';
        badgeClass = 'badge-warning';
      }

      return `
        <div class="tank">
          <div class="tank-cylinder">
            <div class="tank-fill ${tank.type.toLowerCase()}" style="height: ${pct}%;"></div>
          </div>
          <div class="tank-label">${tank.type}</div>
          <div class="tank-level">${tank.current.toLocaleString('pl-PL')} / ${tank.capacity.toLocaleString('pl-PL')} L</div>
          <span class="badge ${badgeClass}" style="margin-top: 0.5rem;">${badgeText}</span>
          ${tank.nextDelivery ? `<div style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 0.35rem;">🚚 Dostawa: ${tank.nextDelivery}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  // ═══════════════════════════════════════════════════════════════
  //  ORDERS
  // ═══════════════════════════════════════════════════════════════
  function loadOrders() {
    fetch('/api/orders')
      .then(r => r.json())
      .then(orders => renderOrders(orders))
      .catch(() => showToast('Błąd ładowania zamówień', 'error'));
  }

  const statusLabels = {
    pending: 'Oczekujące',
    confirmed: 'Potwierdzone',
    in_transit: 'W transporcie',
    delivered: 'Dostarczone',
  };

  const statusBadges = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    in_transit: 'badge-info',
    delivered: 'badge-success',
  };

  function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td style="font-weight: 600; color: var(--text-primary);">${o.id}</td>
        <td>${o.type}</td>
        <td>${o.quantity}</td>
        <td><span class="badge ${statusBadges[o.status] || 'badge-neutral'}">${statusLabels[o.status] || o.status}</span></td>
        <td>${o.orderedAt}</td>
        <td>${o.eta || '—'}</td>
        <td>${o.supplier}</td>
      </tr>
    `).join('');
  }

  // New order form
  document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const etaRaw = form.eta.value;
    const eta = etaRaw ? etaRaw.replace('T', ' ') : null;
    const body = {
      type: form.type.value,
      quantity: form.quantity.value,
      eta: eta,
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast('Zamówienie zostało złożone pomyślnie!', 'success');
          closeModal('orderModal');
          form.reset();
          loadOrders();
        }
      })
      .catch(() => showToast('Błąd przy składaniu zamówienia', 'error'));
  });

  // ═══════════════════════════════════════════════════════════════
  //  ASSORTMENT (MENU)
  // ═══════════════════════════════════════════════════════════════
  let currentCategory = 'all';

  function loadMenu() {
    fetch('/api/menu')
      .then(r => r.json())
      .then(items => renderMenu(items))
      .catch(() => showToast('Błąd ładowania asortymentu', 'error'));
  }

  const categoryLabels = {
    burgery: 'Burgery',
    hotdogi: 'Hot-Dogi',
    pizza: 'Pizza',
    zapiekanki: 'Zapiekanki',
    napoje: 'Napoje',
  };

  function renderMenu(items) {
    const filtered = currentCategory === 'all'
      ? items
      : items.filter(i => i.category === currentCategory);

    const tbody = document.getElementById('menuTableBody');
    tbody.innerHTML = filtered.map(item => `
      <tr>
        <td style="font-weight: 600; color: var(--text-primary);">${item.name}</td>
        <td>${categoryLabels[item.category] || item.category}</td>
        <td style="font-weight: 700; color: var(--accent-primary);">${item.price.toFixed(2)} PLN</td>
        <td>
          <span class="badge ${item.available ? 'badge-success' : 'badge-danger'}">
            ${item.available ? 'Dostępny' : 'Niedostępny'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm ${item.available ? 'btn-danger' : 'btn-success'}" onclick="toggleMenuAvailability(${item.id})">
            ${item.available ? 'Wyłącz' : 'Włącz'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.toggleMenuAvailability = function (id) {
    fetch(`/api/menu/${id}/toggle`, { method: 'PUT' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast(`Status produktu zmieniony: ${data.item.available ? 'Dostępny' : 'Niedostępny'}`, 'success');
          loadMenu();
        }
      })
      .catch(() => showToast('Błąd zmiany dostępności', 'error'));
  };

  // Menu tabs
  document.getElementById('menuTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    document.querySelectorAll('#menuTabs .tab-btn').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    loadMenu();
  });

  // ═══════════════════════════════════════════════════════════════
  //  SCHEDULE
  // ═══════════════════════════════════════════════════════════════
  function loadSchedule() {
    Promise.all([
      fetch('/api/schedule').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
    ])
      .then(([scheduleData, employees]) => {
        renderSchedule(scheduleData, employees);
        renderEmployeeList(employees);
      })
      .catch(() => showToast('Błąd ładowania grafiku', 'error'));
  }

  const dayNames = {
    0: 'Niedziela', 1: 'Poniedziałek', 2: 'Wtorek',
    3: 'Środa', 4: 'Czwartek', 5: 'Piątek', 6: 'Sobota',
  };

  const shiftLabels = {
    morning: 'Rano',
    afternoon: 'Popołudnie',
    night: 'Noc',
  };

  function renderSchedule(schedule, employees) {
    const container = document.getElementById('scheduleContent');
    const empMap = {};
    employees.forEach(e => empMap[e.id] = e);

    const days = Object.keys(schedule).sort();
    if (days.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>Brak zaplanowanych zmian</p></div>';
      return;
    }

    container.innerHTML = days.map(dateStr => {
      const date = new Date(dateStr);
      const dayName = dayNames[date.getDay()];
      const shifts = schedule[dateStr];

      return `
        <div class="schedule-day">
          <h4>📅 ${dayName}, ${dateStr}</h4>
          ${shifts.map(s => {
            const emp = empMap[s.employeeId];
            return `
              <div class="shift-row">
                <span class="shift-badge ${s.shift}">${shiftLabels[s.shift] || s.shift}</span>
                <span style="font-weight: 600; color: var(--text-primary);">${emp ? emp.name : 'Nieznany'}</span>
                <span style="color: var(--text-tertiary); margin-left: auto; font-size: 0.8rem;">${s.hours}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');
  }

  function renderEmployeeList(employees) {
    const container = document.getElementById('employeeList');
    container.innerHTML = employees.map(emp => `
      <div class="shift-row" style="margin-bottom: 0.5rem;">
        <span class="badge ${emp.available ? 'badge-success' : 'badge-danger'}" style="min-width: 70px;">
          ${emp.available ? 'Dostępny' : 'Niedostępny'}
        </span>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${emp.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">${emp.role} • ${emp.phone}</div>
        </div>
      </div>
    `).join('');
  }

  // ═══════════════════════════════════════════════════════════════
  //  ASSISTANCE
  // ═══════════════════════════════════════════════════════════════
  function loadAssistance() {
    fetch('/api/assistance')
      .then(r => r.json())
      .then(requests => renderAssistance(requests))
      .catch(() => showToast('Błąd ładowania zgłoszeń pomocy', 'error'));
  }

  function renderAssistance(requests) {
    const active = requests.filter(r => r.status === 'pending' || r.status === 'accepted');
    const history = requests.filter(r => r.status === 'completed');

    // Update badge
    const badge = document.getElementById('assistanceBadge');
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }

    // Active alerts
    const alertsContainer = document.getElementById('assistanceAlerts');
    if (active.length === 0) {
      alertsContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>Brak aktywnych zgłoszeń</p></div>';
    } else {
      alertsContainer.innerHTML = active.map(req => `
        <div class="alert-card ${req.status}">
          <div class="alert-icon">♿</div>
          <div class="alert-info">
            <div class="alert-title">${req.customerName} — ${req.fuelType || 'Pomoc'}</div>
            <div class="alert-detail">
              Zgłoszono: ${req.createdAt}
              ${req.estimatedArrival ? ` • Przyjazd: ~${req.estimatedArrival}` : ''}
              ${req.assignedTo ? ` • Przydzielono: ${req.assignedTo}` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
            ${req.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="acceptAssistance('${req.id}')">Przyjmij</button>` : ''}
            ${req.status === 'accepted' ? `<button class="btn btn-sm btn-success" onclick="completeAssistance('${req.id}')">Zakończ</button>` : ''}
          </div>
        </div>
      `).join('');
    }

    // History
    const historyContainer = document.getElementById('assistanceHistory');
    if (history.length === 0) {
      historyContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">📜</div><p>Brak historii zgłoszeń</p></div>';
    } else {
      historyContainer.innerHTML = history.map(req => `
        <div class="alert-card" style="animation: none; opacity: 0.7;">
          <div class="alert-icon">✅</div>
          <div class="alert-info">
            <div class="alert-title">${req.customerName} — ${req.fuelType || 'Pomoc'}</div>
            <div class="alert-detail">
              Zakończono: ${req.completedAt || '—'} • Obsługiwał: ${req.assignedTo || '—'}
            </div>
          </div>
          <span class="badge badge-success">Zakończone</span>
        </div>
      `).join('');
    }
  }

  window.acceptAssistance = function (id) {
    fetch(`/api/assistance/${id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeName: 'Maria Wiśniewska' }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast('Zgłoszenie zostało przyjęte', 'success');
          loadAssistance();
        }
      })
      .catch(() => showToast('Błąd przy przyjmowaniu zgłoszenia', 'error'));
  };

  window.completeAssistance = function (id) {
    fetch(`/api/assistance/${id}/complete`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast('Zgłoszenie zakończone pomyślnie', 'success');
          loadAssistance();
        }
      })
      .catch(() => showToast('Błąd przy kończeniu zgłoszenia', 'error'));
  };

  // ═══════════════════════════════════════════════════════════════
  //  SALES REPORTS
  // ═══════════════════════════════════════════════════════════════
  let reportsLoaded = false;

  function loadReports() {
    if (reportsLoaded) return;
    reportsLoaded = true;

    fetch('/api/sales')
      .then(r => r.json())
      .then(data => {
        renderHourlyChart(data.hourly);
        renderCategoryChart(data.daily);
        updateReportStats(data.daily);
      })
      .catch(() => showToast('Błąd ładowania raportów', 'error'));
  }

  function renderHourlyChart(hourly) {
    if (charts.hourly) charts.hourly.destroy();
    const ctx = document.getElementById('hourlyChart').getContext('2d');
    charts.hourly = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hourly.labels.map(h => h + ':00'),
        datasets: [{
          label: 'Sprzedaż (PLN)',
          data: hourly.values,
          backgroundColor: 'rgba(245, 158, 11, 0.6)',
          borderColor: '#f59e0b',
          borderWidth: 2,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(245, 158, 11, 0.85)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => `Sprzedaż: ${ctx.parsed.y.toLocaleString('pl-PL')} PLN`,
            },
          },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: fontColor } },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: fontColor,
              callback: v => v.toLocaleString('pl-PL') + ' zł',
            },
          },
        },
      },
    });
  }

  function renderCategoryChart(daily) {
    if (charts.category) charts.category.destroy();
    const ctx = document.getElementById('categoryChart').getContext('2d');

    const fuelTotal = daily.fuel.reduce((a, b) => a + b, 0);
    const shopTotal = daily.shop.reduce((a, b) => a + b, 0);
    const cafeTotal = daily.cafe.reduce((a, b) => a + b, 0);

    charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Paliwo', 'Sklep', 'Cafe'],
        datasets: [{
          data: [fuelTotal, shopTotal, cafeTotal],
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
          ],
          borderColor: [
            '#f59e0b',
            '#22c55e',
            '#3b82f6',
          ],
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return `${ctx.label}: ${ctx.parsed.toLocaleString('pl-PL')} PLN (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  function updateReportStats(daily) {
    const fuelTotal = daily.fuel.reduce((a, b) => a + b, 0);
    const shopTotal = daily.shop.reduce((a, b) => a + b, 0);
    const cafeTotal = daily.cafe.reduce((a, b) => a + b, 0);
    const total = fuelTotal + shopTotal + cafeTotal;

    document.getElementById('reportFuelRevenue').textContent = fuelTotal.toLocaleString('pl-PL') + ' PLN';
    document.getElementById('reportShopRevenue').textContent = shopTotal.toLocaleString('pl-PL') + ' PLN';
    document.getElementById('reportCafeRevenue').textContent = cafeTotal.toLocaleString('pl-PL') + ' PLN';
    document.getElementById('reportTotalRevenue').textContent = total.toLocaleString('pl-PL') + ' PLN';
  }

  // Report tabs (visual only — data stays the same)
  const reportTabs = document.getElementById('reportTabs');
  if (reportTabs) {
    reportTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      reportTabs.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      // In a real app, we'd reload data for the chosen period
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  PAYMENT SETTLEMENTS
  // ═══════════════════════════════════════════════════════════════
  let paymentsLoaded = false;

  function loadPayments() {
    if (paymentsLoaded) return;
    paymentsLoaded = true;

    const transactions = [
      { id: 'TX-20260621-014', date: '2026-06-21 13:05', type: 'Paliwo PB95', amount: '189,50 PLN', method: 'Karta Visa', status: 'Zaksięgowane' },
      { id: 'TX-20260621-013', date: '2026-06-21 12:48', type: 'Kawa + Burger', amount: '27,98 PLN', method: 'BLIK', status: 'Zaksięgowane' },
      { id: 'TX-20260621-012', date: '2026-06-21 12:30', type: 'Paliwo ON', amount: '312,40 PLN', method: 'Karta Mastercard', status: 'Zaksięgowane' },
      { id: 'TX-20260621-011', date: '2026-06-21 11:55', type: 'Hot-Dog + Napój', amount: '15,98 PLN', method: 'Gotówka', status: 'Zaksięgowane' },
      { id: 'TX-20260621-010', date: '2026-06-21 11:22', type: 'Paliwo PB98', amount: '353,50 PLN', method: 'Kryptowaluta BTC', status: 'Oczekuje' },
      { id: 'TX-20260621-009', date: '2026-06-21 10:45', type: 'Zapiekanka', amount: '14,99 PLN', method: 'BLIK', status: 'Zaksięgowane' },
      { id: 'TX-20260621-008', date: '2026-06-21 10:10', type: 'Paliwo LPG', amount: '98,20 PLN', method: 'Karta Visa', status: 'Zaksięgowane' },
      { id: 'TX-20260621-007', date: '2026-06-21 09:30', type: 'Kawa Latte', amount: '8,99 PLN', method: 'BLIK', status: 'Zaksięgowane' },
    ];

    const methodBadges = {
      'Karta Visa': 'badge-info',
      'Karta Mastercard': 'badge-info',
      'BLIK': 'badge-warning',
      'Kryptowaluta BTC': 'badge-neutral',
      'Gotówka': 'badge-success',
    };

    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td style="font-weight: 600; color: var(--text-primary);">${t.id}</td>
        <td>${t.date}</td>
        <td>${t.type}</td>
        <td style="font-weight: 700; color: var(--accent-primary);">${t.amount}</td>
        <td><span class="badge ${methodBadges[t.method] || 'badge-neutral'}">${t.method}</span></td>
        <td><span class="badge ${t.status === 'Zaksięgowane' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
      </tr>
    `).join('');
  }

  // ═══════════════════════════════════════════════════════════════
  //  EMISSIONS
  // ═══════════════════════════════════════════════════════════════
  let emissionsLoaded = false;

  function loadEmissions() {
    if (emissionsLoaded) return;
    emissionsLoaded = true;

    fetch('/api/emissions')
      .then(r => r.json())
      .then(data => {
        renderEmissionsChart(data);
        updateEmissionStats(data);
      })
      .catch(() => showToast('Błąd ładowania danych emisji', 'error'));
  }

  function renderEmissionsChart(data) {
    if (charts.emissions) charts.emissions.destroy();
    const ctx = document.getElementById('emissionsChart').getContext('2d');
    charts.emissions = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.monthLabels,
        datasets: [{
          label: 'Emisja CO₂ (tony)',
          data: data.co2Monthly,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#22c55e',
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => `Emisja: ${ctx.parsed.y} ton CO₂`,
            },
          },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: fontColor } },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: fontColor,
              callback: v => v + ' t',
            },
          },
        },
      },
    });
  }

  function updateEmissionStats(data) {
    const latestCO2 = data.co2Monthly[data.co2Monthly.length - 1];
    document.getElementById('emissionCO2').textContent = latestCO2.toFixed(1).replace('.', ',') + ' t';
    document.getElementById('emissionSolar').textContent = data.solarCoverage + '%';
    document.getElementById('emissionWater').textContent = data.waterUsage + ' m³';
    document.getElementById('emissionEnergy').textContent = data.energyUsage.toLocaleString('pl-PL') + ' kWh';
  }

  // ═══════════════════════════════════════════════════════════════
  //  PROMOTIONS
  // ═══════════════════════════════════════════════════════════════
  function loadPromotions() {
    fetch('/api/promotions')
      .then(r => r.json())
      .then(promos => renderPromotions(promos))
      .catch(() => showToast('Błąd ładowania promocji', 'error'));
  }

  function renderPromotions(promos) {
    const container = document.getElementById('promotionsList');
    if (promos.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏷️</div><p>Brak promocji</p></div>';
      return;
    }

    container.innerHTML = promos.map(p => `
      <div class="promo-card ${p.active ? '' : 'inactive'}">
        <div class="promo-icon">🏷️</div>
        <div class="promo-info">
          <div class="promo-title">${p.title}</div>
          <div class="promo-desc">${p.description}</div>
          <div class="promo-dates">📅 ${p.validFrom} — ${p.validTo} • Rabat: ${p.discount}</div>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-shrink: 0; align-items: center;">
          <span class="badge ${p.active ? 'badge-success' : 'badge-danger'}">
            ${p.active ? 'Aktywna' : 'Nieaktywna'}
          </span>
          <button class="btn btn-sm btn-secondary" onclick="togglePromotion(${p.id})">
            ${p.active ? 'Wyłącz' : 'Włącz'}
          </button>
        </div>
      </div>
    `).join('');
  }

  window.togglePromotion = function (id) {
    fetch(`/api/promotions/${id}/toggle`, { method: 'PUT' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast(`Promocja ${data.promotion.active ? 'aktywowana' : 'dezaktywowana'}`, 'success');
          loadPromotions();
        }
      })
      .catch(() => showToast('Błąd zmiany statusu promocji', 'error'));
  };

  // New promotion form
  document.getElementById('promoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const body = {
      title: form.title.value,
      description: form.description.value,
      discount: form.discount.value,
      validFrom: form.validFrom.value,
      validTo: form.validTo.value,
    };

    fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast('Promocja została dodana!', 'success');
          closeModal('promoModal');
          form.reset();
          loadPromotions();
        }
      })
      .catch(() => showToast('Błąd przy dodawaniu promocji', 'error'));
  });

  // ═══════════════════════════════════════════════════════════════
  //  INIT — Load dashboard on start
  // ═══════════════════════════════════════════════════════════════
  showSection('dashboard');
});
