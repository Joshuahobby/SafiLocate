import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Search Integration", () => {
    const timestamp = Date.now();

    beforeAll(async () => {
        // Create a unique item for search
        await request(app).post("/api/found-items").send({
            title: `UniqueKeyword${timestamp} Item`,
            description: `This item contains a secret code: SECRET_CODE_${timestamp}`,
            category: "electronics",
            location: "Lab",
            dateFound: "2025-12-25",
            contactName: "Tester",
            contactPhone: "0789999999"
        });
        // Allow some time for potential async operations (though DB write should be awaited)
    });

    it("should find item by unique title keyword", async () => {
        const res = await request(app).get(`/api/items?search=UniqueKeyword${timestamp}`);
        expect(res.status).toBe(200);
        expect(res.body.items.length).toBeGreaterThan(0);
        expect(res.body.items[0].title).toContain(`UniqueKeyword${timestamp}`);
    });

    it("should find item by content keyword", async () => {
        const res = await request(app).get(`/api/items?search=SECRET_CODE_${timestamp}`);
        expect(res.status).toBe(200);
        expect(res.body.items.length).toBeGreaterThan(0);
    });

    it("should returns empty list for non-matching nonsense", async () => {
        const res = await request(app).get(`/api/items?search=NonExistentGibberish${timestamp}`);
        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(0);
    });
});
