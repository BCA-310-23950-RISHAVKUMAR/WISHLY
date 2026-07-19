import express from "express";
import {
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  createProductWithImage
} from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

// Ensure local uploads directory exists
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

router.get("/", getProducts);
router.post("/", protect, adminOnly, upload.single("image"), createProductWithImage);
router.get("/featured", getFeaturedProducts);
router.get("/:slug", getProductBySlug);

export default router;
