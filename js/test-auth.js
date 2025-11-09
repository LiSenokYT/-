import { supabase } from './supabase.js'

async function testSupabase() {
  console.log('🔧 Testing Supabase connection...')
  
  // Тест простого запроса к БД вместо аутентификации
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (error) {
    console.log('❌ Database error:', error.message)
  } else {
    console.log('✅ Supabase connected! Data:', data)
  }
}

testSupabase()
