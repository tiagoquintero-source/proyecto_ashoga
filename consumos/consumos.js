document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('consumo-form');
  const lista = document.getElementById('consumos-list');
  const productosList = document.getElementById('productos-list');
  const hotelInput = document.getElementById('hotel');
  const areaInput = document.getElementById('area');
  const notaInput = document.getElementById('nota');
  const filtroFecha = document.getElementById('filtro-fecha');
  const filtroArea = document.getElementById('filtro-area');
  const filtroProducto = document.getElementById('filtro-producto');

  // Simulación de productos frecuentes
  const productosFrecuentes = [
    "Agua mineral", "Jabón", "Shampoo", "Toalla", "Café", "Azúcar", "Detergente", "Papel higiénico", "Sábanas", "Desinfectante"
  ];
  productosFrecuentes.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    productosList.appendChild(opt);
  });

  // Cargar consumos guardados
  let consumos = JSON.parse(localStorage.getItem('hotel_consumos') || '[]');

  // Filtros
  function filtrar(consumos) {
    let res = consumos;
    if (filtroFecha && filtroFecha.value) {
      res = res.filter(c => c.fecha === filtroFecha.value);
    }
    if (filtroArea && filtroArea.value) {
      res = res.filter(c => c.area === filtroArea.value);
    }
    if (filtroProducto && filtroProducto.value) {
      res = res.filter(c => c.producto.toLowerCase().includes(filtroProducto.value.toLowerCase()));
    }
    return res;
  }

  function render() {
    lista.innerHTML = '';
    if (consumos.length === 0) {
      lista.innerHTML = '<li>No hay consumos registrados.</li>';
      return;
    }
    const consumosFiltrados = filtrar(consumos);
    consumosFiltrados.slice(-30).reverse().forEach((c, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <strong>${c.producto}</strong> <span style="color:#2563eb;">(${c.cantidad})</span>
          <span style="font-size:13px;color:#64748b;">${c.area} | ${c.fecha}</span>
        </div>
        <div style="font-size:13px;color:#64748b;">
          ${c.nota ? '📝 ' + c.nota : ''}
          <span style="float:right;font-weight:600;">${c.hotel}</span>
        </div>
        <button class="btn-delete" data-index="${index}">Eliminar</button>
      `;
      lista.appendChild(li);
    });

    // Agregar eventos para eliminar consumos
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'), 10);
        consumos.splice(index, 1);
        localStorage.setItem('hotel_consumos', JSON.stringify(consumos));
        render();
      });
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const producto = document.getElementById('producto').value.trim();
      const cantidad = parseInt(document.getElementById('cantidad').value, 10);
      const fecha = document.getElementById('fecha').value;
      const area = areaInput.value;
      const nota = notaInput.value.trim();
      const hotel = hotelInput.value;
      if (!producto || !cantidad || !fecha || !area || !hotel) {
        alert("Completa todos los campos obligatorios.");
        return;
      }

      // Agregar el nuevo consumo
      consumos.push({ producto, cantidad, fecha, area, nota, hotel });
      localStorage.setItem('hotel_consumos', JSON.stringify(consumos));
      form.reset();
      render(); // Renderiza la lista después de agregar un consumo
    });
  }

  [filtroFecha, filtroArea, filtroProducto].forEach(f => {
    if (f) f.addEventListener('input', render);
  });

  render(); // Renderiza la lista al cargar la página
});
      

      consumos.push({ producto, cantidad, fecha, area, nota, hotel });
      localStorage.setItem('hotel_consumos', JSON.stringify(consumos));
      const hotelActual = hotelInput.value;
      form.reset();
      // Restaurar el valor del hotel solo si no es SuperAdmin
      if (!isSuperAdmin) {
        hotelInput.value = userHotel;
        hotelInput.setAttribute("readonly", "readonly");
      } else {
        hotelInput.value = hotelActual;
        hotelInput.removeAttribute("readonly");
      }
      render();
    ;
  

  [filtroFecha, filtroArea, filtroProducto].forEach(f => {
    if (f) f.addEventListener('input', render);
  });

  render();
;
