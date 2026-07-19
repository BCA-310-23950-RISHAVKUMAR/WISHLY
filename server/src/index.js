import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import env from "./config/env.js";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

// MongoDB Connection with Retry Logic
const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("Mongo Error ❌", err);
    setTimeout(connectDB, 5000); // Retry after 5s
  }
};
connectDB();

// Trust proxy for Render/Vercel
app.set("trust proxy", 1);

// CORS configuration - allow localhost in development
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [env.clientUrl];
    const isLocalhostOrigin = origin && /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?)(\/.*)?$/.test(origin);

    if (!origin || allowedOrigins.includes(origin) || (env.nodeEnv === "development" && isLocalhostOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to be served if static
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined")); // better logging for production
}

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes); // Fixed duplicate route mounting

// Uploads (Fallback for local dev, but should use Cloudinary in prod)
app.use("/uploads", express.static(uploadsDir));

// Serve Frontend in Production
if (env.nodeEnv === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ message: "Wishly API is running" });
  });
}

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${env.port} is already in use. Please stop the process using that port or change PORT in server/.env.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
