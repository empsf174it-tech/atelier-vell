// wishlist.js - Wishlist Slide-over Drawer

class Wishlist {
  constructor() {
    this.initDOM();
    this.bindEvents();
    this.render();
  }

  initDOM() {
    // Inject Drawer HTML if not present
    if (!document.getElementById('wishlist-drawer')) {
      const html = `
        <div class="drawer-overlay wishlist-overlay"></div>
        <div class="mobile-drawer wishlist-drawer" id="wishlist-drawer" style="right:-100%; max-width:400px; z-index:2000;">
          <div class="drawer-header">
            <h3 style="margin:0; font-size:1.25rem;">Your Wishlist</h3>
            <button class="drawer-close wishlist-close"><i class="ph ph-x"></i></button>
          </div>
          <div class="drawer-body" id="wishlist-items-container">
            <!-- Items rendered here -->
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
    }

    this.drawer = document.getElementById('wishlist-drawer');
    this.overlay = document.querySelector('.wishlist-overlay');
    this.container = document.getElementById('wishlist-items-container');
  }

  bindEvents() {
    // Open triggers
    document.querySelectorAll('.trigger-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Close triggers
    document.querySelector('.wishlist-close').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());

    // Listen for updates
    window.addEventListener('wishlistUpdated', () => this.render());
  }

  open() {
    this.render();
    this.drawer.style.right = '0';
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.drawer.style.right = '-100%';
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleItem(productId) {
    let wishlist = window.AtelierStore.getWishlist();
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }
    window.AtelierStore.saveWishlist(wishlist);
    this.updateHeartIcons();
  }

  moveToCart(productId) {
    const product = window.AtelierStore.getProduct(productId);
    if (!product || product.inStock <= 0) {
        showToast('This piece is currently out of stock', 'ph-info');
        return;
    }

    let cart = window.AtelierStore.getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      if (existing.quantity < product.inStock) {
        existing.quantity += 1;
      } else {
        showToast('Maximum stock reached', 'ph-info');
        return;
      }
    } else {
      cart.push({ id: productId, quantity: 1, color: product.colors[0], size: product.sizes[0] });
    }
    window.AtelierStore.saveCart(cart);
    this.toggleItem(productId); // Remove from wishlist
    
    // Optionally open cart or show toast
    showToast('Added to your bag', 'ph-shopping-bag');
  }

  render() {
    const wishlistIds = window.AtelierStore.getWishlist();
    if (wishlistIds.length === 0) {
      this.container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px;">
          <i class="ph ph-heart" style="font-size:3rem; color:var(--clr-border); margin-bottom:16px; display:block;"></i>
          <p>Your wishlist is empty.</p>
          <button onclick="window.location.href='shop.html'" class="btn btn-outline" style="margin-top:20px;">Explore Shop</button>
        </div>
      `;
      this.updateHeartIcons();
      return;
    }

    const html = wishlistIds.map(id => {
      const product = window.AtelierStore.getProduct(id);
      if(!product) return '';
      return `
        <div style="display:flex; gap:16px; margin-bottom:24px; border-bottom:1px solid var(--clr-border); padding-bottom:16px;">
          <img src="${product.image}" alt="${product.name}" style="width:80px; height:100px; object-fit:cover;">
          <div style="flex:1;">
            <h4 style="font-size:1rem; margin-bottom:4px; font-family:var(--font-heading);">${product.name}</h4>
            <p style="font-size:0.9rem; color:var(--clr-text-light); margin-bottom:8px;">$${product.price.toFixed(2)}</p>
            <div style="display:flex; gap:8px;">
              <button onclick="window.AtelierWishlist.moveToCart('${product.id}')" class="btn btn-primary" style="padding:6px 12px; font-size:0.75rem; min-height:auto;">Add to Cart</button>
              <button onclick="window.AtelierWishlist.toggleItem('${product.id}')" style="color:var(--clr-text-light); text-decoration:underline; font-size:0.8rem;">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = html;
    this.updateHeartIcons();
  }

  updateHeartIcons() {
    const wishlistIds = window.AtelierStore.getWishlist();
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
      const id = btn.dataset.id;
      if (wishlistIds.includes(id)) {
        btn.classList.add('active');
        btn.querySelector('i').className = 'ph-fill ph-heart';
      } else {
        btn.classList.remove('active');
        btn.querySelector('i').className = 'ph ph-heart';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AtelierWishlist = new Wishlist();
});
