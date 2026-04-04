import mongoose from "mongoose";
import logger from "../logger.js";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || !String(uri).trim()) {
    const msg = "MONGODB_URI is not set. Add it to the project root .env file.";
    logger.error(`[MongoDB] ${msg}`);
    throw new Error(msg);
  }
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(uri);
    logger.info("MongoDB connected");
    logger.info(`[MongoDB] host=${conn.connection.host} name=${conn.connection.name}`);
  } catch (err) {
    const reason = err?.message || String(err);
    logger.error(`[MongoDB] connection failed: ${reason}`);
    if (err?.cause) logger.error(`[MongoDB] cause: ${err.cause}`);
    throw err;
  }
};

export default connectDB;
