/**
 * Seed Script: Create Initial Admin User
 * 
 * Usage: tsx script/seed-admin.ts
 * 
 * This script creates the initial admin user in the database.
 * Make sure DATABASE_URL is set in your environment.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { users } from "../shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedAdmin() {
  try {
    console.log("🌱 Starting admin seed...");

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(sql`${users.username} = 'admin'`)
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("⚠️  Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    // Get admin password from environment or use default
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@safilocate.com";

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminId = randomUUID();
    const [admin] = await db
      .insert(users)
      .values({
        id: adminId,
        username: "admin",
        password: hashedPassword,
        role: "admin",
        email: adminEmail,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email || "Not set"}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log("\n⚠️  IMPORTANT: Change the default password after first login!");

    if (adminPassword === "admin123") {
      console.log("\n⚠️  Using default password 'admin123'. Set ADMIN_PASSWORD env var for production.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}



seedAdmin();
