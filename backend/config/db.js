import mongoose from "mongoose";

const dbConnect = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`Successfully connected to ${conn.connection.host}`);
};
export default dbConnect;
