export default function handler(request) {
  return Response.json({
    success: true,
    message: 'Test endpoint works!',
    timestamp: new Date().toISOString()
  });
}
