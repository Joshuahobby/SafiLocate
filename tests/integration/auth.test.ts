import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Auth Endpoints", () => {
    const timestamp = Date.now();
    const testUser = {
        username: `testuser_${timestamp}`,
        password: "StrongPass1!_" + timestamp,
        email: `test_${timestamp}@example.com`,
        phone: "0781234567"
    };

    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/api/register")
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.username).toBe(testUser.username);
        expect(res.body).not.toHaveProperty("password"); // Should not return password
    });

    it("should fail to register overlapping username", async () => {
        const res = await request(app)
            .post("/api/register")
            .send(testUser);

        expect(res.status).toBe(400); // Username exists
    });

    it("should login successfully with valid credentials", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                username: testUser.username,
                password: testUser.password
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id");
        expect(res.headers["set-cookie"]).toBeDefined(); // Should set session cookie
    });

    it("should reject login with invalid password", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                username: testUser.username,
                password: "WrongPassword1!"
            });

        expect(res.status).toBe(401);
    });

    it("should reject login for non-existent user", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                username: "nonexistent_user_12345",
                password: "AnyPassword1!"
            });

        expect(res.status).toBe(401);
    });
});
