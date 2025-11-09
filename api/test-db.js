import prisma from '../../lib/prisma.js';

export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Testing DB connection...');
    
    // Простой запрос к БД
    const usersCount = await prisma.user.count();
    
    res.status(200).json({ 
      success: true, 
      message: '✅ Database connected successfully!',
      usersCount: usersCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
    
    // Пробуем альтернативный запрос
    try {
      const result = await prisma.$queryRaw`SELECT 1 as connection_test`;
      res.status(200).json({ 
        success: true, 
        message: '✅ Database connected (alternative test)!',
        test: result,
        timestamp: new Date().toISOString()
      });
    } catch (secondError) {
      res.status(500).json({ 
        success: false, 
        error: 'Database connection failed',
        details: secondError.message,
        suggestion: 'Check Prisma schema and database URL'
      });
    }
  }
}
