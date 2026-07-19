import mongoose from "mongoose";

const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
