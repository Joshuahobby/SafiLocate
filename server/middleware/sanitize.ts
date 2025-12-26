/**
 * Input Sanitization Middleware
 * Prevents XSS attacks by stripping HTML tags and dangerous characters from inputs.
 */

import { Request, Response, NextFunction } from "express";

// Simple HTML tag stripper (removes <script>, <iframe>, etc.)
function stripHtmlTags(str: string): string {
    if (typeof str !== "string") return str;
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "");
}

// Recursively sanitize object properties
function sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
        return stripHtmlTags(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    } else if (typeof obj === "object") {
        const sanitized: any = {};
        for (const key of Object.keys(obj)) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
    }

    return obj;
}

/**
 * Middleware to sanitize request body, query, and params.
 * Applies to all non-file fields.
 */
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction) {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === "object") {
        req.query = sanitizeObject(req.query);
    }

    if (req.params && typeof req.params === "object") {
        req.params = sanitizeObject(req.params);
    }

    next();
}
