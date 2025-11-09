// settings.js
import { supabase } from './supabase.js'

class SettingsManager {
    constructor() {
        this.currentUser = null
        this.userProfile = null
        this.init()
    }

    async init() {
        // Проверяем авторизацию
        await this.checkAuth()
        
        // Загружаем данные профиля
        await this.loadUserProfile()
        
        // Настраиваем обработчики событий
        this.setupEventListeners()
        
        // Заполняем форму данными
        this.populateForm()
    }

    async checkAuth() {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
            window.location.href = '/login.html'
            return
        }
        
        this.currentUser = user
    }

    async loadUserProfile() {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single()

            if (error) throw error

            this.userProfile = profile
            console.log('✅ Профиль загружен:', profile)
            
        } catch (error) {
            console.error('❌ Ошибка загрузки профиля:', error)
            this.showNotification('Ошибка загрузки профиля', 'error')
        }
    }

    setupEventListeners() {
        // Сохранение основной информации
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.saveProfile())
        
        // Смена пароля
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.changePassword())
        
        // Сохранение настроек приватности
        document.getElementById('savePrivacyBtn').addEventListener('click', () => this.savePrivacySettings())
        
        // Удаление аккаунта
        document.getElementById('deleteAccountBtn').addEventListener('click', () => this.deleteAccount())
        
        // Экспорт данных
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData())
        
        // Загрузка аватара
        document.getElementById('uploadAvatarBtn').addEventListener('click', () => this.uploadAvatar())
        
        // Генерация аватара
        document.getElementById('generateAvatarBtn').addEventListener('click', () => this.generateAvatar())
        
        // Отслеживание изменений в bio
        document.getElementById('bioInput').addEventListener('input', (e) => this.updateBioCounter(e.target.value))
    }

    populateForm() {
        if (!this.userProfile) return

        // Основная информация
        document.getElementById('usernameInput').value = this.userProfile.username || ''
        document.getElementById('fullNameInput').value = this.userProfile.full_name || ''
        document.getElementById('emailInput').value = this.currentUser.email || ''
        document.getElementById('websiteInput').value = this.userProfile.website || ''
        document.getElementById('locationInput').value = this.userProfile.location || ''
        document.getElementById('bioInput').value = this.userProfile.bio || ''
        
        // Обновляем счетчик bio
        this.updateBioCounter(this.userProfile.bio || '')
        
        // Обновляем аватар
        this.updateAvatarPreview()
        
        // Настройки приватности
        if (this.userProfile.privacy_settings) {
            const privacy = this.userProfile.privacy_settings
            document.getElementById('publicProfileToggle').checked = privacy.profile_public !== false
            document.getElementById('showEmailToggle').checked = privacy.email_public === true
            document.getElementById('allowMessagesToggle').checked = privacy.allow_messages !== false
        }
        
        // Статус email
        this.updateEmailStatus()
    }

    updateBioCounter(text) {
        const counter = document.getElementById('bioCounter')
        const length = text.length
        counter.textContent = `${length}/500`
        counter.style.color = length > 500 ? '#dc2626' : 'var(--text-gray)'
    }

    updateAvatarPreview() {
        const avatarPreview = document.getElementById('avatarPreview')
        
        if (this.userProfile.avatar_url) {
            // Если есть URL аватара, загружаем изображение
            avatarPreview.innerHTML = `<img src="${this.userProfile.avatar_url}" alt="Аватар" onerror="this.style.display='none'">`
        } else {
            // Иначе показываем инициалы
            const username = this.userProfile.username || this.currentUser.email
            const initials = username.substring(0, 2).toUpperCase()
            avatarPreview.innerHTML = initials
            avatarPreview.style.background = this.getAvatarColor(username)
        }
    }

    getAvatarColor(username) {
        const colors = [
            'linear-gradient(135deg, #d4af37, #f5e1a2)',
            'linear-gradient(135deg, #3b82f6, #60a5fa)',
            'linear-gradient(135deg, #10b981, #34d399)',
            'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            'linear-gradient(135deg, #ef4444, #f87171)',
            'linear-gradient(135deg, #f59e0b, #fbbf24)'
        ]
        
        // Генерируем детерминированный цвет на основе username
        let hash = 0
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash)
        }
        const index = Math.abs(hash) % colors.length
        return colors[index]
    }

    updateEmailStatus() {
        const emailHelp = document.querySelector('#emailInput + .form-help')
        if (this.currentUser.email_confirmed_at) {
            emailHelp.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> Почта подтверждена'
        } else {
            emailHelp.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> Почта не подтверждена. <a href="#" style="color: #d4af37;">Отправить подтверждение</a>'
        }
    }

    async saveProfile() {
        const saveBtn = document.getElementById('saveProfileBtn')
        const originalText = saveBtn.innerHTML
        
        try {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...'
            saveBtn.disabled = true

            const formData = {
                username: document.getElementById('usernameInput').value.trim(),
                full_name: document.getElementById('fullNameInput').value.trim(),
                website: document.getElementById('websiteInput').value.trim(),
                location: document.getElementById('locationInput').value.trim(),
                bio: document.getElementById('bioInput').value.trim(),
                updated_at: new Date().toISOString()
            }

            // Валидация
            if (!formData.username) {
                throw new Error('Имя пользователя обязательно')
            }

            if (formData.bio.length > 500) {
                throw new Error('Биография не должна превышать 500 символов')
            }

            const { data, error } = await supabase
                .from('profiles')
                .update(formData)
                .eq('id', this.currentUser.id)
                .select()

            if (error) throw error

            this.userProfile = { ...this.userProfile, ...formData }
            this.showNotification('Профиль успешно обновлен!', 'success')
            
        } catch (error) {
            console.error('❌ Ошибка сохранения профиля:', error)
            this.showNotification(error.message || 'Ошибка сохранения профиля', 'error')
        } finally {
            saveBtn.innerHTML = originalText
            saveBtn.disabled = false
        }
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPasswordInput').value
        const newPassword = document.getElementById('newPasswordInput').value
        const confirmPassword = document.getElementById('confirmPasswordInput').value

        try {
            // Валидация
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new Error('Заполните все поля пароля')
            }

            if (newPassword !== confirmPassword) {
                throw new Error('Пароли не совпадают')
            }

            if (newPassword.length < 8) {
                throw new Error('Пароль должен содержать минимум 8 символов')
            }

            // Смена пароля в Supabase Auth
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            // Очищаем поля
            document.getElementById('currentPasswordInput').value = ''
            document.getElementById('newPasswordInput').value = ''
            document.getElementById('confirmPasswordInput').value = ''

            this.showNotification('Пароль успешно изменен!', 'success')
            
        } catch (error) {
            console.error('❌ Ошибка смены пароля:', error)
            this.showNotification(error.message || 'Ошибка смены пароля', 'error')
        }
    }

    async savePrivacySettings() {
        try {
            const privacySettings = {
                profile_public: document.getElementById('publicProfileToggle').checked,
                email_public: document.getElementById('showEmailToggle').checked,
                allow_messages: document.getElementById('allowMessagesToggle').checked
            }

            const { error } = await supabase
                .from('profiles')
                .update({ 
                    privacy_settings: privacySettings,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id)

            if (error) throw error

            this.showNotification('Настройки приватности сохранены!', 'success')
            
        } catch (error) {
            console.error('❌ Ошибка сохранения настроек приватности:', error)
            this.showNotification('Ошибка сохранения настроек приватности', 'error')
        }
    }

    async uploadAvatar() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        
        input.onchange = async (e) => {
            const file = e.target.files[0]
            if (!file) return

            // Проверка размера файла (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showNotification('Файл слишком большой (макс. 5MB)', 'error')
                return
            }

            try {
                // Создаем уникальное имя файла
                const fileExt = file.name.split('.').pop()
                const fileName = `${this.currentUser.id}/${Math.random()}.${fileExt}`
                
                // Загружаем в Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                // Получаем публичный URL
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName)

                // Обновляем профиль
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ 
                        avatar_url: publicUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.currentUser.id)

                if (updateError) throw updateError

                this.userProfile.avatar_url = publicUrl
                this.updateAvatarPreview()
                this.showNotification('Аватар успешно обновлен!', 'success')
                
            } catch (error) {
                console.error('❌ Ошибка загрузки аватара:', error)
                this.showNotification('Ошибка загрузки аватара', 'error')
            }
        }

        input.click()
    }

    generateAvatar() {
        const avatarPreview = document.getElementById('avatarPreview')
        const username = this.userProfile.username || this.currentUser.email
        const initials = username.substring(0, 2).toUpperCase()
        
        avatarPreview.innerHTML = initials
        avatarPreview.style.background = this.getAvatarColor(username)
        
        this.showNotification('Аватар сгенерирован!', 'success')
    }

    async deleteAccount() {
        if (!confirm('Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.')) {
            return
        }

        try {
            // Удаляем профиль из базы данных
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', this.currentUser.id)

            if (profileError) throw profileError

            // Удаляем пользователя из Auth
            const { error: authError } = await supabase.auth.admin.deleteUser(this.currentUser.id)
            
            if (authError) {
                // Если нет прав админа, просто разлогиниваем
                await supabase.auth.signOut()
            }

            this.showNotification('Аккаунт успешно удален', 'success')
            setTimeout(() => {
                window.location.href = '/index.html'
            }, 2000)
            
        } catch (error) {
            console.error('❌ Ошибка удаления аккаунта:', error)
            this.showNotification('Ошибка удаления аккаунта', 'error')
        }
    }

    async exportData() {
        try {
            // Собираем все данные пользователя
            const userData = {
                profile: this.userProfile,
                auth: {
                    email: this.currentUser.email,
                    created_at: this.currentUser.created_at,
                    last_sign_in: this.currentUser.last_sign_in_at
                },
                export_date: new Date().toISOString()
            }

            // Создаем и скачиваем JSON файл
            const dataStr = JSON.stringify(userData, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            
            const link = document.createElement('a')
            link.href = URL.createObjectURL(dataBlob)
            link.download = `archive-broni-export-${new Date().toISOString().split('T')[0]}.json`
            link.click()
            
            this.showNotification('Данные успешно экспортированы!', 'success')
            
        } catch (error) {
            console.error('❌ Ошибка экспорта данных:', error)
            this.showNotification('Ошибка экспорта данных', 'error')
        }
    }

    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div')
        notification.className = `notification notification-${type}`
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `

        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#dc2626' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `

        document.body.appendChild(notification)

        // Удаляем через 5 секунд
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease'
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification)
                }
            }, 300)
        }, 5000)
    }
}

// Добавляем стили для анимаций уведомлений
const style = document.createElement('style')
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
`
document.head.appendChild(style)

// Инициализация когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager()
})
