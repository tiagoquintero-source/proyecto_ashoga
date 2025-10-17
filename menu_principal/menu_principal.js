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
});

