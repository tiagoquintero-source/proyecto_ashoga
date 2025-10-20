document.addEventListener('DOMContentLoaded', function () {
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const viewTitle = document.getElementById('view-title');
  const viewBody = document.getElementById('view-body');

  // No usamos localStorage por ahora. Mostrar un usuario placeholder si existe el elemento.
  if (userInfo) userInfo.textContent = `Usuario: invitado`;
  const sidebarUser = document.getElementById('sidebar-user');
  if (sidebarUser) sidebarUser.textContent = 'invitado';

  // logout: el botón puede estar en el sidebar ahora. Solo redirige al index.
  const logoutButtons = document.querySelectorAll('#logout');
  logoutButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.location.href = '../index.html';
    });
  });
});

