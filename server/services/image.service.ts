import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if keys are present
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET));

if (!process.env.CLOUDINARY_URL && process.env.CLOUDINARY_CLOUD_NAME) {
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

        // --- PREPARE IMAGE BUFFER ---
        const base64Content = base64Data.includes('base64,')
            ? base64Data.split('base64,')[1]
            : base64Data;
        let imageBuffer = Buffer.from(base64Content, 'base64');

        // --- OPTIMIZATION (sharp) ---
        try {
            const optimized = await sharp(imageBuffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
            imageBuffer = Buffer.from(optimized);
        } catch (err) {
            console.error("Sharp optimization failed:", err);
            // Continue with original buffer if sharp fails
        }

        // --- CLOUDINARY UPLOAD ---
        if (isCloudinaryConfigured) {
            try {
                // Cloudinary accepts buffers
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'safilocate',
                            resource_type: 'image',
                            format: 'webp'
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(imageBuffer);
                });
                return (result as any).secure_url;
            } catch (error) {
                console.error("Cloudinary upload failed:", error);
                console.log("Falling back to local storage...");
            }
        }

        // --- LOCAL FALLBACK ---
        const filename = `${crypto.randomUUID()}.webp`;
        const filePath = path.join(UPLOAD_DIR, filename);

        await fs.promises.writeFile(filePath, imageBuffer);
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
