// debugLogin.js - Script to debug login issues
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const debugLogin = async () => {
    try {
        // Connect to MongoDB (support MONGODB_URI or legacy MONGO_URI)
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        // Get all users from database
        const users = await User.find({});
        console.log(`📊 Total users in database: ${users.length}\n`);

        if (users.length === 0) {
            console.log("❌ No users found in database!");
            console.log("🔧 Please run: npm run seed\n");
            await mongoose.disconnect();
            process.exit(1);
        }

        // Display all users
        console.log("📋 Users in database:\n");
        users.forEach((user, index) => {
            console.log(`${index + 1}. Name: ${user.name}`);
            console.log(`   Phone: ${user.phone}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
            console.log("");
        });

        // Test password comparison for admin user
        console.log("🧪 Testing password comparison for Admin user:\n");
        const adminUser = await User.findOne({ phone: "+919999999999" });

        if (!adminUser) {
            console.log("❌ Admin user not found!");
        } else {
            console.log(`✅ Found admin user: ${adminUser.name}`);
            console.log(`   Phone: ${adminUser.phone}`);

            // Test password comparison
            const testPassword = "admin123";
            const isMatch = await bcrypt.compare(testPassword, adminUser.password);

            console.log(`\n🔐 Testing password "${testPassword}"`);
            console.log(`   Result: ${isMatch ? "✅ MATCH" : "❌ NO MATCH"}`);

            if (!isMatch) {
                console.log("\n⚠️ Password doesn't match! This is the issue.");
                console.log("🔧 Re-run the seed script: npm run seed");
            } else {
                console.log("\n✅ Password matches! Login should work.");
            }
        }

        // Test a farmer user too
        console.log("\n🧪 Testing password comparison for Farmer user:\n");
        const farmerUser = await User.findOne({ phone: "+919876543210" });

        if (!farmerUser) {
            console.log("❌ Farmer user not found!");
        } else {
            console.log(`✅ Found farmer user: ${farmerUser.name}`);
            console.log(`   Phone: ${farmerUser.phone}`);

            const testPassword = "farmer123";
            const isMatch = await bcrypt.compare(testPassword, farmerUser.password);

            console.log(`\n🔐 Testing password "${testPassword}"`);
            console.log(`   Result: ${isMatch ? "✅ MATCH" : "❌ NO MATCH"}`);

            if (!isMatch) {
                console.log("\n⚠️ Password doesn't match! This is the issue.");
                console.log("🔧 Re-run the seed script: npm run seed");
            } else {
                console.log("\n✅ Password matches! Login should work.");
            }
        }

        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

debugLogin();
