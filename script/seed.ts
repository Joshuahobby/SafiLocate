
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, foundItems, lostItems, claims, reports } from "../shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log("🌱 Starting full database seed...");

  try {
    // 1. Create Users
    console.log("Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const user1Id = randomUUID();
    const user2Id = randomUUID();
    
    await db.insert(users).values([
      {
        id: user1Id,
        username: "john_doe",
        password: hashedPassword,
        email: "john@example.com",
        role: "user",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: user2Id,
        username: "jane_smith",
        password: hashedPassword,
        email: "jane@example.com",
        role: "user",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]).onConflictDoNothing(); // Prevent error if running multiple times

    // 2. Create Found Items
    console.log("Creating found items...");
    await db.insert(foundItems).values([
      {
        category: "electronics",
        title: "iPhone 14 Pro found in taxi",
        description: "Black iPhone 14 Pro found in a Yego cab. Screen is cracked slightly.",
        location: "Kigali, Remera",
        dateFound: new Date().toISOString().split('T')[0],
        status: "active",
        contactName: "Jean Paul",
        contactPhone: "+250788111222",
        finderEmail: "jean@example.com",
        createdAt: new Date(),
        tags: ["iphone", "black", "apple"],
      },
      {
        category: "documents",
        title: "ID Card - Mukeshimana",
        description: "National ID found near Kigali Heights.",
        location: "Kigali, Kimihurura",
        dateFound: new Date().toISOString().split('T')[0],
        status: "active",
        contactName: "Security Guard",
        contactPhone: "+250788333444",
        tags: ["id", "documents"],
        createdAt: new Date(),
      }
    ]);

    // 3. Create Lost Items
    console.log("Creating lost items...");
    await db.insert(lostItems).values([
      {
        category: "pets",
        title: "Lost Golden Retriever",
        description: "Lost my dog 'Max' near Nyarutarama. He has a blue collar.",
        location: "Kigali, Nyarutarama",
        dateLost: new Date().toISOString().split('T')[0],
        status: "active",
        contactName: "Sarah Jones",
        contactPhone: "+250788555666",
        seekerEmail: "sarah@example.com",
        reward: "50000",
        createdAt: new Date(),
        tags: ["dog", "pet", "golden retriever"],
        paymentStatus: "paid",
        priceTier: "standard"
      },
      {
        category: "keys",
        title: "Car Keys (Toyota)",
        description: "Lost a set of Toyota car keys with a leather keychain.",
        location: "Kigali, Downtown",
        dateLost: new Date().toISOString().split('T')[0],
        status: "active",
        contactName: "David",
        contactPhone: "+250788777888",
        createdAt: new Date(),
        tags: ["keys", "car", "toyota"],
        paymentStatus: "paid",
        priceTier: "standard"
      }
    ]);

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
