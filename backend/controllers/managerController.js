const Manager = require("../models/Manager");
const Employee = require("../models/Employee");

// Assign Employee to Manager's Team
exports.addEmployeeToTeam = async (req, res) => {
  try {
    const { managerId, employeeId } = req.body;

    // Find the manager
    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Check if employee already exists in the team
    if (manager.employees.includes(employeeId)) {
      return res.status(400).json({ message: "Employee already in team" });
    }

    // Add the employee to the manager's team
    manager.employees.push(employeeId);
    await manager.save();

    res.status(200).json({ message: "Employee added to team", manager });
  } catch (err) {
    res.status(500).json({ message: "Error adding employee", error: err.message });
  }
};
