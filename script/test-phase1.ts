/**
 * Phase 1 Testing Script
 * 
 * Tests database setup, schema, and storage layer
 * 
 * Usage: tsx script/test-phase1.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import {
  users,
  foundItems,
  lostItems,
  claims,
  payments,
  reports,
} from "@shared/schema";
import { storage } from "../server/storage";
import { LISTING_PRICES } from "@shared/constants";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  console.log("\nPlease set DATABASE_URL in your .env file:");
  console.log("DATABASE_URL=postgresql://user:password@localhost:5432/safilocate");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Test results
const results: { test: string; status: "pass" | "fail"; message: string }[] = [];

function logTest(test: string, status: "pass" | "fail", message: string) {
  results.push({ test, status, message });
  const icon = status === "pass" ? "✅" : "❌";
  console.log(`${icon} ${test}: ${message}`);
}

async function testDatabaseConnection() {
  try {
    await pool.query("SELECT 1");
    logTest("Database Connection", "pass", "Successfully connected to PostgreSQL");
    return true;
  } catch (error: any) {
    logTest("Database Connection", "fail", error.message);
    return false;
  }
}

async function testTablesExist() {
  const tables = [
    "users",
    "found_items",
    "lost_items",
    "claims",
    "payments",
    "reports",
  ];

  let allExist = true;
  for (const table of tables) {
    try {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );
      const exists = result.rows[0].exists;
      if (exists) {
        logTest(`Table: ${table}`, "pass", "Table exists");
      } else {
        logTest(`Table: ${table}`, "fail", "Table does not exist - run 'npm run db:push'");
        allExist = false;
      }
    } catch (error: any) {
      logTest(`Table: ${table}`, "fail", error.message);
      allExist = false;
    }
  }
  return allExist;
}

async function testEnumsExist() {
  const enums = [
    "user_role",
    "item_status",
    "payment_status",
    "claim_status",
    "report_reason",
    "report_status",
    "price_tier",
  ];

  let allExist = true;
  for (const enumName of enums) {
    try {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_type 
          WHERE typname = $1
        )`,
        [enumName]
      );
      const exists = result.rows[0].exists;
      if (exists) {
        logTest(`Enum: ${enumName}`, "pass", "Enum exists");
      } else {
        logTest(`Enum: ${enumName}`, "fail", "Enum does not exist - run 'npm run db:push'");
        allExist = false;
      }
    } catch (error: any) {
      logTest(`Enum: ${enumName}`, "fail", error.message);
      allExist = false;
    }
  }
  return allExist;
}

async function testIndexesExist() {
  const indexes = [
    "idx_users_username",
    "idx_found_items_category",
    "idx_found_items_status",
    "idx_lost_items_category",
    "idx_lost_items_status",
    "idx_claims_item_id",
    "idx_payments_tx_ref",
  ];

  let allExist = true;
  for (const indexName of indexes) {
    try {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE indexname = $1
        )`,
        [indexName]
      );
      const exists = result.rows[0].exists;
      if (exists) {
        logTest(`Index: ${indexName}`, "pass", "Index exists");
      } else {
        logTest(`Index: ${indexName}`, "fail", "Index does not exist");
        allExist = false;
      }
    } catch (error: any) {
      logTest(`Index: ${indexName}`, "fail", error.message);
      allExist = false;
    }
  }
  return allExist;
}

async function testStorageOperations() {
  try {
    // Test creating a found item
    const testFoundItem = await storage.createFoundItem({
      category: "electronics",
      title: "Test Phone",
      description: "A test phone for testing purposes",
      location: "Kigali, Nyarugenge",
      dateFound: new Date().toISOString().split("T")[0],
      imageUrls: [],
      contactName: "Test User",
      contactPhone: "+250788000000",
      finderEmail: "test@example.com",
    });

    if (testFoundItem && testFoundItem.id) {
      logTest("Storage: Create Found Item", "pass", `Created item with ID: ${testFoundItem.id}`);
      
      // Test retrieving it
      const retrieved = await storage.getFoundItem(testFoundItem.id);
      if (retrieved) {
        logTest("Storage: Get Found Item", "pass", "Successfully retrieved item");
      } else {
        logTest("Storage: Get Found Item", "fail", "Could not retrieve item");
      }
    } else {
      logTest("Storage: Create Found Item", "fail", "Failed to create item");
    }

    // Test creating a lost item
    const testLostItem = await storage.createLostItem({
      category: "wallet",
      title: "Test Wallet",
      description: "A test wallet for testing purposes",
      location: "Kigali, Kicukiro",
      dateLost: new Date().toISOString().split("T")[0],
      imageUrls: [],
      contactName: "Test Seeker",
      contactPhone: "+250788000001",
      seekerEmail: "seeker@example.com",
      priceTier: "standard",
    });

    if (testLostItem && testLostItem.id) {
      logTest("Storage: Create Lost Item", "pass", `Created item with ID: ${testLostItem.id}`);
    } else {
      logTest("Storage: Create Lost Item", "fail", "Failed to create item");
    }

    return true;
  } catch (error: any) {
    logTest("Storage Operations", "fail", error.message);
    return false;
  }
}

async function testConstants() {
  try {
    if (LISTING_PRICES.standard === 1000) {
      logTest("Constants: Pricing", "pass", "Pricing constants defined correctly");
    } else {
      logTest("Constants: Pricing", "fail", "Pricing constants incorrect");
      return false;
    }
    return true;
  } catch (error: any) {
    logTest("Constants", "fail", error.message);
    return false;
  }
}

async function testAdminUser() {
  try {
    const admin = await storage.getUserByUsername("admin");
    if (admin && admin.role === "admin") {
      logTest("Admin User", "pass", "Admin user exists");
      return true;
    } else {
      logTest("Admin User", "fail", "Admin user not found - run 'npm run seed:admin'");
      return false;
    }
  } catch (error: any) {
    logTest("Admin User", "fail", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🧪 Phase 1 Testing Suite\n");
  console.log("=" .repeat(50));

  // Test 1: Database Connection
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log("\n❌ Cannot proceed without database connection");
    await pool.end();
    process.exit(1);
  }

  console.log("\n");

  // Test 2: Tables Exist
  await testTablesExist();
  console.log("\n");

  // Test 3: Enums Exist
  await testEnumsExist();
  console.log("\n");

  // Test 4: Indexes Exist
  await testIndexesExist();
  console.log("\n");

  // Test 5: Constants
  await testConstants();
  console.log("\n");

  // Test 6: Storage Operations (only if using MemStorage)
  if (process.env.NODE_ENV !== "production") {
    await testStorageOperations();
    console.log("\n");
  }

  // Test 7: Admin User
  await testAdminUser();
  console.log("\n");

  // Summary
  console.log("=" .repeat(50));
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const total = results.length;

  console.log(`\n📊 Test Summary:`);
  console.log(`   Total Tests: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Phase 1 is ready.");
  } else {
    console.log("\n⚠️  Some tests failed. Please review the errors above.");
    console.log("\nCommon fixes:");
    console.log("   - Run 'npm run db:push' to create tables");
    console.log("   - Run 'npm run seed:admin' to create admin user");
    console.log("   - Check DATABASE_URL in .env file");
  }

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch((error) => {
  console.error("❌ Test suite error:", error);
  process.exit(1);
});
