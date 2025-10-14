async function deleteUser(id) {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (data.success) {
    alert('Пользователь удалён');
    loadUsers();
  } else {
    alert('Ошибка при удалении: ' + data.error);
  }
}

function attachDeleteHandlers() {
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (confirm('Вы точно хотите удалить пользователя?')) {
        deleteUser(id);
      }
    };
  });
}

function attachEditHandlers() {
  const editButtons = document.querySelectorAll('.btn-edit');
  editButtons.forEach(btn => {
    btn.onclick = async () => {
      const tr = btn.closest('tr');
      const id = tr.dataset.id;

      if (tr.classList.contains('editing')) return;

      tr.classList.add('editing');

      const loginTd = tr.querySelector('.td-login');
      const nameTd = tr.querySelector('.td-name');
      const roleTd = tr.querySelector('.td-role');

      const oldLogin = loginTd.textContent;
      const oldName = nameTd.textContent === '-' ? '' : nameTd.textContent;
      const oldRole = roleTd.textContent;

      loginTd.innerHTML = `<input value="${oldLogin}" />`;
      nameTd.innerHTML = `<input value="${oldName}" />`;
      roleTd.innerHTML = `<input value="${oldRole}" />`;

      btn.textContent = '✅';
      const cancelBtn = document.createElement('button');
cancelBtn.textContent = '❌';
cancelBtn.classList.add('btn-cancel');
btn.parentElement.appendChild(cancelBtn);

      btn.onclick = async () => {
        const newLogin = loginTd.querySelector('input').value.trim();
        const newName = nameTd.querySelector('input').value.trim();
        const newRole = roleTd.querySelector('input').value.trim();

        if (!newLogin || !newRole) return alert('Логин и роль обязательны');

        const res = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: newLogin, name: newName, role: newRole })
        });
        const data = await res.json();

        if (data.success) {
          alert('Пользователь обновлён');
          loadUsers();
        } else {
          alert('Ошибка: ' + data.error);
        }
      };

      cancelBtn.onclick = () => {
        loginTd.textContent = oldLogin;
        nameTd.textContent = oldName || '-';
        roleTd.textContent = oldRole;
        btn.textContent = '✏️';
        cancelBtn.remove();
        tr.classList.remove('editing');
        attachEditHandlers();
      };
    };
  });
}

async function loadUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();

  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = users.map(u => `
    <tr data-id="${u.id}">
      <td class="td-id">${u.id}</td>
      <td class="td-login">${u.login}</td>
      <td class="td-name">${u.name || '-'}</td>
      <td class="td-role">${u.role}</td>
      <td>
        <button class="btn-edit">✏️</button>
        <button class="btn-delete">🗑️</button>
      </td>
    </tr>
  `).join('');

  attachDeleteHandlers();
  attachEditHandlers();
}

async function editUser(id) {
  const res = await fetch('/api/users');
  const users = await res.json();
  const user = users.find(u => u.id == id);
  if (!user) return alert('Пользователь не найден');

  const newLogin = prompt('Логин:', user.login);
  const newName = prompt('Имя:', user.name || '');
  const newRole = prompt('Роль (user/admin):', user.role);

  if (!newLogin || !newRole) return alert('Логин и роль обязательны');

  const updateRes = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: newLogin, name: newName, role: newRole })
  });

  const data = await updateRes.json();
  if (data.success) {
    alert('Пользователь обновлён');
    loadUsers();
  } else {
    alert('Ошибка: ' + data.error);
  }
}

function attachProductEditHandlers() {
  const editButtons = document.querySelectorAll('#productsTable .btn-edit');

  editButtons.forEach(btn => {
    btn.onclick = () => {
      const tr = btn.closest('tr');
      const id = tr.dataset.id;

      if (tr.classList.contains('editing')) return;
      tr.classList.add('editing');

      const nameTd = tr.children[1];
      const descTd = tr.children[2];
      const priceTd = tr.children[3];
      const imageTd = tr.children[4];

      const oldName = nameTd.textContent;
      const oldDesc = descTd.textContent;
      const oldPrice = priceTd.textContent.replace(' ₽', '');
      const oldImage = imageTd.dataset.image || imageTd.querySelector('img')?.src || '';

      nameTd.innerHTML = `<input value="${oldName}" />`;
      descTd.innerHTML = `<input value="${oldDesc}" />`;
      priceTd.innerHTML = `<input type="number" value="${oldPrice}" />`;
      imageTd.innerHTML = `
        <input value="${oldImage}" />
        <br>
        <img src="${oldImage}" alt="preview" width="50">
      `;

      const imgPreview = imageTd.querySelector('img');
      const imageInput = imageTd.querySelector('input');

      imageInput.addEventListener('input', () => {
        imgPreview.src = imageInput.value;
      });

      btn.textContent = '✅';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '❌';
      btn.parentElement.appendChild(cancelBtn);

      btn.onclick = async () => {
        const newName = nameTd.querySelector('input').value.trim();
        const newDesc = descTd.querySelector('input').value.trim();
        const newPrice = parseFloat(priceTd.querySelector('input').value);
        const newImage = imageTd.querySelector('input').value.trim();

        if (!newName || isNaN(newPrice)) return alert('Название и цена обязательны');

        const res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName, description: newDesc, price: newPrice, image: newImage })
        });

        const data = await res.json();
        if (data.success) {
          alert('Товар обновлён');
          loadProducts();
        } else {
          alert('Ошибка: ' + data.error);
        }
      };

      cancelBtn.onclick = () => {
        nameTd.textContent = oldName;
        descTd.textContent = oldDesc;
        priceTd.textContent = oldPrice + ' ₽';
        imageTd.dataset.image = oldImage;
        imageTd.innerHTML = `<img src="${oldImage}" alt="${oldName}" width="50">`;

        btn.textContent = '✏️';
        cancelBtn.remove();
        tr.classList.remove('editing');

        attachProductEditHandlers();
      };
    };
  });
}


async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();

  const tbody = document.querySelector('#productsTable tbody');
  tbody.innerHTML = products.map(p => `
    <tr data-id="${p.id}">
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td class="td-description" title="${p.description}">${p.description}</td>
      <td class="td-price">${p.price} ₽</td>
      <td class="td-image" data-image="${p.image}">
        <img src="${p.image}" alt="${p.name}" width="50">
      </td>
      <td>
        <button class="btn-edit" data-id="${p.id}">✏️</button>
        <button class="btn-delete" data-id="${p.id}">🗑️</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.td-description').forEach(td => {
    td.addEventListener('click', () => td.classList.toggle('expanded'));
  });

  attachProductDeleteHandlers();
  attachProductEditHandlers();
}

document.getElementById('addProductBtn').addEventListener('click', async () => {
  const name = document.getElementById('productName').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const image = document.getElementById('productImage').value.trim();

  if (!name || isNaN(price)) return alert('Введите название и корректную цену');

  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, price, image })
  });

  const data = await res.json();
  if (data.success) {
    alert('Товар добавлен');
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productImage').value = '';
    loadProducts();
  } else {
    alert('Ошибка: ' + data.error);
  }
});

async function deleteProduct(id) {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (data.success) {
    alert('Товар удалён');
    loadProducts();
  } else {
    alert('Ошибка при удалении: ' + data.error);
  }
}

function attachProductDeleteHandlers() {
  const deleteButtons = document.querySelectorAll('#productsTable .btn-delete');
  deleteButtons.forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (confirm('Вы точно хотите удалить товар?')) {
        deleteProduct(id);
      }
    };
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadUsers();
  await loadProducts();
});


