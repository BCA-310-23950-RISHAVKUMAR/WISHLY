import dotenv from "dotenv";

dotenv.config();

if (process.env.NODE_ENV === "production") {
  const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      process.exit(1);
    }
  }
}

const env = {
  port: Number(process.env.PORT) || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wishly",
  jwtSecret: process.env.JWT_SECRET || "wishly-demo-secret",
  clientUrl:
    process.env.CLIENT_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : "https://wishly-frontend.onrender.com"),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  enableLivePayments: process.env.ENABLE_LIVE_PAYMENTS === "true" || process.env.ENABLE_LIVE_PAYMENTS === "1",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || ""
};

export default env;
