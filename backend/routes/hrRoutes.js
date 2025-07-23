const express = require("express");
const bcrypt = require("bcryptjs");
const HR = require("../models/HR"); // Import HR Model
const mongoose = require("mongoose");
const Employee = require("../models/Employee"); // Import the Employee model
const Announcement = require('../models/Announcement');
// const Hiring=require("../models/Hiring");


const router = express.Router();
router.get('/hr/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.render('announcements', { announcements });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Register HR
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (role !== "HR") {
    return res.status(403).json({ error: "Only HR can be registered here" });
  }

  try {
    const existingHR = await HR.findOne({ email });
    if (existingHR) {
      return res.status(400).json({ error: "HR already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newHR = new HR({ name, email, password: hashedPassword, role });

    await newHR.save();
    res.json({ message: "HR registered successfully" });
  } catch (err) {
    console.error("❌ HR Registration Failed:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// HR Login (Pass HR details in query parameters)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hr = await HR.findOne({ email });
    if (!hr) return res.status(400).json({ error: "HR not found" });

    const isMatch = await bcrypt.compare(password, hr.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // ✅ Redirect and send HR details in query parameters
    res.redirect(`/hr/dashboard?name=${encodeURIComponent(hr.name)}&email=${encodeURIComponent(hr.email)}`);

  } catch (err) {
    console.error("❌ HR Login Failed:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// HR Dashboard Route (Read query parameters)
router.get("/dashboard", (req, res) => {
  const { name, email } = req.query;

  res.render("hrDashboard", { hr: { name, email } });
});
// HR Logout (Redirect to login page)
router.get("/logout", (req, res) => {
  res.redirect("/login");  // ✅ Redirect to login page after logout
});

// Get All Employees
router.get("/employees", async (req, res) => {
  try {
    const employees = await mongoose.connection.db.collection("Employees").find().toArray();
    res.json(employees);
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Add Employee Route
router.post("/add-employee", async (req, res) => {
  const { name, email, role, department, salary, password } = req.body;

  try {
    const existingEmployee = await mongoose.connection.db.collection("Employees").findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({ error: "Employee already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await mongoose.connection.db.collection("Employees").insertOne({
      name,
      email,
      role,
      department,
      salary,
      password: hashedPassword
    });

    res.json({ message: "Employee added successfully" });

  } catch (err) {
    console.error("❌ Employee Addition Failed:", err);
    res.status(500).json({ error: "Failed to add employee" });
  }
});
router.get('/announcements', async (req, res) => {
  try {
      // Fetch announcements from the database
      const announcements = await Announcement.find(); // Change this based on your DB query logic

      // Render the announcements.ejs page with the announcements data
      res.render('announcements', { announcements });
  } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).send('Error fetching announcements');
  }
});
router.get("/view-employee/:id", async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.params.id);
    const employee = await mongoose.connection.db.collection("Employees").findOne({ _id: employeeId });

    if (!employee) {
      return res.status(404).send("Employee not found");
    }

    res.send(`
      <html>
      <head>
          <title>Employee Details</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: Arial, sans-serif;
              }
              body {
                  background-color: #f4f4f4;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .dashboard-container {
                  width: 80%;
                  max-width: 600px;
                  background: white;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                  text-align: center;
              }
              .dashboard-header {
                  background:#34000b;
                  color: white;
                  padding: 15px;
                  border-radius: 10px 10px 0 0;
                  font-size: 22px;
                  font-weight: bold;
              }
              .dashboard-content {
                  padding: 20px;
              }
              .employee-card {
                  padding: 15px;
                  background: #f9f9f9;
                  border-radius: 5px;
                  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
              }
              p {
                  font-size: 18px;
                  margin: 10px 0;
              }
              .label {
                  font-weight: bold;
                  color: #34000b;
              }
              .dashboard-btn {
                  display: inline-block;
                  margin-top: 20px;
                  padding: 10px 15px;
                  background-color: #34000b;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  transition: background 0.3s;
                  font-size: 16px;
              }
              .dashboard-btn:hover {
                  background-color: #34000b;
              }
          </style>
      </head>
      <body>
          <div class="dashboard-container">
              <div class="dashboard-header">Employee Details</div>
              <div class="dashboard-content">
                  <div class="employee-card">
                      <p><span class="label">Name:</span> ${employee.name}</p>
                      <p><span class="label">Email:</span> ${employee.email}</p>
                      <p><span class="label">Role:</span> ${employee.role}</p>
                      <p><span class="label">Department:</span> ${employee.department}</p>
                      <p><span class="label">Salary:</span> ${employee.salary}</p>
                      <a href="/hr/dashboard" class="dashboard-btn">Back to Dashboard</a>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).send("Server error");
  }
});

// Update Employee Route
router.put("/edit-employee/:id", async (req, res) => {
  const { name, email, role, department, salary, password } = req.body;
  try {
    const employeeId = new mongoose.Types.ObjectId(req.params.id);
    const updateFields = { name, email, role, department, salary };

    // If a new password is provided, hash it before updating
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }
    const updatedEmployee = await mongoose.connection.db.collection("Employees").findOneAndUpdate(
      { _id: employeeId },
      { $set: { name, email, role, department, salary } },
      { returnDocument: "after" }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully", employee: updatedEmployee });

  } catch (err) {
    console.error("❌ Employee Update Failed:", err);
    res.status(500).json({ error: "Failed to update employee" });
  }
});
router.get('/apply-leave', (req, res) => {
  res.render('hr-apply-leave');
});
router.get('/hr-Dashboard', (req, res) => {
  res.render('hrDashboard');
});
router.post('/apply-leave', (req, res) => {
  const { employeeName, leaveType, fromDate, toDate, reason } = req.body;

  // You can store this in a database. For now, just log it:
  console.log('Leave Request:', { employeeName, leaveType, fromDate, toDate, reason });

  res.send("Leave request submitted successfully!");
});
router.get('/task-calendar', (req, res) => {
  res.render('hr-task-calendar');
});
router.get('/hiring', (req, res) => {
  const employees = [
    { applicationNo: 'APP001', name: 'Amit Sharma', role: 'Software Engineer', email: 'amit@gmail.com', phone: '9041935078' },
    { applicationNo: 'APP002', name: 'Priya Singh', role: 'QA Analyst', email: 'priya_9@gmail.com', phone: '9876259083' },
    { applicationNo: 'APP003', name: 'Ravi Mehta', role: 'UI/UX Designer', email: 'ravi569@gmail.com', phone: '9432121703' },
    { applicationNo: 'APP004', name: 'Neha Verma', role: 'Marketing Executive', email: 'nehaverma09@gmail.com', phone: '9876543213' },
    { applicationNo: 'APP005', name: 'Rohan Kapoor', role: 'Software Engineer', email: 'rohan_kpr@gmail.com', phone: '9654071890' },
    { applicationNo: 'APP006', name: 'Anjali Nair', role: 'Customer Support Executive', email: 'anjali_30@gmail.com', phone: '9215380837' },
    { applicationNo: 'APP007', name: 'Sumit Yadav', role: 'Data Scientist', email: 'sumit01@gmail.com', phone: '9876543216' },
    { applicationNo: 'APP008', name: 'Swati Chauhan', role: 'QA Analyst', email: 'swati_chauhan@gmail.com', phone: '9181511588' },
    { applicationNo: 'APP009', name: 'Karan Thakur', role: 'Marketing Executive', email: 'karan12@gmail.com', phone: '9501324876' },
    { applicationNo: 'APP010', name: 'Deepika Joshi', role: 'Software Engineer', email: 'deepika0@gmail.com', phone: '9290130567' }
  ];

  res.render('hr-hiring', { employees });
});
// const seedData = [
//   { applicationNo: 'APP001', name: 'Amit Sharma', role: 'Software Engineer', email: 'amit@gmail.com', phone: '9041935078' },
//   { applicationNo: 'APP002', name: 'Priya Singh', role: 'QA Analyst', email: 'priya_9@gmail.com', phone: '9876259083' },
//   { applicationNo: 'APP003', name: 'Ravi Mehta', role: 'UI/UX Designer', email: 'ravi569@gmail.com', phone: '9432121703' },
//   { applicationNo: 'APP004', name: 'Neha Verma', role: 'Marketing Executive', email: 'nehaverma09@gmail.com', phone: '9876543213' },
//   { applicationNo: 'APP005', name: 'Rohan Kapoor', role: 'Software Engineer', email: 'rohan_kpr@gmail.com', phone: '9654071890' },
//   { applicationNo: 'APP006', name: 'Anjali Nair', role: 'Customer Support Executive', email: 'anjali_30@gmail.com', phone: '9215380837' },
//   { applicationNo: 'APP007', name: 'Sumit Yadav', role: 'Data Scientist', email: 'sumit01@gmail.com', phone: '9876543216' },
//   { applicationNo: 'APP008', name: 'Swati Chauhan', role: 'QA Analyst', email: 'swati_chauhan@gmail.com', phone: '9181511588' },
//   { applicationNo: 'APP009', name: 'Karan Thakur', role: 'Marketing Executive', email: 'karan12@gmail.com', phone: '9501324876' },
//   { applicationNo: 'APP010', name: 'Deepika Joshi', role: 'Software Engineer', email: 'deepika0@gmail.com', phone: '9290130567' }
// ];

// async function seedHiringData() {
//   try {
//     await mongoose.connect('mongodb://localhost:27017/EmployeeManage'); // Replace your-db-name with your actual DB name
//     console.log('MongoDB connected');

//     await Hiring.deleteMany({}); // Optional: clears existing hiring data
//     await Hiring.insertMany(seedData);

//     console.log('Seed data inserted successfully');
//     mongoose.connection.close();
//   } catch (err) {
//     console.error('Error seeding data:', err);
//   }
// }

// seedHiringData();

// router.get('/hiring', (req, res) => {
//   const employees = [
//     { applicationNo: 'APP001', name: 'Amit Sharma', role: 'Software Engineer', email: 'amit@gmail.com', phone: '9041935078' },
//     { applicationNo: 'APP002', name: 'Priya Singh', role: 'QA Analyst', email: 'priya_9@gmail.com', phone: '9876259083' },
//     { applicationNo: 'APP003', name: 'Ravi Mehta', role: 'UI/UX Designer', email: 'ravi569@gmail.com', phone: '9432121703' },
//     { applicationNo: 'APP004', name: 'Neha Verma', role: 'Marketing Executive', email: 'nehaverma09@gmail.com', phone: '9876543213' },
//     { applicationNo: 'APP005', name: 'Rohan Kapoor', role: 'Software Engineer', email: 'rohan_kpr@gmail.com', phone: '9654071890' },
//     { applicationNo: 'APP006', name: 'Anjali Nair', role: 'Customer Support Executive', email: 'anjali_30@gmail.com', phone: '9215380837' },
//     { applicationNo: 'APP007', name: 'Sumit Yadav', role: 'Data Scientist', email: 'sumit01@gmail.com', phone: '9876543216' },
//     { applicationNo: 'APP008', name: 'Swati Chauhan', role: 'QA Analyst', email: 'swati_chauhan@gmail.com', phone: '9181511588' },
//     { applicationNo: 'APP009', name: 'Karan Thakur', role: 'Marketing Executive', email: 'karan12@gmail.com', phone: '9501324876' },
//     { applicationNo: 'APP010', name: 'Deepika Joshi', role: 'Software Engineer', email: 'deepika0@gmail.com', phone: '9290130567' }
//   ];

//   res.render('hr-hiring', { employees });
// });

router.get('/view-profile', (req, res) => {
  const { app } = req.query;
  
  // Here the employees array is defined inside the route handler
  const employees = [
    { applicationNo: 'APP001', name: 'Amit Sharma', role: 'Software Engineer', email: 'amit@gmail.com', phone: '9041935078' },
    { applicationNo: 'APP002', name: 'Priya Singh', role: 'QA Analyst', email: 'priya_9@gmail.com', phone: '9876259083' },
    { applicationNo: 'APP003', name: 'Ravi Mehta', role: 'UI/UX Designer', email: 'ravi569@gmail.com', phone: '9432121703' },
    { applicationNo: 'APP004', name: 'Neha Verma', role: 'Marketing Executive', email: 'nehaverma09@gmail.com', phone: '9876543213' },
    { applicationNo: 'APP005', name: 'Rohan Kapoor', role: 'Software Engineer', email: 'rohan_kpr@gmail.com', phone: '9654071890' },
    { applicationNo: 'APP006', name: 'Anjali Nair', role: 'Customer Support Executive', email: 'anjali_30@gmail.com', phone: '9215380837' },
    { applicationNo: 'APP007', name: 'Sumit Yadav', role: 'Data Scientist', email: 'sumit01@gmail.com', phone: '9876543216' },
    { applicationNo: 'APP008', name: 'Swati Chauhan', role: 'QA Analyst', email: 'swati_chauhan@gmail.com', phone: '9181511588' },
    { applicationNo: 'APP009', name: 'Karan Thakur', role: 'Marketing Executive', email: 'karan12@gmail.com', phone: '9501324876' },
    { applicationNo: 'APP010', name: 'Deepika Joshi', role: 'Software Engineer', email: 'deepika0@gmail.com', phone: '9290130567' }
  ];

  const employee = employees.find(emp => emp.applicationNo === app);
  
  res.render('hr-view-profile', { employee });
});
const Task = require('../models/hrtaskModel'); // New model
// // Route to add a new task
// router.post('/add-task', async (req, res) => {
//   try {
//     const { date, manager, description } = req.body;

//     // Basic validation
//     if (!date || !manager || !description) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     const task = new Task({ date, manager, description, completed: false });
//     await task.save();

//     res.status(200).json({ message: 'Task added successfully', task });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add task' });
//   }
// });

// // Route to fetch all tasks
// router.get('/tasks', async (req, res) => {
//   try {
//     const tasks = await Task.find().sort({ date: 1 }); // Optional sorting by date
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch tasks' });
//   }
// });

// // Route to mark a task as completed
// router.post('/complete-task', async (req, res) => {
//   try {
//     const { taskId } = req.body;

//     if (!taskId) {
//       return res.status(400).json({ error: 'Task ID is required' });
//     }

//     const task = await Task.findById(taskId);

//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }

//     task.completed = true;
//     await task.save();

//     res.status(200).json({ message: 'Task marked as completed' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update task' });
//   }
// });
// Add Task
router.post('/add-task', async (req, res) => {
  try {
    const { date, manager, description } = req.body;
    if (!date || !manager || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const task = new Task({ date, manager, description, completed: false });
    await task.save();
    res.status(200).json({ message: 'Task added successfully', task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ date: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Mark task completed
router.post('/complete-task', async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ error: 'Task ID is required' });
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.completed = true;
    await task.save();
    res.status(200).json({ message: 'Task marked as completed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});
module.exports = router;