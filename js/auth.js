import { supabase } from './supabase.js'

// Функция регистрации
export async function registerUser(email, password, username) {
  try {
    console.log('🔧 Starting registration...', { email, username });
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) throw error;

    console.log('✅ User registered:', data.user);

    // Создание профиля
    console.log('🎯 Creating profile for user:', data.user.id);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: username,
        email: email
      })
      .select();

    console.log('📊 Profile creation result:', { profileData, profileError });

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return { success: true, user: data.user, profileError: profileError.message };
    }

    console.log('✅ Profile created:', profileData);
    return { success: true, user: data.user, profile: profileData };
    
  } catch (error) {
    console.error('🚨 Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Функция входа
export async function loginUser(email, password) {
  try {
    console.log('🔐 Attempting login...', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log('✅ Login successful:', data.user);
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
