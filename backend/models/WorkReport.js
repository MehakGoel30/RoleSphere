// models/WorkReport.js
const mongoose = require('mongoose');

const WorkReportSchema = new mongoose.Schema({
  employeeEmail: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalHours: { type: Number, required: true },
  reportName: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  managerComment: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkReport', WorkReportSchema);