import { Router } from "express";
import { imageService } from "../services/image.service";

const router = Router();

// Endpoint: POST /api/upload
// Accepts JSON: { image: "base64String" }
router.post("/", async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: "No image data provided" });
        }

        const imageUrl = await imageService.uploadImage(image);
        res.json({ url: imageUrl });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload image" });
    }
});

export const uploadRoutes = router;
