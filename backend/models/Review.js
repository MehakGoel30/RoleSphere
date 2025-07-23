// models/Review.js
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewText: { type: String, required: true },
  rating: { type: Number, required: true }, // 1–5 scale or any range you use
  tasksCompleted: { type: Number, required: true },
}, { collection: "Reviews" });

module.exports = mongoose.model("Review", ReviewSchema);
