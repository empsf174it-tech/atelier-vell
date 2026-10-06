// main.js - Core functionality

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Drawer Toggle
  const hamburger = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerClose = document.querySelector('.drawer-close');
  const overlay = document.querySelector('.drawer-overlay');

  if (hamburger && drawer && overlay) {
    const openDrawer = () => {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
  }

  // Mobile Accordion Dropdowns
  const mobileToggles = document.querySelectorAll('.mobile-dropdown-toggle');
  mobileToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const menu = toggle.nextElementSibling;
      const icon = toggle.querySelector('i');
      menu.classList.toggle('open');
      icon.classList.toggle('ph-caret-down');
      icon.classList.toggle('ph-caret-up');
    });
  });

  // Cart Count Badge
  const updateCartCount = () => {
    const cart = window.AtelierStore.getCart();
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  };

  window.addEventListener('cartUpdated', updateCartCount);
  updateCartCount(); // Init
});

// ---------------------------------------------------------------------------
// Motion & polish: header scroll state, scroll reveals, light parallax
// ---------------------------------------------------------------------------
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;

  // Observe reveal targets (also used for JS-rendered product cards)
  window.AtelierReveal = (root = document) => {
    const targets = root.querySelectorAll('.reveal:not(.in-view), .reveal-img:not(.in-view), .product-card:not(.reveal)');
    targets.forEach((el, i) => {
      if (el.classList.contains('product-card')) {
        el.classList.add('reveal');
        el.style.setProperty('--d', `${(i % 4) * 0.08}s`);
      }
      if (!revealObserver || reduceMotion) {
        el.classList.add('in-view');
      } else {
        revealObserver.observe(el);
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const parallaxEls = reduceMotion ? [] : [...document.querySelectorAll('[data-parallax]')];
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 40);
      parallaxEls.forEach(el => {
        const rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translate3d(0, ${(-rect.top) * speed}px, 0)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
    onScroll();

    window.AtelierReveal();

    // Product grids rendered later by page scripts
    document.querySelectorAll('.product-grid').forEach(grid => {
      new MutationObserver(() => window.AtelierReveal(grid)).observe(grid, { childList: true });
    });
  });
})();

// ---------------------------------------------------------------------------
// Floating bag icons around text-only page heroes
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const heroes = document.querySelectorAll('.page-hero-plain, [data-floating]');
  if (!heroes.length) return;

  const icons = ['ph-handbag', 'ph-tote-simple', 'ph-backpack', 'ph-bag-simple'];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  heroes.forEach(hero => {
    hero.classList.add('has-floaters');
    const layer = document.createElement('div');
    layer.className = 'hero-floaters';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = [0, 1, 2, 3].map(i => `
      <figure class="float-card float-card-${i + 1}" data-depth="${[14, 24, 18, 28][i]}">
        <span class="float-icon"><i class="ph-thin ${icons[i]}"></i></span>
      </figure>`).join('') + '<span class="float-glow"></span>';
    hero.prepend(layer);

    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

    // Subtle depth on pointer move, layered over the CSS float
    const cards = layer.querySelectorAll('[data-depth]');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach(el => {
        const d = parseFloat(el.dataset.depth);
        el.style.translate = `${-x * d}px ${-y * d}px`;
      });
    });
    hero.addEventListener('pointerleave', () => {
      cards.forEach(el => { el.style.translate = '0px 0px'; });
    });
  });
});
