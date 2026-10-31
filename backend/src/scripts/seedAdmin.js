require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1/civicsence";

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // Read credentials from environment variables with safe defaults
    const adminEmail = (
      process.env.ADMIN_EMAIL || "admin@civicsence.com"
    ).toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@Civic2026";
    const adminName = process.env.ADMIN_NAME || "System Administrator";
    const adminContact = process.env.ADMIN_CONTACT || "9999999999";
    const adminCity = process.env.ADMIN_CITY || "Ahmedabad";

    // Check if an ADMIN already exists
    const existingAdmin = await UserModel.findOne({
      $or: [{ role: "ADMIN" }, { email: adminEmail }],
    });

    if (existingAdmin) {
      console.log(
        `[SEED WARNING] Administrator account already exists: ${existingAdmin.email} (Role: ${existingAdmin.role}).`
      );
      console.log("Duplicate creation prevented. Exiting cleanly.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);

    const newAdmin = await UserModel.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      contact: adminContact,
      city: adminCity,
      role: "ADMIN",
      isActive: true,
    });

    console.log("=================================================");
    console.log(" Initial Administrator Account Created Successfully ");
    console.log("=================================================");
    console.log(` - Name:    ${newAdmin.name}`);
    console.log(` - Email:   ${newAdmin.email}`);
    console.log(` - Role:    ${newAdmin.role}`);
    console.log(` - Status:  ${newAdmin.isActive ? "ACTIVE" : "INACTIVE"}`);
    console.log("=================================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed initial admin:", error.message);
    process.exit(1);
  }
}

seedAdmin();
