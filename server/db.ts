import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    console.warn(
        "DATABASE_URL not set. Application will run in memory mode. " +
        "To use persistence, set DATABASE_URL environment variable."
    );
}

// Create a pool regardless, but it will only work if URL is set
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
export const db = drizzle(pool, { schema });
