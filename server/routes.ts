import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFoundItemSchema, insertLostItemSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Found Items
  app.post("/api/found-items", async (req, res) => {
    try {
      const data = insertFoundItemSchema.parse(req.body);
      const item = await storage.createFoundItem(data);
      res.status(201).json(item);
    } catch (e) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Lost Items
  app.post("/api/lost-items", async (req, res) => {
    try {
      const data = insertLostItemSchema.parse(req.body);
      const item = await storage.createLostItem(data);
      res.status(201).json(item);
    } catch (e) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Get Items (Unified Search)
  app.get("/api/items", async (req, res) => {
    // Unified Search
    const foundResult = await storage.listFoundItems({});
    const lostResult = await storage.listLostItems({});
    const found = foundResult.items;
    const lost = lostResult.items;

    // Add type field to distinguish
    const allItems = [
      ...found.map(i => ({ ...i, type: "found" as const, date: i.dateFound, image: i.imageUrls?.[0] })),
      ...lost.map(i => ({ ...i, type: "lost" as const, date: i.dateLost, image: i.imageUrls?.[0] }))
    ];

    // Filter Logic
    const { search, category, location, type } = req.query;

    let results = allItems;

    if (type && typeof type === 'string' && type !== 'all') {
      results = results.filter(i => i.type === type);
    }

    if (category && typeof category === 'string' && category !== 'all') {
      results = results.filter(i => i.category === category);
    }

    if (location && typeof location === 'string') {
      results = results.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (search && typeof search === 'string') {
      const query = search.toLowerCase();
      results = results.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    results.reverse();

    res.json(results);
  });

  // Get Single Item
  app.get("/api/items/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const foundItem = await storage.getFoundItem(id);
    if (foundItem) {
      return res.json({ ...foundItem, type: 'found', date: foundItem.dateFound, image: foundItem.imageUrls?.[0] });
    }

    const lostItem = await storage.getLostItem(id);
    if (lostItem) {
      return res.json({ ...lostItem, type: 'lost', date: lostItem.dateLost, image: lostItem.imageUrls?.[0] });
    }

    return res.status(404).json({ error: "Item not found" });
  });

  // Verify/Update Item Status (Admin)
  app.patch("/api/items/:id", async (req, res) => {
    const id = req.params.id;
    const { type, status } = req.body;

    if (!id || !type || !status) {
      return res.status(400).json({ error: "Invalid request" });
    }

    let updated;
    if (type === 'found') {
      updated = await storage.updateFoundItemStatus(id, status);
    } else {
      updated = await storage.updateLostItemStatus(id, status);
    }

    if (!updated) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(updated);
  });

  // Delete Item (Admin)
  app.delete("/api/items/:id", async (req, res) => {
    const id = req.params.id;
    const type = req.query.type as string; // 'found' or 'lost'

    if (!id || !type) {
      return res.status(400).json({ error: "Invalid request" });
    }

    let success;
    if (type === 'found') {
      success = await storage.deleteFoundItem(id);
    } else {
      success = await storage.deleteLostItem(id);
    }

    if (!success) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ success: true });
  });

  return httpServer;
}
