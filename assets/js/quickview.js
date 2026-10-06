// quickview.js - Quick View Modal

class QuickView {
  constructor() {
    this.initDOM();
  }

  initDOM() {
    if (!document.getElementById('quickview-modal')) {
      const html = `
        <div class="modal" id="quickview-modal">
          <div class="modal-overlay"></div>
          <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="qv-title">
            <button class="modal-close" aria-label="Close modal"><i class="ph ph-x"></i></button>
            <div class="qv-image-col">
              <img id="qv-image" src="" alt="Product Image" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="qv-details-col" style="padding:var(--space-4);">
              <div class="product-badge badge" id="qv-badge" style="margin-bottom:16px;"></div>
              <h2 id="qv-title" style="margin-bottom:8px;"></h2>
              <p id="qv-price" style="font-size:1.25rem; margin-bottom:16px; color:var(--clr-text-light);"></p>
              
              <div style="margin-bottom:24px;">
                <p style="font-size:0.85rem; text-transform:uppercase; margin-bottom:8px; font-weight:500;">Material</p>
                <p id="qv-material" style="color:var(--clr-text-light); font-size:0.9rem;"></p>
              </div>

              <div style="margin-bottom:24px;">
                <p style="font-size:0.85rem; text-transform:uppercase; margin-bottom:8px; font-weight:500;">Colors</p>
                <div id="qv-colors" style="display:flex; gap:8px;"></div>
              </div>

              <p id="qv-desc" style="font-size:0.95rem; margin-bottom:24px; line-height:1.6;"></p>
              
              <div style="display:flex; gap:16px; margin-bottom:24px;">
                <button id="qv-add-cart" class="btn btn-primary" style="flex:1;">Add to Cart</button>
                <button id="qv-wishlist" class="btn btn-outline btn-wishlist" style="width:48px; padding:0; display:flex; align-items:center; justify-content:center;">
                  <i class="ph ph-heart" style="font-size:1.2rem;"></i>
                </button>
              </div>

              <a id="qv-link" href="#" style="font-size:0.85rem; text-decoration:underline; text-transform:uppercase; letter-spacing:0.05em; font-weight:500;">View Full Details</a>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
    }

    this.modal = document.getElementById('quickview-modal');
    this.closeBtn = this.modal.querySelector('.modal-close');
    this.overlay = this.modal.querySelector('.modal-overlay');
    
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());

    // Focus trap on Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('open')) {
        this.close();
      }
    });
  }

  open(productId) {
    const product = window.AtelierStore.getProduct(productId);
    if (!product) return;

    document.getElementById('qv-image').src = product.image;
    document.getElementById('qv-image').alt = product.name;
    document.getElementById('qv-title').textContent = product.name;
    document.getElementById('qv-price').textContent = '$' + product.price.toFixed(2);
    document.getElementById('qv-material').textContent = product.material;
    document.getElementById('qv-desc').textContent = product.description;
    document.getElementById('qv-link').href = `product-detail.html?id=${product.id}`;
    
    const badge = document.getElementById('qv-badge');
    if (product.inStock <= 0) {
      badge.textContent = 'Out of Stock';
      badge.style.display = 'inline-block';
      badge.style.backgroundColor = 'var(--clr-error)';
    } else if (product.inStock < 5) {
      badge.textContent = 'Low Stock';
      badge.style.display = 'inline-block';
      badge.style.backgroundColor = 'var(--clr-accent)';
    } else {
      badge.style.display = 'none';
    }

    const colorsHtml = product.colors.map(color => `<span style="padding:4px 12px; border:1px solid var(--clr-border); font-size:0.8rem;">${color}</span>`).join('');
    document.getElementById('qv-colors').innerHTML = colorsHtml;

    const addCartBtn = document.getElementById('qv-add-cart');
    if (product.inStock <= 0) {
      addCartBtn.textContent = 'Out of Stock';
      addCartBtn.disabled = true;
      addCartBtn.classList.replace('btn-primary', 'btn-outline');
    } else {
      addCartBtn.textContent = 'Add to Cart';
      addCartBtn.disabled = false;
      addCartBtn.classList.replace('btn-outline', 'btn-primary');
      addCartBtn.onclick = () => {
        let cart = window.AtelierStore.getCart();
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({ id: product.id, quantity: 1, color: product.colors[0], size: product.sizes[0] });
        }
        window.AtelierStore.saveCart(cart);
        this.close();
        showToast('Added to your bag', 'ph-shopping-bag');
      };
    }

    const wishlistBtn = document.getElementById('qv-wishlist');
    wishlistBtn.dataset.id = product.id;
    wishlistBtn.onclick = () => {
      window.AtelierWishlist.toggleItem(product.id);
      this.updateQvWishlistIcon(product.id);
    };
    this.updateQvWishlistIcon(product.id);

    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.closeBtn.focus();
  }

  updateQvWishlistIcon(id) {
    const btn = document.getElementById('qv-wishlist');
    const wishlistIds = window.AtelierStore.getWishlist();
    if (wishlistIds.includes(id)) {
      btn.classList.add('active');
      btn.querySelector('i').className = 'ph-fill ph-heart';
    } else {
      btn.classList.remove('active');
      btn.querySelector('i').className = 'ph ph-heart';
    }
  }

  close() {
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AtelierQuickView = new QuickView();
});

// Helper for generating product cards
function generateProductCardHTML(product) {
  let badgeHtml = '';
  if (product.inStock <= 0) {
    badgeHtml = '<div class="product-badge badge">Sold Out</div>';
  } else if (product.featured) {
    badgeHtml = '<div class="product-badge badge">New Season</div>';
  }

  return `
    <article class="product-card">
      <div class="product-image-wrap">
        ${badgeHtml}
        <button class="btn-wishlist" data-id="${product.id}" aria-label="Toggle wishlist">
          <i class="ph ph-heart"></i>
        </button>
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-actions">
          <button class="btn-quickview" onclick="window.AtelierQuickView.open('${product.id}')">Quick View</button>
        </div>
      </div>
      <p class="product-category">${product.category}</p>
      <div class="product-meta">
        <h3 class="product-title"><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
        <p class="product-price tabular-nums">$${product.price.toLocaleString('en-US')}</p>
      </div>
    </article>
  `;
}
