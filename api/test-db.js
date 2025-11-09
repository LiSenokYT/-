// /api/test-db.js
import prisma from '../../lib/prisma.js';

export default async function handler(req, res) {
  // Добавляем CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connected successfully');
    
    res.status(200).json({ 
      success: true, 
      message: '✅ Database connected!',
      data: result
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
