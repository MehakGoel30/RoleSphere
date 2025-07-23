const Task = require("../models/Task");

// Add Task to Employee
const addTask = async (req, res) => {
  const { employeeId, title, description, deadline } = req.body;

  if (!employeeId || !title || !description || !deadline) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newTask = new Task({ employeeId, title, description, deadline });
    await newTask.save();
    res.status(201).json({ message: "Task assigned successfully" });
  } catch (error) {
    console.error("❌ Error assigning task:", error);
    res.status(500).json({ error: "Failed to assign task" });
  }
};

// Fetch tasks for an employee
const getEmployeeTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ employeeId: req.params.employeeId });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

module.exports = { addTask, getEmployeeTasks };