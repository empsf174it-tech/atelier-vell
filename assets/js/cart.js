// cart.js - Cart & Checkout placeholder

class CartPage {
  constructor() {
    this.cartContainer = document.getElementById('cart-items');
    this.summarySubtotal = document.getElementById('summary-subtotal');
    this.summaryTax = document.getElementById('summary-tax');
    this.summaryTotal = document.getElementById('summary-total');
    this.checkoutForm = document.getElementById('checkout-form');
    this.checkoutSection = document.getElementById('checkout-section');
    this.loginPrompt = document.getElementById('login-prompt');
    
    if (this.cartContainer) {
      this.init();
    }
  }

  init() {
    this.render();
    window.addEventListener('cartUpdated', () => this.render());

    if (this.checkoutForm) {
      this.handleAuthVisibility();
      this.checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
    }
  }

  handleAuthVisibility() {
    const auth = window.AtelierAuth;
    if (auth.currentUser) {
      this.checkoutSection.style.display = 'block';
      this.loginPrompt.style.display = 'none';
      
      // Pre-fill name and email
      document.getElementById('co-name').value = auth.currentUser.name;
      document.getElementById('co-email').value = auth.currentUser.email;
    } else {
      this.checkoutSection.style.display = 'none';
      this.loginPrompt.style.display = 'block';
    }
  }

  updateQuantity(id, change) {
    let cart = window.AtelierStore.getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const product = window.AtelierStore.getProduct(id);
    const newQty = item.quantity + change;

    if (newQty <= 0) {
      cart = cart.filter(i => i.id !== id);
    } else if (newQty > product.inStock) {
      showToast(`Sorry, only ${product.inStock} units available in stock.`, 'ph-info');
      return;
    } else {
      item.quantity = newQty;
    }

    window.AtelierStore.saveCart(cart);
  }

  removeItem(id) {
    let cart = window.AtelierStore.getCart();
    cart = cart.filter(i => i.id !== id);
    window.AtelierStore.saveCart(cart);
  }

  render() {
    const cart = window.AtelierStore.getCart();
    if (cart.length === 0) {
      this.cartContainer.innerHTML = `
        <div style="text-align:center; padding: 60px 20px;">
          <h2 style="margin-bottom:20px;">Your Cart is Empty</h2>
          <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
        </div>
      `;
      if (document.querySelector('.cart-summary-col')) {
          document.querySelector('.cart-summary-col').style.display = 'none';
      }
      return;
    }

    if (document.querySelector('.cart-summary-col')) {
        document.querySelector('.cart-summary-col').style.display = 'block';
    }

    let subtotal = 0;
    const html = cart.map(item => {
      const product = window.AtelierStore.getProduct(item.id);
      if(!product) return '';
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      return `
        <div style="display:grid; grid-template-columns: 100px 1fr auto; gap:24px; padding-bottom:24px; margin-bottom:24px; border-bottom:1px solid var(--clr-border); align-items:center;">
          <img src="${product.image}" alt="${product.name}" style="width:100px; height:120px; object-fit:cover;">
          <div>
            <h3 style="font-size:1.1rem; margin-bottom:8px;">${product.name}</h3>
            <p style="color:var(--clr-text-light); font-size:0.9rem; margin-bottom:4px;">Color: ${item.color} | Size: ${item.size}</p>
            <p style="font-family:var(--font-heading); font-size:1.1rem;" class="tabular-nums">$${product.price.toFixed(2)}</p>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:16px;">
            <div style="display:flex; border:1px solid var(--clr-border); width:100px;">
              <button onclick="window.AtelierCartPage.updateQuantity('${item.id}', -1)" style="flex:1; padding:8px;">-</button>
              <div style="flex:1; display:flex; align-items:center; justify-content:center; border-left:1px solid var(--clr-border); border-right:1px solid var(--clr-border);">${item.quantity}</div>
              <button onclick="window.AtelierCartPage.updateQuantity('${item.id}', 1)" style="flex:1; padding:8px;">+</button>
            </div>
            <button onclick="window.AtelierCartPage.removeItem('${item.id}')" style="color:var(--clr-text-light); text-decoration:underline; font-size:0.85rem;">Remove</button>
            <p class="tabular-nums" style="font-weight:500;">$${itemTotal.toFixed(2)}</p>
          </div>
        </div>
      `;
    }).join('');

    this.cartContainer.innerHTML = html;
    
    // Update summary
    const tax = subtotal * 0.08; // Demo 8% tax
    const total = subtotal + tax;

    this.summarySubtotal.textContent = '$' + subtotal.toFixed(2);
    this.summaryTax.textContent = '$' + tax.toFixed(2);
    this.summaryTotal.textContent = '$' + total.toFixed(2);
  }

  handleCheckout(e) {
    e.preventDefault();
    
    const cart = window.AtelierStore.getCart();
    if (cart.length === 0) return;

    // Validate form basic
    if(!this.checkoutForm.checkValidity()) {
        this.checkoutForm.reportValidity();
        return;
    }

    const orderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    let subtotal = 0;
    cart.forEach(item => {
      const p = window.AtelierStore.getProduct(item.id);
      subtotal += p.price * item.quantity;
    });

    const newOrder = {
      id: orderNum,
      date: new Date().toISOString(),
      user: window.AtelierAuth.currentUser.email,
      items: [...cart],
      total: subtotal * 1.08,
      status: 'pending'
    };

    // Save order
    const orders = window.AtelierStore.getOrders();
    orders.push(newOrder);
    window.AtelierStore.saveOrders(orders);

    // Decrement stock
    const products = window.AtelierStore.getProducts();
    cart.forEach(item => {
      const p = products.find(prod => prod.id === item.id);
      if (p) {
        p.inStock = Math.max(0, p.inStock - item.quantity);
      }
    });
    window.AtelierStore.saveProducts(products);

    // Clear cart
    window.AtelierStore.saveCart([]);

    // Show success inline
    const pageContainer = document.querySelector('.container.section');
    pageContainer.innerHTML = `
      <div style="text-align:center; max-width:600px; margin: 60px auto; padding:60px 20px; background:var(--clr-white); border:1px solid var(--clr-border);">
        <i class="ph ph-check-circle" style="font-size:4rem; color:var(--clr-success); margin-bottom:24px; display:block;"></i>
        <h2 style="margin-bottom:16px;">Order Confirmed</h2>
        <p style="margin-bottom:8px;">Thank you for your purchase.</p>
        <p style="color:var(--clr-text-light); margin-bottom:32px;">Your demo order number is <strong>${orderNum}</strong></p>
        <a href="shop.html" class="btn btn-primary">Return to Shop</a>
      </div>
    `;
    window.scrollTo(0, 0);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AtelierCartPage = new CartPage();
});
