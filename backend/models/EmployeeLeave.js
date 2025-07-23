const mongoose = require("mongoose");

const employeeLeaveSchema = new mongoose.Schema({
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    email: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
  type: String,
  enum: ['Pending', 'Approved', 'Rejected'],
  default: 'Pending'
}
});

module.exports = mongoose.model("EmployeeLeave", employeeLeaveSchema);
