import { validateForm, validateName } from '../server/validation.js';
import { loginUser, registerUser } from '../server/auth.js';
import { renderProductList, getProductById } from '../server/products.js';

const loginForm = document.querySelector('form.login-form');
if (loginForm) {
  const loginInput = loginForm.querySelector('input[name="login"]');
  const passwordInput = loginForm.querySelector('input[name="password"]');
  const nameInput = loginForm.querySelector('input[name="name"]');
  const modeToggle = loginForm.querySelector('input[name="mode"]'); 
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const login = loginInput.value.trim();
    const password = passwordInput.value;
    const name = nameInput ? nameInput.value.trim() : '';
    const mode = modeToggle ? modeToggle.value : 'login'; 

    const { isValid, loginError, passwordError } = validateForm(login, password);
    if (!isValid) {
      alert([loginError, passwordError].filter(Boolean).join('\\n'));
      return;
    }
    if (mode === 'login') {
      const res = loginUser(login, password);
      if (res.success) {
        alert('Вход успешен!');
        window.location.href = 'index.html';
      } else {
        alert(res.error);
      }
    } else {
      const nameError = validateName(name);
      if (nameError) {
        alert(nameError);
        return;
      }
      const res = registerUser(login, password, name);
      if (res.success) {
        alert('Регистрация прошла успешно!');
        window.location.href = 'index.html';
      } else {
        alert(res.error);
      }
    }
  });

  const switchBtn = document.querySelector('#switch-auth');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      const current = modeToggle.value;
      if (current === 'login') {
        modeToggle.value = 'register';
        switchBtn.textContent = 'Уже есть аккаунт? Войти';
        nameInput.style.display = 'block';
        loginForm.querySelector('h1').textContent = 'Регистрация';
        loginForm.querySelector('button').textContent = 'Зарегистрироваться';
      } else {
        modeToggle.value = 'login';
        switchBtn.textContent = 'Нет аккаунта? Зарегистрироваться';
        nameInput.style.display = 'none';
        loginForm.querySelector('h1').textContent = 'Вход';
        loginForm.querySelector('button').textContent = 'Войти';
      }
    });
  }
}

if (document.querySelector('.cards')) {
  const container = document.querySelector('.cards');
  renderProductList(container);
}

// Страница товара (product.html)
if (document.querySelector('.product-page')) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (productId) {
    const product = getProductById(productId);
    if (product) {
      document.querySelector('.product-page').innerHTML = `
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
      document.querySelector('.product-page').innerHTML = "<p>Товар не найден</p>";
    }
  }
}