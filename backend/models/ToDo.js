const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  employeeEmail: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ToDo", TodoSchema);