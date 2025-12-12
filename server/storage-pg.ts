/**
 * PostgreSQL Storage Implementation
 * 
 * This is the production storage layer using Drizzle ORM with PostgreSQL.
 * Replace MemStorage with this implementation once database is set up.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, or, desc, sql, ilike, gte, lte } from "drizzle-orm";
import {
  users,
  foundItems,
  lostItems,
  claims,
  payments,
  reports,
  type User,
  type InsertUser,
  type FoundItem,
  type InsertFoundItem,
  type LostItem,
  type InsertLostItem,
  type Claim,
  type InsertClaim,
  type Payment,
  type InsertPayment,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { IStorage } from "./storage";
import { LISTING_DURATION_DAYS, RECEIPT_PREFIXES } from "@shared/constants";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const db = drizzle(pool);

export class PgStorage implements IStorage {
  // ============ Users ============
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // ============ Found Items ============
  async createFoundItem(itemData: InsertFoundItem): Promise<FoundItem> {
    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber("found");

    const [item] = await db
      .insert(foundItems)
      .values({
        ...itemData,
        receiptNumber,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return item;
  }

  async getFoundItem(id: string): Promise<FoundItem | undefined> {
    const [item] = await db
      .select()
      .from(foundItems)
      .where(eq(foundItems.id, id))
      .limit(1);
    return item;
  }

  async getFoundItemByReceiptNumber(receiptNumber: string): Promise<FoundItem | undefined> {
    const [item] = await db
      .select()
      .from(foundItems)
      .where(eq(foundItems.receiptNumber, receiptNumber))
      .limit(1);
    return item;
  }

  async listFoundItems(filters: {
    status?: string;
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: FoundItem[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(foundItems.status, filters.status as any));
    }
    if (filters.category) {
      conditions.push(eq(foundItems.category, filters.category));
    }
    if (filters.location) {
      conditions.push(ilike(foundItems.location, `%${filters.location}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(foundItems)
      .where(whereClause)
      .orderBy(desc(foundItems.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(foundItems)
      .where(whereClause);

    return {
      items,
      total: Number(count),
    };
  }

  async updateFoundItemStatus(id: string, status: string): Promise<FoundItem> {
    const [item] = await db
      .update(foundItems)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(foundItems.id, id))
      .returning();

    return item;
  }

  async deleteFoundItem(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(foundItems)
      .where(eq(foundItems.id, id))
      .returning();
    return !!deleted;
  }

  // ============ Lost Items ============
  async createLostItem(itemData: InsertLostItem): Promise<LostItem> {
    const [item] = await db
      .insert(lostItems)
      .values({
        ...itemData,
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return item;
  }

  async getLostItem(id: string): Promise<LostItem | undefined> {
    const [item] = await db
      .select()
      .from(lostItems)
      .where(eq(lostItems.id, id))
      .limit(1);
    return item;
  }

  async listLostItems(filters: {
    status?: string;
    paymentStatus?: string;
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: LostItem[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(lostItems.status, filters.status as any));
    }
    if (filters.paymentStatus) {
      conditions.push(eq(lostItems.paymentStatus, filters.paymentStatus as any));
    }
    if (filters.category) {
      conditions.push(eq(lostItems.category, filters.category));
    }
    if (filters.location) {
      conditions.push(ilike(lostItems.location, `%${filters.location}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(lostItems)
      .where(whereClause)
      .orderBy(desc(lostItems.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(lostItems)
      .where(whereClause);

    return {
      items,
      total: Number(count),
    };
  }

  async updateLostItemStatus(id: string, status: string): Promise<LostItem> {
    const [item] = await db
      .update(lostItems)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(lostItems.id, id))
      .returning();

    return item;
  }

  async deleteLostItem(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(lostItems)
      .where(eq(lostItems.id, id))
      .returning();
    return !!deleted;
  }

  async activateLostItem(id: string, expiresAt: Date): Promise<LostItem> {
    const [item] = await db
      .update(lostItems)
      .set({
        status: "active",
        paymentStatus: "paid",
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(lostItems.id, id))
      .returning();

    return item;
  }

  async getExpiredLostItems(): Promise<LostItem[]> {
    const now = new Date();
    return await db
      .select()
      .from(lostItems)
      .where(
        and(
          eq(lostItems.status, "active"),
          lte(lostItems.expiresAt, now)
        )
      );
  }

  // ============ Claims ============
  async createClaim(claimData: InsertClaim): Promise<Claim> {
    const [claim] = await db
      .insert(claims)
      .values({
        ...claimData,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return claim;
  }

  async getClaim(id: string): Promise<Claim | undefined> {
    const [claim] = await db
      .select()
      .from(claims)
      .where(eq(claims.id, id))
      .limit(1);
    return claim;
  }

  async listClaims(filters: {
    itemId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Claim[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filters.itemId) {
      conditions.push(eq(claims.itemId, filters.itemId));
    }
    if (filters.status) {
      conditions.push(eq(claims.status, filters.status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(claims)
      .where(whereClause)
      .orderBy(desc(claims.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(claims)
      .where(whereClause);

    return {
      items,
      total: Number(count),
    };
  }

  async updateClaimStatus(
    id: string,
    status: string,
    verifiedBy?: string
  ): Promise<Claim> {
    const updateData: any = {
      status: status as any,
      updatedAt: new Date(),
    };

    if (status === "verified" && verifiedBy) {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = verifiedBy;
    }

    const [claim] = await db
      .update(claims)
      .set(updateData)
      .where(eq(claims.id, id))
      .returning();

    return claim;
  }

  // ============ Payments ============
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values({
        ...paymentData,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return payment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);
    return payment;
  }

  async getPaymentByTxRef(txRef: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.flutterwaveTxRef, txRef))
      .limit(1);
    return payment;
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment> {
    const updateData: any = {
      status: status as any,
      updatedAt: new Date(),
    };

    if (status === "success" || status === "paid") {
      updateData.paidAt = new Date();
    }

    const [payment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();

    return payment;
  }

  // ============ Reports ============
  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values({
        ...reportData,
        status: "pending",
        createdAt: new Date(),
      })
      .returning();

    return report;
  }

  async listReports(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Report[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(reports.status, filters.status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(reports)
      .where(whereClause)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(whereClause);

    return {
      items,
      total: Number(count),
    };
  }

  // ============ Helper Methods ============
  private async generateReceiptNumber(type: "found" | "lost"): Promise<string> {
    const prefix = RECEIPT_PREFIXES[type];
    // Generate random 5-digit number
    const number = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    return `${prefix}-${number}`;
  }

  // ============ Search Methods ============
  async searchItems(filters: {
    query?: string;
    type?: "found" | "lost" | "all";
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: (FoundItem | LostItem)[]; total: number }> {
    // This is a simplified search - full-text search will be implemented later
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filters.category) {
      // Would need to search both tables
    }
    if (filters.location) {
      // Would need to search both tables
    }

    // For now, return empty - full implementation in Phase 2
    return {
      items: [],
      total: 0,
    };
  }
}

// Export singleton instance
export const pgStorage = new PgStorage();
