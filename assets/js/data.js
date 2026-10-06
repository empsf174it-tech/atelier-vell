// data.js - Shared Data Module for Atelier Vell

const defaultProducts = [
  {
    id: 'p1',
    name: 'The Minimalist Tote',
    category: 'totes',
    price: 495,
    material: 'Italian Calf Leather',
    colors: ['Black', 'Tan', 'Olive'],
    sizes: ['Standard'],
    description: 'A structural masterpiece designed for the modern professional. Spacious enough for a 15" laptop, yet refined enough for evening wear.',
    image: 'https://images.unsplash.com/photo-1608060434411-0c3fa9049e7b?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 124,
    inStock: 15,
    featured: true,
    status: 'active'
  },
  {
    id: 'p2',
    name: 'Equestrian Crossbody',
    category: 'crossbody',
    price: 385,
    material: 'Saddle Leather',
    colors: ['Cognac', 'Black'],
    sizes: ['Small', 'Medium'],
    description: 'Inspired by vintage saddle bags, featuring bespoke brass hardware and an adjustable strap for versatile styling.',
    image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 89,
    inStock: 8,
    featured: true,
    status: 'active'
  },
  {
    id: 'p3',
    name: 'Structured Clutch',
    category: 'clutches',
    price: 250,
    material: 'Textured Saffiano',
    colors: ['Cream', 'Black', 'Burgundy'],
    sizes: ['Standard'],
    description: 'An elegant evening companion. Sleek lines and a discreet magnetic closure ensure your essentials are secure.',
    image: 'https://images.unsplash.com/photo-1563904092230-7ec217b65fe2?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 45,
    inStock: 22,
    featured: false,
    status: 'active'
  },
  {
    id: 'p4',
    name: 'City Backpack',
    category: 'backpacks',
    price: 520,
    material: 'Pebbled Leather',
    colors: ['Black', 'Navy'],
    sizes: ['Standard'],
    description: 'Hands-free luxury. Features multiple compartments and padded straps for all-day urban exploration.',
    image: 'https://images.unsplash.com/photo-1622560481979-f5b0174242a0?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 67,
    inStock: 0,
    featured: true,
    status: 'active'
  },
  {
    id: 'p5',
    name: 'Soft Volume Tote',
    category: 'totes',
    price: 410,
    material: 'Supple Nappa Leather',
    colors: ['Taupe', 'Black'],
    sizes: ['Large'],
    description: 'Effortlessly chic with a slouchy silhouette. Unlined interior showcases the premium quality of the leather.',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 32,
    inStock: 12,
    featured: false,
    status: 'active'
  },
  {
    id: 'p6',
    name: 'Envelope Crossbody',
    category: 'crossbody',
    price: 310,
    material: 'Smooth Leather',
    colors: ['Red', 'Black', 'Bone'],
    sizes: ['Small'],
    description: 'Compact and striking. The geometric flap design adds a modern edge to any outfit.',
    image: 'https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 110,
    inStock: 5,
    featured: false,
    status: 'active'
  }
];

const defaultOrders = [
  { id: 'ORD-482913', date: '2026-10-04T14:22:00.000Z', user: 'eleanor.hart@example.com', items: [{ id: 'p1', quantity: 1, color: 'Black', size: 'Standard' }], total: 534.60, status: 'pending' },
  { id: 'ORD-471058', date: '2026-10-03T09:10:00.000Z', user: 'marco.bellini@example.com', items: [{ id: 'p2', quantity: 1, color: 'Cognac', size: 'Medium' }, { id: 'p3', quantity: 1, color: 'Cream', size: 'Standard' }], total: 685.80, status: 'processing' },
  { id: 'ORD-465327', date: '2026-10-01T18:45:00.000Z', user: 'sofia.laurent@example.com', items: [{ id: 'p6', quantity: 1, color: 'Bone', size: 'Small' }], total: 334.80, status: 'shipped' },
  { id: 'ORD-458804', date: '2026-09-29T11:05:00.000Z', user: 'james.okafor@example.com', items: [{ id: 'p5', quantity: 1, color: 'Taupe', size: 'Large' }], total: 442.80, status: 'shipped' },
  { id: 'ORD-449126', date: '2026-09-27T16:30:00.000Z', user: 'amelia.chen@example.com', items: [{ id: 'p3', quantity: 2, color: 'Black', size: 'Standard' }], total: 540.00, status: 'processing' },
  { id: 'ORD-437790', date: '2026-09-24T08:15:00.000Z', user: 'lucas.moreau@example.com', items: [{ id: 'p1', quantity: 1, color: 'Tan', size: 'Standard' }, { id: 'p6', quantity: 1, color: 'Red', size: 'Small' }], total: 869.40, status: 'shipped' }
];

class Store {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem('atelier_products')) {
      localStorage.setItem('atelier_products', JSON.stringify(defaultProducts));
    } else {
      // Swap retired default photos in previously saved products
      const retired = ['1584916201218', '1590874103328', '1566150905458', '1622560480654', '1548036328'];
      const products = JSON.parse(localStorage.getItem('atelier_products'));
      let changed = false;
      products.forEach(p => {
        const fresh = defaultProducts.find(d => d.id === p.id);
        if (fresh && retired.some(id => (p.image || '').includes(id))) {
          p.image = fresh.image;
          changed = true;
        }
      });
      if (changed) localStorage.setItem('atelier_products', JSON.stringify(products));
    }
    const storedOrders = JSON.parse(localStorage.getItem('atelier_orders') || '[]');
    if (storedOrders.length === 0) {
      localStorage.setItem('atelier_orders', JSON.stringify(defaultOrders));
    }
    if (!localStorage.getItem('atelier_cart')) {
      localStorage.setItem('atelier_cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('atelier_wishlist')) {
      localStorage.setItem('atelier_wishlist', JSON.stringify([]));
    }
  }

  getProducts() {
    return JSON.parse(localStorage.getItem('atelier_products'));
  }

  saveProducts(products) {
    localStorage.setItem('atelier_products', JSON.stringify(products));
  }

  getProduct(id) {
    return this.getProducts().find(p => p.id === id);
  }

  getOrders() {
    return JSON.parse(localStorage.getItem('atelier_orders'));
  }

  saveOrders(orders) {
    localStorage.setItem('atelier_orders', JSON.stringify(orders));
  }

  getCart() {
    return JSON.parse(localStorage.getItem('atelier_cart'));
  }

  saveCart(cart) {
    localStorage.setItem('atelier_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  getWishlist() {
    return JSON.parse(localStorage.getItem('atelier_wishlist'));
  }

  saveWishlist(wishlist) {
    localStorage.setItem('atelier_wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));
  }

  resetDemoData() {
    localStorage.setItem('atelier_products', JSON.stringify(defaultProducts));
    localStorage.setItem('atelier_orders', JSON.stringify(defaultOrders));
    localStorage.setItem('atelier_cart', JSON.stringify([]));
    localStorage.setItem('atelier_wishlist', JSON.stringify([]));
    window.dispatchEvent(new Event('dataReset'));
  }
}

window.AtelierStore = new Store();

// Lightweight toast notifications (replaces blocking alert dialogs)
window.showToast = function (message, icon = 'ph-check-circle') {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('role', 'status');
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="ph ${icon}"></i><span></span>`;
  toast.querySelector('span').textContent = message;
  stack.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3200);
};
