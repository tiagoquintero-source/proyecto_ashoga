// Marcar enlace activo en el sidebar
document.addEventListener('DOMContentLoaded', function () {
  try {
    var links = document.querySelectorAll('.nav-link');
    links.forEach(function (a) {
      // Normalizar rutas para comparar
      var href = a.getAttribute('href');
      var current = window.location.pathname.split('/').pop();
      if (href === current || href === './' + current) {
        a.classList.add('active');
      }
    });

    // Logout simple: si el botón existe, podemos redirigir a login
    var btn = document.getElementById('logout');
    if (btn) {
      btn.addEventListener('click', function () {
        // Aquí podrían añadirse acciones de cierre de sesión
        window.location.href = '../inicio_sesion/login.html';
      });
    }
  } catch (e) {
    console.error('Error inicializando inventario.js', e);
  }
  // Modal: abrir/cerrar
  try {
    var modalBackdrop = document.getElementById('modal-backdrop');
    var btnOpen = document.getElementById('cargar-producto');
    var btnClose = document.getElementById('modal-close');
    var btnCancel = document.getElementById('modal-cancel');
    var btnAdd = document.getElementById('modal-add');

    function openModal() {
      if (modalBackdrop) {
        modalBackdrop.classList.remove('hidden');
        modalBackdrop.setAttribute('aria-hidden', 'false');
      }
    }

    function closeModal() {
      if (modalBackdrop) {
        modalBackdrop.classList.add('hidden');
        modalBackdrop.setAttribute('aria-hidden', 'true');
      }
    }

    if (btnOpen) btnOpen.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', function (e) { e.preventDefault(); closeModal(); });
    if (btnAdd) btnAdd.addEventListener('click', function (e) { e.preventDefault(); /* Aquí se añadirá la lógica para guardar */ closeModal(); });
    // cerrar al pulsar ESC
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeModal(); });
  } catch (e) {
    console.error('Error inicializando modal', e);
  }
});
