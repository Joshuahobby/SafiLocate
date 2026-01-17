import { app, initPromise } from '../server/index';

export default async (req: any, res: any) => {
  try {
    // Log environment variable presence (not values for security)
    const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.warn(`Missing critical environment variables: ${missingVars.join(', ')}`);
    }

    await initPromise;
    return app(req, res);
  } catch (error: any) {
    console.error('CRITICAL: Server initialization failed:', error);
    
    // Explicitly send JSON response for 500 errors during startup
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    
    const errorDetails = {
      error: 'Server initialization failed',
      message: error instanceof Error ? error.message : String(error),
      name: error?.name,
      code: error?.code,
      details: error?.errors || error?.details || undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-vercel-id'] || 'local'
    };

    res.end(JSON.stringify(errorDetails));
  }
};
