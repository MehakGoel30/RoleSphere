const mongoose = require("mongoose");

const ManagerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
}, { collection: "Manager" }); // Store in "managers" collection

module.exports = mongoose.model("Manager", ManagerSchema);

