import { validateForm, validateName } from '../server/validation.js';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../server/auth.js';
import { renderProductList, getProductById } from '../server/products.js';

document.addEventListener('DOMContentLoaded', async () => {

  const authBtn = document.querySelector('.auth-btn');
  if (authBtn) {
    const user = getCurrentUser();
    if (user) {
      authBtn.textContent = 'Выйти';
      authBtn.href = '#';
      authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
        window.location.reload();
      });
    } else {
      authBtn.textContent = 'Войти';
      authBtn.href = './login.html';
    }
  }

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const switchBtn = document.getElementById('switch-auth');

  if (loginForm && registerForm && switchBtn) {
    switchBtn.addEventListener('click', () => {
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        switchBtn.textContent = "Нет аккаунта? Зарегистрироваться";
      } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        switchBtn.textContent = "Уже есть аккаунт? Войти";
      }
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const login = document.getElementById('loginLogin').value.trim();
      const password = document.getElementById('loginPassword').value;

      const { isValid, loginError, passwordError } = validateForm(login, password);
      if (!isValid) {
        alert([loginError, passwordError].filter(Boolean).join('\n'));
        return;
      }

      const result = await loginUser(login, password);
      if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        alert(`Добро пожаловать, ${result.user.name}!`);
        window.location.href = './index.html';
      } else {
        alert(result.error);
      }
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const login = document.getElementById('regLogin').value.trim();
      const password = document.getElementById('regPassword').value;

      const nameError = validateName(name);
      const { isValid, loginError, passwordError } = validateForm(login, password);

      if (nameError || !isValid) {
        alert([nameError, loginError, passwordError].filter(Boolean).join('\n'));
        return;
      }

      const result = await registerUser(login, password, name);
      if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        alert(`Пользователь ${name} зарегистрирован!`);
        window.location.href = './index.html';
      } else {
        alert(result.error);
      }
    });
  }

  const cardsContainer = document.querySelector('.cards');
  if (cardsContainer) {
    await renderProductList(cardsContainer);
  }

  const productPage = document.querySelector('.product-page');
  if (productPage) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
      const product = await getProductById(productId);
      if (product) {
        productPage.innerHTML = `
          <div class="kartochkatovara">
            <img src="${product.image}" alt="${product.name}" class="fotochka">
            <div class="tovar">
              <h1 class="nazvanie">${product.name}</h1>
              <p class="opisanie">${product.description}</p>
              <p class="price">${(product.price).toFixed(0)} ₽</p>
              <button class="vkorzinu">Добавить в корзину</button>
            </div>
          </div>
        `;
      } else {
        productPage.innerHTML = '<p>Товар не найден</p>';
      }
    }
  }

});


// кнопка админки
const user = getCurrentUser();
if (user && user.role === 'admin') {
    const navbar = document.getElementById('navbar');
    const link = document.createElement('a');
    link.textContent = 'Панель администратора';
    link.href = 'admin.html';
    link.classList.add('admin-btn');
    navbar.appendChild(link);
}
