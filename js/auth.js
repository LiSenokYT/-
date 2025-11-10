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
                    email: email, // ← ДОБАВЛЕНО!
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])

        if (profileError) {
            console.error('❌ Ошибка создания профиля:', profileError)
            
            // Если не удалось создать профиль, пытаемся удалить пользователя из auth
            try {
                await supabase.auth.signOut()
            } catch (deleteError) {
                console.error('Не удалось очистить сессию:', deleteError)
            }
            
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
