// // const User = require("../models/User");
// const Admin = require("../models/Admin");
// const HR = require("../models/HR");
// const Manager = require("../models/Manager");
// const Employee = require("../models/Employee");

// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//     const { name, email, password, role } = req.body;
//     try {
//       let user = await User.findOne({ email });
//       if (user) return res.render("role-register", { role, error: "User already exists" });
  
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user = new User({ name, email, password: hashedPassword, role });
  
//       await user.save();
//       res.redirect("/login");
//     } catch (err) {
//       res.render("role-register", { role, error: "Error registering user" });
//     }
//   };
  
// exports.login = async (req, res) => {
//     const { email, password, role } = req.body;
//     try {
//       // Find user with matching role
//       const user = await User.findOne({ email, role });
//       if (!user) return res.render("role-login", { role, error: "Invalid credentials or role" });
  
//       // Verify password
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return res.render("role-login", { role, error: "Invalid credentials" });
  
//       // Generate JWT token
//       const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
//       // Save session
//       req.session.user = user;
  
//       // Redirect to respective dashboard
//       if (user.role === "Admin") {
//         return res.redirect("/admin-dashboard");
//       } else if (user.role === "HR") {
//         return res.redirect("/hr-dashboard");
//       } else {
//         return res.redirect("/employee-dashboard");
//       }
//     } catch (err) {
//       res.render("role-login", { role, error: "Error logging in" });
//     }
//   };
const Admin = require("../models/Admin");
const HR = require("../models/HR");
const Manager = require("../models/Manager");
const Employee = require("../models/Employee");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Function to get the correct model based on role
const getModelByRole = (role) => {
  switch (role) {
    case "Admin": return Admin;
    case "HR": return HR;
    case "Manager": return Manager;
    case "Employee": return Employee;
    default: return null;
  }
};

// REGISTER CONTROLLER
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    const Model = getModelByRole(role);
    if (!Model) return res.render("role-register", { role, error: "Invalid role selected" });

    let user = await Model.findOne({ email });
    if (user) return res.render("role-register", { role, error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new Model({ name, email, password: hashedPassword, role });

    await user.save();
    res.redirect("/login");
  } catch (err) {
    res.render("role-register", { role, error: "Error registering user" });
  }
};

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const Model = getModelByRole(role);
    if (!Model) return res.render("role-login", { role, error: "Invalid role selected" });

    const user = await Model.findOne({ email });
    if (!user) return res.render("role-login", { role, error: "Invalid credentials or role" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render("role-login", { role, error: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Save session
    req.session.user = user;

    // Redirect based on role
    switch (user.role) {
      case "Admin": return res.redirect("/admin-dashboard");
      case "HR": return res.redirect("/hr-dashboard");
      case "Manager": return res.redirect("/manager-dashboard");
      case "Employee": return res.redirect("/employee-dashboard");
      default: return res.redirect("/");
    }
  } catch (err) {
    res.render("role-login", { role, error: "Error logging in" });
  }
};
