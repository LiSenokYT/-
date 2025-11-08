module.exports = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const updateData = req.body;

    // Здесь будет обновление пользователя в БД
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Обновляем только разрешенные поля
    users[userIndex] = {
      ...users[userIndex],
      profile: {
        ...users[userIndex].profile,
        ...updateData
      }
    };

    await saveUsers(users);

    const { password, ...updatedUser } = users[userIndex];

    res.json({
      message: 'Профиль обновлен',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};