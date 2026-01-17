import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app, initPromise } from '../server/index.js';
console.log("Vercel Lambda initialized. Importing server/index.js...");


export default async function (req: VercelRequest, res: VercelResponse) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] API Request: ${req.method} ${req.url}`);

    try {
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
        return app(req, res);
    } catch (error: any) {
        console.error(`[${requestId}] CRITICAL ERROR:`, error);
        
        if (!res.headersSent) {
            res.status(500).json({
                error: "Internal Server Error",
                message: error.message,
                requestId,
                phase: "initialization",
                timestamp: new Date().toISOString()
            });
        }
    }
}
