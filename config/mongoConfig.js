import mongoose from "mongoose";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}`);
    console.log("Sucessfully connected to MongoDB Cluster :)");
  } catch (e) {
    console.error("Failed to connect do MongoDB Cluster: ", e);
    process.exit(1);
  }
};
