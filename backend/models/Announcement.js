const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  attachmentUrl: { type: String } // New field
});

module.exports = mongoose.model("Announcement", announcementSchema);
