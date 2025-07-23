const express = require("express");
const bcrypt = require("bcryptjs");
const { addEmployeeToTeam } = require("../controllers/managerController");
const Manager = require("../models/Manager"); 
const mongoose = require("mongoose");
const Employee = require("../models/Employee"); 
const Task = require("../models/Task"); 
const EmployeeLeave = require("../models/EmployeeLeave");
const WorkReport = require("../models/WorkReport");
const Review = require("../models/Review");

const router = express.Router();

// Register Manager
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (role !== "Manager") {
    return res
      .status(403)
      .json({ error: "Only Managers can be registered here" });
  }

  try {
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(400).json({ error: "Manager already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newManager = new Manager({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newManager.save();
    res.json({ message: "Manager registered successfully" });
  } catch (err) {
    console.error("❌ Manager Registration Failed:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});
// Manager Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const manager = await Manager.findOne({ email });
    if (!manager) return res.status(400).json({ error: "Manager not found" });

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.redirect(
      `/manager/dashboard?name=${encodeURIComponent(
        manager.name
      )}&email=${encodeURIComponent(manager.email)}`
    );
  } catch (err) {
    console.error("❌ Manager Login Failed:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const { name, email } = req.query;
    const employees = await Employee.find({});
    for (let employee of employees) {
      employee.tasks = await Task.find({ employeeId: employee._id });
    }
    res.render("managerDashboard", {
      manager: { name, email },
      employees,
    });
  } catch (error) {
    console.error("Error fetching employees and tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to update task status
router.post("/updateTaskStatus", async (req, res) => {
  const { taskId, status } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.status = status;
    await task.save();

    res.json({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("❌ Error updating task status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Manager Logout
router.get("/logout", (req, res) => {
  res.redirect("/login"); 
});

router.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/addEmployee", async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.json({ message: "Employee added successfully!" });
  } catch (error) {
    console.error("❌ Error adding employee:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/assignTask", async (req, res) => {
  const { employeeId, title, description, deadline } = req.body;

  if (!employeeId || !title || !description || !deadline) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newTask = new Task({
      employeeId,
      title,
      description,
      deadline: new Date(deadline),
    });

    await newTask.save();
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(201).json({
      message: "Task assigned successfully",
      employeeName: employee.name, 
      task: {
        title,
        description,
        deadline: new Date(deadline).toLocaleString(),
        status: "Pending",
      },
    });
  } catch (err) {
    console.error("❌ Error assigning task:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.put('/tasks/:taskId/status', async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.status = status;
    await task.save();

    res.json({ message: "Task status updated", task });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to submit a performance review for an employee
router.post("/submitReview", async (req, res) => {
  const { employeeId, reviewText, rating, tasksCompleted } = req.body;

  if (!employeeId || !reviewText || rating === undefined || tasksCompleted === undefined) {
    return res.status(400).json({
      error: "Employee ID, review text, rating, and tasksCompleted are required",
    });
  }

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const newReview = new Review({
      employeeId,
      reviewText,
      rating,
      tasksCompleted,
    });

    await newReview.save();

    res.json({
      message: "Performance review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/allReviews", async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 }); // Newest first
    
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching all reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.put("/updateReview/:reviewId", async (req, res) => {
  const { reviewId } = req.params;
  const { tasksCompleted, averageRating, remarks } = req.body;

  if (tasksCompleted === undefined || averageRating === undefined || remarks === undefined) {
    return res.status(400).json({ error: "All review fields are required" });
  }

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { tasksCompleted, averageRating, remarks },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Get all leave requests
router.get("/getLeaveRequests", async (req, res) => {
  try {
    const leaves = await EmployeeLeave.find({}).sort({ createdAt: -1 }).lean();
    const leavesWithNames = await Promise.all(
      leaves.map(async (leave) => {
        if (leave.employeeId) {
          const employee = await Employee.findById(leave.employeeId)
            .select("name email")
            .lean();
          return {
            ...leave,
            employeeName: employee?.name || null,
            employeeEmail: employee?.email || null,
          };
        }
        return leave;
      })
    );

    res.json({ success: true, leaves: leavesWithNames });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch leave requests" });
  }
});

// Update leave status
router.post("/updateLeaveStatus", async (req, res) => {
  try {
    const { leaveId, status } = req.body;

    const updatedLeave = await EmployeeLeave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }

    res.json({ success: true, leave: updatedLeave });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update leave status" });
  }
});


// Get all work reports
router.get("/workReports", async (req, res) => {
  try {
    const reports = await WorkReport.find().sort({ submittedAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    console.error("Error fetching work reports:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch work reports" });
  }
});

// Update report status
router.post("/updateReportStatus", async (req, res) => {
  const { reportId, status, managerComment } = req.body;

  try {
    const report = await WorkReport.findByIdAndUpdate(
      reportId,
      { status, managerComment },
      { new: true }
    );

    if (!report) {
      return res
        .status(404)
        .json({ success: false, error: "Report not found" });
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error("Error updating report status:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to update report status" });
  }
});

module.exports = router;
