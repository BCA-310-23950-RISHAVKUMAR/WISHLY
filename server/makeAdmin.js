import mongoose from "mongoose";
import env from "./src/config/env.js";
import User from "./src/models/User.js";

const makeAllUsersAdmin = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB.");

    const result = await User.updateMany({}, { isAdmin: true });
    console.log(`Successfully updated ${result.modifiedCount} users to Admin.`);

    console.log("You can now log in with any existing account, and it will be an Admin account!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating users:", error);
    process.exit(1);
  }
};

makeAllUsersAdmin();
