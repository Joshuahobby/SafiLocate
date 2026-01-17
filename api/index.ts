import { app, initPromise } from '../server/index.js';

export default async (req: any, res: any) => {
  try {
    // 1. Log Request Context
    console.log(`[API] ${req.method} ${req.url}`);

    // 2. Check Critical Env Vars
    const hasDb = !!process.env.DATABASE_URL;
    const hasSession = !!process.env.SESSION_SECRET;
    
    console.log(`[Env Check] DATABASE_URL present: ${hasDb}`);
    console.log(`[Env Check] SESSION_SECRET present: ${hasSession}`);
    console.log(`[Env Check] NODE_ENV: ${process.env.NODE_ENV}`);

    if (!hasDb || !hasSession) {
      throw new Error(`Missing Env Vars: DB=${hasDb}, Session=${hasSession}`);
    }

    // 3. Wait for Server Init
    console.log("[API] Waiting for server initialization...");
    await initPromise;
    console.log("[API] Server ready. Delegating request...");

    return app(req, res);
  } catch (error: any) {
    console.error('CRITICAL: Server initialization failed:', error);
    
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    
    const errorDetails = {
      error: 'Server initialization failed',
      message: error instanceof Error ? error.message : String(error),
      envCheck: {
        hasDb: !!process.env.DATABASE_URL,
        hasSession: !!process.env.SESSION_SECRET
      },
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined, // Safe to show in dev
      timestamp: new Date().toISOString()
    };

    res.end(JSON.stringify(errorDetails));
  }
};
