import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app, initPromise } from "../../server/index";
import { pool } from "../../server/db";
import { storage } from "../../server/storage";

describe("Search Integration", () => {
    const timestamp = Date.now();

    beforeAll(async () => {
        try {
            await initPromise;
            console.log("Server initialized for tests.");

            // Check if session table exists
            try {
                await pool.query("SELECT count(*) FROM session");
                console.log("Session table exists and is accessible.");
            } catch (dbErr) {
                console.log(`Session table check failed: ${dbErr}`);
            }

            // Create a unique item for search
            const res = await request(app).post("/api/found-items").send({
                category: "electronics",
                title: `UniqueKeyword${timestamp} Item`,
                description: `This item contains a secret code: SECRET_CODE_${timestamp}`,
                location: "Lab",
                dateFound: "2025-12-25",
                imageUrls: [],
                contactName: "Tester",
                contactPhone: "0789999999",
                finderEmail: "tester@example.com",
                finderPhone: "0780000000"
            });

            console.log(`Seeding status: ${res.status}`);
            if (res.status < 400) {
                const createdItem = res.body;
                await storage.updateFoundItemStatus(createdItem.id, 'active');
                console.log(`Item ${createdItem.id} activated for search.`);

                const all = await storage.listFoundItems({ status: 'active' });
                console.log("ACTIVE FOUND ITEMS IN DB:", JSON.stringify(all.items.map(i => ({ id: i.id, title: i.title, status: i.status }))));
            } else {
                console.log(`Seeding failed body: ${JSON.stringify(res.body)}`);
            }
            // Allow some time for potential async operations (though DB write should be awaited)
        } catch (error) {
            console.log(`Error in beforeAll: ${error}`);
            throw error;
        }
    });

    it("should find item by unique title keyword", async () => {
        const res = await request(app).get(`/api/items?search=UniqueKeyword${timestamp}`);
        console.log(`Search Title Status: ${res.status}`);
        console.log(`Search Title Body: ${JSON.stringify(res.body)}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].title).toContain(`UniqueKeyword${timestamp}`);
    }, 15000);

    it("should find item by content keyword", async () => {
        const res = await request(app).get(`/api/items?search=SECRET_CODE_${timestamp}`);
        console.log(`Search Content Status: ${res.status}`);
        console.log(`Search Content Body: ${JSON.stringify(res.body)}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    }, 15000);

    it("should returns empty list for non-matching nonsense", async () => {
        const res = await request(app).get(`/api/items?search=NonExistentGibberish${timestamp}`);
        console.log(`Search Nonsense Status: ${res.status}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    }, 15000);

    it("should rank title matches higher than description matches", async () => {
        const keyword = `RankTest${timestamp}`;

        // Item 1: Keyword in description
        const res1 = await request(app).post("/api/found-items").send({
            category: "electronics",
            title: "Common Item",
            description: `This is a description with ${keyword}`,
            location: "Lab",
            dateFound: "2025-12-25",
            imageUrls: [],
            contactName: "Tester",
            contactPhone: "0789999991",
            finderEmail: "tester1@example.com",
            finderPhone: "0780000001"
        });
        if (res1.status === 201 || res1.status === 200) {
            await storage.updateFoundItemStatus(res1.body.id, 'active');
        }

        // Item 2: Keyword in title
        const res2 = await request(app).post("/api/found-items").send({
            category: "electronics",
            title: `Item with ${keyword}`,
            description: "Common description",
            location: "Lab",
            dateFound: "2025-12-25",
            imageUrls: [],
            contactName: "Tester",
            contactPhone: "0789999992",
            finderEmail: "tester2@example.com",
            finderPhone: "0780000002"
        });
        if (res2.status === 201 || res2.status === 200) {
            await storage.updateFoundItemStatus(res2.body.id, 'active');
        }

        const res = await request(app).get(`/api/items?search=${keyword}`);
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        // The one with keyword in title should be first
        expect(res.body[0].title).toContain(keyword);
    }, 15000);
});
