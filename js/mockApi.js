/* ═══════════════════════════════════════════════════════════════
   STACJA BENZYNOWA ORZEŁ — Mock API (Static Version)
   ═══════════════════════════════════════════════════════════════ */

(function() {
  // --- INICJALIZACJA DANYCH ---
  const defaultStations = [
    { id: 1, name: 'Orzeł Warszawa Centrum', address: 'ul. Marszałkowska 55, Warszawa', lat: 52.2297, lng: 21.0122, rating: 4.5, reviewCount: 128, fuels: { pb95: 6.29, pb98: 7.09, on: 6.49, lpg: 2.89, ev: 2.10 }, hasLPG: true, hasEV: true, hasCafe: true, hasPackages: true, image: null },
    { id: 2, name: 'Orzeł Kraków Nowa Huta', address: 'al. Solidarności 12, Kraków', lat: 50.0647, lng: 19.9450, rating: 4.2, reviewCount: 89, fuels: { pb95: 6.25, pb98: 7.05, on: 6.45, lpg: 2.85, ev: null }, hasLPG: true, hasEV: false, hasCafe: true, hasPackages: true, image: null },
    { id: 3, name: 'Orzeł Gdańsk Wrzeszcz', address: 'ul. Grunwaldzka 200, Gdańsk', lat: 54.3520, lng: 18.6466, rating: 4.7, reviewCount: 156, fuels: { pb95: 6.31, pb98: 7.11, on: 6.51, lpg: 2.91, ev: 2.15 }, hasLPG: true, hasEV: true, hasCafe: true, hasPackages: false, image: null },
    { id: 4, name: 'Orzeł Poznań Rataje', address: 'ul. Zamenhofa 133, Poznań', lat: 52.4064, lng: 16.9252, rating: 4.0, reviewCount: 67, fuels: { pb95: 6.27, pb98: 7.07, on: 6.47, lpg: null, ev: null }, hasLPG: false, hasEV: false, hasCafe: true, hasPackages: true, image: null },
    { id: 5, name: 'Orzeł Wrocław Fabryczna', address: 'ul. Legnicka 55, Wrocław', lat: 51.1079, lng: 17.0385, rating: 4.3, reviewCount: 94, fuels: { pb95: 6.28, pb98: 7.08, on: 6.48, lpg: 2.87, ev: 2.12 }, hasLPG: true, hasEV: true, hasCafe: true, hasPackages: true, image: null },
    { id: 6, name: 'Orzeł Łódź Widzew', address: 'al. Piłsudskiego 143, Łódź', lat: 51.7592, lng: 19.4560, rating: 3.9, reviewCount: 45, fuels: { pb95: 6.23, pb98: 7.03, on: 6.43, lpg: 2.83, ev: null }, hasLPG: true, hasEV: false, hasCafe: false, hasPackages: true, image: null },
    { id: 7, name: 'Orzeł Katowice Ligota', address: 'ul. Kościuszki 229, Katowice', lat: 50.2649, lng: 19.0238, rating: 4.4, reviewCount: 112, fuels: { pb95: 6.26, pb98: 7.06, on: 6.46, lpg: 2.86, ev: 2.08 }, hasLPG: true, hasEV: true, hasCafe: true, hasPackages: true, image: null },
    { id: 8, name: 'Orzeł Lublin Czuby', address: 'ul. Jana Pawła II 15, Lublin', lat: 51.2465, lng: 22.5684, rating: 4.1, reviewCount: 53, fuels: { pb95: 6.24, pb98: 7.04, on: 6.44, lpg: 2.84, ev: null }, hasLPG: true, hasEV: false, hasCafe: true, hasPackages: false, image: null },
  ];

  const defaultMenuItems = [
    { id: 1, name: 'Burger Rzemieślnika', category: 'burgery', price: 18.99, description: 'Wołowina 200g, ser cheddar, sałata, sos BBQ', available: true, popular: true },
    { id: 2, name: 'Cheeseburger Classic', category: 'burgery', price: 14.99, description: 'Wołowina 150g, ser, ogórek, ketchup', available: true, popular: false },
    { id: 3, name: 'Hot-Dog Premium', category: 'hotdogi', price: 9.99, description: 'Parówka wołowa, musztarda, cebula prażona', available: true, popular: true },
    { id: 4, name: 'Hot-Dog Wegański', category: 'hotdogi', price: 11.99, description: 'Parówka roślinna, sałatka coleslaw', available: false, popular: false },
    { id: 5, name: 'Pizza Margherita', category: 'pizza', price: 16.99, description: 'Sos pomidorowy, mozzarella, bazylia', available: true, popular: false },
    { id: 6, name: 'Pizza Pepperoni', category: 'pizza', price: 19.99, description: 'Sos pomidorowy, mozzarella, pepperoni', available: true, popular: true },
    { id: 7, name: 'Zapiekanka Klasyczna', category: 'zapiekanki', price: 12.99, description: 'Pieczarki, ser, ketchup', available: true, popular: false },
    { id: 8, name: 'Zapiekanka Hawajska', category: 'zapiekanki', price: 14.99, description: 'Szynka, ananas, ser, sos czosnkowy', available: true, popular: false },
    { id: 9, name: 'Kawa Latte', category: 'napoje', price: 8.99, description: 'Espresso, mleko spienione', available: true, popular: true },
    { id: 10, name: 'Kawa Americano', category: 'napoje', price: 6.99, description: 'Podwójne espresso, gorąca woda', available: true, popular: false },
    { id: 11, name: 'Cappuccino', category: 'napoje', price: 7.99, description: 'Espresso, pianka mleczna, kakao', available: true, popular: false },
    { id: 12, name: 'Herbata Earl Grey', category: 'napoje', price: 5.99, description: 'Herbata liściasta z bergamotką', available: true, popular: false },
  ];

  const rewards = [
    { id: 1, name: 'Darmowa Kawa', points: 500, category: 'napoje', image: '☕' },
    { id: 2, name: 'Hot-Dog Gratis', points: 800, category: 'jedzenie', image: '🌭' },
    { id: 3, name: 'Mycie Auta Standard', points: 1500, category: 'usługi', image: '🚗' },
    { id: 4, name: 'Burger Premium', points: 2000, category: 'jedzenie', image: '🍔' },
    { id: 5, name: 'Rabat 10 PLN na paliwo', points: 3000, category: 'paliwo', image: '⛽' },
    { id: 6, name: 'Zestaw Podróżny', points: 5000, category: 'gadżety', image: '🎒' },
  ];

  const defaultPurchaseHistory = [
    { id: 'TX-20260620-001', date: '2026-06-20 14:32', station: 'Orzeł Warszawa Centrum', type: 'Paliwo PB95', amount: '35.2L', total: 221.41, points: 221, paymentMethod: 'Karta Visa' },
    { id: 'TX-20260619-003', date: '2026-06-19 09:15', station: 'Orzeł Kraków Nowa Huta', type: 'Kawa Latte + Hot-Dog', amount: '2 szt.', total: 18.98, points: 19, paymentMethod: 'BLIK' },
  ];

  const defaultPackages = [
    { id: 'PCK-001', trackingNumber: 'INP-2026-87654321', courier: 'InPost', station: 'Orzeł Warszawa Centrum', status: 'waiting', arrivedAt: '2026-06-20 10:30', expiresAt: '2026-06-22 10:30', description: 'Przesyłka z Allegro' },
    { id: 'PCK-002', trackingNumber: 'DPD-2026-12345678', courier: 'DPD', station: 'Orzeł Warszawa Centrum', status: 'waiting', arrivedAt: '2026-06-19 14:15', expiresAt: '2026-06-21 14:15', description: 'Przesyłka z Amazon' },
    { id: 'PCK-003', trackingNumber: 'INP-2026-11223344', courier: 'InPost', station: 'Orzeł Kraków Nowa Huta', status: 'collected', arrivedAt: '2026-06-15 09:00', collectedAt: '2026-06-16 12:30', description: 'Przesyłka z OLX' },
  ];

  const defaultFuelTanks = [
    { id: 1, type: 'PB95', capacity: 50000, current: 32500, unit: 'L', lastDelivery: '2026-06-18', nextDelivery: null },
    { id: 2, type: 'PB98', capacity: 30000, current: 4200, unit: 'L', lastDelivery: '2026-06-15', nextDelivery: '2026-06-21 14:00' },
    { id: 3, type: 'ON', capacity: 60000, current: 41000, unit: 'L', lastDelivery: '2026-06-19', nextDelivery: null },
    { id: 4, type: 'LPG', capacity: 20000, current: 8500, unit: 'L', lastDelivery: '2026-06-17', nextDelivery: null },
  ];

  const defaultOrders = [
    { id: 'ORD-001', type: 'Paliwo PB98', quantity: '25 000 L', status: 'in_transit', orderedAt: '2026-06-20 08:00', eta: '2026-06-21 14:00', supplier: 'PKN Orlen Logistyka' },
    { id: 'ORD-002', type: 'Produkty spożywcze', quantity: '150 szt.', status: 'confirmed', orderedAt: '2026-06-20 12:00', eta: '2026-06-22 06:00', supplier: 'Makro Cash & Carry' },
  ];

  const employees = [
    { id: 1, name: 'Anna Kowalska', role: 'Kasjer', phone: '+48 501 234 567', available: true },
    { id: 2, name: 'Marek Wiśniewski', role: 'Kasjer', phone: '+48 502 345 678', available: true },
    { id: 3, name: 'Katarzyna Nowak', role: 'Kucharz Stop Cafe', phone: '+48 503 456 789', available: true },
    { id: 4, name: 'Tomasz Zieliński', role: 'Kasjer', phone: '+48 504 567 890', available: false },
    { id: 5, name: 'Ewa Kamińska', role: 'Kucharz Stop Cafe', phone: '+48 505 678 901', available: true },
    { id: 6, name: 'Jan Lewandowski', role: 'Obsługa dystrybutorów', phone: '+48 506 789 012', available: true },
  ];

  const schedule = {
    '2026-06-21': [
      { employeeId: 1, shift: 'morning', hours: '06:00 - 14:00' },
      { employeeId: 3, shift: 'morning', hours: '06:00 - 14:00' },
      { employeeId: 6, shift: 'morning', hours: '06:00 - 14:00' },
      { employeeId: 2, shift: 'afternoon', hours: '14:00 - 22:00' },
      { employeeId: 5, shift: 'afternoon', hours: '14:00 - 22:00' },
    ]
  };

  const defaultPromotions = [
    { id: 1, title: 'Kawa + Hot-Dog za 12.99 PLN', description: 'Zestaw śniadaniowy w promocji', active: true, validFrom: '2026-06-01', validTo: '2026-06-30', discount: '25%' },
    { id: 2, title: '2x Punkty za PB98', description: 'Podwójne punkty lojalnościowe za tankowanie Premium', active: true, validFrom: '2026-06-15', validTo: '2026-07-15', discount: 'x2 punkty' },
  ];

  const salesData = { daily: { labels: ['15.06', '16.06', '17.06', '18.06', '19.06', '20.06', '21.06'], fuel: [18500, 22300, 19800, 24100, 21700, 25400, 15200], shop: [3200, 2800, 3500, 4100, 3900, 4500, 2100], cafe: [1800, 1500, 2100, 2400, 2200, 2800, 1200], customers: [245, 298, 267, 312, 289, 334, 178] }, hourly: { labels: ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'], values: [1200, 3400, 5600, 4200, 3100, 2800, 3500, 4100, 3800, 4500, 5200, 6100, 5800, 4300, 3200, 1800] } };
  const emissionsData = { co2Monthly: [12.4, 11.8, 13.1, 12.9, 11.5, 10.8], monthLabels: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze'], solarCoverage: 34, waterUsage: 156, energyUsage: 28500 };

  // Menadżerowie (z góry przypisani)
  const defaultManagers = [
    { email: 'admin', password: 'admin', name: 'Maria Wiśniewska', role: 'Menedżer Stacji', station: 'Orzeł Warszawa Centrum', stationId: 1 }
  ];

  // Klienci domyślni dla testów
  const defaultUsers = [
    { id: 1, name: 'Jan Kowalski', email: 'test', password: 'test', points: 1200, favorites: [] }
  ];

  // --- FUNKCJE BAZY DANYCH (LOCALSTORAGE) ---
  function getDb(key, defaultVal) {
    const val = localStorage.getItem('orzel_' + key);
    return val ? JSON.parse(val) : defaultVal;
  }
  function setDb(key, val) {
    localStorage.setItem('orzel_' + key, JSON.stringify(val));
  }

  // Inicjalizacja w localStorage jeśli puste
  if (!localStorage.getItem('orzel_stations')) setDb('stations', defaultStations);
  if (!localStorage.getItem('orzel_menu')) setDb('menu', defaultMenuItems);
  if (!localStorage.getItem('orzel_history')) setDb('history', defaultPurchaseHistory);
  if (!localStorage.getItem('orzel_packages')) setDb('packages', defaultPackages);
  if (!localStorage.getItem('orzel_tanks')) setDb('tanks', defaultFuelTanks);
  if (!localStorage.getItem('orzel_orders')) setDb('orders', defaultOrders);
  if (!localStorage.getItem('orzel_promotions')) setDb('promotions', defaultPromotions);
  if (!localStorage.getItem('orzel_assistance')) setDb('assistance', []);
  if (!localStorage.getItem('orzel_reviews')) setDb('reviews', []);
  if (!localStorage.getItem('orzel_users')) setDb('users', defaultUsers);

  // Symulacja asynchronicznego opóźnienia
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  // --- MOCK API OBJ ---
  window.MockAPI = {
    // Auth
    login: async (email, password, isManager) => {
      await delay(300);
      if (isManager) {
        const mgr = defaultManagers.find(m => m.email === email && m.password === password);
        if (mgr) {
          localStorage.setItem('orzel_role', 'manager');
          localStorage.setItem('orzel_user', JSON.stringify({ name: mgr.name, email: mgr.email, role: mgr.role, station: mgr.station, stationId: mgr.stationId }));
          return { success: true };
        }
        return { success: false, error: 'Błędny email lub hasło menedżera' };
      } else {
        const users = getDb('users', []);
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          localStorage.setItem('orzel_role', 'customer');
          localStorage.setItem('orzel_user', JSON.stringify({ name: user.name, email: user.email, points: user.points, favorites: user.favorites }));
          return { success: true };
        }
        return { success: false, error: 'Błędny email lub hasło' };
      }
    },
    register: async (name, email, password) => {
      await delay(300);
      const users = getDb('users', []);
      if (users.find(u => u.email === email)) return { success: false, error: 'Konto o tym adresie e-mail już istnieje' };
      const newUser = { id: Date.now(), name, email, password, points: 500, favorites: [] }; // Bonus 500 pkt na start
      users.push(newUser);
      setDb('users', users);
      localStorage.setItem('orzel_role', 'customer');
      localStorage.setItem('orzel_user', JSON.stringify({ name: newUser.name, email: newUser.email, points: newUser.points, favorites: newUser.favorites }));
      return { success: true };
    },
    updateUser: (updates) => {
      const u = JSON.parse(localStorage.getItem('orzel_user'));
      if(u) {
        const updated = {...u, ...updates};
        localStorage.setItem('orzel_user', JSON.stringify(updated));
        // aktualizacja w users db
        const users = getDb('users', []);
        const idx = users.findIndex(us => us.email === u.email);
        if (idx !== -1) { users[idx] = {...users[idx], ...updates}; setDb('users', users); }
      }
    },

    // Stations
    getStations: async () => { await delay(100); return getDb('stations'); },
    
    // Menu
    getMenu: async (category) => {
      await delay(100);
      let items = getDb('menu');
      if (category && category !== 'all') items = items.filter(i => i.category === category);
      return items;
    },
    toggleMenu: async (id) => {
      await delay(200);
      const items = getDb('menu');
      const item = items.find(i => i.id === parseInt(id));
      if (item) item.available = !item.available;
      setDb('menu', items);
      return { success: true, item };
    },

    // Loyalty
    getLoyalty: async () => {
      await delay(100);
      const user = JSON.parse(localStorage.getItem('orzel_user'));
      return { points: user?.points || 0, rewards };
    },
    redeemReward: async (rewardId) => {
      await delay(300);
      const user = JSON.parse(localStorage.getItem('orzel_user'));
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) return { success: false, error: 'Nagroda nie znaleziona' };
      if ((user.points || 0) < reward.points) return { success: false, error: 'Za mało punktów' };
      
      const newPoints = user.points - reward.points;
      window.MockAPI.updateUser({ points: newPoints });
      const couponCode = 'QR-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      return { success: true, newBalance: newPoints, couponCode };
    },

    // History
    getHistory: async () => { await delay(100); return getDb('history'); },

    // Packages
    getPackages: async () => { await delay(100); return getDb('packages'); },
    collectPackage: async (id) => {
      await delay(300);
      const pkgs = getDb('packages');
      const pkg = pkgs.find(p => p.id === id);
      if (pkg) {
        pkg.status = 'collected';
        pkg.collectedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
        setDb('packages', pkgs);
      }
      return { success: true, package: pkg };
    },

    // Favorites
    getFavorites: async () => {
      await delay(100);
      const user = JSON.parse(localStorage.getItem('orzel_user'));
      const favIds = user?.favorites || [];
      const menu = getDb('menu');
      return menu.filter(item => favIds.includes(item.id));
    },
    toggleFavorite: async (itemId) => {
      await delay(100);
      const user = JSON.parse(localStorage.getItem('orzel_user'));
      let favs = user?.favorites || [];
      const idx = favs.indexOf(itemId);
      let added = false;
      if (idx > -1) {
        favs.splice(idx, 1);
      } else {
        favs.push(itemId);
        added = true;
      }
      window.MockAPI.updateUser({ favorites: favs });
      return { success: true, added, favorites: favs };
    },

    // Reviews
    submitReview: async (data) => {
      await delay(300);
      const revs = getDb('reviews');
      const review = { id: revs.length + 1, ...data, createdAt: new Date().toISOString() };
      revs.push(review);
      setDb('reviews', revs);
      
      const sts = getDb('stations');
      const st = sts.find(s => s.id === data.stationId);
      if (st) {
        const sr = revs.filter(r => r.stationId === st.id);
        st.rating = +(sr.reduce((sum, r) => sum + r.rating, 0) / sr.length).toFixed(1);
        st.reviewCount++;
        setDb('stations', sts);
      }
      return { success: true, review };
    },

    // Assistance
    getAssistance: async () => { await delay(100); return getDb('assistance'); },
    requestAssistance: async (data) => {
      await delay(300);
      const ast = getDb('assistance');
      const req = {
        id: 'AST-' + String(ast.length + 1).padStart(3, '0'),
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        assignedTo: null,
      };
      ast.push(req);
      setDb('assistance', ast);
      return { success: true, request: req };
    },
    acceptAssistance: async (id, employeeName) => {
      await delay(200);
      const ast = getDb('assistance');
      const req = ast.find(a => a.id === id);
      if (req) {
        req.status = 'accepted';
        req.assignedTo = employeeName || 'Pracownik';
        req.acceptedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
        setDb('assistance', ast);
      }
      return { success: true, request: req };
    },
    completeAssistance: async (id) => {
      await delay(200);
      const ast = getDb('assistance');
      const req = ast.find(a => a.id === id);
      if (req) {
        req.status = 'completed';
        req.completedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
        setDb('assistance', ast);
      }
      return { success: true, request: req };
    },

    // Manager endpoints
    getFuelTanks: async () => { await delay(100); return getDb('tanks'); },
    getOrders: async () => { await delay(100); return getDb('orders'); },
    createOrder: async (data) => {
      await delay(400);
      const ord = getDb('orders');
      const order = {
        id: 'ORD-' + String(ord.length + 1).padStart(3, '0'),
        ...data,
        status: 'pending',
        orderedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        supplier: data.type.includes('Paliwo') ? 'PKN Orlen Logistyka' : 'Makro Cash & Carry',
      };
      ord.push(order);
      setDb('orders', ord);
      return { success: true, order };
    },
    getEmployees: async () => { await delay(100); return employees; },
    getSchedule: async () => { await delay(100); return schedule; },
    getSales: async () => { await delay(100); return salesData; },
    getPromotions: async () => { await delay(100); return getDb('promotions'); },
    createPromotion: async (data) => {
      await delay(300);
      const prom = getDb('promotions');
      const promo = { id: prom.length + 1, ...data, active: true };
      prom.push(promo);
      setDb('promotions', prom);
      return { success: true, promotion: promo };
    },
    togglePromotion: async (id) => {
      await delay(200);
      const prom = getDb('promotions');
      const promo = prom.find(p => p.id === parseInt(id));
      if (promo) { promo.active = !promo.active; setDb('promotions', prom); }
      return { success: true, promotion: promo };
    },
    getEmissions: async () => { await delay(100); return emissionsData; },

    // Action simulations
    fuelingComplete: async (data) => {
      await delay(500);
      const sts = getDb('stations');
      const station = sts[0]; // just picking first for mock
      const pricePerLiter = station.fuels[data.fuelType] || 6.29;
      const total = +(data.liters * pricePerLiter).toFixed(2);
      const pointsEarned = Math.floor(total) * (data.fuelType === 'pb98' ? 2 : 1);
      
      const user = JSON.parse(localStorage.getItem('orzel_user'));
      const newPoints = (user.points || 0) + pointsEarned;
      window.MockAPI.updateUser({ points: newPoints });

      const hist = getDb('history');
      const transaction = {
        id: 'TX-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(hist.length + 1).padStart(3, '0'),
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        station: station.name,
        type: `Paliwo ${data.fuelType.toUpperCase()}`,
        amount: `${data.liters}L`,
        total,
        points: pointsEarned,
        paymentMethod: 'Karta',
      };
      hist.unshift(transaction);
      setDb('history', hist);

      return { success: true, transaction, pointsEarned, newPointsBalance: newPoints };
    },
    foodOrder: async (data) => {
      await delay(500);
      const menu = getDb('menu');
      const orderItems = data.items.map(i => {
        const menuItem = menu.find(m => m.id === i.id);
        return { ...menuItem, quantity: i.quantity || 1 };
      });
      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const pointsEarned = Math.floor(total);
      
      const user = JSON.parse(localStorage.getItem('orzel_user'));
      const newPoints = (user.points || 0) + pointsEarned;
      window.MockAPI.updateUser({ points: newPoints });

      const hist = getDb('history');
      const transaction = {
        id: 'FC-' + Math.floor(Math.random() * 900 + 100),
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        station: 'Orzeł Warszawa Centrum',
        type: `Zamówienie Stop Cafe`,
        amount: `${data.items.length} pozycji`,
        total,
        points: pointsEarned,
        paymentMethod: 'Aplikacja',
      };
      hist.unshift(transaction);
      setDb('history', hist);

      return {
        success: true,
        orderNumber: transaction.id,
        items: orderItems,
        total: +total.toFixed(2),
        estimatedTime: Math.floor(Math.random() * 10 + 5) + ' min',
        pointsEarned,
      };
    }
  };
})();

  // --- FETCH OVERRIDE ---
  const originalFetch = window.fetch;
  window.fetch = async (url, options = {}) => {
    if (!url.startsWith('/api/')) return originalFetch(url, options);
    
    const method = options.method || 'GET';
    const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;
    const isGet = method === 'GET';
    
    let result = null;

    if (url === '/api/stations') result = await window.MockAPI.getStations();
    else if (url.startsWith('/api/menu') && isGet) {
      const cat = new URLSearchParams(url.split('?')[1]).get('category');
      result = await window.MockAPI.getMenu(cat);
    }
    else if (url.startsWith('/api/menu') && method === 'PUT') {
      const id = url.split('/')[3];
      result = await window.MockAPI.toggleMenu(id);
    }
    else if (url === '/api/food-order') result = await window.MockAPI.foodOrder(body);
    else if (url === '/api/loyalty') result = await window.MockAPI.getLoyalty();
    else if (url === '/api/loyalty/redeem') result = await window.MockAPI.redeemReward(body.rewardId);
    else if (url === '/api/history') result = await window.MockAPI.getHistory();
    else if (url === '/api/favorites') result = await window.MockAPI.getFavorites();
    else if (url === '/api/favorites/toggle') result = await window.MockAPI.toggleFavorite(body.itemId);
    else if (url === '/api/packages') result = await window.MockAPI.getPackages();
    else if (url.startsWith('/api/packages/') && url.endsWith('/collect')) {
      const id = url.split('/')[3];
      result = await window.MockAPI.collectPackage(id);
    }
    else if (url === '/api/assistance' && isGet) result = await window.MockAPI.getAssistance();
    else if (url === '/api/assistance' && method === 'POST') result = await window.MockAPI.requestAssistance(body);
    else if (url.startsWith('/api/assistance/') && url.endsWith('/accept')) {
      const id = url.split('/')[3];
      result = await window.MockAPI.acceptAssistance(id, body?.employeeName);
    }
    else if (url.startsWith('/api/assistance/') && url.endsWith('/complete')) {
      const id = url.split('/')[3];
      result = await window.MockAPI.completeAssistance(id);
    }
    else if (url === '/api/reviews') result = await window.MockAPI.submitReview(body);
    else if (url === '/api/fueling/complete') result = await window.MockAPI.fuelingComplete(body);
    else if (url === '/api/fuel-tanks') result = await window.MockAPI.getFuelTanks();
    else if (url === '/api/orders' && isGet) result = await window.MockAPI.getOrders();
    else if (url === '/api/orders' && method === 'POST') result = await window.MockAPI.createOrder(body);
    else if (url === '/api/schedule') result = await window.MockAPI.getSchedule();
    else if (url === '/api/employees') result = await window.MockAPI.getEmployees();
    else if (url === '/api/sales') result = await window.MockAPI.getSales();
    else if (url === '/api/emissions') result = await window.MockAPI.getEmissions();
    else if (url === '/api/promotions' && isGet) result = await window.MockAPI.getPromotions();
    else if (url === '/api/promotions' && method === 'POST') result = await window.MockAPI.createPromotion(body);
    else if (url.startsWith('/api/promotions/') && url.endsWith('/toggle')) {
      const id = url.split('/')[3];
      result = await window.MockAPI.togglePromotion(id);
    }

    if (result) {
      return { ok: true, json: async () => result };
    }
    console.warn('MockAPI unhandled URL:', url);
    return { ok: false, status: 404, json: async () => ({ error: 'Not found' }) };
  };

