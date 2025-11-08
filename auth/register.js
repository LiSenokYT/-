const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    // Валидация
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
    }

    // Здесь будет подключение к базе данных
    // Для демо используем временное хранилище
    const users = await getUsers();
    
    // Проверка существующего пользователя
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Создание пользователя
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      profile: {
        firstName: '',
        lastName: '',
        avatar: '',
        bio: '',
        favorites: []
      }
    };

    // Сохранение пользователя
    users.push(newUser);
    await saveUsers(users);

    // Создание JWT токена
    const token = createToken(newUser.id);

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profile: newUser.profile
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Временные функции для демо (замените на реальную БД)
async function getUsers() {
  // Здесь можно использовать Vercel KV, MongoDB, или другую БД
  return [];
}

async function saveUsers(users) {
  // Сохранение в выбранную БД
}

function createToken(userId) {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { 
    expiresIn: '7d' 
  });
}