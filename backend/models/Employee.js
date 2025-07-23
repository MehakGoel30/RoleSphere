const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, 
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" }, // Reference to Manager
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    department: { type: String, default: "" }
}, { collection: "Employees" });

module.exports = mongoose.model("Employee", EmployeeSchema);