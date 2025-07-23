const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

// Import routes
const authRoutes = require("./backend/routes/authRoutes");
const adminRoutes = require("./backend/routes/adminRoutes");
const hrRoutes = require("./backend/routes/hrRoutes");
const employeeRoutes = require("./backend/routes/employeeRoutes");
const frontendRoutes = require("./frontend/routes/frontendRoutes");
const managerRoutes = require("./backend/routes/managerRoutes"); // Import Manager Routes

dotenv.config();

// Initialize Express App
const app = express();
app.use("/uploads", express.static("uploads")); // To serve uploaded files

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "frontend/views"));

// Serve static files
app.use(express.static(path.join(__dirname, "frontend/public")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Failed", err));

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/employee", employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use("/hr", hrRoutes);
app.use("/manager", managerRoutes); // ✅ Added manager routes
app.use("/", frontendRoutes);

// Profile Page Route (Requires Login)
app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if user is not logged in
  }
  res.render("profile", { user: req.session.user }); // Pass user details to EJS
});

// Update Profile Route
app.post("/profile/update", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  // Update session data with new profile information
  req.session.user.name = req.body.name || req.session.user.name;
  req.session.user.email = req.body.email || req.session.user.email;
  req.session.user.phone = req.body.phone || req.session.user.phone;
  req.session.user.address = req.body.address || req.session.user.address;
  
  res.redirect("/profile"); // Refresh profile with updated data
});

// User Registration or Login Route (Random User for demo)
app.post("/login", (req, res) => {
  const { name, email } = req.body;
  
  // For demo purposes, we are directly assigning a random name and email
  req.session.user = {
    name: name || "Random User", // If name is provided, use it; otherwise, default to "Random User"
    email: email || "random@example.com", // If email is provided, use it; otherwise, default to "random@example.com"
    phone: "Not Provided",
    address: "Not Provided"
  };
  
  res.redirect("/profile");
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
app.get("/manager/dashboard", (req, res) => {
  if (!req.session.manager) {
    return res.redirect("/manager/login");
  }
  res.render("managerDashboard", { manager: req.session.manager });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`)); 