import { supabase } from './supabase.js'

export async function updateNavigation() {
  const { data: { user } } = await supabase.auth.getUser()
  const navActions = document.querySelector('.nav-actions')
  
  if (!navActions) return

  // Очищаем навигацию
  navActions.innerHTML = ''

  if (user) {
    // ПОЛЬЗОВАТЕЛЬ ВОШЕЛ
    const userMenu = document.createElement('div')
    userMenu.className = 'user-menu'
    userMenu.innerHTML = `
      <div class="user-info">
        <span class="user-name">${user.email}</span>
        <div class="user-dropdown">
          <a href="/pages/profile.html" class="dropdown-item">
            <i class="fas fa-user"></i> Мой профиль
          </a>
          <a href="/pages/settings.html" class="dropdown-item">
            <i class="fas fa-cog"></i> Настройки
          </a>
          <button class="dropdown-item logout-btn">
            <i class="fas fa-sign-out-alt"></i> Выйти
          </button>
        </div>
      </div>
    `
    navActions.appendChild(userMenu)

    // Обработчик выхода
    userMenu.querySelector('.logout-btn').addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.reload()
    })

  } else {
    // ПОЛЬЗОВАТЕЛЬ НЕ ВОШЕЛ
    navActions.innerHTML = `
      <a href="login.html" class="icon-btn">
        <i class="fas fa-sign-in-alt"></i>
      </a>
      <a href="registration.html" class="icon-btn">
        <i class="fas fa-user-plus"></i>
      </a>
    `
  }
}

// Обновляем навигацию при загрузке страницы
updateNavigation()

// Слушаем изменения авторизации
supabase.auth.onAuthStateChange((event, session) => {
  updateNavigation()
})
