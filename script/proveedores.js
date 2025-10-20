document.addEventListener('DOMContentLoaded', function () {
  // Elementos
  const compraForm = document.getElementById('compra-form');
  const fechaInput = document.getElementById('fecha_hora');
  const responsableInput = document.getElementById('responsable');
  const itemsContainer = document.getElementById('items-container');
  const addItemBtn = document.getElementById('add-item');
  const purchasesListEl = document.getElementById('purchases-list');
  const productosDatalist = document.getElementById('productos-list');
  const proveedoresDatalist = document.getElementById('proveedores-list');
  const facturaInput = document.getElementById('factura');

  // Filtros
  const fProveedor = document.getElementById('filtro-proveedor');
  const fFecha = document.getElementById('filtro-fecha');
  const fDestino = document.getElementById('filtro-destino');
  const fProducto = document.getElementById('filtro-producto');

  // No persistimos nada por ahora. Usamos estructuras en memoria para la sesión.
  const _memory = {
    inventory: [],
    purchases: [],
    notifications: []
  };
  const readJSON = (k) => Array.isArray(_memory[k]) ? _memory[k] : [];
  const writeJSON = (k, v) => { _memory[k] = Array.isArray(v) ? v : v || []; };

  function getCurrentUser() {
    return { username: 'invitado' };
  }

  // Inicializar fecha y responsable
  fechaInput.value = new Date().toISOString().slice(0,16);
  responsableInput.value = getCurrentUser().username || '';

  // Poblar datalists desde inventory y compras previas
  function populateDatalists() {
    const inventory = readJSON('inventory');
    const products = Array.from(new Set(inventory.map(i => i.name)));
    productosDatalist.innerHTML = products.map(p => `<option value="${p}">`).join('');
    const purchases = readJSON('purchases');
    const providers = Array.from(new Set(purchases.map(p => p.proveedor).filter(Boolean)));
    proveedoresDatalist.innerHTML = providers.map(p => `<option value="${p}">`).join('');
  }

  populateDatalists();

  // Añadir/Eliminar item UI
  function createItemRow(product = '', qty = 1, price = '') {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" class="item-product" placeholder="Producto" list="productos-list" required value="${product}" />
      <input type="number" class="item-qty" placeholder="Cantidad" min="1" required value="${qty}" />
      <input type="number" class="item-price" placeholder="Precio unitario" min="0" step="0.01" required value="${price}" />
      <button type="button" class="btn-small btn-remove-item" title="Eliminar">×</button>
    `;
    row.querySelector('.btn-remove-item').addEventListener('click', () => row.remove());
    return row;
  }

  addItemBtn.addEventListener('click', () => {
    itemsContainer.appendChild(createItemRow('',1,''));
  });

  // Si solo hay una fila, asegurar existente
  if (!itemsContainer.querySelector('.item-row')) itemsContainer.appendChild(createItemRow());

  // Leer archivo a dataURL (si adjuntado)
  function fileToDataURL(file) {
    return new Promise((res, rej) => {
      if (!file) return res(null);
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  // Actualizar inventory según items y destino
  function updateInventoryWithPurchase(items, destino) {
    const inv = readJSON('inventory');
    items.forEach(it => {
      // buscar por nombre y destino
      let found = inv.find(x => x.name.toLowerCase() === it.product.toLowerCase() && (x.location || 'General') === destino);
      if (found) {
        found.stock = (Number(found.stock) || 0) + Number(it.qty);
        found.updatedAt = Date.now();
      } else {
        inv.push({
          id: `i${Date.now()}${Math.floor(Math.random()*999)}`,
          name: it.product,
          stock: Number(it.qty),
          location: destino,
          updatedAt: Date.now()
        });
      }
    });
  writeJSON('inventory', inv);
    // actualizar datalist
    populateDatalists();
    // También actualizar purchases/inventory indicators en menú si corresponde (notificación aparte)
  }

  // Generar comprobante PDF usando jsPDF
  function generatePDF(purchase) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Comprobante de Compra', 14, 20);
      doc.setFontSize(11);
      doc.text(`ID: ${purchase.id}`, 14, 30);
      doc.text(`Proveedor: ${purchase.proveedor || '-'}`, 14, 36);
      doc.text(`Fecha: ${new Date(purchase.fecha_hora).toLocaleString()}`, 14, 42);
      doc.text(`Destino: ${purchase.destino}`, 14, 48);
      doc.text(`Responsable: ${purchase.responsable}`, 14, 54);
      doc.text('Items:', 14, 64);
      let y = 70;
      purchase.items.forEach(it => {
        doc.text(`- ${it.product} x${it.qty} @ ${it.price}`, 16, y);
        y += 6;
      });
      doc.save(`comprobante_${purchase.id}.pdf`);
    } catch (e) {
      console.warn('PDF generation failed', e);
    }
  }

  // Crear notificación simple en memoria (no persistente)
  function pushNotification(message) {
    const notes = readJSON('notifications');
    notes.unshift({ id: `n${Date.now()}`, type: 'purchase', message, time: Date.now() });
    writeJSON('notifications', notes);
    // Nota: no hay persistencia, la notificación existe solo en memoria durante la sesión
  }

  // Guardar compra (async por lectura de archivo)
  compraForm.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const proveedor = document.getElementById('proveedor').value.trim();
    const fecha_hora = document.getElementById('fecha_hora').value;
    const destino = document.getElementById('destino').value;
    const responsable = responsableInput.value || getCurrentUser().username;
    const file = facturaInput.files[0];

    // Leer items
    const rows = Array.from(itemsContainer.querySelectorAll('.item-row'));
    const items = rows.map(r => ({
      product: r.querySelector('.item-product').value.trim(),
      qty: Number(r.querySelector('.item-qty').value),
      price: Number(r.querySelector('.item-price').value)
    })).filter(i => i.product && i.qty > 0);

    if (!items.length) {
      alert('Añada al menos un item válido.');
      return;
    }

    const invoiceData = await fileToDataURL(file);

  const purchases = readJSON('purchases');
    const id = `p${Date.now()}`;
    const purchase = {
      id, proveedor, fecha_hora: fecha_hora || new Date().toISOString(),
      destino, responsable, items, invoiceName: file ? file.name : null,
      invoiceData,
      createdAt: Date.now()
    };
  purchases.unshift(purchase);
  writeJSON('purchases', purchases);

    // Actualizar inventory (suma)
    updateInventoryWithPurchase(items, destino);

    // Generar PDF comprobante y forzar descarga
    generatePDF(purchase);

    // Crear notificación
  pushNotification(`Compra registrada: ${proveedor || 'Proveedor'} (${items.length} items)`);

    // Limpiar formulario pero mantener responsable y fecha actualizada
    compraForm.reset();
    fechaInput.value = new Date().toISOString().slice(0,16);
    responsableInput.value = getCurrentUser().username || '';
    // asegurar al menos una fila items
    itemsContainer.innerHTML = '';
    itemsContainer.appendChild(createItemRow());

    // refrescar listado
    renderPurchases();
  });

  // Render historial con filtros
  function renderPurchases() {
    const all = readJSON('purchases');
    let filtered = all.slice();

    const prov = fProveedor.value.trim().toLowerCase();
    const fecha = fFecha.value;
    const dest = fDestino.value;
    const prod = fProducto.value.trim().toLowerCase();

    if (prov) filtered = filtered.filter(p => (p.proveedor || '').toLowerCase().includes(prov));
    if (fecha) {
      const dayStart = new Date(fecha); dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(fecha); dayEnd.setHours(23,59,59,999);
      filtered = filtered.filter(p => {
        const t = new Date(p.fecha_hora).getTime();
        return t >= dayStart.getTime() && t <= dayEnd.getTime();
      });
    }
    if (dest) filtered = filtered.filter(p => p.destino === dest);
    if (prod) filtered = filtered.filter(p => p.items.some(it => it.product.toLowerCase().includes(prod)));

    purchasesListEl.innerHTML = '';
    if (!filtered.length) {
      purchasesListEl.innerHTML = '<div class="purchase-card"><div class="purchase-left"><div>No hay compras.</div></div></div>';
      return;
    }

    filtered.forEach(p => {
      const div = document.createElement('div');
      div.className = 'purchase-card';
      div.innerHTML = `
        <div class="purchase-left">
          <div><strong>${p.proveedor || 'Proveedor desconocido'}</strong> — ${new Date(p.fecha_hora).toLocaleString()}</div>
          <div class="purchase-meta">Destino: ${p.destino} · Responsable: ${p.responsable}</div>
          <div class="purchase-meta">Items: ${p.items.map(it => `${it.product} x${it.qty}`).join(', ')}</div>
        </div>
        <div class="purchase-right">
          ${p.invoiceName ? `<button class="btn-small btn-download" data-id="${p.id}">Factura</button>` : ''}
          <button class="btn-small btn-download-pdf" data-id="${p.id}">Comprobante</button>
        </div>
      `;
      purchasesListEl.appendChild(div);
    });

    // attach download handlers
    purchasesListEl.querySelectorAll('.btn-download').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const p = readJSON('purchases').find(x => x.id === id);
        if (p && p.invoiceData) {
          const a = document.createElement('a');
          a.href = p.invoiceData;
          a.download = p.invoiceName || `factura_${id}`;
          a.click();
        }
      });
    });
    purchasesListEl.querySelectorAll('.btn-download-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const p = readJSON('purchases').find(x => x.id === id);
        if (p) generatePDF(p);
      });
    });
  }

  // Attach filter events
  [fProveedor, fFecha, fDestino, fProducto].forEach(inp => inp.addEventListener('input', renderPurchases));
  renderPurchases();

  // botón limpiar
  document.getElementById('clear-form').addEventListener('click', () => {
    compraForm.reset();
    fechaInput.value = new Date().toISOString().slice(0,16);
    responsableInput.value = getCurrentUser().username || '';
    itemsContainer.innerHTML = '';
    itemsContainer.appendChild(createItemRow());
  });

  // actualizar datalists despues de cambios frecuentes
  setInterval(populateDatalists, 6000);
});
