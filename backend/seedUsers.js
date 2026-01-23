// seedUsers.js - Script to populate database with test users
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const seedUsers = async () => {
    try {
        // Connect to MongoDB (support MONGODB_URI or legacy MONGO_URI)
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing users (optional - comment out if you want to keep existing users)
        await User.deleteMany({});
        console.log("🗑️  Cleared existing users");

        // Hash password function
        const hashPassword = async (password) => {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        };

        // Create test users
        const users = [
            // Admin User
            {
                name: "Admin User",
                phone: "+919999999999",
                password: await hashPassword("admin123"),
                role: "admin",
            },

            // Farmer Users
            {
                name: "Ramesh Kumar",
                phone: "+919876543210",
                password: await hashPassword("farmer123"),
                role: "farmer",
            },
            {
                name: "Suresh Patil",
                phone: "+919876543211",
                password: await hashPassword("farmer123"),
                role: "farmer",
            },
            {
                name: "Rajesh Singh",
                phone: "+919876543212",
                password: await hashPassword("farmer123"),
                role: "farmer",
            },

            // Trader Users
            {
                name: "Amit Traders",
                phone: "+919876543220",
                password: await hashPassword("trader123"),
                role: "trader",
            },
            {
                name: "Vijay Wholesale",
                phone: "+919876543221",
                password: await hashPassword("trader123"),
                role: "trader",
            },
            {
                name: "Prakash Trading Co",
                phone: "+919876543222",
                password: await hashPassword("trader123"),
                role: "trader",
            },

            // Transport Users
            {
                name: "Ram Transport Services",
                phone: "+919876543230",
                password: await hashPassword("transport123"),
                role: "transport",
            },
            {
                name: "Shyam Logistics",
                phone: "+919876543231",
                password: await hashPassword("transport123"),
                role: "transport",
            },
        ];

        // Insert users into database
        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users successfully!`);

        // Display login credentials
        console.log("\n📋 ============ LOGIN CREDENTIALS ============\n");

        console.log("🔐 ADMIN LOGIN:");
        console.log("   Phone: +919999999999");
        console.log("   Password: admin123\n");

        console.log("👨‍🌾 FARMER LOGINS:");
        console.log("   Phone: +919876543210 | Password: farmer123 (Ramesh Kumar)");
        console.log("   Phone: +919876543211 | Password: farmer123 (Suresh Patil)");
        console.log("   Phone: +919876543212 | Password: farmer123 (Rajesh Singh)\n");

        console.log("🏪 TRADER LOGINS:");
        console.log("   Phone: +919876543220 | Password: trader123 (Amit Traders)");
        console.log("   Phone: +919876543221 | Password: trader123 (Vijay Wholesale)");
        console.log("   Phone: +919876543222 | Password: trader123 (Prakash Trading Co)\n");

        console.log("🚚 TRANSPORT LOGINS:");
        console.log("   Phone: +919876543230 | Password: transport123 (Ram Transport Services)");
        console.log("   Phone: +919876543231 | Password: transport123 (Shyam Logistics)\n");

        console.log("============================================\n");

        // Disconnect
        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding users:", error);
        process.exit(1);
    }
};

// Run the seed function
seedUsers();
