import prisma from '../../../lib/prisma.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('Testing database connection...');
    
    // Простой запрос для проверки
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    
    res.status(200).json({ 
      success: true, 
      message: '✅ Database connected!',
      time: result[0].current_time
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message
    });
  }
}
