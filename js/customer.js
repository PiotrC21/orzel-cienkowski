/* ═══════════════════════════════════════════════════════════════
   STACJA BENZYNOWA ORZEŁ — Customer Panel JavaScript
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Check auth ────────────────────────────────────────────
  const role = localStorage.getItem('orzel_role');
  if (role !== 'customer') {
    window.location.href = './index.html';
    return;
  }

  let stations = [];
  let menuItems = [];
  let cart = [];
  let favorites = [];
  let currentRating = 0;
  let selectedDispenser = null;
  let selectedFuelType = null;
  let fuelingSession = null;
  let fuelingInterval = null;
  let currentLiters = 0;
  let collectingPackageId = null;

  // ── NAVIGATION ──────────────────────────────────────────
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.section-page');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;

      if (section === 'logout') {
        localStorage.removeItem('orzel_role');
        localStorage.removeItem('orzel_user');
        window.location.href = './index.html';
        return;
      }

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      const target = document.getElementById('section-' + section);
      if (target) target.classList.add('active');
    });
  });

  // ── TOAST NOTIFICATIONS ─────────────────────────────────
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  // ── MODAL HELPERS ─────────────────────────────────────
  window.closeModal = function(id) {
    document.getElementById(id).classList.remove('active');
  };

  function openModal(id) {
    document.getElementById(id).classList.add('active');
  }

  // ── FETCH HELPERS ─────────────────────────────────────
  async function api(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    return res.json();
  }

  // ══════════════════════════════════════════════════════════
  // MAP
  // ══════════════════════════════════════════════════════════
  let map;

  async function initMap() {
    stations = await api('/api/stations');

    map = L.map('stationMap').setView([52.0, 19.5], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    renderMapMarkers(stations);
    populateStationSelects(stations);
  }

  function renderMapMarkers(stationsToShow) {
    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    stationsToShow.forEach(station => {
      const fuelPrices = Object.entries(station.fuels)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => `<b>${k.toUpperCase()}</b>: ${v.toFixed(2)} zł`)
        .join('<br>');

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #000;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(245,158,11,0.4);
          border: 2px solid #fbbf24;
        ">⛽</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([station.lat, station.lng], { icon })
        .bindPopup(`
          <div style="min-width:200px;font-family:Inter,sans-serif;">
            <h3 style="margin:0 0 4px;font-size:14px;">${station.name}</h3>
            <p style="margin:0 0 8px;color:#666;font-size:12px;">${station.address}</p>
            <p style="margin:0 0 4px;font-size:12px;">⭐ ${station.rating} (${station.reviewCount} opinii)</p>
            <hr style="border:none;border-top:1px solid #eee;margin:8px 0;">
            <p style="font-size:12px;line-height:1.8;">${fuelPrices}</p>
            <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">
              ${station.hasCafe ? '<span style="background:#f0fdf4;color:#16a34a;padding:2px 6px;border-radius:4px;font-size:10px;">🍔 Cafe</span>' : ''}
              ${station.hasLPG ? '<span style="background:#f5f3ff;color:#7c3aed;padding:2px 6px;border-radius:4px;font-size:10px;">LPG</span>' : ''}
              ${station.hasEV ? '<span style="background:#eff6ff;color:#2563eb;padding:2px 6px;border-radius:4px;font-size:10px;">⚡ EV</span>' : ''}
              ${station.hasPackages ? '<span style="background:#fef3c7;color:#d97706;padding:2px 6px;border-radius:4px;font-size:10px;">📦 Paczki</span>' : ''}
            </div>
            <button class="btn btn-primary" style="margin-top:12px; width:100%; font-size:12px; padding:6px" onclick="window.goToFueling(${station.id})">⛽ Tankuj na tej stacji</button>
          </div>
        `)
        .addTo(map);
    });
  }

  // Fuel filter
  document.getElementById('fuelFilter').addEventListener('change', (e) => {
    const filter = e.target.value;
    let filtered = stations;
    if (filter !== 'all') {
      filtered = stations.filter(s => s.fuels[filter] !== null && s.fuels[filter] !== undefined);
    }
    renderMapMarkers(filtered);
    document.getElementById('stationCount').textContent = filtered.length;

    if (filter !== 'all' && filtered.length > 0) {
      const avg = filtered.reduce((sum, s) => sum + (s.fuels[filter] || 0), 0) / filtered.length;
      document.getElementById('avgPb95').textContent = avg.toFixed(2) + ' zł';
    }
  });

  // Nearest station button
  document.getElementById('nearestBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          let nearest = stations[0];
          let minDist = Infinity;

          stations.forEach(s => {
            const d = Math.sqrt(Math.pow(s.lat - latitude, 2) + Math.pow(s.lng - longitude, 2));
            if (d < minDist) { minDist = d; nearest = s; }
          });

          map.setView([nearest.lat, nearest.lng], 14);
          showToast(`Najbliższa stacja: ${nearest.name}`, 'success');
        },
        () => {
          // Fallback — show Warsaw
          map.setView([52.2297, 21.0122], 14);
          showToast('Najbliższa stacja: Orzeł Warszawa Centrum', 'info');
        }
      );
    } else {
      map.setView([52.2297, 21.0122], 14);
      showToast('Najbliższa stacja: Orzeł Warszawa Centrum', 'info');
    }
  });

  function populateStationSelects(stationList) {
    const selects = ['fuelingStation', 'assistStation', 'reviewStation'];
    selects.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      select.innerHTML = stationList.map(s =>
        `<option value="${s.id}">${s.name} — ${s.address}</option>`
      ).join('');
    });
  }

  // ══════════════════════════════════════════════════════════
  // FUELING
  // ══════════════════════════════════════════════════════════

  // Dispenser selection
  document.querySelectorAll('.dispenser-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('occupied')) return;
      document.querySelectorAll('.dispenser-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDispenser = btn.dataset.dispenser;
    });
  });

  function randomizeDispensers() {
    const btns = document.querySelectorAll('.dispenser-btn');
    btns.forEach(b => {
      b.classList.remove('occupied', 'selected');
      b.removeAttribute('disabled');
      b.querySelector('span').textContent = 'Wolny';
    });
    selectedDispenser = null;

    const occupiedCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 occupied
    const occupiedIndices = [];
    while (occupiedIndices.length < occupiedCount) {
      const idx = Math.floor(Math.random() * btns.length);
      if (!occupiedIndices.includes(idx)) occupiedIndices.push(idx);
    }

    occupiedIndices.forEach(idx => {
      const b = btns[idx];
      b.classList.add('occupied');
      b.setAttribute('disabled', 'true');
      b.querySelector('span').textContent = 'Zajęty';
    });
  }

  // Fuel type selector — built from station data
  function renderFuelTypes(stationId) {
    const station = stations.find(s => s.id === parseInt(stationId)) || stations[0];
    const container = document.getElementById('fuelTypeSelector');
    const fuelNames = { pb95: 'PB 95', pb98: 'PB 98', on: 'Diesel (ON)', lpg: 'LPG', ev: 'EV ⚡' };

    container.innerHTML = Object.entries(station.fuels)
      .filter(([, v]) => v !== null)
      .map(([key, price]) => `
        <button class="fuel-type-btn" data-fuel="${key}">
          <span class="fuel-name">${fuelNames[key] || key}</span>
          <span class="fuel-price">${price.toFixed(2)} zł/L</span>
        </button>
      `).join('');

    container.querySelectorAll('.fuel-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.fuel-type-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedFuelType = btn.dataset.fuel;
        startUnlock();
      });
    });
  }

  document.getElementById('fuelingStation').addEventListener('change', (e) => {
    renderFuelTypes(e.target.value);
    randomizeDispensers();
  });

  window.goToFueling = (stationId) => {
    // 1. Switch nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const fuelingNav = document.querySelector('.nav-item[data-section="fueling"]');
    if (fuelingNav) fuelingNav.classList.add('active');

    document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
    document.getElementById('section-fueling').classList.add('active');

    // 2. Select station and trigger change
    const select = document.getElementById('fuelingStation');
    if (select) {
      select.value = stationId;
      select.dispatchEvent(new Event('change'));
    }

    // 3. Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start unlock countdown
  function startUnlock() {
    if (!selectedDispenser) {
      showToast('Wybierz dystrybutor!', 'warning');
      return;
    }

    document.getElementById('fuelingStep4').style.display = 'block';
    document.getElementById('fuelingStep5').style.display = 'none';
    document.getElementById('fuelingStep6').style.display = 'none';

    let timeLeft = 60;
    const timerEl = document.getElementById('unlockTimer');
    const statusEl = document.getElementById('fuelingStatus');

    statusEl.textContent = 'Odblokowano';
    statusEl.className = 'badge badge-warning';
    timerEl.className = 'timer-display';

    document.getElementById('startPumpBtn').style.display = 'inline-flex';
    document.getElementById('stopPumpBtn').style.display = 'none';
    document.getElementById('fuelGauge').classList.remove('active');

    // Reset displays
    document.getElementById('litersDisplay').textContent = '0.0';
    document.getElementById('totalDisplay').textContent = '0.00 zł';
    currentLiters = 0;

    if (fuelingInterval) clearInterval(fuelingInterval);

    const countdown = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 10) timerEl.className = 'timer-display warning';

      if (timeLeft <= 0) {
        clearInterval(countdown);
        showToast('Czas na aktywację dystrybutora upłynął!', 'error');
        document.getElementById('fuelingStep4').style.display = 'none';
      }
    }, 1000);

    // Save countdown ID to clear later
    fuelingSession = { countdown, stationId: document.getElementById('fuelingStation').value };

    document.getElementById('startPumpBtn').onclick = () => {
      clearInterval(countdown);
      startPumping();
    };
  }

  function startPumping() {
    const station = stations.find(s => s.id === parseInt(fuelingSession.stationId)) || stations[0];
    const pricePerLiter = station.fuels[selectedFuelType] || 6.29;

    document.getElementById('unlockTimer').style.display = 'none';
    document.querySelector('#fuelingStep4 .text-secondary').style.display = 'none';
    document.getElementById('startPumpBtn').style.display = 'none';
    document.getElementById('stopPumpBtn').style.display = 'inline-flex';
    document.getElementById('fuelGauge').classList.add('active');

    const statusEl = document.getElementById('fuelingStatus');
    statusEl.textContent = 'Tankowanie...';
    statusEl.className = 'badge badge-success';

    fuelingInterval = setInterval(() => {
      currentLiters += +(Math.random() * 1.5 + 0.5).toFixed(1);
      const total = currentLiters * pricePerLiter;

      document.getElementById('litersDisplay').textContent = currentLiters.toFixed(1);
      document.getElementById('totalDisplay').textContent = total.toFixed(2) + ' zł';

      // Auto-stop at ~50L
      if (currentLiters >= 50) {
        stopPumping(pricePerLiter);
      }
    }, 500);

    document.getElementById('stopPumpBtn').onclick = () => stopPumping(pricePerLiter);
  }

  function stopPumping(pricePerLiter) {
    clearInterval(fuelingInterval);
    fuelingInterval = null;

    document.getElementById('fuelGauge').classList.remove('active');
    const statusEl = document.getElementById('fuelingStatus');
    statusEl.textContent = 'Zakończono';
    statusEl.className = 'badge badge-info';

    const total = +(currentLiters * pricePerLiter).toFixed(2);
    const fuelType = selectedFuelType;
    const points = Math.floor(total) * (fuelType === 'pb98' ? 2 : 1);

    // Show payment step
    document.getElementById('fuelingStep5').style.display = 'block';
    document.getElementById('paymentTotal').textContent = total.toFixed(2) + ' zł';
    document.getElementById('pointsEarned').textContent = `+${points} punktów lojalnościowych`;

    // Payment method handling
    document.querySelectorAll('.payment-method').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const method = btn.dataset.method;
        document.getElementById('blikInput').style.display = method === 'blik' ? 'block' : 'none';
        document.getElementById('cryptoPayment').style.display = method === 'crypto' ? 'block' : 'none';
      });
    });

    document.getElementById('confirmPaymentBtn').onclick = async () => {
      document.getElementById('confirmPaymentBtn').disabled = true;
      document.getElementById('confirmPaymentBtn').textContent = '⏳ Przetwarzanie...';

      const result = await api('/api/fueling/complete', {
        method: 'POST',
        body: { sessionId: 'FUEL-' + Date.now(), liters: currentLiters, fuelType: selectedFuelType },
      });

      if (result.success) {
        document.getElementById('fuelingStep4').style.display = 'none';
        document.getElementById('fuelingStep5').style.display = 'none';
        document.getElementById('fuelingStep6').style.display = 'block';

        document.getElementById('confirmationDetails').innerHTML =
          `Zatankowano <b>${currentLiters.toFixed(1)}L ${selectedFuelType.toUpperCase()}</b> za <b>${total.toFixed(2)} zł</b><br>
           Zdobyto <b>${result.pointsEarned}</b> punktów • Saldo: <b>${result.newPointsBalance}</b> pkt`;

        document.getElementById('pointsBadge').textContent = result.newPointsBalance.toLocaleString();

        showToast('Płatność zakończona pomyślnie!', 'success');

        // Reset for new fueling
        document.getElementById('newFuelingBtn').onclick = () => {
          document.getElementById('fuelingStep6').style.display = 'none';
          document.getElementById('fuelingStep4').style.display = 'none';
          document.getElementById('fuelingStep5').style.display = 'none';
          document.getElementById('unlockTimer').style.display = '';
          document.querySelector('#fuelingStep4 .text-secondary').style.display = '';
          document.getElementById('confirmPaymentBtn').disabled = false;
          document.getElementById('confirmPaymentBtn').textContent = '✅ Potwierdź płatność';
          selectedDispenser = null;
          selectedFuelType = null;
          currentLiters = 0;
          document.querySelectorAll('.dispenser-btn').forEach(b => b.classList.remove('selected'));
        };
      }
    };
  }

  // ══════════════════════════════════════════════════════════
  // STOP CAFE MENU
  // ══════════════════════════════════════════════════════════

  async function loadMenu(category = 'all') {
    const url = category === 'all' ? '/api/menu' : `/api/menu?category=${category}`;
    menuItems = await api(url);
    const favData = await api('/api/favorites');
    favorites = favData.map(f => f.id);
    renderMenu(menuItems);
  }

  function renderMenu(items) {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = items.map(item => `
      <div class="menu-item-card ${!item.available ? 'unavailable' : ''}">
        ${item.popular ? '<div class="popular-badge">🔥 Popularne</div>' : ''}
        <div class="item-header">
          <span class="item-name">${item.name}</span>
          <span class="item-price">${item.price.toFixed(2)} zł</span>
        </div>
        <p class="item-desc">${item.description}</p>
        <div class="item-actions">
          ${item.available
            ? `<button class="btn btn-sm btn-primary" onclick="addToCart(${item.id})">🛒 Dodaj</button>`
            : '<span class="badge badge-danger">Niedostępny</span>'}
          <button class="fav-btn" onclick="toggleFavorite(${item.id})">${favorites.includes(item.id) ? '❤️' : '🤍'}</button>
        </div>
      </div>
    `).join('');
  }

  // Menu tabs
  document.querySelectorAll('#menuTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#menuTabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadMenu(btn.dataset.category);
    });
  });

  // Search
  document.getElementById('menuSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = menuItems.filter(i =>
      i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
    );
    renderMenu(filtered);
  });

  // Cart
  window.addToCart = function(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item || !item.available) return;

    const existing = cart.find(c => c.id === itemId);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    renderCart();
    showToast(`${item.name} dodano do koszyka`, 'success');
  };

  function renderCart() {
    const cartEl = document.getElementById('orderCart');
    const itemsEl = document.getElementById('cartItems');

    if (cart.length === 0) {
      cartEl.style.display = 'none';
      return;
    }

    cartEl.style.display = 'block';
    itemsEl.innerHTML = cart.map(item => `
      <div class="flex items-center gap-2 mb-1" style="justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border)">
        <div>
          <span style="font-weight:600">${item.name}</span>
          <span class="text-secondary"> × ${item.quantity}</span>
        </div>
        <div class="flex items-center gap-1">
          <span style="font-weight:700;color:var(--accent-primary)">${(item.price * item.quantity).toFixed(2)} zł</span>
          <button class="btn btn-sm btn-secondary" onclick="removeFromCart(${item.id})">✕</button>
        </div>
      </div>
    `).join('');

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2) + ' zł';
  }

  window.removeFromCart = function(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    renderCart();
  };

  document.getElementById('clearCartBtn').addEventListener('click', () => {
    cart = [];
    renderCart();
  });

  // Place food order
  document.getElementById('placeOrderBtn').addEventListener('click', async () => {
    if (cart.length === 0) return;

    const result = await api('/api/food-order', {
      method: 'POST',
      body: { items: cart.map(c => ({ id: c.id, quantity: c.quantity })) },
    });

    if (result.success) {
      document.getElementById('foodOrderNumber').textContent = result.orderNumber;
      document.getElementById('foodOrderTime').textContent = `Szacowany czas przygotowania: ${result.estimatedTime}`;
      document.getElementById('foodOrderPoints').innerHTML =
        `<span class="badge badge-success">+${result.pointsEarned} punktów</span>`;
      openModal('foodOrderModal');
      cart = [];
      renderCart();
      showToast('Zamówienie złożone!', 'success');
    }
  });

  // Favorites
  window.toggleFavorite = async function(itemId) {
    const result = await api('/api/favorites/toggle', {
      method: 'POST',
      body: { itemId },
    });

    if (result.added) {
      favorites.push(itemId);
      showToast('Dodano do ulubionych ❤️', 'success');
    } else {
      favorites = favorites.filter(id => id !== itemId);
      showToast('Usunięto z ulubionych', 'info');
    }
    renderMenu(menuItems);
    loadFavorites();
  };

  // ══════════════════════════════════════════════════════════
  // LOYALTY & REWARDS
  // ══════════════════════════════════════════════════════════

  async function loadLoyalty() {
    const data = await api('/api/loyalty');
    document.getElementById('loyaltyBalance').textContent = data.points.toLocaleString();
    document.getElementById('pointsBadge').textContent = data.points.toLocaleString();

    const grid = document.getElementById('rewardsGrid');
    grid.innerHTML = data.rewards.map(reward => `
      <div class="card" style="text-align:center">
        <div style="font-size:3rem;margin-bottom:0.75rem">${reward.image}</div>
        <h4>${reward.name}</h4>
        <p class="text-secondary mt-1" style="font-size:0.85rem">${reward.points.toLocaleString()} punktów</p>
        <button class="btn ${data.points >= reward.points ? 'btn-primary' : 'btn-secondary'} btn-sm mt-2 w-full"
                ${data.points < reward.points ? 'disabled' : ''}
                onclick="redeemReward(${reward.id}, '${reward.name}', '${reward.image}', ${reward.points})">
          ${data.points >= reward.points ? '🎁 Wymień' : '🔒 Za mało punktów'}
        </button>
      </div>
    `).join('');
  }

  window.redeemReward = async function(id, name, emoji, cost) {
    const result = await api('/api/loyalty/redeem', {
      method: 'POST',
      body: { rewardId: id },
    });

    if (result.success) {
      document.getElementById('rewardEmoji').textContent = emoji;
      document.getElementById('rewardName').textContent = name;
      document.getElementById('rewardCost').textContent = `-${cost} punktów`;
      document.getElementById('rewardCode').textContent = result.couponCode;
      openModal('rewardModal');
      loadLoyalty();
      showToast('Nagroda odebrana! 🎉', 'success');
    } else {
      showToast(result.error || 'Nie udało się wymienić nagrody', 'error');
    }
  };

  // ══════════════════════════════════════════════════════════
  // PURCHASE HISTORY
  // ══════════════════════════════════════════════════════════

  async function loadHistory() {
    const data = await api('/api/history');
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = data.map(tx => `
      <tr>
        <td style="font-family:monospace;font-size:0.8rem">${tx.id}</td>
        <td>${tx.date}</td>
        <td>${tx.station}</td>
        <td>${tx.type}</td>
        <td>${tx.amount}</td>
        <td style="font-weight:700;color:var(--accent-primary)">${tx.total.toFixed(2)} zł</td>
        <td><span class="badge badge-success">+${tx.points}</span></td>
        <td>${tx.paymentMethod}</td>
      </tr>
    `).join('');
  }

  // ══════════════════════════════════════════════════════════
  // FAVORITES
  // ══════════════════════════════════════════════════════════

  async function loadFavorites() {
    const data = await api('/api/favorites');
    const grid = document.getElementById('favoritesGrid');
    const empty = document.getElementById('favoritesEmpty');

    if (data.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = data.map(item => `
      <div class="menu-item-card">
        <div class="item-header">
          <span class="item-name">${item.name}</span>
          <span class="item-price">${item.price.toFixed(2)} zł</span>
        </div>
        <p class="item-desc">${item.description}</p>
        <div class="item-actions">
          ${item.available
            ? `<button class="btn btn-sm btn-primary" onclick="addToCart(${item.id})">🛒 Dodaj</button>`
            : '<span class="badge badge-danger">Niedostępny</span>'}
          <button class="fav-btn" onclick="toggleFavorite(${item.id})">❤️</button>
        </div>
      </div>
    `).join('');
  }

  // ══════════════════════════════════════════════════════════
  // PACKAGES
  // ══════════════════════════════════════════════════════════

  async function loadPackages() {
    const data = await api('/api/packages');

    const waiting = data.filter(p => p.status === 'waiting');
    const collected = data.filter(p => p.status === 'collected');

    document.getElementById('packagesWaiting').innerHTML = waiting.length > 0
      ? waiting.map(pkg => `
          <div class="package-card">
            <div class="package-icon">📦</div>
            <div class="package-info">
              <div class="pkg-title">${pkg.description}</div>
              <div class="pkg-detail">${pkg.courier} • ${pkg.trackingNumber}</div>
              <div class="pkg-detail">Stacja: ${pkg.station}</div>
              <div class="pkg-detail">Oczekuje od: ${pkg.arrivedAt} • Termin: ${pkg.expiresAt}</div>
            </div>
            <div class="package-actions">
              <button class="btn btn-sm btn-primary" onclick="showPackageQr('${pkg.id}', '${pkg.trackingNumber}')">📱 Kod QR odbioru</button>
            </div>
          </div>
        `).join('')
      : '<div class="empty-state"><div class="empty-icon">📦</div><p>Brak oczekujących paczek</p></div>';

    document.getElementById('packagesCollected').innerHTML = collected.length > 0
      ? collected.map(pkg => `
          <div class="package-card" style="opacity:0.6">
            <div class="package-icon">✅</div>
            <div class="package-info">
              <div class="pkg-title">${pkg.description}</div>
              <div class="pkg-detail">${pkg.courier} • ${pkg.trackingNumber}</div>
              <div class="pkg-detail">Odebrano: ${pkg.collectedAt || 'N/A'}</div>
            </div>
            <div class="package-actions">
              <span class="badge badge-success">Odebrana</span>
            </div>
          </div>
        `).join('')
      : '<div class="empty-state"><div class="empty-icon">📭</div><p>Brak odebranych paczek</p></div>';
  }

  // Package tabs
  document.querySelectorAll('[data-pkg-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-pkg-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.pkgTab;
      document.getElementById('packagesWaiting').style.display = tab === 'waiting' ? 'block' : 'none';
      document.getElementById('packagesCollected').style.display = tab === 'collected' ? 'block' : 'none';
    });
  });

  window.showPackageQr = function(pkgId, trackingNumber) {
    collectingPackageId = pkgId;
    document.getElementById('packageQrCode').textContent = trackingNumber.slice(0, 8);
    document.getElementById('packageModalDetails').innerHTML =
      `<span class="badge badge-warning">Numer: ${trackingNumber}</span>`;
    openModal('packageModal');
  };

  document.getElementById('confirmCollectBtn').addEventListener('click', async () => {
    if (!collectingPackageId) return;

    const result = await api(`/api/packages/${collectingPackageId}/collect`, {
      method: 'POST',
    });

    if (result.success) {
      closeModal('packageModal');
      loadPackages();
      showToast('Paczka odebrana pomyślnie! ✅', 'success');
      collectingPackageId = null;
    }
  });

  // ══════════════════════════════════════════════════════════
  // ASSISTANCE
  // ══════════════════════════════════════════════════════════

  document.getElementById('requestAssistBtn').addEventListener('click', async () => {
    const stationId = parseInt(document.getElementById('assistStation').value);
    const station = stations.find(s => s.id === stationId);
    const fuelType = document.getElementById('assistFuel').value;
    const arrival = document.getElementById('assistArrival').value;

    const result = await api('/api/assistance', {
      method: 'POST',
      body: {
        customerName: 'Jan Kowalski',
        stationId,
        fuelType,
        estimatedArrival: arrival || 'Za chwilę',
      },
    });

    if (result.success) {
      document.getElementById('assistanceStatus').style.display = 'block';
      document.getElementById('assistStatusText').textContent =
        'Oczekiwanie na potwierdzenie pracownika stacji...';
      showToast('Zgłoszenie wysłane do stacji!', 'success');

      // Simulate worker accepting after 5 seconds
      setTimeout(() => {
        document.getElementById('assistSpinner').style.display = 'none';
        document.getElementById('assistStatusText').innerHTML =
          '✅ Zgłoszenie przyjęte! Pracownik podejdzie do Twojego samochodu.';
        document.getElementById('assistEmployeeName').style.display = 'block';
        document.getElementById('assistEmployeeName').textContent =
          '👤 Anna Kowalska • Szacowany czas: ~3 minuty';
      }, 5000);
    }
  });

  // ══════════════════════════════════════════════════════════
  // REVIEWS
  // ══════════════════════════════════════════════════════════

  // Star rating
  document.querySelectorAll('#reviewStars .star').forEach(star => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.dataset.rating);
      document.querySelectorAll('#reviewStars .star').forEach(s => {
        s.classList.toggle('filled', parseInt(s.dataset.rating) <= currentRating);
        s.classList.toggle('empty', parseInt(s.dataset.rating) > currentRating);
      });
    });

    star.addEventListener('mouseenter', () => {
      const hoverRating = parseInt(star.dataset.rating);
      document.querySelectorAll('#reviewStars .star').forEach(s => {
        s.classList.toggle('filled', parseInt(s.dataset.rating) <= hoverRating);
        s.classList.toggle('empty', parseInt(s.dataset.rating) > hoverRating);
      });
    });
  });

  document.getElementById('reviewStars').addEventListener('mouseleave', () => {
    document.querySelectorAll('#reviewStars .star').forEach(s => {
      s.classList.toggle('filled', parseInt(s.dataset.rating) <= currentRating);
      s.classList.toggle('empty', parseInt(s.dataset.rating) > currentRating);
    });
  });

  document.getElementById('submitReviewBtn').addEventListener('click', async () => {
    const stationId = parseInt(document.getElementById('reviewStation').value);
    const station = stations.find(s => s.id === stationId);
    const text = document.getElementById('reviewText').value;

    if (currentRating === 0) {
      showToast('Wybierz ocenę w skali 1-5', 'warning');
      return;
    }

    const result = await api('/api/reviews', {
      method: 'POST',
      body: {
        stationId,
        stationName: station?.name,
        rating: currentRating,
        text,
        customerName: 'Jan Kowalski',
      },
    });

    if (result.success) {
      showToast('Recenzja wysłana! Dziękujemy za opinię ⭐', 'success');

      // Add to reviews list
      const list = document.getElementById('reviewsList');
      document.getElementById('noReviews')?.remove();

      const reviewCard = document.createElement('div');
      reviewCard.className = 'card mb-1';
      reviewCard.innerHTML = `
        <div class="flex justify-between items-center" style="justify-content:space-between">
          <div>
            <h4>${station?.name}</h4>
            <div class="stars mt-1" style="pointer-events:none">
              ${'★'.repeat(currentRating).split('').map(() => '<span class="star filled">★</span>').join('')}
              ${'★'.repeat(5 - currentRating).split('').map(() => '<span class="star empty">★</span>').join('')}
            </div>
            <p class="text-secondary mt-1" style="font-size:0.85rem">${text || 'Brak komentarza'}</p>
          </div>
          <span class="badge badge-neutral">Właśnie teraz</span>
        </div>
      `;
      list.appendChild(reviewCard);

      // Reset form
      currentRating = 0;
      document.querySelectorAll('#reviewStars .star').forEach(s => {
        s.classList.remove('filled');
        s.classList.add('empty');
      });
      document.getElementById('reviewText').value = '';

      if (currentRating === 1) {
        showToast('Zgłoszenie automatycznie przekazane do Managera stacji', 'info');
      }
    }
  });

  // ══════════════════════════════════════════════════════════
  // INITIALIZE
  // ══════════════════════════════════════════════════════════

  initMap().then(() => {
    if (stations.length > 0) {
      renderFuelTypes(stations[0].id);
    }
  });
  loadMenu();
  loadLoyalty();
  loadHistory();
  loadFavorites();
  loadPackages();
});
