import { describe, it, expect } from "vitest";
import request from "supertest";
import { app, initPromise } from "../../server/index";

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

    beforeAll(async () => {
        await initPromise;
    });

    it("should setup users", async () => {
        // Register item owner
        const ownerRes = await request(app).post("/api/register").send(itemOwnerUser);
        if (ownerRes.status !== 201) console.log("OWNER REGISTER ERROR:", JSON.stringify(ownerRes.body));
        expect(ownerRes.status).toBe(201);

        // Login owner
        const loginOwnerRes = await request(app).post("/api/login").send({ username: itemOwnerUser.username, password: itemOwnerUser.password });
        if (loginOwnerRes.status !== 200) console.log("OWNER LOGIN ERROR:", JSON.stringify(loginOwnerRes.body));
        ownerCookie = loginOwnerRes.headers["set-cookie"];

        // Register finder
        const finderRes = await request(app).post("/api/register").send(finderUser);
        if (finderRes.status !== 201) console.log("FINDER REGISTER ERROR:", JSON.stringify(finderRes.body));
        expect(finderRes.status).toBe(201);

        // Login finder
        const loginFinderRes = await request(app).post("/api/login").send({ username: finderUser.username, password: finderUser.password });
        if (loginFinderRes.status !== 200) console.log("FINDER LOGIN ERROR:", JSON.stringify(loginFinderRes.body));
        finderCookie = loginFinderRes.headers["set-cookie"];
    }, 30000);

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
        if (res.status !== 200) console.log("LOST ITEM CREATE ERROR:", JSON.stringify(res.body));
        expect(res.body).toHaveProperty("id");
        itemId = res.body.id;
    }, 15000);

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
        if (res.status !== 201) console.log("CLAIM CREATE ERROR:", JSON.stringify(res.body));
        expect(res.body.itemId).toBe(itemId);
    }, 15000);

    // Note: Testing verification requires Admin role, which is harder to seed dynamically in test environment without direct DB access or pre-seeded admin.
    // We skip admin verification test in this suite to keep it simple, but we tested user claim flow.
});
