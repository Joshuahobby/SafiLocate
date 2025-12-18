import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

async function main() {
    const username = "admin";
    const password = "password123";

    // Check if exists
    const existing = await storage.getUserByUsername(username);
    if (existing) {
        console.log(`User '${username}' already exists.`);
        process.exit(0);
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
        username,
        password: hashedPassword,
        role: "admin" // Assuming schema has role, or just generic user
    });

    console.log(`Created admin user: ${user.username} (ID: ${user.id})`);
    process.exit(0);
}

main().catch(console.error);
