// admin.js - Admin Dashboard Logic

class AdminDashboard {
  constructor() {
    this.productsTable = document.querySelector('#products-table tbody');
    this.ordersTable = document.querySelector('#orders-table tbody');
    this.customersTable = document.querySelector('#customers-table tbody');
    this.productModal = document.getElementById('admin-product-modal');
    this.productForm = document.getElementById('admin-product-form');
    
    this.init();
  }

  init() {
    this.bindTabs();
    this.renderProducts();
    this.renderOrders();
    this.renderCustomers();
    this.bindForm();
    
    // Close modal bindings
    this.productModal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    this.productModal.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());

    window.addEventListener('dataReset', () => {
      this.renderProducts();
      this.renderOrders();
      this.renderCustomers();
      showToast('Demo data reset successfully.');
    });
  }

  bindTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.style.background = 'transparent'; });
        contents.forEach(c => c.style.display = 'none');
        
        tab.classList.add('active');
        tab.style.background = 'var(--clr-secondary)';
        document.getElementById(`tab-${tab.dataset.tab}`).style.display = 'block';
      });
    });
  }

  renderProducts() {
    const products = window.AtelierStore.getProducts();
    let html = '';
    
    if(products.length === 0) {
      html = '<tr class="empty-row"><td colspan="7" style="text-align:center;">No products found</td></tr>';
    } else {
      html = products.map(p => {
        let stockBadge = `<span class="badge" style="background:var(--clr-success);">${p.inStock}<span class="m-only"> in stock</span></span>`;
        if (p.inStock <= 0) stockBadge = `<span class="badge" style="background:var(--clr-error);">Out</span>`;
        else if (p.inStock < 5) stockBadge = `<span class="badge" style="background:var(--clr-accent);">${p.inStock} <span class="m-only">left</span><span class="d-only">(Low)</span></span>`;

        return `
          <tr class="product-row">
            <td class="td-img"><img src="${p.image}" alt="" class="table-thumb"></td>
            <td class="td-name"><strong>${p.name}</strong></td>
            <td class="td-cat" style="text-transform:capitalize;">${p.category}</td>
            <td class="td-price tabular-nums">$${p.price.toFixed(2)}</td>
            <td class="td-stock">${stockBadge}</td>
            <td class="td-status"><span class="badge ${p.status === 'active' ? '' : 'badge-outline'}">${p.status}</span></td>
            <td class="td-actions">
              <div class="row-actions">
                <button class="row-action" onclick="window.AtelierAdmin.editProduct('${p.id}')" aria-label="Edit ${p.name}"><i class="ph ph-pencil-simple"></i><span>Edit</span></button>
                <button class="row-action danger" onclick="window.AtelierAdmin.deleteProduct('${p.id}')" aria-label="Delete ${p.name}"><i class="ph ph-trash"></i><span>Delete</span></button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
    this.productsTable.innerHTML = html;
    this.renderWelcome();
  }

  renderOrders() {
    const orders = window.AtelierStore.getOrders();
    let html = '';

    if (orders.length === 0) {
      html = '<tr class="empty-row"><td colspan="6" style="text-align:center;">No orders found</td></tr>';
    } else {
      html = orders.map(o => `
        <tr>
          <td data-label="Order"><strong>${o.id}</strong></td>
          <td data-label="Date" class="tabular-nums">${new Date(o.date).toLocaleDateString()}</td>
          <td data-label="Customer">${o.user}</td>
          <td data-label="Total" class="tabular-nums">$${o.total.toFixed(2)}</td>
          <td data-label="Status">
            <select class="status-select" onchange="window.AtelierAdmin.updateOrderStatus('${o.id}', this.value)">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            </select>
          </td>
          <td data-label="Details">
             <button class="row-action" onclick="showToast('Order details\\nItems: ${o.items.length}\\nTotal: $${o.total.toFixed(2)}')" ><i class="ph ph-eye"></i><span>View</span></button>
          </td>
        </tr>
      `).join('');
    }
    this.ordersTable.innerHTML = html;
    this.renderWelcome();
  }

  renderWelcome() {
    const products = window.AtelierStore.getProducts();
    const orders = window.AtelierStore.getOrders();
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const user = window.AtelierAuth && window.AtelierAuth.currentUser;
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);

    document.getElementById('welcome-greeting').textContent = greeting;
    document.getElementById('welcome-name').textContent = user ? user.name : 'Admin';
    document.getElementById('welcome-date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('ws-products').textContent = products.length;
    document.getElementById('ws-orders').textContent = orders.length;
    document.getElementById('ws-revenue').textContent = '$' + Math.round(revenue).toLocaleString('en-US');
    document.getElementById('ws-attention').textContent = products.filter(p => p.inStock < 5).length;
  }

  renderCustomers() {
    // Customers are derived from orders, grouped by email
    const customers = {};
    window.AtelierStore.getOrders().forEach(o => {
      const c = customers[o.user] || (customers[o.user] = { email: o.user, orders: 0, spent: 0, last: o.date });
      c.orders += 1;
      c.spent += o.total;
      if (new Date(o.date) > new Date(c.last)) c.last = o.date;
    });
    const list = Object.values(customers).sort((a, b) => b.spent - a.spent);

    if (list.length === 0) {
      this.customersTable.innerHTML = '<tr class="empty-row"><td colspan="4" style="text-align:center;">No customers yet</td></tr>';
      return;
    }

    this.customersTable.innerHTML = list.map(c => `
      <tr>
        <td data-label="Customer"><strong>${c.email}</strong></td>
        <td data-label="Orders" class="tabular-nums">${c.orders}</td>
        <td data-label="Total Spent" class="tabular-nums">$${c.spent.toFixed(2)}</td>
        <td data-label="Last Order" class="tabular-nums">${new Date(c.last).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  openProductModal(product = null) {
    if (product) {
      document.getElementById('modal-title').textContent = 'Edit Product';
      document.getElementById('p-id').value = product.id;
      document.getElementById('p-name').value = product.name;
      document.getElementById('p-category').value = product.category;
      document.getElementById('p-price').value = product.price;
      document.getElementById('p-stock').value = product.inStock;
      document.getElementById('p-status').value = product.status;
    } else {
      document.getElementById('modal-title').textContent = 'Add Product';
      this.productForm.reset();
      document.getElementById('p-id').value = '';
    }
    this.productModal.classList.add('open');
  }

  closeModal() {
    this.productModal.classList.remove('open');
  }

  bindForm() {
    this.productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('p-id').value;
      const products = window.AtelierStore.getProducts();

      const newProduct = {
        name: document.getElementById('p-name').value,
        category: document.getElementById('p-category').value,
        price: parseFloat(document.getElementById('p-price').value),
        inStock: parseInt(document.getElementById('p-stock').value),
        status: document.getElementById('p-status').value,
      };

      if (id) {
        const index = products.findIndex(p => p.id === id);
        products[index] = { ...products[index], ...newProduct };
      } else {
        const newId = 'p' + Date.now();
        products.push({
          ...newProduct,
          id: newId,
          image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800', // Default dummy
          description: 'New product description.',
          colors: ['Black'],
          sizes: ['Standard'],
          rating: 0,
          reviewsCount: 0,
          featured: false
        });
      }

      window.AtelierStore.saveProducts(products);
      this.renderProducts();
      this.closeModal();
    });
  }

  editProduct(id) {
    const p = window.AtelierStore.getProduct(id);
    if(p) this.openProductModal(p);
  }

  deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      let products = window.AtelierStore.getProducts();
      products = products.filter(p => p.id !== id);
      window.AtelierStore.saveProducts(products);
      this.renderProducts();
    }
  }

  updateOrderStatus(id, status) {
    const orders = window.AtelierStore.getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      window.AtelierStore.saveOrders(orders);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AtelierAdmin = new AdminDashboard();
});
