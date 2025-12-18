import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if keys are present
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

export class ImageService {
    async uploadImage(base64Data: string): Promise<string> {
        if (!base64Data || typeof base64Data !== 'string') return base64Data;

        // Return existing URLs immediately
        if (base64Data.startsWith('http') || base64Data.startsWith('/')) return base64Data;

        // --- CLOUDINARY UPLOAD ---
        if (isCloudinaryConfigured) {
            try {
                // Cloudinary accepts base64 data URIs directly
                const result = await cloudinary.uploader.upload(base64Data, {
                    folder: 'safilocate',
                    resource_type: 'image'
                });
                return result.secure_url;
            } catch (error) {
                console.error("Cloudinary upload failed:", error);
                // Fallback to local? Or throw? Using fallback for robustness
                console.log("Falling back to local storage...");
            }
        }

        // --- LOCAL FALLBACK ---
        // Check for base64 prefix
        const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return base64Data;
        }

        const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${crypto.randomUUID()}.${extension}`;
        const filePath = path.join(UPLOAD_DIR, filename);

        await fs.promises.writeFile(filePath, buffer);
        return `/uploads/${filename}`;
    }

    async uploadImages(images?: string[] | null): Promise<string[] | undefined> {
        if (!images || !Array.isArray(images)) return undefined;

        const uploaded = await Promise.all(
            images.map(img => this.uploadImage(img))
        );
        return uploaded;
    }
}

export const imageService = new ImageService();
