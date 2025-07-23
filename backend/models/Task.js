const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, default: "Pending" }, // "Pending", "In Progress", "Completed"
}, { collection: "Tasks" });

module.exports = mongoose.model("Task", TaskSchema);