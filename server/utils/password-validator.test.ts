import { describe, it, expect } from "vitest";
import { validatePassword } from "./password-validator";

describe("Password Validator", () => {
    it("should validate a correct password", () => {
        const result = validatePassword("StrongP@ssw0rd");
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("should fail if password is too short", () => {
        const result = validatePassword("Short1!");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Password must be at least 8 characters long");
    });

    it("should fail if uppercase is missing", () => {
        const result = validatePassword("lowercase1@");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Password must contain at least one uppercase letter");
    });

    it("should fail if lowercase is missing", () => {
        const result = validatePassword("UPPERCASE1@");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Password must contain at least one lowercase letter");
    });

    it("should fail if number is missing", () => {
        const result = validatePassword("NoNumber@");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Password must contain at least one number");
    });

    it("should fail if special character is missing", () => {
        const result = validatePassword("NoSpecial1");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Password must contain at least one special character (!@#$%^&*...)");
    });

    it("should return all errors for a very weak password", () => {
        const result = validatePassword("weak");
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
        expect(result.errors).toContain("Password must be at least 8 characters long");
        expect(result.errors).toContain("Password must contain at least one uppercase letter");
        // "weak" has lowercase, so that check should pass
        expect(result.errors).toContain("Password must contain at least one number");
        expect(result.errors).toContain("Password must contain at least one special character (!@#$%^&*...)");
    });
});
