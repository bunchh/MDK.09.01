import { products } from './mockDB.js';

export function loadProducts() {
  return products;
}

export function renderProductCard(product) {
  return `
    <div class="kartochka card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p class="price">${(product.price).toFixed(0)} ₽</p>
      <button>Добавить в корзину</button>
    </div>
  `;
}

export function renderProductList(container) {
  const list = loadProducts();
  container.innerHTML = list.map(renderProductCard).join('');

  container.querySelectorAll('.kartochka.card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'button') return;
      const productId = card.dataset.id;
      window.location.href = `./product.html?id=${productId}`;
    });
  });
}

export function getProductById(id) {
  return products.find(p => p.id == id);
}