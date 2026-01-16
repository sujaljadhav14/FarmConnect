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
                creditScore: 500,
                totalRatings: 0,
                completedOrders: 0,
            },

            // Farmer Users
            {
                name: "Ramesh Kumar",
                phone: "+919876543210",
                password: await hashPassword("farmer123"),
                role: "farmer",
                rating: 4.5,
                creditScore: 250,
                totalRatings: 5,
                completedOrders: 8,
            },
            {
                name: "Suresh Patil",
                phone: "+919876543211",
                password: await hashPassword("farmer123"),
                role: "farmer",
                rating: 4.8,
                creditScore: 420,
                totalRatings: 12,
                completedOrders: 15,
            },
            {
                name: "Rajesh Singh",
                phone: "+919876543212",
                password: await hashPassword("farmer123"),
                role: "farmer",
                rating: 4.2,
                creditScore: 180,
                totalRatings: 3,
                completedOrders: 5,
            },

            // Trader Users
            {
                name: "Amit Traders",
                phone: "+919876543220",
                password: await hashPassword("trader123"),
                role: "trader",
                rating: 4.6,
                creditScore: 450,
                totalRatings: 18,
                completedOrders: 22,
            },
            {
                name: "Vijay Wholesale",
                phone: "+919876543221",
                password: await hashPassword("trader123"),
                role: "trader",
                rating: 4.9,
                creditScore: 850,
                totalRatings: 35,
                completedOrders: 47,
            },
            {
                name: "Prakash Trading Co",
                phone: "+919876543222",
                password: await hashPassword("trader123"),
                role: "trader",
                rating: 3.8,
                creditScore: 220,
                totalRatings: 8,
                completedOrders: 10,
            },

            // Transport Users
            {
                name: "Ram Transport Services",
                phone: "+919876543230",
                password: await hashPassword("transport123"),
                role: "transport",
                rating: 4.5,
                creditScore: 380,
                totalRatings: 25,
                completedOrders: 45,
            },
            {
                name: "Shyam Logistics",
                phone: "+919876543231",
                password: await hashPassword("transport123"),
                role: "transport",
                rating: 4.7,
                creditScore: 520,
                totalRatings: 30,
                completedOrders: 60,
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
