const express = require("express");
const router = express.Router();
const Employee = require('../../backend/models/Employee');
const Attendance = require('../../backend/models/Attendance');
router.use((req, res, next) => {
  if (!req.session.user || req.session.user.role !== "Admin") {
    return res.redirect("/login");
  }
  next();
});
router.get("/dashboard", async (req, res) => {
  try {
    const admin = req.session.admin || { name: "Admin" };

    // Fetch total number of employees
    const totalEmployees = await Employee.countDocuments({});

    // Get today's date in "YYYY-MM-DD" format
    const currentDate = new Date().toISOString().split('T')[0];

    // Aggregate attendance records for today
    const attendanceData = await Attendance.aggregate([
      { $unwind: "$records" }, // Deconstruct the records array
      {
        $match: {
          "records.date": currentDate // Filter only today's records
        }
      },
      {
        $group: {
          _id: "$records.status", // Group by "present" or "absent"
          count: { $sum: 1 } // Count how many of each
        }
      }
    ]);

    // Default counts
    let presentToday = 0;
    let absentToday = 0;

    attendanceData.forEach(item => {
      if (item._id === "present") presentToday = item.count;
      if (item._id === "absent") absentToday = item.count;
    });

    // Dummy pending approvals (update this as needed)
    const pendingApprovals = 0;

    // Render dashboard
    res.render("admin-dashboard", {
      admin,
      totalEmployees,
      presentToday,
      absentToday,
      pendingApprovals,
      message: null
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.render("admin-dashboard", {
      admin: req.session.admin || { name: "Admin" },
      totalEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      pendingApprovals: 0,
      message: "Error loading dashboard"
    });
  }
});

// Manage Users (Example Route)
router.get("/users", (req, res) => {
  // Fetch users from the database and pass to the view
  res.render("admin-users", { user: req.session.user });
});

// Logout for Admin
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
// ✅ Show Add HR Form
router.get("/add-hr", (req, res) => {
  res.render("add-hr");
});

// Handle User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.render("login", { error: "Invalid credentials" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.render("login", { error: "Invalid credentials" });
  
      req.session.user = user;
  
      console.log("Logged in user:", user); // Debugging
      console.log("User role:", user.role); // Debugging
  
      if (user.role === "Admin") {
        return res.redirect("/admin/dashboard");
      }
      res.redirect("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      res.render("login", { error: "Error logging in" });
    }
  });
  router.get("/add-hr", (req, res) => {
    res.render("add-hr");
});

// ✅ Handle HR Addition (Saves HR to MongoDB)
router.post("/add-hr", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newHR = new HR({ name, email, password: hashedPassword });
        await newHR.save();
        res.redirect("/api/admin/hr-list");
    } catch (err) {
        console.error("Error adding HR:", err);
        res.render("add-hr", { error: "Error adding HR" });
    }
});

// ✅ Show All HRs
router.get("/hr-list", async (req, res) => {
    try {
        const hrList = await HR.find({});
        res.render("hr-list", { hrList });
    } catch (err) {
        console.error("Error fetching HR list:", err);
        res.render("hr-list", { hrList: [] });
    }
});

// ✅ Show Edit HR Form
router.get("/edit-hr/:id", async (req, res) => {
    try {
        const hr = await HR.findById(req.params.id);
        res.render("edit-hr", { hr });
    } catch (err) {
        console.error("Error finding HR:", err);
        res.redirect("/api/admin/hr-list");
    }
});

// ✅ Handle HR Update
router.post("/edit-hr/:id", async (req, res) => {
    const { name, email } = req.body;
    try {
        await HR.findByIdAndUpdate(req.params.id, { name, email });
        res.redirect("/api/admin/hr-list");
    } catch (err) {
        console.error("Error updating HR:", err);
        res.redirect("/api/admin/hr-list");
    }
});

// ✅ Delete HR
router.get("/delete-hr/:id", async (req, res) => {
    try {
        await HR.findByIdAndDelete(req.params.id);
        res.redirect("/api/admin/hr-list");
    } catch (err) {
        console.error("Error deleting HR:", err);
        res.redirect("/api/admin/hr-list");
    }
});
module.exports = router;
