import type { VercelRequest, VercelResponse } from '@vercel/node';

console.log(">>> Lambda Script Global Scope Loaded <<<");

export default async function (req: VercelRequest, res: VercelResponse) {
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();
    
    console.log(`[${requestId}] [${timestamp}] >>> HANDLER START: ${req.method} ${req.url} <<<`);
    console.log(`[${requestId}] Environment: VERCEL=${process.env.VERCEL}, NODE_ENV=${process.env.NODE_ENV}`);

    try {
        console.log(`[${requestId}] Status: Dynamically importing ../server/index.js...`);
        // Dynamic import to prevent top-level module evaluation crashes from hiding logs
        const { app, initPromise } = await import('../server/index.js');
        console.log(`[${requestId}] Status: Import successful.`);

        // Wait for initialization with a timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Initialization timed out after 25s")), 25000)
        );

        console.log(`[${requestId}] Status: Waiting for initPromise...`);
        try {
            await Promise.race([initPromise, timeoutPromise]);
            console.log(`[${requestId}] Status: Init complete.`);
        } catch (initErr: any) {
            console.error(`[${requestId}] Status: Init FAILED:`, initErr);
            throw initErr;
        }

        // Process request
        console.log(`[${requestId}] Status: Passing request to Express app...`);
        return app(req, res);
    } catch (error: any) {
        console.error(`[${requestId}] CRITICAL ERROR IN HANDLER:`, error);
        console.error(`[${requestId}] Error Name:`, error?.name);
        console.error(`[${requestId}] Error Message:`, error?.message);
        console.error(`[${requestId}] Stack:`, error?.stack);
        
        if (!res.headersSent) {
            res.status(500).json({
                error: "Lambda Handler Error",
                message: error.message,
                requestId,
                phase: "warmup/execution",
                timestamp: new Date().toISOString()
            });
        }
    }
}
