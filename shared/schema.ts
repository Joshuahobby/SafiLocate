import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  decimal,
  date,
  pgEnum,
  index,
  json,
  customType
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "moderator"]);
export const itemStatusEnum = pgEnum("item_status", ["pending", "active", "claimed", "archived", "expired", "rejected"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "pending", "paid", "failed", "cancelled"]);
export const claimStatusEnum = pgEnum("claim_status", ["pending", "verified", "rejected", "resolved"]);
export const reportReasonEnum = pgEnum("report_reason", ["spam", "scam", "wrong_category", "inappropriate", "fraudulent", "harassment"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "reviewed", "resolved", "dismissed"]);
export const priceTierEnum = pgEnum("price_tier", ["standard", "premium", "urgent", "custom"]);

const tsvector = customType<{ data: string }>({
  dataType: () => "tsvector",
});

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Will be hashed with bcrypt
  role: userRoleEnum("role").notNull().default("user"),
  email: text("email"),
  phone: text("phone"), // Rwanda format: +2507XXXXXXXX
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by"), // FK to users.id (for admin tracking)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  usernameIdx: index("idx_users_username").on(table.username),
  emailIdx: index("idx_users_email").on(table.email),
  roleIdx: index("idx_users_role").on(table.role),
}));

// Found Items Table
export const foundItems = pgTable("found_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category", { length: 50 }).notNull(), // id_document, electronics, wallet, keys, clothing, other
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  dateFound: date("date_found").notNull(),
  imageUrls: text("image_urls").array(), // Array of image URLs (max 3)
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(), // Rwanda format
  finderEmail: text("finder_email"), // For notifications
  finderPhone: text("finder_phone"), // For SMS (optional)
  status: itemStatusEnum("status").notNull().default("pending"),
  tags: text("tags").array(), // AI-generated tags
  receiptNumber: varchar("receipt_number", { length: 20 }).unique(), // Format: FND-XXXXX
  finderId: varchar("finder_id"), // FK to users.id (nullable, for future user accounts)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  searchVector: tsvector("search_vector"),
}, (table) => ({
  categoryIdx: index("idx_found_items_category").on(table.category),
  statusIdx: index("idx_found_items_status").on(table.status),
  locationIdx: index("idx_found_items_location").on(table.location),
  createdAtIdx: index("idx_found_items_created_at").on(table.createdAt),
  tagsIdx: index("idx_found_items_tags").using("gin", table.tags),
  receiptNumberIdx: index("idx_found_items_receipt_number").on(table.receiptNumber),
  searchVectorIdx: index("idx_found_items_search_vector").using("gin", table.searchVector),
}));

// Lost Items Table
export const lostItems = pgTable("lost_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 200 }).notNull(), // Last seen location
  dateLost: date("date_lost").notNull(),
  imageUrls: text("image_urls").array(), // Array of image URLs (max 3)
  identifier: varchar("identifier", { length: 100 }), // IMEI, Serial Number, Document ID, etc.
  reward: decimal("reward", { precision: 10, scale: 2 }), // Optional reward amount
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(),
  seekerEmail: text("seeker_email"), // For notifications
  seekerPhone: text("seeker_phone"), // For SMS (optional)
  status: itemStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  priceTier: priceTierEnum("price_tier").notNull().default("standard"), // standard, premium, urgent, custom
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }), // Only if price_tier === 'custom'
  listingFee: decimal("listing_fee", { precision: 10, scale: 2 }), // Actual amount paid
  expiresAt: timestamp("expires_at"), // 30 days from payment confirmation
  tags: text("tags").array(), // AI-generated tags
  seekerId: varchar("seeker_id"), // FK to users.id (nullable, for future user accounts)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  searchVector: tsvector("search_vector"),
}, (table) => ({
  categoryIdx: index("idx_lost_items_category").on(table.category),
  statusIdx: index("idx_lost_items_status").on(table.status),
  paymentStatusIdx: index("idx_lost_items_payment_status").on(table.paymentStatus),
  locationIdx: index("idx_lost_items_location").on(table.location),
  expiresAtIdx: index("idx_lost_items_expires_at").on(table.expiresAt),
  tagsIdx: index("idx_lost_items_tags").using("gin", table.tags),
  createdAtIdx: index("idx_lost_items_created_at").on(table.createdAt),
  searchVectorIdx: index("idx_lost_items_search_vector").using("gin", table.searchVector),
}));

// Claims Table
export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id", { length: 255 }).notNull(), // FK to found_items.id or lost_items.id
  itemType: varchar("item_type", { length: 10 }).notNull(), // 'found' or 'lost'
  claimantName: varchar("claimant_name", { length: 100 }).notNull(),
  claimantPhone: varchar("claimant_phone", { length: 20 }).notNull(), // Rwanda format
  claimantEmail: text("claimant_email"), // Optional
  userId: varchar("user_id"), // FK to users.id (if claimed by registered user)
  description: text("description").notNull(), // Proof of ownership (min 50 chars)
  evidencePhotos: text("evidence_photos").array(), // Optional evidence photos
  status: claimStatusEnum("status").notNull().default("pending"),
  verifiedAt: timestamp("verified_at"), // When claim was verified
  verifiedBy: varchar("verified_by"), // FK to users.id (finder or admin)
  adminNotes: text("admin_notes"), // Admin-only notes
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  itemIdIdx: index("idx_claims_item_id").on(table.itemId),
  statusIdx: index("idx_claims_status").on(table.status),
  userIdIdx: index("idx_claims_user_id").on(table.userId),
  createdAtIdx: index("idx_claims_created_at").on(table.createdAt),
}));

// Payments Table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lostItemId: varchar("lost_item_id", { length: 255 }).notNull(), // FK to lost_items.id
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("RWF"),
  flutterwaveTxRef: varchar("flutterwave_tx_ref", { length: 100 }).notNull().unique(), // Unique transaction reference
  flutterwaveId: varchar("flutterwave_id", { length: 100 }), // Flutterwave transaction ID
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 20 }), // card, mobile_money, bank_transfer
  paidAt: timestamp("paid_at"), // When payment was confirmed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  lostItemIdIdx: index("idx_payments_lost_item_id").on(table.lostItemId),
  txRefIdx: index("idx_payments_tx_ref").on(table.flutterwaveTxRef),
  statusIdx: index("idx_payments_status").on(table.status),
  createdAtIdx: index("idx_payments_created_at").on(table.createdAt),
}));

// Session Table (connect-pg-simple)
export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// Reports Table (for reporting suspicious items/claims)
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id", { length: 255 }), // FK to found_items.id or lost_items.id (nullable)
  claimId: varchar("claim_id", { length: 255 }), // FK to claims.id (nullable)
  reporterEmail: text("reporter_email"), // Optional, for follow-up
  reason: reportReasonEnum("reason").notNull(), // spam, scam, wrong_category, inappropriate, fraudulent, harassment
  description: text("description"), // Optional additional details
  status: reportStatusEnum("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by"), // FK to users.id (admin who reviewed)
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  itemIdIdx: index("idx_reports_item_id").on(table.itemId),
  claimIdIdx: index("idx_reports_claim_id").on(table.claimId),
  reporterEmailIdx: index("idx_reports_reporter_email").on(table.reporterEmail),
  statusIdx: index("idx_reports_status").on(table.status),
  createdAtIdx: index("idx_reports_created_at").on(table.createdAt),
}));

// Audit Logs Table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull(), // FK to users.id
  action: varchar("action", { length: 50 }).notNull(), // e.g. "verified_item", "rejected_claim"
  entityType: varchar("entity_type", { length: 20 }).notNull(), // item, claim, user, report, system
  entityId: varchar("entity_id", { length: 255 }),
  details: json("details"), // Store generic details { oldValue, newValue, etc }
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  adminIdIdx: index("idx_audit_logs_admin_id").on(table.adminId),
  createdAtIdx: index("idx_audit_logs_created_at").on(table.createdAt),
}));

// System Settings Table
export const systemSettings = pgTable("system_settings", {
  key: varchar("key", { length: 50 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas for Validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  role: true,
});

export const insertFoundItemSchema = createInsertSchema(foundItems, {
  finderEmail: z.string().email().min(1, "Email is required"),
  finderPhone: z.string().min(1, "Phone is required"),
}).pick({
  category: true,
  title: true,
  description: true,
  location: true,
  dateFound: true,
  imageUrls: true,
  contactName: true,
  contactPhone: true,
  finderEmail: true,
  finderPhone: true,
});

export const insertLostItemSchema = createInsertSchema(lostItems).pick({
  category: true,
  title: true,
  description: true,
  location: true,
  dateLost: true,
  imageUrls: true,
  identifier: true,
  reward: true,
  contactName: true,
  contactPhone: true,
  seekerEmail: true,
  seekerPhone: true,
  priceTier: true,
  customPrice: true,
});

export const insertClaimSchema = createInsertSchema(claims).pick({
  itemId: true,
  itemType: true,
  claimantName: true,
  claimantPhone: true,
  claimantEmail: true,
  description: true,
  evidencePhotos: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  lostItemId: true,
  amount: true,
  currency: true,
  flutterwaveTxRef: true,
  paymentMethod: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  itemId: true,
  claimId: true,
  reporterEmail: true,
  reason: true,
  description: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  adminId: true,
  action: true,
  entityType: true,
  entityId: true,
  details: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings);

// Type Exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFoundItem = z.infer<typeof insertFoundItemSchema>;
export type FoundItem = typeof foundItems.$inferSelect;

export type InsertLostItem = z.infer<typeof insertLostItemSchema>;
export type LostItem = typeof lostItems.$inferSelect;

export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
