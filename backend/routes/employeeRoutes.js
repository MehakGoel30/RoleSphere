const express = require("express"); //handle http request
const bcrypt = require("bcryptjs"); //password hashing
const Employee = require("../models/Employee");  //define the structure or the fields jism data humne store krna h in mongodb
const EmployeeLeave = require("../models/EmployeeLeave");
const WorkReport = require("../models/WorkReport");
const Todo = require("../models/ToDo");
const Attendance = require("../models/Attendance"); 
const moment = require("moment"); //popular library used for working with date and times

const router = express.Router();

// Register Employee
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (role !== "Employee") {
    return res
      .status(403)
      .json({ error: "Only Employees can be registered here" });
  }

  try {
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ error: "Employee already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newEmployee.save();
    res.json({ message: "Employee registered successfully" });
  } catch (err) {
    console.error("❌ Employee Registration Failed:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Employee Login 
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const employee = await Employee.findOne({ email });

    if (!employee) return res.status(400).json({ error: "Employee not found" });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    //Redirecting Employee
    res.redirect(
      `/employee/dashboard?name=${encodeURIComponent(
        employee.name
      )}&email=${encodeURIComponent(employee.email)}`
    );
  } catch (err) {
    console.error("❌ Employee Login Failed:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get Employee Profile
router.post("/getProfile", async (req, res) => {
  const { email } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    res.json({
      success: true,
      profile: {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        department: employee.department,
      },
    });
  } catch (err) {
    console.error("❌ Failed to fetch profile:", err);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

// Update Employee Profile
router.post("/updateProfile", async (req, res) => {
  const { email, name, phone, address, department } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    employee.name = name || employee.name;
    employee.phone = phone || employee.phone;
    employee.address = address || employee.address;
    employee.department = department || employee.department;

    await employee.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        department: employee.department,
      },
    });
  } catch (err) {
    console.error("❌ Profile update failed:", err);
    res.status(500).json({ success: false, error: "Profile update failed" });
  }
});

// Apply Leave Route 
router.post("/applyLeave", async (req, res) => {
  const { startDate, endDate, email, reason } = req.body;
  const newLeave = new EmployeeLeave({
    startDate,
    endDate,
    email,
    reason,
    status: "Pending", 
  });

  await newLeave.save();
  const leaveHistory = await EmployeeLeave.find({ email });
  res.json({
    success: true,
    leaveHistory,
  });
});

// Get Leave History
router.post("/getLeaves", async (req, res) => {
  const { email } = req.body;

  const leaves = await EmployeeLeave.find({ email });

  res.json({
    success: true,
    leaves,
  });
});

// Employee Dashboard 
router.get("/dashboard", (req, res) => {
  const { name, email } = req.query;
  res.render("employee-dashboard", { employee: { name, email } });
});

// Employee Logout 
router.get("/logout", (req, res) => {
  res.redirect("/login"); 
});

// Submit Work Report
router.post("/submitWorkReport", async (req, res) => {
  const {
    employeeId,
    startDate,
    endDate,
    totalHours,
    reportName,
    description,
  } = req.body;

  try {
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        error: "End date cannot be before start date",
      });
    }
    const newReport = new WorkReport({
      employeeEmail: employeeId,
      startDate,
      endDate,
      totalHours,
      reportName,
      description,
    });

    await newReport.save();

    res.json({
      success: true,
      message: "Work report submitted successfully",
      report: newReport,
    });
  } catch (err) {
    console.error("❌ Work Report Submission Failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to submit work report",
    });
  }
});

// Get Work Reports
router.post("/getWorkReports", async (req, res) => {
  const { email } = req.body;

  try {
    const reports = await WorkReport.find({ employeeEmail: email }).sort({
      submittedAt: -1,
    });

    res.json({
      success: true,
      reports,
    });
  } catch (err) {
    console.error("❌ Failed to fetch work reports:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch work reports",
    });
  }
});

//Get Todo
router.post("/getTodos", async (req, res) => {
  const { email } = req.body;

  try {
    const todos = await Todo.find({ employeeEmail: email }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      todos,
    });
  } catch (err) {
    console.error("❌ Failed to fetch todos:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch todos",
    });
  }
});

// Add Todo
router.post("/addTodo", async (req, res) => {
  const { email, text } = req.body;

  try {
    const newTodo = new Todo({
      employeeEmail: email,
      text,
    });

    await newTodo.save();

    res.json({
      success: true,
      message: "Todo added successfully",
      todo: newTodo,
    });
  } catch (err) {
    console.error("❌ Todo addition failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to add todo",
    });
  }
});

// Toggle Todo
router.post("/toggleTodo", async (req, res) => {
  const { id } = req.body;

  try {
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: "Todo not found",
      });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({
      success: true,
      message: "Todo updated successfully",
      todo,
    });
  } catch (err) {
    console.error("❌ Todo toggle failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to toggle todo",
    });
  }
});

// Delete Todo
router.post("/deleteTodo", async (req, res) => {
  const { id } = req.body;

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({
        success: false,
        error: "Todo not found",
      });
    }

    res.json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (err) {
    console.error("❌ Todo deletion failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete todo",
    });
  }
});

// Get Employee Attendance
router.post("/getAttendance", async (req, res) => {
    const { email } = req.body;
    
    try {
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

        const currentMonth = moment().format("YYYY-MM");
        const attendance = await Attendance.findOne({ 
            employeeId: employee._id,
            month: currentMonth 
        });

        let presentDays = 0;
        let absentDays = 0;
        
        if (attendance && attendance.records) {
            attendance.records.forEach(record => {
                if (record.status === 'present') presentDays++;
                if (record.status === 'absent') absentDays++;
            });
        }

        res.json({
            success: true,
            attendance: attendance || { records: [] },
            summary: {
                present: presentDays,
                absent: absentDays,
                total: presentDays + absentDays
            }
        });
    } catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ success: false, error: "Failed to fetch attendance" });
    }
});
module.exports = router;
