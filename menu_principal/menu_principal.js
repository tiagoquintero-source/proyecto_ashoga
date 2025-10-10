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

    userInfo.textContent = `Usuario: ${user.username}`;
  } catch (err) {
    // Redirigir al index (raíz) si no hay sesión
    window.location.replace('../index.html');
    return;
  }

  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('hotel_user');
    // Usar replace para que el usuario no pueda volver a la página protegida
    window.location.replace('../index.html');
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
