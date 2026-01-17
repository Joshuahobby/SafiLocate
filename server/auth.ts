import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage.js";
import { User } from "@shared/schema";
import { validatePassword } from "./utils/password-validator.js";

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

async function comparePassword(supplied: string, stored: string) {
    return await bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "safi-locate-secret-key",
        resave: false,
        saveUninitialized: false,
        store: storage.sessionStore,
        cookie: {
            secure: app.get("env") === "production",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        }
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                if (!user || !(await comparePassword(password, user.password))) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        }),
    );

    passport.serializeUser((user, done) => done(null, (user as User).id));
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", async (err: any, user: any, info: any) => {
            if (err) return next(err);

            if (!user) {
                // Log failed login attempt
                await storage.createAuditLog({
                    adminId: "system",
                    action: "login_failed",
                    entityType: "auth",
                    entityId: req.body.username || "unknown",
                    details: { ip: req.ip, userAgent: req.get("User-Agent") }
                });
                return res.status(401).json({ error: "Invalid credentials" });
            }

            req.login(user, async (loginErr) => {
                if (loginErr) return next(loginErr);

                // Log successful login
                await storage.createAuditLog({
                    adminId: user.id,
                    action: "login_success",
                    entityType: "auth",
                    entityId: user.id,
                    details: { ip: req.ip, userAgent: req.get("User-Agent") }
                });

                const { password: _, ...safeUser } = user;
                res.status(200).json(safeUser);
            });
        })(req, res, next);
    });

    // Public registration - ALWAYS creates a regular user
    app.post("/api/register", async (req, res, next) => {
        try {
            // Validate password strength
            const passwordValidation = validatePassword(req.body.password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: "Password does not meet requirements",
                    details: passwordValidation.errors
                });
            }

            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const hashedPassword = await hashPassword(req.body.password);
            // IMPORTANT: Force role to "user" - never allow public registration as admin
            const user = await storage.createUser({
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email || null,
                phone: req.body.phone || null,
                role: "user", // Always user for public registration
            });

            req.login(user, (err) => {
                if (err) return next(err);
                // Don't expose password in response
                const { password: _, ...safeUser } = user;
                res.status(201).json(safeUser);
            });
        } catch (err) {
            next(err);
        }
    });

    // Admin-only: Create admin/moderator accounts
    app.post("/api/admin/users", async (req, res, next) => {
        try {
            // Check if requester is authenticated and is an admin
            if (!req.isAuthenticated()) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const currentUser = req.user as User;
            if (currentUser.role !== "admin") {
                return res.status(403).json({ error: "Forbidden - Admin access required" });
            }

            const { username, password, email, phone, role } = req.body;

            // Validate role
            if (!["user", "admin", "moderator"].includes(role)) {
                return res.status(400).json({ error: "Invalid role" });
            }

            const existingUser = await storage.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: "Username already exists" });
            }

            const hashedPassword = await hashPassword(password);
            const user = await storage.createUser({
                username,
                password: hashedPassword,
                email: email || null,
                phone: phone || null,
                role,
            });

            const { password: _, ...safeUser } = user;
            res.status(201).json(safeUser);
        } catch (err) {
            next(err);
        }
    });

    // Admin: Update own profile (password/email)
    app.patch("/api/admin/profile", async (req, res, next) => {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const currentUser = req.user as User;
            const { currentPassword, newPassword, email } = req.body;

            // If changing password, verify current password and validate new password
            if (newPassword) {
                // Validate new password strength
                const passwordValidation = validatePassword(newPassword);
                if (!passwordValidation.isValid) {
                    return res.status(400).json({
                        error: "New password does not meet requirements",
                        details: passwordValidation.errors
                    });
                }

                if (!currentPassword) {
                    return res.status(400).json({ error: "Current password is required to change password" });
                }
                const user = await storage.getUser(currentUser.id);
                if (!user || !(await comparePassword(currentPassword, user.password))) {
                    return res.status(400).json({ error: "Current password is incorrect" });
                }
            }

            // Build update object
            const updates: any = {};
            if (newPassword) {
                updates.password = await hashPassword(newPassword);
            }
            if (email !== undefined) {
                updates.email = email || null;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: "No updates provided" });
            }

            // Update user in database
            const updated = await storage.updateUserProfile(currentUser.id, updates);
            if (!updated) {
                return res.status(404).json({ error: "User not found" });
            }

            const { password: _, ...safeUser } = updated;

            // Log profile update
            await storage.createAuditLog({
                adminId: currentUser.id,
                action: "profile_updated",
                entityType: "user",
                entityId: currentUser.id,
                details: { fields: Object.keys(updates).filter(k => k !== 'password') }
            });

            res.json(safeUser);
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        // Don't expose password
        const { password: _, ...safeUser } = req.user as User;
        res.json(safeUser);
    });
}
