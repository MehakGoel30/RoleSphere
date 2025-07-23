const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const Admin = require("../models/Admin");
const HR = require("../models/HR");
const Manager = require("../models/Manager");
const Announcement = require('../../backend/models/Announcement');
const Attendance = require('../models/Attendance');
const router = express.Router();
const Employee = require('../models/Employee');
const moment = require('moment');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });
// ✅ Remove unnecessary authentication checks to prevent redirection loops
router.get("/add-hr", (req, res) => {
    res.render("add-hr", { error: null });
});
router.get("/announcements", async (req, res) => {
    try {
      const announcements = await Announcement.find().sort({ date: -1 });
      res.render("admin-announcements", { announcements, admin: req.session.user });
    } catch (err) {
      console.error("Error loading announcements:", err);
      res.render("admin-announcements", { announcements: [], admin: req.session.user });
    }
  });
  
  // Handle Adding New Announcement
  router.post("/announcements", upload.single("attachment"), async (req, res) => {
    try {
      const { title, message } = req.body;
      const attachmentUrl = req.file ? "/uploads/" + req.file.filename : null;
  
      const announcement = new Announcement({ title, message, attachmentUrl });
      await announcement.save();
  
      res.redirect("/api/admin/announcements");
 // Or wherever you want to redirect
    } catch (err) {
      res.status(500).send("Error adding announcement");
    }
  });
// ✅ Render Login Page
router.get("/login", (req, res) => {
    if (req.session.admin) {
        return res.redirect("/api/admin/dashboard");
    }
    res.render("login", { error: null });
});

// ✅ Handle Admin Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.render("login", { error: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.render("login", { error: "Invalid credentials" });

        req.session.admin = { id: admin._id, name: admin.name, email: admin.email };
        req.session.save(() => {
            res.redirect("/api/admin/dashboard");
        });
    } catch (err) {
        console.error("❌ Admin Login Failed:", err);
        res.render("login", { error: "Login failed" });
    }
});

// ✅ Render Admin Dashboard
router.get("/dashboard", (req, res) => {
    res.render("admin-dashboard", { admin: req.session.admin });
});

// ✅ Handle Admin Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/api/admin/login");
    });
});

// ✅ Handle HR Addition (Save to MongoDB)
router.post("/add-hr", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        console.log("🔍 HR Data Received:", req.body); // Debugging

        const existingHR = await HR.findOne({ email });
        if (existingHR) {
            return res.render("add-hr", { error: "HR with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newHR = new HR({ name, email, password: hashedPassword });
        await newHR.save();

        console.log("✅ HR Added Successfully!");
        res.redirect("/api/admin/hr-list"); // ✅ Redirect to HR List after adding
    } catch (err) {
        console.error("❌ Error adding HR:", err);
        res.render("add-hr", { error: "Error adding HR" });
    }
});

// ✅ Show All HRs
router.get("/hr-list", async (req, res) => {
    try {
        const hrList = await HR.find({});
        res.render("hr-list", { hrList });
    } catch (err) {
        console.error("❌ Error fetching HR list:", err);
        res.render("hr-list", { hrList: [] });
    }
});

// ✅ Show Edit HR Form
// ✅ Show Edit HR Form (Pre-fill Data)
router.get("/edit-hr/:id", async (req, res) => {
  try {
      const hr = await HR.findById(req.params.id);
      if (!hr) {
          return res.redirect("/api/admin/hr-list"); // If HR not found, redirect
      }
      res.render("edit-hr", { hr });
  } catch (err) {
      console.error("❌ Error finding HR:", err);
      res.redirect("/api/admin/hr-list");
  }
});

// ✅ Handle HR Update (Save Changes)
router.post("/edit-hr/:id", async (req, res) => {
  const { name, email } = req.body;
  try {
      await HR.findByIdAndUpdate(req.params.id, { name, email });
      res.redirect("/api/admin/hr-list"); // Redirect back to HR list
  } catch (err) {
      console.error("❌ Error updating HR:", err);
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
router.get("/add-manager", (req, res) => {
  res.render("add-manager", { error: null });
});

// ✅ Handle Adding Manager (Save to MongoDB)
router.post("/add-manager", async (req, res) => {
  const { name, email, password } = req.body;
  try {
      const existingManager = await Manager.findOne({ email });
      if (existingManager) {
          return res.render("add-manager", { error: "Manager with this email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newManager = new Manager({ name, email, password: hashedPassword });
      await newManager.save();

      res.redirect("/api/admin/manager-list");
  } catch (err) {
      console.error("❌ Error adding Manager:", err);
      res.render("add-manager", { error: "Error adding Manager" });
  }
});

// ✅ Show All Managers
router.get("/manager-list", async (req, res) => {
  try {
      const managerList = await Manager.find({});
      res.render("manager-list", { managerList });
  } catch (err) {
      console.error("❌ Error fetching Manager list:", err);
      res.render("manager-list", { managerList: [] });
  }
});

// ✅ Show Edit Manager Form
router.get("/edit-manager/:id", async (req, res) => {
  try {
      const manager = await Manager.findById(req.params.id);
      if (!manager) {
          return res.redirect("/api/admin/manager-list");
      }
      res.render("edit-manager", { manager });
  } catch (err) {
      console.error("❌ Error finding Manager:", err);
      res.redirect("/api/admin/manager-list");
  }
});

// ✅ Handle Manager Update
router.post("/edit-manager/:id", async (req, res) => {
  const { name, email } = req.body;
  try {
      await Manager.findByIdAndUpdate(req.params.id, { name, email });
      res.redirect("/api/admin/manager-list");
  } catch (err) {
      console.error("❌ Error updating Manager:", err);
      res.redirect("/api/admin/manager-list");
  }
});

// ✅ Delete Manager
router.get("/delete-manager/:id", async (req, res) => {
  try {
      await Manager.findByIdAndDelete(req.params.id);
      res.redirect("/api/admin/manager-list");
  } catch (err) {
      console.error("❌ Error deleting Manager:", err);
      res.redirect("/api/admin/manager-list");
  }
});
router.get('/mark-attendance', async (req, res) => {
    const employees = await Employee.find({});
    res.render('mark-attendance', { employees });
  });
// In your admin routes file (admin.js)

// Update the submit-attendance route
router.post('/submit-attendance', async (req, res) => {
    try {
        const attendanceData = req.body.attendance;
        const today = moment().format("YYYY-MM-DD");
        const currentMonth = moment().format("YYYY-MM");

        for (let empId in attendanceData) {
            const status = attendanceData[empId];
            
            // Find the employee to ensure they exist
            const employee = await Employee.findById(empId);
            if (!employee) {
                console.warn(`Employee with ID ${empId} not found`);
                continue;
            }

            const record = {
                date: today,
                status: status
            };

            // Find or create attendance record for this month
            let attendance = await Attendance.findOne({ 
                employeeId: empId, 
                month: currentMonth 
            });

            if (attendance) {
                // Check if today's record exists
                const existingRecordIndex = attendance.records.findIndex(r => r.date === today);
                
                if (existingRecordIndex >= 0) {
                    // Update existing record
                    attendance.records[existingRecordIndex].status = status;
                } else {
                    // Add new record
                    attendance.records.push(record);
                }
            } else {
                // Create new attendance document
                attendance = new Attendance({
                    employeeId: empId,
                    month: currentMonth,
                    records: [record]
                });
            }

            await attendance.save();
        }

        res.redirect('/api/admin/mark-attendance');
    } catch (err) {
        console.error("Error submitting attendance:", err);
        res.status(500).send("Error submitting attendance");
    }
});
module.exports = router;
