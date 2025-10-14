import { getProducts } from './mockDB.js';

export async function renderProductList(container) {
  const list = await getProducts();
  container.innerHTML = list.map(product => `
    <div class="kartochka card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p class="price">${product.price} ₽</p>
      <button>Добавить в корзину</button>
    </div>
  `).join('');

  container.querySelectorAll('.kartochka.card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'button') return;
      const productId = card.dataset.id;
      window.location.href = `product.html?id=${productId}`;
    });
  });
};

export async function getProductById(id) {
  const products = await getProducts();
  return products.find(p => p.id == id);
}