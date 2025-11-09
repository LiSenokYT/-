import { supabase } from './supabase.js'

export async function registerUser(email, password, username) {
  try {
    console.log('🔧 Starting registration...', { email, username });
    
    // 1. РЕГИСТРАЦИЯ (это работало)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) throw error;

    console.log('✅ User registered:', data.user);

    // 2. ПРОФИЛЬ - ПРОСТОЙ ВАРИАНТ
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            username: username,
            email: email
          }
        ]);

      if (profileError) {
        console.warn('⚠️ Profile not created:', profileError.message);
      } else {
        console.log('✅ Profile created successfully');
      }
    } catch (profileError) {
      console.warn('⚠️ Profile creation failed:', profileError.message);
    }

    return { success: true, user: data.user };
    
  } catch (error) {
    console.error('🚨 Registration error:', error);
    return { success: false, error: error.message };
  }
}
