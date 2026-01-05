import mongoose from "mongoose";

const dbConnect = async () => {
  // Support both MONGODB_URI and legacy MONGO_URI env names
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const conn = await mongoose.connect(uri);
  console.log(`Successfully connected to ${conn.connection.host}`);
};
export default dbConnect;
