const mongoose = require('mongoose');

const hrtaskSchema = new mongoose.Schema({
  date: String,
  manager: String,
  description: String,
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Hrtask', hrtaskSchema);