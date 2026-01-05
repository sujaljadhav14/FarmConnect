import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    // Support both MONGODB_URI and legacy MONGO_URI env names
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error("MONGO_URI or MONGODB_URI environment variable is not set");
    }

    console.log("📡 Connecting to MongoDB:", uri);
    
    const conn = await mongoose.connect(uri);
    
    console.log(`✅ Successfully connected to MongoDB at ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default dbConnect;
