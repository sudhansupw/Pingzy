import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // console.log("MONGODB_URI from env =", process.env.MONGODB_URI);

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("Mongo Db connected successfully", conn.connection.host);
  } catch (error) {
    console.log("MongoDb connection error:", error.message);
    process.exit(1);
  }
};
