const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    role: { type: String, enum: ["Admin"], required: true },
  },
  { collection: "Admin" } // Ensure only Admins are stored here
);

module.exports = mongoose.model("Admin", AdminSchema);
