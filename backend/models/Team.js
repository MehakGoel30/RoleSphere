const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound index to prevent duplicate team members
TeamSchema.index({ managerId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('Team', TeamSchema);