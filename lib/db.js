// Временный файл - позже заменим на реальную БД
export async function query(text, params) {
  console.log('DB Query:', text, params);
  return { rows: [] };
}

export async function getUsers() {
  return [];
}

export async function saveUsers(users) {
  console.log('Users saved:', users.length);
}