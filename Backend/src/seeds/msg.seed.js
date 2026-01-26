import mongoose from "mongoose";
import dotenv from "dotenv";
import { Message } from "../models/message.model.js";

dotenv.config();

const runMigration = async () => {
  try {
    // 1️⃣ CONNECT TO DB (THIS WAS MISSING)
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    // 2️⃣ RUN MIGRATION
    const result = await Message.updateMany(
      { messageType: { $exists: false } },
      { $set: { messageType: "dm" } }
    );

    console.log("✅ Migration complete:", result);

    // 3️⃣ CLOSE CONNECTION
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

runMigration();
