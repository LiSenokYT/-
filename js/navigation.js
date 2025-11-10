import { supabase } from '/js/supabase.js'
import { getCurrentUser, getUserProfile, logoutUser } from '/js/auth.js'

class NavigationManager {
    constructor() {
        this.init()
    }

    async init() {
        await this.updateNavigation()
        this.setupEventListeners()
    }

    async updateNavigation() {
        const navActions = document.querySelector('.nav-actions')
        if (!navActions) return

        const { user } = await getCurrentUser()
        
        if (user) {
            // Пользователь авторизован
            const { profile } = await getUserProfile(user.id)
            
            navActions.innerHTML = `
                <a href="/pages/bookmarks.html" class="icon-btn" title="Закладки">
                    <i class="fas fa-bookmark"></i>
                </a>
                <div class="user-menu">
                    <div class="user-info">
                        <span class="user-display-name">${profile?.username || user.email}</span>
                        <i class="fas fa-chevron-down" style="margin-left: 5px; font-size: 0.8rem;"></i>
                        <div class="user-dropdown">
                            <a href="/pages/profile.html" class="dropdown-item">
                                <i class="fas fa-user"></i> Профиль
                            </a>
                            <a href="/pages/settings.html" class="dropdown-item">
                                <i class="fas fa-cog"></i> Настройки
                            </a>
                            <button class="dropdown-item logout-btn" id="logoutBtn">
                                <i class="fas fa-sign-out-alt"></i> Выйти
                            </button>
                        </div>
                    </div>
                </div>
            `
        } else {
            // Пользователь не авторизован
            navActions.innerHTML = `
                <a href="/pages/bookmarks.html" class="icon-btn" title="Закладки">
                    <i class="fas fa-bookmark"></i>
                </a>
                <a href="/pages/login.html" class="icon-btn" title="Войти">
                    <i class="fas fa-sign-in-alt"></i>
                </a>
                <a href="/pages/registration.html" class="btn btn-primary">
                    Регистрация
                </a>
            `
        }
    }

    setupEventListeners() {
        // Обработчик выхода
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault()
                
                const result = await logoutUser()
                if (result.success) {
                    window.location.href = '/index.html'
                } else {
                    alert('Ошибка при выходе: ' + result.error)
                }
            }
        })
    }
}

// Инициализация когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager()
})
