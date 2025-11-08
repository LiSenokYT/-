class AuthSystem {
    constructor() {
        this.baseURL = '/api/auth';
        this.usersURL = '/api/users';
        this.tokenKey = 'armor_token';
        this.currentUserKey = 'armor_current_user';
        this.init();
    }

    init() {
        const token = this.getToken();
        if (token) {
            this.validateToken(token);
        }
        this.updateUI();
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка регистрации');
            }

            this.setToken(data.token);
            this.setCurrentUser(data.user);
            this.updateUI();
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка входа');
            }

            this.setToken(data.token);
            this.setCurrentUser(data.user);
            this.updateUI();
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            // Вызов серверного logout если нужно
            await fetch(`${this.baseURL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            // Всегда очищаем локальное хранилище
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.currentUserKey);
            this.updateUI();
            window.location.href = '/';
        }
    }

    async getUserProfile(userId) {
        try {
            const response = await fetch(`${this.usersURL}/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка получения профиля');
            }

            return data.user;
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    }

    async updateUserProfile(userId, updateData) {
        try {
            const response = await fetch(`${this.usersURL}/update?id=${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка обновления профиля');
            }

            // Обновляем текущего пользователя
            if (data.user) {
                this.setCurrentUser(data.user);
                this.updateUI();
            }

            return data;
        } catch (error) {
            console.error('Update user profile error:', error);
            throw error;
        }
    }

    async addToFavorites(itemId, itemType, itemData = {}) {
        try {
            const user = this.getCurrentUser();
            if (!user) throw new Error('Пользователь не авторизован');

            const favorite = {
                id: itemId,
                type: itemType,
                addedAt: new Date().toISOString(),
                ...itemData
            };

            // Обновляем профиль пользователя
            const updatedFavorites = [...(user.profile.favorites || []), favorite];
            await this.updateUserProfile(user.id, {
                favorites: updatedFavorites
            });

            return favorite;
        } catch (error) {
            console.error('Add to favorites error:', error);
            throw error;
        }
    }

    async removeFromFavorites(itemId, itemType) {
        try {
            const user = this.getCurrentUser();
            if (!user) throw new Error('Пользователь не авторизован');

            const updatedFavorites = (user.profile.favorites || []).filter(
                fav => !(fav.id === itemId && fav.type === itemType)
            );

            await this.updateUserProfile(user.id, {
                favorites: updatedFavorites
            });

            return true;
        } catch (error) {
            console.error('Remove from favorites error:', error);
            throw error;
        }
    }

    isInFavorites(itemId, itemType) {
        const user = this.getCurrentUser();
        if (!user || !user.profile.favorites) return false;

        return user.profile.favorites.some(
            fav => fav.id === itemId && fav.type === itemType
        );
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    setCurrentUser(user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }

    getCurrentUser() {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated() {
        return !!this.getToken() && !!this.getCurrentUser();
    }

    async validateToken(token) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                this.logout();
                return false;
            }

            // Можно добавить проверку токена на сервере
            // const response = await fetch(`${this.baseURL}/validate`, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });
            
            // if (!response.ok) {
            //     this.logout();
            //     return false;
            // }

            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    updateUI() {
        const navActions = document.getElementById('navActions');
        if (!navActions) return;

        if (this.isAuthenticated()) {
            const user = this.getCurrentUser();
            navActions.innerHTML = `
                <button class="icon-btn" id="favoritesBtn" title="Избранное">
                    <i class="fas fa-bookmark"></i>
                </button>
                <div class="user-dropdown">
                    <button class="icon-btn" id="userMenuBtn" title="Меню пользователя">
                        <i class="fas fa-user"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="profile.html" class="dropdown-item">
                            <i class="fas fa-user-circle"></i> ${user.username}
                        </a>
                        <a href="favorites.html" class="dropdown-item">
                            <i class="fas fa-bookmark"></i> Избранное
                        </a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i> Выйти
                        </button>
                    </div>
                </div>
            `;

            this.setupDropdown();
            
            // Добавляем обработчик для кнопки избранного
            const favoritesBtn = document.getElementById('favoritesBtn');
            if (favoritesBtn) {
                favoritesBtn.addEventListener('click', () => {
                    window.location.href = 'favorites.html';
                });
            }

        } else {
            navActions.innerHTML = `
                <button class="icon-btn" title="Избранное (требуется вход)">
                    <i class="fas fa-bookmark"></i>
                </button>
                <a href="login.html" class="icon-btn" title="Войти в систему">
                    <i class="fas fa-user"></i>
                </a>
            `;
        }
    }

    setupDropdown() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userMenuBtn && dropdownMenu) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Закрываем меню при клике вне его
        document.addEventListener('click', (e) => {
            if (dropdownMenu && !dropdownMenu.contains(e.target) && userMenuBtn && !userMenuBtn.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });

        // Закрываем меню при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Вспомогательные методы для работы с API
    async apiCall(endpoint, options = {}) {
        try {
            const token = this.getToken();
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    ...options.headers
                }
            };

            const response = await fetch(endpoint, {
                ...defaultOptions,
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                // Если токен просрочен, выходим
                if (response.status === 401) {
                    this.logout();
                }
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    // Метод для проверки доступности сервера
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'HEAD',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.error('Server status check failed:', error);
            return false;
        }
    }
}

// Инициализация глобальной системы аутентификации
window.authSystem = new AuthSystem();

// Обновление UI при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem.updateUI();
    
    // Добавляем глобальные обработчики для избранного
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-add-to-favorites]')) {
            e.preventDefault();
            const button = e.target.closest('[data-add-to-favorites]');
            const itemId = button.dataset.itemId;
            const itemType = button.dataset.itemType;
            const itemName = button.dataset.itemName || 'Элемент';
            
            if (!window.authSystem.isAuthenticated()) {
                alert('Для добавления в избранное необходимо войти в систему');
                window.location.href = 'login.html';
                return;
            }

            if (window.authSystem.isInFavorites(itemId, itemType)) {
                alert('Этот элемент уже в избранном');
                return;
            }

            // Показываем индикатор загрузки
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            button.disabled = true;

            window.authSystem.addToFavorites(itemId, itemType, { name: itemName })
                .then(() => {
                    button.innerHTML = '<i class="fas fa-check"></i> В избранном';
                    button.style.background = 'var(--accent-gold)';
                    button.style.color = 'var(--dark-base)';
                    
                    // Показываем уведомление
                    showNotification('Элемент добавлен в избранное', 'success');
                })
                .catch(error => {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                    showNotification('Ошибка при добавлении в избранное', 'error');
                    console.error('Add to favorites error:', error);
                });
        }
    });
});

// Вспомогательная функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 
                     type === 'error' ? 'rgba(220, 53, 69, 0.9)' : 
                     'rgba(26, 34, 50, 0.9)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid var(--accent-gold);
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Добавляем CSS анимации для уведомлений
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);
}