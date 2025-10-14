export async function getUsers() {
  const response = await fetch('/api/users');
  return await response.json();
}

export async function getProducts() {
  const response = await fetch('/api/products');
  return await response.json();
}