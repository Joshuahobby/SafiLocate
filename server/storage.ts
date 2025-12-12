import {
  type User, type InsertUser,
  type FoundItem, type InsertFoundItem,
  type LostItem, type InsertLostItem
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createFoundItem(item: InsertFoundItem): Promise<FoundItem>;
  createLostItem(item: InsertLostItem): Promise<LostItem>;
  getFoundItems(): Promise<FoundItem[]>;
  getLostItems(): Promise<LostItem[]>;
  getItem(id: number): Promise<FoundItem | LostItem | undefined>;
  updateItemStatus(id: number, type: 'found' | 'lost', status: string): Promise<FoundItem | LostItem | undefined>;
  deleteItem(id: number, type: 'found' | 'lost'): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private foundItems: Map<number, FoundItem>;
  private lostItems: Map<number, LostItem>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.foundItems = new Map();
    this.lostItems = new Map();
    this.currentId = 1;
  }

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createFoundItem(item: InsertFoundItem): Promise<FoundItem> {
    const id = this.currentId++;
    const foundItem: FoundItem = {
      ...item,
      id,
      status: "open",
      imageUrl: item.imageUrl || null
    };
    this.foundItems.set(id, foundItem);
    return foundItem;
  }

  async createLostItem(item: InsertLostItem): Promise<LostItem> {
    const id = this.currentId++;
    const lostItem: LostItem = {
      ...item,
      id,
      status: "open",
      imageUrl: item.imageUrl || null,
      reward: item.reward || null
    };
    this.lostItems.set(id, lostItem);
    return lostItem;
  }

  async getFoundItems(): Promise<FoundItem[]> {
    return Array.from(this.foundItems.values());
  }

  async getLostItems(): Promise<LostItem[]> {
    return Array.from(this.lostItems.values());
  }

  async getItem(id: number): Promise<FoundItem | LostItem | undefined> {
    // Try found items first
    if (this.foundItems.has(id)) return this.foundItems.get(id);
    // Then lost items
    return this.lostItems.get(id);
  }

  async updateItemStatus(id: number, type: 'found' | 'lost', status: string): Promise<FoundItem | LostItem | undefined> {
    if (type === 'found') {
      const item = this.foundItems.get(id);
      if (!item) return undefined;
      const updated = { ...item, status };
      this.foundItems.set(id, updated);
      return updated;
    } else {
      const item = this.lostItems.get(id);
      if (!item) return undefined;
      const updated = { ...item, status };
      this.lostItems.set(id, updated);
      return updated;
    }
  }

  async deleteItem(id: number, type: 'found' | 'lost'): Promise<boolean> {
    if (type === 'found') {
      return this.foundItems.delete(id);
    } else {
      return this.lostItems.delete(id);
    }
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, foundItems, lostItems } from "@shared/schema";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createFoundItem(item: InsertFoundItem): Promise<FoundItem> {
    const [foundItem] = await db.insert(foundItems).values(item).returning();
    return foundItem;
  }

  async createLostItem(item: InsertLostItem): Promise<LostItem> {
    const [lostItem] = await db.insert(lostItems).values(item).returning();
    return lostItem;
  }

  async getFoundItems(): Promise<FoundItem[]> {
    return await db.select().from(foundItems);
  }

  async getLostItems(): Promise<LostItem[]> {
    return await db.select().from(lostItems);
  }

  async getItem(id: number): Promise<FoundItem | LostItem | undefined> {
    // Try found items first
    const [found] = await db.select().from(foundItems).where(eq(foundItems.id, id));
    if (found) return found;

    // Then lost items
    const [lost] = await db.select().from(lostItems).where(eq(lostItems.id, id));
    return lost;
  }

  async updateItemStatus(id: number, type: 'found' | 'lost', status: string): Promise<FoundItem | LostItem | undefined> {
    if (type === 'found') {
      const [updated] = await db.update(foundItems)
        .set({ status })
        .where(eq(foundItems.id, id))
        .returning();
      return updated;
    } else {
      const [updated] = await db.update(lostItems)
        .set({ status })
        .where(eq(lostItems.id, id))
        .returning();
      return updated;
    }
  }

  async deleteItem(id: number, type: 'found' | 'lost'): Promise<boolean> {
    if (type === 'found') {
      const [deleted] = await db.delete(foundItems)
        .where(eq(foundItems.id, id))
        .returning();
      return !!deleted;
    } else {
      const [deleted] = await db.delete(lostItems)
        .where(eq(lostItems.id, id))
        .returning();
      return !!deleted;
    }
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

