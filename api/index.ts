import { app, initPromise } from '../server/index.js';

export default async (req: any, res: any) => {
  try {
    // 1. Log Request Context
    console.log(`[API] ${req.method} ${req.url}`);

    // 2. Check Critical Env Vars
    const hasDb = !!process.env.DATABASE_URL;
    const hasSession = !!process.env.SESSION_SECRET;
export default async function (req: VercelRequest, res: VercelResponse) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] API Handler started: ${req.method} ${req.url}`);

    try {
        // Wait for initialization with a timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Initialization timed out after 25s")), 25000)
        );

        console.log(`[${requestId}] Waiting for server initialization...`);
        await Promise.race([initPromise, timeoutPromise]);
        console.log(`[${requestId}] Server initialized successfully.`);

        // Process request
        return app(req, res);
    } catch (error: any) {
        console.error(`[${requestId}] CRITICAL ERROR in API Handler:`, error);
        
        // Attempt to send a meaningful error response
        if (!res.headersSent) {
            res.status(500).json({
                error: "Internal Server Error",
                message: error.message,
                requestId,
                phase: "initialization"
            });
        }
    }
      timestamp: new Date().toISOString()
    };

    res.end(JSON.stringify(errorDetails));
  }
};
