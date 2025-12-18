import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      sparse: true, // optional; only required if using phone login
      trim: true,
    },
    password: {
      type: String,
      required: true, // hashed password
    },
    role: {
      type: String,
      enum: ["farmer", "trader", "transport", "admin"],
      default: "farmer",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
