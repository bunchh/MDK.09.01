const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/server', express.static(path.join(__dirname, 'server')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dataFile = path.join(__dirname, 'server', 'data.json');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.get('../server/', (req, res) => {
  if (!fs.existsSync(dataFile)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  res.json(data);
});

app.post('../server/', (req, res) => {
  const newData = req.body;

  let existing = [];
  if (fs.existsSync(dataFile)) {
    existing = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }

  existing.push(newData);
  fs.writeFileSync(dataFile, JSON.stringify(existing, null, 2), 'utf8');

  res.json({ message: 'Данные успешно сохранены!' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/:page', (req, res) => {
  const filePath = path.join(__dirname, 'html', req.params.page);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Страница не найдена');
  }
});

const usersFile = path.join(__dirname, 'server', 'users.json');

app.get('/api/users', (req, res) => {
  if (!fs.existsSync(usersFile)) return res.json([]);
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = req.body;
  let users = [];

  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }

  if (users.some(u => u.login === newUser.login)) {
    return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
  }

  newUser.id = users.length ? users[users.length - 1].id + 1 : 1;
  users.push(newUser);

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
  res.json({ success: true, user: newUser });
});

app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const updatedData = req.body;

  if (!fs.existsSync(usersFile)) return res.status(404).json({ error: 'Файл users.json не найден' });

  let users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const index = users.findIndex(u => u.id === id);

  if (index === -1) return res.status(404).json({ error: 'Пользователь не найден' });

  if (users.some(u => u.login === updatedData.login && u.id !== id)) {
    return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
  }

  users[index] = { ...users[index], ...updatedData };
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');

  res.json({ success: true, user: users[index] });
});

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!fs.existsSync(usersFile)) return res.status(404).json({ error: 'Файл users.json не найден' });

  let users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const index = users.findIndex(u => u.id === id);

  if (index === -1) return res.status(404).json({ error: 'Пользователь не найден' });

  users.splice(index, 1);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');

  res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  if (!fs.existsSync(usersFile)) return res.status(404).json({ error: 'Файл users.json не найден' });

  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const user = users.find(u => u.login === login && u.password === password);

  if (!user) return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });

  res.json({ success: true, user });
});

app.get('/api/products', async (req, res) => {
  try {
    const productsPath = path.join(__dirname, 'server', 'products.json');
    const data = await fs.promises.readFile(productsPath, 'utf-8');
    const products = JSON.parse(data);

    if (Array.isArray(products)) res.json(products);
    else res.status(500).json({ error: 'products.json не является массивом' });
  } catch (err) {
    console.error('Ошибка чтения products.json:', err);
    res.status(500).json({ error: 'Ошибка чтения products.json' });
  }
});

const productsFile = path.join(__dirname, 'server', 'products.json');

app.post('/api/products', (req, res) => {
  const { name, description, price, image } = req.body;

  if (!name || !price) return res.status(400).json({ error: 'Название и цена обязательны' });

  let products = [];
  if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  }

  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name,
    description: description || '',
    price,
    image: image || ''
  };

  products.push(newProduct);
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

  res.json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const updatedData = req.body;

  if (!fs.existsSync(productsFile)) return res.status(404).json({ error: 'Файл products.json не найден' });

  let products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  const index = products.findIndex(p => p.id === id);

  if (index === -1) return res.status(404).json({ error: 'Товар не найден' });

  products[index] = { ...products[index], ...updatedData };
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

  res.json({ success: true, product: products[index] });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Файл не получен' });
  }

  const filePath = '/uploads/' + req.file.filename;
  res.json({ success: true, path: filePath });
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!fs.existsSync(productsFile)) return res.status(404).json({ error: 'Файл products.json не найден' });

  let products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  const index = products.findIndex(p => p.id === id);

  if (index === -1) return res.status(404).json({ error: 'Товар не найден' });

  products.splice(index, 1);
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Сервер запущен: http://localhost:${PORT}`));
