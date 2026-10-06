// auth.js - Authentication & Role Guards

class Auth {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('atelier_user')) || null;
    this.demoAdminEmail = 'admin@ateliervell.com';
    this.init();
  }

  init() {
    this.updateNavUI();
    this.checkGuards();
  }

  login(email, password) {
    // Demo only: accept any password
    const role = email === this.demoAdminEmail ? 'admin' : 'user';
    const name = email.split('@')[0];
    
    this.currentUser = { email, name, role };
    localStorage.setItem('atelier_user', JSON.stringify(this.currentUser));
    
    // Merge guest wishlist
    this.mergeWishlist();
    
    window.location.href = role === 'admin' ? 'dashboard.html' : 'index.html';
  }

  register(name, email, password) {
    const role = email === this.demoAdminEmail ? 'admin' : 'user';
    this.currentUser = { email, name, role };
    localStorage.setItem('atelier_user', JSON.stringify(this.currentUser));
    
    this.mergeWishlist();
    window.location.href = 'index.html';
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('atelier_user');
    window.location.href = 'index.html';
  }

  mergeWishlist() {
    // In a real app, we'd merge local wishlist with server wishlist here.
    // For demo, localStorage wishlist acts as the unified list.
    window.dispatchEvent(new Event('wishlistUpdated'));
  }

  updateNavUI() {
    const loginBtns = document.querySelectorAll('.nav-login-btn');
    const mobileLoginLink = document.querySelector('.mobile-login-link');
    const navActions = document.querySelector('.nav-actions');
    const mobileDrawerNav = document.querySelector('.mobile-drawer .drawer-body');

    if (this.currentUser) {
      // Update Desktop Nav
      if (loginBtns.length > 0) {
        loginBtns.forEach(btn => {
          btn.outerHTML = `
            <div class="nav-item-dropdown">
              <button class="btn btn-outline" style="padding: 10px 20px;">${this.currentUser.name}</button>
              <div class="dropdown-menu">
                ${this.currentUser.role === 'admin' ? '<a href="dashboard.html" class="dropdown-link">Dashboard</a>' : ''}
                <button onclick="window.AtelierAuth.logout()" class="dropdown-link" style="width:100%; text-align:left;">Logout</button>
              </div>
            </div>
          `;
        });
      }

      // Update Mobile Nav
      if (mobileLoginLink) {
        mobileLoginLink.outerHTML = `
          <div class="mobile-nav-link" style="font-size:1rem; text-transform:none;">
            <div style="margin-bottom:8px; color:var(--clr-text-light);">Logged in as ${this.currentUser.name}</div>
            ${this.currentUser.role === 'admin' ? '<a href="dashboard.html" style="display:block; padding:8px 0; color:var(--clr-primary);">Dashboard</a>' : ''}
            <button onclick="window.AtelierAuth.logout()" style="display:block; padding:8px 0; color:var(--clr-error); font-weight:500;">Logout</button>
          </div>
        `;
      }
    }
  }

  checkGuards() {
    // Dashboard is openly accessible in this demo (no login required).
  }
}

window.AtelierAuth = new Auth();

// Show / hide toggle for every password field
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="password"]').forEach(input => {
    const wrap = document.createElement('div');
    wrap.className = 'password-field';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'password-toggle';
    btn.setAttribute('aria-label', 'Show password');
    btn.innerHTML = '<i class="ph ph-eye"></i>';
    wrap.appendChild(btn);

    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.innerHTML = `<i class="ph ${show ? 'ph-eye-slash' : 'ph-eye'}"></i>`;
    });
  });
});
