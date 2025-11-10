// auth.js - ОБНОВЛЕННАЯ ВЕРСИЯ
import { supabase } from './supabase.js'

// Функция регистрации
export async function registerUser(email, password, username) {
  try {
    console.log('🔧 Starting registration...', { email, username });
    
    // 1. Регистрируем пользователя в Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username
        }
      }
    });
    
    if (authError) throw authError;

    console.log('✅ User registered in Auth:', authData.user);

    if (!authData.user) {
      throw new Error('Не удалось создать пользователя');
    }

    // 2. Создаем профиль в таблице profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      
      // Если ошибка из-за дубликата, пробуем получить существующий профиль
      if (profileError.code === '23505') { // unique violation
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (existingProfile) {
          console.log('✅ Using existing profile:', existingProfile);
          return { success: true, user: authData.user, profile: existingProfile };
        }
      }
      throw profileError;
    }

    console.log('✅ Profile created:', profileData);
    return { success: true, user: authData.user, profile: profileData };
    
  } catch (error) {
    console.error('🚨 Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Функция входа - ОБНОВЛЕННАЯ
export async function loginUser(email, password) {
  try {
    console.log('🔐 Attempting login...', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log('✅ Login successful:', data.user);
    
    // Гарантируем что профиль существует
    await ensureProfileExists(data.user);
    
    return { success: true, user: data.user };

  } catch (error) {
    console.error('🚨 Login error:', error);
    return { success: false, error: error.message };
  }
}

// Функция выхода
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout error:', error);
}

// Функция для создания профиля если его нет - ОБНОВЛЕННАЯ
export async function ensureProfileExists(user) {
  try {
    // Сначала проверяем существует ли профиль
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') { // Profile not found
      console.log('🔄 Profile not found, creating...');
      
      const username = user.user_metadata?.username || user.email.split('@')[0];
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: username,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create profile:', createError);
        throw createError;
      }
      
      console.log('✅ Profile created:', newProfile);
      return { success: true, profile: newProfile };
    } else if (fetchError) {
      throw fetchError;
    }
    
    console.log('✅ Profile exists:', profile);
    return { success: true, profile: profile };
    
  } catch (error) {
    console.error('❌ Error ensuring profile exists:', error);
    return { success: false, error: error.message };
  }
}

// Проверка авторизации
export async function checkAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
