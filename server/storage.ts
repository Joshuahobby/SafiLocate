import {
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
import { randomUUID } from "crypto";

/**
 * Storage Interface
 * 
 * This interface defines all CRUD operations for the application.
 * Implementations: MemStorage (dev/testing) and PgStorage (production)
 */
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Found Items
  createFoundItem(item: InsertFoundItem): Promise<FoundItem>;
  getFoundItem(id: string): Promise<FoundItem | undefined>;
  getFoundItemByReceiptNumber(receiptNumber: string): Promise<FoundItem | undefined>;
  listFoundItems(filters: {
    status?: string;
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: FoundItem[]; total: number }>;
  updateFoundItemStatus(id: string, status: string): Promise<FoundItem>;
  deleteFoundItem(id: string): Promise<boolean>;

  // Lost Items
  createLostItem(item: InsertLostItem): Promise<LostItem>;
  getLostItem(id: string): Promise<LostItem | undefined>;
  listLostItems(filters: {
    status?: string;
    paymentStatus?: string;
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: LostItem[]; total: number }>;
  updateLostItemStatus(id: string, status: string): Promise<LostItem>;
  deleteLostItem(id: string): Promise<boolean>;
  activateLostItem(id: string, expiresAt: Date): Promise<LostItem>;
  getExpiredLostItems(): Promise<LostItem[]>;

  // Claims
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaim(id: string): Promise<Claim | undefined>;
  listClaims(filters: {
    itemId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Claim[]; total: number }>;
  updateClaimStatus(id: string, status: string, verifiedBy?: string): Promise<Claim>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByTxRef(txRef: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: string, status: string): Promise<Payment>;

  // Reports
  createReport(report: InsertReport): Promise<Report>;
  listReports(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Report[]; total: number }>;

  // Search
  searchItems(filters: {
    query?: string;
    type?: "found" | "lost" | "all";
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: (FoundItem | LostItem)[]; total: number }>;
}

/**
 * In-Memory Storage Implementation
 * 
 * This is a simple in-memory storage for development/testing.
 * For production, use PgStorage from './storage-pg.ts'
 */
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private foundItems: Map<string, FoundItem>;
  private lostItems: Map<string, LostItem>;
  private claims: Map<string, Claim>;
  private payments: Map<string, Payment>;
  private reports: Map<string, Report>;

  constructor() {
    this.users = new Map();
    this.foundItems = new Map();
    this.lostItems = new Map();
    this.claims = new Map();
    this.payments = new Map();
    this.reports = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    this.users.set(id, user);
    return user;
  }

  // Found Items - Stub implementations
  async createFoundItem(item: InsertFoundItem): Promise<FoundItem> {
    const id = randomUUID();
    const foundItem: FoundItem = {
      ...item,
      id,
      status: "pending",
      receiptNumber: `FND-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FoundItem;
    this.foundItems.set(id, foundItem);
    return foundItem;
  }

  async getFoundItem(id: string): Promise<FoundItem | undefined> {
    return this.foundItems.get(id);
  }

  async getFoundItemByReceiptNumber(receiptNumber: string): Promise<FoundItem | undefined> {
    return Array.from(this.foundItems.values()).find(
      (item) => item.receiptNumber === receiptNumber,
    );
  }

  async listFoundItems(filters: any): Promise<{ items: FoundItem[]; total: number }> {
    let items = Array.from(this.foundItems.values());

    if (filters.status) {
      items = items.filter((item) => item.status === filters.status);
    }
    if (filters.category) {
      items = items.filter((item) => item.category === filters.category);
    }

    return { items, total: items.length };
  }

  async updateFoundItemStatus(id: string, status: string): Promise<FoundItem> {
    const item = this.foundItems.get(id);
    if (!item) throw new Error("Item not found");
    const updated = { ...item, status, updatedAt: new Date() } as FoundItem;
    this.foundItems.set(id, updated);
    return updated;
  }

  async deleteFoundItem(id: string): Promise<boolean> {
    return this.foundItems.delete(id);
  }

  // Lost Items - Stub implementations
  async createLostItem(item: InsertLostItem): Promise<LostItem> {
    const id = randomUUID();
    const lostItem: LostItem = {
      ...item,
      id,
      status: "pending",
      paymentStatus: "unpaid",
      priceTier: item.priceTier || "standard",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as LostItem;
    this.lostItems.set(id, lostItem);
    return lostItem;
  }

  async getLostItem(id: string): Promise<LostItem | undefined> {
    return this.lostItems.get(id);
  }

  async listLostItems(filters: any): Promise<{ items: LostItem[]; total: number }> {
    let items = Array.from(this.lostItems.values());

    if (filters.status) {
      items = items.filter((item) => item.status === filters.status);
    }
    if (filters.paymentStatus) {
      items = items.filter((item) => item.paymentStatus === filters.paymentStatus);
    }

    return { items, total: items.length };
  }

  async updateLostItemStatus(id: string, status: string): Promise<LostItem> {
    const item = this.lostItems.get(id);
    if (!item) throw new Error("Item not found");
    const updated = { ...item, status, updatedAt: new Date() } as LostItem;
    this.lostItems.set(id, updated);
    return updated;
  }

  async deleteLostItem(id: string): Promise<boolean> {
    return this.lostItems.delete(id);
  }

  async activateLostItem(id: string, expiresAt: Date): Promise<LostItem> {
    const item = this.lostItems.get(id);
    if (!item) throw new Error("Item not found");
    const updated = {
      ...item,
      status: "active",
      paymentStatus: "paid",
      expiresAt,
      updatedAt: new Date(),
    } as LostItem;
    this.lostItems.set(id, updated);
    return updated;
  }

  async getExpiredLostItems(): Promise<LostItem[]> {
    const now = new Date();
    return Array.from(this.lostItems.values()).filter(
      (item) => item.status === "active" && item.expiresAt && item.expiresAt < now,
    );
  }

  // Claims - Stub implementations
  async createClaim(claim: InsertClaim): Promise<Claim> {
    const id = randomUUID();
    const newClaim: Claim = {
      ...claim,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Claim;
    this.claims.set(id, newClaim);
    return newClaim;
  }

  async getClaim(id: string): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async listClaims(filters: any): Promise<{ items: Claim[]; total: number }> {
    let items = Array.from(this.claims.values());

    if (filters.itemId) {
      items = items.filter((claim) => claim.itemId === filters.itemId);
    }
    if (filters.status) {
      items = items.filter((claim) => claim.status === filters.status);
    }

    return { items, total: items.length };
  }

  async updateClaimStatus(id: string, status: string, verifiedBy?: string): Promise<Claim> {
    const claim = this.claims.get(id);
    if (!claim) throw new Error("Claim not found");
    const updated = {
      ...claim,
      status,
      verifiedBy,
      verifiedAt: status === "verified" ? new Date() : claim.verifiedAt,
      updatedAt: new Date(),
    } as Claim;
    this.claims.set(id, updated);
    return updated;
  }

  // Payments - Stub implementations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const newPayment: Payment = {
      ...payment,
      id,
      status: "pending",
      currency: payment.currency || "RWF",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Payment;
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByTxRef(txRef: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.flutterwaveTxRef === txRef,
    );
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) throw new Error("Payment not found");
    const updated = {
      ...payment,
      status,
      paidAt: status === "success" || status === "paid" ? new Date() : payment.paidAt,
      updatedAt: new Date(),
    } as Payment;
    this.payments.set(id, updated);
    return updated;
  }

  // Reports - Stub implementations
  async createReport(report: InsertReport): Promise<Report> {
    const id = randomUUID();
    const newReport: Report = {
      ...report,
      id,
      status: "pending",
      createdAt: new Date(),
    } as Report;
    this.reports.set(id, newReport);
    return newReport;
  }

  async listReports(filters: any): Promise<{ items: Report[]; total: number }> {
    let items = Array.from(this.reports.values());

    if (filters.status) {
      items = items.filter((report) => report.status === filters.status);
    }

    return { items, total: items.length };
  }

  // Search - Stub implementation
  async searchItems(filters: any): Promise<{ items: (FoundItem | LostItem)[]; total: number }> {
    // Simple implementation - full-text search will be in PgStorage
    return { items: [], total: 0 };
  }
}

// Export storage instance
// TODO: Switch to PgStorage when database is ready
// import { pgStorage } from "./storage-pg";
// export const storage = pgStorage;

export const storage = new MemStorage();
