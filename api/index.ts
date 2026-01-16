import { app, initPromise } from '../server/index';

export default async (req: any, res: any) => {
  try {
    await initPromise;
    return app(req, res);
  } catch (error: any) {
    console.error('Server initialization failed:', error);
    // Explicitly send JSON response for 500 errors during startup
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Server initialization failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }));
  }
};
