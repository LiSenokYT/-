import { supabase } from './supabase.js'

export async function registerUser(email, password, username) {
  try {
    console.log('🔧 Starting registration...', { email, username });
    
    // 1. РЕГИСТРАЦИЯ
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) throw error;

    console.log('✅ User registered:', data.user);

    // 2. СОЗДАНИЕ ПРОФИЛЯ С ПРОВЕРКОЙ
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
      console.error('❌ Profile error details:', profileError);
      // Но все равно возвращаем успех, т.к. пользователь создан
      return { success: true, user: data.user, profileError: profileError.message };
    }

    console.log('✅ Profile created:', profileData);
    return { success: true, user: data.user, profile: profileData };
    
  } catch (error) {
    console.error('🚨 Registration error:', error);
    return { success: false, error: error.message };
  }
}
