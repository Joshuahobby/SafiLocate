import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set. Did you forget to provision a database?");
    // Do NOT throw here, as it crashes the Vercel builder/runtime immediately before the handler can run.
    // Instead, let it fail when the pool is used and caught by api/index.ts.
}

// Create a pool regardless, but it will only work if URL is set
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Decrease pool size for serverless/Vercel (effectively 1 per lambda)
    max: process.env.VERCEL || process.env.NODE_ENV === 'production' ? 1 : 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });
