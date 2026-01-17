import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing or undefined (type:", typeof process.env.DATABASE_URL, ")");
} else {
    console.log("DATABASE_URL is present (length:", process.env.DATABASE_URL.length, ")");
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

pool.connect().then(client => {
    console.log('Database connected successfully');
    client.release();
}).catch(err => {
    console.error('Database connection failed:', err);
});
export const db = drizzle(pool, { schema });
