import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertFoundItemSchema, insertLostItemSchema, insertClaimSchema, type FoundItem, type LostItem, type User } from "@shared/schema";
import { paymentRoutes } from "./routes/payment.js";
import { uploadRoutes } from "./routes/upload.js";
import { imageService } from "./services/image.service.js";
import { aiService } from "./services/ai.service.js";
import { matchingService } from "./services/matching.service.js";
import { notificationService } from "./services/notification.service.js";
import { hashPassword } from "./auth.js";

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

  const sanitizeUser = (user: any) => {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  };

  const sanitizeItem = async (item: any, user: any) => {
    const isAdmin = user?.role === 'admin';
    const isOwner = user && (
      (item.finderId && user.id === item.finderId) ||
      (item.seekerId && user.id === item.seekerId)
    );

    let isVerifiedClaimant = false;
    if (user && !isOwner && !isAdmin) {
      // Check if this specific user has a verified claim for this item
      const claims = await storage.listClaims({
        itemId: item.id,
        userId: user.id,
        status: 'verified'
      });
      if (claims.items.length > 0) {
        isVerifiedClaimant = true;
      }
    }

    const hasFullAccess = isOwner || isAdmin || isVerifiedClaimant;

    const maskPhone = (phone: string) =>
      phone ? phone.replace(/(\d{3})\d+(\d{2})/, "$1******$2") : phone;

    const maskName = (name: string) => {
      if (!name) return name;
      const parts = name.split(' ');
      if (parts.length === 1) return parts[0][0] + '***';
      return parts[0][0] + '*** ' + parts[parts.length - 1][0] + '***';
    };

    if (hasFullAccess) return item;

    return {
      ...item,
      contactName: maskName(item.contactName),
      contactPhone: maskPhone(item.contactPhone),
      finderPhone: maskPhone(item.finderPhone),
      seekerPhone: maskPhone(item.seekerPhone),
      identifier: item.identifier ? "********" : undefined, // Hide IMEI/Serial
      finderEmail: undefined,
      seekerEmail: undefined,
      contactEmail: undefined,
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

  // Register Upload Route
  app.use("/api/upload", uploadRoutes);

  // Found Items
  app.post("/api/found-items", async (req, res) => {
    try {
      const data = insertFoundItemSchema.parse(req.body);
      if (data.imageUrls) {
        data.imageUrls = await imageService.uploadImages(data.imageUrls) as string[];
      }
      const tags = await aiService.generateTags(data.title ?? "", data.description ?? "");
      const item = await storage.createFoundItem({ ...data, tags });
      res.json(item);

      // Trigger async processes (AI Matching)
      // We don't await this so it doesn't block the response
      if (process.env.NODE_ENV !== 'test') {
        matchingService.findPotentialMatches(item, 'found').catch(err =>
          console.error("Error in background matching service:", err)
        );
      }
    } catch (error) {
      console.error("Found item creation error:", error);
      return res.status(400).json({ 
        error: "Invalid found item data", 
        details: error instanceof Error ? error.message : String(error),
        zodError: (error as any)?.name === 'ZodError' ? (error as any).errors : undefined
      });
    }
  });

  // Lost Items
  app.post("/api/lost-items", async (req, res) => {
    try {
      const data = insertLostItemSchema.parse(req.body);
      if (data.imageUrls) {
        data.imageUrls = await imageService.uploadImages(data.imageUrls) as string[];
      }
      const tags = await aiService.generateTags(data.title ?? "", data.description ?? "");
      const item = await storage.createLostItem({ ...data, tags });
      res.json(item);

      // Trigger async processes (AI Matching)
      // We don't await this so it doesn't block the response
      if (process.env.NODE_ENV !== 'test') {
        matchingService.findPotentialMatches(item, 'lost').catch(err =>
          console.error("Error in background matching service:", err)
        );
      }
    } catch (error) {
      console.error("Lost item creation error:", error);
      return res.status(400).json({ 
        error: "Invalid lost item data", 
        details: error instanceof Error ? error.message : String(error),
        zodError: (error as any)?.name === 'ZodError' ? (error as any).errors : undefined
      });
    }
  });

  // Create Claim
  app.post("/api/claims", async (req, res) => {
    try {
      const claimData = insertClaimSchema.parse(req.body);
      const userId = req.user ? (req.user as any).id : undefined;
      const claim = await storage.createClaim({ ...claimData, userId });

      // Notify the item owner (finder/seeker)
      // We perform this asynchronously so it doesn't block the response
      (async () => {
        try {
          // Fetch the item to get owner details
          let item: any;
          if (claimData.itemType === 'found') {
            item = await storage.getFoundItem(claimData.itemId);
          } else {
            item = await storage.getLostItem(claimData.itemId);
          }

          if (item) {
            await notificationService.notifyItemOwnerOfClaim(claim, item, userId); // Use userId from req.user
          }
        } catch (err) {
          console.error("Failed to send claim notification:", err);
        }
      })();

      res.status(201).json(claim);
    } catch (error) {
      console.error("Claim creation error:", error);
      return res.status(400).json({ 
        error: "Invalid claim data", 
        details: error instanceof Error ? error.message : String(error),
        zodError: (error as any)?.name === 'ZodError' ? (error as any).errors : undefined
      });
    }
  });

  // List Claims (RBAC Reinforced)
  app.get("/api/claims", requireAuth, async (req, res) => {
    const itemId = req.query.itemId as string;
    const userId = req.query.userId as string;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const user = req.user as any;
    const isAdmin = user.role === 'admin';

    // If itemId is provided, check if the user is the owner
    if (itemId && !isAdmin) {
      const foundItem = await storage.getFoundItem(itemId);
      const lostItem = await storage.getLostItem(itemId);
      const item = (foundItem || lostItem) as any;

      if (!item || (item.finderId !== user.id && item.seekerId !== user.id)) {
        return res.status(403).json({ error: "Forbidden: You can only view claims for your own items" });
      }
    } else if (!isAdmin) {
      // If no itemId provided and not admin, only show user's own claims
      const result = await storage.listClaims({ userId: user.id, status, page, limit });
      return res.json(result);
    }

    const result = await storage.listClaims({ itemId, userId, status, page, limit });
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

      // Notify the claimant of the status change
      (async () => {
        try {
          // Fetch the item to get details for the notification
          let item: any;
          if (updated.itemType === 'found') {
            item = await storage.getFoundItem(updated.itemId);
          } else {
            item = await storage.getLostItem(updated.itemId);
          }

          if (item) {
            await notificationService.notifyClaimantOfStatusChange(updated, item, status);
          }
        } catch (err) {
          console.error("Failed to send claim status notification:", err);
        }
      })();

      res.json(updated);
    } catch (e) {
      res.status(404).json({ error: "Claim not found" });
    }
  });

  // User Dashboard Routes
  app.get("/api/user/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const matches = await storage.getUserMatches((req.user as any).id);
      res.json(matches);
    } catch (error) {
      console.error("Fetch matches error:", error);
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  app.get("/api/user/activity", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const activity = await storage.getUserWeeklyActivity((req.user as any).id);
      res.json(activity);
    } catch (error) {
      console.error("Fetch activity error:", error);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { email, password } = req.body;
      const user = req.user as any;
      const updates: any = {};

      if (email) {
        updates.email = email;
      }

      if (password) {
        updates.password = await hashPassword(password);
      }

      const updatedUser = await storage.updateUserProfile(user.id, updates);
      res.json({ success: true, message: "Profile updated", user: sanitizeUser(updatedUser) });
    } catch (error: any) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: error.message || "Failed to update profile" });
    }
  });

  // Get Items (Unified Search)
  app.get("/api/items", async (req, res) => {
    try {
      const search = req.query.search as string;
      const category = req.query.category as string;
      const location = req.query.location as string;
      const type = req.query.type as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Optimized Search using Union and Scoring
      if (search) {
        const result = await storage.searchItems({
          query: search,
          type: (type as "found" | "lost" | "all") || 'all',
          category: category !== 'all' ? category : undefined,
          location,
          page,
          limit
        });

        const mappedItems = result.items.map((i: any) => {
          const isFound = (i as any).type === 'found';
          return {
            ...i,
            date: isFound ? (i as FoundItem).dateFound : (i as LostItem).dateLost,
            image: i.imageUrls?.[0]
          };
        });

        const sanitizedItems = await Promise.all(
          mappedItems.map((i: any) => sanitizeItem(i, (req as any).user))
        );
        return res.json(sanitizedItems);
      }

      let foundItems: any[] = [];
      let lostItems: any[] = [];

      // Fetch Found Items
      if (!type || type === 'found' || type === 'all') {
        const result = await storage.listFoundItems({
          search, // This won't be used if we enter the block above, but keeping for safety if no search term but filters exist
          category: category !== 'all' ? category : undefined,
          location,
          page,
          limit
        });
        foundItems = result.items.map((i: any) => ({
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
        lostItems = result.items.map((i: any) => ({
          ...i,
          type: "lost" as const,
          date: i.dateLost,
          image: i.imageUrls?.[0]
        }));
      }

      // Combine and Sort
      const allItems = [...foundItems, ...lostItems];
      allItems.sort((a, b) => {
         const dateA = a.date ? new Date(a.date).getTime() : 0;
         const dateB = b.date ? new Date(b.date).getTime() : 0;
         return dateB - dateA;
      });

      const sanitizedItems = await Promise.all(
        allItems.map(i => sanitizeItem(i, (req as any).user))
      );
      res.json(sanitizedItems);
    } catch (error) {
      console.error("Fetch items error:", error);
      res.status(500).json({ 
        error: "Failed to fetch items",
        details: error instanceof Error ? error.message : String(error)
      });
    }
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
      const sanitized = await sanitizeItem({ ...foundItem, type: 'found', date: foundItem.dateFound, image: foundItem.imageUrls?.[0] }, user);
      return res.json(sanitized);
    }

    const lostItem = await storage.getLostItem(id);
    if (lostItem) {
      const sanitized = await sanitizeItem({ ...lostItem, type: 'lost', date: lostItem.dateLost, image: lostItem.imageUrls?.[0] }, user);
      return res.json(sanitized);
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

  // Edit Item (Admin) - Full Update
  app.put("/api/items/:id", requireAdmin, async (req, res) => {
    const id = req.params.id;
    const { type, id: _bodyId, ...updateData } = req.body;

    if (!id || !type) {
      return res.status(400).json({ error: "Missing required fields: id, type" });
    }

    if (!["found", "lost"].includes(type)) {
      return res.status(400).json({ error: "Invalid type. Must be 'found' or 'lost'" });
    }

    try {
      let updated;
      if (type === 'found') {
        updated = await storage.updateFoundItem(id, updateData);
      } else {
        updated = await storage.updateLostItem(id, updateData);
      }

      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Log Action
      if ((req as any).user) {
        await storage.createAuditLog({
          adminId: (req as any).user.id,
          action: `item_edited`,
          entityType: "item",
          entityId: id,
          details: { type, fields: Object.keys(updateData) },
        });
      }

      res.json(updated);
    } catch (error) {
      console.error("Update item error:", error);
      res.status(500).json({ error: "Failed to update item" });
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

  // Admin: List Items with Pagination
  app.get("/api/admin/items", requireAdmin, async (req, res) => {
    try {
      const type = req.query.type as string; // 'found' | 'lost' | 'all'
      const status = req.query.status as string;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      let foundItems: any[] = [];
      let lostItems: any[] = [];
      let totalFound = 0;
      let totalLost = 0;

      // Fetch Found Items
      if (!type || type === 'found' || type === 'all') {
        const result = await storage.listFoundItems({
          status,
          category: category !== 'all' ? category : undefined,
          search,
          page: type === 'found' ? page : 1, // Only paginate if single type
          limit: type === 'found' ? limit : 1000, // Get all if combining
          startDate,
          endDate
        });
        foundItems = result.items.map((i: any) => ({
          ...i,
          type: "found" as const,
          date: i.dateFound,
          image: i.imageUrls?.[0]
        }));
        totalFound = result.total;
      }

      // Fetch Lost Items
      if (!type || type === 'lost' || type === 'all') {
        const result = await storage.listLostItems({
          status,
          category: category !== 'all' ? category : undefined,
          search,
          page: type === 'lost' ? page : 1,
          limit: type === 'lost' ? limit : 1000,
          startDate,
          endDate
        });
        lostItems = result.items.map((i: any) => ({
          ...i,
          type: "lost" as const,
          date: i.dateLost,
          image: i.imageUrls?.[0]
        }));
        totalLost = result.total;
      }

      // Combine and Sort
      let allItems = [...foundItems, ...lostItems];
      allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination for combined results
      const total = totalFound + totalLost;
      if (!type || type === 'all') {
        const start = (page - 1) * limit;
        allItems = allItems.slice(start, start + limit);
      }

      res.json({
        items: allItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error("Admin items error:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  // Admin: Bulk Actions
  app.post("/api/admin/items/bulk", requireAdmin, async (req, res) => {
    try {
      const { items, action } = req.body; // items: { id: string, type: 'found' | 'lost' }[]

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "No items provided" });
      }

      const results = await Promise.all(items.map(async (item: { id: string, type: 'found' | 'lost' }) => {
        try {
          if (action === 'delete') {
            if (item.type === 'found') await storage.deleteFoundItem(item.id);
            else await storage.deleteLostItem(item.id);
            await storage.createAuditLog({
              adminId: (req.user as User).id,
              action: "item_deleted",
              entityType: item.type,
              entityId: item.id,
              details: { bulk: true }
            });
          } else if (action === 'verify' || action === 'reject') {
            const status = action === 'verify' ? 'active' : 'rejected';
            if (item.type === 'found') await storage.updateFoundItemStatus(item.id, status);
            else await storage.updateLostItemStatus(item.id, status);

            await storage.createAuditLog({
              adminId: (req.user as User).id,
              action: action === 'verify' ? "item_active" : "item_rejected",
              entityType: item.type,
              entityId: item.id,
              details: { status, bulk: true }
            });
          }
          return { id: item.id, success: true };
        } catch (err) {
          console.error(`Bulk action failed for item ${item.id}:`, err);
          return { id: item.id, success: false };
        }
      }));

      res.json({ success: true, results });
    } catch (error) {
      console.error("Bulk action error:", error);
      res.status(500).json({ error: "Failed to process bulk actions" });
    }
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
      const adminId = req.query.adminId as string;
      const action = req.query.action as string;
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
      const limit = parseInt(req.query.limit as string) || 50;

      const logs = await storage.getLatestAuditLogs({ adminId, action, dateFrom, dateTo, limit });
      // Fetch admin usernames for the logs to display names instead of IDs
      const populatedLogs = await Promise.all(logs.map(async (log: any) => {
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
      const settingsObj = settings.reduce((acc: any, curr: any) => {
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
