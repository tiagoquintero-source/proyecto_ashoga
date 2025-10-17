document.addEventListener('DOMContentLoaded', function () {
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const viewTitle = document.getElementById('view-title');
  const viewBody = document.getElementById('view-body');

  // Comprobar sesión
  try {
    const raw = localStorage.getItem('hotel_user');
    if (!raw) throw new Error('No session');
    const user = JSON.parse(raw);
    if (!user || !user.logged) throw new Error('No valid session');

    // Mostrar usuario en el header area si el elemento existe
    if (userInfo) userInfo.textContent = `Usuario: ${user.username}`;
    const sidebarUser = document.getElementById('sidebar-user');
    if (sidebarUser) sidebarUser.textContent = user.username;
  } catch (err) {
    // Redirigir al login si no hay sesión
    window.location.href = '../inicio_sesion/login.html';
    return;
  }

  // logout: el botón puede estar en el sidebar ahora
  const logoutButtons = document.querySelectorAll('#logout');
  logoutButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      localStorage.removeItem('hotel_user');
      window.location.href = '../inicio_sesion/login.html';
    });
  });

  // Navegación interna: cargar vistas placeholder
  // Resaltar el enlace activo según la URL actual
  (function highlightActive() {
    const path = window.location.pathname.replace(/\\\\/g, '/');
    const base = path.substring(path.lastIndexOf('/') + 1) || 'menu_principal.html';
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const hrefBase = href.substring(href.lastIndexOf('/') + 1);
      link.classList.toggle('active', hrefBase === base);
    });
  })();

  // Nuevo: gestión de actividades recientes
  const activityListEl = document.getElementById('activity-list');
  const activityTemplate = document.getElementById('activity-template');
  const filterButtons = Array.from(document.querySelectorAll('.activity-filter'));

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
  }

  function loadDataOrSample() {
    // intentar cargar arrays desde localStorage
    let orders = [];
    let inventory = [];
    let products = [];

    try {
      orders = JSON.parse(localStorage.getItem('orders')) || [];
    } catch (_) { orders = []; }
    try {
      inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    } catch (_) { inventory = []; }
    try {
      products = JSON.parse(localStorage.getItem('products')) || [];
    } catch (_) { products = []; }

    // si no hay datos, añadir ejemplos mínimos
    if (!orders.length && !inventory.length && !products.length) {
      const now = Date.now();
      orders = [
        { id: 'o1', text: 'Pedido #1234: 50 unidades de Toallas', at: now - 1000 * 60 * 60 * 2 },
        { id: 'o2', text: 'Pedido #1235: 200 unidades de Papel Higiénico', at: now - 1000 * 60 * 20 },
      ];
      inventory = [
        { id: 'i1', name: 'Jabón Líquido', stock: 3, updatedAt: now - 1000 * 60 * 60 * 5 },
        { id: 'i2', name: 'Papel Higiénico', stock: 120, updatedAt: now - 1000 * 60 * 60 * 24 },
      ];
      products = [
        { id: 'p1', name: 'Gel Antibacterial', addedAt: now - 1000 * 60 * 60 * 3 },
        { id: 'p2', name: 'Almohada Deluxe', addedAt: now - 1000 * 60 * 60 * 26 },
      ];
    }

    return { orders, inventory, products };
  }

  function buildActivities() {
    const { orders, inventory, products } = loadDataOrSample();
    const activities = [];

    // pedidos recientes
    orders.forEach(o => {
      activities.push({
        id: `order-${o.id}`,
        type: 'orders',
        message: o.text,
        time: o.at || Date.now()
      });
    });

    // productos con stock bajo (umbral 10)
    inventory.forEach(it => {
      if (typeof it.stock === 'number' && it.stock <= 10) {
        activities.push({
          id: `low-${it.id}`,
          type: 'lowStock',
          message: `${it.name} con stock bajo (${it.stock})`,
          time: it.updatedAt || Date.now()
        });
      }
    });

    // nuevos productos añadidos recientemente
    products.forEach(p => {
      activities.push({
        id: `new-${p.id}`,
        type: 'newProduct',
        message: `Nuevo producto: ${p.name}`,
        time: p.addedAt || Date.now()
      });
    });

    // ordenar por tiempo descendente
    activities.sort((a, b) => b.time - a.time);
    return activities;
  }

  function renderActivities(filter = 'all') {
    const activities = buildActivities();
    activityListEl.innerHTML = '';
    const toRender = filter === 'all' ? activities : activities.filter(a => a.type === filter);

    if (!toRender.length) {
      activityListEl.innerHTML = '<div class="activity-row"><div class="activity-text">No hay notificaciones recientes.</div></div>';
      return;
    }

    toRender.forEach(act => {
      const clone = activityTemplate.content.firstElementChild.cloneNode(true);
      clone.setAttribute('data-type', act.type);
      clone.querySelector('.activity-text').textContent = act.message;
      clone.querySelector('.activity-time').textContent = timeAgo(act.time);
      const badge = clone.querySelector('.activity-badge');
      if (act.type === 'orders') { badge.textContent = 'Pedido'; badge.classList.add('badge-order'); }
      if (act.type === 'lowStock') { badge.textContent = 'Stock bajo'; badge.classList.add('badge-lowStock'); }
      if (act.type === 'newProduct') { badge.textContent = 'Nuevo'; badge.classList.add('badge-newProduct'); }
      activityListEl.appendChild(clone);
    });
  }

  // filtros UI
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const f = this.getAttribute('data-filter');
      renderActivities(f);
    });
  });

  // Render inicial
  renderActivities('all');

  // Opcional: refrescar cada 30s para ver actualizaciones
  setInterval(() => renderActivities(document.querySelector('.activity-filter.active')?.getAttribute('data-filter') || 'all'), 30000);
});

