// shop.js - Filtering and Sorting

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('shop-grid');
  const noResults = document.getElementById('no-results');
  if (!grid) return;

  const filterCategory = document.getElementById('filter-category');
  const filterInStock = document.getElementById('filter-instock');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-filters');
  const title = document.getElementById('shop-title');

  // Read URL params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    filterCategory.value = urlParams.get('category');
    title.textContent = filterCategory.options[filterCategory.selectedIndex].text;
  }

  const renderGrid = () => {
    let products = window.AtelierStore.getProducts();

    // Filter Status (Admin active only)
    products = products.filter(p => p.status !== 'archived');

    // Filter Category
    if (filterCategory.value) {
      products = products.filter(p => p.category === filterCategory.value);
    }

    // Filter Stock
    if (filterInStock.checked) {
      products = products.filter(p => p.inStock > 0);
    }

    // Sort
    const sortVal = sortSelect.value;
    if (sortVal === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortVal === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else {
      // featured
      products.sort((a, b) => (b.featured === true ? 1 : 0) - (a.featured === true ? 1 : 0));
    }

    if (products.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
    } else {
      grid.style.display = 'grid';
      noResults.style.display = 'none';
      grid.innerHTML = products.map(p => generateProductCardHTML(p)).join('');
      window.AtelierWishlist.updateHeartIcons();
    }
  };

  filterCategory.addEventListener('change', () => {
    title.textContent = filterCategory.value ? filterCategory.options[filterCategory.selectedIndex].text : 'The Collection';
    renderGrid();
  });
  filterInStock.addEventListener('change', renderGrid);
  sortSelect.addEventListener('change', renderGrid);
  
  resetBtn.addEventListener('click', () => {
    filterCategory.value = '';
    filterInStock.checked = false;
    sortSelect.value = 'featured';
    title.textContent = 'The Collection';
    renderGrid();
  });

  renderGrid();
});
