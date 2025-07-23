const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const HR = require("../models/HR");
const Manager = require("../models/Manager");
const Employee = require("../models/Employee");

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

// Handle User Registration (for all roles)
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  
  const UserModel = getUserModel(role);
  if (!UserModel) return res.status(400).json({ error: "Invalid role" });

  try {
    let user = await UserModel.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new UserModel({ name, email, password: hashedPassword });

    await user.save();
    res.json({ message: `${role} registered successfully` });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Handle User Login (for all roles)
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  const UserModel = getUserModel(role);
  if (!UserModel) return res.status(400).json({ error: "Invalid role" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (role === "Admin") {
      req.session.admin = { id: user._id, name: user.name, email: user.email };
  } else {
      req.session.user = { id: user._id, name: user.name, email: user.email, role: role };
  }
  
  // ✅ Force session save before redirecting
  req.session.save(() => {
      if (role === "Admin") return res.redirect("/api/admin/dashboard");
      if (role === "HR") return res.redirect("/api/hr/dashboard");
      if (role === "Manager") return res.redirect("/api/manager/dashboard");
      if (role === "Employee") return res.redirect("/api/employee/dashboard");
      
      res.status(400).json({ error: "Invalid role" });
  });
  

    // Redirect based on role
    if (role === "Admin") return res.redirect("/admin/dashboard");
    if (role === "HR") return res.redirect("/hr/dashboard");
    if (role === "Manager") return res.redirect("/manager/dashboard");
    if (role === "Employee") return res.redirect("/employee/dashboard");

    res.redirect("/dashboard"); // Default fallback
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
