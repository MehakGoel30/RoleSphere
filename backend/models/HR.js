const mongoose = require("mongoose");

const HRSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
}, { collection: "HR" }); // Store in "hr" collection

module.exports = mongoose.model("HR", HRSchema);
