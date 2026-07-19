import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import seedProducts from "../data/seedProducts.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wishly";

const runSeed = async () => {
  try {
    await connectDB(mongoUri);
    await Product.deleteMany({});

    await Product.insertMany(seedProducts);

    const adminEmail = "rishavkumar181815@gmail.com";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: "Wishly Admin",
        email: adminEmail,
        password: "Rishav@15",
        isAdmin: true
      });
    }

    console.log("Seed completed successfully");
    console.log("Admin login: rishavkumar181815@gmail.com / Rishav@15");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

runSeed();
