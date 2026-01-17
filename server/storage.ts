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
  type AuditLog,
  type InsertAuditLog,
  type SystemSetting,
} from "@shared/schema";
import session from "express-session";
import { getPgStorage } from "./storage-pg.js";

export interface IStorage {
  sessionStore: session.Store;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(page?: number, limit?: number): Promise<{ users: User[]; total: number }>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Found Items
  createFoundItem(item: InsertFoundItem & { tags?: string[] }): Promise<FoundItem>;
  getFoundItem(id: string): Promise<FoundItem | undefined>;
  getFoundItemByReceiptNumber(receiptNumber: string): Promise<FoundItem | undefined>;
  listFoundItems(filters: {
    status?: string;
    category?: string;
    location?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: FoundItem[]; total: number }>;
  updateFoundItemStatus(id: string, status: string): Promise<FoundItem>;
  updateFoundItem(id: string, item: Partial<FoundItem>): Promise<FoundItem>;
  deleteFoundItem(id: string): Promise<boolean>;

  // Lost Items
  createLostItem(item: InsertLostItem & { tags?: string[] }): Promise<LostItem>;
  getLostItem(id: string): Promise<LostItem | undefined>;
  listLostItems(filters: {
    status?: string;
    paymentStatus?: string;
    category?: string;
    location?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ items: LostItem[]; total: number }>;
  updateLostItemStatus(id: string, status: string): Promise<LostItem>;
  updateLostItem(id: string, item: Partial<LostItem>): Promise<LostItem>;
  deleteLostItem(id: string): Promise<boolean>;
  activateLostItem(id: string, expiresAt: Date): Promise<LostItem>;
  getExpiredLostItems(): Promise<LostItem[]>;

  // Claims
  createClaim(claim: InsertClaim & { userId?: string }): Promise<Claim>;
  getClaim(id: string): Promise<Claim | undefined>;
  listClaims(filters: {
    itemId?: string;
    userId?: string;
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
  updateReportStatus(id: string, status: string): Promise<Report>;

  // Search
  searchItems(filters: {
    query?: string;
    type?: "found" | "lost" | "all";
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: (FoundItem | LostItem)[]; total: number }>;

  // Admin Stats
  getStats(): Promise<{
    totalFound: number;
    totalLost: number;
    totalClaims: number;
    totalRevenue: number;
    activeFound: number;
    activeLost: number;
    successRate: number;
    trends: {
      found: number;
      lost: number;
      claims: number;
    };
    categories: any[];
  }>;

  getWeeklyActivity(): Promise<Array<{
    name: string;
    found: number;
    lost: number;
    claims: number;
  }>>;

  getUserMatches(userId: string): Promise<any[]>;
  getUserWeeklyActivity(userId: string): Promise<Array<{
    name: string;
    found: number;
    lost: number;
    claims: number;
  }>>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getLatestAuditLogs(filters?: { adminId?: string; action?: string; dateFrom?: Date; dateTo?: Date; limit?: number }): Promise<AuditLog[]>;

  // System Settings
  getSettings(): Promise<SystemSetting[]>;
  updateSetting(key: string, value: string): Promise<SystemSetting>;
}

export const storage = getPgStorage();
