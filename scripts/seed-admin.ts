/**
 * Seed Admin User Script
 * 
 * This script creates the initial admin user.
 * Should only be run once during initial setup.
 * 
 * Usage: npx tsx -r dotenv/config scripts/seed-admin.ts
 */

import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import bcrypt from "bcrypt";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SafiAdmin2024!";

async function seedAdmin() {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL environment variable is required");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    const db = drizzle(pool);

    try {
        console.log("🔍 Checking for existing admin user...");

        // Check if admin already exists
        const [existingAdmin] = await db
            .select()
            .from(users)
            .where(eq(users.username, ADMIN_USERNAME))
            .limit(1);

        if (existingAdmin) {
            console.log(`⚠️  Admin user '${ADMIN_USERNAME}' already exists.`);
            console.log("   To change password, update directly in database or use the admin panel.");
            process.exit(0);
        }

        // Create admin user
        console.log(`📝 Creating admin user: ${ADMIN_USERNAME}`);

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const [newAdmin] = await db
            .insert(users)
            .values({
                username: ADMIN_USERNAME,
                password: hashedPassword,
                role: "admin",
                email: null,
                phone: null,
            })
            .returning();

        console.log("✅ Admin user created successfully!");
        console.log("");
        console.log("   ┌─────────────────────────────────────┐");
        console.log("   │  ADMIN CREDENTIALS (SAVE THESE!)   │");
        console.log("   ├─────────────────────────────────────┤");
        console.log(`   │  Username: ${ADMIN_USERNAME.padEnd(24)}│`);
        console.log(`   │  Password: ${ADMIN_PASSWORD.padEnd(24)}│`);
        console.log("   └─────────────────────────────────────┘");
        console.log("");
        console.log("   ⚠️  Change this password after first login!");
        console.log("");

    } catch (error) {
        console.error("❌ Error creating admin user:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedAdmin();
