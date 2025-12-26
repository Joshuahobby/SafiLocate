import "dotenv/config";
import { afterAll, vi } from "vitest";

// Mock console.log to keep test output clean, but allow error
// Mock console.log to keep test output clean, but allow error
// global.console.log = vi.fn();
global.console.warn = vi.fn();

afterAll(() => {
    vi.restoreAllMocks();
});
