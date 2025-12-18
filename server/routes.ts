import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFoundItemSchema, insertLostItemSchema, insertClaimSchema } from "@shared/schema";
import { paymentRoutes } from "./routes/payment";
import { imageService } from "./services/image.service";
import { aiService } from "./services/ai.service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Unauthorized" });
  };

  const sanitizeItem = (item: any, user: any, isVerifiedClaimant: boolean = false) => {
    const isOwner = user && (
      (item.finderId && user.id === item.finderId) ||
      (item.seekerId && user.id === item.seekerId)
    );
    const isAdmin = user?.role === 'admin';

    if (isOwner || isAdmin || isVerifiedClaimant) return item;

    const maskPhone = (phone: string) =>
      phone ? phone.replace(/(\d{3})\d+(\d{2})/, "$1******$2") : phone;

    return {
      ...item,
      contactPhone: maskPhone(item.contactPhone),
      finderPhone: maskPhone(item.finderPhone),
      seekerPhone: maskPhone(item.seekerPhone),
      finderEmail: undefined,
      seekerEmail: undefined,
      contactEmail: undefined,
      contactName: item.contactName // Keep name visible? Handbook says "visible to Item owner, Claimant...". But masking name makes listing useless? Let's keep Name, mask Phone/Email.
    };
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ error: "Forbidden: Admin access required" });
  };

  // Register Payment Routes
  app.use("/api/payments", paymentRoutes);

  // Found Items
  app.post("/api/found-items", async (req, res) => {
    try {
      const data = insertFoundItemSchema.parse(req.body);
      if (data.imageUrls) {
        data.imageUrls = await imageService.uploadImages(data.imageUrls) as string[];
      }
      const tags = await aiService.generateTags(data.title, data.description);
      const item = await storage.createFoundItem({ ...data, tags });
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Lost Items
  app.post("/api/lost-items", async (req, res) => {
    try {
      const data = insertLostItemSchema.parse(req.body);
      if (data.imageUrls) {
        data.imageUrls = await imageService.uploadImages(data.imageUrls) as string[];
      }
      const tags = await aiService.generateTags(data.title, data.description);
      const item = await storage.createLostItem({ ...data, tags });
      res.json(item);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Lost item validation/creation error:", error);
      }
      res.status(400).json({ error: "Invalid data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Create Claim
  app.post("/api/claims", async (req, res) => {
    try {
      const claimData = insertClaimSchema.parse(req.body);
      const userId = req.user ? (req.user as any).id : undefined;
      const claim = await storage.createClaim({ ...claimData, userId });
      res.status(201).json(claim);
    } catch (e) {
      res.status(400).json({ error: "Invalid claim data" });
    }
  });

  // List Claims (Admin)
  app.get("/api/claims", requireAuth, async (req, res) => {
    const itemId = req.query.itemId as string;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await storage.listClaims({ itemId, status, page, limit });
    res.json(result);
  });

  // Verify/Reject Claim (Admin)
  app.patch("/api/claims/:id/status", requireAuth, async (req, res) => {
    const { status } = req.body;
    const verifiedBy = (req.user as any)?.id;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    try {
      const updated = await storage.updateClaimStatus(
        req.params.id,
        status,
        verifiedBy
      );

      // If verified, update the item status to 'claimed'
      if (status === "verified") {
        if (updated.itemType === "found") {
          await storage.updateFoundItemStatus(updated.itemId, "claimed");
        } else {
          await storage.updateLostItemStatus(updated.itemId, "claimed");
        }
      }

      // Log Action
      if (req.user) {
        await storage.createAuditLog({
          adminId: (req.user as any).id,
          action: `claim_${status}`,
          entityType: "claim",
          entityId: updated.id,
          details: { itemId: updated.itemId },
        });
      }

      res.json(updated);
    } catch (e) {
      res.status(404).json({ error: "Claim not found" });
    }
  });

  // Get Items (Unified Search)
  app.get("/api/items", async (req, res) => {
    const search = req.query.search as string;
    const category = req.query.category as string;
    const location = req.query.location as string;
    const type = req.query.type as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    let foundItems: any[] = [];
    let lostItems: any[] = [];

    // Fetch Found Items
    if (!type || type === 'found' || type === 'all') {
      const result = await storage.listFoundItems({
        search,
        category: category !== 'all' ? category : undefined,
        location,
        page,
        limit
      });
      foundItems = result.items.map(i => ({
        ...i,
        type: "found" as const,
        date: i.dateFound,
        image: i.imageUrls?.[0]
      }));
    }

    // Fetch Lost Items
    if (!type || type === 'lost' || type === 'all') {
      const result = await storage.listLostItems({
        search,
        category: category !== 'all' ? category : undefined,
        location,
        page,
        limit
      });
      lostItems = result.items.map(i => ({
        ...i,
        type: "lost" as const,
        date: i.dateLost,
        image: i.imageUrls?.[0]
      }));
    }

    // Combine and Sort
    const allItems = [...foundItems, ...lostItems];
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(allItems.map(i => sanitizeItem(i, (req as any).user)));
  });

  // Get Single Item
  app.get("/api/items/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const user = (req as any).user;
    let isVerifiedClaimant = false;

    if (user) {
      const claims = await storage.listClaims({ itemId: id, userId: user.id, status: 'verified' });
      if (claims.items.length > 0) {
        isVerifiedClaimant = true;
      }
    }

    const foundItem = await storage.getFoundItem(id);
    if (foundItem) {
      return res.json(sanitizeItem({ ...foundItem, type: 'found', date: foundItem.dateFound, image: foundItem.imageUrls?.[0] }, user, isVerifiedClaimant));
    }

    const lostItem = await storage.getLostItem(id);
    if (lostItem) {
      return res.json(sanitizeItem({ ...lostItem, type: 'lost', date: lostItem.dateLost, image: lostItem.imageUrls?.[0] }, user, isVerifiedClaimant));
    }

    return res.status(404).json({ error: "Item not found" });
  });

  // Verify/Update Item Status (Admin)
  app.patch("/api/items/:id", requireAdmin, async (req, res) => {
    const id = req.params.id;
    const { type, status } = req.body;

    const validStatuses = ["pending", "active", "claimed", "archived", "expired", "rejected"];

    if (!id || !type || !status) {
      return res.status(400).json({ error: "Missing required fields: id, type, status" });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    if (!["found", "lost"].includes(type)) {
      return res.status(400).json({ error: "Invalid type. Must be 'found' or 'lost'" });
    }

    try {
      let updated;
      if (type === 'found') {
        updated = await storage.updateFoundItemStatus(id, status);
      } else {
        updated = await storage.updateLostItemStatus(id, status);
      }

      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Log Action
      if ((req as any).user) {
        await storage.createAuditLog({
          adminId: (req as any).user.id,
          action: `item_${status}`,
          entityType: "item",
          entityId: id,
          details: { type },
        });
      }

      res.json(updated);
    } catch (error) {
      console.error("Update item status error:", error);
      res.status(500).json({ error: "Failed to update item status" });
    }
  });

  // Delete Item (Admin)
  app.delete("/api/items/:id", requireAdmin, async (req, res) => {
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

    // Log Action
    if ((req as any).user) {
      await storage.createAuditLog({
        adminId: (req as any).user.id,
        action: `item_deleted`,
        entityType: "item",
        entityId: id,
        details: { type },
      });
    }

    res.json({ success: true });
  });

  // Admin Stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin Activity
  app.get("/api/admin/activity", requireAdmin, async (req, res) => {
    try {
      const activity = await storage.getWeeklyActivity();
      res.json(activity);
    } catch (error) {
      console.error("Activity error:", error);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  // Admin: List Users
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await storage.listUsers(page, limit);
      res.json(result);
    } catch (error) {
      console.error("List users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin: Update User Role
  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const updatedUser = await storage.updateUserRole(req.params.id, role);

      // Log Action
      if ((req as any).user) {
        await storage.createAuditLog({
          adminId: (req as any).user.id,
          action: `user_role_updated`,
          entityType: "user",
          entityId: req.params.id,
          details: { newRole: role },
        });
      }

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Update role error:", error);
      res.status(500).json({ error: error.message || "Failed to update user role" });
    }
  });

  // Admin: List Reports
  app.get("/api/admin/reports", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const result = await storage.listReports({ page, limit, status });
      res.json(result);
    } catch (error) {
      console.error("List reports error:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Admin: Update Report Status
  app.patch("/api/admin/reports/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const id = req.params.id;
      const updatedReport = await storage.updateReportStatus(id, status);

      // Log Action
      if ((req as any).user) {
        await storage.createAuditLog({
          adminId: (req as any).user.id,
          action: `report_${status}`,
          entityType: "report",
          entityId: id,
          details: { status },
        });
      }

      res.json(updatedReport);
    } catch (error) {
      console.error("Update report error:", error);
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  // Admin: Audit Logs
  app.get("/api/admin/audit-logs", requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getLatestAuditLogs();
      // Fetch admin usernames for the logs to display names instead of IDs
      const populatedLogs = await Promise.all(logs.map(async (log) => {
        const admin = await storage.getUser(log.adminId);
        return {
          ...log,
          adminName: admin?.username || "Unknown"
        };
      }));
      res.json(populatedLogs);
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Admin: Get Settings
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      // Transform to object for easier frontend consumption
      const settingsObj = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);
      res.json(settingsObj);
    } catch (error) {
      console.error("Settings error:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Admin: Update Setting
  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ error: "Key and value are required" });
      }

      const updated = await storage.updateSetting(key, String(value));

      // Log Action
      if ((req as any).user) {
        await storage.createAuditLog({
          adminId: (req as any).user.id,
          action: `setting_updated`,
          entityType: "system",
          entityId: key,
          details: { value },
        });
      }

      res.json(updated);
    } catch (error) {
      console.error("Update setting error:", error);
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  return httpServer;
}
