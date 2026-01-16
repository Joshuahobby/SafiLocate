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
  type AuditLog,
  type InsertAuditLog,
  type SystemSetting,
  auditLogs,
  systemSettings,
} from "@shared/schema";
import { IStorage } from "./storage";
import { LISTING_DURATION_DAYS, RECEIPT_PREFIXES } from "@shared/constants";
import { matchingService } from "./services/matching.service";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
}

import { pool, db } from "./db";

import session from "express-session";
import connectPg from "connect-pg-simple";
const PgSessionStore = connectPg(session);

export class PgStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PgSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }
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

  async listUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;

    const allUsers = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    return {
      users: allUsers,
      total: Number(count),
    };
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const validRoles = ["user", "admin", "moderator"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ role: role as any })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { id: _id, createdAt: _createdAt, ...updateData } = updates as any;
    const [updatedUser] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // ============ Found Items ============
  async createFoundItem(item: InsertFoundItem & { tags?: string[] }): Promise<FoundItem> {
    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber("found");

    const searchContent = [
      item.title || '',
      item.description || '',
      (item.tags || []).join(' ')
    ].join(' ');

    const [newItem] = await db
      .insert(foundItems)
      .values({
        ...item,
        description: item.description ?? null,
        location: item.location ?? null,
        contactName: item.contactName ?? null,
        contactPhone: item.contactPhone ?? null,
        finderEmail: item.finderEmail ?? null,
        finderPhone: item.finderPhone ?? null,
        imageUrls: item.imageUrls ?? null,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: item.tags || [],
        searchVector: sql`to_tsvector('english', ${searchContent})`
      })
      .returning();

    return newItem;
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
    search?: string;
    startDate?: Date;
    endDate?: Date;
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
    if (filters.search) {
      const query = sql`websearch_to_tsquery('english', ${filters.search})`;
      conditions.push(sql`${foundItems.searchVector} @@ ${query}`);
    }

    if (filters.startDate) {
      conditions.push(sql`${foundItems.createdAt} >= ${filters.startDate}`);
    }
    if (filters.endDate) {
      conditions.push(sql`${foundItems.createdAt} <= ${filters.endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(foundItems)
      .where(whereClause)
      .orderBy(...(filters.search
        ? [desc(sql`ts_rank(${foundItems.searchVector}, websearch_to_tsquery('english', ${filters.search}))`), desc(foundItems.createdAt)]
        : [desc(foundItems.createdAt)]
      ))
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

  async updateFoundItem(id: string, item: Partial<FoundItem>): Promise<FoundItem> {
    // Exclude id and createdAt from the update payload
    const { id: _id, createdAt: _createdAt, ...updateData } = item as any;
    const [updated] = await db
      .update(foundItems)
      .set({
        ...updateData,
        updatedAt: new Date(),
        searchVector: sql`to_tsvector('english', coalesce(${updateData.title}, title) || ' ' || coalesce(${updateData.description}, description) || ' ' || array_to_string(coalesce(${updateData.tags}, tags), ' '))`
      })
      .where(eq(foundItems.id, id))
      .returning();
    return updated;
  }

  async deleteFoundItem(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(foundItems)
      .where(eq(foundItems.id, id))
      .returning();
    return !!deleted;
  }

  // ============ Lost Items ============
  async createLostItem(item: InsertLostItem & { tags?: string[] }): Promise<LostItem> {
    const searchContent = [
      item.title || '',
      item.description || '',
      (item.tags || []).join(' ')
    ].join(' ');

    const [newItem] = await db
      .insert(lostItems)
      .values({
        ...item,
        description: item.description ?? null,
        location: item.location ?? null,
        contactName: item.contactName ?? null,
        contactPhone: item.contactPhone ?? null,
        seekerEmail: item.seekerEmail ?? null,
        seekerPhone: item.seekerPhone ?? null,
        imageUrls: item.imageUrls ?? null,
        identifier: item.identifier ?? null,
        reward: item.reward ?? null,
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: item.tags || [],
        searchVector: sql`to_tsvector('english', ${searchContent})`
      })
      .returning();

    return newItem;
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
    search?: string;
    startDate?: Date;
    endDate?: Date;
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
    if (filters.search) {
      const query = sql`websearch_to_tsquery('english', ${filters.search})`;
      conditions.push(sql`${lostItems.searchVector} @@ ${query}`);
    }

    if (filters.startDate) {
      conditions.push(sql`${lostItems.createdAt} >= ${filters.startDate}`);
    }
    if (filters.endDate) {
      conditions.push(sql`${lostItems.createdAt} <= ${filters.endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(lostItems)
      .where(whereClause)
      .orderBy(...(filters.search
        ? [desc(sql`ts_rank(${lostItems.searchVector}, websearch_to_tsquery('english', ${filters.search}))`), desc(lostItems.createdAt)]
        : [desc(lostItems.createdAt)]
      ))
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

  async updateLostItem(id: string, item: Partial<LostItem>): Promise<LostItem> {
    // Exclude id and createdAt from the update payload
    const { id: _id, createdAt: _createdAt, ...updateData } = item as any;
    const [updated] = await db
      .update(lostItems)
      .set({
        ...updateData,
        updatedAt: new Date(),
        searchVector: sql`to_tsvector('english', coalesce(${updateData.title}, title) || ' ' || coalesce(${updateData.description}, description) || ' ' || array_to_string(coalesce(${updateData.tags}, tags), ' '))`
      })
      .where(eq(lostItems.id, id))
      .returning();
    return updated;
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
  async createClaim(claimData: InsertClaim & { userId?: string }): Promise<Claim> {
    const [claim] = await db
      .insert(claims)
      .values({
        ...claimData,
        description: claimData.description ?? null,
        claimantName: claimData.claimantName ?? null,
        claimantPhone: claimData.claimantPhone ?? null,
        claimantEmail: claimData.claimantEmail ?? null,
        evidencePhotos: claimData.evidencePhotos ?? null,
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
    userId?: string;
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
    if (filters.userId) {
      conditions.push(eq(claims.userId, filters.userId));
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

  async updateReportStatus(id: string, status: string): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set({ status: status as any })
      .where(eq(reports.id, id))
      .returning();
    return report;
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
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const type = filters.type || 'all';
    const cat = filters.category && filters.category !== 'all' ? filters.category : null;
    const loc = filters.location ? `%${filters.location}%` : null;

    const query = filters.query ? sql`websearch_to_tsquery('english', ${filters.query})` : null;

    let items: any[] = [];
    let total = 0;



    // Search Found Items
    if (type === 'all' || type === 'found') {
      const conditions = [eq(foundItems.status, 'active' as any)];
      if (query) {
        conditions.push(sql`${foundItems.searchVector} @@ ${query}`);
      }
      if (cat) conditions.push(eq(foundItems.category, cat));
      if (loc) conditions.push(ilike(foundItems.location, loc));

      const found = await db.select({
        id: foundItems.id,
        category: foundItems.category,
        title: foundItems.title,
        description: foundItems.description,
        location: foundItems.location,
        dateFound: foundItems.dateFound,
        imageUrls: foundItems.imageUrls,
        contactName: foundItems.contactName,
        contactPhone: foundItems.contactPhone,
        status: foundItems.status,
        tags: foundItems.tags,
        createdAt: foundItems.createdAt,
        relevance: query ? sql<number>`ts_rank(${foundItems.searchVector}, ${query})` : sql<number>`0`
      })
        .from(foundItems)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);

      items.push(...found.map(i => ({ ...i, type: 'found', date: i.dateFound })));
    }

    // Search Lost Items
    if (type === 'all' || type === 'lost') {
      const conditions = [eq(lostItems.status, 'active' as any)];
      if (query) {
        conditions.push(sql`${lostItems.searchVector} @@ ${query}`);
      }
      if (cat) conditions.push(eq(lostItems.category, cat));
      if (loc) conditions.push(ilike(lostItems.location, loc));

      const lost = await db.select({
        id: lostItems.id,
        category: lostItems.category,
        title: lostItems.title,
        description: lostItems.description,
        location: lostItems.location,
        dateLost: lostItems.dateLost,
        imageUrls: lostItems.imageUrls,
        contactName: lostItems.contactName,
        contactPhone: lostItems.contactPhone,
        status: lostItems.status,
        tags: lostItems.tags,
        createdAt: lostItems.createdAt,
        relevance: query ? sql<number>`ts_rank(${lostItems.searchVector}, ${query})` : sql<number>`0`
      })
        .from(lostItems)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);

      items.push(...lost.map(i => ({ ...i, type: 'lost', date: i.dateLost })));
    }

    // Sort combined results by relevance then createdAt
    items.sort((a, b) => {
      if (b.relevance !== a.relevance) return b.relevance - a.relevance;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Total count calculation
    let totalCount = 0;
    if (type === 'all' || type === 'found') {
      const conditions = [eq(foundItems.status, 'active' as any)];
      if (query) conditions.push(sql`${foundItems.searchVector} @@ ${query}`);
      if (cat) conditions.push(eq(foundItems.category, cat));
      if (loc) conditions.push(ilike(foundItems.location, loc));
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(foundItems).where(and(...conditions));
      totalCount += Number(count);
    }
    if (type === 'all' || type === 'lost') {
      const conditions = [eq(lostItems.status, 'active' as any)];
      if (query) conditions.push(sql`${lostItems.searchVector} @@ ${query}`);
      if (cat) conditions.push(eq(lostItems.category, cat));
      if (loc) conditions.push(ilike(lostItems.location, loc));
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(lostItems).where(and(...conditions));
      totalCount += Number(count);
    }

    return { items: items as any, total: totalCount };
  }

  async getStats() {
    // Basic Counts
    const [found] = await db.select({ count: sql<number>`count(*)` }).from(foundItems);
    const [lost] = await db.select({ count: sql<number>`count(*)` }).from(lostItems);
    const [claimsCount] = await db.select({ count: sql<number>`count(*)` }).from(claims);
    const [revenue] = await db.select({ total: sql<number>`sum(amount)` }).from(payments).where(eq(payments.status, "paid"));

    // Trends (30d vs Previous 30d)
    const trends = await db.execute(sql`
      WITH periods AS (
        SELECT 
          count(*) FILTER (WHERE created_at >= current_date - interval '30 days') as current_found,
          count(*) FILTER (WHERE created_at < current_date - interval '30 days' AND created_at >= current_date - interval '60 days') as prev_found
        FROM found_items
      ),
      lost_periods AS (
        SELECT 
          count(*) FILTER (WHERE created_at >= current_date - interval '30 days') as current_lost,
          count(*) FILTER (WHERE created_at < current_date - interval '30 days' AND created_at >= current_date - interval '60 days') as prev_lost
        FROM lost_items
      ),
      claim_periods AS (
        SELECT 
          count(*) FILTER (WHERE created_at >= current_date - interval '30 days') as current_claims,
          count(*) FILTER (WHERE created_at < current_date - interval '30 days' AND created_at >= current_date - interval '60 days') as prev_claims
        FROM claims
      )
      SELECT * FROM periods, lost_periods, claim_periods
    `);

    // Category Breakdown
    const categories = await db.execute(sql`
      SELECT category as name, count(*)::int as value
      FROM (
        SELECT category FROM found_items
        UNION ALL
        SELECT category FROM lost_items
      ) combined
      GROUP BY category
      ORDER BY value DESC
      LIMIT 5
    `);

    // Success Rate
    const [resolved] = await db.select({ count: sql<number>`count(*)` }).from(claims).where(or(eq(claims.status, "verified"), eq(claims.status, "resolved")));

    // Active Records
    const [activeFound] = await db.select({ count: sql<number>`count(*)` }).from(foundItems).where(eq(foundItems.status, "active"));
    const [activeLost] = await db.select({ count: sql<number>`count(*)` }).from(lostItems).where(eq(lostItems.status, "active"));

    const trendData = trends.rows[0];
    const calculateTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      totalFound: Number(found.count),
      totalLost: Number(lost.count),
      totalClaims: Number(claimsCount.count),
      totalRevenue: Number(revenue?.total || 0),
      activeFound: Number(activeFound.count),
      activeLost: Number(activeLost.count),
      successRate: Math.round((Number(resolved.count) / (Number(claimsCount.count) || 1)) * 100),
      trends: {
        found: calculateTrend(Number(trendData.current_found), Number(trendData.prev_found)),
        lost: calculateTrend(Number(trendData.current_lost), Number(trendData.prev_lost)),
        claims: calculateTrend(Number(trendData.current_claims), Number(trendData.prev_claims)),
      },
      categories: categories.rows,
    };
  }

  async getWeeklyActivity() {
    // Generate last 7 days series
    const days = await db.execute(sql`
      SELECT to_char(d, 'Mon') as name, d::date as date
      FROM generate_series(
        current_date - interval '6 days', 
        current_date, 
        '1 day'
      ) as d
    `);

    // Get daily counts for found items
    const foundCounts = await db.execute(sql`
      SELECT 
        date_trunc('day', created_at)::date as day,
        count(*)::int as count
      FROM found_items
      WHERE created_at >= current_date - interval '6 days'
      GROUP BY 1
    `);

    // Get daily counts for lost items
    const lostCounts = await db.execute(sql`
      SELECT 
        date_trunc('day', created_at)::date as day,
        count(*)::int as count
      FROM lost_items
      WHERE created_at >= current_date - interval '6 days'
      GROUP BY 1
    `);

    // Get daily counts for claims
    const claimCounts = await db.execute(sql`
      SELECT 
        date_trunc('day', created_at)::date as day,
        count(*)::int as count
      FROM claims
      WHERE created_at >= current_date - interval '6 days'
      GROUP BY 1
    `);

    // Map results
    const activity = days.rows.map((day: any) => {
      const found = foundCounts.rows.find((r: any) =>
        new Date(r.day).toDateString() === new Date(day.date).toDateString()
      );
      const lost = lostCounts.rows.find((r: any) =>
        new Date(r.day).toDateString() === new Date(day.date).toDateString()
      );
      const claimRow = claimCounts.rows.find((r: any) =>
        new Date(r.day).toDateString() === new Date(day.date).toDateString()
      );

      return {
        name: day.name,
        found: Number(found?.count || 0),
        lost: Number(lost?.count || 0),
        claims: Number(claimRow?.count || 0)
      };
    });

    return activity;
  }

  // ============ Audit Logs ============
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  async getLatestAuditLogs(filters: { adminId?: string; action?: string; dateFrom?: Date; dateTo?: Date; limit?: number } = {}): Promise<AuditLog[]> {
    const { adminId, action, dateFrom, dateTo, limit = 50 } = filters;

    const conditions = [];
    if (adminId) conditions.push(eq(auditLogs.adminId, adminId));
    if (action) conditions.push(eq(auditLogs.action, action));
    if (dateFrom) conditions.push(sql`${auditLogs.createdAt} >= ${dateFrom}`);
    if (dateTo) conditions.push(sql`${auditLogs.createdAt} <= ${dateTo}`);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
    return logs;
  }

  // ============ System Settings ============
  async getSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async updateSetting(key: string, value: string): Promise<SystemSetting> {
    const [setting] = await db
      .insert(systemSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  async getUserMatches(userId: string) {
    const userLostItems = await db.select().from(lostItems).where(and(eq(lostItems.seekerId, userId), eq(lostItems.status, "active")));
    const allMatches = [];

    for (const item of userLostItems) {
      const matches = await matchingService.findPotentialMatches(item as any, 'lost');
      if (matches.length > 0) {
        allMatches.push({
          parentItem: item,
          matches: matches.map(m => ({
            ...m.item,
            score: Math.round(m.score * 100)
          }))
        });
      }
    }
    return allMatches;
  }

  async getUserWeeklyActivity(userId: string) {
    const days = await db.execute(sql`
      SELECT to_char(d, 'Mon') as name, d::date as date
      FROM generate_series(
        current_date - interval '6 days', 
        current_date, 
        '1 day'
      ) as d
    `);

    const foundCounts = await db.execute(sql`
      SELECT date_trunc('day', created_at)::date as day, count(*)::int as count
      FROM found_items WHERE finder_id = ${userId} AND created_at >= current_date - interval '6 days'
      GROUP BY 1
    `);

    const lostCounts = await db.execute(sql`
      SELECT date_trunc('day', created_at)::date as day, count(*)::int as count
      FROM lost_items WHERE seeker_id = ${userId} AND created_at >= current_date - interval '6 days'
      GROUP BY 1
    `);

    const claimCounts = await db.execute(sql`
      SELECT date_trunc('day', created_at)::date as day, count(*)::int as count
      FROM claims WHERE user_id = ${userId} AND created_at >= current_date - interval '6 days'
      GROUP BY 1
    `);

    return days.rows.map((day: any) => ({
      name: day.name,
      found: Number(foundCounts.rows.find((r: any) => new Date(r.day).toDateString() === new Date(day.date).toDateString())?.count || 0),
      lost: Number(lostCounts.rows.find((r: any) => new Date(r.day).toDateString() === new Date(day.date).toDateString())?.count || 0),
      claims: Number(claimCounts.rows.find((r: any) => new Date(r.day).toDateString() === new Date(day.date).toDateString())?.count || 0),
    }));
  }
}

// Export singleton instance
export const pgStorage = new PgStorage();
