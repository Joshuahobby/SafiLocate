import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { sanitizeInputs } from "./middleware/sanitize";

const app = express();
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

import { setupAuth } from "./auth";

(async () => {
  setupAuth(app);
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "3000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
