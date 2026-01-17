import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { sanitizeInputs } from "./middleware/sanitize.js";

export const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "50mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Allow scripts from self, unsafe-inline (often needed for React/Vite), and external service checks
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.flutterwave.com", "https://*.googleapis.com"],
      // Allow connections to self, ws (for HMR), and external services
      connectSrc: ["'self'", "ws:", "wss:", "https://api.flutterwave.com", "https://*.googleapis.com"],
      // Allow images from self, data (base64 replacement), and Cloudinary
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.google.com"],
      // Allow styles
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      // Allow fonts
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

// Rate limiting - more lenient in development
const isDev = process.env.NODE_ENV !== "production";
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 100, // Higher limit in dev
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/uploads") || req.path.includes("."), // Skip static files
}));

// Stricter rate limiting for auth endpoints (prevent brute force)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 5, // 5 attempts in production
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/login", authRateLimiter);
app.use("/api/register", authRateLimiter);

// Input sanitization middleware (XSS prevention)
app.use(sanitizeInputs);

app.use("/uploads", express.static("uploads", { maxAge: "1d" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

import { setupAuth } from "./auth.js";

// Export the initialization promise so tests can wait for it
export const initPromise = (async () => {
  console.log("Starting server initialization sequence...");
  try {
    console.log("1. Setting up auth...");
    setupAuth(app);
    console.log("✓ Auth setup complete.");

    console.log("2. Registering routes...");
    await registerRoutes(httpServer, app);
    console.log("✓ Routes registered.");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Express Error Middleware caught:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      // If headers sent, we can't send another response
      if (res.headersSent) {
          console.error("Headers already sent, cannot send error response.");
          return;
      }

      res.status(status).json({ 
          message,
          error: err.name,
          details: err.errors || err.details || undefined 
      });
      // Don't re-throw here on Vercel as it can crash the lambda before logs are flushed
    });

    if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
      console.log("3. Production mode: serving static files...");
      serveStatic(app);
      console.log("✓ Static files setup.");
    } else if (process.env.NODE_ENV !== "test") {
      console.log("3. Development mode: setting up Vite...");
      const { setupVite } = await import("./vite.js");
      await setupVite(httpServer, app);
      console.log("✓ Vite setup complete.");
    }

    const port = parseInt(process.env.PORT || "5000", 10);
    if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
      httpServer.listen(port, () => {
        log(`serving on port ${port}`);
      });
    }
    console.log("✓ Server initialization successful.");
  } catch (error: any) {
    console.error("!!! CRITICAL ERROR DURING SERVER INITIALIZATION !!!");
    console.error("Error Name:", error?.name);
    console.error("Error Message:", error?.message);
    
    // Detailed Zod Error logging
    if (error?.name === 'ZodError') {
        console.error("Zod Validation Errors:", JSON.stringify(error.errors, null, 2));
    }
    
    console.error("Stack Trace:", error?.stack);
    
    // Rethrow to reject initPromise
    throw error;
  }
})()
.catch((err) => {
    console.error("Initialization failed permanently:", err);
    throw err; // Ensure the promise rejects so api/index.ts can handle it
});
