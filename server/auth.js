export async function loginUser(login, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password })
  });
  const data = await res.json();

  if (data.success && data.user) {
    localStorage.setItem('currentUser', JSON.stringify(data.user));
  }

  return data;
}

export async function registerUser(login, password, name) {
  const newUser = {
    login,
    password,
    name,
    role: 'user'
  };

  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  });

  const data = await res.json();

  if (data.success && data.user) {
    localStorage.setItem('currentUser', JSON.stringify(data.user));
  }

  return data;
}

export function logoutUser() {
  localStorage.removeItem('currentUser');
}

export function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}