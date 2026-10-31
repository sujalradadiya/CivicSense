require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1/civicsence";

async function runMigration() {
  console.log("===============================================================");
  console.log(" CIVICSENSE DATABASE MIGRATION: REMOVING 'MANAGER' ROLE");
  console.log("===============================================================\n");
  console.log("Connecting to MongoDB:", MONGO_URI);

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully to MongoDB.\n");

    const users = await UserModel.find({});
    console.log(`Inspecting ${users.length} total user accounts in database...\n`);

    const report = {
      totalAccounts: users.length,
      unchangedUsers: 0,
      unchangedAdmins: 0,
      migratedManagers: [],
      migratedMissingRoles: [],
    };

    for (const user of users) {
      if (user.role === "ADMIN") {
        report.unchangedAdmins++;
      } else if (user.role === "USER") {
        report.unchangedUsers++;
      } else if (user.role === "MANAGER") {
        // Safe migration: Demote to USER to prevent unauthorized administrative escalation.
        // Preserve all existing fields, passwords, and information.
        // Require explicit Administrator invitation if admin privileges are needed.
        user.role = "USER";
        await UserModel.updateOne(
          { _id: user._id },
          {
            $set: {
              role: "USER",
              previousRole: "MANAGER",
              migratedAt: new Date(),
              migrationNote:
                "Safely migrated from deprecated MANAGER role to USER. Explicit Administrator invitation required to grant ADMIN status.",
            },
          }
        );
        report.migratedManagers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          previousRole: "MANAGER",
          newRole: "USER",
          isActive: user.isActive,
        });
      } else {
        // Missing, null, or invalid role -> default to USER
        const oldRole = user.role || "NONE";
        await UserModel.updateOne(
          { _id: user._id },
          {
            $set: {
              role: "USER",
              migratedAt: new Date(),
            },
          }
        );
        report.migratedMissingRoles.push({
          id: user._id,
          name: user.name,
          email: user.email,
          previousRole: oldRole,
          newRole: "USER",
        });
      }
    }

    // Display Migration Report
    console.log("---------------------------------------------------------------");
    console.log(" MIGRATION REPORT SUMMARY");
    console.log("---------------------------------------------------------------");
    console.log(`Total Accounts Examined:         ${report.totalAccounts}`);
    console.log(`Existing USER accounts (kept):   ${report.unchangedUsers}`);
    console.log(`Existing ADMIN accounts (kept):  ${report.unchangedAdmins}`);
    console.log(`MANAGER accounts migrated to USER: ${report.migratedManagers.length}`);
    console.log(`Missing/Invalid roles to USER:   ${report.migratedMissingRoles.length}`);
    console.log("---------------------------------------------------------------\n");

    if (report.migratedManagers.length > 0) {
      console.log("AFFECTED MANAGER ACCOUNTS (Safely migrated to USER):");
      report.migratedManagers.forEach((m, idx) => {
        console.log(
          `  ${idx + 1}. [${m.email}] - Name: "${m.name}" | Status: ${
            m.isActive ? "Active" : "Deactivated"
          } | Now: USER`
        );
      });
      console.log("\nNOTE: In accordance with security protocol, former MANAGER accounts");
      console.log("were NOT automatically converted to ADMIN. To elevate any of these");
      console.log("accounts, an authorized Administrator must send an official invitation.\n");
    }

    if (report.migratedMissingRoles.length > 0) {
      console.log("ACCOUNTS WITH MISSING/INVALID ROLES (Assigned USER):");
      report.migratedMissingRoles.forEach((u, idx) => {
        console.log(`  ${idx + 1}. [${u.email}] (was: ${u.previousRole}) -> USER`);
      });
      console.log("");
    }

    // Final verification of DB state
    const allUsersNow = await UserModel.find({}, "name email role isActive");
    console.log("ALL ACCOUNTS CURRENT ROLE STATUS IN MONGODB:");
    allUsersNow.forEach((u) => {
      console.log(` - ${u.email.padEnd(38)} | Role: ${u.role.padEnd(6)} | Active: ${u.isActive}`);
    });

    console.log("\n===============================================================");
    console.log(" MIGRATION COMPLETED SUCCESSFULLY. ONLY 'USER' & 'ADMIN' EXIST.");
    console.log("===============================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed with error:", error);
    process.exit(1);
  }
}

runMigration();
