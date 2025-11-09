import { supabase } from './supabase.js'

async function createUserProfile(userId, username, email) {
  try {
    console.log('🎯 PROFILE CREATION STARTED');
    console.log('📝 Profile data:', { userId, username, email });

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username: username,
          full_name: username,
          email: email
        }
      ])
      .select()

    console.log('📊 INSERT RESULT:', { data, error });
    
    if (error) {
      console.error('❌ PROFILE ERROR:', error);
      // Пробуем альтернативный запрос
      console.log('🔄 Trying alternative insert...');
      
      const { data: altData, error: altError } = await supabase
        .from('profiles')
        .insert({ id: userId, username: username })
        .select();
      
      console.log('🔄 ALTERNATIVE RESULT:', { altData, altError });
      throw error;
    }
    
    console.log('✅ PROFILE SUCCESS:', data);
    return { success: true, profile: data[0] };
    
  } catch (error) {
    console.error('🚨 FINAL PROFILE ERROR:', error);
    return { success: false, error: error.message };
  }
}

export async function registerUser(email, password, username) {
  try {
    console.log('🔧 REGISTRATION STARTED');
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) throw error;

    console.log('✅ AUTH SUCCESS, User ID:', data.user.id);
    
    // Создаем профиль
    const profileResult = await createUserProfile(data.user.id, username, email);
    
    console.log('🎯 FINAL REGISTRATION RESULT:', profileResult);
    
    return { 
      success: true, 
      user: data.user,
      profileCreated: profileResult.success 
    };
    
  } catch (error) {
    console.error('🚨 REGISTRATION FAILED:', error);
    return { success: false, error: error.message };
  }
}
