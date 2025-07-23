const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const LeaveRequest = require("../models/LeaveRequest");

// Get overview stats
router.get("/stats", async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const presentToday = await Employee.countDocuments({ status: "Present" });
    const absentToday = await Employee.countDocuments({ status: "Absent" });
    const pendingApprovals = await LeaveRequest.countDocuments({ status: "Pending" });

    res.json({ totalEmployees, presentToday, absentToday, pendingApprovals });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
