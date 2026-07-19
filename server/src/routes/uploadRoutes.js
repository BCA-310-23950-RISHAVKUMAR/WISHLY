import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { adminOnly, protect } from "../middleware/auth.js";
import env from "../config/env.js";

const router = express.Router();

// Cloudinary config
if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

// Local Storage Setup
fs.mkdirSync(uploadsDir, { recursive: true });

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
    cb(null, `wishly-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

// Determine storage based on environment
const useCloudinary = env.nodeEnv === "production" && !!env.cloudinaryCloudName;
const storage = useCloudinary ? multer.memoryStorage() : localStorage;

const fileFilter = (req, file, cb) => {
  if (file?.mimetype?.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post("/upload-image", protect, adminOnly, upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Image file is required");
  }

  try {
    if (useCloudinary) {
      // Cloudinary upload using base64 stream
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "wishly_uploads",
      });
      
      res.status(201).json({
        filename: result.public_id,
        url: result.secure_url
      });
    } else {
      // Local upload response
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      res.status(201).json({
        filename: req.file.filename,
        url: imageUrl
      });
    }
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

router.post("/save-pdf", async (req, res) => {
  const { pdfData, filename } = req.body;
  if (!pdfData || !filename) {
    return res.status(400).json({ message: "pdfData and filename are required" });
  }

  try {
    const cleanB64 = pdfData.substring(pdfData.indexOf("base64,") + 7);
    const buffer = Buffer.from(cleanB64, "base64");
    
    // 1. Save to project's static uploads directory (for serving)
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    // 2. Save copy directly to Windows system Downloads folder
    let savedToDownloads = false;
    let downloadsPath = "";
    try {
      const homeDir = os.homedir();
      downloadsPath = path.join(homeDir, "Downloads", filename);
      fs.writeFileSync(downloadsPath, buffer);
      savedToDownloads = true;
    } catch (e) {
      console.log("Could not write to user Downloads folder:", e);
    }

    // 3. Save copy to project workspace root so it appears in the editor sidebar!
    let savedToWorkspace = false;
    let workspacePath = "";
    try {
      const workspaceRoot = path.resolve(__dirname, "..", "..", "..");
      workspacePath = path.join(workspaceRoot, filename);
      fs.writeFileSync(workspacePath, buffer);
      savedToWorkspace = true;
    } catch (e) {
      console.log("Could not write to workspace root:", e);
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    // Auto-open from system Downloads or local path
    try {
      const openTarget = savedToDownloads ? downloadsPath : filePath;
      const { exec } = await import("child_process");
      exec(`start "" "${openTarget}"`);
    } catch (e) {
      console.log("Could not auto-open PDF", e);
    }

    res.status(201).json({
      message: "PDF saved successfully",
      url: fileUrl,
      filePath,
      downloadsPath,
      workspacePath,
      savedToDownloads,
      savedToWorkspace
    });
  } catch (error) {
    console.error("Save PDF Error:", error);
    res.status(500).json({ message: "Failed to save PDF on server" });
  }
});

router.post("/download-pdf", (req, res) => {
  const { pdfData, filename } = req.body;
  if (!pdfData || !filename) {
    return res.status(400).send("pdfData and filename are required");
  }

  try {
    const cleanB64 = pdfData.substring(pdfData.indexOf("base64,") + 7);
    const buffer = Buffer.from(cleanB64, "base64");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Download PDF Error:", error);
    res.status(500).send("Failed to generate PDF download");
  }
});

export default router;
