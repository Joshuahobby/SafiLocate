import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Claims Integration", () => {
    const timestamp = Date.now();
    const finderUser = {
        username: `finder_${timestamp}`,
        password: "StrongPass1!_" + timestamp,
        email: `finder_${timestamp}@example.com`,
        phone: "0780000001"
    };
    const itemOwnerUser = {
        username: `owner_${timestamp}`,
        password: "StrongPass1!_" + timestamp,
        email: `owner_${timestamp}@example.com`,
        phone: "0780000002"
    };

    let finderCookie: string;
    let ownerCookie: string;
    let itemId: string;

    it("should setup users", async () => {
        // Register item owner
        const ownerRes = await request(app).post("/api/register").send(itemOwnerUser);
        expect(ownerRes.status).toBe(201);
        // Login owner
        const loginOwnerRes = await request(app).post("/api/login").send({ username: itemOwnerUser.username, password: itemOwnerUser.password });
        ownerCookie = loginOwnerRes.headers["set-cookie"];

        // Register finder
        const finderRes = await request(app).post("/api/register").send(finderUser);
        expect(finderRes.status).toBe(201);
        // Login finder
        const loginFinderRes = await request(app).post("/api/login").send({ username: finderUser.username, password: finderUser.password });
        finderCookie = loginFinderRes.headers["set-cookie"];
    });

    it("should create a lost item as owner", async () => {
        const itemData = {
            title: `Lost Watch ${timestamp}`,
            description: "A gold watch lost near the park.",
            category: "electronics",
            location: "Central Park",
            dateLost: "2025-12-01",
            contactName: "Owner",
            contactPhone: "0780000002"
        };

        const res = await request(app)
            .post("/api/lost-items")
            .set("Cookie", ownerCookie)
            .send(itemData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id");
        itemId = res.body.id;
    });

    it("should submit a claim as finder", async () => {
        const claimData = {
            itemId: itemId,
            itemType: "lost",
            claimantName: "Finder User",
            claimantPhone: "0780000001",
            description: "I found this watch. It has a scratch on the back. (Minimum 50 chars required.......)"
        };

        const res = await request(app)
            .post("/api/claims")
            .set("Cookie", finderCookie)
            .send(claimData);

        expect(res.status).toBe(201);
        expect(res.body.itemId).toBe(itemId);
    });

    // Note: Testing verification requires Admin role, which is harder to seed dynamically in test environment without direct DB access or pre-seeded admin.
    // We skip admin verification test in this suite to keep it simple, but we tested user claim flow.
});
