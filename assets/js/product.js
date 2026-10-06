// product.js - Product Detail Page Rendering

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const product = window.AtelierStore.getProduct(id);

  if (!product) {
    document.querySelector('main').innerHTML = '<div style="text-align:center; padding:100px;"><h2>Product not found.</h2><a href="shop.html">Return to Shop</a></div>';
    return;
  }

  // Update Meta
  document.title = `${product.name} | Atelier Vell`;
  
  // Render Data
  document.getElementById('pd-image').src = product.image;
  document.getElementById('pd-image').alt = product.name;
  document.getElementById('pd-title').textContent = product.name;
  document.getElementById('pd-price').textContent = '$' + product.price.toFixed(2);
  document.getElementById('pd-desc').textContent = product.description;
  document.getElementById('pd-material').textContent = product.material;
  
  // Rating logic
  const ratingEl = document.getElementById('pd-rating');
  ratingEl.innerHTML = `★ ${product.rating} <span style="color:var(--clr-text-light); font-size:0.9rem;">(${product.reviewsCount} reviews)</span>`;
  
  // Dimensions mock
  document.getElementById('pd-dimensions').innerHTML = `
    <li>Width: 12"</li>
    <li>Height: 9"</li>
    <li>Depth: 5"</li>
    <li>Strap Drop: 18-22"</li>
  `;

  // Swatches
  const colorsHtml = product.colors.map((c, i) => `
    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
      <input type="radio" name="pd-color" value="${c}" ${i === 0 ? 'checked' : ''}> ${c}
    </label>
  `).join('');
  document.getElementById('pd-colors').innerHTML = colorsHtml;

  // Stock
  const addBtn = document.getElementById('pd-add-cart');
  const stockInfo = document.getElementById('pd-stock');
  if (product.inStock <= 0) {
    addBtn.textContent = 'Out of Stock';
    addBtn.disabled = true;
    addBtn.classList.replace('btn-primary', 'btn-outline');
    stockInfo.textContent = 'Currently unavailable';
    stockInfo.style.color = 'var(--clr-error)';
  } else {
    stockInfo.textContent = 'In Stock';
    stockInfo.style.color = 'var(--clr-success)';
  }

  // Actions
  addBtn.addEventListener('click', () => {
    let cart = window.AtelierStore.getCart();
    const existing = cart.find(item => item.id === product.id);
    const selectedColor = document.querySelector('input[name="pd-color"]:checked').value;
    
    if (existing) {
      if(existing.quantity < product.inStock) {
        existing.quantity += 1;
      } else {
        showToast('Maximum stock reached', 'ph-info');
        return;
      }
    } else {
      cart.push({ id: product.id, quantity: 1, color: selectedColor, size: product.sizes[0] });
    }
    window.AtelierStore.saveCart(cart);
    showToast('Added to your bag', 'ph-shopping-bag');
  });

  const wishlistBtn = document.getElementById('pd-wishlist');
  wishlistBtn.addEventListener('click', () => {
    window.AtelierWishlist.toggleItem(product.id);
    updateHeart();
  });

  const updateHeart = () => {
    const wishlistIds = window.AtelierStore.getWishlist();
    if (wishlistIds.includes(product.id)) {
      wishlistBtn.innerHTML = '<i class="ph-fill ph-heart"></i> Remove from Wishlist';
      wishlistBtn.style.color = 'var(--clr-error)';
    } else {
      wishlistBtn.innerHTML = '<i class="ph ph-heart"></i> Add to Wishlist';
      wishlistBtn.style.color = 'inherit';
    }
  };
  updateHeart();

  // JSON-LD injection
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.inStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewsCount
    }
  });
  document.head.appendChild(script);

});
