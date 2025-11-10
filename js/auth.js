import { supabase } from '/js/supabase.js'

// Регистрация пользователя
export async function registerUser(email, password, username) {
    try {
        console.log('🔄 Начинаем регистрацию...')
        
        // Проверяем обязательные поля
        if (!email || !password || !username) {
            throw new Error('Все поля обязательны для заполнения')
        }

        if (password.length < 6) {
            throw new Error('Пароль должен содержать минимум 6 символов')
        }

        // Регистрируем пользователя в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        })

        if (authError) {
            console.error('❌ Ошибка аутентификации:', authError)
            throw new Error(authError.message)
        }

        if (!authData.user) {
            throw new Error('Не удалось создать пользователя')
        }

        console.log('✅ Пользователь создан в Auth:', authData.user.id)

        // Создаем профиль в таблице profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    username: username,
                    email: email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])

        if (profileError) {
            console.error('❌ Ошибка создания профиля:', profileError)
            throw new Error('Ошибка создания профиля: ' + profileError.message)
        }

        console.log('✅ Профиль создан успешно')
        
        return {
            success: true,
            user: authData.user,
            message: 'Регистрация успешна! Проверьте вашу почту для подтверждения.'
        }

    } catch (error) {
        console.error('🚨 Критическая ошибка регистрации:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Вход пользователя
export async function loginUser(email, password) {
    try {
        console.log('🔄 Пытаемся войти...')
        
        if (!email || !password) {
            throw new Error('Email и пароль обязательны')
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) {
            console.error('❌ Ошибка входа:', error)
            throw new Error(error.message)
        }

        if (!data.user) {
            throw new Error('Пользователь не найден')
        }

        console.log('✅ Успешный вход:', data.user.id)
        
        return {
            success: true,
            user: data.user
        }

    } catch (error) {
        console.error('🚨 Ошибка входа:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

// Выход пользователя
export async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        return { success: true }
    } catch (error) {
        console.error('❌ Ошибка выхода:', error)
        return { success: false, error: error.message }
    }
}

// Проверка текущего пользователя
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        return { user, error: null }
    } catch (error) {
        return { user: null, error }
    }
}

// Получение профиля пользователя
export async function getUserProfile(userId) {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error
        return { profile, error: null }
    } catch (error) {
        return { profile: null, error }
    }
}
