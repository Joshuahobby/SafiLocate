import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
const dotenvResult = import('dotenv').then(d => d.config({ path: envPath }));

async function testUpload() {
    // Wait for dotenv
    const result = (await dotenvResult);

    // Import service AFTER env is loaded
    const { imageService } = await import("./server/services/image.service");

    const logs: string[] = [];
    const log = (...args: any[]) => {
        console.log(...args);
        logs.push(args.map(a => String(a)).join(' '));
    };

    log("Testing Cloudinary Integration...");
    if (result.error) {
        log("DOTENV ERROR:", result.error);
    } else {
        log("Dotenv parsed keys:", Object.keys(result.parsed || {}));
    }
    log("CLOUDINARY_URL present in process.env:", !!process.env.CLOUDINARY_URL);

    // Explicitly check env keys for debugging
    const cloudKeys = Object.keys(process.env).filter(k => k.includes('CLOUD'));
    log("Environment keys with 'CLOUD':", cloudKeys);

    if (process.env.CLOUDINARY_URL) {
        log("CLOUDINARY_URL length:", process.env.CLOUDINARY_URL.length);
        log("CLOUDINARY_URL start:", process.env.CLOUDINARY_URL.substring(0, 15) + "...");
    }

    // Tiny 1x1 pixel red dot base64
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    try {
        log("Attempting upload...");
        // Ensure image service is re-initialized or check how it reads env
        // Since it reads env at module load time, and we loaded dotenv at top, it should be fine.

        const url = await imageService.uploadImage(base64Image);
        log("Upload Result:", url);

        if (url.startsWith("http") && url.includes("cloudinary")) {
            log("SUCCESS: Image uploaded to Cloudinary!");
        } else {
            log("WARNING: Image returned as base64 or local path.");
        }
    } catch (error) {
        log("FAILURE: Upload error:", error);
    }

    fs.writeFileSync('test-result.log', logs.join('\n'));
}

testUpload();
