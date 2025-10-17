document.addEventListener('DOMContentLoaded', function () {
  const cart = [];
  const cartItems = document.getElementById('cart-items');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const searchResults = document.getElementById('search-results');
  const productQuery = document.getElementById('product-query');
  const searchBtn = document.getElementById('search-btn');
  const submitOrderBtn = document.getElementById('submit-order');
  const orderNotes = document.getElementById('order-notes');
  const incomingOrdersList = document.getElementById('incoming-orders-list');

  searchBtn.addEventListener('click', function () {
    const query = productQuery.value.trim();
    if (!query) return;
    searchResults.innerHTML = `<p>Resultados para "${query}":</p><ul><li>Producto 1</li><li>Producto 2</li></ul>`;
  });

  function updateCart() {
    cartItems.innerHTML = cart.map(item => `<li>${item.name} x${item.qty}</li>`).join('');
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartSubtotal.textContent = `Subtotal: $${subtotal}`;
  }

  submitOrderBtn.addEventListener('click', function () {
    const notes = orderNotes.value.trim();
    if (cart.length === 0) return alert('El carrito está vacío.');
    const order = { id: Date.now(), items: cart, notes, status: 'sent' };
    console.log('Order sent:', order);
    alert('Pedido enviado.');
    cart.length = 0;
    updateCart();
  });

  function handleIncomingOrder(order) {
    const li = document.createElement('li');
    li.textContent = `Pedido #${order.id} - ${order.status}`;
    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Aceptar';
    acceptBtn.addEventListener('click', () => alert(`Pedido #${order.id} aceptado.`));
    const prepareBtn = document.createElement('button');
    prepareBtn.textContent = 'Preparar';
    prepareBtn.addEventListener('click', () => alert(`Pedido #${order.id} en preparación.`));
    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Marcar Enviado';
    sendBtn.addEventListener('click', () => alert(`Pedido #${order.id} marcado como enviado.`));
    li.appendChild(acceptBtn);
    li.appendChild(prepareBtn);
    li.appendChild(sendBtn);
    incomingOrdersList.appendChild(li);
  }

  handleIncomingOrder({ id: 1, status: 'pending' });
  handleIncomingOrder({ id: 2, status: 'pending' });
});
