// models/Attendance.js
const mongoose = require('mongoose');

const dailyStatusSchema = new mongoose.Schema({
  date: String, // e.g., "2025-05-08"
  status: { type: String, enum: ['present', 'absent'] }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  month: String, // e.g., "2025-05"
  records: [dailyStatusSchema]
});

module.exports = mongoose.model('Attendance', attendanceSchema);
// const mongoose = require('mongoose');

// const attendanceSchema = new mongoose.Schema({
//   employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
//   status: { type: String, enum: ['present', 'absent'], required: true },
//   date: { type: String, required: true } // e.g., "2025-05-08"
// });

// module.exports = mongoose.model('Attendance', attendanceSchema);
