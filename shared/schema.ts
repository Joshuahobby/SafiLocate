import { sql } from "drizzle-orm";
import { pgTable, text, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const foundItems = pgTable("found_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  dateFound: text("date_found").notNull(),
  imageUrl: text("image_url"),
  contactPhone: text("contact_phone").notNull(),
  contactName: text("contact_name").notNull(),
  status: text("status").default("open").notNull(),
});

export const insertFoundItemSchema = createInsertSchema(foundItems).pick({
  category: true,
  title: true,
  description: true,
  location: true,
  dateFound: true,
  imageUrl: true,
  contactPhone: true,
  contactName: true,
}).extend({
  imageUrl: z.string().optional(), // Make optional in Zod as well
});

export type InsertFoundItem = z.infer<typeof insertFoundItemSchema>;
export type FoundItem = typeof foundItems.$inferSelect;

export const lostItems = pgTable("lost_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  dateLost: text("date_lost").notNull(),
  imageUrl: text("image_url"),
  reward: text("reward"),
  contactPhone: text("contact_phone").notNull(),
  contactName: text("contact_name").notNull(),
  status: text("status").default("open").notNull(),
});

export const insertLostItemSchema = createInsertSchema(lostItems).pick({
  category: true,
  title: true,
  description: true,
  location: true,
  dateLost: true,
  imageUrl: true,
  reward: true,
  contactPhone: true,
  contactName: true,
}).extend({
  imageUrl: z.string().optional(),
  reward: z.string().optional(),
});

export type InsertLostItem = z.infer<typeof insertLostItemSchema>;
export type LostItem = typeof lostItems.$inferSelect;
