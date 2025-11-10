// protect-profile.js
import { supabase } from './supabase.js'
import { ensureProfileExists } from './auth.js'

async function protectProfile() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    window.location.href = '/login.html'
    return
  }
  
  // Гарантируем что профиль существует
  const profileResult = await ensureProfileExists(user)
  if (!profileResult.success) {
    console.error('❌ Failed to ensure profile exists:', profileResult.error)
  }
  
  // Загружаем данные профиля
  loadUserProfile(user)
}

async function loadUserProfile(user) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Profile load error:', error)
      
      // Если профиль не найден, создаем его
      if (error.code === 'PGRST116') {
        console.log('🔄 Profile not found, creating...')
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email.split('@')[0],
            email: user.email,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }
        
        // Перезагружаем страницу чтобы получить новый профиль
        window.location.reload()
        return
      }
      throw error
    }

    updateProfilePage(user, profile)
    
  } catch (error) {
    console.error('🚨 Profile error:', error)
    
    // Показываем пользователю понятную ошибку
    const userInfo = document.getElementById('userInfo')
    if (userInfo) {
      userInfo.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h3 style="color: var(--accent-gold); margin-bottom: 1rem;">Ошибка загрузки профиля</h3>
          <p style="color: var(--text-gray); margin-bottom: 1.5rem;">
            Не удалось загрузить данные профиля. Пожалуйста, попробуйте обновить страницу.
          </p>
          <button onclick="window.location.reload()" class="btn btn-primary">
            <i class="fas fa-refresh"></i> Обновить страницу
          </button>
        </div>
      `
    }
  }
}

function updateProfilePage(user, profile) {
  const title = document.querySelector('.profile-title')
  if (title) {
    title.textContent = `Профиль: ${profile?.username || user.email}`
  }
  
  const userInfo = document.getElementById('userInfo')
  if (userInfo) {
    userInfo.innerHTML = `
      <div class="info-item">
        <strong>Email:</strong> ${user.email}
      </div>
      <div class="info-item">
        <strong>Имя пользователя:</strong> ${profile?.username || 'Не указано'}
      </div>
      <div class="info-item">
        <strong>Полное имя:</strong> ${profile?.full_name || 'Не указано'}
      </div>
      <div class="info-item">
        <strong>Биография:</strong> ${profile?.bio || 'Не указано'}
      </div>
      <div class="info-item">
        <strong>Местоположение:</strong> ${profile?.location || 'Не указано'}
      </div>
      <div class="info-item">
        <strong>Веб-сайт:</strong> ${profile?.website || 'Не указано'}
      </div>
      <div class="info-item">
        <strong>Дата регистрации:</strong> ${new Date(user.created_at).toLocaleDateString('ru-RU')}
      </div>
      <div class="info-item">
        <strong>ID:</strong> ${user.id}
      </div>
    `
  }
}

// Запускаем защиту при загрузке страницы
document.addEventListener('DOMContentLoaded', protectProfile)

// Слушаем изменения авторизации
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = '/login.html'
  }
})
