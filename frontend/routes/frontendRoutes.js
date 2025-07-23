const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../../backend/models/Admin");
const HR = require("../../backend/models/HR");
const Manager = require("../../backend/models/Manager");
const Employee = require("../../backend/models/Employee");

const adminRoutes = require("./admin");

const router = express.Router();

// Function to get the correct model based on role
const getUserModel = (role) => {
  switch (role) {
    case "Admin": return Admin;
    case "HR": return HR;
    case "Manager": return Manager;
    case "Employee": return Employee;
    default: return null;
  }
};

// Homepage
router.get("/", (req, res) => {
  res.render("index");
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Register Page
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// Dashboard (Protected Route)
router.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  // Redirect based on role
  switch (req.session.user.role) {
    case "Admin": return res.redirect("/admin/dashboard");
    case "HR": return res.redirect("/hr/dashboard");
    case "Manager": return res.redirect("/manager/dashboard");
    case "Employee": return res.redirect("/employee/dashboard");
    default: return res.redirect("/dashboard");
  }
});

// Handle User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const UserModel = getUserModel(role);
  if (!UserModel) return res.status(400).json({ error: "Invalid role" });

  try {
    let user = await UserModel.findOne({ email });
    if (user) return res.render("register", { error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new UserModel({ name, email, password: hashedPassword, role });

    await user.save();
    res.redirect("/login");
  } catch (err) {
    res.render("register", { error: "Error registering user" });
  }
});

// Handle User Login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  const UserModel = getUserModel(role);
  if (!UserModel) return res.status(400).json({ error: "Invalid role" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.render("login", { error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render("login", { error: "Invalid credentials" });

    req.session.user = user;

    // Redirect based on role
    switch (role) {
      case "Admin": return res.redirect("/admin/dashboard");
      case "HR": return res.redirect("/hr/dashboard");
      case "Manager": return res.redirect("/manager/dashboard");
      case "Employee": return res.redirect(`/employee/dashboard?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
      default: return res.redirect("/dashboard");
    }
  } catch (err) {
    res.render("login", { error: "Error logging in" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Role-based Login Page
router.get("/login/:role", (req, res) => {
  const { role } = req.params;
  if (!["Admin", "HR", "Manager", "Employee"].includes(role)) return res.redirect("/login");
  res.render("role-login", { role, error: null });
});

// Role-based Register Page
router.get("/register/:role", (req, res) => {
  const { role } = req.params;
  if (!["Admin", "HR", "Manager", "Employee"].includes(role)) return res.redirect("/register");
  res.render("role-register", { role, error: null });
});

// Use admin routes
router.use("/admin", adminRoutes);

module.exports = router;
