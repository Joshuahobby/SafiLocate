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
    const found = await storage.getFoundItems();
    const lost = await storage.getLostItems();

    // Add type field to distinguish
    const allItems = [
      ...found.map(i => ({ ...i, type: "found" as const })),
      ...lost.map(i => ({ ...i, type: "lost" as const }))
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
    // Note: Assuming date strings are comparable or we convert them. 
    // For MVP relying on string sort might be enough if ISO, but user types manual "2023-10-10".
    // Let's just return them as is for now, or simplistic sort.
    results.reverse(); // Show newest added first (if IDs increase)

    res.json(results);
  });

  // Get Single Item
  app.get("/api/items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const item = await storage.getItem(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  });

  // Verify/Update Item Status (Admin)
  app.patch("/api/items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { type, status } = req.body;

    if (isNaN(id) || !type || !status) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const updated = await storage.updateItemStatus(id, type, status);
    if (!updated) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(updated);
  });

  // Delete Item (Admin)
  app.delete("/api/items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const type = req.query.type as string; // 'found' or 'lost'

    if (isNaN(id) || !type) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const success = await storage.deleteItem(id, type as 'found' | 'lost');
    if (!success) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ success: true });
  });

  return httpServer;
}
