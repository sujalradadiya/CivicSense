require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dbconnection = require("./src/utils/DBConnection");

// Initialize MongoDB connection
dbconnection();

// Core Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// NEW RBAC & ADMIN API ROUTES
// ==========================================
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

const adminRoutes = require("./src/routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// ==========================================
// EXISTING BACKWARD-COMPATIBLE CITIZEN ROUTES
// ==========================================
const UserRoutes = require("./src/routes/UserRoute");
app.use(UserRoutes);

const IssueRoutes = require("./src/routes/IssueRoute");
app.use(IssueRoutes);

const IssueTypeRoutes = require("./src/routes/IssueTypeRoute");
app.use(IssueTypeRoutes);

const StateRoutes = require("./src/routes/StateRoute");
app.use(StateRoutes);

const TransactionRoutes = require("./src/routes/TransationRoute");
app.use(TransactionRoutes);

const AuthorityRoutes = require("./src/routes/AuthorityRoute");
app.use(AuthorityRoutes);

// Root Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CivicSense Smart City Complaint Portal Backend API is running.",
    version: "2.0.0",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
